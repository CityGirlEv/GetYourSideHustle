/**
 * Income bands in the scenario wizard (IntakeWizard / voice / advisor edit).
 * Each range is $20k wide; the lowest band is under $15k (no gap below $15k).
 */
export const INCOME_BANDS = [
  "Under $15k",
  "$15k–$35k",
  "$35k–$55k",
  "$55k–$75k",
  "$75k–$95k",
  "$95k–$115k",
  "Over $115k",
  "Prefer not to say",
] as const;

/** Sensible default when the wizard opens (mid-range band). */
export const DEFAULT_INCOME_BAND: IncomeBand = "$55k–$75k";

export type IncomeBand = (typeof INCOME_BANDS)[number];

/** Form label — bands are annual household/modified adjusted gross income ranges. */
export const INCOME_BAND_FIELD_LABEL = "Income band (annually)";

export const INCOME_BAND_FIELD_TIP =
  "Annual income range helps estimate Extra Help (LIS) eligibility and monthly costs. We only store the band — never your exact annual income.";

const INCOME_BAND_SET = new Set<string>(INCOME_BANDS);

export function isIncomeBand(value: string): value is IncomeBand {
  return INCOME_BAND_SET.has(value);
}

/** QA test copy: `income band = {label}` */
export function formatIncomeBandForQaStep(band: IncomeBand): string {
  return `income band = ${band}`;
}

/** Parse `income band = …` from a SCEN-QA demographics or step string. */
export function parseIncomeBandFromDemographics(demographics: string): string | null {
  const m = demographics.match(/income band = ([^,|]+)/i);
  return m ? m[1].trim() : null;
}

/** 2026 federal poverty level for a single person — approximate; income bands are household MAGI ranges. */
export const FEDERAL_POVERTY_LEVEL_SINGLE_2026 = 15_060;

export const FEDERAL_POVERTY_LEVEL_NOTE =
  "Dual Eligible Special Needs (D-SNP) plans require both Medicare and Medicaid. Based on your income band, D-SNP options are hidden — verify Medicaid eligibility on Medicare.gov if your situation differs.";

/** False for the lowest band and “Prefer not to say”; true for $15k–$35k and above. */
export function isIncomeAboveFederalPovertyLevel(band: IncomeBand | string): boolean {
  if (band === "Under $15k" || band === "Prefer not to say") return false;
  return isIncomeBand(band);
}
