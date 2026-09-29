/**
 * Per-guide notes + attachments for logged-in members.
 * Authors edit/delete their own; admin can edit/delete anyone's.
 * Attachments allow up to 25MB (chunked in D1).
 */
import { error, json, type DbUser, type Env, userRoles } from "./auth";
import { canAccessAdminPortal } from "./roles";
import { decodeBase64ToBytes } from "./test-evidence";
import {
  attachmentMaxMbLabel,
  deleteAttachmentChunks,
  ensureAttachmentContentChunksTable,
  persistAttachmentBase64,
  resolveAttachmentBase64,
} from "./attachment-limits";

/** Generous ceiling for guide note attachments (images, PDF, Office, video, etc.). */
export const GUIDE_NOTE_ATTACHMENT_MAX_BYTES = 25_000_000;

const GUIDE_NOTE_ATTACHMENT_EXT =
  /\.(png|jpe?g|gif|webp|svg|bmp|heic|mp4|webm|mov|pdf|doc|docx|xls|xlsx|txt|csv)$/i;

function cleanBase64(raw: string): string {
  return String(raw || "")
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s+/g, "");
}

export function guideNoteAttachmentMaxMbLabel(): string {
  return attachmentMaxMbLabel(GUIDE_NOTE_ATTACHMENT_MAX_BYTES);
}

export function validateGuideNoteAttachment(input: {
  name: string;
  mimeType: string;
  contentBase64: string;
}): { ok: true; mime: string; cleaned: string; size: number } | { ok: false; error: string } {
  const name = String(input.name || "").trim();
  const mimeType =
    String(input.mimeType || "application/octet-stream").trim() || "application/octet-stream";
  if (!name || !GUIDE_NOTE_ATTACHMENT_EXT.test(name)) {
    return {
      ok: false,
      error:
        "Unsupported file type. Use images, PDF, Word, Excel, video (mp4/webm/mov), txt, or csv.",
    };
  }
  const cleaned = cleanBase64(input.contentBase64);
  if (!cleaned) return { ok: false, error: "Missing file contents." };
  const bytes = decodeBase64ToBytes(cleaned);
  if (!bytes || bytes.length === 0) return { ok: false, error: "Could not read file contents." };
  if (bytes.length > GUIDE_NOTE_ATTACHMENT_MAX_BYTES) {
    return {
      ok: false,
      error: `File too large (max ${guideNoteAttachmentMaxMbLabel()}MB). Re-upload a smaller file.`,
    };
  }
  return { ok: true, mime: mimeType, cleaned, size: bytes.length };
}

export function canManageGuideNote(
  actor: DbUser,
  ownerUserId: string,
): boolean {
  if (canAccessAdminPortal(userRoles(actor))) return true;
  return String(actor.id || "").trim() === String(ownerUserId || "").trim() && Boolean(actor.id);
}

/** Body written to the guide Notes tab when Pending / Needs Further Review is set. */
export function formatPendingStatusGuideNoteBody(reason: string): string {
  const text = String(reason || "").trim();
  if (!text) return "";
  return `[Pending / Needs Further Review]\n${text}`;
}

/**
 * Persist a Pending popup note onto the guide Notes tab (same table as member notes).
 * Call alongside GUIDE-REV test sync so admins see the reason in Notes.
 */
