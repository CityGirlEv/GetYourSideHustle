/**
 * Timestamped, author-attributed notes for Task List + Testing Portal.
 * Stored as a JSON array in the existing notes/note TEXT columns.
 * Older plain-text notes become a read-only prior entry, stamped with the
 * task/test last-updated author + date when available.
 */

import { formatAuditUpdatedAt } from "./gysh-audit";

export type NoteEntry = {
  id: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  text: string;
};

/** @deprecated Prefer PRIOR_NOTE_AUTHOR — kept for stored rows still labeled "Legacy". */
export const LEGACY_NOTE_AUTHOR = "Legacy";
export const PRIOR_NOTE_AUTHOR = "Prior note";
export const SYSTEM_NOTE_AUTHOR = "System";
export const LEGACY_EPOCH = "1970-01-01T00:00:00.000Z";

/** Best-known author/date for notes written before structured stamps existed. */
export type PriorNoteAttribution = {
  author?: string | null;
  at?: string | null;
};

function newNoteId(): string {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function authorsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = String(a ?? "").trim().toLowerCase();
  const right = String(b ?? "").trim().toLowerCase();
  if (left === right) return true;
  // Tina Marie Barham ≡ Tina (same for Evelyn / Lyriq / Candace full names).
  const canon = (raw: string) => {
    if (!raw) return "";
    if (raw === "tina" || raw.startsWith("tina ")) return "tina";
    if (raw === "evelyn" || raw.startsWith("evelyn ")) return "evelyn";
    if (raw === "lyriq" || raw.startsWith("lyriq ")) return "lyriq";
    if (raw === "candace" || raw.startsWith("candace ")) return "candace";
    return raw;
  };
  return canon(left) === canon(right) && canon(left) !== "";
}

export function isEpochNoteTime(iso: string | null | undefined): boolean {
  const raw = String(iso ?? "").trim();
  if (!raw) return true;
  if (raw === LEGACY_EPOCH) return true;
  const t = Date.parse(raw);
  return Number.isNaN(t) || t <= 0;
}

export function isPriorNoteEntry(entry: NoteEntry): boolean {
  return (
    entry.id === "legacy" ||
    authorsMatch(entry.author, LEGACY_NOTE_AUTHOR) ||
    authorsMatch(entry.author, PRIOR_NOTE_AUTHOR)
  );
}

export function canEditNoteEntry(
  entry: NoteEntry,
  actor: string | null | undefined,
): boolean {
  if (!actor?.trim()) return false;
  if (isPriorNoteEntry(entry)) return false;
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

function normalizePriorAttribution(attr?: PriorNoteAttribution): {
  author: string;
  at: string;
} {
  const author = String(attr?.author ?? "").trim();
  const atRaw = String(attr?.at ?? "").trim();
  return {
    author: author || PRIOR_NOTE_AUTHOR,
    at: atRaw && !isEpochNoteTime(atRaw) ? atRaw : "",
  };
}

function healPriorEntry(entry: NoteEntry, attr?: PriorNoteAttribution): NoteEntry {
  const placeholderAuthor =
    authorsMatch(entry.author, LEGACY_NOTE_AUTHOR) ||
    authorsMatch(entry.author, PRIOR_NOTE_AUTHOR) ||
    !entry.author.trim();
  const placeholderWhen =
    isEpochNoteTime(entry.createdAt) && isEpochNoteTime(entry.updatedAt);
  if (!placeholderAuthor && !placeholderWhen && entry.id !== "legacy") {
    return entry;
  }

  const { author, at } = normalizePriorAttribution(attr);
  const who = placeholderAuthor ? author : entry.author.trim();
  const when = !isEpochNoteTime(entry.updatedAt)
    ? entry.updatedAt
    : !isEpochNoteTime(entry.createdAt)
      ? entry.createdAt
      : at;

  return {
    ...entry,
    id: entry.id === "legacy" || placeholderAuthor ? "legacy" : entry.id,
    author: who,
    createdAt: when || entry.createdAt,
    updatedAt: when || entry.updatedAt,
  };
}

/** Parse stored notes (JSON array or legacy plain text). */
export function parseNoteEntries(
  raw: string | null | undefined,
  prior?: PriorNoteAttribution,
): NoteEntry[] {
  const text = String(raw ?? "");
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && parsed.every(isNoteEntry)) {
        return parsed.map((e) =>
          healPriorEntry(
            {
              id: e.id,
              author: String(e.author || LEGACY_NOTE_AUTHOR).trim() || LEGACY_NOTE_AUTHOR,
              createdAt: e.createdAt,
              updatedAt: e.updatedAt || e.createdAt,
              text: String(e.text ?? ""),
            },
            prior,
          ),
        );
      }
    } catch {
      /* fall through to plain text */
    }
  }

  const { author, at } = normalizePriorAttribution(prior);
  return [
    {
      id: "legacy",
      author,
      createdAt: at,
      updatedAt: at,
      text,
    },
  ];
}

