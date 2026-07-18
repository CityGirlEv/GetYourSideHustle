import type { Medication, Year } from "./medicare-math";
import { buildAreaPlanCatalog, buildFullPlanCatalog } from "./plan-area-catalog";

export interface PlanDetail {
  rank: number;
  carrier: string;
  plan: string;
  planType: string;
  network: string;
  premiumPartB: number;
  premiumPlan: number;
  premiumRx: number;
  premiumDental: number;
  premiumVision: number;
  premiumExtras: number;
  monthly: number;
  annual: number;
  deductibleMed: number;
  deductibleRx: number;
  pcpCopay: string;
  specCopay: string;
  hospCopay: string;
  erCopay: string;
  moop: string;
  rxTier1: string;
  rxTier2: string;
  rxTier3: string;
  rxOOPCap: number;
  insulinCap: number;
  dentalBenefit: string;
  visionBenefit: string;
  hearingBenefit: string;
  otcBenefit: string;
  stars: string;
  amBest: string;
  extras: string;
}

export interface PlanDetailInput {
  year: Year;
  zip3: string;
  county?: string;
  medications: Medication[];
}

export interface FullPlanDetailInput {
  year: Year;
  medications: Medication[];
}

/** All plans modeled for the member's ZIP prefix; when county is set, MA plans are parish-scoped. */
export function areaPlanDetails(input: PlanDetailInput): PlanDetail[] {
  return buildAreaPlanCatalog(input);
}

/** National CMS catalog for row 2 (All Plans) — no ZIP or parish/county scoping. */
export function fullCatalogPlanDetails(input: FullPlanDetailInput): PlanDetail[] {
  return buildFullPlanCatalog(input);
}

/** Pharmacy-only standalone PDP — not a full-coverage pathway vs Medicare Advantage. */
export function isStandalonePartDPlan(plan: PlanDetail): boolean {
  return /^Medicare Part D/i.test(plan.planType);
}

export function isMedigapPlan(plan: PlanDetail): boolean {
  return /medigap|medicare supplement/i.test(plan.planType);
}

export function isMedicareAdvantagePlan(plan: PlanDetail): boolean {
  return /medicare advantage/i.test(plan.planType);
}

/**
 * Plans eligible for best-pathway ranking — Medicare Advantage vs Medigap supplement
 * (with modeled Part D bundled). Excludes standalone Part D drug-only plans.
 */
export function pathwayComparisonPlans(plans: PlanDetail[]): PlanDetail[] {
  return plans.filter((plan) => !isStandalonePartDPlan(plan));
}

/** Top 10 best-match pathway plans in the member's area by estimated annual cost. */
export function rankedPlanDetails(input: PlanDetailInput): PlanDetail[] {
  return pathwayComparisonPlans(areaPlanDetails(input))
    .slice(0, 10)
    .map((plan, index) => ({ ...plan, rank: index + 1 }));
}

/** Top 10 lowest-cost pathway plans from the full national CMS catalog (All Plans row). */
export function nationalRankedPlanDetails(input: FullPlanDetailInput): PlanDetail[] {
  return pathwayComparisonPlans(fullCatalogPlanDetails(input))
    .slice(0, 10)
    .map((plan, index) => ({ ...plan, rank: index + 1 }));
}

/** Top 3 lowest-cost pathway plans — MA vs Medigap (+ Part D), not standalone PDP. */
export function potentialTop3PlanDetails(input: PlanDetailInput): PlanDetail[] {
  return pathwayComparisonPlans(areaPlanDetails(input))
    .slice(0, 3)
    .map((plan, index) => ({ ...plan, rank: index + 1 }));
}
