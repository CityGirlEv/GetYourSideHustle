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
  WEBSITE_TESTER_DETAILED_STEPS,
  WEBSITE_TESTER_NOTES_WORKSHEET,
  WEBSITE_TESTER_PRICING,
  WEBSITE_TESTER_REALITY_CHECK,
  WEBSITE_TESTER_SUPPLIES,
  WEBSITE_TESTER_TOOLS,
  computeWebsiteTesterProfit,
  websiteTesterToolsDisclaimer,
} from "../website-tester-guide";

const GUIDE_ID = "website-tester";

describe("Guide #116 Website Tester", () => {
  it("keeps a single #116 id, exact title, Starter, 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("116");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("116");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Website Tester");
    expect(h.name).not.toMatch(/guide upgrade|web tester|website testing helper|website reviewer|ux tester|qa tester|member guide/i);
    expect(h.category).toBe("Digital Services / Website Quality Testing");
    expect(h.timeReq).toMatch(/10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/bug-and-clarity checklist/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and excludes security testing", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? WEBSITE_TESTER_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/\$15 – \$25/);
    expect(intro).toMatch(/test my whole website/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /bug-report template/i.test(i.name))).toBe(true);
    expect(WEBSITE_TESTER_SUPPLIES.starterKitTotal).toMatch(/\$0–20/);
    expect(WEBSITE_TESTER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /chrome/i.test(t.name))).toBe(true);
    expect(websiteTesterToolsDisclaimer()).toMatch(/written scope/i);
    expect(WEBSITE_TESTER_REALITY_CHECK.title).toMatch(/written authorization/i);
    expect(WEBSITE_TESTER_NOTES_WORKSHEET).toMatch(/blocker \/ major \/ minor/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = WEBSITE_TESTER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define the Website-Testing Service & Boundaries",
      "Set Packages, Page Limits, Turnaround & Retest Rules",
      "Create the Authorization, Test Plan & Data-Safety Process",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Complete Intake & Build the Test Matrix",
      "Run the Public-Page, Content & Navigation Check",
      "Test Approved Forms, Responsive Views, Accessibility & Performance",
      "Document Each Issue with Screenshots & Reproduction Steps",
      "Deliver the Prioritized Report, Retest & Close Out",
    ]);
    expect(core[0]?.desc).toMatch(/penetration or vulnerability testing/i);
    expect(core[3]?.desc).toMatch(/your site is hacked/i);
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
    const profile = guideCalcProfileForId(GUIDE_ID, "Website Tester");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "websiteTesterQuickChecksPerWeek")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const helper = computeWebsiteTesterProfit({
      websiteTesterQuickChecksPerWeek: 1,
      averageQuickCheckFee: 25,
      expandedProjectsPerMonth: 4,
      averageExpandedProjectFee: 45,
      retestRevenuePerMonth: 40,
      addOnRushRevenue: 20,
      internetPhone: 10,
      softwareStorage: 5,
      equipment: 5,
      advertisingPortfolio: 5,
      paymentFees: 5,
      otherExpenses: 5,
      intakeHours: 2,
      testingHours: 8,
      screenshotReportHours: 3,
      retestHours: 1,
      marketingAdminHours: 2,
    });
    expect(helper.monthlyQuickRevenue).toBeCloseTo(108.25, 2);
    expect(helper.expandedProjectRevenue).toBe(180);
    expect(helper.grossServiceRevenue).toBeCloseTo(348.25, 2);
    expect(helper.totalExpenses).toBe(35);
    expect(helper.estimatedProfit).toBeCloseTo(313.25, 2);
    expect(helper.totalHours).toBe(16);
    expect(helper.profitPerHour).toBeCloseTo(19.58, 2);

    const result = computeGuideCalc(
      profile.mode,
      {
        websiteTesterQuickChecksPerWeek: 1,
        averageQuickCheckFee: 25,
        expandedProjectsPerMonth: 4,
        averageExpandedProjectFee: 45,
        retestRevenuePerMonth: 40,
        addOnRushRevenue: 20,
        internetPhone: 10,
        softwareStorage: 5,
        equipment: 5,
        advertisingPortfolio: 5,
        paymentFees: 5,
        otherExpenses: 5,
        intakeHours: 2,
        testingHours: 8,
        screenshotReportHours: 3,
        retestHours: 1,
        marketingAdminHours: 2,
      },
      [],
    );
    expect(result.revenue).toBeCloseTo(348.25, 2);
    expect(result.expenses).toBe(35);
    expect(result.net).toBeCloseTo(313.25, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Website Tester");
    expect(pdf.steps.some((s) => /define the website-testing service/i.test(s.title))).toBe(true);
  });
});
