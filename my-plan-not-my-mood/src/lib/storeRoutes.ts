import { BETA_REWARDS_PATH, isBetaRewardsPath } from './betaRewards';
import { BETA_TESTING_GUIDE_PATH, isBetaTestingGuidePath } from './betaTestingGuide';
import { launchPageById, resolveLaunchPageId, type LaunchPageId } from './launchPages';

export type StoreRoute =
  | 'home'
  | 'gear'
  | 'planners'
  | 'join'
  | 'pay'
  | 'sitemap'
  | 'beta-rewards'
  | 'beta-guide'
  | LaunchPageId;

export const HEADER_PRIMARY_NAV_ORDER = ['home', 'shop', 'join', 'about', 'faq', 'contact'] as const;
export const HEADER_TRAILING_LINKS = [
  { route: 'about', label: 'About' },
  { route: 'faq', label: 'FAQ' },
  { route: 'contact', label: 'Contact' },
] as const;
export const HEADER_PUBLIC_LINKS = HEADER_TRAILING_LINKS;

export function isLaunchStoreRoute(route: string): route is LaunchPageId {
  return resolveLaunchPageId(route) === route;
}

export function parseStoreRoute(pathname: string): StoreRoute {
  const path = (pathname || '/').split('?')[0].split('#')[0];
  if (path === '/gear' || path.startsWith('/gear/')) return 'gear';
  if (path === '/planners' || path.startsWith('/planners/')) return 'planners';
  if (path === '/join' || path.startsWith('/join/')) return 'join';
  if (path === '/pay' || path.startsWith('/pay/')) return 'pay';
  if (path === '/sitemap' || path.startsWith('/sitemap/')) return 'sitemap';
  if (isBetaRewardsPath(path)) return 'beta-rewards';
  if (isBetaTestingGuidePath(path)) return 'beta-guide';
  const segment = path.replace(/^\/+/, '').split('/')[0];
  const launchId = resolveLaunchPageId(segment);
  if (launchId && (path === `/${segment}` || path.startsWith(`/${segment}/`))) {
    return launchId;
  }
  return 'home';
}

export function routePath(route: StoreRoute): string {
  switch (route) {
    case 'gear':
      return '/gear';
    case 'planners':
      return '/planners';
    case 'join':
      return '/join';
    case 'pay':
      return '/pay';
    case 'sitemap':
      return '/sitemap';
    case 'beta-rewards':
      return BETA_REWARDS_PATH;
    case 'beta-guide':
      return BETA_TESTING_GUIDE_PATH;
    case 'home':
      return '/';
    default:
      return launchPageById(route).path;
  }
}

export function isStoreSubPage(route: StoreRoute): boolean {
  return route !== 'home';
}

/** Map a sitemap path to an in-app store route. Admin paths stay out of the store. */
export function storeRouteFromSitePath(path?: string): StoreRoute | null {
  if (!path) return null;
  const clean = path.split('?')[0];
  if (clean.startsWith('/#')) return 'home';
  if (clean.startsWith('/admin')) return null;
  const route = parseStoreRoute(clean);
  if (route === 'home' && clean !== '/' && !clean.startsWith('/#')) return null;
  return route;
}
