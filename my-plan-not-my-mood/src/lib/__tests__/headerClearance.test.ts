import { describe, expect, it } from 'vitest';
import {
  ADMIN_STUDIO_HEADER_CLASS,
  ADMIN_STUDIO_HEADER_INNER_CLASS,
  ADMIN_STUDIO_MAIN_CLASS,
  HEADER_BRAND_SLOT_CLASS,
  HEADER_CONTENT_OFFSET,
  HEADER_MOBILE_MENU_CLASS,
  HEADER_MOBILE_OVERLAY_CLASS,
  HEADER_STICKY_CLASS,
  MOBILE_NAV_SECTION_LABELS,
  QUOTE_BAR_TRAILING_SPACE,
  headerBrandCanOverlapPage,
  headerOverflowClipsMenu,
} from '../headerClearance';

describe('headerClearance', () => {
  it('pins only the site header menu and lets the dropdown paint over the page', () => {
    expect(HEADER_STICKY_CLASS).toContain('sticky');
    expect(HEADER_STICKY_CLASS).toContain('top-0');
    expect(HEADER_STICKY_CLASS).toContain('z-[9999]');
    expect(headerOverflowClipsMenu(HEADER_STICKY_CLASS)).toBe(false);
    expect(HEADER_STICKY_CLASS).toContain('overflow-visible');
  });

  it('keeps the brand wordmark in document flow at every resolution', () => {
    expect(headerBrandCanOverlapPage(HEADER_BRAND_SLOT_CLASS)).toBe(false);
    expect(HEADER_BRAND_SLOT_CLASS).not.toContain('absolute');
  });

  it('stacks the mobile menu above page content instead of under it', () => {
    expect(HEADER_MOBILE_OVERLAY_CLASS).toContain('fixed');
    expect(HEADER_MOBILE_OVERLAY_CLASS).toContain('z-[10040]');
    expect(HEADER_MOBILE_MENU_CLASS).toContain('z-[10050]');
    expect(HEADER_MOBILE_MENU_CLASS).toContain('fixed');
    expect(HEADER_MOBILE_MENU_CLASS).toContain('bottom-0');
  });

  it('does not pin the Admin Studio bar so it cannot cover the site header', () => {
    expect(ADMIN_STUDIO_HEADER_CLASS).not.toMatch(/(?:^|\s)sticky(?:\s|$)/);
    expect(ADMIN_STUDIO_HEADER_CLASS).toContain('static');
    expect(ADMIN_STUDIO_HEADER_CLASS).toContain('border-b-2');
    expect(ADMIN_STUDIO_HEADER_INNER_CLASS).toContain('py-0');
    expect(ADMIN_STUDIO_MAIN_CLASS).toContain('pt-0');
  });

  it('groups the mobile menu into Shop, Tools, and Account sections', () => {
    expect(MOBILE_NAV_SECTION_LABELS).toEqual(['Shop', 'Tools', 'Account']);
  });

  it('reserves space under the sticky nav without pinning the quote over the hero', () => {
    expect(QUOTE_BAR_TRAILING_SPACE).toMatch(/pb-[23]/);
    expect(HEADER_CONTENT_OFFSET).toMatch(/pt-28|pt-32|pt-36/);
  });
});
