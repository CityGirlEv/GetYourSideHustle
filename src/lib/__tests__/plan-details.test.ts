import { describe, it, expect } from "vitest";
import { rankedPlanDetails } from "../plan-details";

describe("rankedPlanDetails", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    medications: [
      { medication_name: "atorvastatin", estimated_monthly_retail: 12 },
      { medication_name: "metformin", estimated_monthly_retail: 8 },
    ],
  };

  it("returns up to 10 ranked plans", () => {
    const list = rankedPlanDetails(input);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(10);
  });

  it("ranks ascending by annual cost", () => {
    const list = rankedPlanDetails(input);
    for (let i = 1; i < list.length; i++) {
      expect(list[i].annual).toBeGreaterThanOrEqual(list[i - 1].annual);
      expect(list[i].rank).toBe(i + 1);
    }
  });

  it("handles empty meds", () => {
    const list = rankedPlanDetails({ ...input, medications: [] });
    expect(list.length).toBeGreaterThan(0);
  });
});