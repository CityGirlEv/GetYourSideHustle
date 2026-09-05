export type StoreRoute = 'home' | 'gear' | 'planners' | 'join' | 'pay' | 'sitemap';

export function parseStoreRoute(pathname: string): StoreRoute {
  const path = (pathname || '/').split('?')[0].split('#')[0];
  if (path === '/gear' || path.startsWith('/gear/')) return 'gear';
  if (path === '/planners' || path.startsWith('/planners/')) return 'planners';
  if (path === '/join' || path.startsWith('/join/')) return 'join';
  if (path === '/pay' || path.startsWith('/pay/')) return 'pay';
  if (path === '/sitemap' || path.startsWith('/sitemap/')) return 'sitemap';
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
    default:
      return '/';
  }
}

export function isStoreSubPage(route: StoreRoute): boolean {
  return route !== 'home';
}