export async function insertPendingStatusGuideNote(
  env: Env,
  guideId: string,
  reason: string,
  actor: DbUser,
  now: string,
): Promise<void> {
  const idGuide = String(guideId || "").trim();
  const body = formatPendingStatusGuideNoteBody(reason);
  if (!idGuide || !body) return;
  await ensureGuideNotesTables(env);
  const id = crypto.randomUUID();
  const authorName = String(actor.name || "").trim() || actor.email || "Admin";
  const authorId = String(actor.id || "").trim() || "admin";
  await env.DB.prepare(
    `INSERT INTO guide_notes
       (id, guide_id, author_user_id, author_name, body, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, idGuide, authorId, authorName, body, now, now)
    .run();
}

export async function ensureGuideNotesTables(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS guide_notes (
       id TEXT PRIMARY KEY,
       guide_id TEXT NOT NULL,
       author_user_id TEXT NOT NULL,
       author_name TEXT NOT NULL,
       body TEXT NOT NULL DEFAULT '',
       created_at TEXT NOT NULL,
       updated_at TEXT NOT NULL
     )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_guide_notes_guide
     ON guide_notes (guide_id, created_at)`,
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS guide_note_attachments (
       id TEXT PRIMARY KEY,
       guide_id TEXT NOT NULL,
       note_id TEXT,
       uploaded_by_user_id TEXT NOT NULL,
       uploaded_by_name TEXT NOT NULL,
       name TEXT NOT NULL,
       mime_type TEXT NOT NULL DEFAULT '',
       size INTEGER NOT NULL DEFAULT 0,
       content_base64 TEXT NOT NULL DEFAULT '',
       description TEXT NOT NULL DEFAULT '',
       created_at TEXT NOT NULL
     )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_guide_note_attachments_guide
     ON guide_note_attachments (guide_id, created_at)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_guide_note_attachments_note
     ON guide_note_attachments (note_id)`,
  ).run();
  await ensureAttachmentContentChunksTable(env.DB);
}

type GuideNoteRow = {
  id: string;
  guide_id: string;
  author_user_id: string;
  author_name: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type GuideAttachmentRow = {
  id: string;
  guide_id: string;
  note_id: string | null;
  uploaded_by_user_id: string;
  uploaded_by_name: string;
  name: string;
  mime_type: string;
  size: number;
  description: string;
  created_at: string;
};

function publicNote(row: GuideNoteRow) {
  return {
    id: row.id,
    guideId: row.guide_id,
    authorUserId: row.author_user_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function publicAttachment(row: GuideAttachmentRow) {
  return {
    id: row.id,
    guideId: row.guide_id,
    noteId: row.note_id || null,
    uploadedByUserId: row.uploaded_by_user_id,
    uploadedByName: row.uploaded_by_name,
    name: row.name,
    mimeType: row.mime_type,
    size: row.size,
    description: row.description || "",
    createdAt: row.created_at,
    hasContent: true,
  };
}

export async function handleGuideNotes(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureGuideNotesTables(env);
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const guideId = (new URL(request.url).searchParams.get("guideId") || "").trim();
    if (!guideId) return error("guideId is required.");
    const notesRes = await env.DB.prepare(
      `SELECT id, guide_id, author_user_id, author_name, body, created_at, updated_at
       FROM guide_notes
       WHERE guide_id = ?
       ORDER BY created_at ASC`,
    )
      .bind(guideId)
      .all<GuideNoteRow>();
    const attsRes = await env.DB.prepare(
      `SELECT id, guide_id, note_id, uploaded_by_user_id, uploaded_by_name,
              name, mime_type, size, description, created_at
       FROM guide_note_attachments
       WHERE guide_id = ?
       ORDER BY created_at ASC`,
    )
      .bind(guideId)
      .all<GuideAttachmentRow>();
    return json({
      ok: true,
      notes: (notesRes.results ?? []).map(publicNote),
      attachments: (attsRes.results ?? []).map(publicAttachment),
    });
  }

  if (method === "POST") {
    let body: { guideId?: string; text?: string; body?: string };
    try {
      body = await request.json();
    } catch {
      return error("Invalid JSON body.");
    }
    const guideId = String(body.guideId || "").trim();
    const text = String(body.text ?? body.body ?? "").trim();
    if (!guideId) return error("guideId is required.");
    if (!text) return error("Note text is required.");
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const authorName = String(actor.name || "").trim() || actor.email || "Member";
    await env.DB.prepare(
      `INSERT INTO guide_notes
         (id, guide_id, author_user_id, author_name, body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, guideId, actor.id, authorName, text, now, now)
      .run();
    return json({
      ok: true,
      note: publicNote({
        id,
        guide_id: guideId,
        author_user_id: actor.id,
        author_name: authorName,
        body: text,
        created_at: now,
        updated_at: now,
      }),
    });
  }

  if (method === "PUT") {
    let body: { id?: string; text?: string; body?: string };
    try {
      body = await request.json();
    } catch {
      return error("Invalid JSON body.");
    }
    const id = String(body.id || "").trim();
    const text = String(body.text ?? body.body ?? "").trim();
    if (!id) return error("id is required.");
    if (!text) return error("Note text is required.");
    const row = await env.DB.prepare(
      `SELECT id, guide_id, author_user_id, author_name, body, created_at, updated_at
       FROM guide_notes WHERE id = ?`,
    )
      .bind(id)
      .first<GuideNoteRow>();
    if (!row) return error("Note not found.", 404);
    if (!canManageGuideNote(actor, row.author_user_id)) {
      return error("You can only edit your own notes.", 403);
    }
    const now = new Date().toISOString();
    await env.DB.prepare(`UPDATE guide_notes SET body = ?, updated_at = ? WHERE id = ?`)
      .bind(text, now, id)
      .run();
    return json({
      ok: true,
      note: publicNote({ ...row, body: text, updated_at: now }),
    });
  }

  if (method === "DELETE") {
    const id = (new URL(request.url).searchParams.get("id") || "").trim();
    let bodyId = "";
    if (!id && request.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = (await request.json()) as { id?: string };
        bodyId = String(body.id || "").trim();
      } catch {
        /* ignore */
      }
    }
    const noteId = id || bodyId;
    if (!noteId) return error("id is required.");
    const row = await env.DB.prepare(
      `SELECT id, author_user_id FROM guide_notes WHERE id = ?`,
    )
      .bind(noteId)
      .first<{ id: string; author_user_id: string }>();
    if (!row) return error("Note not found.", 404);
    if (!canManageGuideNote(actor, row.author_user_id)) {
      return error("You can only delete your own notes.", 403);
    }
    const linked = await env.DB.prepare(
      `SELECT id FROM guide_note_attachments WHERE note_id = ?`,
    )
      .bind(noteId)
      .all<{ id: string }>();
    for (const att of linked.results ?? []) {
      await deleteAttachmentChunks(env.DB, att.id);
    }
    await env.DB.prepare(`DELETE FROM guide_note_attachments WHERE note_id = ?`)
      .bind(noteId)
      .run();
    await env.DB.prepare(`DELETE FROM guide_notes WHERE id = ?`).bind(noteId).run();
    return json({ ok: true });
  }

  return error("Method not allowed.", 405);
}

