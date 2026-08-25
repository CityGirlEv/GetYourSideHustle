/**
 * Mirror of src/lib/gysh-note-entries.ts for Pages Functions (keep in sync).
 * Timestamped notes: retain history; actor may only change their own entries.
 * Prior plain-text notes are stamped with task/test last-updated author + date.
 */

export type NoteEntry = {
  id: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  text: string;
};

export const LEGACY_NOTE_AUTHOR = "Legacy";
export const PRIOR_NOTE_AUTHOR = "Prior note";
export const SYSTEM_NOTE_AUTHOR = "System";
export const LEGACY_EPOCH = "1970-01-01T00:00:00.000Z";

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
  return String(a ?? "")
    .trim()
    .toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function isEpochNoteTime(iso: string | null | undefined): boolean {
  const raw = String(iso ?? "").trim();
  if (!raw) return true;
  if (raw === LEGACY_EPOCH) return true;
  const t = Date.parse(raw);
  return Number.isNaN(t) || t <= 0;
}

function isPriorNoteEntry(entry: NoteEntry): boolean {
  return (
    entry.id === "legacy" ||
    authorsMatch(entry.author, LEGACY_NOTE_AUTHOR) ||
    authorsMatch(entry.author, PRIOR_NOTE_AUTHOR)
  );
}

function canEditNoteEntry(entry: NoteEntry, actor: string | null | undefined): boolean {
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
    typeof o.text === "string"
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
      /* plain text */
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

export function noteEntriesPlainText(raw: string | null | undefined): string {
  return parseNoteEntries(raw)
    .map((e) => e.text)
    .join("\n")
    .trim();
}

/** Same readable content — ignore plain-text → JSON note heals for lock checks. */
export function notesEffectivelyEqual(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (String(a ?? "") === String(b ?? "")) return true;
  return noteEntriesPlainText(a) === noteEntriesPlainText(b);
}

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
