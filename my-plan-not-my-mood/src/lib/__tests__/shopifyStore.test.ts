import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  SHOPIFY_GEAR_API_PATH,
  SHOPIFY_HAT_COLLECTION_HANDLE,
  SHOPIFY_HOODIE_COLLECTION_HANDLE,
  SHOPIFY_HATS_CTA_LABEL,
  SHOPIFY_HOODIES_CTA_LABEL,
  SHOPIFY_STORE_ORIGIN,
  SHOPIFY_TEE_COLLECTION_HANDLE,
  SHOPIFY_TEES_API_PATH,
  SHOPIFY_TEES_CTA_LABEL,
  fetchShopifyGearCatalog,
  fetchShopifyTeeProducts,
  isPublishableStorefrontImage,
  parseShopifyCollectionProducts,
  parseShopifyGearSections,
  firstPublishableShopifyImage,
  shopifyCatalogProducts,
  shopifyCollectionProductsUrl,
  shopifyCollectionUrl,
  shopifyHatPageUrl,
  shopifyHoodiePageUrl,
  shopifyGearSitePath,
  shopifyProductUrl,
  shopifyTeePageUrl,
} from '../shopifyStore';

function productJson(title: string, handle: string, price: string) {
  return {
    products: [
      {
        id: handle,
        title,
        handle,
        variants: [{ price }],
        images: [{ src: `https://cdn.shopify.com/s/files/${handle}.jpg` }],
      },
    ],
  };
}

