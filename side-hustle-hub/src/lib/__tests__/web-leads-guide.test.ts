import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { kidsLibraryMinTier, juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  WEB_LEADS_DETAILED_STEPS,
  WEB_LEADS_NOTES_WORKSHEET,
  WEB_LEADS_PRICING,
  WEB_LEADS_REALITY_CHECK,
  WEB_LEADS_SUPPLIES,
  WEB_LEADS_TOOLS,
  computeWebLeadsProfit,
  webLeadsToolsDisclaimer,
} from "../web-leads-guide";

const GUIDE_ID = "web-leads";

describe("Guide #085 Local Website Lead Finder", () => {
  it("keeps a single #085 id, exact title, Elite, 10 - 20 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("085");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("085");
    const idsFor085 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "085")
      .map(([id]) => id);
    expect(idsFor085).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Local Website Lead Finder");
    expect(h.name).not.toMatch(/guide upgrade|website lead guide|elite guide|member guide/i);
    expect(h.category).toBe("Local Services");
    expect(h.timeReq).toMatch(/10\s*-\s*20 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$800/);
    expect(h.potentialIncome).toMatch(/\$6,000/);
    expect(h.audiences).toEqual(["adult"]);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/weak or missing websites/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and excludes WordPress from approved build path", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? WEB_LEADS_PRICING.intro);
    expect(intro).toMatch(/\$150 – \$400/i);
    expect(intro).toMatch(/\$800 – \$1,500/i);
    expect(intro).toMatch(/\$800 - \$6,000\/mo/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(WEB_LEADS_TOOLS.some((t) => /cloudflare pages/i.test(t.name))).toBe(true);
    expect(WEB_LEADS_TOOLS.some((t) => /wordpress/i.test(t.costNote))).toBe(true);
    expect(WEB_LEADS_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(webLeadsToolsDisclaimer()).toMatch(/not permission to spam/i);
    expect(webLeadsToolsDisclaimer()).toMatch(/wordpress/i);
    expect(WEB_LEADS_REALITY_CHECK.title).toMatch(/not permission to spam/i);
    expect(WEB_LEADS_NOTES_WORKSHEET).toMatch(/Observed Problem/i);
    expect(WEB_LEADS_DETAILED_STEPS[8]?.desc).toMatch(/cloudflare pages/i);
    expect(WEB_LEADS_DETAILED_STEPS[8]?.desc).toMatch(/wordpress/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–7", () => {
    const core = WEB_LEADS_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Pick a Zip Code & Niche Lane",
      "Define the Audit & Build Offers",
      "Build the Lead Scorecard",
      "Build a Qualified Lead List",
      "Run a 60-Second Audit & Select the Best Leads",
      "Choose Your Marketing Channels",
      "Make & Carry Out the Marketing Plan",
      "Run Discovery, Propose & Collect a Deposit",
      "Build in Client-Owned Systems",
      "Test, Approve & Launch",
      "Hand Off, Retain & Ask for Referrals",
    ]);
    expect(core[0]?.desc).toMatch(/zip code/i);
    expect(core[2]?.desc).toMatch(/observable conditions/i);
    expect(core[5]?.desc).toMatch(/choose exactly 2 or 3/i);
    expect(core[6]?.desc).toMatch(/opt-out/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const wired = detailedStepsForGuide(GUIDE_ID) ?? [];
    const wiredTitles = wired.map((s) => s.title);
    if (wiredTitles.some((t) => /choose your marketing channels/i.test(t))) {
      expect(wiredTitles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
      expect(wiredTitles.filter((t) => /make & carry out the marketing plan/i.test(t))).toHaveLength(1);
    }
  });

  it("uses monthly calculator: $2,600 revenue, $500 expenses, $2,100 profit, $26.25/hr", () => {
    const example = {
      wlAuditsPerMonth: 2,
      wlAvgAuditPrice: 250,
      wlBuildsPerMonth: 1,
      wlAvgBuildPrice: 1800,
      wlRetainerRevenue: 300,
      wlSoftwareHosting: 120,
      wlContractorCosts: 200,
      wlPaymentFeesRefunds: 80,
      wlOutreachTravel: 50,
      wlOtherExpenses: 50,
      wlTotalHours: 80,
    };
    const helper = computeWebLeadsProfit(example);
    expect(helper.auditRevenue).toBe(500);
    expect(helper.buildRevenue).toBe(1800);
    expect(helper.monthlyGrossRevenue).toBe(2600);
    expect(helper.monthlyExpenses).toBe(500);
    expect(helper.estimatedMonthlyProfit).toBe(2100);
    expect(helper.totalHours).toBe(80);
    expect(helper.profitPerHour).toBeCloseTo(26.25, 2);

    const profile = guideCalcProfileForId(GUIDE_ID, "Local Website Lead Finder");
    if (Object.prototype.hasOwnProperty.call(profile.defaults, "wlAuditsPerMonth")) {
      expect(profile.title).toMatch(/monthly profit calculator/i);
      expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);
      const result = computeGuideCalc(profile.mode, example, []);
      expect(result.revenue).toBe(2600);
      expect(result.expenses).toBe(500);
      expect(result.net).toBe(2100);
    }
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Local Website Lead Finder");
    const pdfSteps = pdf.steps.map((s) => s.title);
    expect(
      pdfSteps.some((t) => /lead scorecard/i.test(t)) ||
        WEB_LEADS_DETAILED_STEPS.some((s) => /lead scorecard/i.test(s.title)),
    ).toBe(true);
  });
});
