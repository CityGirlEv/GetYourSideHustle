/**
 * Timestamped, author-attributed notes for Task List + Testing Portal.
 * Stored as a JSON array in the existing notes/note TEXT columns.
 * Legacy plain strings migrate to a single read-only "Legacy" entry on parse.
 */

import { formatAuditUpdatedAt } from "./gysh-audit";

export type NoteEntry = {
  id: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  text: string;
};

export const LEGACY_NOTE_AUTHOR = "Legacy";
export const SYSTEM_NOTE_AUTHOR = "System";

function newNoteId(): string {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function authorsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return String(a ?? "")
    .trim()
    .toLowerCase() === String(b ?? "").trim().toLowerCase();
}

export function canEditNoteEntry(
  entry: NoteEntry,
  actor: string | null | undefined,
): boolean {
  if (!actor?.trim()) return false;
  if (authorsMatch(entry.author, LEGACY_NOTE_AUTHOR)) return false;
  if (authorsMatch(entry.author, SYSTEM_NOTE_AUTHOR)) return false;
  return authorsMatch(entry.author, actor);
}

function isNoteEntry(value: unknown): value is NoteEntry {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.author === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.text === "string" &&
    (typeof o.updatedAt === "string" || o.updatedAt === undefined)
  );
}

/** Parse stored notes (JSON array or legacy plain text). */
export function parseNoteEntries(raw: string | null | undefined): NoteEntry[] {
  const text = String(raw ?? "");
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && parsed.every(isNoteEntry)) {
        return parsed.map((e) => ({
          id: e.id,
          author: String(e.author || LEGACY_NOTE_AUTHOR).trim() || LEGACY_NOTE_AUTHOR,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt || e.createdAt,
          text: String(e.text ?? ""),
        }));
      }
    } catch {
      /* fall through to legacy */
    }
  }

  return [
    {
      id: "legacy",
      author: LEGACY_NOTE_AUTHOR,
      createdAt: "1970-01-01T00:00:00.000Z",
      updatedAt: "1970-01-01T00:00:00.000Z",
      text,
    },
  ];
}

export function serializeNoteEntries(entries: NoteEntry[]): string {
  if (entries.length === 0) return "";
  return JSON.stringify(
    entries.map((e) => ({
      id: e.id,
      author: e.author,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt || e.createdAt,
      text: e.text,
    })),
  );
}

/** Flattened text for search / Fail-Blocked length checks. */
export function noteEntriesPlainText(raw: string | null | undefined): string {
  return parseNoteEntries(raw)
    .map((e) => e.text)
    .join("\n")
    .trim();
}

export function createNoteEntry(author: string, text: string, at = new Date().toISOString()): NoteEntry {
  return {
    id: newNoteId(),
    author: String(author || "").trim() || "Unknown",
    createdAt: at,
    updatedAt: at,
    text: text.trim(),
  };
}

/**
 * Merge incoming notes with previous: others' notes are always retained;
 * actor may add, edit, or delete only their own entries.
 */
export function mergeNoteEntries(
  previousRaw: string | null | undefined,
  incomingRaw: string | null | undefined,
  actor: string,
  now = new Date().toISOString(),
): { ok: true; notes: string } | { ok: false; error: string } {
  const who = String(actor || "").trim();
  if (!who) return { ok: false, error: "Missing note author." };

  const previous = parseNoteEntries(previousRaw);
  const incoming = parseNoteEntries(incomingRaw);
  const incomingById = new Map(incoming.map((e) => [e.id, e]));
  const prevIds = new Set(previous.map((e) => e.id));
  const result: NoteEntry[] = [];

  for (const prev of previous) {
    if (!canEditNoteEntry(prev, who)) {
      result.push(prev);
      continue;
    }
    const next = incomingById.get(prev.id);
    if (!next) continue; // own note deleted
    const text = String(next.text ?? "").trim();
    if (!text) continue; // empty own note dropped
    if (text === prev.text.trim()) {
      result.push(prev);
    } else {
      result.push({ ...prev, text, updatedAt: now });
    }
  }

  for (const inc of incoming) {
    if (prevIds.has(inc.id)) continue;
    const text = String(inc.text ?? "").trim();
    if (!text) continue;
    // New entries are always attributed to the actor (ignore spoofed author).
    result.push({
      id: inc.id?.trim() || newNoteId(),
      author: who,
      createdAt: inc.createdAt || now,
      updatedAt: now,
      text,
    });
  }

  result.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  return { ok: true, notes: serializeNoteEntries(result) };
}

/** Append a new note from the actor (skips duplicate of their latest identical text). */
export function appendActorNote(
  previousRaw: string | null | undefined,
  actor: string,
  text: string,
  now = new Date().toISOString(),
): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return serializeNoteEntries(parseNoteEntries(previousRaw));
  }
  const entries = parseNoteEntries(previousRaw);
  const lastOwn = [...entries].reverse().find((e) => authorsMatch(e.author, actor));
  if (lastOwn && lastOwn.text.trim() === trimmed) {
    return serializeNoteEntries(entries);
  }
  entries.push(createNoteEntry(actor, trimmed, now));
  return serializeNoteEntries(entries);
}

/**
 * Apply UI drafts onto stored notes for the actor, then return serialized result.
 * - `editDrafts`: map of noteId → text for own notes
 * - `newText`: optional new note to append
 */
export function applyNoteDrafts(
  previousRaw: string | null | undefined,
  actor: string,
  editDrafts: Record<string, string> | undefined,
  newText: string | undefined,
  now = new Date().toISOString(),
): string {
  const who = String(actor || "").trim();
  let entries = parseNoteEntries(previousRaw);

  if (editDrafts) {
    entries = entries
      .map((e) => {
        if (!(e.id in editDrafts) || !canEditNoteEntry(e, who)) return e;
        const text = String(editDrafts[e.id] ?? "").trim();
        if (!text) return null;
        if (text === e.text.trim()) return e;
        return { ...e, text, updatedAt: now };
      })
      .filter((e): e is NoteEntry => e != null);
  }

  const serialized = serializeNoteEntries(entries);
  if (newText?.trim()) {
    return appendActorNote(serialized, who, newText, now);
  }
  return serialized;
}

/** e.g. "Tina Marie · Jul 21, 2026, 4:26 AM" */
export function formatNoteEntryStamp(entry: NoteEntry): string {
  const when = formatAuditUpdatedAt(entry.updatedAt || entry.createdAt);
  const who = entry.author.trim() || "Unknown";
  if (who && when) return `${who} · ${when}`;
  if (who) return who;
  return when || "Unknown";
}

export function noteEntryAuthor(entry: NoteEntry): string {
  return entry.author.trim() || "Unknown";
}

export function noteEntryWhen(entry: NoteEntry): string {
  return formatAuditUpdatedAt(entry.updatedAt || entry.createdAt);
}

export function notesHaveUnsavedDraft(
  previousRaw: string | null | undefined,
  actor: string,
  editDrafts: Record<string, string> | undefined,
  newText: string | undefined,
): boolean {
  if (newText?.trim()) return true;
  if (!editDrafts) return false;
  const entries = parseNoteEntries(previousRaw);
  for (const [id, draft] of Object.entries(editDrafts)) {
    const entry = entries.find((e) => e.id === id);
    if (!entry || !canEditNoteEntry(entry, actor)) continue;
    if (String(draft ?? "").trim() !== entry.text.trim()) return true;
  }
  return false;
}
