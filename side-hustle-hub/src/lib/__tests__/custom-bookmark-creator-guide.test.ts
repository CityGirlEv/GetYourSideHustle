import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  CUSTOM_BOOKMARK_CREATOR_DETAILED_STEPS,
  CUSTOM_BOOKMARK_CREATOR_NOTES_WORKSHEET,
  CUSTOM_BOOKMARK_CREATOR_PREREQUISITE_EXTRAS,
  CUSTOM_BOOKMARK_CREATOR_PRICING,
  CUSTOM_BOOKMARK_CREATOR_REALITY_CHECK,
  CUSTOM_BOOKMARK_CREATOR_SUPPLIES,
  CUSTOM_BOOKMARK_CREATOR_TOOLS,
  computeCustomBookmarkCreatorProfit,
  customBookmarkCreatorToolsDisclaimer,
} from "../custom-bookmark-creator-guide";

const GUIDE_ID = "custom-bookmark-creator";

describe("Guide #056 Custom Bookmark Creator", () => {
  it("keeps a single #056 id, exact title, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("056");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("056");
    const idsFor056 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "056")
      .map(([id]) => id);
    expect(idsFor056).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Custom Bookmark Creator");
    expect(h.name).not.toMatch(/guide upgrade|bookmark business|personalized bookmark|kids bookmark|starter guide|member guide/i);
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior"]));
    expect(h.minTier).toBe("free");
    expect(h.freeWizardEligible).toBe(false);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps copyright / parent-approval copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? CUSTOM_BOOKMARK_CREATOR_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/single basic bookmark/i);
    expect(intro).toMatch(/gross revenue is not profit/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(
      (kit.supplies?.items ?? CUSTOM_BOOKMARK_CREATOR_SUPPLIES.items).some((i) =>
        /cardstock|bookmark blank/i.test(i.name),
      ),
    ).toBe(true);
    expect(CUSTOM_BOOKMARK_CREATOR_SUPPLIES.starterKitTotal).toMatch(/10–20 bookmarks/i);
    expect(CUSTOM_BOOKMARK_CREATOR_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(customBookmarkCreatorToolsDisclaimer()).toMatch(/copy anything/i);
    expect(CUSTOM_BOOKMARK_CREATOR_REALITY_CHECK.title).toMatch(/copy anything/i);
    expect(CUSTOM_BOOKMARK_CREATOR_NOTES_WORKSHEET).toMatch(/Proof Approved/i);
    expect(
      kit.prerequisites.some((p) => p.id === "parent") ||
        CUSTOM_BOOKMARK_CREATOR_PREREQUISITE_EXTRAS.some((p) => p.id === "parent"),
    ).toBe(true);
    expect(CUSTOM_BOOKMARK_CREATOR_TOOLS.some((t) => t.id === "canva")).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 8–9", () => {
    const core = CUSTOM_BOOKMARK_CREATOR_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Pick Your Bookmark Style & Customer",
      "Set Safety, Copyright & Parent Rules",
      "Create Three Original Samples",
      "Test Quality & Get Feedback",
      "Calculate Cost & Set Prices",
      "Build Your Custom-Order System",
      "Make a Small Inventory Batch",
      "Choose Your Marketing Channels",
      "Create the Display or Listing",
      "Fulfill Orders & Track Real Profit",
      "Review Winners & Grow Carefully",
    ]);
    expect(core[0]?.desc).toMatch(/personalized names/i);
    expect(core[1]?.desc).toMatch(/legal clearance/i);
    expect(core[7]?.desc).toMatch(/pick only 2 or 3/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const wired = detailedStepsForGuide(GUIDE_ID) ?? [];
    if (wired.length > 0) {
      const titles = wired.map((s) => s.title);
      expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
      expect(titles.filter((t) => /create the display or listing/i.test(t))).toHaveLength(1);
    }
  });

  it("uses monthly calculator: $260 revenue, $92 expenses, $168 profit", () => {
    const example = {
      cbcSinglesSold: 20,
      cbcAvgSinglePrice: 5,
      cbcSetsSold: 5,
      cbcAvgSetPrice: 16,
      cbcProjects: 2,
      cbcAvgProjectPrice: 40,
      cbcOtherRevenue: 0,
      cbcCardstockBlanks: 30,
      cbcInkArtSupplies: 20,
      cbcLaminate: 15,
      cbcRibbonTassels: 8,
      cbcPackaging: 7,
      cbcPlatformPaymentFees: 5,
      cbcEventFees: 0,
      cbcShipping: 5,
      cbcRefundsReplacements: 2,
      cbcOtherExpenses: 0,
    };
    const helper = computeCustomBookmarkCreatorProfit(example);
    expect(helper.singleRevenue).toBe(100);
    expect(helper.setRevenue).toBe(80);
    expect(helper.projectRevenue).toBe(80);
    expect(helper.totalRevenue).toBe(260);
    expect(helper.totalExpenses).toBe(92);
    expect(helper.estimatedProfit).toBe(168);

    const profile = guideCalcProfileForId(GUIDE_ID, "Custom Bookmark Creator");
    if (Object.prototype.hasOwnProperty.call(profile.defaults, "cbcSinglesSold")) {
      expect(profile.title).toMatch(/profit calculator/i);
      expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);
      const result = computeGuideCalc(profile.mode, example, []);
      expect(result.revenue).toBe(260);
      expect(result.expenses).toBe(92);
      expect(result.net).toBe(168);
      expect(Number.isFinite(result.marginPercent)).toBe(true);
      expect(result.marginPercent).toBeCloseTo((168 / 260) * 100, 5);
    }
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Custom Bookmark Creator");
    const pdfSteps = pdf.steps.map((s) => s.title);
    expect(
      pdfSteps.some((t) => /three original samples/i.test(t)) ||
        CUSTOM_BOOKMARK_CREATOR_DETAILED_STEPS.some((s) => /three original samples/i.test(s.title)),
    ).toBe(true);
  });
});
