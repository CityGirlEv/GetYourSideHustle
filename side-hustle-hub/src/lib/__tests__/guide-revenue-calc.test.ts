import { describe, expect, it } from "vitest";
import {
  computeGuideCalc,
  guideCalcFieldDisplay,
  guideCalcModeForId,
  guideCalcProfileForId,
  parseGuideCalcField,
  sumBudget,
} from "../guide-revenue-calc";

describe("guide-revenue-calc", () => {
  it("maps known hustles to calculator modes", () => {
    expect(guideCalcModeForId("airbnb")).toBe("lodging");
    expect(guideCalcModeForId("pod")).toBe("product");
    expect(guideCalcModeForId("social")).toBe("social");
    expect(guideCalcModeForId("cleaning-service")).toBe("service");
  });

  it("starts every profile at zero so the user enters values", () => {
    for (const id of ["cleaning-service", "airbnb", "pod", "social"] as const) {
      const profile = guideCalcProfileForId(id);
      expect(Object.values(profile.defaults).every((n) => n === 0), id).toBe(true);
      expect(profile.budget.every((l) => l.amount === 0), id).toBe(true);
      expect(profile).not.toHaveProperty("platformFeePercent");
    }
  });

  it("computes service profit from jobs × average sale − costs (no platform fee)", () => {
    const profile = guideCalcProfileForId("cleaning-service", "Cleaning");
    const result = computeGuideCalc(
      "service",
      { jobsPerMonth: 10, avgTicket: 100 },
      profile.budget.map((l) => ({ ...l, amount: l.id === "supplies" ? 50 : 0 })),
    );
    expect(result.revenue).toBe(1000);
    expect(result.expenses).toBe(50);
    expect(result.net).toBe(950);
    expect(result.notes.some((n) => /avg sale/i.test(n))).toBe(true);
  });

  it("computes lodging without platform fees or a ZIP", () => {
    const profile = guideCalcProfileForId("airbnb");
    expect(profile.defaults).not.toHaveProperty("zip");
    const budget = profile.budget.map((l) => ({ ...l, amount: l.id === "utilities" ? 100 : 0 }));
    const budgetTotal = sumBudget(budget);
    const result = computeGuideCalc(
      "lodging",
      { nightlyRate: 100, occupancyPercent: 50, cleaningFee: 0, avgStayNights: 2 },
      budget,
    );
    // 15 nights × $100 = 1500; no platform fee
    expect(result.revenue).toBe(1500);
    expect(result.expenses).toBe(budgetTotal);
    expect(result.net).toBe(1500 - budgetTotal);
  });

  it("stays at zero net when the user has not entered values", () => {
    const profile = guideCalcProfileForId("cleaning-service");
    const result = computeGuideCalc("service", profile.defaults, profile.budget);
    expect(result.revenue).toBe(0);
    expect(result.expenses).toBe(0);
    expect(result.net).toBe(0);
  });

  it("treats empty calculator typing as 0 without forcing a 0 into the field", () => {
    expect(parseGuideCalcField("")).toBe(0);
    expect(parseGuideCalcField("   ")).toBe(0);
    expect(parseGuideCalcField("25")).toBe(25);
    expect(parseGuideCalcField("12.5")).toBe(12.5);
    expect(guideCalcFieldDisplay(0)).toBe("");
    expect(guideCalcFieldDisplay(25)).toBe("25");
    expect(guideCalcFieldDisplay(0, "")).toBe("");
    expect(guideCalcFieldDisplay(0, "0")).toBe("0");
  });
});
