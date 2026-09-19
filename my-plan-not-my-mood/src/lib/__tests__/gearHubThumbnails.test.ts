import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { MAX_UPLOAD_BYTES } from '../uploadLimits';
import {
  GEAR_HUB_CAROUSEL_MAX_SLIDES,
  GEAR_HUB_SEED_FILES,
  GEAR_HUB_SOURCE_FOLDER,
  GEAR_HUB_THUMBNAIL_SLOTS,
  GEAR_HUB_THUMBNAIL_STORAGE_KEY,
  addGearHubCarouselSlide,
  canManageGearHubThumbnails,
  clearGearHubThumbnail,
  emptyGearHubThumbnailStore,
  gearHubDisplayedSrc,
  gearHubSlidesFor,
  gearHubThumbnailFileError,
  gearHubThumbnailFor,
  gearHubVisibleSlides,
  isGearHubThumbnailImageName,
  isGearHubThumbnailSlot,
  loadGearHubThumbnailStore,
  parseGearHubThumbnailStore,
  hideGearHubGallerySlide,
  persistGearHubThumbnailStore,
  removeGearHubCarouselSlide,
  sanitizeGearHubThumbnailFileName,
  wrapGearHubCarouselIndex,
  gearHubSlideImageKey,
  pickGearHubDistinctIndexes,
  nextGearHubDistinctIndex,
  pickGearHubRandomUnusedIndex,
  advanceGearHubDistinctIndexes,
} from '../gearHubThumbnails';

