import {
  mergeWorkBoardPayloads,
  parseWorkBoardStorePayload,
  WORKBOARD_STORE_ID,
} from '../../src/lib/workBoardStore';
import { jsonResponse } from '../_shared/resend';

interface WorkBoardEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        first: <T>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
    };
  };
}

function workBoardCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => workBoardCors();

export const onRequest = async (context: { request: Request; env: WorkBoardEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return workBoardCors();
  if (method === 'GET') return onRequestGet(context);
  if (method === 'PUT' || method === 'POST') return onRequestPut(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};

export const onRequestGet = async (context: { env: WorkBoardEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Work board database is not configured' }, 503);
  }

  const row = await db
    .prepare('SELECT payload FROM work_board_store WHERE id = ?')
    .bind(WORKBOARD_STORE_ID)
    .first<{ payload: string }>();

  if (!row?.payload) {
    return jsonResponse({ ok: true, empty: true, tasks: [], tests: [] });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.payload);
  } catch {
    return jsonResponse({ ok: true, empty: true, tasks: [], tests: [] });
  }

  const payload = parseWorkBoardStorePayload(parsed);
  if (!payload) {
    return jsonResponse({ ok: true, empty: true, tasks: [], tests: [] });
  }

  return jsonResponse({ ok: true, ...payload });
};

export const onRequestPut = async (context: { request: Request; env: WorkBoardEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Work board database is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const incoming = parseWorkBoardStorePayload(body);
  if (!incoming) {
    return jsonResponse({ error: 'Invalid work board payload' }, 400);
  }

  const row = await db
    .prepare('SELECT payload FROM work_board_store WHERE id = ?')
    .bind(WORKBOARD_STORE_ID)
    .first<{ payload: string }>();

  let existing: ReturnType<typeof parseWorkBoardStorePayload> = null;
  if (row?.payload) {
    try {
      existing = parseWorkBoardStorePayload(JSON.parse(row.payload));
    } catch {
      existing = null;
    }
  }

  const payload = mergeWorkBoardPayloads(existing, incoming);

  await db
    .prepare(
      `INSERT INTO work_board_store (id, payload, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(WORKBOARD_STORE_ID, JSON.stringify(payload), payload.updatedAt, payload.updatedBy)
    .run();

  return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
};

export const onRequestPost = async (context: { request: Request; env: WorkBoardEnv }) =>
  onRequestPut(context);
