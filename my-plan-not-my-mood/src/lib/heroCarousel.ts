import { cacheBustPublicUrl } from './spaAssets';
import { fileExtension, isLoopbackHost } from './localFolder';

export const HERO_CAROUSEL_INTERVAL_MS = 5000;
export const HERO_CAROUSEL_SLIDE_MS = 700;
export const HERO_CAROUSEL_OBJECT_FIT = 'cover';
export const HERO_CAROUSEL_ANGELA_OBJECT_FIT = 'cover';
export const HERO_CAROUSEL_ASPECT_WIDTH = 3;
export const HERO_CAROUSEL_ASPECT_HEIGHT = 4;
export const HERO_CAROUSEL_ASPECT_RATIO = `${HERO_CAROUSEL_ASPECT_WIDTH} / ${HERO_CAROUSEL_ASPECT_HEIGHT}`;
export const HERO_CAROUSEL_ASPECT_CLASS = 'aspect-[3/4]';
export const HERO_CAROUSEL_MATTE = '#FAF8F5';
export const HERO_CAROUSEL_SOURCE_FOLDER = 'C:\\Documents\\AngelaHarris\\MyPlanNotMood\\Images\\WebsiteSS';
export const HERO_CAROUSEL_PUBLIC_DIR = '/images/hero-carousel';
export const HERO_CAROUSEL_STORAGE_KEY = 'myplan_hero_carousel_v2';
export const HERO_CAROUSEL_SYNC_PATH = '/__local__/hero-carousel-sync';

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);

export const ANGELA_HERO_PHOTOS = [
  'angela-white-hoodie-hat.jpg',
  'angela-white-tee.jpg',
  'angela-red-hoodie.jpg',
] as const;

/** Former slides 22, 23, 21 — studio lifestyle, after Angela’s three photos. */
export const HERO_CAROUSEL_LEAD_FILES = [
  'd7083716-3b3d-47c9-a00f-f9a4abd698c5.png',
  'c6ef8f1a-cdf4-4474-8966-02007a7e21cb.png',
  '5e7e2d1a-1f9d-4a5c-b345-6b69f9225a94.png',
] as const;

export const HERO_CAROUSEL_SEED_FILES = [
  ...ANGELA_HERO_PHOTOS,
  ...HERO_CAROUSEL_LEAD_FILES,
  '15036882-90f2-4929-9fea-7c2366c1dd32.png',
  '97437ca6-d5a1-44c5-b1a3-58e650cd01e1.png',
  '503cc767-f6a9-4634-a9cf-a28e18017517.png',
  'fda4abd2-e1a7-4c8f-9f3b-742bed874382.png',
  '3b65f0f7-6a9b-4070-af21-9741426c44d2.png',
  'd477d3fd-e50c-45f0-b5ea-8bbfaeb756cc.png',
  '93f79d3f-9688-43c2-99ed-ed47226e0507.png',
  'c524b163-2b60-4ffa-bd51-82bb51af906c.png',
  'ab9f4d63-8ccf-4f42-98d9-037c4b94d42b-1.png',
  '40cf885d-a0b5-42ae-be90-8bd98726aaf6.png',
  '011996d1-5776-4dbf-bd26-88a2b7096948.png',
  '917572ac-66e4-4aa1-92b5-e5f1d3cccdf4.png',
  '25652d93-5256-4f5f-b275-51fc68476c8c.png',
  '5fbc5987-55bd-40f0-a416-5d78555cf8e2.png',
  '94f80f48-a73b-4652-83d6-10424b93326b.png',
  '8d232d56-0cbe-4fbe-8a84-8f37e3739105.png',
  '4c60f206-fbf5-4430-a716-dc77498594e1.png',
  '3275c621-ad0e-40f1-b1f9-664031ebe089.png',
] as const;

export type HeroCarouselOrigin = 'seed' | 'folder' | 'upload';

