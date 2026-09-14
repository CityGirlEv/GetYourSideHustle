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
    expect(guideCalcModeForId("airbnb")).toBe("service");
    expect(guideCalcModeForId("pod")).toBe("service");
    expect(guideCalcModeForId("social")).toBe("service");
    expect(guideCalcModeForId("cleaning-service")).toBe("service");
    expect(guideCalcModeForId("food-delivery")).toBe("delivery");
    expect(guideCalcModeForId("estate-sale-listing-helper")).toBe("resale");
    expect(guideCalcModeForId("kids-reinvest-jar")).toBe("split");
    expect(guideCalcModeForId("junior-reinvest-ceo")).toBe("split");
  });

  it("computes delivery cash profit without IRS mileage deduction", () => {
    const profile = guideCalcProfileForId("food-delivery", "DoorDash / Uber Eats");
    expect(profile.mode).toBe("delivery");
    expect(profile.disclaimerExtra).toMatch(/does NOT subtract the IRS/i);
    const budget = profile.budget.map((l) =>
      l.id === "fuel" ? { ...l, amount: 35 } : l.id === "tolls" ? { ...l, amount: 8 } : l.id === "other" ? { ...l, amount: 4 } : l,
    );
    const result = computeGuideCalc(
      "delivery",
      {
        hoursWorked: 8,
        deliveries: 20,
        baseEarnings: 145,
        tips: 62,
        promotions: 15,
        totalMiles: 100,
      },
      budget,
    );
    expect(result.revenue).toBe(222);
    expect(result.expenses).toBe(47);
    expect(result.net).toBe(175);
    expect(result.metrics?.grossPerMile).toBeCloseTo(2.22, 2);
    expect(result.metrics?.grossPerHour).toBeCloseTo(27.75, 2);
    expect(result.metrics?.netPerHour).toBeCloseTo(21.875, 2);
    expect(result.metrics?.netPerDelivery).toBeCloseTo(8.75, 2);
  });

  it("starts every profile at zero so the user enters values", () => {
    for (const id of [
      "cleaning-service",
      "airbnb",
      "pod",
      "social",
      "food-delivery",
      "estate-sale-listing-helper",
    ] as const) {
      const profile = guideCalcProfileForId(id);
      expect(Object.values(profile.defaults).every((n) => n === 0), id).toBe(true);
      expect(profile.budget.every((l) => l.amount === 0), id).toBe(true);
      expect(profile).not.toHaveProperty("platformFeePercent");
    }
  });

  it("computes service profit from jobs × average sale − costs (no platform fee)", () => {
    const profile = guideCalcProfileForId("handyman", "Handyman");
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
    const profile = guideCalcProfileForId("airbnb-cohost");
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

  it("splits leftover money only after expenses when percentages total 100", () => {
    const profile = guideCalcProfileForId("junior-reinvest-ceo", "Reinvest Like a CEO");
    expect(profile.mode).toBe("split");
    expect(profile.title).toMatch(/ceo money splitter/i);
    const result = computeGuideCalc(
      "split",
      {
        moneyCollected: 100,
        hustleExpenses: 20,
        savePercent: 40,
        enjoyPercent: 30,
        growPercent: 30,
      },
      [],
    );
    expect(result.net).toBe(80);
    expect(result.metrics?.saveAmount).toBe(32);
    expect(result.metrics?.enjoyAmount).toBe(24);
    expect(result.metrics?.growAmount).toBe(24);
    expect(result.metrics?.percentagesValid).toBe(true);
  });
});
