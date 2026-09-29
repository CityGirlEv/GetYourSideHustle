import { cacheBustPublicUrl } from './spaAssets';
import { sanitizeHeroCarouselFileName, wrapCarouselIndex } from './heroCarousel';
import { getRolePermissions, type UserOrRoleInput } from './userAuth';

export const MOVEMENT_CAROUSEL_PUBLIC_DIR = '/images/movement-carousel';
export const MOVEMENT_CAROUSEL_SOURCE_FOLDER =
  'C:\\Documents\\AngelaHarris\\MyPlanNotMood\\Images\\WebsiteSS\\Caroloul';
export const MOVEMENT_CAROUSEL_INTERVAL_MS = 5000;
export const MOVEMENT_CAROUSEL_ASPECT_WIDTH = 3;
export const MOVEMENT_CAROUSEL_ASPECT_HEIGHT = 4;
export const MOVEMENT_CAROUSEL_ASPECT_CLASS = 'aspect-[3/4]';
/** Portrait card on phones; desktop still fills the movement column. */
export const MOVEMENT_CAROUSEL_MOBILE_FRAME_CLASS =
  'mx-auto w-[min(100%,20.5rem)] rounded-2xl';
export const MOVEMENT_CAROUSEL_MAX_HEIGHT_CLASS = 'md:max-h-none';
export const MOVEMENT_CAROUSEL_DESKTOP_HEIGHT_CLASS =
  'md:mx-0 md:w-full md:max-w-none md:flex-1 md:rounded-none md:aspect-auto md:h-auto md:min-h-0';
export const MOVEMENT_CAROUSEL_CONTROLS_CLASS =
  'relative z-10 shrink-0 flex items-center justify-center gap-1 pt-1.5 pb-0.5 sm:py-1.5';
export const MOVEMENT_CAROUSEL_OBJECT_FIT = 'cover' as const;
/** Keep face + chest logo in frame; crop legs. */
export const MOVEMENT_CAROUSEL_OBJECT_POSITION = 'center 20%';
export const MOVEMENT_CAROUSEL_MATTE = '#EDE4D4';
export const MOVEMENT_CAROUSEL_STORAGE_KEY = 'myplan_movement_carousel_v1';
/** Portrait shots that already fill the frame, including Angela’s hoodies. */
export const MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE = '16e6fec5-3e6d-45c0-b1f4-3be4e2b828ba.jpg';
export const MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE = '45379267-ca72-465d-9256-6d9537f2a463.jpg';
export const MOVEMENT_CAROUSEL_SOLO_FILES = [
  MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE,
  MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE,
  '2fde91a4-fe19-4e77-a930-a9c4adecd043-1.jpg',
  '5fbc5987-55bd-40f0-a416-5d78555cf8e2.jpg',
  '8d232d56-0cbe-4fbe-8a84-8f37e3739105.jpg',
  '94f80f48-a73b-4652-83d6-10424b93326b.jpg',
  '969e6f94-f1b7-46a4-a23e-30130540f0be.jpg',
  'c6deb875-ae0d-4e59-9771-0985205ed28b.jpg',
  'e4d3e217-f23a-4646-8db3-2069643c0fbf.jpg',
] as const;

/** Couple-in-tees lead, then the rest of the Caroloul folder (placeholders and copies skipped). */
export const MOVEMENT_CAROUSEL_LEAD_FILE = '5e7e2d1a-1f9d-4a5c-b345-6b69f9225a94.jpg';

