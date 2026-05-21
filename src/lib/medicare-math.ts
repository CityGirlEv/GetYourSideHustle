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

// Medigap Plan G premium estimate by ZIP3 region (first digit ≈ state group).
const MEDIGAP_BY_ZIP3_DIGIT: Record<string, number> = {
  "0": 195, "1": 175, "2": 165, "3": 180, "4": 155,
  "5": 145, "6": 150, "7": 145, "8": 160, "9": 195,
};
export function medigapPremiumByZip3(zip3: string): number {
  return MEDIGAP_BY_ZIP3_DIGIT[zip3?.[0] ?? "5"] ?? 165;
}

export interface Medication {
  id: string;
  medication_name: string;
  strength: string;
  dosage_form: string;
  frequency: string;
  resolved_diagnosis?: string;
  estimated_monthly_retail: number;
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
    const isInsulin = /insulin|novolog|humalog|lantus|tresiba|admelog/i.test(
      m.medication_name + " " + (m.resolved_diagnosis ?? ""),
    );
    return sum + (isInsulin ? Math.min(m.estimated_monthly_retail, INSULIN_CAP_MONTHLY) : m.estimated_monthly_retail);
  }, 0);
  return Math.min(monthly * 12, cap);
}

export function calcPathways(opts: { year: Year; zip3: string; meds: Medication[]; hasDME?: boolean }):
  { A: PathwayResult; B: PathwayResult } {
  const g = GUIDELINES[opts.year];
  const drug = annualDrugCostWithCap(opts.meds, g.partDOOPCap);
  const medigap = medigapPremiumByZip3(opts.zip3);
  const dmeAnnualRetail = opts.hasDME ? 2400 : 0;

  const aPremium = g.partBPremiumMonthly + medigap + 35;
  const aTotal = aPremium * 12 + drug;
  const A: PathwayResult = {
    label: "Original Medicare + Medigap Plan G + Part D",
    monthlyPremium: aPremium, annualPremium: aPremium * 12,
    annualDrugCost: drug, annualMedicalOOP: 0,
    totalAnnual: aTotal, worstCaseAnnual: aTotal,
    breakdown: [
      { label: "Part B premium", value: g.partBPremiumMonthly * 12 },
      { label: "Medigap Plan G premium", value: medigap * 12 },
      { label: "Part D premium (est.)", value: 35 * 12 },
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