export interface HeroCarouselSlide {
  id: string;
  name: string;
  src: string;
  origin: HeroCarouselOrigin;
  blobId?: string;
}

export interface HeroCarouselStore {
  removedNames: string[];
  extras: HeroCarouselSlide[];
}

export function sanitizeHeroCarouselFileName(name: string): string {
  const base = String(name ?? '')
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .pop() ?? '';
  return base.replace(/[^\w.\-]+/g, '-').replace(/-+\./g, '.').toLowerCase();
}

export function isHeroCarouselImageName(name: string): boolean {
  const file = sanitizeHeroCarouselFileName(name);
  const ext = fileExtension(file);
  if (!IMAGE_EXT.has(ext)) return false;
  return !file.includes('placeholder') && !file.includes('do-not-publish');
}

export function heroCarouselPublicUrl(name: string): string {
  const file = sanitizeHeroCarouselFileName(name);
  return cacheBustPublicUrl(`${HERO_CAROUSEL_PUBLIC_DIR}/${file}`);
}

export function isAngelaHeroPhoto(name: string): boolean {
  return sanitizeHeroCarouselFileName(name).startsWith('angela-');
}

/** Every slide fills the frame. Angela’s photos crop toward her face instead of letterboxing. */
export function heroCarouselObjectFitFor(name: string): 'cover' | 'contain' {
  return isAngelaHeroPhoto(name) ? HERO_CAROUSEL_ANGELA_OBJECT_FIT : HERO_CAROUSEL_OBJECT_FIT;
}

/** Crop toward the chest so the shirt fills the frame. Hoodie+hat stays high enough to keep the cap. */
export function heroCarouselObjectPositionFor(name: string): string {
  const file = sanitizeHeroCarouselFileName(name);
  if (file === 'angela-white-hoodie-hat.jpg') return 'center 18%';
  if (file === 'angela-red-hoodie.jpg') return 'center 14%';
  if (isAngelaHeroPhoto(file)) return 'center 28%';
  if (file === HERO_CAROUSEL_LEAD_FILES[1]) return '72% 8%';
  if (file === HERO_CAROUSEL_LEAD_FILES[0] || file === HERO_CAROUSEL_LEAD_FILES[2]) return '70% 16%';
  return 'center center';
}

export function seedHeroCarouselId(name: string): string {
  return `seed-${sanitizeHeroCarouselFileName(name)}`;
}

export function seedHeroCarouselSlides(
  files: readonly string[] = HERO_CAROUSEL_SEED_FILES,
): HeroCarouselSlide[] {
  return files.filter(isHeroCarouselImageName).map((name) => {
    const file = sanitizeHeroCarouselFileName(name);
    return {
      id: seedHeroCarouselId(file),
      name: file,
      src: heroCarouselPublicUrl(file),
      origin: 'seed' as const,
    };
  });
}

export function emptyHeroCarouselStore(): HeroCarouselStore {
  return { removedNames: [], extras: [] };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
}

function parseSlide(value: unknown): HeroCarouselSlide | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Partial<HeroCarouselSlide>;
  const name = sanitizeHeroCarouselFileName(String(row.name ?? ''));
  if (!name || !isHeroCarouselImageName(name)) return null;
  const origin: HeroCarouselOrigin =
    row.origin === 'folder' || row.origin === 'upload' ? row.origin : 'seed';
  const id = String(row.id ?? '').trim() || (origin === 'seed' ? seedHeroCarouselId(name) : '');
  if (!id) return null;
  const src = String(row.src ?? '').trim();
  const blobId = typeof row.blobId === 'string' && row.blobId.trim() ? row.blobId.trim() : undefined;
  return {
    id,
    name,
    src: src || (origin === 'seed' || origin === 'folder' ? heroCarouselPublicUrl(name) : ''),
    origin,
    blobId,
  };
}