export const MOVEMENT_CAROUSEL_SEED_FILES = [
  MOVEMENT_CAROUSEL_LEAD_FILE,
  '011996d1-5776-4dbf-bd26-88a2b7096948.jpg',
  '15036882-90f2-4929-9fea-7c2366c1dd32.jpg',
  '16e6fec5-3e6d-45c0-b1f4-3be4e2b828ba.jpg',
  '25652d93-5256-4f5f-b275-51fc68476c8c.jpg',
  '2fde91a4-fe19-4e77-a930-a9c4adecd043-1.jpg',
  '3275c621-ad0e-40f1-b1f9-664031ebe089.jpg',
  '40cf885d-a0b5-42ae-be90-8bd98726aaf6.jpg',
  '45379267-ca72-465d-9256-6d9537f2a463.jpg',
  '4ae33c10-cb5d-4694-9c9b-0e4076047443.jpg',
  '4c60f206-fbf5-4430-a716-dc77498594e1.jpg',
  '503cc767-f6a9-4634-a9cf-a28e18017517.jpg',
  '58e7a4bb-48c8-4185-a40a-80f7f54861da.jpg',
  '5fbc5987-55bd-40f0-a416-5d78555cf8e2.jpg',
  '89c64d63-01fb-4edf-b226-5e5ba2125137.jpg',
  '8a5a6f38-4825-43b5-b561-ca199fadf5f0.jpg',
  '8d232d56-0cbe-4fbe-8a84-8f37e3739105.jpg',
  '8e775272-ebb6-4a24-b994-088be304d22b.jpg',
  '9240a70b-ab60-49a3-b39c-738acd15f7e9.jpg',
  '93f79d3f-9688-43c2-99ed-ed47226e0507.jpg',
  '94f80f48-a73b-4652-83d6-10424b93326b.jpg',
  '969e6f94-f1b7-46a4-a23e-30130540f0be.jpg',
  '97437ca6-d5a1-44c5-b1a3-58e650cd01e1.jpg',
  'ab9f4d63-8ccf-4f42-98d9-037c4b94d42b-1.jpg',
  'c524b163-2b60-4ffa-bd51-82bb51af906c.jpg',
  'c6deb875-ae0d-4e59-9771-0985205ed28b.jpg',
  'c6ef8f1a-cdf4-4474-8966-02007a7e21cb.jpg',
  'd7083716-3b3d-47c9-a00f-f9a4abd698c5.jpg',
  'e4d3e217-f23a-4646-8db3-2069643c0fbf.jpg',
  'f8e73752-ce56-46ea-ae79-ccbd6241732a.jpg',
  'fda4abd2-e1a7-4c8f-9f3b-742bed874382.jpg',
  'fe6b95aa-cbe4-4d6e-8535-1287d0633257.jpg',
] as const;

export function isMovementCarouselImageName(name: string): boolean {
  const file = sanitizeHeroCarouselFileName(name);
  if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) return false;
  return (
    !file.includes('placeholder') &&
    !file.includes('do-not-publish') &&
    !file.includes('productionlogos') &&
    !/^old\d*\./.test(file) &&
    !file.includes('-copy.')
  );
}

export function movementCarouselPublicUrl(name: string): string {
  return cacheBustPublicUrl(`${MOVEMENT_CAROUSEL_PUBLIC_DIR}/${sanitizeHeroCarouselFileName(name)}`);
}

export type MovementCarouselSlide = {
  id: string;
  name: string;
  src: string;
};

export function movementCarouselSlides(
  files: readonly string[] = MOVEMENT_CAROUSEL_SEED_FILES,
): MovementCarouselSlide[] {
  const seen = new Set<string>();
  return files.filter(isMovementCarouselImageName).flatMap((name) => {
    const file = sanitizeHeroCarouselFileName(name);
    if (seen.has(file)) return [];
    seen.add(file);
    return [
      {
        id: `movement-${file}`,
        name: file,
        src: movementCarouselPublicUrl(file),
      },
    ];
  });
}

export function wrapMovementCarouselIndex(index: number, length: number): number {
  return wrapCarouselIndex(index, length);
}

export function canManageMovementCarousel(user?: UserOrRoleInput): boolean {
  return getRolePermissions(user).canManageContentFactory;
}

export type MovementCarouselStore = {
  removedNames: string[];
};

export type MovementCarouselFrame = {
  id: string;
  top: MovementCarouselSlide;
  bottom: MovementCarouselSlide | null;
};

export function emptyMovementCarouselStore(): MovementCarouselStore {
  return { removedNames: [] };
}

export function parseMovementCarouselStore(raw: unknown): MovementCarouselStore {
  if (!raw || typeof raw !== 'object') return emptyMovementCarouselStore();
  const data = raw as { removedNames?: unknown };
  const names = Array.isArray(data.removedNames) ? data.removedNames : [];
  const removedNames = [
    ...new Set(
      names
        .filter((name): name is string => typeof name === 'string')
        .map((name) => sanitizeHeroCarouselFileName(name))
        .filter(Boolean),
    ),
  ];
  return { removedNames };
}

