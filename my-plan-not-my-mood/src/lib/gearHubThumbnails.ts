import { deleteUploadBlob, getUploadBlob, newUploadId, putUploadBlob } from './idbFileStore';
import { fileExtension } from './localFolder';
import { MAX_UPLOAD_BYTES, folderFileTooLargeReason } from './uploadLimits';
import { getRolePermissions, type UserOrRoleInput } from './userAuth';
import type { GearHubJournalPlaceholderId, ShopifyPublicCollectionId } from './shopifyStore';

export const GEAR_HUB_THUMBNAIL_STORAGE_KEY = 'myplan_gear_hub_thumbs_v1';
export const GEAR_HUB_THUMBNAIL_UPLOAD_LABEL = 'Add photo';
export const GEAR_HUB_THUMBNAIL_REMOVE_LABEL = 'Remove photo';
export const GEAR_HUB_THUMBNAIL_CLEAR_LABEL = 'Use default';
export const GEAR_HUB_THUMBNAIL_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
export const GEAR_HUB_CAROUSEL_MAX_SLIDES = 12;
export const GEAR_HUB_CAROUSEL_INTERVAL_MS = 5000;
export const GEAR_HUB_CAROUSEL_PUBLIC_DIR = '/images/gear-hub';
export const GEAR_HUB_SOURCE_FOLDER = 'C:\\Documents\\AngelaHarris\\MyPlanNotMood\\Images';

const HERO_DIR = '/images/hero-carousel';
const COLLECTION_DIR = '/images/collection';

/** Local WebsiteSS / mockup photos copied into public so each collection card has a carousel. */
export const GEAR_HUB_SEED_FILES: Record<GearHubThumbnailSlot, readonly string[]> = {
  all: [
    `${HERO_DIR}/angela-white-hoodie-hat.jpg`,
    `${HERO_DIR}/angela-white-tee.jpg`,
    `${HERO_DIR}/angela-red-hoodie.jpg`,
    `${COLLECTION_DIR}/logo-tee.jpg`,
    `${COLLECTION_DIR}/hoodie-green.jpg`,
    `${COLLECTION_DIR}/hat-red.jpg`,
    `${COLLECTION_DIR}/letters1-tee.jpg`,
  ],
  tee: [
    `${HERO_DIR}/angela-white-tee.jpg`,
    `${COLLECTION_DIR}/logo-tee.jpg`,
    `${COLLECTION_DIR}/letters1-tee.jpg`,
    `${COLLECTION_DIR}/letters2-tee.jpg`,
    `${COLLECTION_DIR}/checkbox-tee.jpg`,
    `${COLLECTION_DIR}/gold-frame-tee.jpg`,
    `${COLLECTION_DIR}/black-frame-tee.jpg`,
  ],
  hoodie: [
    `${HERO_DIR}/angela-white-hoodie-hat.jpg`,
    `${HERO_DIR}/angela-red-hoodie.jpg`,
    `${COLLECTION_DIR}/hoodie-green.jpg`,
    `${COLLECTION_DIR}/hoodie-white.jpg`,
    `${GEAR_HUB_CAROUSEL_PUBLIC_DIR}/hoodie-lifestyle.png`,
    `${GEAR_HUB_CAROUSEL_PUBLIC_DIR}/hoodie-lifestyle-2.png`,
  ],
  hat: [
    `${HERO_DIR}/angela-white-hoodie-hat.jpg`,
    `${COLLECTION_DIR}/hat-red.jpg`,
    `${GEAR_HUB_CAROUSEL_PUBLIC_DIR}/hat-white.png`,
    `${GEAR_HUB_CAROUSEL_PUBLIC_DIR}/hat-black.png`,
    `${GEAR_HUB_CAROUSEL_PUBLIC_DIR}/hat-blue.png`,
    `${GEAR_HUB_CAROUSEL_PUBLIC_DIR}/hat-purple.png`,
    `${GEAR_HUB_CAROUSEL_PUBLIC_DIR}/hat-lifestyle.png`,
  ],
  '90day': ['/images/planner_journal_mockup.jpg'],
  deskpad: ['/images/planner_journal_mockup.jpg'],
};

export type GearHubThumbnailSlot = ShopifyPublicCollectionId | GearHubJournalPlaceholderId;

