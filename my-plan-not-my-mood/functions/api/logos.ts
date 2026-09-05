import { jsonResponse } from '../_shared/resend';
import { LOGO_STORE_ID, parseLogoStorePayload } from '../../src/lib/logoStore';

interface D1Statement {
  bind: (...values: unknown[]) => {
    first: <T>() => Promise<T | null>;
    all: <T>() => Promise<{ results?: T[] }>;
    run: () => Promise<unknown>;
  };
}

interface LogoEnv {
  DB?: {
    prepare: (query: string) => D1Statement;
    batch?: (statements: unknown[]) => Promise<unknown>;
  };
}

type LogoRow = {
  id: string;
  name: string;
  kind: string;
  notes: string;
  relative_path: string;
  data_url: string;
  uploaded_at: string;
  uploaded_by: string;
};

type MetaRow = {
  chosen_id: string | null;
  source_folder_path: string;
  updated_at: string;
  updated_by: string | null;
};

function logoCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => logoCors();

export const onRequest = async (context: { request: Request; env: LogoEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return logoCors();
  if (method === 'GET') return onRequestGet(context);
  if (method === 'PUT' || method === 'POST') return onRequestPut(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};

export const onRequestPost = async (context: { request: Request; env: LogoEnv }) => onRequestPut(context);

export const onRequestGet = async (context: { env: LogoEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Logo database is not configured' }, 503);
  }

  const meta = await db
    .prepare('SELECT chosen_id, source_folder_path, updated_at, updated_by FROM logo_concepts_meta WHERE id = ?')
    .bind(LOGO_STORE_ID)
    .first<MetaRow>();
  const rows = await db.prepare('SELECT id, name, kind, notes, relative_path, data_url, uploaded_at, uploaded_by FROM logo_concepts').all<LogoRow>();
  const concepts = (rows.results ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    notes: row.notes,
    relativePath: row.relative_path,
    dataUrl: row.data_url,
    uploadedAt: row.uploaded_at,
    uploadedBy: row.uploaded_by,
  }));

  if (!meta && concepts.length === 0) {
    return jsonResponse({ ok: true, empty: true });
  }

  return jsonResponse({
    ok: true,
    store: {
      concepts,
      chosenId: meta?.chosen_id ?? null,
      sourceFolderPath: meta?.source_folder_path ?? '',
    },
    updatedAt: meta?.updated_at ?? '',
    updatedBy: meta?.updated_by ?? null,
  });
};

export const onRequestPut = async (context: { request: Request; env: LogoEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Logo database is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const payload = parseLogoStorePayload(body);
  if (!payload) {
    return jsonResponse({ error: 'Invalid logo payload' }, 400);
  }

  await db.prepare('DELETE FROM logo_concepts WHERE 1 = ?').bind(1).run();
  for (const item of payload.store.concepts) {
    await db
      .prepare(
        `INSERT INTO logo_concepts (id, name, kind, notes, relative_path, data_url, uploaded_at, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        item.id,
        item.name,
        item.kind,
        item.notes,
        item.relativePath,
        item.dataUrl ?? '',
        item.uploadedAt,
        item.uploadedBy,
      )
      .run();
  }

  await db
    .prepare(
      `INSERT INTO logo_concepts_meta (id, chosen_id, source_folder_path, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         chosen_id = excluded.chosen_id,
         source_folder_path = excluded.source_folder_path,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(
      LOGO_STORE_ID,
      payload.store.chosenId,
      payload.store.sourceFolderPath,
      payload.updatedAt,
      payload.updatedBy,
    )
    .run();

  return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
};
