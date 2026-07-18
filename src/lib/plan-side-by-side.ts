import { planUsd } from "@/lib/plan-comparison-rationale";
import { buildPlanDrugEstimates } from "@/lib/plan-drug-estimate";
import type { PlanDetail } from "@/lib/plan-details";
import type { Medication } from "@/lib/medicare-math";

export const PLAN_SIDE_BY_SIDE_TAB = "side-by-side";

export type PlanSideBySideRow = {
  label: string;
  emphasize?: boolean;
  values: (plan: PlanDetail) => string;
};

function premiumUsd(value: number): string {
  return value > 0 ? `${planUsd(value)}/mo` : "—";
}

/** Attribute rows for a 2–3 plan side-by-side grid (mirrors consumer PDF page 2). */
export function planSideBySideRows(): PlanSideBySideRow[] {
  return [
    { label: "Plan type", values: (p) => p.planType },
    { label: "Network", values: (p) => p.network },
    { label: "Star rating", values: (p) => p.stars },
    { label: "A.M. Best", values: (p) => p.amBest },
    { label: "Part B premium", values: (p) => premiumUsd(p.premiumPartB) },
    { label: "Plan premium", values: (p) => premiumUsd(p.premiumPlan) },
    { label: "Part D / Rx premium", values: (p) => premiumUsd(p.premiumRx) },
    {
      label: "Dental premium",
      values: (p) => (p.premiumDental > 0 ? premiumUsd(p.premiumDental) : "—"),
    },
    {
      label: "Vision premium",
      values: (p) => (p.premiumVision > 0 ? premiumUsd(p.premiumVision) : "—"),
    },
    {
      label: "Extras premium",
      values: (p) => (p.premiumExtras > 0 ? premiumUsd(p.premiumExtras) : "Bundled"),
    },
    { label: "Total monthly", emphasize: true, values: (p) => `${planUsd(p.monthly)}/mo` },
    { label: "Est. annual total", emphasize: true, values: (p) => planUsd(p.annual) },
    {
      label: "Medical deductible",
      values: (p) => (p.deductibleMed > 0 ? planUsd(p.deductibleMed) : "$0"),
    },
    { label: "Primary care", values: (p) => p.pcpCopay },
    { label: "Specialist", values: (p) => p.specCopay },
    { label: "Hospital", values: (p) => p.hospCopay },
    { label: "Emergency room", values: (p) => p.erCopay },
    { label: "Medical OOP max", values: (p) => p.moop },
    {
      label: "Rx deductible",
      values: (p) => (p.deductibleRx > 0 ? planUsd(p.deductibleRx) : "$0"),
    },
    { label: "Tier 1 generic", values: (p) => p.rxTier1 },
    { label: "Tier 2 generic", values: (p) => p.rxTier2 },
    { label: "Tier 3 brand", values: (p) => p.rxTier3 },
    { label: "Insulin cap", values: (p) => `${planUsd(p.insulinCap)}/mo` },
    { label: "Rx OOP cap", values: (p) => planUsd(p.rxOOPCap) },
    { label: "Dental", values: (p) => p.dentalBenefit },
    { label: "Vision", values: (p) => p.visionBenefit },
    { label: "Hearing", values: (p) => p.hearingBenefit },
    { label: "OTC / wellness", values: (p) => p.otcBenefit },
    { label: "Extras", values: (p) => p.extras || "—" },
  ];
}

function medicationLabel(med: Medication): string {
  return med.medication_name.trim() || "Unnamed medication";
}

function planDrugEstimateForMed(
  plan: PlanDetail,
  medications: Medication[],
  medName: string,
) {
  return buildPlanDrugEstimates(plan, medications).find((row) => row.name === medName);
}

/** Per-medication tier + estimated cost rows when intake drugs are present. */
export function planSideBySideDrugRows(
  _plans: PlanDetail[],
  medications: Medication[],
): PlanSideBySideRow[] {
  if (medications.length === 0) return [];
  const rows: PlanSideBySideRow[] = [];
  for (const med of medications) {
    const name = medicationLabel(med);
    rows.push({
      label: `${name} — tier`,
      values: (plan) => {
        const match = planDrugEstimateForMed(plan, medications, name);
        if (!match) return "—";
        return `${match.tier} · ${match.tierCopay}`;
      },
    });
    rows.push({
      label: `${name} (est. /mo)`,
      values: (plan) => {
        const match = planDrugEstimateForMed(plan, medications, name);
        return match ? planUsd(match.estMonthly) : "—";
      },
    });
  }
  return rows;
}

export function planSideBySideColumnTitle(plan: PlanDetail, index: number): string {
  const rank = plan.rank > 0 ? plan.rank : index + 1;
  return `#${rank} · ${plan.carrier}`;
}

export function planSideBySideColumnSubtitle(plan: PlanDetail): string {
  return plan.plan;
}
