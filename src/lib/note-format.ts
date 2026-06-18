/** Human-readable timestamp for note entries (author attribution UI). */
export function formatNoteTimestamp(at: string): string {
  try {
    const d = new Date(at);
    if (Number.isNaN(d.getTime())) return at;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return at;
  }
}

export const UNKNOWN_NOTE_AUTHOR = "Unknown author";
export const LEGACY_NOTE_AUTHOR = "Legacy note";
export const UNKNOWN_NOTE_DATE_LABEL = "Date unknown";

/** Display author with sensible fallbacks for legacy / partial entries. */
export function displayNoteAuthor(authorName?: string | null, authorId?: string | null): string {
  const name = authorName?.trim();
  if (name) return name;
  if (authorId?.trim()) return UNKNOWN_NOTE_AUTHOR;
  return LEGACY_NOTE_AUTHOR;
}

/** Display timestamp with fallback when missing or invalid. */
export function displayNoteTimestamp(at?: string | null): string {
  const raw = at?.trim();
  if (!raw) return UNKNOWN_NOTE_DATE_LABEL;
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return UNKNOWN_NOTE_DATE_LABEL;
    return formatNoteTimestamp(raw);
  } catch {
    return UNKNOWN_NOTE_DATE_LABEL;
  }
}

export interface NormalizedNoteEntry {
  author_id: string;
  author_name: string;
  text: string;
  at: string;
  attachment_path?: string;
  attachment_name?: string;
}

export interface NormalizeNoteOptions {
  /** test_results.updated_at — used when an entry has no timestamp */
  fallbackAt?: string | null;
  index?: number;
}

/** Coerce a raw DB/localStorage note value into a normalized entry shape. */
export function normalizeNoteEntry(
  raw: unknown,
  opts: NormalizeNoteOptions = {},
): NormalizedNoteEntry | null {
  const { fallbackAt } = opts;

  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return null;
    return {
      author_id: "",
      author_name: LEGACY_NOTE_AUTHOR,
      text,
      at: fallbackAt?.trim() || "",
    };
  }

  if (!raw || typeof raw !== "object") return null;

  const o = raw as Record<string, unknown>;
  const text = (
    typeof o.text === "string" ? o.text : typeof o.body === "string" ? o.body : ""
  ).trim();
  const attachment_path =
    typeof o.attachment_path === "string" && o.attachment_path.trim()
      ? o.attachment_path.trim()
      : undefined;
  const attachment_name =
    typeof o.attachment_name === "string" && o.attachment_name.trim()
      ? o.attachment_name.trim()
      : undefined;
  if (!text && !attachment_path) return null;

  const author_id = typeof o.author_id === "string" ? o.author_id : "";
  const author_name =
    typeof o.author_name === "string" && o.author_name.trim()
      ? o.author_name.trim()
      : author_id
        ? UNKNOWN_NOTE_AUTHOR
        : LEGACY_NOTE_AUTHOR;
  const at = typeof o.at === "string" && o.at.trim() ? o.at.trim() : fallbackAt?.trim() || "";

  return {
    author_id,
    author_name,
    text: text || (attachment_name ? `Attachment: ${attachment_name}` : ""),
    at,
    ...(attachment_path ? { attachment_path } : {}),
    ...(attachment_name ? { attachment_name } : {}),
  };
}

/** Normalize a note thread array, preserving order and dropping empty entries. */
export function normalizeNoteEntries(
  raw: unknown,
  fallbackAt?: string | null,
): NormalizedNoteEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: NormalizedNoteEntry[] = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = normalizeNoteEntry(raw[i], { fallbackAt, index: i });
    if (entry) out.push(entry);
  }
  return out;
}
