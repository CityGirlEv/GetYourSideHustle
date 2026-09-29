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
  TRAVEL_RESEARCH_DETAILED_STEPS,
  TRAVEL_RESEARCH_NOTES_WORKSHEET,
  TRAVEL_RESEARCH_PRICING,
  TRAVEL_RESEARCH_REALITY_CHECK,
  TRAVEL_RESEARCH_SUPPLIES,
  TRAVEL_RESEARCH_TOOLS,
  computeTravelResearchAssistantProfit,
  travelResearchAssistantToolsDisclaimer,
} from "../travel-research-assistant-guide";

const GUIDE_ID = "travel-research-assistant";

describe("Guide #109 Travel Research Assistant", () => {
  it("keeps a single #109 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("109");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("109");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Travel Research Assistant");
    expect(h.name).not.toMatch(/guide upgrade|travel planner|travel agent|trip planner|member guide/i);
    expect(h.category).toBe("Digital Services / Travel Research");
    expect(h.timeReq).toMatch(/10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/research-and-organization|one-page travel brief/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps provider bookings out of helper revenue", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? TRAVEL_RESEARCH_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/\$15 – \$25/);
    expect(intro).toMatch(/\$35 – \$50/);
    expect(intro).toMatch(/do not count flight\/hotel prices/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /travel-brief template/i.test(i.name))).toBe(true);
    expect(TRAVEL_RESEARCH_SUPPLIES.starterKitTotal).toMatch(/\$0–25/);
    expect(TRAVEL_RESEARCH_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /google flights/i.test(t.name))).toBe(true);
    expect(travelResearchAssistantToolsDisclaimer()).toMatch(/leads—not final proof/i);
    expect(TRAVEL_RESEARCH_REALITY_CHECK.title).toMatch(/snapshot, not a reservation/i);
    expect(TRAVEL_RESEARCH_REALITY_CHECK.body).toMatch(/Research Less\. Compare Clearly\. Travel Smarter\./i);
    expect(TRAVEL_RESEARCH_NOTES_WORKSHEET).toMatch(/Research-only acknowledgment/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = TRAVEL_RESEARCH_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define the Research-Only Service & Boundaries",
      "Set Prices, Scope, Turnaround & Revisions",
      "Build the Client Intake, Privacy & Agreement Process",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Confirm the Project & Freeze the Search Criteria",
      "Research Flights Using the Client’s Real Priorities",
      "Research Lodging, Transportation & Itinerary Fit",
      "Build, Verify & Deliver the One-Page Travel Brief",
      "Handle Revisions, Close Out & Build Recurring Clients",
    ]);
    expect(core[0]?.desc).toMatch(/book directly/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[9]?.desc).toMatch(/Research only—not booked/i);
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

  it("uses monthly calculator: $348.25 revenue, $35 expenses, $313.25 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Travel Research Assistant");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "travelQuickComparisonsPerWeek")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const helper = computeTravelResearchAssistantProfit({
      travelQuickComparisonsPerWeek: 1,
      averageQuickComparisonFee: 25,
      onePageBriefsPerMonth: 4,
      averageOnePageBriefFee: 45,
      refreshAddOnRevenue: 60,
      tipsOtherResearchIncome: 0,
      internetPhone: 15,
      softwareStorage: 5,
      advertisingPortfolio: 5,
      paymentFees: 5,
      registrationInsurance: 5,
      supplies: 0,
      otherExpenses: 0,
      intakeHours: 2,
      researchHours: 8,
      briefHours: 3,
      revisionHours: 1,
      marketingAdminHours: 1,
    });
    expect(helper.monthlyQuickRevenue).toBeCloseTo(108.25, 2);
    expect(helper.monthlyBriefRevenue).toBe(180);
    expect(helper.grossServiceRevenue).toBeCloseTo(348.25, 2);
    expect(helper.totalExpenses).toBe(35);
    expect(helper.estimatedProfit).toBeCloseTo(313.25, 2);
    expect(helper.totalHours).toBe(15);
    expect(helper.profitPerHour).toBeCloseTo(20.88, 2);

    const result = computeGuideCalc(
      profile.mode,
      {
        travelQuickComparisonsPerWeek: 1,
        averageQuickComparisonFee: 25,
        onePageBriefsPerMonth: 4,
        averageOnePageBriefFee: 45,
        refreshAddOnRevenue: 60,
        tipsOtherResearchIncome: 0,
        internetPhone: 15,
        softwareStorage: 5,
        advertisingPortfolio: 5,
        paymentFees: 5,
        registrationInsurance: 5,
        supplies: 0,
        otherExpenses: 0,
        intakeHours: 2,
        researchHours: 8,
        briefHours: 3,
        revisionHours: 1,
        marketingAdminHours: 1,
      },
      [],
    );
    expect(result.revenue).toBeCloseTo(348.25, 2);
    expect(result.expenses).toBe(35);
    expect(result.net).toBeCloseTo(313.25, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Travel Research Assistant");
    expect(pdf.steps.some((s) => /define the research-only service/i.test(s.title))).toBe(true);
  });
});
