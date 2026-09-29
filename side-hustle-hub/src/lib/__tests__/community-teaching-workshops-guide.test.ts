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
  COMMUNITY_TEACHING_DETAILED_STEPS,
  COMMUNITY_TEACHING_NOTES_WORKSHEET,
  COMMUNITY_TEACHING_PRICING,
  COMMUNITY_TEACHING_REALITY_CHECK,
  COMMUNITY_TEACHING_SUPPLIES,
  COMMUNITY_TEACHING_TOOLS,
  computeCommunityTeachingProfit,
  communityTeachingWorkshopsToolsDisclaimer,
} from "../community-teaching-workshops-guide";

const GUIDE_ID = "teaching";

describe("Guide #050 Community Teaching & Workshops", () => {
  it("keeps a single #050 id, exact title, Pro, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("050");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("050");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Community Teaching & Workshops");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Education / Community Teaching & Workshops");
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/\$200/);
    expect(h.potentialIncome).toMatch(/session/i);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(["adult", "senior"]);
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/workshop|skill/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and sells a learning result", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? COMMUNITY_TEACHING_PRICING.intro);
    expect(intro).toMatch(/\$50 – \$200 \/ session/i);
    expect(intro).toMatch(/45–60 minute introductory session/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /lesson plan|handout/i.test(i.name))).toBe(true);
    expect(COMMUNITY_TEACHING_SUPPLIES.starterKitTotal).toMatch(/\$0–100/);
    expect(COMMUNITY_TEACHING_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(communityTeachingWorkshopsToolsDisclaimer()).toMatch(/learning result/i);
    expect(COMMUNITY_TEACHING_REALITY_CHECK.title).toMatch(/learning result/i);
    expect(COMMUNITY_TEACHING_NOTES_WORKSHEET).toMatch(/workshop positioning/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = COMMUNITY_TEACHING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose One Skill, Learner & Learning Result",
      "Build the Session, Price & Agreement",
      "Create & Test the Lesson Materials",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Qualify the Venue & Confirm Logistics",
      "Rehearse & Prepare the Final Workshop",
      "Deliver the Workshop",
      "Close, Evaluate & Hand Off",
      "Measure Profit, Improve & Rebook",
    ]);
    expect(core[0]?.desc).toMatch(/observable result|learning result/i);
    expect(core[3]?.desc).toMatch(/choose only 2 or 3|pick only 2 or 3/i);
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

  it("uses monthly calculator: $580 revenue, $130 expenses, $450 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Community Teaching & Workshops");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "workshopSessionsPerMonth")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      workshopSessionsPerMonth: 4,
      averageSessionFee: 125,
      workbookMaterialsRevenue: 80,
      materialsSupplies: 40,
      printing: 20,
      venuePlatformFees: 30,
      insurancePermitsChecks: 10,
      travelParking: 10,
      softwareEquipment: 10,
      paymentFees: 5,
      advertising: 5,
      curriculumPrepHours: 6,
      marketingSalesHours: 3,
      venueCoordinationHours: 2,
      setupCleanupHours: 2,
      teachingHours: 8,
      travelHours: 2,
      followUpAdminHours: 1,
    };
    const helper = computeCommunityTeachingProfit(example);
    expect(helper.monthlySessionRevenue).toBe(500);
    expect(helper.grossServiceRevenue).toBe(580);
    expect(helper.totalExpenses).toBe(130);
    expect(helper.estimatedProfit).toBe(450);
    expect(helper.totalHours).toBe(24);
    expect(helper.profitPerHour).toBeCloseTo(18.75, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(580);
    expect(result.expenses).toBe(130);
    expect(result.net).toBe(450);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Community Teaching & Workshops");
    expect(pdf.steps.some((s) => /choose one skill/i.test(s.title))).toBe(true);
  });
});
