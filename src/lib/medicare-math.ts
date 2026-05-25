export type Year = 2026 | 2027;

export interface Guidelines {
  year: Year;
  partBPremiumMonthly: number;
  partBDeductible: number;
  partDOOPCap: number;
  moopLow: number;
  moopHigh: number;
}

export const GUIDELINES: Record<Year, Guidelines> = {
  2026: { year: 2026, partBPremiumMonthly: 202.9, partBDeductible: 283, partDOOPCap: 2100, moopLow: 6500, moopHigh: 9250 },
  2027: { year: 2027, partBPremiumMonthly: 212.5, partBDeductible: 295, partDOOPCap: 2400, moopLow: 6900, moopHigh: 9500 },
};

export const INSULIN_CAP_MONTHLY = 35;

/** CGMs, insulin pumps, CPAP/BiPAP and similar are billed under Medicare
 * Part B as Durable Medical Equipment — they do NOT count toward Part D
 * drug spending or the Part D out-of-pocket cap. */
export function isDmeForm(form: string | undefined | null): boolean {
  return !!form && /\(DME\)|CGM|CPAP|BiPAP|Pump/i.test(form);
}

// Medigap Plan G premium estimate by ZIP3 region (first digit ≈ state group).
const MEDIGAP_BY_ZIP3_DIGIT: Record<string, number> = {
  "0": 195, "1": 175, "2": 165, "3": 180, "4": 155,
  "5": 145, "6": 150, "7": 145, "8": 160, "9": 195,
};
export function medigapPremiumByZip3(zip3: string): number {
  return MEDIGAP_BY_ZIP3_DIGIT[zip3?.[0] ?? "5"] ?? 165;
}

// Standalone Part D (PDP) monthly premium estimate by ZIP3 first digit.
// Based on 2026 CMS PDP region averages (national average ≈ $40/mo, range ~$28–$55).
// 0=New England, 1=NY/NJ/PA, 2=Mid-Atlantic/Southeast, 3=Southeast/FL,
// 4=Great Lakes, 5=Upper Midwest, 6=Plains/South Central, 7=South Central,
// 8=Mountain, 9=West Coast/AK/HI.
const PARTD_BY_ZIP3_DIGIT: Record<string, number> = {
  "0": 48, "1": 52, "2": 42, "3": 45, "4": 38,
  "5": 36, "6": 35, "7": 38, "8": 41, "9": 44,
};
export function partDPremiumByZip3(zip3: string): number {
  return PARTD_BY_ZIP3_DIGIT[zip3?.[0] ?? "5"] ?? 40;
}

export interface Medication {
  id: string;
  medication_name: string;
  strength: string;
  dosage_form: string;
  frequency: string;
  resolved_diagnosis?: string;
  estimated_monthly_retail: number;
  /** Drug was selected from RxNorm (FDA-approved) but is not in our local
   * pricing catalog, so Medicare Part D coverage and cost are an estimate. */
  coverage_uncertain?: boolean;
  /** Generic active ingredient if the selected drug is a brand (from RxNorm). */
  generic_alternative?: string;
  /** True when RxNorm found no generic equivalent (brand-only drug). */
  no_generic_available?: boolean;
}

export interface PathwayResult {
  label: string;
  monthlyPremium: number;
  annualPremium: number;
  annualDrugCost: number;
  annualMedicalOOP: number;
  totalAnnual: number;
  worstCaseAnnual: number;
  breakdown: { label: string; value: number }[];
}

function annualDrugCostWithCap(meds: Medication[], cap: number) {
  const monthly = meds.reduce((sum, m) => {
    // DME (CGM, insulin pump, CPAP) is Part B, not Part D — exclude from
    // Part D drug spend and the Part D OOP cap.
    if (isDmeForm(m.dosage_form)) return sum;
    const isInsulin = /insulin|novolog|humalog|lantus|tresiba|admelog|basaglar|levemir|toujeo/i.test(
      m.medication_name + " " + (m.resolved_diagnosis ?? ""),
    );
    // 2023+ IRA insulin cap: member pays no more than $35/mo per covered insulin.
    return sum + (isInsulin ? Math.min(m.estimated_monthly_retail, INSULIN_CAP_MONTHLY) : m.estimated_monthly_retail);
  }, 0);
  return Math.min(monthly * 12, cap);
}