export async function handleGuideNoteAttachments(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureGuideNotesTables(env);
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const id = (new URL(request.url).searchParams.get("id") || "").trim();
    if (!id) return error("id is required.");
    const row = await env.DB.prepare(
      `SELECT id, name, mime_type, content_base64 FROM guide_note_attachments WHERE id = ?`,
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

  if (method === "POST") {
    let body: {
      guideId?: string;
      noteId?: string;
      id?: string;
      name?: string;
      mimeType?: string;
      contentBase64?: string;
      description?: string;
    };
    try {
      body = await request.json();
    } catch {
      return error("Invalid JSON body.");
    }
    const guideId = String(body.guideId || "").trim();
    const noteId = String(body.noteId || "").trim() || null;
    const name = String(body.name || "").trim();
    const mimeType = String(body.mimeType || "application/octet-stream").trim();
    const contentBase64 = String(body.contentBase64 || "").trim();
    const description = String(body.description || "").trim();
    if (!guideId || !name || !contentBase64) {
      return error("guideId, name, and contentBase64 are required.");
    }
    if (noteId) {
      const note = await env.DB.prepare(
        `SELECT id, guide_id FROM guide_notes WHERE id = ?`,
      )
        .bind(noteId)
        .first<{ id: string; guide_id: string }>();
      if (!note || note.guide_id !== guideId) {
        return error("Note not found for this guide.", 404);
      }
    }
    const validated = validateGuideNoteAttachment({ name, mimeType, contentBase64 });
    if (!validated.ok) return error(validated.error, 400);

    const id = String(body.id || "").trim() || crypto.randomUUID();
    const now = new Date().toISOString();
    const uploaderName = String(actor.name || "").trim() || actor.email || "Member";
    const storedContent = await persistAttachmentBase64(env.DB, id, validated.cleaned);
    await env.DB.prepare(
      `INSERT INTO guide_note_attachments
         (id, guide_id, note_id, uploaded_by_user_id, uploaded_by_name,
          name, mime_type, size, content_base64, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        guideId,
        noteId,
        actor.id,
        uploaderName,
        name,
        validated.mime,
        validated.size,
        storedContent,
        description,
        now,
      )
      .run();
    return json({
      ok: true,
      attachment: publicAttachment({
        id,
        guide_id: guideId,
        note_id: noteId,
        uploaded_by_user_id: actor.id,
        uploaded_by_name: uploaderName,
        name,
        mime_type: validated.mime,
        size: validated.size,
        description,
        created_at: now,
      }),
    });
  }

  if (method === "PUT") {
    let body: { id?: string; description?: string };
    try {
      body = await request.json();
    } catch {
      return error("Invalid JSON body.");
    }
    const id = String(body.id || "").trim();
    if (!id) return error("id is required.");
    const row = await env.DB.prepare(
      `SELECT id, guide_id, note_id, uploaded_by_user_id, uploaded_by_name,
              name, mime_type, size, description, created_at
       FROM guide_note_attachments WHERE id = ?`,
    )
      .bind(id)
      .first<GuideAttachmentRow>();
    if (!row) return error("Attachment not found.", 404);
    if (!canManageGuideNote(actor, row.uploaded_by_user_id)) {
      return error("You can only update your own attachments.", 403);
    }
    const description = String(body.description ?? row.description ?? "").trim();
    await env.DB.prepare(`UPDATE guide_note_attachments SET description = ? WHERE id = ?`)
      .bind(description, id)
      .run();
    return json({
      ok: true,
      attachment: publicAttachment({ ...row, description }),
    });
  }

  if (method === "DELETE") {
    const id = (new URL(request.url).searchParams.get("id") || "").trim();
    let bodyId = "";
    if (!id && request.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = (await request.json()) as { id?: string };
        bodyId = String(body.id || "").trim();
      } catch {
        /* ignore */
      }
    }
    const attId = id || bodyId;
    if (!attId) return error("id is required.");
    const row = await env.DB.prepare(
      `SELECT id, uploaded_by_user_id FROM guide_note_attachments WHERE id = ?`,
    )
      .bind(attId)
      .first<{ id: string; uploaded_by_user_id: string }>();
    if (!row) return error("Attachment not found.", 404);
    if (!canManageGuideNote(actor, row.uploaded_by_user_id)) {
      return error("You can only delete your own attachments.", 403);
    }
    await deleteAttachmentChunks(env.DB, attId);
    await env.DB.prepare(`DELETE FROM guide_note_attachments WHERE id = ?`).bind(attId).run();
    return json({ ok: true });
  }

  return error("Method not allowed.", 405);
}
