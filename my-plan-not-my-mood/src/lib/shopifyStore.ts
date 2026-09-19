/**
 * Shopify storefront for MY PLAN, NOT MY MOOD gear.
 * Checkout stays on Snatch Vault; this site lists tees, hoodies, and hats.
 */

import { COLLECTION_PHOTOS_BY_HANDLE, collectionPhotoForHandle, isCollectionPhotoUrl } from './collectionPhotos';

export const SHOPIFY_STORE_ORIGIN = 'https://snatchvault.com';
export const SHOPIFY_GEAR_API_PATH = '/api/shopify/gear';
export const SHOPIFY_TEES_API_PATH = '/api/shopify/tees';
export const SHOPIFY_ALL_GEAR_COLLECTION_HANDLE = 'my-plan-gear';
export const SHOPIFY_TEE_COLLECTION_HANDLE = 'non-negotiables-letter-tees';
export const SHOPIFY_HOODIE_COLLECTION_HANDLE = 'my-plan-hoodie-collection';
export const SHOPIFY_HAT_COLLECTION_HANDLE = 'my-plan-sports-hat';
export const SHOPIFY_ALL_GEAR_PAGE_LABEL = 'All Gear';
export const SHOPIFY_TEE_PAGE_LABEL = 'Tee Collection';
export const SHOPIFY_HOODIE_PAGE_LABEL = 'Hoodies';
export const SHOPIFY_HAT_PAGE_LABEL = 'Hats';
export const SHOPIFY_ALL_GEAR_CTA_LABEL = 'Shop all gear';
export const SHOPIFY_TEES_CTA_LABEL = 'Shop tees';
export const SHOPIFY_HOODIES_CTA_LABEL = 'Shop hoodies';
export const SHOPIFY_HATS_CTA_LABEL = 'Shop hats';
export const SHOPIFY_BUY_LABEL = 'Buy';
export const SHOPIFY_TEES_EMPTY =
  'Tees, hoodies, and hats are sold on Shopify. Open a collection to pick a size and check out.';
export const SHOPIFY_GEAR_EMPTY = SHOPIFY_TEES_EMPTY;
export const SHOPIFY_GEAR_HUB_BLURB =
  'Open a collection to shop the live drop. Sizes, shipping, and checkout stay on the store.';
export type ShopifyGearKind = 'tee' | 'hoodie' | 'hat';
export type ShopifyPublicCollectionId = 'all' | ShopifyGearKind;

export const SHOPIFY_GEAR_SITE_PATHS: Record<ShopifyGearKind, string> = {
  tee: '/gear',
  hoodie: '/gear/hoodies',
  hat: '/gear/hats',
};

export function shopifyGearSitePath(kind: ShopifyGearKind): string {
  return SHOPIFY_GEAR_SITE_PATHS[kind] ?? SHOPIFY_GEAR_SITE_PATHS.tee;
}

export type ShopifyGearCollection = {
  kind: ShopifyGearKind;
  handle: string;
  label: string;
  heading: string;
  cta: string;
};

export type ShopifyPublicCollection = {
  id: ShopifyPublicCollectionId;
  handle: string;
  heading: string;
  label: string;
  cta: string;
  blurb: string;
  image: string;
  imageAlt: string;
};

export const SHOPIFY_PUBLIC_COLLECTIONS: ShopifyPublicCollection[] = [
  {
    id: 'all',
    handle: SHOPIFY_ALL_GEAR_COLLECTION_HANDLE,
    heading: SHOPIFY_ALL_GEAR_PAGE_LABEL,
    label: 'My Plan Gear',
    cta: SHOPIFY_ALL_GEAR_CTA_LABEL,
    blurb: 'The full drop — tees, hoodies, and hats in one collection.',
    image: COLLECTION_PHOTOS_BY_HANDLE['unisex-softstyle-logo-tee'],
    imageAlt: 'MY PLAN, NOT MY MOOD gear',
  },
  {
    id: 'hoodie',
    handle: SHOPIFY_HOODIE_COLLECTION_HANDLE,
    heading: SHOPIFY_HOODIE_PAGE_LABEL,
    label: 'My Plan Hoodie Collection',
    cta: SHOPIFY_HOODIES_CTA_LABEL,
    blurb: 'The heavy days still have to move. Shop the hoodie collection.',
    image: COLLECTION_PHOTOS_BY_HANDLE['my-plan-unisex-college-hoodie-6-colors'],
    imageAlt: 'MY PLAN, NOT MY MOOD hoodie',
  },
  {
    id: 'hat',
    handle: SHOPIFY_HAT_COLLECTION_HANDLE,
    heading: SHOPIFY_HAT_PAGE_LABEL,
    label: 'My Plan Sports Hat',
    cta: SHOPIFY_HATS_CTA_LABEL,
    blurb: 'A small reminder for a big decision. Shop the hat collection.',
    image: COLLECTION_PHOTOS_BY_HANDLE['low-profile-baseball-cap'],
    imageAlt: 'MY PLAN, NOT MY MOOD sports hat',
  },
  {
    id: 'tee',
    handle: SHOPIFY_TEE_COLLECTION_HANDLE,
    heading: SHOPIFY_TEE_PAGE_LABEL,
    label: 'Non-Negotiables Letter Tees',
    cta: SHOPIFY_TEES_CTA_LABEL,
    blurb: 'Letter tees you can wear when the plan has to win.',
    image: COLLECTION_PHOTOS_BY_HANDLE['unisex-softstyle-letters1-tee'],
    imageAlt: 'MY PLAN, NOT MY MOOD letter tee',
  },
];