export const GEAR_HUB_THUMBNAIL_SLOTS: GearHubThumbnailSlot[] = [
  'all',
  'tee',
  'hoodie',
  'hat',
  '90day',
  'deskpad',
];

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);

export type GearHubCarouselSlide = {
  id: string;
  slot: GearHubThumbnailSlot;
  name: string;
  blobId: string;
  src?: string;
};

export type GearHubThumbnail = GearHubCarouselSlide;

export type GearHubThumbnailStore = {
  slides: GearHubCarouselSlide[];
  removedSeedIds: string[];
};

export type GearHubVisibleSlide = {
  id: string;
  src: string;
  alt: string;
  uploaded: boolean;
};

export function canManageGearHubThumbnails(user?: UserOrRoleInput): boolean {
  return getRolePermissions(user).canManageContentFactory;
}

export function isGearHubThumbnailSlot(value: unknown): value is GearHubThumbnailSlot {
  return typeof value === 'string' && GEAR_HUB_THUMBNAIL_SLOTS.includes(value as GearHubThumbnailSlot);
}

export function sanitizeGearHubThumbnailFileName(name: string): string {
  const base = String(name ?? '')
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .pop() ?? '';
  return base.replace(/[^\w.\-]+/g, '-').replace(/-+\./g, '.').toLowerCase();
}

export function isGearHubThumbnailImageName(name: string): boolean {
  const file = sanitizeGearHubThumbnailFileName(name);
  return IMAGE_EXT.has(fileExtension(file));
}

export function gearHubThumbnailFileError(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
  if (!file || file.size <= 0) return 'Choose a photo to upload.';
  if (file.size > MAX_UPLOAD_BYTES) return folderFileTooLargeReason(file.name);
  const namedOk = isGearHubThumbnailImageName(file.name);
  const typedOk = /^image\/(png|jpeg|jpg|webp|gif)$/i.test(String(file.type ?? ''));
  if (!namedOk && !typedOk) return 'Upload a JPEG, PNG, WebP, or GIF.';
  return null;
}

export function emptyGearHubThumbnailStore(): GearHubThumbnailStore {
  return { slides: [], removedSeedIds: [] };
}

function uniqueSeedIds(ids: unknown): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const value of Array.isArray(ids) ? ids : []) {
    const id = String(value ?? '').trim();
    if (!id.startsWith('seed-') || seen.has(id)) continue;
    seen.add(id);
    list.push(id);
  }
  return list;
}

export function wrapGearHubCarouselIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((Math.trunc(index) % length) + length) % length;
}

/** Compare gallery photos by file path so the same shot is unique across collection cards. */
export function gearHubSlideImageKey(slide: { src?: string } | string | null | undefined): string {
  const src = typeof slide === 'string' ? slide : String(slide?.src ?? '');
  return src.replace(/[?#].*$/, '').trim().toLowerCase();
}

function slotIndexKey(keys: readonly string[], index: number): string {
  if (!keys.length) return '';
  return keys[wrapGearHubCarouselIndex(index, keys.length)] ?? '';
}

export function takenGearHubImageKeys(
  keysBySlot: readonly (readonly string[])[],
  indexes: readonly number[],
  exceptSlot = -1,
): Set<string> {
  const taken = new Set<string>();
  keysBySlot.forEach((keys, slotIndex) => {
    if (slotIndex === exceptSlot) return;
    const key = slotIndexKey(keys, indexes[slotIndex] ?? 0);
    if (key) taken.add(key);
  });
  return taken;
}

/** Random start indexes so visible photos do not repeat across cards. */
export function pickGearHubDistinctIndexes(
  keysBySlot: readonly (readonly string[])[],
  random: () => number = Math.random,
): number[] {
  const used = new Set<string>();
  return keysBySlot.map((keys) => {
    if (!keys.length) return 0;
    const candidates = keys
      .map((key, index) => ({ key, index }))
      .filter((row) => Boolean(row.key) && !used.has(row.key));
    const pool = candidates.length
      ? candidates
      : keys.map((key, index) => ({ key, index }));
    const raw = random();
    const roll = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.999999) : 0;
    const choice = pool[Math.floor(roll * pool.length)] ?? pool[0];
    if (choice?.key) used.add(choice.key);
    return choice?.index ?? 0;
  });
}

/** Step to the next/previous photo that is not already on another card. */
export function nextGearHubDistinctIndex(
  keys: readonly string[],
  currentIndex: number,
  takenKeys: ReadonlySet<string>,
  step = 1,
): number {
  const length = keys.length;
  if (length <= 0) return 0;
  const delta = step < 0 ? -1 : 1;
  const start = wrapGearHubCarouselIndex(currentIndex, length);
  for (let offset = 1; offset <= length; offset += 1) {
    const index = wrapGearHubCarouselIndex(start + delta * offset, length);
    const key = keys[index] ?? '';
    if (!key || !takenKeys.has(key)) return index;
  }
  return wrapGearHubCarouselIndex(start + delta, length);
}

/** Autoplay pick: a random unused photo, falling back to the next unused one. */
export function pickGearHubRandomUnusedIndex(
  keys: readonly string[],
  currentIndex: number,
  takenKeys: ReadonlySet<string>,
  random: () => number = Math.random,
): number {
  const length = keys.length;
  if (length <= 0) return 0;
  const current = wrapGearHubCarouselIndex(currentIndex, length);
  const candidates = keys
    .map((key, index) => ({ key, index }))
    .filter((row) => row.index !== current && Boolean(row.key) && !takenKeys.has(row.key));
  if (!candidates.length) return nextGearHubDistinctIndex(keys, current, takenKeys, 1);
  const raw = random();
  const roll = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.999999) : 0;
  return candidates[Math.floor(roll * candidates.length)]?.index ?? current;
}

