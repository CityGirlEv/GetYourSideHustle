/**
 * Home / storefront Beta welcome popup.
 * Shows on every browser load of the public site — never persist a "seen" flag.
 */
export function shouldShowBetaWelcome(pathname: string): boolean {
  const path = (pathname || '/').split('?')[0].split('#')[0];
  return !path.startsWith('/admin');
}