export function parseHeroCarouselStore(raw: unknown): HeroCarouselStore {
  if (!raw || typeof raw !== 'object') return emptyHeroCarouselStore();
  const data = raw as Partial<HeroCarouselStore>;
  const extras = Array.isArray(data.extras) ? data.extras.flatMap((item) => parseSlide(item) ?? []) : [];
  return {
    removedNames: asStringArray(data.removedNames).map(sanitizeHeroCarouselFileName),
    extras,
  };
}

export function loadHeroCarouselStore(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): HeroCarouselStore {
  if (!storage) return emptyHeroCarouselStore();
  try {
    const raw = storage.getItem(HERO_CAROUSEL_STORAGE_KEY);
    if (!raw) return emptyHeroCarouselStore();
    return parseHeroCarouselStore(JSON.parse(raw));
  } catch {
    return emptyHeroCarouselStore();
  }
}

export function persistHeroCarouselStore(
  store: HeroCarouselStore,
  storage: Pick<Storage, 'setItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): void {
  if (!storage) return;
  try {
    storage.setItem(
      HERO_CAROUSEL_STORAGE_KEY,
      JSON.stringify({
        removedNames: store.removedNames,
        extras: store.extras.map((slide) => ({
          id: slide.id,
          name: slide.name,
          src: slide.blobId ? '' : slide.src,
          origin: slide.origin,
          blobId: slide.blobId,
        })),
      }),
    );
  } catch {
    /* ignore quota */
  }
}

export function visibleHeroCarouselSlides(
  store: HeroCarouselStore = emptyHeroCarouselStore(),
  seed: HeroCarouselSlide[] = seedHeroCarouselSlides(),
): HeroCarouselSlide[] {
  const removed = new Set(store.removedNames.map(sanitizeHeroCarouselFileName));
  const extras = store.extras.filter((slide) => !removed.has(slide.name));
  const extraNames = new Set(extras.map((slide) => slide.name));
  return [...seed.filter((slide) => !removed.has(slide.name) && !extraNames.has(slide.name)), ...extras];
}

export function wrapCarouselIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((Math.trunc(index) % length) + length) % length;
}

/** Clone last/first so a sliding track can wrap without a visible jump. */
export function buildHeroCarouselTrack<T>(slides: readonly T[]): T[] {
  if (slides.length < 2) return [...slides];
  return [slides[slides.length - 1] as T, ...slides, slides[0] as T];
}

export function initialHeroCarouselTrackIndex(slideCount: number): number {
  return slideCount > 1 ? 1 : 0;
}

export function realIndexFromTrack(trackIndex: number, slideCount: number): number {
  if (slideCount <= 0) return 0;
  if (slideCount === 1) return 0;
  if (trackIndex <= 0) return slideCount - 1;
  if (trackIndex >= slideCount + 1) return 0;
  return trackIndex - 1;
}

export function wrappedHeroCarouselTrackIndex(trackIndex: number, slideCount: number): number | null {
  if (slideCount < 2) return null;
  if (trackIndex <= 0) return slideCount;
  if (trackIndex >= slideCount + 1) return 1;
  return null;
}

export function addHeroCarouselSlides(
  store: HeroCarouselStore,
  slides: HeroCarouselSlide[],
): HeroCarouselStore {
  const existing = new Set(visibleHeroCarouselSlides(store).map((slide) => slide.name));
  const extras = [...store.extras];
  const removedNames = store.removedNames.filter(
    (name) => !slides.some((slide) => sanitizeHeroCarouselFileName(slide.name) === sanitizeHeroCarouselFileName(name)),
  );
  for (const slide of slides) {
    const name = sanitizeHeroCarouselFileName(slide.name);
    if (!name || !isHeroCarouselImageName(name) || existing.has(name)) continue;
    extras.push({ ...slide, name });
    existing.add(name);
  }
  return { removedNames, extras };
}

