import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, isFreeWizardHustle } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { adultGuideMinTier } from "../guide-access";
import {
  PROPERTY_MGMT_DETAILED_STEPS,
  PROPERTY_MGMT_NOTES_WORKSHEET,
  PROPERTY_MGMT_REALITY_CHECK,
  computePropertyMgmtRevenue,
} from "../property-mgmt-guide";

const GUIDE_ID = "property-mgmt";

describe("Guide #097 Property Management", () => {
  it("keeps title, #097, Pro Guide, 3–6 weeks, and $1,000–$8,000/month examples", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("097");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("097");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Property Management");
    expect(h.minTier).toBe("pro");
    expect(isFreeWizardHustle(GUIDE_ID)).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(h.timeReq).toMatch(/3\s*-\s*6 weeks/i);
    expect(h.potentialIncome).toMatch(/\$1,000/);
    expect(h.potentialIncome).toMatch(/\$8,000/);
    expect(h.category).toBe("Real Estate / Property Services");
  });

  it("ships 11 authored steps, 3 marketing stages, and legal/funds warnings", () => {
    expect(PROPERTY_MGMT_DETAILED_STEPS).toHaveLength(11);
    expect(PROPERTY_MGMT_REALITY_CHECK.title).toMatch(/legally allowed/i);
    expect(PROPERTY_MGMT_NOTES_WORKSHEET).toMatch(/PROPERTY MANAGEMENT PLAN/i);
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.items.some((i) => /\$1,000/.test(i.price))).toBe(true);
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.some((t) => /choose your marketing channels/i.test(t))).toBe(true);
    expect(titles.some((t) => /make your marketing materials/i.test(t))).toBe(true);
    expect(titles.some((t) => /carry out your marketing plan/i.test(t))).toBe(true);
    expect(titles.some((t) => /legal/i.test(t))).toBe(true);
    expect(titles.some((t) => /report to the owner/i.test(t))).toBe(true);
    for (const step of PROPERTY_MGMT_DETAILED_STEPS) {
      for (const c of parseGuideStepDesc(step.desc).filter((s) => s.kind === "check")) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("counts only earned fees as revenue — not owner rent", () => {
    const r = computePropertyMgmtRevenue({
      properties: 4,
      averageMonthlyFee: 350,
      oneTimeServiceFees: 200,
      softwareCost: 100,
      phoneInternet: 50,
      travelExpense: 80,
      insuranceExpense: 70,
      contractorAdmin: 100,
      marketing: 50,
      otherExpenses: 0,
    });
    expect(r.managementRevenue).toBe(1400);
    expect(r.grossMonthlyRevenue).toBe(1600);
    expect(r.monthlyExpenses).toBe(450);
    expect(r.estimatedMonthlyProfit).toBe(1150);
    expect(r.averageProfitPerProperty).toBe(287.5);
  });
});