/** Re-serialize notes after stamping prior/plain-text rows with known author + date. */
export function withPriorNoteAttribution(
  raw: string | null | undefined,
  prior?: PriorNoteAttribution,
): string {
  return serializeNoteEntries(parseNoteEntries(raw, prior));
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

/**
 * True when two note payloads carry the same readable content.
 * Used so locked-sprint saves ignore plain-text → JSON note heals (not real edits).
 */
export function notesEffectivelyEqual(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (String(a ?? "") === String(b ?? "")) return true;
  return noteEntriesPlainText(a) === noteEntriesPlainText(b);
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
  prior?: PriorNoteAttribution,
): { ok: true; notes: string } | { ok: false; error: string } {
  const who = String(actor || "").trim();
  if (!who) return { ok: false, error: "Missing note author." };

  const previous = parseNoteEntries(previousRaw, prior);
  const incoming = parseNoteEntries(incomingRaw, prior);
  const incomingById = new Map(incoming.map((e) => [e.id, e]));
  const prevIds = new Set(previous.map((e) => e.id));
  const result: NoteEntry[] = [];

  for (const prev of previous) {
    if (!canEditNoteEntry(prev, who)) {
      const next = incomingById.get(prev.id);
      if (
        next &&
        isPriorNoteEntry(prev) &&
        String(next.text ?? "").trim() === prev.text.trim()
      ) {
        // Keep prior text; prefer a better stamp from either side.
        result.push(
          healPriorEntry(
            {
              ...prev,
              author: next.author || prev.author,
              createdAt: next.createdAt || prev.createdAt,
              updatedAt: next.updatedAt || prev.updatedAt,
            },
            prior,
          ),
        );
      } else {
        result.push(prev);
      }
      continue;
    }
    const next = incomingById.get(prev.id);
    // Never drop prior entries — omit from incoming = keep unchanged; empty text = keep.
    if (!next) {
      result.push(prev);
      continue;
    }
    const text = String(next.text ?? "").trim();
    if (!text) {
      result.push(prev);
      continue;
    }
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
    // Prior/legacy rows stay attributed as prior notes (not reassigned to actor).
    if (isPriorNoteEntry(inc)) {
      result.push(healPriorEntry(inc, prior));
      continue;
    }
    result.push({
      id: inc.id?.trim() || newNoteId(),
      author: who,
      createdAt: inc.createdAt || now,
      updatedAt: now,
      text,
    });
  }

  result.sort(
    (a, b) =>
      (a.createdAt || "").localeCompare(b.createdAt || "") || a.id.localeCompare(b.id),
  );
  return { ok: true, notes: serializeNoteEntries(result) };
}

/** Append a new note from the actor (skips duplicate of their latest identical text). */
export function appendActorNote(
  previousRaw: string | null | undefined,
  actor: string,
  text: string,
  now = new Date().toISOString(),
  prior?: PriorNoteAttribution,
): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return serializeNoteEntries(parseNoteEntries(previousRaw, prior));
  }
  const entries = parseNoteEntries(previousRaw, prior);
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
  prior?: PriorNoteAttribution,
): string {
  const who = String(actor || "").trim();
  let entries = parseNoteEntries(previousRaw, prior);

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
    return appendActorNote(serialized, who, newText, now, prior);
  }
  return serialized;
}

/** e.g. "Tina Marie · Jul 21, 2026, 4:26 AM" */
export function formatNoteEntryStamp(entry: NoteEntry): string {
  const iso = entry.updatedAt || entry.createdAt;
  const when = isEpochNoteTime(iso) ? "" : formatAuditUpdatedAt(iso);
  const who = entry.author.trim() || PRIOR_NOTE_AUTHOR;
  if (who && when) return `${who} · ${when}`;
  if (who) return who;
  return when || PRIOR_NOTE_AUTHOR;
}

export function noteEntryAuthor(entry: NoteEntry): string {
  return entry.author.trim() || PRIOR_NOTE_AUTHOR;
}

export function noteEntryWhen(entry: NoteEntry): string {
  const iso = entry.updatedAt || entry.createdAt;
  if (isEpochNoteTime(iso)) return "";
  return formatAuditUpdatedAt(iso);
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
