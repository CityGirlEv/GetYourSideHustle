/**
 * Content Factory calendar item attachments (images, short videos, and PDFs).
 */
import { error, json, type DbUser, type Env } from "./auth";
import { decodeBase64ToBytes } from "./test-evidence";
import {
  attachmentMaxMbLabel,
  deleteAttachmentChunks,
  ensureAttachmentContentChunksTable,
  maxBytesForAttachment,
  persistAttachmentBase64,
  resolveAttachmentBase64,
} from "./attachment-limits";
const MEDIA_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|heic|mp4|webm|mov|pdf)$/i;
const IMAGE_MIME = /^(image\/(png|jpeg|jpg|gif|webp|svg\+xml|bmp|heic|heif))$/i;
const VIDEO_MIME = /^(video\/(mp4|webm|quicktime))$/i;
const PDF_MIME = /^application\/pdf$/i;

function cleanBase64(raw: string): string {
  return String(raw || "")
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s+/g, "");
}

function looksLikeIsoBmff(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  );
}

export function isSoftLaunchMediaAttachment(name: string, mimeType: string): boolean {
  const n = String(name || "").trim();
  const m = String(mimeType || "").trim().toLowerCase();
  if (MEDIA_EXT.test(n)) return true;
  if (IMAGE_MIME.test(m) || m.startsWith("image/")) return true;
  if (VIDEO_MIME.test(m) || m.startsWith("video/")) return true;
  if (PDF_MIME.test(m)) return true;
  return false;
}

/** @deprecated Use isSoftLaunchMediaAttachment */
export const isSoftLaunchImageAttachment = isSoftLaunchMediaAttachment;

function inferMime(name: string, mimeType: string): string {
  const m = String(mimeType || "").trim().toLowerCase();
  if (m.startsWith("image/") || m.startsWith("video/") || PDF_MIME.test(m)) return m;
  const ext = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "png";
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    heic: "image/heic",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    pdf: "application/pdf",
  };
  return map[ext] || "application/octet-stream";
}

export function validateSoftLaunchMediaAttachment(input: {
  name: string;
  mimeType: string;
  contentBase64: string;
}): { ok: true; mime: string; cleaned: string; size: number } | { ok: false; error: string } {
  const name = String(input.name || "").trim();
  if (!name || !isSoftLaunchMediaAttachment(name, input.mimeType)) {
    return {
      ok: false,
      error: "Only image, video, or PDF uploads are allowed (png/jpg/gif/webp/svg + mp4/webm/mov + pdf).",
    };
  }
  const mimeType = inferMime(name, input.mimeType);
  const cleaned = cleanBase64(input.contentBase64);
  if (!cleaned) return { ok: false, error: "Missing file contents." };
  const bytes = decodeBase64ToBytes(cleaned);
  if (!bytes || bytes.length === 0) return { ok: false, error: "Could not read file contents." };
  if (bytes.length > maxBytesForAttachment(name, mimeType)) {
    const maxBytes = maxBytesForAttachment(name, mimeType);
    return {
      ok: false,
      error: `File too large (max ${attachmentMaxMbLabel(maxBytes)}MB). Compress or shorten the clip and try again.`,
    };
  }

  const lower = name.toLowerCase();
  if (/\.mp4$/i.test(lower) || /\.mov$/i.test(lower)) {
    if (!looksLikeIsoBmff(bytes)) {
      return { ok: false, error: "Video signature mismatch (expected MP4/MOV)." };
    }
  } else if (/\.webm$/i.test(lower)) {
    if (!(bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3)) {
      return { ok: false, error: "WEBM signature mismatch." };
    }
  } else if (/\.pdf$/i.test(lower) || PDF_MIME.test(mimeType)) {
    if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
      return { ok: false, error: "PDF signature mismatch." };
    }
  }

  return { ok: true, mime: mimeType, cleaned, size: bytes.length };
}

/** @deprecated Use validateSoftLaunchMediaAttachment */
export const validateSoftLaunchImageAttachment = validateSoftLaunchMediaAttachment;

export async function ensureSoftLaunchAttachmentsTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS soft_launch_item_attachments (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT '',
      size INTEGER NOT NULL DEFAULT 0,
      content_base64 TEXT NOT NULL DEFAULT '',
      added_at TEXT NOT NULL,
      added_by TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_soft_launch_item_attachments_item
     ON soft_launch_item_attachments (item_id)`,
  ).run();
}

type AttRow = {
  id: string;
  item_id: string;
  name: string;
  mime_type: string;
  size: number;
  content_base64?: string | null;
  added_at: string;
  added_by: string;
};

function publicMeta(row: AttRow) {
  return {
    id: row.id,
    itemId: row.item_id,
    name: row.name,
    mimeType: row.mime_type,
    size: Number(row.size) || 0,
    addedAt: row.added_at,
    addedBy: row.added_by || "",
    hasContent: Boolean(row.content_base64 && String(row.content_base64).length > 0),
  };
}

function todayMMDDYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export async function listSoftLaunchAttachments(
  env: Env,
  request: Request,
): Promise<Response> {
  await ensureSoftLaunchAttachmentsTable(env);
  const itemId = (new URL(request.url).searchParams.get("itemId") || "").trim();
  if (itemId) {
    const { results } = await env.DB.prepare(
      `SELECT id, item_id, name, mime_type, size, content_base64, added_at, added_by
       FROM soft_launch_item_attachments
       WHERE item_id = ?
       ORDER BY added_at ASC, id ASC`,
    )
      .bind(itemId)
      .all<AttRow>();
    return json({ attachments: (results ?? []).map(publicMeta) });
  }
  const { results } = await env.DB.prepare(
    `SELECT id, item_id, name, mime_type, size, content_base64, added_at, added_by
     FROM soft_launch_item_attachments
     ORDER BY added_at ASC, id ASC`,
  ).all<AttRow>();
  return json({ attachments: (results ?? []).map(publicMeta) });
}

export async function getSoftLaunchAttachmentContent(
  env: Env,
  id: string,
): Promise<Response> {
  await ensureSoftLaunchAttachmentsTable(env);
  await ensureAttachmentContentChunksTable(env.DB);
  const row = await env.DB.prepare(
    `SELECT id, name, mime_type, content_base64 FROM soft_launch_item_attachments WHERE id = ?`,
  )
    .bind(id)
    .first<{
      id: string;
      name: string;
      mime_type: string;
      content_base64: string | null;
    }>();
  if (!row) return error("Attachment not found.", 404);
  const contentBase64 = await resolveAttachmentBase64(env.DB, row.id, row.content_base64);
  if (!contentBase64) {
    return error("File bytes are missing. Please re-upload.", 404);
  }
  return json({
    id: row.id,
    name: row.name,
    mimeType: row.mime_type,
    contentBase64,
  });
}

export async function uploadSoftLaunchAttachment(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureSoftLaunchAttachmentsTable(env);
  let body: {
    itemId?: string;
    id?: string;
    name?: string;
    mimeType?: string;
    contentBase64?: string;
    addedAt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const itemId = String(body.itemId || "").trim();
  const name = String(body.name || "").trim();
  const mimeType = String(body.mimeType || "").trim();
  const contentBase64 = String(body.contentBase64 || "").trim();
  if (!itemId || !name || !contentBase64) {
    return error("itemId, name, and contentBase64 are required.");
  }

  const validated = validateSoftLaunchMediaAttachment({ name, mimeType, contentBase64 });
  if (!validated.ok) return error(validated.error, 400);

  const id = String(body.id || "").trim() || `sla-${crypto.randomUUID()}`;
  const addedAt = String(body.addedAt || "").trim() || todayMMDDYY();
  const addedBy = actor.email || actor.name || "";
  await ensureAttachmentContentChunksTable(env.DB);
  const storedContent = await persistAttachmentBase64(env.DB, id, validated.cleaned);

  const existing = await env.DB.prepare(
    `SELECT id FROM soft_launch_item_attachments WHERE id = ?`,
  )
    .bind(id)
    .first<{ id: string }>();

  if (existing) {
    await env.DB.prepare(
      `UPDATE soft_launch_item_attachments
       SET item_id = ?, name = ?, mime_type = ?, size = ?, content_base64 = ?, added_at = ?, added_by = ?
       WHERE id = ?`,
    )
      .bind(itemId, name, validated.mime, validated.size, storedContent, addedAt, addedBy, id)
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO soft_launch_item_attachments
         (id, item_id, name, mime_type, size, content_base64, added_at, added_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, itemId, name, validated.mime, validated.size, storedContent, addedAt, addedBy)
      .run();
  }

  return json(
    {
      ok: true,
      attachment: {
        id,
        itemId,
        name,
        mimeType: validated.mime,
        size: validated.size,
        addedAt,
        addedBy,
        hasContent: true,
      },
    },
    existing ? 200 : 201,
  );
}

export async function deleteSoftLaunchAttachment(
  env: Env,
  request: Request,
  _actor: DbUser,
): Promise<Response> {
  await ensureSoftLaunchAttachmentsTable(env);
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const id = String(body.id || "").trim();
  if (!id) return error("id is required.");
  await ensureAttachmentContentChunksTable(env.DB);
  await deleteAttachmentChunks(env.DB, id);
  await env.DB.prepare(`DELETE FROM soft_launch_item_attachments WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

export async function handleSoftLaunchAttachments(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method === "GET") {
    const id = (new URL(request.url).searchParams.get("id") || "").trim();
    if (id) return getSoftLaunchAttachmentContent(env, id);
    return listSoftLaunchAttachments(env, request);
  }
  if (method === "POST") return uploadSoftLaunchAttachment(env, request, actor);
  if (method === "DELETE") return deleteSoftLaunchAttachment(env, request, actor);
  return error("Method not allowed.", 405);
}
