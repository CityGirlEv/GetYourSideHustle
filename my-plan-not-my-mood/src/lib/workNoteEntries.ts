/**
 * Timestamped, author-attributed notes for Tasks + QA tests.
 * Stored as a JSON array in task.notes / test.desc.
 * Older plain-text notes become a read-only prior entry.
 */

export type WorkNoteEntry = {
  id: string;
  author: string;
  authorEmail?: string;
  createdAt: string;
  updatedAt: string;
  text: string;
};

export const PRIOR_NOTE_AUTHOR = 'Prior note';
export const LEGACY_NOTE_AUTHOR = 'Legacy';
export const LEGACY_EPOCH = '1970-01-01T00:00:00.000Z';

function newNoteId(): string {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function authorsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = String(a ?? '').trim().toLowerCase();
  const right = String(b ?? '').trim().toLowerCase();
  if (!left || !right) return false;
  if (left === right) return true;
  // First-name match for staff display names (Evelyn Irving ≡ Evelyn).
  const first = (raw: string) => raw.split(/\s+/)[0] || '';
  return first(left) === first(right) && first(left) !== '';
}

export function emailsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase() && Boolean(String(a ?? '').trim());
}

export function isPriorNoteEntry(entry: WorkNoteEntry): boolean {
  return (
    entry.id === 'legacy' ||
    authorsMatch(entry.author, PRIOR_NOTE_AUTHOR) ||
    authorsMatch(entry.author, LEGACY_NOTE_AUTHOR)
  );
}

export type WorkNoteActor = {
  name: string;
  email?: string | null;
  isSuperAdmin?: boolean;
};

/** Super Admin may change any note; everyone else only their own (by email or name). */
export function canModifyWorkNote(entry: WorkNoteEntry, actor: WorkNoteActor | null | undefined): boolean {
  if (!actor?.name?.trim()) return false;
  if (actor.isSuperAdmin) return true;
  if (isPriorNoteEntry(entry)) return false;
  if (entry.authorEmail && actor.email && emailsMatch(entry.authorEmail, actor.email)) return true;
  return authorsMatch(entry.author, actor.name);
}

function isNoteEntry(value: unknown): value is WorkNoteEntry {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.author === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.text === 'string'
  );
}

/** Parse stored notes (JSON array or legacy plain text). */
export function parseWorkNotes(raw: string | null | undefined): WorkNoteEntry[] {
  const text = String(raw ?? '');
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && parsed.every(isNoteEntry)) {
        return parsed.map((e) => ({
          id: e.id,
          author: String(e.author || PRIOR_NOTE_AUTHOR).trim() || PRIOR_NOTE_AUTHOR,
          authorEmail: typeof e.authorEmail === 'string' ? e.authorEmail : undefined,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt || e.createdAt,
          text: String(e.text ?? ''),
        }));
      }
    } catch {
      /* fall through */
    }
  }

  return [
    {
      id: 'legacy',
      author: PRIOR_NOTE_AUTHOR,
      createdAt: LEGACY_EPOCH,
      updatedAt: LEGACY_EPOCH,
      text,
    },
  ];
}

export function serializeWorkNotes(entries: WorkNoteEntry[]): string {
  if (entries.length === 0) return '';
  return JSON.stringify(
    entries.map((e) => ({
      id: e.id,
      author: e.author,
      authorEmail: e.authorEmail || undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt || e.createdAt,
      text: e.text,
    })),
  );
}

export function createWorkNote(
  actor: WorkNoteActor,
  text: string,
  at = new Date().toISOString(),
): WorkNoteEntry {
  return {
    id: newNoteId(),
    author: String(actor.name || '').trim() || 'Unknown',
    authorEmail: actor.email ? String(actor.email).trim().toLowerCase() : undefined,
    createdAt: at,
    updatedAt: at,
    text: text.trim(),
  };
}

export function addWorkNote(
  raw: string | null | undefined,
  actor: WorkNoteActor,
  text: string,
): string {
  const body = text.trim();
  if (!body) return serializeWorkNotes(parseWorkNotes(raw));
  return serializeWorkNotes([...parseWorkNotes(raw), createWorkNote(actor, body)]);
}

export function updateWorkNote(
  raw: string | null | undefined,
  noteId: string,
  text: string,
  actor: WorkNoteActor,
  at = new Date().toISOString(),
): { ok: true; notes: string } | { ok: false; error: string } {
  const entries = parseWorkNotes(raw);
  const index = entries.findIndex((e) => e.id === noteId);
  if (index < 0) return { ok: false, error: 'Note not found.' };
  if (!canModifyWorkNote(entries[index], actor)) {
    return { ok: false, error: 'You can only edit your own notes.' };
  }
  const body = text.trim();
  if (!body) {
    return deleteWorkNote(raw, noteId, actor);
  }
  entries[index] = { ...entries[index], text: body, updatedAt: at };
  return { ok: true, notes: serializeWorkNotes(entries) };
}

export function deleteWorkNote(
  raw: string | null | undefined,
  noteId: string,
  actor: WorkNoteActor,
): { ok: true; notes: string } | { ok: false; error: string } {
  const entries = parseWorkNotes(raw);
  const target = entries.find((e) => e.id === noteId);
  if (!target) return { ok: false, error: 'Note not found.' };
  if (!canModifyWorkNote(target, actor)) {
    return { ok: false, error: 'You can only delete your own notes.' };
  }
  return { ok: true, notes: serializeWorkNotes(entries.filter((e) => e.id !== noteId)) };
}

export function formatWorkNoteWhen(iso: string | null | undefined): string {
  const raw = String(iso ?? '').trim();
  if (!raw || raw === LEGACY_EPOCH) return 'Earlier';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function workNotesPlainText(raw: string | null | undefined): string {
  return parseWorkNotes(raw)
    .map((e) => e.text)
    .join('\n')
    .trim();
}
