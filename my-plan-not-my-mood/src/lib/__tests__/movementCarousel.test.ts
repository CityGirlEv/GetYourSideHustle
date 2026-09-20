import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MOVEMENT_CAROUSEL_ASPECT_CLASS,
  MOVEMENT_CAROUSEL_CONTROLS_CLASS,
  MOVEMENT_CAROUSEL_DESKTOP_HEIGHT_CLASS,
  MOVEMENT_CAROUSEL_MAX_HEIGHT_CLASS,
  MOVEMENT_CAROUSEL_MOBILE_FRAME_CLASS,
  MOVEMENT_CAROUSEL_LEAD_FILE,
  MOVEMENT_CAROUSEL_OBJECT_FIT,
  MOVEMENT_CAROUSEL_OBJECT_POSITION,
  MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE,
  MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE,
  MOVEMENT_CAROUSEL_PUBLIC_DIR,
  MOVEMENT_CAROUSEL_SEED_FILES,
  MOVEMENT_CAROUSEL_SOURCE_FOLDER,
  canManageMovementCarousel,
  emptyMovementCarouselStore,
  isMovementCarouselImageName,
  loadMovementCarouselStore,
  movementCarouselPairKey,
  movementCarouselPublicUrl,
  movementCarouselSlides,
  pairMovementCarouselFrames,
  parseMovementCarouselStore,
  persistMovementCarouselStore,
  removeMovementCarouselSlide,
  visibleMovementCarouselSlides,
  wrapMovementCarouselIndex,
  movementCarouselGoesSolo,
  movementCarouselObjectPositionFor,
  type MovementCarouselSlide,
} from '../movementCarousel';

function slide(name: string): MovementCarouselSlide {
  return { id: name, name, src: `/images/${name}` };
}