export function loadMovementCarouselStore(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): MovementCarouselStore {
  if (!storage) return emptyMovementCarouselStore();
  try {
    const raw = storage.getItem(MOVEMENT_CAROUSEL_STORAGE_KEY);
    if (!raw) return emptyMovementCarouselStore();
    return parseMovementCarouselStore(JSON.parse(raw));
  } catch {
    return emptyMovementCarouselStore();
  }
}

export function persistMovementCarouselStore(
  store: MovementCarouselStore,
  storage: Pick<Storage, 'setItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): void {
  if (!storage) return;
  try {
    storage.setItem(MOVEMENT_CAROUSEL_STORAGE_KEY, JSON.stringify({ removedNames: store.removedNames }));
  } catch {
    /* ignore quota */
  }
}

export function visibleMovementCarouselSlides(
  store: MovementCarouselStore = emptyMovementCarouselStore(),
  seed: MovementCarouselSlide[] = movementCarouselSlides(),
): MovementCarouselSlide[] {
  const removed = new Set(store.removedNames.map((name) => sanitizeHeroCarouselFileName(name)));
  return seed.filter((slide) => !removed.has(slide.name));
}

export function removeMovementCarouselSlide(
  store: MovementCarouselStore,
  name: string,
): MovementCarouselStore {
  const file = sanitizeHeroCarouselFileName(name);
  if (!file || store.removedNames.includes(file)) return store;
  return { removedNames: [...store.removedNames, file] };
}

export function movementCarouselPairKey(topName: string, bottomName: string): string {
  return [sanitizeHeroCarouselFileName(topName), sanitizeHeroCarouselFileName(bottomName)]
    .filter(Boolean)
    .sort()
    .join('|');
}

const SOLO_FILE_SET = new Set<string>(MOVEMENT_CAROUSEL_SOLO_FILES);

export function movementCarouselGoesSolo(name: string): boolean {
  return SOLO_FILE_SET.has(sanitizeHeroCarouselFileName(name));
}

export function movementCarouselObjectPositionFor(name: string): string {
  const file = sanitizeHeroCarouselFileName(name);
  if (file === MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE) return 'center 18%';
  if (file === MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE) return 'center 14%';
  return MOVEMENT_CAROUSEL_OBJECT_POSITION;
}

function soloFrame(slide: MovementCarouselSlide): MovementCarouselFrame {
  return { id: `frame-${slide.name}`, top: slide, bottom: null };
}

export function pairMovementCarouselFrames(
  slides: readonly MovementCarouselSlide[],
): MovementCarouselFrame[] {
  const unique: MovementCarouselSlide[] = [];
  const seen = new Set<string>();
  for (const slide of slides) {
    if (seen.has(slide.name)) continue;
    seen.add(slide.name);
    unique.push(slide);
  }

  const frames: MovementCarouselFrame[] = [];
  const pendingShort: MovementCarouselSlide[] = [];
  const usedPairs = new Set<string>();

  const flushPair = () => {
    while (pendingShort.length >= 2) {
      const top = pendingShort.shift()!;
      const partnerAt = pendingShort.findIndex(
        (slide) =>
          slide.name !== top.name && !usedPairs.has(movementCarouselPairKey(top.name, slide.name)),
      );
      if (partnerAt < 0) {
        frames.push(soloFrame(top));
        continue;
      }
      const bottom = pendingShort.splice(partnerAt, 1)[0]!;
      usedPairs.add(movementCarouselPairKey(top.name, bottom.name));
      frames.push({
        id: `frame-${top.name}-${bottom.name}`,
        top,
        bottom,
      });
    }
  };

  for (const slide of unique) {
    if (movementCarouselGoesSolo(slide.name)) {
      flushPair();
      frames.push(soloFrame(slide));
      continue;
    }
    pendingShort.push(slide);
    flushPair();
  }
  flushPair();
  for (const leftover of pendingShort) {
    frames.push(soloFrame(leftover));
  }
  return frames;
}

export { wrapCarouselIndex };
