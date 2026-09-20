import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BRAND_BUBBLE_ON_CLASS,
  BRAND_TAB_ACTIVE_CLASS,
  BRAND_TAB_IDLE_CLASS,
  BRAND_TAB_ROW_CLASS,
  PAGE_CANVAS_CLASS,
  PAGE_CANVAS_HEX,
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

  it('uses the home cream as the public page canvas', () => {
    expect(PAGE_CANVAS_HEX).toBe('#F6F0E6');
    expect(PAGE_CANVAS_CLASS).toBe('bg-[#F6F0E6]');
    const files = [
      'src/App.tsx',
      'src/components/JoinPage.tsx',
      'src/components/LaunchPage.tsx',
      'src/components/ShopGearPage.tsx',
      'src/components/ProductGrid.tsx',
      'src/components/MakePaymentPage.tsx',
      'src/components/SiteMapPage.tsx',
      'src/components/BetaRewardsPage.tsx',
      'src/components/BetaTestingGuidePage.tsx',
      'src/components/Header.tsx',
      'src/components/Footer.tsx',
      'index.html',
    ];
    for (const file of files) {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(source.includes('PAGE_CANVAS_CLASS') || source.includes('bg-[#F6F0E6]')).toBe(true);
    }
  });
});
