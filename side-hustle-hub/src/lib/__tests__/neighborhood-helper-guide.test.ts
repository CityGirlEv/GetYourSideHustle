import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { kidsLibraryMinTier, juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  NEIGHBORHOOD_HELPER_DETAILED_STEPS,
  NEIGHBORHOOD_HELPER_NOTES_WORKSHEET,
  NEIGHBORHOOD_HELPER_PRICING,
  NEIGHBORHOOD_HELPER_REALITY_CHECK,
  NEIGHBORHOOD_HELPER_SUPPLIES,
  NEIGHBORHOOD_HELPER_TOOLS,
  computeNeighborhoodHelperProfit,
  neighborhoodHelperToolsDisclaimer,
} from "../neighborhood-helper-guide";

const GUIDE_ID = "neighborhood-helper";

describe("Guide #015 Neighborhood Helper", () => {
  it("keeps a single #015 id, exact title, Unique Unique Free, 2 - 8 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("015");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("015");
    const idsFor015 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "015")
      .map(([id]) => id);
    expect(idsFor015).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Neighborhood Helper");
    expect(h.name).not.toMatch(/guide upgrade|neighborhood services|local helper|free guide|member guide/i);
    expect(h.category).toBe("Neighborhood & Local Services");
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["kids", "junior", "adult", "senior"]));
    expect(h.minTier).toBe("free");
    expect(h.freeWizardEligible).toBe(true);
    expect(h.description).toMatch(/small chores|check-ins/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("free");
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("free");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("free");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("free");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("free");
    expect(FREE_WIZARD_HUSTLE_IDS).toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps small-task / parent-approval copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? NEIGHBORHOOD_HELPER_PRICING.intro);
    expect(intro).toMatch(/\$10 – \$40 \/ job/i);
    expect(intro).toMatch(/grocery carry-in/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /gloves|sanitizer|tote/i.test(i.name))).toBe(true);
    expect(NEIGHBORHOOD_HELPER_SUPPLIES.starterKitTotal).toMatch(/\$10/);
    expect(NEIGHBORHOOD_HELPER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(neighborhoodHelperToolsDisclaimer()).toMatch(/anything you need/i);
    expect(NEIGHBORHOOD_HELPER_REALITY_CHECK.title).toMatch(/specific task/i);
    expect(NEIGHBORHOOD_HELPER_NOTES_WORKSHEET).toMatch(/TASK MENU/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(true);
    expect(kit.tools.some((t) => t.id === "google_docs")).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = NEIGHBORHOOD_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Your Safe Task Menu",
      "Set Your Service Area & Safety Rules",
      "Build Your Pricing & Quote System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Screen & Confirm Each Request",
      "Prep the Visit",
      "Complete Only the Agreed Task",
      "Close, Get Paid & Track Real Profit",
      "Build a Recurring Neighbor Route",
    ]);
    expect(core[0]?.desc).toMatch(/anything you need/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[4]?.desc).toMatch(/google docs/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
  });

  it("uses monthly calculator: $632.64 revenue, $92 expenses, $540.64 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Neighborhood Helper");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "nhJobsPerWeek")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      nhJobsPerWeek: 6,
      nhAvgPricePerJob: 18,
      nhRecurringMonthly: 120,
      nhAddOnRush: 0,
      nhTipsOther: 45,
      nhSupplies: 30,
      nhTravel: 40,
      nhPaymentFees: 12,
      nhAdvertising: 10,
      nhInsuranceLicensing: 0,
      nhOtherExpenses: 0,
      nhTaskHours: 20,
      nhTravelAdminHours: 10,
    };
    const helper = computeNeighborhoodHelperProfit(example);
    expect(helper.weeklyOneTimeRevenue).toBe(108);
    expect(helper.monthlyOneTimeRevenue).toBeCloseTo(467.64, 2);
    expect(helper.grossServiceRevenue).toBeCloseTo(632.64, 2);
    expect(helper.totalExpenses).toBe(92);
    expect(helper.estimatedProfit).toBeCloseTo(540.64, 2);
    expect(helper.totalHours).toBe(30);
    expect(helper.profitPerHour).toBeCloseTo(18.02, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBeCloseTo(632.64, 2);
    expect(result.expenses).toBe(92);
    expect(result.net).toBeCloseTo(540.64, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Neighborhood Helper");
    expect(pdf.steps.some((s) => /safe task menu/i.test(s.title))).toBe(true);
  });
});
