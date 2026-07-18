import { describe, expect, it } from "vitest";
import type { PlanDetail } from "@/lib/plan-details";
import {
  emptyPlanTableFilters,
  filterPlanTableRows,
  deselectPlanTableColumnFilter,
  planTableFilterOptions,
  togglePlanTableFilterOption,
} from "@/lib/plan-table-filter";
import { sortPlanDetails } from "@/lib/plan-table-sort";

function samplePlan(overrides: Partial<PlanDetail> = {}): PlanDetail {
  return {
    rank: 1,
    carrier: "Aetna",
    plan: "H1234-001",
    planType: "HMO",
    network: "HMO",
    premiumPartB: 0,
    premiumPlan: 0,
    premiumRx: 0,
    premiumDental: 0,
    premiumVision: 0,
    premiumExtras: 0,
    monthly: 10,
    annual: 120,
    deductibleMed: 0,
    deductibleRx: 0,
    pcpCopay: "$0",
    specCopay: "$25",
    hospCopay: "$0",
    erCopay: "$90",
    moop: "$3,000",
    rxTier1: "$0",
    rxTier2: "$10",
    rxTier3: "$45",
    rxOOPCap: 2000,
    insulinCap: 35,
    dentalBenefit: "Yes",
    visionBenefit: "Yes",
    hearingBenefit: "No",
    otcBenefit: "No",
    stars: "4.5",
    amBest: "A",
    extras: "",
    ...overrides,
  };
}

describe("plan table filter + sort", () => {
  const plans = [
    samplePlan({ rank: 1, carrier: "Aetna", planType: "HMO", monthly: 10, stars: "4.5" }),
    samplePlan({
      rank: 2,
      carrier: "Humana",
      plan: "H5678-002",
      planType: "PPO",
      monthly: 20,
      annual: 240,
      stars: "4.0",
    }),
  ];

  it("filters by multi-select plan type", () => {
    const filters = emptyPlanTableFilters();
    filters.planType = ["HMO"];
    expect(filterPlanTableRows(plans, filters)).toHaveLength(1);
    expect(filterPlanTableRows(plans, filters)[0]?.carrier).toBe("Aetna");
  });

  it("sorts by monthly premium descending", () => {
    const sorted = sortPlanDetails(plans, "monthly", "desc");
    expect(sorted.map((plan) => plan.carrier)).toEqual(["Humana", "Aetna"]);
    expect(sorted[0]?.rank).toBe(1);
  });

  it("builds carrier filter options", () => {
    const options = planTableFilterOptions(plans, "carrierPlan");
    expect(options).toHaveLength(2);
    expect(options.some((option) => option.label.includes("Aetna"))).toBe(true);
  });

  it("toggles filter values like the table header UI", () => {
    const allValues = planTableFilterOptions(plans, "planType").map((option) => option.value);
    const narrowed = togglePlanTableFilterOption([], "HMO", false, allValues);
    expect(narrowed).toEqual(["PPO"]);
  });

  it("deselect all matches nothing", () => {
    const filters = emptyPlanTableFilters();
    filters.planType = deselectPlanTableColumnFilter();
    expect(filterPlanTableRows(plans, filters)).toHaveLength(0);
  });
});