describe('gearHubThumbnails', () => {
  it('lets admins replace hub card photos and rejects everyone else', () => {
    expect(GEAR_HUB_THUMBNAIL_SLOTS).toEqual(['all', 'tee', 'hoodie', 'hat', '90day', 'deskpad']);
    expect(isGearHubThumbnailSlot('tee')).toBe(true);
    expect(isGearHubThumbnailSlot('journal')).toBe(false);
    expect(canManageGearHubThumbnails('super_admin')).toBe(true);
    expect(canManageGearHubThumbnails('admin')).toBe(true);
    expect(canManageGearHubThumbnails('qa')).toBe(false);
    expect(canManageGearHubThumbnails('member')).toBe(false);
    expect(canManageGearHubThumbnails(null)).toBe(false);
    expect(canManageGearHubThumbnails(undefined)).toBe(false);
  });

  it('stores multiple uploaded photos per collection and can revert to the default', () => {
    expect(sanitizeGearHubThumbnailFileName('C:\\\\Photos\\\\All Gear.PNG')).toBe('all-gear.png');
    expect(isGearHubThumbnailImageName('look.jpg')).toBe(true);
    expect(isGearHubThumbnailImageName('notes.pdf')).toBe(false);
    expect(gearHubThumbnailFileError({ name: 'look.jpg', size: 12, type: 'image/jpeg' })).toBeNull();
    expect(gearHubThumbnailFileError({ name: 'look.jpg', size: 0, type: 'image/jpeg' })).toMatch(/choose a photo/i);
    expect(
      gearHubThumbnailFileError({ name: 'look.jpg', size: MAX_UPLOAD_BYTES + 1, type: 'image/jpeg' }),
    ).toMatch(/20 MB/);
    expect(gearHubThumbnailFileError({ name: 'notes.pdf', size: 12, type: 'application/pdf' })).toMatch(
      /jpeg, png, webp, or gif/i,
    );
    expect(wrapGearHubCarouselIndex(-1, 3)).toBe(2);
    expect(wrapGearHubCarouselIndex(3, 3)).toBe(0);
    expect(wrapGearHubCarouselIndex(1, 0)).toBe(0);

    const first = addGearHubCarouselSlide(emptyGearHubThumbnailStore(), 'all', {
      id: 'blob-1',
      name: 'all-gear.png',
      blobId: 'blob-1',
    });
    expect(first.error).toBeUndefined();
    expect(gearHubThumbnailFor(first.store, 'all')?.blobId).toBe('blob-1');
    expect(gearHubDisplayedSrc(first.store, 'all', '/images/collection/logo-tee.jpg')).toBe(
      '/images/collection/logo-tee.jpg',
    );
    expect(
      gearHubDisplayedSrc(
        { slides: [{ id: 'b', slot: 'all', name: 'a.png', blobId: 'b', src: 'blob:1' }], removedSeedIds: [] },
        'all',
        '/fallback',
      ),
    ).toBe('blob:1');
    expect(
      gearHubVisibleSlides(emptyGearHubThumbnailStore(), 'tee', { src: '/fallback-tee.jpg', alt: 'Tee' })
        .some((slide) => slide.src === '/images/hero-carousel/angela-white-tee.jpg' && !slide.uploaded),
    ).toBe(true);
    expect(gearHubVisibleSlides(emptyGearHubThumbnailStore(), 'tee')[0]?.uploaded).toBe(false);

    const second = addGearHubCarouselSlide(first.store, 'all', { id: 'blob-2', name: 'better.webp', blobId: 'blob-2' });
    expect(second.error).toBeUndefined();
    expect(gearHubSlidesFor(second.store, 'all').map((slide) => slide.name)).toEqual(['all-gear.png', 'better.webp']);
    expect(
      gearHubVisibleSlides(
        {
          slides: [
            { id: 'blob-1', slot: 'all', name: 'all-gear.png', blobId: 'blob-1', src: 'blob:1' },
            { id: 'blob-2', slot: 'all', name: 'better.webp', blobId: 'blob-2', src: 'blob:2' },
          ],
          removedSeedIds: [],
        },
        'all',
        { src: '/fallback', alt: 'All Gear' },
      ).map((slide) => slide.id),
    ).toEqual([
      ...gearHubVisibleSlides(emptyGearHubThumbnailStore(), 'all').map((slide) => slide.id),
      'blob-1',
      'blob-2',
    ]);

    const removed = removeGearHubCarouselSlide(second.store, 'blob-1');
    expect(removed.removedBlobId).toBe('blob-1');
    expect(gearHubSlidesFor(removed.store, 'all')).toHaveLength(1);

    const seed = gearHubVisibleSlides(emptyGearHubThumbnailStore(), 'tee')[0]!;
    const hiddenSeed = hideGearHubGallerySlide(emptyGearHubThumbnailStore(), seed.id);
    expect(hiddenSeed.error).toBeUndefined();
    expect(hiddenSeed.store.removedSeedIds).toContain(seed.id);
    expect(gearHubVisibleSlides(hiddenSeed.store, 'tee').some((slide) => slide.id === seed.id)).toBe(false);
    expect(hideGearHubGallerySlide(emptyGearHubThumbnailStore(), '').error).toMatch(/choose a photo to remove/i);
    const restored = clearGearHubThumbnail(hiddenSeed.store, 'tee');
    expect(restored.store.removedSeedIds).toEqual([]);
    expect(gearHubVisibleSlides(restored.store, 'tee')[0]?.id).toBe(seed.id);

    const cleared = clearGearHubThumbnail(second.store, 'all');
    expect(cleared.removedBlobIds).toEqual(['blob-1', 'blob-2']);
    expect(gearHubThumbnailFor(cleared.store, 'all')).toBeUndefined();

    expect(addGearHubCarouselSlide(first.store, 'nope', { name: 'x.png', blobId: 'z' }).error).toMatch(/gear card/i);
    expect(addGearHubCarouselSlide(first.store, 'tee', { name: 'x.pdf', blobId: 'z' }).error).toMatch(/jpeg/i);
    expect(addGearHubCarouselSlide(first.store, 'hat', { name: 'x.png', blobId: '' }).error).toMatch(/choose a photo/i);
    expect(addGearHubCarouselSlide(first.store, 'all', { id: 'blob-1', name: 'dup.png', blobId: 'blob-1' }).error).toMatch(
      /already/i,
    );

    let capped = emptyGearHubThumbnailStore();
    for (let i = 0; i < GEAR_HUB_CAROUSEL_MAX_SLIDES; i += 1) {
      capped = addGearHubCarouselSlide(capped, 'hoodie', { id: `h-${i}`, name: `h-${i}.jpg`, blobId: `h-${i}` }).store;
    }
    expect(addGearHubCarouselSlide(capped, 'hoodie', { id: 'h-extra', name: 'extra.jpg', blobId: 'h-extra' }).error).toMatch(
      /12 photos/i,
    );
  });

  it('persists carousel slides without blob URLs, migrates one-photo thumbs, and skips junk', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    persistGearHubThumbnailStore(
      {
        slides: [{ id: 'id-9', slot: 'hoodie', name: 'hoodie.jpg', blobId: 'id-9', src: 'blob:http://local/9' }],
        removedSeedIds: ['seed-hoodie-0-hoodie-green.jpg', 'nope'],
      },
      storage,
    );
    expect(storage.setItem).toHaveBeenCalledWith(
      GEAR_HUB_THUMBNAIL_STORAGE_KEY,
      JSON.stringify({
        slides: [{ id: 'id-9', slot: 'hoodie', name: 'hoodie.jpg', blobId: 'id-9' }],
        removedSeedIds: ['seed-hoodie-0-hoodie-green.jpg'],
      }),
    );
    expect(
      parseGearHubThumbnailStore({
        slides: [{ id: 't1', slot: 'tee', name: 'tee.png', blobId: 't1' }, { slot: 'nope' }],
      }).slides,
    ).toEqual([{ id: 't1', slot: 'tee', name: 'tee.png', blobId: 't1' }]);
    expect(
      parseGearHubThumbnailStore({ thumbs: [{ slot: 'hat', name: 'hat.jpg', blobId: 'h1' }] }).slides,
    ).toEqual([{ id: 'h1', slot: 'hat', name: 'hat.jpg', blobId: 'h1' }]);
    storage.getItem.mockReturnValue(JSON.stringify({ slides: [{ id: 'h1', slot: 'hat', name: 'hat.jpg', blobId: 'h1' }] }));
    expect(loadGearHubThumbnailStore(storage).slides[0]?.slot).toBe('hat');
    expect(loadGearHubThumbnailStore(null).slides).toEqual([]);
    expect(parseGearHubThumbnailStore(null).slides).toEqual([]);
    expect(
      parseGearHubThumbnailStore({ slides: [], removedSeedIds: ['seed-tee-0-angela-white-tee.jpg', 'junk'] }).removedSeedIds,
    ).toEqual(['seed-tee-0-angela-white-tee.jpg']);
  });

  it('seeds each collection carousel from local WebsiteSS photos', () => {
    expect(GEAR_HUB_SOURCE_FOLDER).toMatch(/MyPlanNotMood\\Images$/);
    for (const slot of GEAR_HUB_THUMBNAIL_SLOTS) {
      expect(GEAR_HUB_SEED_FILES[slot].length).toBeGreaterThan(0);
      expect(GEAR_HUB_SEED_FILES[slot].join(' ')).not.toMatch(/placeholder-do-not-publish/i);
    }
    expect(existsSync(resolve(process.cwd(), 'public/images/gear-hub/hat-white.png'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/images/gear-hub/hoodie-lifestyle.png'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/images/hero-carousel/angela-white-tee.jpg'))).toBe(true);
  });

  it('picks random gallery photos without showing the same file on two cards', () => {
    expect(gearHubSlideImageKey('/images/hero-carousel/angela-white-tee.jpg?v=1')).toBe(
      '/images/hero-carousel/angela-white-tee.jpg',
    );
    const overlapping = [
      ['/a.jpg', '/b.jpg', '/c.jpg'],
      ['/a.jpg', '/d.jpg'],
      ['/a.jpg', '/e.jpg'],
      ['/b.jpg', '/f.jpg'],
    ];
    const alwaysFirst = () => 0;
    const started = pickGearHubDistinctIndexes(overlapping, alwaysFirst);
    const startKeys = overlapping.map((keys, index) => keys[started[index]]!);
    expect(startKeys).toEqual(['/a.jpg', '/d.jpg', '/e.jpg', '/b.jpg']);
    expect(new Set(startKeys).size).toBe(4);

    const next = nextGearHubDistinctIndex(['/a.jpg', '/d.jpg'], 1, new Set(['/a.jpg', '/e.jpg', '/b.jpg']), -1);
    expect(next).toBe(1);

    const randomUnused = pickGearHubRandomUnusedIndex(
      ['/a.jpg', '/b.jpg', '/c.jpg'],
      0,
      new Set(['/b.jpg']),
      () => 0,
    );
    expect(randomUnused).toBe(2);

    const advanced = advanceGearHubDistinctIndexes(overlapping, started, [false, false, false, false], () => 0);
    const advancedKeys = overlapping.map((keys, index) => keys[advanced[index]]!);
    expect(new Set(advancedKeys).size).toBe(4);
    expect(advanced.some((index, slot) => index !== started[slot])).toBe(true);
  });
});
