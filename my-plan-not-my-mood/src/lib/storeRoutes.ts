import { LAUNCH_PAGE_IDS, type LaunchPageId } from './launchPages';

export type StoreRoute = 'home' | 'gear' | 'planners' | 'join' | 'pay' | 'sitemap' | LaunchPageId;

const LAUNCH_ROUTE_SET = new Set<string>(LAUNCH_PAGE_IDS);

export function isLaunchStoreRoute(route: string): route is LaunchPageId {
  return LAUNCH_ROUTE_SET.has(route);
}

export function parseStoreRoute(pathname: string): StoreRoute {
  const path = (pathname || '/').split('?')[0].split('#')[0];
  if (path === '/gear' || path.startsWith('/gear/')) return 'gear';
  if (path === '/planners' || path.startsWith('/planners/')) return 'planners';
  if (path === '/join' || path.startsWith('/join/')) return 'join';
  if (path === '/pay' || path.startsWith('/pay/')) return 'pay';
  if (path === '/sitemap' || path.startsWith('/sitemap/')) return 'sitemap';
  const launchId = path.replace(/^\/+/, '').split('/')[0];
  if (isLaunchStoreRoute(launchId) && (path === `/${launchId}` || path.startsWith(`/${launchId}/`))) {
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
    case 'home':
      return '/';
    default:
      return `/${route}`;
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
