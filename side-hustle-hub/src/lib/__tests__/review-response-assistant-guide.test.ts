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
  REVIEW_RESPONSE_DETAILED_STEPS,
  REVIEW_RESPONSE_NOTES_WORKSHEET,
  REVIEW_RESPONSE_PRICING,
  REVIEW_RESPONSE_REALITY_CHECK,
  REVIEW_RESPONSE_SUPPLIES,
  REVIEW_RESPONSE_TOOLS,
  computeReviewResponseAssistantProfit,
  reviewResponseAssistantToolsDisclaimer,
} from "../review-response-assistant-guide";

const GUIDE_ID = "review-response-assistant";

describe("Guide #057 Customer Review Response Assistant", () => {
  it("keeps a single #057 id, exact title, Pro, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("057");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("057");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Customer Review Response Assistant");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Marketing / Reputation Support");
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/review/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and forbids fake reviews", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? REVIEW_RESPONSE_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/never post fake reviews/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /playbook|escalation/i.test(i.name))).toBe(true);
    expect(REVIEW_RESPONSE_SUPPLIES.starterKitTotal).toMatch(/\$0–20/);
    expect(REVIEW_RESPONSE_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(reviewResponseAssistantToolsDisclaimer()).toMatch(/human review/i);
    expect(REVIEW_RESPONSE_REALITY_CHECK.title).toMatch(/customer service with an audience/i);
    expect(REVIEW_RESPONSE_NOTES_WORKSHEET).toMatch(/escalation/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = REVIEW_RESPONSE_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Client, Platform & Service Boundary",
      "Build the Package, Price & Agreement",
      "Create the Tone Guide & Escalation Playbook",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Onboard the Client & Secure Access",
      "Audit & Categorize the Review Queue",
      "Draft & Quality-Check Each Response",
      "Get Approval, Publish & Document",
      "Report Themes, Close & Rebook",
    ]);
    expect(core[0]?.desc).toMatch(/never post fake reviews/i);
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

  it("uses monthly calculator: $305 revenue, $30 expenses, $275 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Customer Review Response Assistant");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "reviewResponsesCompletedPerMonth")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      reviewResponsesCompletedPerMonth: 20,
      averageFeePerReviewOrBatch: 4,
      tonePlaybookSetupRevenue: 75,
      monthlyRetainerRevenue: 150,
      phoneInternet: 10,
      softwareStorage: 5,
      paymentFees: 5,
      advertising: 5,
      professionalServicesInsurance: 5,
      setupOnboardingHours: 1,
      reviewAuditHours: 2,
      draftingHours: 4,
      approvalRevisionHours: 2,
      publishingReportingHours: 2,
      marketingAdminHours: 1,
    };
    const helper = computeReviewResponseAssistantProfit(example);
    expect(helper.baseReviewRevenue).toBe(80);
    expect(helper.grossServiceRevenue).toBe(305);
    expect(helper.totalExpenses).toBe(30);
    expect(helper.estimatedProfit).toBe(275);
    expect(helper.totalHours).toBe(12);
    expect(helper.profitPerHour).toBeCloseTo(22.92, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(305);
    expect(result.expenses).toBe(30);
    expect(result.net).toBe(275);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Customer Review Response Assistant");
    expect(pdf.steps.some((s) => /choose the client, platform/i.test(s.title))).toBe(true);
  });
});