export const SHOPIFY_GEAR_COLLECTIONS: ShopifyGearCollection[] = [
  {
    kind: 'tee',
    handle: SHOPIFY_TEE_COLLECTION_HANDLE,
    label: SHOPIFY_TEE_PAGE_LABEL,
    heading: 'Tees',
    cta: SHOPIFY_TEES_CTA_LABEL,
  },
  {
    kind: 'hoodie',
    handle: SHOPIFY_HOODIE_COLLECTION_HANDLE,
    label: SHOPIFY_HOODIE_PAGE_LABEL,
    heading: 'Hoodies',
    cta: SHOPIFY_HOODIES_CTA_LABEL,
  },
  {
    kind: 'hat',
    handle: SHOPIFY_HAT_COLLECTION_HANDLE,
    label: SHOPIFY_HAT_PAGE_LABEL,
    heading: 'Hats',
    cta: SHOPIFY_HATS_CTA_LABEL,
  },
];

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  url: string;
  price: string;
  image: string;
};

export type ShopifyTeeProduct = ShopifyProduct;

export type ShopifyGearSection = {
  kind: ShopifyGearKind;
  handle: string;
  label: string;
  heading: string;
  cta: string;
  pageUrl: string;
  products: ShopifyProduct[];
};

export function shopifyGearCollection(kind: ShopifyGearKind): ShopifyGearCollection {
  return SHOPIFY_GEAR_COLLECTIONS.find((row) => row.kind === kind) ?? SHOPIFY_GEAR_COLLECTIONS[0];
}

