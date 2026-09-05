import { parseAgendaStorePayload } from '../../src/lib/agendaStore';
import { jsonResponse } from '../_shared/resend';

interface AgendaEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        first: <T>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
    };
  };
}

const STORE_ID = 'v1';

function agendaCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => agendaCors();

export const onRequestGet = async (context: { env: AgendaEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Agenda database is not configured' }, 503);
  }

  const row = await db
    .prepare('SELECT payload FROM agenda_store WHERE id = ?')
    .bind(STORE_ID)
    .first<{ payload: string }>();

  if (!row?.payload) {
    return jsonResponse({ ok: true, empty: true, meetings: {}, meta: null });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.payload);
  } catch {
    return jsonResponse({ ok: true, empty: true, meetings: {}, meta: null });
  }

  const payload = parseAgendaStorePayload(parsed);
  if (!payload) {
    return jsonResponse({ ok: true, empty: true, meetings: {}, meta: null });
  }

  return jsonResponse({ ok: true, ...payload });
};

export const onRequestPut = async (context: { request: Request; env: AgendaEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Agenda database is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const payload = parseAgendaStorePayload(body);
  if (!payload) {
    return jsonResponse({ error: 'Invalid agenda payload' }, 400);
  }

  await db
    .prepare(
      `INSERT INTO agenda_store (id, payload, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(STORE_ID, JSON.stringify(payload), payload.updatedAt, payload.updatedBy)
    .run();

  return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
};