export function removeHeroCarouselSlide(store: HeroCarouselStore, slide: Pick<HeroCarouselSlide, 'id' | 'name'>): HeroCarouselStore {
  const name = sanitizeHeroCarouselFileName(slide.name);
  const extras = store.extras.filter((item) => item.id !== slide.id && item.name !== name);
  const removedNames = store.removedNames.includes(name) ? store.removedNames : [...store.removedNames, name];
  return { removedNames, extras };
}

export function mergeFetchedHeroSlides(
  store: HeroCarouselStore,
  files: Array<Pick<HeroCarouselSlide, 'name' | 'src'> & Partial<HeroCarouselSlide>>,
): { store: HeroCarouselStore; added: number; skipped: number } {
  const removed = new Set(store.removedNames.map(sanitizeHeroCarouselFileName));
  const existing = new Set(visibleHeroCarouselSlides(store).map((slide) => slide.name));
  const incoming: HeroCarouselSlide[] = [];
  let skipped = 0;
  for (const file of files) {
    const name = sanitizeHeroCarouselFileName(file.name);
    if (!name || !isHeroCarouselImageName(name) || existing.has(name) || removed.has(name)) {
      skipped += 1;
      continue;
    }
    incoming.push({
      id: file.id?.trim() || `folder-${name}`,
      name,
      src: file.src || heroCarouselPublicUrl(name),
      origin: file.origin === 'upload' ? 'upload' : 'folder',
      blobId: file.blobId,
    });
    existing.add(name);
  }
  return {
    store: { removedNames: store.removedNames, extras: [...store.extras, ...incoming] },
    added: incoming.length,
    skipped,
  };
}

export function describeHeroCarouselFetch(added: number, skipped: number): string {
  if (added === 0 && skipped === 0) return 'No new images were in that folder.';
  if (added === 0) return `No new images. ${skipped} already on the carousel.`;
  if (skipped === 0) return `Added ${added} ${added === 1 ? 'image' : 'images'}.`;
  return `Added ${added} ${added === 1 ? 'image' : 'images'}. Skipped ${skipped}.`;
}

export function parseHeroCarouselSyncResponse(
  ok: boolean,
  body: unknown,
): { files: Array<{ name: string; src: string }>; error?: string } {
  if (!ok || !body || typeof body !== 'object') {
    return {
      files: [],
      error: 'Folder fetch runs on local Admin Studio (localhost). Choose files instead.',
    };
  }
  const data = body as { ok?: unknown; error?: unknown; files?: unknown };
  if (typeof data.error === 'string' && data.ok !== true) {
    return { files: [], error: data.error };
  }
  if (data.ok !== true || !Array.isArray(data.files)) {
    return {
      files: [],
      error: 'Folder fetch runs on local Admin Studio (localhost). Choose files instead.',
    };
  }
  const files = data.files.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as { name?: unknown; src?: unknown };
    const name = sanitizeHeroCarouselFileName(String(row.name ?? ''));
    if (!isHeroCarouselImageName(name)) return [];
    return [{ name, src: String(row.src ?? heroCarouselPublicUrl(name)) }];
  });
  return { files };
}

export function canFetchHeroCarouselFolder(
  hostname = typeof window === 'undefined' ? '' : window.location.hostname,
): boolean {
  return isLoopbackHost(hostname);
}

export async function requestHeroCarouselFolderSync(
  folderPath = HERO_CAROUSEL_SOURCE_FOLDER,
  hostname = typeof window === 'undefined' ? '' : window.location.hostname,
): Promise<{ files: Array<{ name: string; src: string }>; error?: string }> {
  if (!canFetchHeroCarouselFolder(hostname)) {
    return {
      files: [],
      error: 'Folder fetch runs on localhost. Choose files to add images here.',
    };
  }
  try {
    const res = await fetch(HERO_CAROUSEL_SYNC_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folderPath }),
    });
    const body = await res.json().catch(() => null);
    return parseHeroCarouselSyncResponse(res.ok, body);
  } catch {
    return { files: [], error: 'Could not read that folder from this computer. Choose files instead.' };
  }
}
