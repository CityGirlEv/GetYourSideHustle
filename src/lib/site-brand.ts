/** Short product name — page titles, copyright, logo alt. */
export const SITE_BRAND_NAME = "Part B Optimizer";

/** Use in running sentences (subject/object): “The Part B Optimizer helps…” */
export const SITE_BRAND_THE = "The Part B Optimizer";

/** Email sign-off line — no leading “The”. */
export const SITE_BRAND_TEAM_SIGNATURE = `${SITE_BRAND_NAME} Team`;

export const SITE_TAGLINE_LINE_1 = "Let Part B Optimizer Show You";
export const SITE_TAGLINE_LINE_2 = "The Medicare Plan You Deserve!";
export const SITE_TAGLINE = `${SITE_TAGLINE_LINE_1} ${SITE_TAGLINE_LINE_2}`;

export function formatSiteCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${SITE_BRAND_NAME}. All rights reserved.`;
}

/** Strip legacy “Get Part B …” branding from stored copy (email overrides, etc.). */
export function normalizeLegacyBrandText(content: string): string {
  if (!content) return content;
  let result = content;
  const replacements: Array<[string, string]> = [
    [`${SITE_BRAND_THE} Team`, SITE_BRAND_TEAM_SIGNATURE],
    [`${SITE_BRAND_THE} team`, SITE_BRAND_TEAM_SIGNATURE],
    ["The Get Part B Optimizer Team", SITE_BRAND_TEAM_SIGNATURE],
    ["The Get Part B Optimizer team", SITE_BRAND_TEAM_SIGNATURE],
    ["Get Get Part B Optimizer", SITE_BRAND_NAME],
    ["GET PART B OPTIMIZER", SITE_BRAND_NAME.toUpperCase()],
    ["The Get Part B Optimizer", SITE_BRAND_THE],
    ["Get Part B Optimizer", SITE_BRAND_NAME],
    ["Get Part B", "Part B"],
  ];
  for (const [from, to] of replacements) {
    if (!result.includes(from)) continue;
    result = result.split(from).join(to);
  }
  return result;
}

/** Recursively normalize legacy brand strings inside JSON draft payloads. */
export function normalizeLegacyBrandJson(value: unknown): unknown {
  if (typeof value === "string") return normalizeLegacyBrandText(value);
  if (Array.isArray(value)) return value.map(normalizeLegacyBrandJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalizeLegacyBrandJson(nested)]),
    );
  }
  return value;
}