export function advanceGearHubDistinctIndexes(
  keysBySlot: readonly (readonly string[])[],
  currentIndexes: readonly number[],
  skip: readonly boolean[] = [],
  random: () => number = Math.random,
): number[] {
  const next = keysBySlot.map((keys, slotIndex) =>
    wrapGearHubCarouselIndex(currentIndexes[slotIndex] ?? 0, keys.length || 1),
  );
  keysBySlot.forEach((keys, slotIndex) => {
    if (skip[slotIndex] || keys.length < 2) return;
    const taken = takenGearHubImageKeys(keysBySlot, next, slotIndex);
    next[slotIndex] = pickGearHubRandomUnusedIndex(keys, next[slotIndex] ?? 0, taken, random);
  });
  return next;
}

function parseSlide(value: unknown): GearHubCarouselSlide | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Partial<GearHubCarouselSlide> & { slot?: unknown };
  if (!isGearHubThumbnailSlot(row.slot)) return null;
  const name = sanitizeGearHubThumbnailFileName(String(row.name ?? ''));
  const blobId = String(row.blobId ?? '').trim();
  const id = String(row.id ?? '').trim() || blobId;
  if (!name || !blobId || !id || !isGearHubThumbnailImageName(name)) return null;
  return { id, slot: row.slot as GearHubThumbnailSlot, name, blobId };
}

export function parseGearHubThumbnailStore(raw: unknown): GearHubThumbnailStore {
  if (!raw || typeof raw !== 'object') return emptyGearHubThumbnailStore();
  const data = raw as { slides?: unknown; thumbs?: unknown };
  const fromSlides = Array.isArray(data.slides) ? data.slides.flatMap((item) => parseSlide(item) ?? []) : [];
  const fromThumbs = Array.isArray(data.thumbs) ? data.thumbs.flatMap((item) => parseSlide(item) ?? []) : [];
  const merged = fromSlides.length ? fromSlides : fromThumbs;
  const seen = new Set<string>();
  const slides: GearHubCarouselSlide[] = [];
  for (const slide of merged) {
    if (seen.has(slide.id)) continue;
    seen.add(slide.id);
    slides.push(slide);
  }
  return { slides, removedSeedIds: uniqueSeedIds((raw as { removedSeedIds?: unknown }).removedSeedIds) };
}

export function loadGearHubThumbnailStore(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): GearHubThumbnailStore {
  if (!storage) return emptyGearHubThumbnailStore();
  try {
    const raw = storage.getItem(GEAR_HUB_THUMBNAIL_STORAGE_KEY);
    if (!raw) return emptyGearHubThumbnailStore();
    return parseGearHubThumbnailStore(JSON.parse(raw));
  } catch {
    return emptyGearHubThumbnailStore();
  }
}

