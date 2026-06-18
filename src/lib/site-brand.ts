/** Canonical public product name — use everywhere instead of hardcoding. */
export const SITE_BRAND_NAME = "Get Part B Optimizer";

export const SITE_TAGLINE_LINE_1 = "Let Get Part B Optimizer Show You";
export const SITE_TAGLINE_LINE_2 = "The Medicare Plan You Deserve!";
export const SITE_TAGLINE = `${SITE_TAGLINE_LINE_1} ${SITE_TAGLINE_LINE_2}`;

export function formatSiteCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${SITE_BRAND_NAME}. All rights reserved.`;
}
