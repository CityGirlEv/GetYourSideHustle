/** Production URLs for seeded social / batch copy — never localhost. */
export const SEED_SITE_ORIGIN = "https://www.mypartb.com";

export function seedProductionUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SEED_SITE_ORIGIN}${normalized}`;
}
