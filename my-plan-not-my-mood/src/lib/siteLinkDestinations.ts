import { GEAR_PAGE_LABEL, GEAR_SHOP_LABEL } from './gearSelections';
import { FOOTER_COMMON_LINK_IDS, launchPageById } from './launchPages';
import { APP_SITE_TREE, filterSiteTree, flattenLeaves } from './siteMap';
import {
  SHOPIFY_PUBLIC_COLLECTIONS,
  shopifyPublicCollectionUrl,
} from './shopifyStore';
import { HEADER_PUBLIC_LINKS, parseStoreRoute, routePath, type StoreRoute } from './storeRoutes';

export type PublicLinkArea = 'header' | 'footer' | 'sitemap' | 'in-page' | 'alias';

export type PublicLinkDestination = {
  id: string;
  area: PublicLinkArea;
  label: string;
  expectedPath: string;
  testId?: string;
  gatedToJoin?: boolean;
  guestOpensAuth?: boolean;
  comingSoonDisabled?: boolean;
  scrollTarget?: string;
  external?: boolean;
};

function splitPathHash(path: string): { pathname: string; hash: string } {
  const [pathname = '/', hashPart = ''] = path.split('#');
  return {
    pathname: pathname.replace(/\/$/, '') || '/',
    hash: hashPart,
  };
}

