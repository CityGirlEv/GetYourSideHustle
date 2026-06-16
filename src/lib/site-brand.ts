/** Canonical public product name — use everywhere instead of hardcoding. */
export const SITE_BRAND_NAME = "Get Part B Optimizer";

export const SITE_TAGLINE = "Let The Optimizer Find The Medicare Plan You Deserve!";

export function formatSiteCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${SITE_BRAND_NAME}. All rights reserved.`;
}
