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
  RESUME_LINKEDIN_DETAILED_STEPS,
  RESUME_LINKEDIN_NOTES_WORKSHEET,
  RESUME_LINKEDIN_PRICING,
  RESUME_LINKEDIN_REALITY_CHECK,
  RESUME_LINKEDIN_SUPPLIES,
  RESUME_LINKEDIN_TOOLS,
  computeResumeLinkedInHelperProfit,
  resumeLinkedInHelperToolsDisclaimer,
} from "../resume-linkedin-helper-guide";

const GUIDE_ID = "resume-linkedin-helper";

describe("Guide #100 Resume & LinkedIn Helper", () => {
  it("keeps a single #100 id, exact title, Pro, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("100");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("100");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Resume & LinkedIn Helper");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Professional Services / Career Documents");
    expect(h.timeReq).toMatch(/3 - 10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/résumé|resume/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps never-invent-facts copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? RESUME_LINKEDIN_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.length).toBeGreaterThan(0);
    expect(RESUME_LINKEDIN_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(RESUME_LINKEDIN_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(resumeLinkedInHelperToolsDisclaimer()).toMatch(/password|fact/i);
    expect(RESUME_LINKEDIN_REALITY_CHECK.title).toMatch(/never improve the facts/i);
    expect(RESUME_LINKEDIN_NOTES_WORKSHEET).toMatch(/fact check/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = RESUME_LINKEDIN_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Client & Document Service",
      "Build the Package, Price & Agreement",
      "Create the Intake, Evidence & Privacy System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Interview the Client for Evidence",
      "Research the Target & Build the Content Map",
      "Write & Format the Resume and LinkedIn Text",
      "Fact-Check, Revise & Deliver",
      "Close, Measure & Build Referrals",
    ]);
    expect(core[0]?.desc).toMatch(/client|document/i);
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

  it("uses monthly calculator: $515 revenue, $45 expenses, $470 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Resume & LinkedIn Helper");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "resumeSmallProjectsCompleted")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      resumeSmallProjectsCompleted: 4,
      averageSmallProjectFee: 35,
      resumeRewriteRevenue: 200,
      resumeLinkedInPackageRevenue: 175,
      phoneInternet: 15,
      writingPdfStorageSoftware: 10,
      paymentFees: 8,
      advertisingNetworking: 7,
      trainingProfessionalServices: 5,
      salesIntakeHours: 2,
      clientInterviewHours: 4,
      researchTargetingHours: 4,
      writingFormattingHours: 7,
      revisionsFactCheckHours: 3,
      deliveryAdminHours: 2,
    };
    const helper = computeResumeLinkedInHelperProfit(example);
    expect(helper.smallProjectRevenue).toBe(140);
    expect(helper.grossServiceRevenue).toBe(515);
    expect(helper.totalExpenses).toBe(45);
    expect(helper.estimatedProfit).toBe(470);
    expect(helper.totalHours).toBe(22);
    expect(helper.profitPerHour).toBeCloseTo(21.36, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(515);
    expect(result.expenses).toBe(45);
    expect(result.net).toBe(470);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Resume & LinkedIn Helper");
    expect(pdf.steps.some((s) => /choose the client/i.test(s.title))).toBe(true);
  });
});