export function calcPathways(opts: { year: Year; zip3: string; meds: Medication[]; hasDME?: boolean }):
  { A: PathwayResult; B: PathwayResult } {
  const g = GUIDELINES[opts.year];
  const drug = annualDrugCostWithCap(opts.meds, g.partDOOPCap);
  const medigap = medigapPremiumByZip3(opts.zip3);
  const partD = partDPremiumByZip3(opts.zip3);
  const dmeAnnualRetail = opts.hasDME ? 2400 : 0;

  const aPremium = g.partBPremiumMonthly + medigap + partD;
  const aTotal = aPremium * 12 + drug;
  const A: PathwayResult = {
    label: "Original Medicare + Medigap Plan G + Part D",
    monthlyPremium: aPremium, annualPremium: aPremium * 12,
    annualDrugCost: drug, annualMedicalOOP: 0,
    totalAnnual: aTotal, worstCaseAnnual: aTotal,
    breakdown: [
      { label: "Part B premium", value: g.partBPremiumMonthly * 12 },
      { label: "Medigap Plan G premium", value: medigap * 12 },
      { label: "Part D premium (ZIP-based est.)", value: partD * 12 },
      { label: "Annual drug costs (capped)", value: drug },
      { label: "Medical out-of-pocket", value: 0 },
    ],
  };

  const bPremium = g.partBPremiumMonthly;
  const bDME = dmeAnnualRetail * 0.2;
  const bExpected = bDME + 400;
  const bTotal = bPremium * 12 + drug + bExpected;
  const bWorst = bPremium * 12 + drug + g.moopHigh;
  const B: PathwayResult = {
    label: "Medicare Advantage (Part C)",
    monthlyPremium: bPremium, annualPremium: bPremium * 12,
    annualDrugCost: drug, annualMedicalOOP: bExpected,
    totalAnnual: bTotal, worstCaseAnnual: bWorst,
    breakdown: [
      { label: "Part B premium", value: g.partBPremiumMonthly * 12 },
      { label: "MA plan premium (est. $0)", value: 0 },
      { label: "Annual drug costs (capped)", value: drug },
      { label: "DME 20% co-insurance", value: bDME },
      { label: "Expected copays", value: 400 },
      { label: "MOOP exposure ($)", value: g.moopHigh },
    ],
  };

  return { A, B };
}

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// =====================================================================
// Personalized plan recommendation across the full CMS-approved catalog
// (Medigap A/B/D/G/HDG/K/L/M/N, all MA plan types, all PDP tiers, all carriers).
// =====================================================================

import {
  CMS_CATALOG,
  openMedigapLetters,
  openAdvantageTypes,
  type MedigapPlanRow,
  type AdvantageTypeRow,
  type CarrierRow,
} from "@/data/cms-catalog";

// Rough premium multiplier vs. Plan G baseline for each open Medigap letter.
// (Industry-typical ratios — refined estimates only; not a rate quote.)
const MEDIGAP_PREMIUM_FACTOR: Record<string, number> = {
  A: 0.78, B: 0.85, D: 0.95, G: 1.0,
  "High-Deductible G": 0.32,
  K: 0.45, L: 0.65, M: 0.82, N: 0.82,
};

// Approximate share of standard medical gaps each Medigap letter leaves on the member,
// expressed as expected annual out-of-pocket against a typical utilization profile.
const MEDIGAP_EXPECTED_OOP: Record<string, number> = {
  A: 1900, B: 900, D: 350, G: 283,
  "High-Deductible G": 2870,
  K: 2400, L: 1400, M: 1100, N: 700,
};

// Worst-case annual exposure ceiling for each Medigap letter.
const MEDIGAP_WORST_CASE: Record<string, number> = {
  A: 5000, B: 3500, D: 2000, G: 283,
  "High-Deductible G": 2870,
  K: 7220, L: 3610, M: 3500, N: 2800,
};

function medigapKey(letter: string): string {
  return letter.replace(/^Plan\s+/i, "").trim();
}

export interface PlanRecommendation {
  pathway: "A" | "B";
  pathwayLabel: string;
  planName: string;
  planDescription: string;
  rationale: string;
  estMonthlyPremium: number;
  estAnnualTotal: number;
  estWorstCase: number;
  carriers: CarrierRow[];
  source: string;
}

export interface PersonalizedRecommendation {
  primary: PlanRecommendation;
  alternate: PlanRecommendation;
  partD: { tier: string; estMonthly: number; carriers: CarrierRow[] } | null;
  generatedAt: string;
  catalogYear: number;
}

export interface RecommendInput {
  year: Year;
  zip3: string;
  county?: string;
  meds: Medication[];
  conditions: string[];
  costPreference: "minimize_monthly" | "predictability";
  hasDME?: boolean;
}

