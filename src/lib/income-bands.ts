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
