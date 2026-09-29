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
  GBP_HELPER_DETAILED_STEPS,
  GBP_HELPER_NOTES_WORKSHEET,
  GBP_HELPER_PRICING,
  GBP_HELPER_REALITY_CHECK,
  GBP_HELPER_SUPPLIES,
  GBP_HELPER_TOOLS,
  computeGoogleBusinessProfileHelperProfit,
  googleBusinessProfileHelperToolsDisclaimer,
} from "../google-business-profile-helper-guide";

const GUIDE_ID = "google-business-helper";

describe("Guide #072 Google Business Profile Helper", () => {
  it("keeps a single #072 id, exact title, Pro, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("072");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("072");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Google Business Profile Helper");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Local Marketing / Business Profile Support");
    expect(h.timeReq).toMatch(/3 - 10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/google business/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps owner-keeps-ownership copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? GBP_HELPER_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.length).toBeGreaterThan(0);
    expect(GBP_HELPER_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(GBP_HELPER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(googleBusinessProfileHelperToolsDisclaimer()).toMatch(/owner|ranking|password/i);
    expect(GBP_HELPER_REALITY_CHECK.title).toMatch(/represent itself accurately/i);
    expect(GBP_HELPER_NOTES_WORKSHEET).toMatch(/eligibility/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = GBP_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Client Type & Service Boundary",
      "Build the Package, Price & Agreement",
      "Check Eligibility, Ownership & Current Profile State",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Onboard the Owner & Set Secure Access",
      "Audit the Profile & Prepare Recommendations",
      "Apply Only Approved Changes",
      "Quality-Check, Document & Hand Off",
      "Report, Improve & Offer Maintenance",
    ]);
    expect(core[0]?.desc).toMatch(/client|boundary|eligible/i);
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

  it("uses monthly calculator: $435 revenue, $55 expenses, $380 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Google Business Profile Helper");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "gbpSmallProjectsCompleted")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      gbpSmallProjectsCompleted: 4,
      averageSmallProjectFee: 40,
      setupCleanupRevenue: 125,
      monthlyMaintenanceRevenue: 150,
      phoneInternet: 10,
      softwareStorage: 10,
      travelParking: 5,
      equipmentAllocation: 5,
      paymentFees: 8,
      advertisingNetworking: 5,
      insuranceProfessionalServices: 7,
      otherExpenses: 5,
      salesIntakeHours: 2,
      eligibilityOwnershipResearchHours: 2,
      auditPreparationHours: 3,
      editingContentHours: 4,
      approvalRevisionHours: 2,
      handoffReportingHours: 3,
      marketingAdminHours: 2,
    };
    const helper = computeGoogleBusinessProfileHelperProfit(example);
    expect(helper.smallProjectRevenue).toBe(160);
    expect(helper.grossServiceRevenue).toBe(435);
    expect(helper.totalExpenses).toBe(55);
    expect(helper.estimatedProfit).toBe(380);
    expect(helper.totalHours).toBe(18);
    expect(helper.profitPerHour).toBeCloseTo(21.11, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(435);
    expect(result.expenses).toBe(55);
    expect(result.net).toBe(380);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Google Business Profile Helper");
    expect(pdf.steps.some((s) => /choose the client type/i.test(s.title))).toBe(true);
  });
});
