import { describe, expect, it } from 'vitest';
import {
  ANGELA_HERO_PHOTOS,
  HERO_CAROUSEL_INTERVAL_MS,
  HERO_CAROUSEL_OBJECT_FIT,
  HERO_CAROUSEL_SEED_FILES,
  HERO_CAROUSEL_SOURCE_FOLDER,
  addHeroCarouselSlides,
  buildHeroCarouselTrack,
  describeHeroCarouselFetch,
  emptyHeroCarouselStore,
  heroCarouselObjectFitFor,
  heroCarouselObjectPositionFor,
  initialHeroCarouselTrackIndex,
  isHeroCarouselImageName,
  mergeFetchedHeroSlides,
  parseHeroCarouselStore,
  parseHeroCarouselSyncResponse,
  realIndexFromTrack,
  removeHeroCarouselSlide,
  sanitizeHeroCarouselFileName,
  seedHeroCarouselSlides,
  visibleHeroCarouselSlides,
  wrapCarouselIndex,
  wrappedHeroCarouselTrackIndex,
} from '../heroCarousel';

describe('heroCarousel', () => {
  it('fills the frame, rotates every 5 seconds, and reads the WebsiteSS folder', () => {
    expect(HERO_CAROUSEL_OBJECT_FIT).toBe('cover');
    expect(HERO_CAROUSEL_INTERVAL_MS).toBe(5000);
    expect(HERO_CAROUSEL_SOURCE_FOLDER).toMatch(/WebsiteSS$/);
    expect(HERO_CAROUSEL_SEED_FILES.length).toBeGreaterThan(3);
    expect(HERO_CAROUSEL_SEED_FILES[0]).toBe('angela-white-hoodie-hat.jpg');
    expect(HERO_CAROUSEL_SEED_FILES.slice(0, 3)).toEqual([...ANGELA_HERO_PHOTOS]);
    expect(heroCarouselObjectFitFor('angela-white-tee.jpg')).toBe('cover');
    expect(heroCarouselObjectPositionFor('angela-white-hoodie-hat.jpg')).toBe('center 18%');
    expect(heroCarouselObjectPositionFor('angela-red-hoodie.jpg')).toBe('center 14%');
    expect(seedHeroCarouselSlides()).toHaveLength(HERO_CAROUSEL_SEED_FILES.length);
    expect(isHeroCarouselImageName('shot.PNG')).toBe(true);
    expect(isHeroCarouselImageName('notes.pdf')).toBe(false);
    expect(isHeroCarouselImageName('unisex-softstyle-t-shirt-placeholder-do-not-publish.jpg')).toBe(false);
    expect(sanitizeHeroCarouselFileName('ab9f (1).png')).toBe('ab9f-1.png');
  });

  it('builds a sliding track with clones so the last slide can wrap to the first', () => {
    expect(buildHeroCarouselTrack(['a'])).toEqual(['a']);
    expect(buildHeroCarouselTrack(['a', 'b', 'c'])).toEqual(['c', 'a', 'b', 'c', 'a']);
    expect(initialHeroCarouselTrackIndex(3)).toBe(1);
    expect(initialHeroCarouselTrackIndex(1)).toBe(0);
    expect(realIndexFromTrack(1, 3)).toBe(0);
    expect(realIndexFromTrack(3, 3)).toBe(2);
    expect(realIndexFromTrack(0, 3)).toBe(2);
    expect(realIndexFromTrack(4, 3)).toBe(0);
    expect(wrappedHeroCarouselTrackIndex(0, 3)).toBe(3);
    expect(wrappedHeroCarouselTrackIndex(4, 3)).toBe(1);
    expect(wrappedHeroCarouselTrackIndex(2, 3)).toBeNull();
  });

  it('adds fetched images, skips duplicates, and keeps removed slides off the carousel', () => {
    const seed = seedHeroCarouselSlides(['one.png', 'two.png']);
    let store = emptyHeroCarouselStore();
    expect(visibleHeroCarouselSlides(store, seed).map((slide) => slide.name)).toEqual(['one.png', 'two.png']);

    store = removeHeroCarouselSlide(store, seed[0]!);
    expect(visibleHeroCarouselSlides(store, seed).map((slide) => slide.name)).toEqual(['two.png']);

    const fetched = mergeFetchedHeroSlides(store, [
      { name: 'one.png', src: '/images/hero-carousel/one.png' },
      { name: 'three.png', src: '/images/hero-carousel/three.png' },
      { name: 'notes.txt', src: '/nope' },
    ]);
    expect(fetched.added).toBe(1);
    expect(fetched.skipped).toBe(2);
    expect(visibleHeroCarouselSlides(fetched.store, seed).map((slide) => slide.name)).toEqual([
      'two.png',
      'three.png',
    ]);
    expect(describeHeroCarouselFetch(1, 2)).toMatch(/Added 1 image/);

    store = addHeroCarouselSlides(fetched.store, [
      { id: 'up-1', name: 'four.png', src: 'blob:n/a', origin: 'upload', blobId: 'up-1' },
    ]);
    store = removeHeroCarouselSlide(store, { id: 'up-1', name: 'four.png' });
    expect(visibleHeroCarouselSlides(store, seed).some((slide) => slide.name === 'four.png')).toBe(false);

    expect(wrapCarouselIndex(5, 4)).toBe(1);
    expect(wrapCarouselIndex(-1, 4)).toBe(3);
    expect(wrapCarouselIndex(0, 0)).toBe(0);
    expect(parseHeroCarouselStore({ removedNames: ['Two.PNG'], extras: [{ id: 'x', name: 'x.png', origin: 'folder' }] }).removedNames).toEqual(
      ['two.png'],
    );
    expect(parseHeroCarouselSyncResponse(false, null).error).toMatch(/localhost/);
    expect(parseHeroCarouselSyncResponse(true, { ok: true, files: [{ name: 'new.png', src: '/images/hero-carousel/new.png' }] }).files).toEqual(
      [{ name: 'new.png', src: '/images/hero-carousel/new.png' }],
    );
  });
});