export function persistGearHubThumbnailStore(
  store: GearHubThumbnailStore,
  storage: Pick<Storage, 'setItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): void {
  if (!storage) return;
  try {
    storage.setItem(
      GEAR_HUB_THUMBNAIL_STORAGE_KEY,
      JSON.stringify({
        slides: store.slides.map((slide) => ({
          id: slide.id,
          slot: slide.slot,
          name: slide.name,
          blobId: slide.blobId,
        })),
        removedSeedIds: uniqueSeedIds(store.removedSeedIds),
      }),
    );
  } catch {
    /* ignore quota */
  }
}

export function gearHubSlidesFor(
  store: GearHubThumbnailStore,
  slot: GearHubThumbnailSlot,
): GearHubCarouselSlide[] {
  return store.slides.filter((slide) => slide.slot === slot);
}

export function gearHubThumbnailFor(
  store: GearHubThumbnailStore,
  slot: GearHubThumbnailSlot,
): GearHubCarouselSlide | undefined {
  return gearHubSlidesFor(store, slot)[0];
}

export function gearHubDisplayedSrc(
  store: GearHubThumbnailStore,
  slot: GearHubThumbnailSlot,
  fallback = '',
): string {
  return gearHubSlidesFor(store, slot)[0]?.src || fallback;
}

export function gearHubSeedSlides(
  slot: GearHubThumbnailSlot,
  alt = '',
): GearHubVisibleSlide[] {
  return (GEAR_HUB_SEED_FILES[slot] ?? []).map((src, index) => {
    const name = sanitizeGearHubThumbnailFileName(src);
    return {
      id: `seed-${slot}-${index}-${name}`,
      src,
      alt: alt || name.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
      uploaded: false,
    };
  });
}

export function gearHubVisibleSlides(
  store: GearHubThumbnailStore,
  slot: GearHubThumbnailSlot,
  fallback?: { src: string; alt: string },
): GearHubVisibleSlide[] {
  const hidden = new Set(store.removedSeedIds ?? []);
  const seeds = gearHubSeedSlides(slot, fallback?.alt ?? '').filter((slide) => !hidden.has(slide.id));
  const uploaded = gearHubSlidesFor(store, slot).flatMap((slide) => {
    if (!slide.src) return [];
    return [
      {
        id: slide.id,
        src: slide.src,
        alt: fallback?.alt || slide.name.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
        uploaded: true,
      },
    ];
  });
  if (seeds.length || uploaded.length) return [...seeds, ...uploaded];
  if (fallback?.src) {
    return [{ id: `default-${slot}`, src: fallback.src, alt: fallback.alt, uploaded: false }];
  }
  return [];
}

export function addGearHubCarouselSlide(
  store: GearHubThumbnailStore,
  slot: unknown,
  input: { id?: string; name: string; blobId: string },
): { store: GearHubThumbnailStore; error?: string } {
  if (!isGearHubThumbnailSlot(slot)) return { store, error: 'Choose a gear card.' };
  const name = sanitizeGearHubThumbnailFileName(input.name);
  const blobId = String(input.blobId ?? '').trim();
  const id = String(input.id ?? '').trim() || blobId;
  if (!blobId || !id) return { store, error: 'Choose a photo to upload.' };
  if (!isGearHubThumbnailImageName(name)) return { store, error: 'Upload a JPEG, PNG, WebP, or GIF.' };
  if (gearHubSlidesFor(store, slot as GearHubThumbnailSlot).length >= GEAR_HUB_CAROUSEL_MAX_SLIDES) {
    return { store, error: `This collection already has ${GEAR_HUB_CAROUSEL_MAX_SLIDES} photos.` };
  }
  if (store.slides.some((slide) => slide.id === id)) return { store, error: 'That photo is already in this carousel.' };
  return {
    store: {
      slides: [...store.slides, { id, slot: slot as GearHubThumbnailSlot, name, blobId }],
      removedSeedIds: uniqueSeedIds(store.removedSeedIds),
    },
  };
}

