import { jsonResponse } from '../../_shared/resend';
import {
  SHOPIFY_GEAR_COLLECTIONS,
  parseShopifyCollectionProducts,
  shopifyCollectionProductsUrl,
  shopifyCollectionUrl,
  type ShopifyGearSection,
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

async function loadGearSections(): Promise<ShopifyGearSection[]> {
  return Promise.all(
    SHOPIFY_GEAR_COLLECTIONS.map(async (collection) => {
      const pageUrl = shopifyCollectionUrl(collection.handle);
      try {
        const response = await fetch(shopifyCollectionProductsUrl(collection.handle), {
          headers: { Accept: 'application/json' },
        });
        const raw = await response.json().catch(() => null);
        return {
          ...collection,
          pageUrl,
          products: parseShopifyCollectionProducts(raw),
        };
      } catch {
        return { ...collection, pageUrl, products: [] };
      }
    }),
  );
}

export const onRequestOptions = async () => shopifyCors();

export const onRequestGet = async () => {
  try {
    const sections = await loadGearSections();
    const productCount = sections.reduce((sum, section) => sum + section.products.length, 0);
    if (productCount === 0) {
      return jsonResponse({ ok: false, sections, error: 'Shopify gear collections are unavailable' }, 502);
    }
    return jsonResponse({ ok: true, sections });
  } catch {
    return jsonResponse({ ok: false, sections: [], error: 'Could not reach the Shopify gear pages' }, 502);
  }
};

export const onRequest = async (context: { request: Request }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return shopifyCors();
  if (method === 'GET') return onRequestGet();
  return jsonResponse({ error: 'Method not allowed' }, 405);
};
