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
  CAREER_CONSULTING_DETAILED_STEPS,
  CAREER_CONSULTING_NOTES_WORKSHEET,
  CAREER_CONSULTING_PRICING,
  CAREER_CONSULTING_REALITY_CHECK,
  CAREER_CONSULTING_SUPPLIES,
  CAREER_CONSULTING_TOOLS,
  computeCareerIndustryConsultingProfit,
  careerIndustryConsultingToolsDisclaimer,
} from "../career-industry-consulting-guide";

const GUIDE_ID = "consulting";
const MATERIALS_RE = /make your (?:authority\s*&\s*)?marketing materials/i;

describe("Guide #045 Career & Industry Consulting", () => {
  it("keeps a single #045 id, exact title, Pro, 12 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("045");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("045");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Career & Industry Consulting");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Professional Services / Career & Industry Consulting");
    expect(h.timeReq).toMatch(/12 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/\$200/);
    expect(h.potentialIncome).toMatch(/hour/i);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(["adult", "senior"]);
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/decision|experience/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and sells a defined decision", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? CAREER_CONSULTING_PRICING.intro);
    expect(intro).toMatch(/\$50 – \$200 \/ hour/i);
    expect(intro).toMatch(/60-minute strategy session/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /intake questionnaire|agreement/i.test(i.name))).toBe(true);
    expect(CAREER_CONSULTING_SUPPLIES.starterKitTotal).toMatch(/\$0–40/);
    expect(CAREER_CONSULTING_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(careerIndustryConsultingToolsDisclaimer()).toMatch(/human expertise/i);
    expect(CAREER_CONSULTING_REALITY_CHECK.title).toMatch(/defined decision/i);
    expect(CAREER_CONSULTING_NOTES_WORKSHEET).toMatch(/expertise positioning/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = CAREER_CONSULTING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Inventory Your Expertise, Evidence & Boundaries",
      "Choose a Niche, Client & Expensive Problem",
      "Build the Offer, Price & Client Agreement",
      "Choose Your Marketing Channels",
      "Make Your Authority & Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Run Discovery & Qualify the Client",
      "Prepare, Research & Diagnose Before the Session",
      "Deliver the Consulting Session or Workshop",
      "Deliver the Action Plan & Follow-Up",
      "Close Out, Measure Value & Build Repeat Business",
    ]);
    expect(core[0]?.desc).toMatch(/former-employer secrets|former employer/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3|pick only 2 or 3 this month/i);
    expect(core[4]?.title).toMatch(MATERIALS_RE);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => MATERIALS_RE.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /^make your marketing materials$/i.test(t))).toHaveLength(0);
  });

  it("uses monthly calculator: $1,799 revenue, $250 expenses, $1,549 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Career & Industry Consulting");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "consultingBillableHoursPerWeek")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      consultingBillableHoursPerWeek: 3,
      averageHourlyRate: 100,
      fixedFeeProjectRevenue: 500,
      phoneInternet: 30,
      schedulingVideoSoftware: 20,
      insurance: 40,
      legalAccountingFees: 40,
      continuingEducation: 30,
      advertisingNetworking: 40,
      unreimbursedTravel: 20,
      paymentFees: 20,
      officeEquipment: 10,
      billableDeliveryHours: 12.99,
      preparationResearchHours: 5,
      proposalSalesHours: 2,
      writtenDeliverableHours: 3,
      followUpRevisionHours: 1.01,
      travelHours: 0,
      marketingAdminHours: 2,
    };
    const helper = computeCareerIndustryConsultingProfit(example);
    expect(helper.monthlyHourlyRevenue).toBeCloseTo(1299, 2);
    expect(helper.grossServiceRevenue).toBeCloseTo(1799, 2);
    expect(helper.totalExpenses).toBe(250);
    expect(helper.estimatedProfit).toBeCloseTo(1549, 2);
    expect(helper.totalHours).toBeCloseTo(26, 2);
    expect(helper.profitPerHour).toBeCloseTo(59.58, 2);
    expect(helper.utilizationPercent).toBeCloseTo(49.96, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBeCloseTo(1799, 2);
    expect(result.expenses).toBe(250);
    expect(result.net).toBeCloseTo(1549, 2);
    expect(result.metrics?.utilizationPercent).toBeCloseTo(49.96, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Career & Industry Consulting");
    expect(pdf.steps.some((s) => /inventory your expertise/i.test(s.title))).toBe(true);
  });
});
