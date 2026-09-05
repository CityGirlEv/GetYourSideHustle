import { describe, it, expect } from 'vitest';
import { parseStoreRoute, routePath } from '../storeRoutes';

describe('storeRoutes', () => {
  it('parses gear, planners, join, pay, sitemap, and home routes', () => {
    expect(parseStoreRoute('/')).toBe('home');
    expect(parseStoreRoute('/gear')).toBe('gear');
    expect(parseStoreRoute('/planners')).toBe('planners');
    expect(parseStoreRoute('/join')).toBe('join');
    expect(parseStoreRoute('/pay')).toBe('pay');
    expect(parseStoreRoute('/sitemap')).toBe('sitemap');
    expect(parseStoreRoute('/admin/pricing')).toBe('home');
  });

  it('maps routes to paths', () => {
    expect(routePath('gear')).toBe('/gear');
    expect(routePath('planners')).toBe('/planners');
    expect(routePath('join')).toBe('/join');
    expect(routePath('pay')).toBe('/pay');
    expect(routePath('sitemap')).toBe('/sitemap');
    expect(routePath('home')).toBe('/');
  });
});
