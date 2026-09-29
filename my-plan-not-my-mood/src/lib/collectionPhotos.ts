import { cacheBustPublicUrl } from './spaAssets';

/** On-garment collection photos — Shopify Printify files are named *-placeholder-do-not-publish*. */
export const COLLECTION_PHOTO_DIR = '/images/collection';

export const COLLECTION_PHOTOS_BY_HANDLE: Record<string, string> = {
  'unisex-softstyle-logo-tee': `${COLLECTION_PHOTO_DIR}/logo-tee.jpg`,
  'unisex-softstyle-letters1-tee': `${COLLECTION_PHOTO_DIR}/letters1-tee.jpg`,
  'unisex-softstyle-letters2-tee': `${COLLECTION_PHOTO_DIR}/letters2-tee.jpg`,
  'unisex-softstyle-letters-tee': `${COLLECTION_PHOTO_DIR}/checkbox-tee.jpg`,
  'unisex-softstyle-frame-gold-tee': `${COLLECTION_PHOTO_DIR}/gold-frame-tee.jpg`,
  'unisex-softstyle-black-frame-tee-copy': `${COLLECTION_PHOTO_DIR}/black-frame-tee.jpg`,
  'unisex-softstyle-t-shirt': `${COLLECTION_PHOTO_DIR}/letters2-tee.jpg`,
  'unisex-crystal-tie-dye-tee': `${COLLECTION_PHOTO_DIR}/crystal-planet-earth.jpg`,
  'unisex-crystal-tie-dye-black-teal-tee': `${COLLECTION_PHOTO_DIR}/crystal-black-teal.jpg`,
  'unisex-crystal-tie-dye-teal-tee': `${COLLECTION_PHOTO_DIR}/crystal-teal.jpg`,
  'unisex-crystal-tie-dye-lemon-lime-tee': `${COLLECTION_PHOTO_DIR}/crystal-lemon-lime.jpg`,
  'tie-dye-tee-pink': `${COLLECTION_PHOTO_DIR}/tie-dye-mint.jpg`,
  'tie-dye-tee-coral-yellow-blue': `${COLLECTION_PHOTO_DIR}/tie-dye-yellow.jpg`,
  'tie-dye-tee-coral': `${COLLECTION_PHOTO_DIR}/tie-dye-yellow.jpg`,
  'tie-dye-tee-cyclone': `${COLLECTION_PHOTO_DIR}/tie-dye-cyclone.jpg`,
  'my-plan-unisex-college-hoodie-6-colors': `${COLLECTION_PHOTO_DIR}/hoodie-green.jpg`,
  'unisex-college-hoodie-r-w-g': `${COLLECTION_PHOTO_DIR}/hoodie-white.jpg`,
  'low-profile-baseball-cap': `${COLLECTION_PHOTO_DIR}/hat-red.jpg`,
};

export function collectionPhotoForHandle(handle: string): string {
  const src = COLLECTION_PHOTOS_BY_HANDLE[String(handle ?? '').trim()] ?? '';
  return src ? cacheBustPublicUrl(src) : '';
}

export function isCollectionPhotoUrl(src: string): boolean {
  const path = String(src ?? '').trim().toLowerCase().split('?')[0];
  return path.startsWith(`${COLLECTION_PHOTO_DIR}/`);
}