export function shopifyCollectionUrl(handle: string, origin = SHOPIFY_STORE_ORIGIN): string {
  const slug = String(handle ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  return `${origin.replace(/\/$/, '')}/collections/${slug || SHOPIFY_TEE_COLLECTION_HANDLE}`;
}

export function shopifyProductUrl(handle: string, origin = SHOPIFY_STORE_ORIGIN): string {
  const slug = String(handle ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  return `${origin.replace(/\/$/, '')}/products/${slug}`;
}

export const SHOPIFY_PUBLIC_HUB_COLLECTION_IDS: ShopifyPublicCollectionId[] = ['all', 'tee', 'hoodie', 'hat'];

export function shopifyPublicCollection(id: ShopifyPublicCollectionId): ShopifyPublicCollection {
  return SHOPIFY_PUBLIC_COLLECTIONS.find((row) => row.id === id) ?? SHOPIFY_PUBLIC_COLLECTIONS[0];
}

export function shopifyPublicHubCollections(): ShopifyPublicCollection[] {
  return SHOPIFY_PUBLIC_HUB_COLLECTION_IDS.map((id) => shopifyPublicCollection(id));
}

export const GEAR_HUB_JOURNAL_CTA_LABEL = 'Coming soon';
export type GearHubJournalPlaceholderId = '90day' | 'deskpad';
export type GearHubJournalPlaceholder = {
  id: GearHubJournalPlaceholderId;
  heading: string;
  blurb: string;
  cta: string;
};

export const GEAR_HUB_JOURNAL_PLACEHOLDERS: GearHubJournalPlaceholder[] = [
  {
    id: '90day',
    heading: '90-Day Journal',
    blurb: 'Follow-through journal with goal pages, weekly reviews, and daily execution. Placeholder until this drop is live.',
    cta: GEAR_HUB_JOURNAL_CTA_LABEL,
  },
  {
    id: 'deskpad',
    heading: 'Daily Desk Pad',
    blurb: 'Tear-off journal pad for top 3 non-negotiables and a What Won Today? check. Placeholder until this drop is live.',
    cta: GEAR_HUB_JOURNAL_CTA_LABEL,
  },
];

export function shopifyPublicCollectionUrl(
  id: ShopifyPublicCollectionId,
  origin = SHOPIFY_STORE_ORIGIN,
): string {
  return shopifyCollectionUrl(shopifyPublicCollection(id).handle, origin);
}

export function shopifyAllGearPageUrl(origin = SHOPIFY_STORE_ORIGIN): string {
  return shopifyPublicCollectionUrl('all', origin);
}

export function shopifyGearPageUrl(kind: ShopifyGearKind, origin = SHOPIFY_STORE_ORIGIN): string {
  return shopifyCollectionUrl(shopifyGearCollection(kind).handle, origin);
}

export function shopifyTeePageUrl(origin = SHOPIFY_STORE_ORIGIN): string {
  return shopifyGearPageUrl('tee', origin);
}

export function shopifyHoodiePageUrl(origin = SHOPIFY_STORE_ORIGIN): string {
  return shopifyGearPageUrl('hoodie', origin);
}

export function shopifyHatPageUrl(origin = SHOPIFY_STORE_ORIGIN): string {
  return shopifyGearPageUrl('hat', origin);
}

export function shopifyCollectionProductsUrl(
  handle = SHOPIFY_TEE_COLLECTION_HANDLE,
  origin = SHOPIFY_STORE_ORIGIN,
): string {
  return `${shopifyCollectionUrl(handle, origin)}/products.json?limit=50`;
}

function isPlaceholderProduct(title: string, handle: string): boolean {
  const blob = `${title} ${handle}`.toLowerCase();
  return blob.includes('do-not-publish') || blob.includes('placeholder');
}

export function isPublishableStorefrontImage(src: string): boolean {
  const value = String(src ?? '').trim();
  if (!value) return false;
  const blob = value.toLowerCase();
  if (
    blob.includes('placeholder') ||
    blob.includes('do-not-publish') ||
    blob.includes('mockup') ||
    blob.includes('apparel_tee_lifestyle') ||
    blob.includes('planner_journal')
  ) {
    return false;
  }
  if (isCollectionPhotoUrl(value)) return true;
  if (blob.startsWith('/images/')) return false;
  return /^(https?:)?\/\//i.test(value);
}

export function resolveStorefrontImage(handle: string, shopifyImage: string): string {
  if (isPublishableStorefrontImage(shopifyImage)) return shopifyImage.trim();
  return collectionPhotoForHandle(handle);
}

export function firstPublishableShopifyImage(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      if (isPublishableStorefrontImage(candidate)) return candidate.trim();
      continue;
    }
    if (Array.isArray(candidate)) {
      const nested = firstPublishableShopifyImage(...candidate);
      if (nested) return nested;
      continue;
    }
    if (candidate && typeof candidate === 'object') {
      const src = String((candidate as { src?: unknown }).src ?? '').trim();
      if (isPublishableStorefrontImage(src)) return src;
    }
  }
  return '';
}

export function shopifyCatalogProducts(
  sections: ShopifyGearSection[],
  kind: ShopifyGearKind | 'all' = 'all',
): Array<ShopifyProduct & { kind: ShopifyGearKind }> {
  const picked = kind === 'all' ? sections : sections.filter((section) => section.kind === kind);
  return picked.flatMap((section) =>
    section.products.map((product) => ({ ...product, kind: section.kind })),
  );
}

