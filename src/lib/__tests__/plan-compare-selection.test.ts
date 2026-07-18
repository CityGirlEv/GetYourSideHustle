import { describe, expect, it } from "vitest";
import {
  autoComparePlanKeys,
  isSideBySideCompareEnabled,
  plansForSideBySideView,
  shouldShowPlanCompareCheckboxes,
} from "@/lib/plan-compare-selection";
import type { PlanDetail } from "@/lib/plan-details";

function plan(rank: number): PlanDetail {
  return {
    rank,
    carrier: `Carrier ${rank}`,
    plan: `Plan ${rank}`,
    planType: "HMO",
    network: "HMO",
    premiumPartB: 185,
    premiumPlan: 0,
    premiumRx: 30,
    premiumDental: 0,
    premiumVision: 0,
    premiumExtras: 0,
    monthly: 215,
    annual: 2580,
    deductibleMed: 0,
    deductibleRx: 0,
    pcpCopay: "$0",
    specCopay: "$25",
    hospCopay: "$0",
    erCopay: "$90",
    moop: "$3,000",
    rxTier1: "$0",
    rxTier2: "$8",
    rxTier3: "$47",
    rxOOPCap: 2000,
    insulinCap: 35,
    dentalBenefit: "Basic",
    visionBenefit: "Exam",
    hearingBenefit: "—",
    otcBenefit: "—",
    stars: "4.0",
    amBest: "A",
    extras: "Fitness",
  };
}

describe("plan compare selection", () => {
  it("shows checkboxes only when more than 3 plans", () => {
    expect(shouldShowPlanCompareCheckboxes(3)).toBe(false);
    expect(shouldShowPlanCompareCheckboxes(4)).toBe(true);
  });

  it("auto-enables side by side for 2–3 plans", () => {
    expect(isSideBySideCompareEnabled(2, 2)).toBe(true);
    expect(isSideBySideCompareEnabled(3, 3)).toBe(true);
    expect(isSideBySideCompareEnabled(4, 0)).toBe(false);
    expect(isSideBySideCompareEnabled(4, 2)).toBe(true);
  });

  it("auto-selects all plans when the list is small", () => {
    const keys = autoComparePlanKeys([plan(1), plan(2), plan(3)]);
    expect(keys).toHaveLength(3);
  });

  it("builds side-by-side plans from manual selection", () => {
    const plans = [plan(1), plan(2), plan(3), plan(4)];
    const selected = plansForSideBySideView(plans, ["Carrier 1::Plan 1", "Carrier 3::Plan 3"]);
    expect(selected.map((p) => p.rank)).toEqual([1, 3]);
  });
});
