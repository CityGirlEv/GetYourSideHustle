import { describe, expect, it } from 'vitest';
import {
  ADMIN_STUDIO_HEADER_CLASS,
  ADMIN_STUDIO_HEADER_INNER_CLASS,
  ADMIN_STUDIO_MAIN_CLASS,
  HEADER_BRAND_KICKER_CLASS,
  HEADER_BRAND_LINE_CLASS,
  HEADER_BRAND_SLOT_CLASS,
  HEADER_BRAND_TITLE_CLASS,
  HEADER_COMPACT_PAGE_OFFSET,
  HEADER_CONTENT_OFFSET,
  HEADER_DESKTOP_SPACER_CLASS,
  HEADER_MOBILE_MENU_CLASS,
  HEADER_MOBILE_OVERLAY_CLASS,
  HEADER_OVERLAY_OFFSET,
  HEADER_SPACER_FALLBACK_PX,
  HEADER_STICKY_CLASS,
  MOBILE_NAV_SECTION_LABELS,
  QUOTE_BAR_TRAILING_SPACE,
  headerBrandCanOverlapPage,
  headerOverflowClipsMenu,
  isCompactLaunchPage,
  launchPageContentOffset,
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
    expect(HEADER_BRAND_SLOT_CLASS).toContain('shrink-0');
    expect(HEADER_BRAND_SLOT_CLASS).toContain('md:pl-5');
    expect(HEADER_BRAND_SLOT_CLASS).not.toContain('min-w-0');
    expect(HEADER_BRAND_TITLE_CLASS).toContain('flex-row');
    expect(HEADER_BRAND_TITLE_CLASS).toContain('flex-nowrap');
    expect(HEADER_BRAND_TITLE_CLASS).not.toContain('flex-col');
    expect(HEADER_BRAND_LINE_CLASS).toContain('whitespace-nowrap');
    expect(HEADER_BRAND_KICKER_CLASS).toContain('whitespace-nowrap');
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
    expect(QUOTE_BAR_TRAILING_SPACE).toMatch(/py-0|pb-0/);
    expect(HEADER_CONTENT_OFFSET).toMatch(/md:pt-0/);
    expect(HEADER_OVERLAY_OFFSET).toMatch(/pt-28|pt-32|pt-36/);
    expect(isCompactLaunchPage('about')).toBe(true);
    expect(isCompactLaunchPage('faq')).toBe(true);
    expect(isCompactLaunchPage('contact')).toBe(true);
    expect(isCompactLaunchPage('privacy')).toBe(true);
    expect(isCompactLaunchPage('terms')).toBe(true);
    expect(isCompactLaunchPage('beta-guide')).toBe(true);
    expect(isCompactLaunchPage('join')).toBe(true);
    expect(launchPageContentOffset('about')).toBe(HEADER_COMPACT_PAGE_OFFSET);
    expect(launchPageContentOffset('beta-guide')).toBe(HEADER_COMPACT_PAGE_OFFSET);
    expect(launchPageContentOffset('join')).toBe(HEADER_COMPACT_PAGE_OFFSET);
    expect(launchPageContentOffset('faq')).toBe(HEADER_COMPACT_PAGE_OFFSET);
    expect(launchPageContentOffset('contact')).toBe(HEADER_COMPACT_PAGE_OFFSET);
    expect(launchPageContentOffset('privacy')).toBe(HEADER_COMPACT_PAGE_OFFSET);
    expect(launchPageContentOffset('terms')).toBe(HEADER_COMPACT_PAGE_OFFSET);
    expect(HEADER_COMPACT_PAGE_OFFSET).toMatch(/pt-0/);
    expect(HEADER_STICKY_CLASS).toContain('md:fixed');
    expect(HEADER_DESKTOP_SPACER_CLASS).toContain('hidden');
    expect(HEADER_DESKTOP_SPACER_CLASS).toContain('md:block');
    expect(HEADER_SPACER_FALLBACK_PX).toBeGreaterThan(80);
  });
});
