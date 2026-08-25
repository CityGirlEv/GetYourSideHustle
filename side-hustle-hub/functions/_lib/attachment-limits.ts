/**
 * Attachment size limits + D1-safe chunking.
 *
 * Cloudflare D1 caps any single string/BLOB/row at 2MB. Base64 expands ~4/3, so
 * ~1.5MB decoded fits in one column. Larger files (videos up to 20MB) are split
 * across `attachment_content_chunks` rows; the parent row stores a sentinel.
 */

/** Max decoded size for non-video attachments (images, PDF, Office, etc.). */
export const ATTACHMENT_MAX_BYTES = 8_000_000;

/** Max decoded size for video attachments (mp4 / webm / mov). */
export const VIDEO_ATTACHMENT_MAX_BYTES = 20_000_000;

const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

/** Max base64 characters per D1 chunk (comfortably under the 2MB row limit). */
export const ATTACHMENT_CHUNK_CHARS = 1_400_000;

/** Stored in content_base64 when bytes live in attachment_content_chunks. */
export const ATTACHMENT_CHUNK_SENTINEL = "__GYSH_CHUNKS__";

export function isVideoAttachment(name: string, mimeType?: string): boolean {
  const n = String(name || "").trim();
  if (VIDEO_EXT.test(n)) return true;
  const m = String(mimeType || "").trim().toLowerCase();
  return m.startsWith("video/");
}

/** Decoded-byte ceiling for this file (20MB video / 8MB other). */
export function maxBytesForAttachment(name: string, mimeType?: string): number {
  return isVideoAttachment(name, mimeType) ? VIDEO_ATTACHMENT_MAX_BYTES : ATTACHMENT_MAX_BYTES;
}

export function attachmentMaxMbLabel(maxBytes: number = ATTACHMENT_MAX_BYTES): string {
  return String(Math.round(maxBytes / 1_000_000));
}

export function videoAttachmentMaxMbLabel(): string {
  return attachmentMaxMbLabel(VIDEO_ATTACHMENT_MAX_BYTES);
}

export function isAttachmentChunkSentinel(value: string | null | undefined): boolean {
  const s = String(value || "").trim();
  return s === ATTACHMENT_CHUNK_SENTINEL || s.startsWith(`${ATTACHMENT_CHUNK_SENTINEL}:`);
}

/** Split cleaned base64 into D1-safe pieces (length 1 when no chunking needed). */
export function splitBase64ForD1(cleaned: string): string[] {
  const s = String(cleaned || "");
  if (!s) return [];
  if (s.length <= ATTACHMENT_CHUNK_CHARS) return [s];
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += ATTACHMENT_CHUNK_CHARS) {
    parts.push(s.slice(i, i + ATTACHMENT_CHUNK_CHARS));
  }
  return parts;
}

export function needsAttachmentChunking(cleaned: string): boolean {
  return String(cleaned || "").length > ATTACHMENT_CHUNK_CHARS;
}

export type AttachmentChunkDb = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      all: <T>() => Promise<{ results?: T[] }>;
      first: <T>() => Promise<T | null>;
    };
  };
};

export async function ensureAttachmentContentChunksTable(db: AttachmentChunkDb): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS attachment_content_chunks (
         attachment_id TEXT NOT NULL,
         part_index INTEGER NOT NULL,
         content_base64 TEXT NOT NULL,
         PRIMARY KEY (attachment_id, part_index)
       )`,
    )
    .run();
  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_attachment_content_chunks_id
       ON attachment_content_chunks (attachment_id)`,
    )
    .run();
}

export async function deleteAttachmentChunks(
  db: AttachmentChunkDb,
  attachmentId: string,
): Promise<void> {
  const id = String(attachmentId || "").trim();
  if (!id) return;
  await ensureAttachmentContentChunksTable(db);
  await db.prepare(`DELETE FROM attachment_content_chunks WHERE attachment_id = ?`).bind(id).run();
}

export async function writeAttachmentChunks(
  db: AttachmentChunkDb,
  attachmentId: string,
  parts: string[],
): Promise<void> {
  const id = String(attachmentId || "").trim();
  if (!id || parts.length === 0) return;
  await deleteAttachmentChunks(db, id);
  for (let i = 0; i < parts.length; i++) {
    await db
      .prepare(
        `INSERT INTO attachment_content_chunks (attachment_id, part_index, content_base64)
         VALUES (?, ?, ?)`,
      )
      .bind(id, i, parts[i]!)
      .run();
  }
}

/**
 * Persist cleaned base64: inline string when small enough, else chunks + sentinel.
 * Returns the value to store in the parent `content_base64` column.
 */
export async function persistAttachmentBase64(
  db: AttachmentChunkDb,
  attachmentId: string,
  cleaned: string,
): Promise<string> {
  await ensureAttachmentContentChunksTable(db);
  const parts = splitBase64ForD1(cleaned);
  if (parts.length <= 1) {
    await deleteAttachmentChunks(db, attachmentId);
    return parts[0] || "";
  }
  await writeAttachmentChunks(db, attachmentId, parts);
  return ATTACHMENT_CHUNK_SENTINEL;
}

/** Resolve full base64 from inline column and/or chunks. */
export async function resolveAttachmentBase64(
  db: AttachmentChunkDb,
  attachmentId: string,
  inline: string | null | undefined,
): Promise<string | null> {
  const id = String(attachmentId || "").trim();
  const raw = inline == null ? "" : String(inline);
  if (isAttachmentChunkSentinel(raw) || !raw.trim()) {
    await ensureAttachmentContentChunksTable(db);
    const res = await db
      .prepare(
        `SELECT content_base64 FROM attachment_content_chunks
         WHERE attachment_id = ?
         ORDER BY part_index ASC`,
      )
      .bind(id)
      .all<{ content_base64: string }>();
    const parts = (res.results ?? []).map((r) => r.content_base64);
    if (parts.length > 0) return parts.join("");
    if (isAttachmentChunkSentinel(raw)) return null;
    if (!raw.trim()) return null;
  }
  return raw;
}
