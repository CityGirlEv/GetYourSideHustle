import { buildDrugReport } from "@/components/DrugReport";
import {
  isMedigapPlan,
  isStandalonePartDPlan,
  type PlanDetail,
} from "@/lib/plan-details";
import { isPartBDrug } from "@/lib/part-b-drugs";
import { usd, type Medication } from "@/lib/medicare-math";

export interface PlanDrugEstimateRow {
  name: string;
  tier: string;
  tierCopay: string;
  estMonthly: number;
  estAnnual: number;
}

/** Coerce scenario medications to typed intake rows for plan drug tables. */
export function asScenarioMedications(medications: unknown[] | undefined): Medication[] {
  if (!medications?.length) return [];
  return medications.filter(
    (med): med is Medication =>
      med != null && typeof med === "object" && "medication_name" in med,
  );
}

function parseCopayMidpoint(copay: string): number {
  const values = [...copay.matchAll(/\$?(\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]!));
  if (values.length === 0) return 0;
  return Math.max(...values);
}

function tierNumber(tierLabel: string): number | null {
  if (/part b/i.test(tierLabel)) return null;
  const match = tierLabel.match(/tier\s*(\d)/i);
  return match ? parseInt(match[1]!, 10) : null;
}

/** Map a CMS tier label to this plan's copay structure. */
export function estimateDrugCostOnPlan(
  tierLabel: string,
  estGenericMonthly: number,
  retailMonthly: number,
  plan: PlanDetail,
): { estMonthly: number; tierCopay: string } {
  if (/part b/i.test(tierLabel)) {
    return { estMonthly: Math.round(retailMonthly * 0.2), tierCopay: "Part B (20%)" };
  }
  if (/insulin/i.test(tierLabel)) {
    return {
      estMonthly: Math.min(retailMonthly, plan.insulinCap),
      tierCopay: `${usd(plan.insulinCap)}/mo cap`,
    };
  }

  const tier = tierNumber(tierLabel);
  if (tier === 1) {
    const parsed = parseCopayMidpoint(plan.rxTier1);
    return {
      estMonthly: parsed > 0 ? parsed : estGenericMonthly,
      tierCopay: plan.rxTier1,
    };
  }
  if (tier === 2) {
    const parsed = parseCopayMidpoint(plan.rxTier2);
    return {
      estMonthly: parsed > 0 ? parsed : estGenericMonthly,
      tierCopay: plan.rxTier2,
    };
  }
  if (tier === 3) {
    const parsed = parseCopayMidpoint(plan.rxTier3);
    return {
      estMonthly: parsed > 0 ? parsed : Math.max(estGenericMonthly, Math.round(retailMonthly * 0.25)),
      tierCopay: plan.rxTier3,
    };
  }
  if (tier === 4) {
    const base = parseCopayMidpoint(plan.rxTier3);
    return {
      estMonthly: Math.max(base * 2, Math.round(retailMonthly * 0.4)),
      tierCopay: "Non-preferred brand",
    };
  }
  if (tier === 5) {
    return {
      estMonthly: Math.round(retailMonthly * 0.3),
      tierCopay: "Specialty (coinsurance)",
    };
  }
  return { estMonthly: estGenericMonthly, tierCopay: "—" };
}

/**
 * Medications to show in plan-specific Part D drug tables.
 * Standalone PDP and Medigap (+ paired Part D) exclude Part B outpatient drugs.
 */
export function medicationsForPlanDrugEstimates(
  plan: PlanDetail,
  medications: Medication[],
): Medication[] {
  if (isStandalonePartDPlan(plan) || isMedigapPlan(plan)) {
    return medications.filter((med) => !isPartBDrug(med));
  }
  return medications;
}

/** Per-medication tier + estimated member cost on a specific plan. */
export function buildPlanDrugEstimates(
  plan: PlanDetail,
  medications: Medication[],
): PlanDrugEstimateRow[] {
  const scoped = medicationsForPlanDrugEstimates(plan, medications);
  if (!scoped.length) return [];

  return buildDrugReport(scoped).map((row) => {
    const { estMonthly, tierCopay } = estimateDrugCostOnPlan(
      row.tier,
      row.estPlanMonthly,
      row.retailMonthly,
      plan,
    );
    return {
      name: row.name,
      tier: row.tier,
      tierCopay,
      estMonthly,
      estAnnual: estMonthly * 12,
    };
  });
}

export function cappedPlanDrugAnnualTotal(rows: PlanDrugEstimateRow[], cap: number): number {
  return Math.min(
    rows.reduce((sum, row) => sum + row.estAnnual, 0),
    cap,
  );
}
