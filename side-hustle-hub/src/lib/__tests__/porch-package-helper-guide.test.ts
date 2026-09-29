import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  PORCH_PACKAGE_DETAILED_STEPS,
  PORCH_PACKAGE_NOTES_WORKSHEET,
  PORCH_PACKAGE_PRICING,
  PORCH_PACKAGE_REALITY_CHECK,
  PORCH_PACKAGE_SUPPLIES,
  PORCH_PACKAGE_TOOLS,
  computePorchPackageHelperProfit,
  porchPackageHelperToolsDisclaimer,
} from "../porch-package-helper-guide";

const GUIDE_ID = "porch-package-helper";

describe("Guide #094 Porch Package Helper", () => {
  it("keeps a single #094 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("094");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("094");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Porch Package Helper");
    expect(h.name).not.toMatch(/guide upgrade|porch helper|package pickup|member guide/i);
    expect(h.category).toBe("Local Services / Package Assistance");
    expect(h.timeReq).toMatch(/8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/written authorization|private completion/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps package value out of helper revenue", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? PORCH_PACKAGE_PRICING.intro);
    expect(intro).toMatch(/\$10 – \$40 \/ job/i);
    expect(intro).toMatch(/\$10 – \$15/);
    expect(intro).toMatch(/\$50 – \$100/);
    expect(intro).toMatch(/package value is not helper revenue/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /closed-toe shoes/i.test(i.name))).toBe(true);
    expect(PORCH_PACKAGE_SUPPLIES.starterKitTotal).toMatch(/\$0–15/);
    expect(PORCH_PACKAGE_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(porchPackageHelperToolsDisclaimer()).toMatch(/should not sign in to a client/i);
    expect(PORCH_PACKAGE_REALITY_CHECK.title).toMatch(/verify the client/i);
    expect(PORCH_PACKAGE_REALITY_CHECK.body).toMatch(/Delivered\. Moved\. Confirmed\./i);
    expect(PORCH_PACKAGE_NOTES_WORKSHEET).toMatch(/Approved Safe Spot/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = PORCH_PACKAGE_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define the Service & Safety Boundaries",
      "Set Your Service Area, Schedule & Prices",
      "Verify the Client, Address & Authorization",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Confirm Each Delivery Job Before Travel",
      "Arrive, Verify & Assess Before Touching",
      "Move the Package & Send Private Confirmation",
      "Handle Missing, Damaged, Sensitive or Access Problems",
      "Close Out, Track Profit & Build Recurring Clients",
    ]);
    expect(core[0]?.desc).toMatch(/never open|forwarding or reshipping/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[8]?.desc).toMatch(/label.*not readable|not readable/i);
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

  it("uses monthly calculator: $424.75 revenue, $75 expenses, $349.75 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Porch Package Helper");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "porchStandardJobsPerWeek")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const helper = computePorchPackageHelperProfit({
      porchStandardJobsPerWeek: 5,
      averageStandardJobFee: 15,
      vacationPackageRevenue: 100,
      weatherRushAddOnRevenue: 0,
      tipsOtherEarnedIncome: 0,
      mileageTransportation: 40,
      parkingTolls: 10,
      phoneInternet: 10,
      supplies: 5,
      advertisingPrinting: 5,
      paymentFees: 5,
      insuranceLicensing: 0,
      otherExpenses: 0,
      travelHours: 8,
      serviceHours: 6,
      waitingHours: 2,
      adminHours: 4,
    });
    expect(helper.monthlyStandardRevenue).toBeCloseTo(324.75, 2);
    expect(helper.grossServiceRevenue).toBeCloseTo(424.75, 2);
    expect(helper.totalExpenses).toBe(75);
    expect(helper.estimatedProfit).toBeCloseTo(349.75, 2);
    expect(helper.totalHours).toBe(20);
    expect(helper.profitPerHour).toBeCloseTo(17.49, 2);

    const result = computeGuideCalc(
      profile.mode,
      {
        porchStandardJobsPerWeek: 5,
        averageStandardJobFee: 15,
        vacationPackageRevenue: 100,
        weatherRushAddOnRevenue: 0,
        tipsOtherEarnedIncome: 0,
        mileageTransportation: 40,
        parkingTolls: 10,
        phoneInternet: 10,
        supplies: 5,
        advertisingPrinting: 5,
        paymentFees: 5,
        insuranceLicensing: 0,
        otherExpenses: 0,
        travelHours: 8,
        serviceHours: 6,
        waitingHours: 2,
        adminHours: 4,
      },
      [],
    );
    expect(result.revenue).toBeCloseTo(424.75, 2);
    expect(result.expenses).toBe(75);
    expect(result.net).toBeCloseTo(349.75, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Porch Package Helper");
    expect(pdf.steps.some((s) => /define the service & safety boundaries/i.test(s.title))).toBe(true);
  });
});
