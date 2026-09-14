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
import { KIDS_FREE_GUIDE_IDS } from "../age-library-tiers";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  GIFT_WRAPPING_DETAILED_STEPS,
  GIFT_WRAPPING_NOTES_WORKSHEET,
  GIFT_WRAPPING_PRICING,
  GIFT_WRAPPING_REALITY_CHECK,
  GIFT_WRAPPING_SUPPLIES,
  GIFT_WRAPPING_TOOLS,
  giftWrappingToolsDisclaimer,
  computeGiftWrappingProfit,
} from "../gift-wrapping-guide";

const GUIDE_ID = "gift-wrapping";

describe("Guide #007 Gift Wrapping Service", () => {
  it("keeps a single #007 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("007");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("007");
    const idsFor007 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "007")
      .map(([id]) => id);
    expect(idsFor007).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Gift Wrapping Service");
    expect(h.name).not.toMatch(/guide upgrade|wrapping guide|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.category).toMatch(/Local Services\s*\/\s*Gift Wrapping/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.potentialIncome).toMatch(/examples only/i);
    expect(FREE_WIZARD_HUSTLE_IDS).toContain(GUIDE_ID);
    expect(FREE_WIZARD_HUSTLE_IDS.length).toBeLessThanOrEqual(20);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(KIDS_FREE_GUIDE_IDS).not.toContain(GUIDE_ID);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing with wrapping formula and starter ranges", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = Array.isArray(kit.suggestedPricing?.intro)
      ? kit.suggestedPricing.intro.join("\n")
      : String(kit.suggestedPricing?.intro ?? GIFT_WRAPPING_PRICING.intro);
    expect(intro).toMatch(/\$10 – \$40 \/ job/i);
    expect(intro).toMatch(/Service Charge/i);
    expect(intro).toMatch(/Materials Charged to Customer/i);
    expect(intro).toMatch(/\$5–\$8/);
    expect(intro).toMatch(/\$8–\$12/);
    expect(intro).toMatch(/\$12–\$20\+/);
    expect(intro).toMatch(/revenue is not profit/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$5–\$8/.test(i.price))).toBe(true);
    expect(JSON.stringify(kit.suggestedPricing?.items)).not.toMatch(/\$3–6/);
    expect(kit.supplies?.items.some((i) => /wrapping paper/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /gift bags/i.test(i.name))).toBe(true);
    expect(GIFT_WRAPPING_SUPPLIES.items.some((i) => /portable supply tote/i.test(i.name) && i.optional)).toBe(
      true,
    );
    expect(GIFT_WRAPPING_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(giftWrappingToolsDisclaimer()).toMatch(/google forms/i);
    expect(GIFT_WRAPPING_REALITY_CHECK.body).toMatch(/do not open sealed/i);
    expect(GIFT_WRAPPING_NOTES_WORKSHEET).toMatch(/Customer Supplies Materials/i);
    expect(GIFT_WRAPPING_NOTES_WORKSHEET).toMatch(/Profit Per Hour/i);
    expect(GIFT_WRAPPING_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = GIFT_WRAPPING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Practice Neat Wrapping Techniques",
      "Define Your Services and Choose Materials",
      "Calculate Material Costs and Create a Price Menu",
      "Set Order Deadlines and Customer Intake",
      "Label, Wrap, and Quality-Check Gifts",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Hand Off Gifts and Collect Payment",
      "Ask for Repeat and Referral Business",
      "Track Revenue, Profit, and Best-Selling Options",
    ]);
    expect(core[2]?.desc).toMatch(/service charge/i);
    expect(core[4]?.desc).toMatch(/clearly labeled/i);
    expect(core[5]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[8]?.desc).toMatch(/safe meetup/i);
    expect(core[10]?.desc).toMatch(/revenue is not profit/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      expect(step.title).not.toMatch(/GUIDE UPGRADE/i);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(titles.some((t) => /stock wrap, tape, scissors/i.test(t))).toBe(false);
  });

  it("uses wrapping calculator: $148 revenue, $48 expenses, $100 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Gift Wrapping Service");
    expect(profile.title).toMatch(/gift wrapping profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "smallGifts")).toBe(true);

    const helper = computeGiftWrappingProfit({
      smallGifts: 6,
      smallGiftPrice: 6,
      mediumGifts: 4,
      mediumGiftPrice: 10,
      largeGifts: 2,
      largeGiftPrice: 15,
      packagesSold: 1,
      packagePrice: 28,
      addOnRevenue: 8,
      pickupDeliveryRevenue: 6,
      wrappingPaper: 12,
      ribbonBows: 8,
      boxesBagsTissue: 7,
      tagsDecorations: 3,
      travel: 5,
      paymentFees: 4,
      advertising: 6,
      otherExpenses: 3,
      laborHours: 8,
      jobsCompleted: 3,
    });
    expect(helper.smallGiftRevenue).toBe(36);
    expect(helper.mediumGiftRevenue).toBe(40);
    expect(helper.largeGiftRevenue).toBe(30);
    expect(helper.packageRevenue).toBe(28);
    expect(helper.grossRevenue).toBe(148);
    expect(helper.totalExpenses).toBe(48);
    expect(helper.estimatedProfit).toBe(100);
    expect(helper.totalGifts).toBe(12);
    expect(helper.estimatedProfitPerGift).toBeCloseTo(8.333, 2);
    expect(helper.estimatedProfitPerJob).toBeCloseTo(100 / 3, 5);
    expect(helper.profitPerHour).toBe(12.5);
    expect(helper.materialCost).toBe(30);
    expect(helper.materialCostPerGift).toBe(2.5);

    const result = computeGuideCalc(
      profile.mode,
      {
        smallGifts: 6,
        smallGiftPrice: 6,
        mediumGifts: 4,
        mediumGiftPrice: 10,
        largeGifts: 2,
        largeGiftPrice: 15,
        packagesSold: 1,
        packagePrice: 28,
        addOnRevenue: 8,
        pickupDeliveryRevenue: 6,
        wrappingPaper: 12,
        ribbonBows: 8,
        boxesBagsTissue: 7,
        tagsDecorations: 3,
        travel: 5,
        paymentFees: 4,
        advertising: 6,
        otherExpenses: 3,
        laborHours: 8,
        jobsCompleted: 3,
      },
      [],
    );
    expect(result.revenue).toBe(148);
    expect(result.expenses).toBe(48);
    expect(result.net).toBe(100);
    expect(result.notes.join(" ")).toMatch(/revenue is not profit/i);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Gift Wrapping Service");
    expect(pdf.steps.some((s) => /practice neat wrapping/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /track revenue, profit/i.test(s.title))).toBe(true);
    expect(kit.supplies?.items.some((i) => /ribbon/i.test(i.name))).toBe(true);
  });
});
