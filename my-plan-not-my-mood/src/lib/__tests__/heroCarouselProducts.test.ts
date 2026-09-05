import { describe, expect, it } from 'vitest';
import {
  CAROUSEL_GEAR_BY_FILE,
  carouselGearTargetForSlide,
  gearKindForHandle,
  gearProductAnchorId,
  gearProductPath,
  parseGearKindFromPath,
  parseGearProductHandle,
} from '../heroCarouselProducts';

describe('heroCarouselProducts', () => {
  it('maps lifestyle slides to gear products and builds in-site paths', () => {
    expect(carouselGearTargetForSlide('angela-white-tee.jpg')).toEqual({
      handle: 'unisex-softstyle-logo-tee',
      kind: 'tee',
    });
    expect(carouselGearTargetForSlide('15036882-90f2-4929-9fea-7c2366c1dd32.png')).toEqual({
      handle: 'unisex-softstyle-letters-tee',
      kind: 'tee',
    });
    expect(carouselGearTargetForSlide('5fbc5987-55bd-40f0-a416-5d78555cf8e2.png')).toEqual({
      handle: 'unisex-college-hoodie-r-w-g',
      kind: 'hoodie',
    });
    expect(gearProductPath({ handle: 'unisex-softstyle-letters-tee', kind: 'tee' })).toBe(
      '/gear#product-unisex-softstyle-letters-tee',
    );
    expect(gearProductPath({ handle: 'low-profile-baseball-cap', kind: 'hat' })).toBe(
      '/gear/hats#product-low-profile-baseball-cap',
    );
    expect(Object.keys(CAROUSEL_GEAR_BY_FILE).length).toBeGreaterThan(5);
  });

  it('reads gear kind and product handle from the URL', () => {
    expect(parseGearKindFromPath('/gear')).toBe('tee');
    expect(parseGearKindFromPath('/gear/hoodies')).toBe('hoodie');
    expect(parseGearKindFromPath('/gear/hats?x=1')).toBe('hat');
    expect(parseGearProductHandle('#product-unisex-softstyle-logo-tee')).toBe('unisex-softstyle-logo-tee');
    expect(parseGearProductHandle('')).toBe('');
    expect(gearProductAnchorId('my-plan-unisex-college-hoodie-6-colors')).toBe(
      'product-my-plan-unisex-college-hoodie-6-colors',
    );
    expect(gearKindForHandle('unisex-college-hoodie-r-w-g')).toBe('hoodie');
    expect(gearKindForHandle('low-profile-baseball-cap')).toBe('hat');
    expect(carouselGearTargetForSlide('unknown-slide.png').handle).toBeTruthy();
  });
});
