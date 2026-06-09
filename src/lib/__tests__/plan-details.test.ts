import { describe, it, expect } from "vitest";
import { rankedPlanDetails } from "../plan-details";
import type { Medication } from "../medicare-math";

const med = (over: Partial<Medication>): Medication => ({
  id: over.id ?? "m1",
  medication_name: over.medication_name ?? "atorvastatin",
  strength: "10mg",
  dosage_form: "tablet",
  frequency: "daily",
  estimated_monthly_retail: over.estimated_monthly_retail ?? 10,
});

describe("rankedPlanDetails", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    medications: [
      med({ id: "1", medication_name: "atorvastatin", estimated_monthly_retail: 12 }),
      med({ id: "2", medication_name: "metformin", estimated_monthly_retail: 8 }),
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