import { describe, it, expect } from 'vitest';
import { HEADER_PRIMARY_NAV_ORDER, HEADER_PUBLIC_LINKS, HEADER_TRAILING_LINKS, parseStoreRoute, routePath } from '../storeRoutes';

describe('storeRoutes', () => {
  it('parses gear, planners, join, pay, sitemap, and home routes', () => {
    expect(parseStoreRoute('/')).toBe('home');
    expect(parseStoreRoute('/gear')).toBe('gear');
    expect(parseStoreRoute('/planners')).toBe('planners');
    expect(parseStoreRoute('/join')).toBe('join');
    expect(parseStoreRoute('/pay')).toBe('pay');
    expect(parseStoreRoute('/sitemap')).toBe('sitemap');
    expect(parseStoreRoute('/about')).toBe('about');
    expect(parseStoreRoute('/contact')).toBe('contact');
    expect(parseStoreRoute('/privacy')).toBe('privacy');
    expect(parseStoreRoute('/privacy-policy')).toBe('privacy');
    expect(parseStoreRoute('/terms')).toBe('terms');
    expect(parseStoreRoute('/terms-of-use')).toBe('terms');
    expect(parseStoreRoute('/faq')).toBe('faq');
    expect(parseStoreRoute('/list')).toBe('list');
    expect(parseStoreRoute('/beta-rewards')).toBe('beta-rewards');
    expect(parseStoreRoute('/beta-tester-rewards')).toBe('beta-rewards');
    expect(parseStoreRoute('/beta-guide')).toBe('beta-guide');
    expect(parseStoreRoute('/beta-testing-guide')).toBe('beta-guide');
    expect(parseStoreRoute('/admin/pricing')).toBe('home');
  });

  it('maps routes to paths', () => {
    expect(routePath('gear')).toBe('/gear');
    expect(routePath('planners')).toBe('/planners');
    expect(routePath('join')).toBe('/join');
    expect(routePath('pay')).toBe('/pay');
    expect(routePath('sitemap')).toBe('/sitemap');
    expect(routePath('about')).toBe('/about');
    expect(routePath('privacy')).toBe('/privacy-policy');
    expect(routePath('terms')).toBe('/terms-of-use');
    expect(routePath('list')).toBe('/list');
    expect(routePath('beta-rewards')).toBe('/beta-rewards');
    expect(routePath('beta-guide')).toBe('/beta-guide');
    expect(routePath('home')).toBe('/');
    expect(routePath('faq')).toBe('/faq');
    expect(routePath('contact')).toBe('/contact');
  });

  it('puts FAQ, About, and Contact after Home, with Shop under Accountability Gear', () => {
    expect(HEADER_PRIMARY_NAV_ORDER).toEqual(['home', 'faq', 'about', 'contact']);
    expect(HEADER_PUBLIC_LINKS.map((link) => link.route)).toEqual(['faq', 'about', 'contact']);
    expect(HEADER_TRAILING_LINKS.map((link) => link.route)).toEqual(['faq', 'about', 'contact']);
  });
});
