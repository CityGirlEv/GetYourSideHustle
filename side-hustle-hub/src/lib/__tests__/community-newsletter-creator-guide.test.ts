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
  COMMUNITY_NEWSLETTER_DETAILED_STEPS,
  COMMUNITY_NEWSLETTER_NOTES_WORKSHEET,
  COMMUNITY_NEWSLETTER_PRICING,
  COMMUNITY_NEWSLETTER_REALITY_CHECK,
  COMMUNITY_NEWSLETTER_SUPPLIES,
  COMMUNITY_NEWSLETTER_TOOLS,
  computeCommunityNewsletterProfit,
  communityNewsletterCreatorToolsDisclaimer,
} from "../community-newsletter-creator-guide";

const GUIDE_ID = "community-newsletter-creator";

describe("Guide #049 Community Newsletter Creator", () => {
  it("keeps a single #049 id, exact title, Pro, 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("049");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("049");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Community Newsletter Creator");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Writing & Communications / Community Newsletter Services");
    expect(h.timeReq).toMatch(/10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/newsletter/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps community-trust copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? COMMUNITY_NEWSLETTER_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/do not count the client/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /editorial calendar|permission log/i.test(i.name))).toBe(true);
    expect(COMMUNITY_NEWSLETTER_SUPPLIES.starterKitTotal).toMatch(/\$0–25/);
    expect(COMMUNITY_NEWSLETTER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(communityNewsletterCreatorToolsDisclaimer()).toMatch(/permission-based subscriber list/i);
    expect(COMMUNITY_NEWSLETTER_REALITY_CHECK.title).toMatch(/does not borrow its trust/i);
    expect(COMMUNITY_NEWSLETTER_NOTES_WORKSHEET).toMatch(/newsletter promise/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = COMMUNITY_NEWSLETTER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Community, Audience & Newsletter Promise",
      "Define the Package, Price & Working Agreement",
      "Build the Editorial, Privacy & Approval System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Onboard the Client & Plan the First Issue",
      "Collect, Interview & Verify Content",
      "Write, Design, Fact-Check & Proof the Issue",
      "Get Approval, Test, Publish & Report",
      "Close the Issue, Improve the System & Build Repeat Business",
    ]);
    expect(core[0]?.desc).toMatch(/newsletter promise/i);
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

  it("uses monthly calculator: $600 revenue, $75 expenses, $525 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Community Newsletter Creator");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "newsletterIssuesPerMonth")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      newsletterIssuesPerMonth: 4,
      averageFeePerIssue: 100,
      templateSetupRevenue: 100,
      interviewResearchAddOns: 50,
      emailDistributionRevenue: 50,
      phoneInternet: 15,
      writingDesignEmailSoftware: 15,
      domainWebsiteStorage: 10,
      licensedAssets: 5,
      unreimbursedPrintingPostage: 5,
      paymentFees: 10,
      advertisingNetworking: 10,
      officeEquipment: 5,
      contentCollectionHours: 4,
      researchInterviewHours: 4,
      writingEditingHours: 5,
      designFormattingHours: 3,
      proofingRevisionHours: 2,
      emailDistributionHours: 2,
      marketingAdminHours: 2,
    };
    const helper = computeCommunityNewsletterProfit(example);
    expect(helper.monthlyIssueRevenue).toBe(400);
    expect(helper.grossServiceRevenue).toBe(600);
    expect(helper.totalExpenses).toBe(75);
    expect(helper.estimatedProfit).toBe(525);
    expect(helper.totalHours).toBe(22);
    expect(helper.profitPerHour).toBeCloseTo(23.86, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(600);
    expect(result.expenses).toBe(75);
    expect(result.net).toBe(525);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Community Newsletter Creator");
    expect(pdf.steps.some((s) => /choose the community/i.test(s.title))).toBe(true);
  });
});
