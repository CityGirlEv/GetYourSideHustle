import {
  parseHomePageCopyStorePayload,
  HOME_PAGE_COPY_STORE_ID,
} from '../../src/lib/homePageCopy';
import { jsonResponse } from '../_shared/resend';

interface HomePageEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        first: <T>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
    };
  };
}

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS home_page_copy_store (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
)`;

function homePageCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function ensureTable(db: NonNullable<HomePageEnv['DB']>): Promise<void> {
  await db.prepare(CREATE_TABLE_SQL).bind().run();
}

export const onRequestOptions = async () => homePageCors();

export const onRequest = async (context: { request: Request; env: HomePageEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return homePageCors();
  if (method === 'GET') return onRequestGet(context);
  if (method === 'PUT' || method === 'POST') return onRequestPut(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};

export const onRequestGet = async (context: { env: HomePageEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Home page copy database is not configured' }, 503);
  }

  await ensureTable(db);
  const row = await db
    .prepare('SELECT payload FROM home_page_copy_store WHERE id = ?')
    .bind(HOME_PAGE_COPY_STORE_ID)
    .first<{ payload: string }>();

  if (!row?.payload) {
    return jsonResponse({ ok: true, empty: true });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.payload);
  } catch {
    return jsonResponse({ ok: true, empty: true });
  }

  const payload = parseHomePageCopyStorePayload(parsed);
  if (!payload || payload.empty) {
    return jsonResponse({ ok: true, empty: true });
  }

  return jsonResponse({ ok: true, ...payload });
};

export const onRequestPut = async (context: { request: Request; env: HomePageEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Home page copy database is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const payload = parseHomePageCopyStorePayload(body);
  if (!payload || payload.empty) {
    return jsonResponse({ error: 'Invalid home page copy payload' }, 400);
  }

  await ensureTable(db);
  await db
    .prepare(
      `INSERT INTO home_page_copy_store (id, payload, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(HOME_PAGE_COPY_STORE_ID, JSON.stringify(payload), payload.updatedAt, payload.updatedBy)
    .run();

  return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
};

export const onRequestPost = async (context: { request: Request; env: HomePageEnv }) =>
  onRequestPut(context);
