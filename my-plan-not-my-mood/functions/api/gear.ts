import { jsonResponse } from '../_shared/resend';
import { persistAngelaPickMeta } from '../../src/lib/gearSelections';
import { GEAR_STORE_ID, parseGearStorePayload } from '../../src/lib/gearStore';

interface D1Statement {
  bind: (...values: unknown[]) => {
    first: <T>() => Promise<T | null>;
    all: <T>() => Promise<{ results?: T[] }>;
    run: () => Promise<unknown>;
  };
}

interface GearEnv {
  DB?: {
    prepare: (query: string) => D1Statement;
  };
}

type GearRow = {
  id: string;
  category: string;
  style: string;
  family_id: string;
  family_label: string;
  name: string;
  relative_path: string;
  data_url: string;
  uploaded_at: string;
  uploaded_by: string;
};

type MetaRow = {
  picks: string;
  source_folder_path: string;
  updated_at: string;
  updated_by: string | null;
};

function gearCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => gearCors();

export const onRequest = async (context: { request: Request; env: GearEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return gearCors();
  if (method === 'GET') return onRequestGet(context);
  if (method === 'PUT' || method === 'POST') return onRequestPut(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};

export const onRequestPost = async (context: { request: Request; env: GearEnv }) => onRequestPut(context);

export const onRequestGet = async (context: { env: GearEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Gear database is not configured' }, 503);
  }

  const meta = await db
    .prepare('SELECT picks, source_folder_path, updated_at, updated_by FROM gear_selections_meta WHERE id = ?')
    .bind(GEAR_STORE_ID)
    .first<MetaRow>();
  const rows = await db
    .prepare(
      'SELECT id, category, style, family_id, family_label, name, relative_path, data_url, uploaded_at, uploaded_by FROM gear_selections',
    )
    .all<GearRow>();
  const mockups = (rows.results ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    style: row.style,
    familyId: row.family_id,
    familyLabel: row.family_label,
    name: row.name,
    relativePath: row.relative_path,
    dataUrl: row.data_url,
    uploadedAt: row.uploaded_at,
    uploadedBy: row.uploaded_by,
  }));
  let picks: unknown = [];
  let hatColorIds: unknown = [];
  let shirtHoodieBrandIds: unknown = [];
  let familyOrder: unknown = [];
  if (meta?.picks) {
    try {
      const parsed = JSON.parse(meta.picks) as unknown;
      if (Array.isArray(parsed)) picks = parsed;
      else if (parsed && typeof parsed === 'object') {
        const data = parsed as {
          cards?: unknown;
          hatColorIds?: unknown;
          shirtHoodieBrandIds?: unknown;
          familyOrder?: unknown;
          picks?: unknown;
        };
        picks = data.cards ?? data.picks ?? [];
        hatColorIds = data.hatColorIds ?? [];
        shirtHoodieBrandIds = data.shirtHoodieBrandIds ?? [];
        familyOrder = data.familyOrder ?? [];
      }
    } catch {
      picks = [];
    }
  }

  if (!meta && mockups.length === 0) {
    return jsonResponse({ ok: true, empty: true });
  }

  return jsonResponse({
    ok: true,
    store: {
      mockups,
      picks,
      hatColorIds,
      shirtHoodieBrandIds,
      familyOrder,
      sourceFolderPath: meta?.source_folder_path ?? '',
    },
    updatedAt: meta?.updated_at ?? '',
    updatedBy: meta?.updated_by ?? null,
  });
};

export const onRequestPut = async (context: { request: Request; env: GearEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Gear database is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const payload = parseGearStorePayload(body);
  if (!payload) {
    return jsonResponse({ error: 'Invalid gear payload' }, 400);
  }

  await db.prepare('DELETE FROM gear_selections WHERE 1 = ?').bind(1).run();
  for (const item of payload.store.mockups) {
    await db
      .prepare(
        `INSERT INTO gear_selections (id, category, style, family_id, family_label, name, relative_path, data_url, uploaded_at, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        item.id,
        item.category,
        item.style,
        item.familyId,
        item.familyLabel,
        item.name,
        item.relativePath,
        item.dataUrl ?? '',
        item.uploadedAt,
        item.uploadedBy,
      )
      .run();
  }

  await db
    .prepare(
      `INSERT INTO gear_selections_meta (id, picks, source_folder_path, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         picks = excluded.picks,
         source_folder_path = excluded.source_folder_path,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(
      GEAR_STORE_ID,
      JSON.stringify(persistAngelaPickMeta(payload.store)),
      payload.store.sourceFolderPath,
      payload.updatedAt,
      payload.updatedBy,
    )
    .run();

  return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
};
