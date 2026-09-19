import {
  parseBetaTestingGuideStorePayload,
  BETA_TESTING_GUIDE_STORE_ID,
} from '../../src/lib/betaTestingGuideStore';
import { jsonResponse } from '../_shared/resend';

interface BetaTestingGuideEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        first: <T>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
    };
  };
}

function betaTestingGuideCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => betaTestingGuideCors();

export const onRequest = async (context: { request: Request; env: BetaTestingGuideEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return betaTestingGuideCors();
  if (method === 'GET') return onRequestGet(context);
  if (method === 'PUT' || method === 'POST') return onRequestPut(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};

export const onRequestGet = async (context: { env: BetaTestingGuideEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Beta testing guide database is not configured' }, 503);
  }

  const row = await db
    .prepare('SELECT payload FROM beta_testing_guide_store WHERE id = ?')
    .bind(BETA_TESTING_GUIDE_STORE_ID)
    .first<{ payload: string }>();

  if (!row?.payload) {
    return jsonResponse({ ok: true, empty: true, items: [] });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.payload);
  } catch {
    return jsonResponse({ ok: true, empty: true, items: [] });
  }

  const payload = parseBetaTestingGuideStorePayload(parsed);
  if (!payload) {
    return jsonResponse({ ok: true, empty: true, items: [] });
  }

  return jsonResponse({ ok: true, ...payload });
};

export const onRequestPut = async (context: { request: Request; env: BetaTestingGuideEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Beta testing guide database is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const payload = parseBetaTestingGuideStorePayload(body);
  if (!payload) {
    return jsonResponse({ error: 'Invalid beta testing guide payload' }, 400);
  }

  await db
    .prepare(
      `INSERT INTO beta_testing_guide_store (id, payload, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(BETA_TESTING_GUIDE_STORE_ID, JSON.stringify(payload), payload.updatedAt, payload.updatedBy)
    .run();

  return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
};

export const onRequestPost = async (context: { request: Request; env: BetaTestingGuideEnv }) =>
  onRequestPut(context);
