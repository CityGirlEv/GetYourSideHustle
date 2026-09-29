import { describe, expect, it } from 'vitest';
import { FOOTER_COMMON_LINK_IDS, launchPageById } from '../launchPages';
import { HEADER_PUBLIC_LINKS, parseStoreRoute, routePath, type StoreRoute } from '../storeRoutes';
import {
  footerPublicLinkDestinations,
  headerPublicLinkDestinations,
  inPageCollectionLinkDestinations,
  playwrightClickableDestinations,
  publicHeaderHasNoListLink,
  publicSitemapLinkDestinations,
  urlMatchesExpectedPath,
} from '../siteLinkDestinations';

describe('siteLinkDestinations', () => {
  it('maps every public header control to a destination, including FAQ, About, Contact, and Shop Gear', () => {
    const header = headerPublicLinkDestinations();
    expect(header.map((link) => link.label)).toEqual(
      expect.arrayContaining(['Home', 'FAQ', 'About', 'Contact', 'Accountability Gear']),
    );
    expect(header.map((link) => link.label)).not.toContain("What's Your Mood?");
    expect(header.map((link) => link.label)).not.toContain('Plan Receipts');
    for (const link of HEADER_PUBLIC_LINKS) {
      expect(header.find((row) => row.id === `header-${link.route}`)?.expectedPath).toBe(
        routePath(link.route as StoreRoute),
      );
    }
    expect(header.find((link) => link.id === 'header-shop-gear')?.expectedPath).toBe('/gear');
    expect(header.find((link) => link.id === 'header-shop-menu-gear')?.label).toBe('Accountability Gear → Gear');
    expect(header.find((link) => link.id === 'header-shop-menu-gear')?.expectedPath).toBe('/gear');
    expect(header.find((link) => link.id === 'header-shop-menu-gear')?.testId).toBe('header-shop-menu-gear');
    expect(publicHeaderHasNoListLink()).toBe(true);
    expect(header.some((link) => /list/i.test(link.label) && !link.gatedToJoin)).toBe(false);
  });

  it('maps every footer common link and shop/pay/sitemap destinations', () => {
    const footer = footerPublicLinkDestinations();
    for (const id of FOOTER_COMMON_LINK_IDS) {
      expect(footer.find((link) => link.id === `footer-${id}`)?.expectedPath).toBe(launchPageById(id).path);
    }
    expect(footer.find((link) => link.id === 'footer-sitemap')?.expectedPath).toBe('/sitemap');
    expect(footer.find((link) => link.id === 'footer-pay')?.expectedPath).toBe('/pay');
    expect(footer.find((link) => link.id === 'footer-collections')?.expectedPath).toBe('/gear');
    expect(inPageCollectionLinkDestinations().map((link) => link.expectedPath)).toEqual([
      'https://snatchvault.com/collections/my-plan-gear',
      'https://snatchvault.com/collections/my-plan-hoodie-collection',
      'https://snatchvault.com/collections/my-plan-sports-hat',
      'https://snatchvault.com/collections/non-negotiables-letter-tees',
    ]);
    expect(inPageCollectionLinkDestinations().every((link) => link.external)).toBe(true);
  });

  it('treats privacy and terms aliases as the same page', () => {
    expect(urlMatchesExpectedPath('https://nonnegotiation.com/privacy', '/privacy-policy')).toBe(true);
    expect(urlMatchesExpectedPath('https://nonnegotiation.com/privacy-policy', '/privacy')).toBe(true);
    expect(urlMatchesExpectedPath('https://nonnegotiation.com/terms-of-use', '/terms')).toBe(true);
    expect(urlMatchesExpectedPath('https://nonnegotiation.com/gear/hoodies', '/gear')).toBe(false);
    expect(urlMatchesExpectedPath('https://nonnegotiation.com/gear/hoodies', '/gear/hoodies')).toBe(true);
    expect(urlMatchesExpectedPath('https://nonnegotiation.com/#mood-tool', '/#mood-tool')).toBe(true);
  });

  it('covers every public sitemap leaf that has a path', () => {
    const sitemap = publicSitemapLinkDestinations();
    expect(sitemap.some((link) => link.expectedPath === '/')).toBe(true);
    expect(sitemap.some((link) => link.expectedPath === '/about')).toBe(true);
    expect(sitemap.some((link) => link.expectedPath === '/gear')).toBe(true);
    expect(sitemap.some((link) => link.expectedPath === '/privacy-policy')).toBe(true);
    expect(sitemap.every((link) => !link.expectedPath.startsWith('/admin'))).toBe(true);
    expect(sitemap.some((link) => link.expectedPath === '/join')).toBe(false);
    for (const leaf of sitemap) {
      if (leaf.expectedPath.startsWith('/#')) {
        expect(parseStoreRoute(leaf.expectedPath)).toBe('home');
        continue;
      }
      expect(parseStoreRoute(leaf.expectedPath)).not.toBeNull();
    }
  });

  it('exposes clickable header and footer cases with test ids for Playwright', () => {
    const clickable = playwrightClickableDestinations();
    expect(clickable.every((link) => Boolean(link.testId))).toBe(true);
    expect(clickable.every((link) => !link.gatedToJoin && !link.comingSoonDisabled)).toBe(true);
    expect(clickable.map((link) => link.testId)).toEqual(
      expect.arrayContaining([
        'header-nav-home',
        'header-nav-faq',
        'header-nav-about',
        'header-nav-contact',
        'header-shop-gear',
        'header-shop-menu-gear',
        'footer-sitemap',
        'footer-privacy',
        'shopify-hoodie-page-link',
        'shopify-all-page-link',
      ]),
    );
  });
});
