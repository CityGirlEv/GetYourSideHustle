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
  2026: {
    year: 2026,
    partBPremiumMonthly: 202.9,
    partBDeductible: 283,
    partDOOPCap: 2100,
    moopLow: 6500,
    moopHigh: 9250,
  },
  2027: {
    year: 2027,
    partBPremiumMonthly: 212.5,
    partBDeductible: 295,
    partDOOPCap: 2400,
    moopLow: 6900,
    moopHigh: 9500,
  },
};

export const INSULIN_CAP_MONTHLY = 35;

// Medigap Plan G premium lookup by county (simplified)
const MEDIGAP_BY_COUNTY: Record<string, number> = {
  Harris: 145,
  "Los Angeles": 185,
  "Miami-Dade": 210,
  "Cook": 165,
  "Maricopa": 155,
  "King": 172,
};
export function medigapPremium(county: string): number {
  return MEDIGAP_BY_COUNTY[county] ?? 165;
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
  // Apply $35 insulin cap to insulin meds
  const monthly = meds.reduce((sum, m) => {
    const isInsulin = /insulin|novolog|humalog|lantus|tresiba|admelog/i.test(
      m.medication_name + " " + (m.resolved_diagnosis ?? ""),
    );
    return sum + (isInsulin ? Math.min(m.estimated_monthly_retail, INSULIN_CAP_MONTHLY) : m.estimated_monthly_retail);
  }, 0);
  return Math.min(monthly * 12, cap);
}

export function calcPathways(opts: {
  year: Year;
  county: string;
  meds: Medication[];
  hasDME?: boolean;
}): { A: PathwayResult; B: PathwayResult } {
  const g = GUIDELINES[opts.year];
  const drug = annualDrugCostWithCap(opts.meds, g.partDOOPCap);
  const medigap = medigapPremium(opts.county);
  const dmeAnnualRetail = opts.hasDME ? 2400 : 0; // assumed DME retail

  // Pathway A: Original Medicare + Plan G + Part D
  const aPremium = g.partBPremiumMonthly + medigap + 35; // ~$35 Part D plan premium
  const aMedical = 0; // Plan G covers Part B coinsurance / deductible after $283 once
  const aTotal = aPremium * 12 + drug + aMedical;
  const A: PathwayResult = {
    label: "Original Medicare + Medigap Plan G + Part D",
    monthlyPremium: aPremium,
    annualPremium: aPremium * 12,
    annualDrugCost: drug,
    annualMedicalOOP: aMedical,
    totalAnnual: aTotal,
    worstCaseAnnual: aTotal, // predictable
    breakdown: [
      { label: "Part B premium", value: g.partBPremiumMonthly * 12 },
      { label: "Medigap Plan G premium", value: medigap * 12 },
      { label: "Part D premium (est.)", value: 35 * 12 },
      { label: "Annual drug costs (capped)", value: drug },
      { label: "Medical out-of-pocket", value: 0 },
    ],
  };

  // Pathway B: Medicare Advantage
  const bPremium = g.partBPremiumMonthly + 0;
  const bDME = dmeAnnualRetail * 0.2;
  const bExpected = bDME + 400; // expected copays
  const bTotal = bPremium * 12 + drug + bExpected;
  const bWorst = bPremium * 12 + drug + g.moopHigh;
  const B: PathwayResult = {
    label: "Medicare Advantage (Part C)",
    monthlyPremium: bPremium,
    annualPremium: bPremium * 12,
    annualDrugCost: drug,
    annualMedicalOOP: bExpected,
    totalAnnual: bTotal,
    worstCaseAnnual: bWorst,
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
