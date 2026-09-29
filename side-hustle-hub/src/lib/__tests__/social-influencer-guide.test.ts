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
import { guideCalcModeForId, guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  SOCIAL_INFLUENCER_DETAILED_STEPS,
  SOCIAL_INFLUENCER_NOTES_WORKSHEET,
  SOCIAL_INFLUENCER_PRICING,
  SOCIAL_INFLUENCER_REALITY_CHECK,
  SOCIAL_INFLUENCER_SUPPLIES,
  SOCIAL_INFLUENCER_TOOLS,
  computeSocialInfluencerProfit,
  socialInfluencerToolsDisclaimer,
} from "../social-influencer-guide";

const GUIDE_ID = "social";

describe("Guide #103 Social Influencer", () => {
  it("keeps a single #103 id, exact title, Pro, 15 - 30 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("103");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("103");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Social Influencer");
    expect(h.name).not.toMatch(/guide upgrade|member guide|& creator/i);
    expect(h.category).toBe("Creative / Audience & Creator Business");
    expect(h.timeReq).toMatch(/15 - 30 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$500/);
    expect(h.potentialIncome).toMatch(/\$20,000/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "junior"]));
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/audience|sponsorship/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
    expect(guideCalcModeForId(GUIDE_ID)).toBe("service");
  });

  it("replaces pricing and keeps followers-are-not-revenue copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? SOCIAL_INFLUENCER_PRICING.intro);
    expect(intro).toMatch(/\$500 - \$20,000\/mo/i);
    expect(intro).toMatch(/followers are not revenue/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /phone|camera|light/i.test(i.name))).toBe(true);
    expect(SOCIAL_INFLUENCER_SUPPLIES.starterKitTotal).toMatch(/\$100|Less than/i);
    expect(SOCIAL_INFLUENCER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(socialInfluencerToolsDisclaimer()).toMatch(/followers are not revenue/i);
    expect(SOCIAL_INFLUENCER_REALITY_CHECK.title).toMatch(/followers are not revenue/i);
    expect(SOCIAL_INFLUENCER_NOTES_WORKSHEET).toMatch(/POSITIONING/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = SOCIAL_INFLUENCER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Niche, Audience & Content Promise",
      "Choose the Platform, Format & Schedule",
      "Build the Brand, Disclosure & Rights System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Create, Test & Improve the Content System",
      "Qualify Offers & Negotiate Contracts",
      "Produce & Publish Compliant Content",
      "Report, Invoice & Protect Access",
      "Review Profit, Diversify & Retain Trust",
    ]);
    expect(core[0]?.desc).toMatch(/niche/i);
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

  it("uses monthly calculator: $1500 revenue, $450 expenses, $1050 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Social Influencer");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "sponsoredCampaignRevenue")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      sponsoredCampaignRevenue: 800,
      affiliateCommissionsCollected: 250,
      platformMonetizationCollected: 100,
      productGrossRevenue: 200,
      serviceSubscriptionRevenue: 150,
      licensingOtherEarnedIncome: 0,
      productCostFulfillmentRefunds: 80,
      platformPaymentAffiliateReversals: 20,
      equipmentSoftwareAssets: 100,
      contractors: 50,
      advertising: 80,
      travelPropsSamples: 40,
      insuranceLegalAccounting: 30,
      phoneInternetWebsite: 40,
      otherExpenses: 10,
      planningResearchHours: 10,
      productionEditingHours: 30,
      publishingCommunityHours: 15,
      brandSalesNegotiationHours: 10,
      reportingAdminSupportHours: 5,
    };
    const helper = computeSocialInfluencerProfit(example);
    expect(helper.grossServiceRevenue).toBe(1500);
    expect(helper.totalExpenses).toBe(450);
    expect(helper.estimatedProfit).toBe(1050);
    expect(helper.totalHours).toBe(70);
    expect(helper.profitPerHour).toBeCloseTo(15, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(1500);
    expect(result.expenses).toBe(450);
    expect(result.net).toBe(1050);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Social Influencer");
    expect(pdf.steps.some((s) => /niche, audience/i.test(s.title))).toBe(true);
  });
});
