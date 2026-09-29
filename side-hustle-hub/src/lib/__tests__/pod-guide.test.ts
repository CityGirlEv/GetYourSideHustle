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
import { guideCalcModeForId, guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  POD_DETAILED_STEPS,
  POD_NOTES_WORKSHEET,
  POD_PRICING,
  POD_REALITY_CHECK,
  POD_SUPPLIES,
  POD_TOOLS,
  computePodProfit,
  podToolsDisclaimer,
} from "../pod-guide";

const GUIDE_ID = "pod";

describe("Guide #095 Print-on-Demand (POD)", () => {
  it("keeps a single #095 id, exact title, time, Elite, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("095");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("095");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Print-on-Demand (POD)");
    expect(h.name).not.toMatch(/guide upgrade|pod guide|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/1\s*-\s*2 weeks/i);
    expect(h.potentialIncome).toMatch(/\$200/);
    expect(h.potentialIncome).toMatch(/\$3,000/);
    expect(h.potentialIncome).toMatch(/examples only/i);
    expect(h.minTier).toBe("elite");
    expect(h.audiences).toContain("senior");
    expect(h.audiences).toContain("adult");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and distinguishes gross sales from profit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? POD_PRICING.intro);
    expect(intro).toMatch(/GROSS SALES/i);
    expect(intro).toMatch(/not a zero-cost business/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /sample/i.test(i.name) && i.optional)).toBe(true);
    expect(POD_SUPPLIES.items.some((i) => /warehouse/i.test(i.notes ?? "") || /inventory/i.test(i.notes ?? ""))).toBe(
      true,
    );
    expect(POD_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(podToolsDisclaimer()).toMatch(/printify or printful/i);
    expect(POD_REALITY_CHECK.title).toMatch(/not a zero-cost/i);
    expect(POD_NOTES_WORKSHEET).toMatch(/Estimated Profit Per Sale/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = POD_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose a Niche and Customer",
      "Research Demand, Competition, and Products",
      "Choose POD Products and a Provider",
      "Create Original or Licensed Designs",
      "Order Samples and Build Your Pricing Sheet",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Connect Fulfillment and Publish Listings",
      "Process Orders and Customer Service",
      "Review Profit and Scale Only Winners",
    ]);
    expect(core[3]?.desc).toMatch(/trademark/i);
    expect(core[5]?.desc).toMatch(/pick only 2 or 3/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
  });

  it("uses POD calculator: $1,120 sales, $950 costs, $170 profit", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("service");
    const profile = guideCalcProfileForId(GUIDE_ID, "Print-on-Demand (POD)");
    expect(profile.title).toMatch(/pod profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "podUnitsSold")).toBe(true);

    const helper = computePodProfit({
      podUnitsSold: 40,
      averageSellingPrice: 28,
      productionCostPerUnit: 12,
      shippingPaidBySellerPerUnit: 2,
      feesPerUnit: 3,
      advertisingPerUnit: 4,
      discounts: 20,
      refundsReplacements: 30,
      softwareApps: 20,
      sampleCosts: 25,
      otherOperatingExpenses: 15,
    });
    expect(helper.grossSales).toBe(1120);
    expect(helper.totalCosts).toBe(950);
    expect(helper.estimatedProfit).toBe(170);

    const result = computeGuideCalc(
      profile.mode,
      {
        podUnitsSold: 40,
        averageSellingPrice: 28,
        productionCostPerUnit: 12,
        shippingPaidBySellerPerUnit: 2,
        feesPerUnit: 3,
        advertisingPerUnit: 4,
        discounts: 20,
        refundsReplacements: 30,
        softwareApps: 20,
        sampleCosts: 25,
        otherOperatingExpenses: 15,
      },
      [],
    );
    expect(result.revenue).toBe(1120);
    expect(result.expenses).toBe(950);
    expect(result.net).toBe(170);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Print-on-Demand (POD)");
    expect(pdf.steps.some((s) => /choose a niche and customer/i.test(s.title))).toBe(true);
  });
});