describe('shopifyStore', () => {
  it('builds Snatch Vault tee, hoodie, and hat collection URLs', () => {
    expect(SHOPIFY_STORE_ORIGIN).toBe('https://snatchvault.com');
    expect(SHOPIFY_TEE_COLLECTION_HANDLE).toBe('all-tees');
    expect(SHOPIFY_HOODIE_COLLECTION_HANDLE).toBe('my-plan-hoodie-collection');
    expect(SHOPIFY_HAT_COLLECTION_HANDLE).toBe('my-plan-sports-hat');
    expect(shopifyTeePageUrl()).toBe('https://snatchvault.com/collections/all-tees');
    expect(shopifyHoodiePageUrl()).toBe('https://snatchvault.com/collections/my-plan-hoodie-collection');
    expect(shopifyHatPageUrl()).toBe('https://snatchvault.com/collections/my-plan-sports-hat');
    expect(shopifyCollectionUrl('all-tees')).toBe('https://snatchvault.com/collections/all-tees');
    expect(shopifyProductUrl('unisex-softstyle-logo-tee')).toBe(
      'https://snatchvault.com/products/unisex-softstyle-logo-tee',
    );
    expect(shopifyCollectionProductsUrl()).toContain('/collections/all-tees/products.json');
    expect(SHOPIFY_GEAR_API_PATH).toBe('/api/shopify/gear');
    expect(SHOPIFY_TEES_API_PATH).toBe('/api/shopify/tees');
    expect(SHOPIFY_TEES_CTA_LABEL).toBe('Shop tees');
    expect(SHOPIFY_HOODIES_CTA_LABEL).toBe('Shop hoodies');
    expect(SHOPIFY_HATS_CTA_LABEL).toBe('Shop hats');
    expect(shopifyGearSitePath('hoodie')).toBe('/gear/hoodies');
    expect(shopifyGearSitePath('hat')).toBe('/gear/hats');
  });

  it('parses Shopify collection JSON and skips unpublished placeholders', () => {
    const products = parseShopifyCollectionProducts({
      products: [
        {
          id: 1,
          title: 'Unisex Softstyle Logo Tee *FREE SHIPPING*',
          handle: 'unisex-softstyle-logo-tee',
          variants: [{ price: '34.99' }],
          images: [{ src: 'https://cdn.shopify.com/s/files/logo-tee.jpg' }],
        },
        {
          id: 2,
          title: 'Draft tee do-not-publish',
          handle: 'draft-tee-do-not-publish',
          image: 'https://cdn.shopify.com/s/files/draft.jpg',
          variants: [{ price: '1.00' }],
        },
        { title: 'Missing handle' },
      ],
    });
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      title: 'Unisex Softstyle Logo Tee *FREE SHIPPING*',
      handle: 'unisex-softstyle-logo-tee',
      price: '34.99',
      url: 'https://snatchvault.com/products/unisex-softstyle-logo-tee',
    });
    expect(
      parseShopifyCollectionProducts({
        products: [
          {
            id: 'kept',
            title: 'My Plan Letter Tee',
            handle: 'my-plan-letter-tee',
            url: 'https://snatchvault.com/products/my-plan-letter-tee',
            price: '47.94',
            image: 'https://cdn.shopify.com/s/files/letter-tee.jpg',
          },
        ],
      })[0]?.price,
    ).toBe('47.94');
    expect(parseShopifyCollectionProducts(null)).toEqual([]);
    expect(isPublishableStorefrontImage('https://cdn.shopify.com/s/files/logo-tee.jpg')).toBe(true);
    expect(isPublishableStorefrontImage('/images/collection/logo-tee.jpg')).toBe(true);
    expect(isPublishableStorefrontImage('/images/apparel_tee_lifestyle.jpg')).toBe(false);
    expect(isPublishableStorefrontImage('/images/apparel_hoodie_mockup.jpg')).toBe(false);
    expect(isPublishableStorefrontImage('/images/planner_journal_mockup.jpg')).toBe(false);
    expect(isPublishableStorefrontImage('https://cdn.shopify.com/s/files/placeholder-do-not-publish.jpg')).toBe(false);
    expect(isPublishableStorefrontImage('')).toBe(false);
    expect(
      firstPublishableShopifyImage(
        'https://cdn.shopify.com/s/files/unisex-softstyle-t-shirt-placeholder-do-not-publish.jpg',
        { src: 'https://cdn.shopify.com/s/files/CrystalTieBlackTealFront.jpg' },
      ),
    ).toBe('https://cdn.shopify.com/s/files/CrystalTieBlackTealFront.jpg');
    expect(
      parseShopifyCollectionProducts({
        products: [
          {
            id: 3,
            title: 'Draft mock',
            handle: 'placeholder-tee',
            images: [{ src: 'https://cdn.shopify.com/s/files/ok.jpg' }],
            variants: [{ price: '1.00' }],
          },
          {
            id: 4,
            title: 'Real hoodie',
            handle: 'real-hoodie',
            images: [
              { src: 'https://cdn.shopify.com/s/files/unisex-hoodie-placeholder-do-not-publish.jpg' },
              { src: 'https://cdn.shopify.com/s/files/hoodie-front.jpg' },
            ],
            variants: [{ price: '57.19' }],
          },
        ],
      }),
    ).toEqual([
      {
        id: '4',
        title: 'Real hoodie',
        handle: 'real-hoodie',
        url: 'https://snatchvault.com/products/real-hoodie',
        price: '57.19',
        image: 'https://cdn.shopify.com/s/files/hoodie-front.jpg',
      },
    ]);
    const live = parseShopifyGearSections({
      sections: [
        { kind: 'tee', products: productJson('My Plan Tee', 'my-plan-tee', '34.99').products },
        { kind: 'hoodie', products: productJson('My Plan Unisex Hoodie', 'my-plan-hoodie', '57.19').products },
      ],
    });
    expect(shopifyCatalogProducts(live).map((row) => row.handle)).toEqual(['my-plan-tee', 'my-plan-hoodie']);
    expect(shopifyCatalogProducts(live, 'hoodie').map((row) => row.handle)).toEqual(['my-plan-hoodie']);
    const sections = parseShopifyGearSections({
      sections: [
        { kind: 'hoodie', products: productJson('My Plan Unisex Hoodie', 'my-plan-hoodie', '57.19').products },
        { kind: 'hat', products: productJson('My Plan Sports Hat', 'low-profile-baseball-cap', '34.72').products },
      ],
    });
    expect(sections.find((row) => row.kind === 'hoodie')?.products[0]?.handle).toBe('my-plan-hoodie');
    expect(sections.find((row) => row.kind === 'hat')?.products[0]?.price).toBe('34.72');
    expect(sections.find((row) => row.kind === 'tee')?.products).toEqual([]);
  });

  it('falls back to Shopify collection JSON when the site API is not deployed', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes(SHOPIFY_GEAR_API_PATH) || url.includes(SHOPIFY_TEES_API_PATH)) {
        return new Response('<!DOCTYPE html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
      }
      if (url.includes(`/collections/${SHOPIFY_HOODIE_COLLECTION_HANDLE}/products.json`)) {
        return new Response(JSON.stringify(productJson('My Plan Unisex Hoodie', 'my-plan-unisex-hoodie', '57.19')), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.includes(`/collections/${SHOPIFY_HAT_COLLECTION_HANDLE}/products.json`)) {
        return new Response(JSON.stringify(productJson('My Plan Sports Hat', 'low-profile-baseball-cap', '34.72')), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(productJson('Unisex Tie-Dye Pink Tee', 'unisex-tie-dye-pink-tee', '47.94')), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const catalog = await fetchShopifyGearCatalog();
    expect(catalog.ok).toBe(true);
    expect(catalog.sections.find((row) => row.kind === 'tee')?.products[0]?.handle).toBe('unisex-tie-dye-pink-tee');
    expect(catalog.sections.find((row) => row.kind === 'hoodie')?.products[0]?.handle).toBe('my-plan-unisex-hoodie');
    expect(catalog.sections.find((row) => row.kind === 'hat')?.products[0]?.handle).toBe('low-profile-baseball-cap');

    const tees = await fetchShopifyTeeProducts();
    expect(tees.ok).toBe(true);
    expect(tees.pageUrl).toBe('https://snatchvault.com/collections/all-tees');
    expect(tees.products[0]?.handle).toBe('unisex-tie-dye-pink-tee');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
