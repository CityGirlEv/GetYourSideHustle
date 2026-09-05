import { jsonResponse } from '../_shared/resend';

type D1Like = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
      all: <T>() => Promise<{ results?: T[] }>;
    };
  };
};

type Env = { DB?: D1Like };

const MAX_BYTES = 25 * 1024 * 1024;

function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function ensureTable(db: D1Like): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS work_attachments (
        id TEXT PRIMARY KEY,
        item_kind TEXT NOT NULL,
        item_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        byte_size INTEGER NOT NULL,
        uploaded_by TEXT NOT NULL,
        uploaded_by_email TEXT NOT NULL DEFAULT '',
        uploaded_at TEXT NOT NULL,
        content_base64 TEXT NOT NULL
      )`,
    )
    .bind()
    .run();
  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_work_attachments_item ON work_attachments(item_kind, item_id)`,
    )
    .bind()
    .run();
}

export const onRequestOptions = async () => cors();

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  await ensureTable(db);

  const url = new URL(context.request.url);
  const id = url.searchParams.get('id')?.trim() || '';
  if (!id) return jsonResponse({ error: 'Attachment id is required.' }, 400);

  const row = await db
    .prepare(
      `SELECT id, file_name, mime_type, byte_size, uploaded_by, uploaded_by_email, uploaded_at, content_base64
       FROM work_attachments WHERE id = ?`,
    )
    .bind(id)
    .first<{
      id: string;
      file_name: string;
      mime_type: string;
      byte_size: number;
      uploaded_by: string;
      uploaded_by_email: string;
      uploaded_at: string;
      content_base64: string;
    }>();

  if (!row) return jsonResponse({ error: 'Attachment not found.' }, 404);

  const download = url.searchParams.get('download') === '1';
  if (download) {
    const binary = Uint8Array.from(atob(row.content_base64), (c) => c.charCodeAt(0));
    return new Response(binary, {
      status: 200,
      headers: {
        'Content-Type': row.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${row.file_name.replace(/"/g, '')}"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return jsonResponse({
    ok: true,
    attachment: {
      id: row.id,
      name: row.file_name,
      mimeType: row.mime_type,
      byteSize: row.byte_size,
      uploadedBy: row.uploaded_by,
      uploadedByEmail: row.uploaded_by_email || undefined,
      uploadedAt: row.uploaded_at,
      contentBase64: row.content_base64,
    },
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  await ensureTable(db);

  let body: {
    id?: string;
    itemKind?: string;
    itemId?: string;
    name?: string;
    mimeType?: string;
    byteSize?: number;
    uploadedBy?: string;
    uploadedByEmail?: string;
    contentBase64?: string;
  };
  try {
    body = (await context.request.json()) as typeof body;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const itemKind = String(body.itemKind || '').trim();
  const itemId = String(body.itemId || '').trim();
  const name = String(body.name || '').trim();
  const contentBase64 = String(body.contentBase64 || '').trim();
  const byteSize = Number(body.byteSize) || 0;
  if (itemKind !== 'task' && itemKind !== 'test') {
    return jsonResponse({ error: 'itemKind must be task or test.' }, 400);
  }
  if (!itemId || !name || !contentBase64) {
    return jsonResponse({ error: 'itemId, name, and contentBase64 are required.' }, 400);
  }
  if (byteSize <= 0 || byteSize > MAX_BYTES) {
    return jsonResponse({ error: `Attachments must be 25 MB or smaller.` }, 400);
  }

  const id = String(body.id || '').trim() || crypto.randomUUID();
  const uploadedAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO work_attachments (
        id, item_kind, item_id, file_name, mime_type, byte_size,
        uploaded_by, uploaded_by_email, uploaded_at, content_base64
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      itemKind,
      itemId,
      name,
      String(body.mimeType || 'application/octet-stream'),
      byteSize,
      String(body.uploadedBy || 'Unknown').trim() || 'Unknown',
      String(body.uploadedByEmail || '').trim().toLowerCase(),
      uploadedAt,
      contentBase64,
    )
    .run();

  return jsonResponse({
    ok: true,
    attachment: {
      id,
      name,
      mimeType: String(body.mimeType || 'application/octet-stream'),
      byteSize,
      uploadedBy: String(body.uploadedBy || 'Unknown').trim() || 'Unknown',
      uploadedByEmail: String(body.uploadedByEmail || '').trim().toLowerCase() || undefined,
      uploadedAt,
    },
  });
};

export const onRequestDelete = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  await ensureTable(db);

  let body: { id?: string };
  try {
    body = (await context.request.json()) as { id?: string };
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }
  const id = String(body.id || '').trim();
  if (!id) return jsonResponse({ error: 'Attachment id is required.' }, 400);
  await db.prepare(`DELETE FROM work_attachments WHERE id = ?`).bind(id).run();
  return jsonResponse({ ok: true });
};