describe('movementCarousel', () => {
  it('loads Caroloul lifestyle photos as a portrait carousel, skipping placeholders', () => {
    expect(MOVEMENT_CAROUSEL_SOURCE_FOLDER).toMatch(/Caroloul$/);
    expect(MOVEMENT_CAROUSEL_ASPECT_CLASS).toBe('aspect-[3/4]');
    expect(MOVEMENT_CAROUSEL_MOBILE_FRAME_CLASS).toContain('w-[min(100%,20.5rem)]');
    expect(MOVEMENT_CAROUSEL_MAX_HEIGHT_CLASS).not.toContain('max-h-[22rem]');
    expect(MOVEMENT_CAROUSEL_MAX_HEIGHT_CLASS).toContain('md:max-h-none');
    expect(MOVEMENT_CAROUSEL_DESKTOP_HEIGHT_CLASS).toContain('md:flex-1');
    expect(MOVEMENT_CAROUSEL_DESKTOP_HEIGHT_CLASS).toContain('md:aspect-auto');
    expect(MOVEMENT_CAROUSEL_CONTROLS_CLASS).toContain('relative');
    expect(MOVEMENT_CAROUSEL_CONTROLS_CLASS).not.toContain('absolute');
    expect(MOVEMENT_CAROUSEL_CONTROLS_CLASS).toContain('pt-1.5');
    expect(MOVEMENT_CAROUSEL_OBJECT_FIT).toBe('cover');
    expect(MOVEMENT_CAROUSEL_OBJECT_POSITION).toBe('center 20%');
    expect(isMovementCarouselImageName('unisex-softstyle-t-shirt-placeholder-do-not-publish.jpg')).toBe(false);
    expect(isMovementCarouselImageName('Old.png')).toBe(false);
    expect(isMovementCarouselImageName('ProductionLogos.png')).toBe(false);
    expect(isMovementCarouselImageName('5e7e2d1a-1f9d-4a5c-b345-6b69f9225a94 - Copy.jpg')).toBe(false);
    expect(isMovementCarouselImageName(MOVEMENT_CAROUSEL_LEAD_FILE)).toBe(true);

    const slides = movementCarouselSlides();
    expect(slides).toHaveLength(MOVEMENT_CAROUSEL_SEED_FILES.length);
    expect(slides[0]?.name).toBe(MOVEMENT_CAROUSEL_LEAD_FILE);
    expect(slides[0]?.src).toContain(`${MOVEMENT_CAROUSEL_PUBLIC_DIR}/${MOVEMENT_CAROUSEL_LEAD_FILE}`);
    expect(new Set(slides.map((item) => item.name)).size).toBe(slides.length);
    expect(wrapMovementCarouselIndex(-1, 32)).toBe(31);
    expect(wrapMovementCarouselIndex(32, 32)).toBe(0);
    expect(movementCarouselPublicUrl(MOVEMENT_CAROUSEL_LEAD_FILE)).toMatch(/v=/);

    for (const file of MOVEMENT_CAROUSEL_SEED_FILES) {
      expect(existsSync(resolve(process.cwd(), `public${MOVEMENT_CAROUSEL_PUBLIC_DIR}/${file}`))).toBe(true);
    }
  });

  it('keeps Angela white and red hoodie shots solo, face and logo in frame', () => {
    expect(movementCarouselGoesSolo(MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE)).toBe(true);
    expect(movementCarouselGoesSolo(MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE)).toBe(true);
    expect(movementCarouselGoesSolo(MOVEMENT_CAROUSEL_LEAD_FILE)).toBe(false);
    expect(movementCarouselObjectPositionFor(MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE)).toBe('center 18%');
    expect(movementCarouselObjectPositionFor(MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE)).toBe('center 14%');
    expect(movementCarouselObjectPositionFor(MOVEMENT_CAROUSEL_LEAD_FILE)).toBe('center 20%');

    const frames = pairMovementCarouselFrames(movementCarouselSlides());
    const white = frames.find((frame) => frame.top.name === MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE);
    const red = frames.find((frame) => frame.top.name === MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE);
    expect(white?.bottom).toBeNull();
    expect(red?.bottom).toBeNull();
    expect(frames.some((frame) => frame.bottom?.name === MOVEMENT_CAROUSEL_ANGELA_WHITE_HOODIE)).toBe(false);
    expect(frames.some((frame) => frame.bottom?.name === MOVEMENT_CAROUSEL_ANGELA_RED_HOODIE)).toBe(false);
  });

  it('stacks two different short photos per frame and never repeats a pair', () => {
    const frames = pairMovementCarouselFrames(movementCarouselSlides());
    const stacked = frames.filter((frame) => frame.bottom);
    const names: string[] = [];
    const pairKeys: string[] = [];
    for (const frame of stacked) {
      expect(frame.top.name).not.toBe(frame.bottom?.name);
      expect(movementCarouselGoesSolo(frame.top.name)).toBe(false);
      expect(movementCarouselGoesSolo(frame.bottom!.name)).toBe(false);
      names.push(frame.top.name, frame.bottom!.name);
      pairKeys.push(movementCarouselPairKey(frame.top.name, frame.bottom!.name));
    }
    expect(stacked.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(pairKeys).size).toBe(stacked.length);
    expect(movementCarouselPairKey('b.jpg', 'a.jpg')).toBe(movementCarouselPairKey('a.jpg', 'b.jpg'));
  });

  it('never combines the same image with itself and keeps an odd leftover unstacked', () => {
    expect(pairMovementCarouselFrames([slide('a.jpg'), slide('a.jpg')])).toEqual([
      { id: 'frame-a.jpg', top: slide('a.jpg'), bottom: null },
    ]);
    const leftover = pairMovementCarouselFrames([slide('a.jpg'), slide('b.jpg'), slide('c.jpg')]);
    expect(leftover).toHaveLength(2);
    expect(leftover[0]).toMatchObject({ top: { name: 'a.jpg' }, bottom: { name: 'b.jpg' } });
    expect(leftover[1]).toMatchObject({ top: { name: 'c.jpg' }, bottom: null });
  });

  it('lets admins remove images from the visible stack and persist the hide list', () => {
    expect(canManageMovementCarousel('super_admin')).toBe(true);
    expect(canManageMovementCarousel('admin')).toBe(true);
    expect(canManageMovementCarousel('qa')).toBe(false);
    expect(canManageMovementCarousel('member')).toBe(false);
    expect(canManageMovementCarousel(null)).toBe(false);

    const seed = [slide('one.jpg'), slide('two.jpg'), slide('three.jpg'), slide('four.jpg')];
    let store = emptyMovementCarouselStore();
    store = removeMovementCarouselSlide(store, 'two.jpg');
    expect(visibleMovementCarouselSlides(store, seed).map((item) => item.name)).toEqual([
      'one.jpg',
      'three.jpg',
      'four.jpg',
    ]);
    const frames = pairMovementCarouselFrames(visibleMovementCarouselSlides(store, seed));
    expect(frames[0]?.top.name).toBe('one.jpg');
    expect(frames[0]?.bottom?.name).toBe('three.jpg');
    expect(frames[0]?.top.name).not.toBe(frames[0]?.bottom?.name);

    const memory: Record<string, string> = {};
    persistMovementCarouselStore(store, {
      setItem: (key, value) => {
        memory[key] = value;
      },
    });
    expect(loadMovementCarouselStore({ getItem: (key) => memory[key] ?? null }).removedNames).toEqual(['two.jpg']);
    expect(parseMovementCarouselStore({ removedNames: ['Two.JPG', 'two.jpg'] }).removedNames).toEqual(['two.jpg']);
  });
});

describe('movement carousel markup', () => {
  it('renders stacked top and bottom photos with admin delete controls', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/MovementCarousel.tsx'), 'utf8');
    expect(source).toContain('home-movement-image-top');
    expect(source).toContain('home-movement-image-bottom');
    expect(source).toContain('home-movement-stack');
    expect(source.indexOf('data-testid="home-movement-stack"')).toBeLessThan(
      source.indexOf('{controls}'),
    );
    expect(source).toContain('h-5 w-5 sm:h-8 sm:w-8');
    expect(source).toContain('confirmDelete');
    expect(source).toContain('canManage');
    expect(source).not.toContain('home-movement-image-fill');
  });
});
