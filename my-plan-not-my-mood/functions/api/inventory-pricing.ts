import {
  parseInventoryPricingStorePayload,
  INVENTORY_PRICING_STORE_ID,
} from '../../src/lib/inventoryPricingStore';
import { jsonResponse } from '../_shared/resend';

interface InventoryPricingEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        first: <T>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
    };
  };
}

function inventoryPricingCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => inventoryPricingCors();

export const onRequest = async (context: { request: Request; env: InventoryPricingEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return inventoryPricingCors();
  if (method === 'GET') return onRequestGet(context);
  if (method === 'PUT' || method === 'POST') return onRequestPut(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};

export const onRequestGet = async (context: { env: InventoryPricingEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Inventory pricing database is not configured' }, 503);
  }

  const row = await db
    .prepare('SELECT payload FROM inventory_pricing_store WHERE id = ?')
    .bind(INVENTORY_PRICING_STORE_ID)
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

  const payload = parseInventoryPricingStorePayload(parsed);
  if (!payload) {
    return jsonResponse({ ok: true, empty: true, items: [] });
  }

  return jsonResponse({ ok: true, ...payload });
};

export const onRequestPut = async (context: { request: Request; env: InventoryPricingEnv }) => {
  const db = context.env.DB;
  if (!db) {
    return jsonResponse({ error: 'Inventory pricing database is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const payload = parseInventoryPricingStorePayload(body);
  if (!payload) {
    return jsonResponse({ error: 'Invalid inventory pricing payload' }, 400);
  }

  await db
    .prepare(
      `INSERT INTO inventory_pricing_store (id, payload, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(INVENTORY_PRICING_STORE_ID, JSON.stringify(payload), payload.updatedAt, payload.updatedBy)
    .run();

  return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
};

export const onRequestPost = async (context: { request: Request; env: InventoryPricingEnv }) =>
  onRequestPut(context);
