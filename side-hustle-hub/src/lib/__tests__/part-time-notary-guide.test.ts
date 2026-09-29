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
  PART_TIME_NOTARY_DETAILED_STEPS,
  PART_TIME_NOTARY_NOTES_WORKSHEET,
  PART_TIME_NOTARY_PRICING,
  PART_TIME_NOTARY_REALITY_CHECK,
  PART_TIME_NOTARY_SUPPLIES,
  PART_TIME_NOTARY_TOOLS,
  computePartTimeNotaryProfit,
  partTimeNotaryToolsDisclaimer,
} from "../part-time-notary-guide";

const GUIDE_ID = "notary";

describe("Guide #091 Part-Time Notary", () => {
  it("keeps a single #091 id, exact title, Pro, 3 - 12 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("091");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("091");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Part-Time Notary");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Professional Services / Notarial Services");
    expect(h.timeReq).toMatch(/3 - 12 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$75/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult"]));
    expect(h.audiences).not.toContain("junior");
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/commissioned notary/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps impartial-witness copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? PART_TIME_NOTARY_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$75 \/ appointment/i);
    expect(intro).toMatch(/lawful/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /seal|journal/i.test(i.name))).toBe(true);
    expect(PART_TIME_NOTARY_SUPPLIES.starterKitTotal).toMatch(/\$100/);
    expect(PART_TIME_NOTARY_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(partTimeNotaryToolsDisclaimer()).toMatch(/impartial witness/i);
    expect(PART_TIME_NOTARY_REALITY_CHECK.title).toMatch(/impartial witness/i);
    expect(PART_TIME_NOTARY_NOTES_WORKSHEET).toMatch(/commission/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(false);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = PART_TIME_NOTARY_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Confirm Eligibility & Commissioning Authority",
      "Complete Commissioning & Build the Compliance File",
      "Choose Services, Service Area, Fees & Agreement",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Screen & Confirm the Appointment",
      "Prepare, Travel & Verify the Setting",
      "Perform or Refuse the Notarial Act",
      "Close, Secure Records & Deliver",
      "Track Compliance, Profit & Renewal",
    ]);
    expect(core[0]?.desc).toMatch(/commissioning/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3|choose only 2 or 3/i);
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

  it("uses monthly calculator: $480 revenue, $140 expenses, $340 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Part-Time Notary");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "notaryAppointmentsPerMonth")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      notaryAppointmentsPerMonth: 12,
      averageLawfulNotarialFeesPerAppointment: 20,
      permittedTravelConvenienceFees: 240,
      commissionRenewalAllocation: 20,
      bondInsuranceAllocation: 25,
      sealJournalCertificates: 15,
      trainingBackgroundScreening: 10,
      printingScanningShipping: 5,
      mileageParkingTolls: 40,
      phoneInternet: 15,
      paymentFeesAdvertising: 10,
      appointmentHours: 8,
      travelWaitingHours: 6,
      printingPreparationHours: 2,
      recordsShippingHours: 1,
      marketingAdminTrainingHours: 3,
    };
    const helper = computePartTimeNotaryProfit(example);
    expect(helper.monthlyNotarialRevenue).toBe(240);
    expect(helper.grossServiceRevenue).toBe(480);
    expect(helper.totalExpenses).toBe(140);
    expect(helper.estimatedProfit).toBe(340);
    expect(helper.totalHours).toBe(20);
    expect(helper.profitPerHour).toBeCloseTo(17, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(480);
    expect(result.expenses).toBe(140);
    expect(result.net).toBe(340);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Part-Time Notary");
    expect(pdf.steps.some((s) => /confirm eligibility/i.test(s.title))).toBe(true);
  });
});