function scoreMedigap(
  row: MedigapPlanRow,
  baselineMedigap: number,
  partB: number,
  partD: number,
  drug: number,
  prefersPredictability: boolean,
): { score: number; monthly: number; annual: number; worst: number } {
  const key = medigapKey(row["Plan Letter"]);
  const factor = MEDIGAP_PREMIUM_FACTOR[key] ?? 1.0;
  const expectedOOP = MEDIGAP_EXPECTED_OOP[key] ?? 600;
  const worst = MEDIGAP_WORST_CASE[key] ?? 5000;
  const monthly = partB + baselineMedigap * factor + partD;
  const annual = monthly * 12 + drug + expectedOOP;
  const worstAnnual = monthly * 12 + drug + worst;
  const score = prefersPredictability ? worstAnnual : annual;
  return { score, monthly, annual, worst: worstAnnual };
}

function chooseAdvantage(
  rows: AdvantageTypeRow[],
  conditions: string[],
): AdvantageTypeRow {
  const lc = conditions.map((c) => c.toLowerCase());
  const hasChronic = lc.some((c) =>
    /diabetes|heart|copd|kidney|cancer/.test(c),
  );
  // C-SNP for chronic conditions if present in catalog, otherwise PPO for flexibility,
  // otherwise HMO for lowest premium.
  if (hasChronic) {
    const csnp = rows.find((r) => /C-SNP/i.test(r["Plan Type"]));
    if (csnp) return csnp;
    const ppo = rows.find((r) => /^PPO$/i.test(r["Plan Type"]));
    if (ppo) return ppo;
  }
  const hmo = rows.find((r) => /^HMO$/i.test(r["Plan Type"]));
  return hmo ?? rows[0];
}

export function recommendPlans(input: RecommendInput): PersonalizedRecommendation {
  const g = GUIDELINES[input.year];
  const drug = annualDrugCostWithCap(input.meds, g.partDOOPCap);
  const baselineMedigap = medigapPremiumByZip3(input.zip3);
  const partD = partDPremiumByZip3(input.zip3);
  const partB = g.partBPremiumMonthly;
  const prefersPredictability = input.costPreference === "predictability";

  // Score every open Medigap letter
  const open = openMedigapLetters();
  const scored = open.map((row) => ({
    row,
    ...scoreMedigap(row, baselineMedigap, partB, partD, drug, prefersPredictability),
  }));
  scored.sort((a, b) => a.score - b.score);
  const bestMedigap = scored[0];

  // Choose best MA plan type for this member
  const maRow = chooseAdvantage(openAdvantageTypes(), input.conditions);
  const dmeAnnualRetail = input.hasDME ? 2400 : 0;
  const maMonthly = partB; // most MA premiums = $0
  const maExpectedOOP = dmeAnnualRetail * 0.2 + 400;
  const maAnnual = maMonthly * 12 + drug + maExpectedOOP;
  const maWorst = maMonthly * 12 + drug + g.moopHigh;

  const aRec: PlanRecommendation = {
    pathway: "A",
    pathwayLabel: "Original Medicare + Medigap + Part D",
    planName: `Medigap ${bestMedigap.row["Plan Letter"]}`,
    planDescription: bestMedigap.row["General Summary"],
    rationale: prefersPredictability
      ? `Lowest worst-case exposure among open Medigap letters (${usd(bestMedigap.worst)} / yr).`
      : `Lowest expected total annual cost among open Medigap letters (${usd(bestMedigap.annual)} / yr).`,
    estMonthlyPremium: bestMedigap.monthly,
    estAnnualTotal: bestMedigap.annual,
    estWorstCase: bestMedigap.worst,
    carriers: CMS_CATALOG.medigapCarriers,
    source: "CMS-approved 2026 standardized Medigap policies",
  };

  const bRec: PlanRecommendation = {
    pathway: "B",
    pathwayLabel: "Medicare Advantage (Part C)",
    planName: `Medicare Advantage ${maRow["Plan Type"]}`,
    planDescription: maRow.Description,
    rationale: maRow["Pros / Advantages"],
    estMonthlyPremium: maMonthly,
    estAnnualTotal: maAnnual,
    estWorstCase: maWorst,
    carriers: CMS_CATALOG.advantageCarriers,
    source: "CMS-approved 2026 Part C plan types",
  };

  const aScore = prefersPredictability ? aRec.estWorstCase : aRec.estAnnualTotal;
  const bScore = prefersPredictability ? bRec.estWorstCase : bRec.estAnnualTotal;
  const [primary, alternate] = aScore <= bScore ? [aRec, bRec] : [bRec, aRec];

  // Part D recommendation (only meaningful for Pathway A)
  const partDTier = CMS_CATALOG.partDPlans[0];
  const partDRec = partDTier
    ? {
        tier: String(partDTier["Plan Tier"] ?? partDTier["Tier"] ?? "Standard"),
        estMonthly: partD,
        carriers: CMS_CATALOG.partDCarriers,
      }
    : null;

  return {
    primary,
    alternate,
    partD: partDRec,
    generatedAt: new Date().toISOString(),
    catalogYear: CMS_CATALOG.year,
  };
}
