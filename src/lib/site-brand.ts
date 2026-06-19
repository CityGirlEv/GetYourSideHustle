/** Short product name — page titles, copyright, logo alt. */
export const SITE_BRAND_NAME = "Part B Optimizer";

/** Use in running sentences (subject/object): “The Part B Optimizer helps…” */
export const SITE_BRAND_THE = "The Part B Optimizer";

export const SITE_TAGLINE_LINE_1 = "Let The Part B Optimizer Show You";
export const SITE_TAGLINE_LINE_2 = "The Medicare Plan You Deserve!";
export const SITE_TAGLINE = `${SITE_TAGLINE_LINE_1} ${SITE_TAGLINE_LINE_2}`;

export function formatSiteCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${SITE_BRAND_NAME}. All rights reserved.`;
}