export function parseShopifyCollectionProducts(
  raw: unknown,
  origin = SHOPIFY_STORE_ORIGIN,
): ShopifyProduct[] {
  if (!raw || typeof raw !== 'object') return [];
  const list = Array.isArray((raw as { products?: unknown }).products)
    ? ((raw as { products: unknown[] }).products)
    : [];
  const out: ShopifyProduct[] = [];
  const seen = new Set<string>();
  for (const row of list) {
    if (!row || typeof row !== 'object') continue;
    const item = row as Record<string, unknown>;
    const handle = String(item.handle ?? '').trim();
    const title = String(item.title ?? '').trim();
    if (!handle || !title) continue;
    const variants = Array.isArray(item.variants) ? item.variants : [];
    const firstVariant = variants[0] && typeof variants[0] === 'object' ? (variants[0] as Record<string, unknown>) : {};
    const images = Array.isArray(item.images) ? item.images : [];
    const firstImage = images[0] && typeof images[0] === 'object' ? (images[0] as Record<string, unknown>) : {};
    if (isPlaceholderProduct(title, handle)) continue;
    const image = resolveStorefrontImage(
      handle,
      firstPublishableShopifyImage(item.image, firstImage.src, images),
    );
    const id = String(item.id ?? handle);
    if (seen.has(handle)) continue;
    seen.add(handle);
    out.push({
      id,
      title,
      handle,
      url: String(item.url ?? '').trim() || shopifyProductUrl(handle, origin),
      price: String(firstVariant.price ?? item.price ?? '').trim(),
      image,
    });
  }
  return out;
}

export function emptyShopifyGearSections(origin = SHOPIFY_STORE_ORIGIN): ShopifyGearSection[] {
  return SHOPIFY_GEAR_COLLECTIONS.map((collection) => ({
    ...collection,
    pageUrl: shopifyCollectionUrl(collection.handle, origin),
    products: [],
  }));
}

export function parseShopifyGearSections(raw: unknown, origin = SHOPIFY_STORE_ORIGIN): ShopifyGearSection[] {
  const defaults = emptyShopifyGearSections(origin);
  if (!raw || typeof raw !== 'object') return defaults;
  const incoming = Array.isArray((raw as { sections?: unknown }).sections)
    ? ((raw as { sections: unknown[] }).sections)
    : [];
  return defaults.map((fallback) => {
    const match = incoming.find((row) => {
      if (!row || typeof row !== 'object') return false;
      const kind = String((row as { kind?: unknown }).kind ?? '');
      const handle = String((row as { handle?: unknown }).handle ?? '');
      return kind === fallback.kind || handle === fallback.handle;
    }) as Record<string, unknown> | undefined;
    if (!match) return fallback;
    return {
      ...fallback,
      pageUrl: String(match.pageUrl ?? '').trim() || fallback.pageUrl,
      products: parseShopifyCollectionProducts({ products: match.products }),
    };
  });
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = String(response.headers.get('content-type') ?? '');
  if (contentType.includes('application/json')) return response.json().catch(() => null);
  const text = await response.text().catch(() => '');
  if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchShopifyCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const response = await fetch(shopifyCollectionProductsUrl(handle), { headers: { Accept: 'application/json' } });
  const raw = await readJson(response);
  return parseShopifyCollectionProducts(raw);
}

export async function fetchShopifyGearCatalog(): Promise<{
  ok: boolean;
  sections: ShopifyGearSection[];
}> {
  const fromApi = await (async () => {
    try {
      const response = await fetch(SHOPIFY_GEAR_API_PATH, { headers: { Accept: 'application/json' } });
      const data = await readJson(response);
      const sections = parseShopifyGearSections(data);
      const productCount = sections.reduce((sum, section) => sum + section.products.length, 0);
      const ok = response.ok && Boolean(data) && typeof data === 'object' && (data as { ok?: boolean }).ok === true;
      return { ok, sections, productCount };
    } catch {
      return { ok: false, sections: emptyShopifyGearSections(), productCount: 0 };
    }
  })();
  if (fromApi.ok && fromApi.productCount > 0) {
    return { ok: true, sections: fromApi.sections };
  }

  try {
    const sections = await Promise.all(
      SHOPIFY_GEAR_COLLECTIONS.map(async (collection) => ({
        ...collection,
        pageUrl: shopifyCollectionUrl(collection.handle),
        products: await fetchShopifyCollectionProducts(collection.handle),
      })),
    );
    const productCount = sections.reduce((sum, section) => sum + section.products.length, 0);
    if (productCount > 0) return { ok: true, sections };
  } catch {
    /* Shopify JSON is a fallback when /api/shopify/gear is not deployed yet. */
  }
  return { ok: fromApi.ok, sections: fromApi.sections };
}

export async function fetchShopifyTeeProducts(): Promise<{
  ok: boolean;
  products: ShopifyProduct[];
  pageUrl: string;
}> {
  const catalog = await fetchShopifyGearCatalog();
  const tees = catalog.sections.find((section) => section.kind === 'tee') ?? emptyShopifyGearSections()[0];
  return { ok: catalog.ok, products: tees.products, pageUrl: tees.pageUrl };
}
