import { HERO_CAROUSEL_SEED_FILES, sanitizeHeroCarouselFileName } from './heroCarousel';
import { shopifyGearSitePath, type ShopifyGearKind, type ShopifyPublicCollectionId } from './shopifyStore';

export const GEAR_PRODUCT_ANCHOR_PREFIX = 'product-';

export type CarouselGearTarget = {
  handle: string;
  kind: ShopifyGearKind;
};

export const CAROUSEL_GEAR_FALLBACK: CarouselGearTarget[] = [
  { handle: 'unisex-softstyle-logo-tee', kind: 'tee' },
  { handle: 'unisex-softstyle-letters1-tee', kind: 'tee' },
  { handle: 'unisex-softstyle-letters2-tee', kind: 'tee' },
  { handle: 'unisex-softstyle-letters-tee', kind: 'tee' },
  { handle: 'unisex-softstyle-frame-gold-tee', kind: 'tee' },
  { handle: 'unisex-softstyle-black-frame-tee-copy', kind: 'tee' },
  { handle: 'unisex-crystal-tie-dye-black-teal-tee', kind: 'tee' },
  { handle: 'unisex-crystal-tie-dye-teal-tee', kind: 'tee' },
  { handle: 'unisex-crystal-tie-dye-lemon-lime-tee', kind: 'tee' },
  { handle: 'tie-dye-tee-pink', kind: 'tee' },
  { handle: 'tie-dye-tee-cyclone', kind: 'tee' },
  { handle: 'my-plan-unisex-college-hoodie-6-colors', kind: 'hoodie' },
  { handle: 'unisex-college-hoodie-r-w-g', kind: 'hoodie' },
  { handle: 'low-profile-baseball-cap', kind: 'hat' },
];

/** Lifestyle shots mapped to the garment they show. */
export const CAROUSEL_GEAR_BY_FILE: Record<string, CarouselGearTarget> = {
  'angela-white-tee.jpg': { handle: 'unisex-softstyle-logo-tee', kind: 'tee' },
  'angela-white-hoodie-hat.jpg': { handle: 'my-plan-unisex-college-hoodie-6-colors', kind: 'hoodie' },
  'angela-red-hoodie.jpg': { handle: 'unisex-college-hoodie-r-w-g', kind: 'hoodie' },
  '15036882-90f2-4929-9fea-7c2366c1dd32.png': { handle: 'unisex-softstyle-letters-tee', kind: 'tee' },
  '97437ca6-d5a1-44c5-b1a3-58e650cd01e1.png': { handle: 'unisex-softstyle-frame-gold-tee', kind: 'tee' },
  '8e015e7f-a738-4b73-b3b0-2c8e00d95271.png': { handle: 'unisex-softstyle-letters-tee', kind: 'tee' },
  '503cc767-f6a9-4634-a9cf-a28e18017517.png': { handle: 'unisex-softstyle-letters-tee', kind: 'tee' },
  'fda4abd2-e1a7-4c8f-9f3b-742bed874382.png': { handle: 'tie-dye-tee-cyclone', kind: 'tee' },
  '3b65f0f7-6a9b-4070-af21-9741426c44d2.png': { handle: 'tie-dye-tee-pink', kind: 'tee' },
  'c524b163-2b60-4ffa-bd51-82bb51af906c.png': { handle: 'unisex-crystal-tie-dye-teal-tee', kind: 'tee' },
  '40cf885d-a0b5-42ae-be90-8bd98726aaf6.png': { handle: 'unisex-softstyle-frame-gold-tee', kind: 'tee' },
  '5fbc5987-55bd-40f0-a416-5d78555cf8e2.png': { handle: 'unisex-college-hoodie-r-w-g', kind: 'hoodie' },
  '8d232d56-0cbe-4fbe-8a84-8f37e3739105.png': { handle: 'my-plan-unisex-college-hoodie-6-colors', kind: 'hoodie' },
};

export function gearProductAnchorId(handle: string): string {
  return `${GEAR_PRODUCT_ANCHOR_PREFIX}${String(handle ?? '').trim()}`;
}

export function parseGearKindFromPath(pathname: string): ShopifyPublicCollectionId {
  const path = String(pathname ?? '').split('?')[0].split('#')[0];
  if (path.includes('/hoodies')) return 'hoodie';
  if (path.includes('/hats')) return 'hat';
  if (path.includes('/tees')) return 'tee';
  return 'all';
}

export function parseGearProductHandle(hash: string): string {
  const raw = String(hash ?? '').replace(/^#/, '').trim();
  if (!raw.startsWith(GEAR_PRODUCT_ANCHOR_PREFIX)) return '';
  return raw.slice(GEAR_PRODUCT_ANCHOR_PREFIX.length);
}

export function gearKindForHandle(handle: string): ShopifyGearKind {
  const blob = String(handle ?? '').toLowerCase();
  if (blob.includes('hoodie')) return 'hoodie';
  if (blob.includes('hat') || blob.includes('cap')) return 'hat';
  return 'tee';
}

export function gearProductPath(target: CarouselGearTarget): string {
  return `${shopifyGearSitePath(target.kind)}#${gearProductAnchorId(target.handle)}`;
}

export function carouselGearTargetForSlide(name: string): CarouselGearTarget {
  const file = sanitizeHeroCarouselFileName(name);
  if (CAROUSEL_GEAR_BY_FILE[file]) return CAROUSEL_GEAR_BY_FILE[file];
  const seedIndex = HERO_CAROUSEL_SEED_FILES.findIndex(
    (seed) => sanitizeHeroCarouselFileName(seed) === file,
  );
  const index = seedIndex >= 0 ? seedIndex : 0;
  return CAROUSEL_GEAR_FALLBACK[index % CAROUSEL_GEAR_FALLBACK.length];
}
