/** Canonical public product name — use everywhere instead of hardcoding. */
export const SITE_BRAND_NAME = "Get Part B Optimizer";

export function formatSiteCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${SITE_BRAND_NAME}. All rights reserved.`;
}