/** True when a live URL landed on the mapped destination (including privacy/terms aliases). */
export function urlMatchesExpectedPath(url: string, expectedPath: string): boolean {
  const parsed = new URL(url, 'https://nonnegotiation.com');
  const actualPath = parsed.pathname.replace(/\/$/, '') || '/';
  const actualHash = parsed.hash.replace(/^#/, '');
  const expected = splitPathHash(expectedPath);

  if (expected.hash) {
    return actualPath === expected.pathname && actualHash === expected.hash;
  }

  if (actualPath === expected.pathname) return true;

  const actualRoute = parseStoreRoute(actualPath);
  const expectedRoute = parseStoreRoute(expected.pathname);
  if (actualRoute === 'home' || expectedRoute === 'home') return false;
  if (actualPath.startsWith('/gear/') || expected.pathname.startsWith('/gear/')) {
    return actualPath === expected.pathname;
  }
  return actualRoute === expectedRoute;
}

export function headerPublicLinkDestinations(): PublicLinkDestination[] {
  return [
    { id: 'header-home', area: 'header', label: 'Home', expectedPath: '/', testId: 'header-nav-home' },
    ...HEADER_PUBLIC_LINKS.map((link) => ({
      id: `header-${link.route}`,
      area: 'header' as const,
      label: link.label,
      expectedPath: routePath(link.route as StoreRoute),
      testId: `header-nav-${link.route}`,
    })),
    {
      id: 'header-shop-gear',
      area: 'header',
      label: GEAR_SHOP_LABEL,
      expectedPath: '/gear',
      testId: 'header-shop-gear',
    },
    {
      id: 'header-shop-menu-gear',
      area: 'header',
      label: `${GEAR_SHOP_LABEL} → Gear`,
      expectedPath: '/gear',
      testId: 'header-shop-menu-gear',
    },
    {
      id: 'header-planners',
      area: 'header',
      label: `${GEAR_SHOP_LABEL} → Planners`,
      expectedPath: '/planners',
      testId: 'header-shop-planners',
    },
    {
      id: 'header-affirmations',
      area: 'header',
      label: 'Affirmations (Join to Unlock)',
      expectedPath: '/join',
      testId: 'header-nav-affirmations',
      gatedToJoin: true,
      guestOpensAuth: true,
    },
    {
      id: 'header-challenge',
      area: 'header',
      label: '7-Day Challenge (Join to Unlock)',
      expectedPath: '/join',
      testId: 'header-nav-challenge',
      gatedToJoin: true,
      guestOpensAuth: true,
    },
    {
      id: 'header-workshops',
      area: 'header',
      label: `${GEAR_SHOP_LABEL} → Workshops`,
      expectedPath: '/gear',
      comingSoonDisabled: true,
    },
    {
      id: 'header-bundles',
      area: 'header',
      label: `${GEAR_SHOP_LABEL} → Bundles`,
      expectedPath: '/gear',
      comingSoonDisabled: true,
    },
    {
      id: 'header-gift-cards',
      area: 'header',
      label: `${GEAR_SHOP_LABEL} → Gift Cards`,
      expectedPath: '/gear',
      comingSoonDisabled: true,
    },
  ];
}

export function footerPublicLinkDestinations(): PublicLinkDestination[] {
  return [
    {
      id: 'footer-gear',
      area: 'footer',
      label: GEAR_SHOP_LABEL,
      expectedPath: '/gear',
      testId: 'footer-gear',
    },
    {
      id: 'footer-planners',
      area: 'footer',
      label: 'Planners & Desk Pads',
      expectedPath: '/planners',
      testId: 'footer-planners',
    },
    {
      id: 'footer-collections',
      area: 'footer',
      label: 'All Collections',
      expectedPath: '/gear',
      testId: 'footer-collections',
    },
    {
      id: 'footer-sitemap',
      area: 'footer',
      label: 'Site Map',
      expectedPath: '/sitemap',
      testId: 'footer-sitemap',
    },
    ...FOOTER_COMMON_LINK_IDS.map((id) => ({
      id: `footer-${id}`,
      area: 'footer' as const,
      label: launchPageById(id).navLabel ?? launchPageById(id).title,
      expectedPath: launchPageById(id).path,
      testId: `footer-${id}`,
    })),
    {
      id: 'footer-pay',
      area: 'footer',
      label: 'Make Payment',
      expectedPath: '/pay',
      testId: 'footer-pay',
    },
    {
      id: 'footer-beta',
      area: 'footer',
      label: 'Beta Tester Rewards',
      expectedPath: '/beta-rewards',
      testId: 'footer-beta-rewards',
    },
    {
      id: 'footer-beta-guide',
      area: 'footer',
      label: 'Beta Testing Guide',
      expectedPath: '/beta-guide',
      testId: 'footer-beta-guide',
    },
    {
      id: 'footer-mood',
      area: 'footer',
      label: 'Is Your Mood Your Plan? Tool',
      expectedPath: '/#mood-tool',
      testId: 'footer-mood',
      scrollTarget: 'mood-tool',
    },
    {
      id: 'footer-receipts',
      area: 'footer',
      label: '"What Won Today?" Receipt Builder',
      expectedPath: '/#receipts',
      testId: 'footer-receipts',
      scrollTarget: 'receipts',
    },
    {
      id: 'footer-challenge',
      area: 'footer',
      label: '7-Day Challenge (Join to Unlock)',
      expectedPath: '/join',
      testId: 'footer-challenge',
      gatedToJoin: true,
      guestOpensAuth: true,
    },
  ];
}

export function inPageCollectionLinkDestinations(): PublicLinkDestination[] {
  return SHOPIFY_PUBLIC_COLLECTIONS.map((collection) => ({
    id: `gear-${collection.id}`,
    area: 'in-page' as const,
    label: `Shop Gear → ${collection.heading}`,
    expectedPath: shopifyPublicCollectionUrl(collection.id),
    testId: `shopify-${collection.id}-page-link`,
    external: true,
  }));
}

export function publicPathAliases(): PublicLinkDestination[] {
  return [
    { id: 'alias-privacy', area: 'alias', label: 'Privacy Policy alias', expectedPath: '/privacy' },
    { id: 'alias-privacy-policy', area: 'alias', label: 'Privacy Policy', expectedPath: '/privacy-policy' },
    { id: 'alias-terms', area: 'alias', label: 'Terms of Use alias', expectedPath: '/terms' },
    { id: 'alias-terms-of-use', area: 'alias', label: 'Terms of Use', expectedPath: '/terms-of-use' },
    {
      id: 'alias-beta-tester-rewards',
      area: 'alias',
      label: 'Beta Tester Rewards alias',
      expectedPath: '/beta-tester-rewards',
    },
    {
      id: 'alias-beta-testing-guide',
      area: 'alias',
      label: 'Beta Testing Guide alias',
      expectedPath: '/beta-testing-guide',
    },
  ];
}

/** Public sitemap leaves that have a path a visitor can open. */
export function publicSitemapLinkDestinations(): PublicLinkDestination[] {
  return flattenLeaves(filterSiteTree(APP_SITE_TREE, false))
    .filter((leaf) => Boolean(leaf.path) && !String(leaf.path).startsWith('/admin'))
    .map((leaf) => ({
      id: `sitemap-${leaf.id}`,
      area: 'sitemap' as const,
      label: leaf.label,
      expectedPath: leaf.path as string,
    }));
}

export function allPublicLinkDestinations(): PublicLinkDestination[] {
  return [
    ...headerPublicLinkDestinations(),
    ...footerPublicLinkDestinations(),
    ...inPageCollectionLinkDestinations(),
    ...publicPathAliases(),
    ...publicSitemapLinkDestinations(),
  ];
}

/** Header/footer/in-page links Playwright can click and assert the URL. */
export function playwrightClickableDestinations(): PublicLinkDestination[] {
  return [
    ...headerPublicLinkDestinations(),
    ...footerPublicLinkDestinations(),
    ...inPageCollectionLinkDestinations(),
  ].filter((link) => Boolean(link.testId) && !link.gatedToJoin && !link.guestOpensAuth && !link.comingSoonDisabled);
}

export function publicHeaderHasNoListLink(): boolean {
  return !HEADER_PUBLIC_LINKS.some((link) => /list/i.test(`${link.route} ${link.label}`));
}

export function clickStepForLink(link: PublicLinkDestination): string {
  if (link.comingSoonDisabled) {
    return `Confirm header “${link.label}” is disabled Coming Soon and does not navigate`;
  }
  if (link.guestOpensAuth) {
    return `While logged out, click ${link.area} “${link.label}” and confirm Sign In / Register opens — not a free public tool`;
  }
  if (link.gatedToJoin) {
    return `Click ${link.area} “${link.label}” and confirm it goes to Join / Coming Soon — not a free public tool`;
  }
  if (link.external) {
    return `Click ${link.area} “${link.label}” and confirm it opens ${link.expectedPath} on the store`;
  }
  return `Click ${link.area} “${link.label}” and confirm it lands on ${link.expectedPath}`;
}