export function hideGearHubGallerySlide(
  store: GearHubThumbnailStore,
  slideId: unknown,
): { store: GearHubThumbnailStore; removedBlobId?: string; error?: string } {
  const id = String(slideId ?? '').trim();
  if (!id) return { store, error: 'Choose a photo to remove.' };
  const previous = store.slides.find((slide) => slide.id === id);
  const removedSeedIds = uniqueSeedIds(store.removedSeedIds);
  if (previous) {
    return {
      store: {
        slides: store.slides.filter((slide) => slide.id !== id),
        removedSeedIds,
      },
      removedBlobId: previous.blobId,
    };
  }
  if (!id.startsWith('seed-')) return { store, error: 'Choose a photo to remove.' };
  if (removedSeedIds.includes(id)) return { store };
  return {
    store: {
      slides: store.slides,
      removedSeedIds: [...removedSeedIds, id],
    },
  };
}

export function removeGearHubCarouselSlide(
  store: GearHubThumbnailStore,
  slideId: unknown,
): { store: GearHubThumbnailStore; removedBlobId?: string } {
  return hideGearHubGallerySlide(store, slideId);
}

export function clearGearHubThumbnail(
  store: GearHubThumbnailStore,
  slot: unknown,
): { store: GearHubThumbnailStore; removedBlobIds: string[] } {
  if (!isGearHubThumbnailSlot(slot)) return { store, removedBlobIds: [] };
  const keep = store.slides.filter((slide) => slide.slot !== slot);
  const removedBlobIds = store.slides.filter((slide) => slide.slot === slot).map((slide) => slide.blobId);
  const prefix = `seed-${slot}-`;
  return {
    store: {
      slides: keep,
      removedSeedIds: uniqueSeedIds(store.removedSeedIds).filter((id) => !id.startsWith(prefix)),
    },
    removedBlobIds,
  };
}

export async function hydrateGearHubThumbnails(
  store: GearHubThumbnailStore,
): Promise<GearHubThumbnailStore> {
  const slides = await Promise.all(
    store.slides.map(async (slide) => {
      const blob = await getUploadBlob(slide.blobId);
      if (!blob) return slide;
      return { ...slide, src: URL.createObjectURL(blob) };
    }),
  );
  return { slides, removedSeedIds: uniqueSeedIds(store.removedSeedIds) };
}

export function revokeGearHubThumbnailSrcs(store: GearHubThumbnailStore): void {
  for (const slide of store.slides) {
    if (slide.src?.startsWith('blob:')) URL.revokeObjectURL(slide.src);
  }
}

export async function saveGearHubThumbnailFile(
  store: GearHubThumbnailStore,
  slot: GearHubThumbnailSlot,
  file: File,
): Promise<{ store: GearHubThumbnailStore; error?: string }> {
  const error = gearHubThumbnailFileError(file);
  if (error) return { store, error };
  const blobId = newUploadId(`gear-hub-${slot}`);
  await putUploadBlob(blobId, file);
  const next = addGearHubCarouselSlide(store, slot, {
    id: blobId,
    name: file.name,
    blobId,
  });
  if (next.error) {
    await deleteUploadBlob(blobId);
    return { store, error: next.error };
  }
  persistGearHubThumbnailStore(next.store);
  return { store: next.store };
}

export async function saveGearHubCarouselFiles(
  store: GearHubThumbnailStore,
  slot: GearHubThumbnailSlot,
  files: File[],
): Promise<{ store: GearHubThumbnailStore; error?: string; added: number }> {
  let current = store;
  let added = 0;
  let error: string | undefined;
  for (const file of files) {
    const result = await saveGearHubThumbnailFile(current, slot, file);
    if (result.error) {
      error = result.error;
      break;
    }
    current = result.store;
    added += 1;
  }
  return { store: current, error, added };
}

export async function resetGearHubThumbnail(
  store: GearHubThumbnailStore,
  slot: GearHubThumbnailSlot,
): Promise<GearHubThumbnailStore> {
  const next = clearGearHubThumbnail(store, slot);
  await Promise.all(next.removedBlobIds.map((blobId) => deleteUploadBlob(blobId)));
  persistGearHubThumbnailStore(next.store);
  return next.store;
}

export async function removeGearHubCarouselFile(
  store: GearHubThumbnailStore,
  slideId: string,
): Promise<GearHubThumbnailStore> {
  const next = hideGearHubGallerySlide(store, slideId);
  if (next.removedBlobId) await deleteUploadBlob(next.removedBlobId);
  persistGearHubThumbnailStore(next.store);
  return next.store;
}
