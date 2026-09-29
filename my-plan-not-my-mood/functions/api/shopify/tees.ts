import { jsonResponse } from '../../_shared/resend';
import {
  parseShopifyCollectionProducts,
  shopifyCollectionProductsUrl,
  shopifyTeePageUrl,
} from '../../../src/lib/shopifyStore';

function shopifyCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => shopifyCors();

export const onRequestGet = async () => {
  const pageUrl = shopifyTeePageUrl();
  try {
    const response = await fetch(shopifyCollectionProductsUrl(), {
      headers: { Accept: 'application/json' },
    });
    const raw = await response.json().catch(() => null);
    const products = parseShopifyCollectionProducts(raw);
    if (!response.ok) {
      return jsonResponse({ ok: false, pageUrl, products, error: 'Shopify tee collection is unavailable' }, 502);
    }
    return jsonResponse({ ok: true, pageUrl, products });
  } catch {
    return jsonResponse({ ok: false, pageUrl, products: [], error: 'Could not reach the Shopify tee page' }, 502);
  }
};

export const onRequest = async (context: { request: Request }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return shopifyCors();
  if (method === 'GET') return onRequestGet();
  return jsonResponse({ error: 'Method not allowed' }, 405);
};
