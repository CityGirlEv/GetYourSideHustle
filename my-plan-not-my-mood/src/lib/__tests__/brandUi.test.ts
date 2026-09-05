import { describe, expect, it } from 'vitest';
import {
  BRAND_BUBBLE_ON_CLASS,
  BRAND_TAB_ACTIVE_CLASS,
  BRAND_TAB_IDLE_CLASS,
  BRAND_TAB_ROW_CLASS,
  brandControlIsTabNotPill,
  brandSelectedUsesBubbleOrange,
  brandTabClass,
} from '../brandUi';

describe('brandUi', () => {
  it('uses the bubble orange for selected surfaces, never black', () => {
    expect(BRAND_BUBBLE_ON_CLASS).toContain('bg-[#EA580C]');
    expect(BRAND_BUBBLE_ON_CLASS).toContain('text-white');
    expect(BRAND_BUBBLE_ON_CLASS).not.toContain('bg-[#1F1917]');
    expect(brandSelectedUsesBubbleOrange(BRAND_BUBBLE_ON_CLASS)).toBe(true);
    expect(brandSelectedUsesBubbleOrange('bg-[#1F1917] text-white')).toBe(false);
  });

  it('uses compact tabs instead of pill buttons', () => {
    expect(BRAND_TAB_ROW_CLASS).toContain('border-b-2');
    expect(brandTabClass(true)).toBe(BRAND_TAB_ACTIVE_CLASS);
    expect(brandTabClass(false)).toBe(BRAND_TAB_IDLE_CLASS);
    expect(brandControlIsTabNotPill(brandTabClass(true))).toBe(true);
    expect(brandControlIsTabNotPill(brandTabClass(false))).toBe(true);
    expect(brandControlIsTabNotPill('min-h-[44px] rounded-full border-2')).toBe(false);
  });
});
