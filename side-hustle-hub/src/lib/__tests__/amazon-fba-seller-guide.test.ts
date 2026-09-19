import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  AMAZON_FBA_SELLER_DETAILED_STEPS,
  AMAZON_FBA_SELLER_NOTES_WORKSHEET,
  AMAZON_FBA_SELLER_PRICING,
  AMAZON_FBA_SELLER_REALITY_CHECK,
  AMAZON_FBA_SELLER_SUPPLIES,
  AMAZON_FBA_SELLER_TOOLS,
  amazonFbaSellerToolsDisclaimer,
  computeAmazonFbaSellerProfit,
} from "../amazon-fba-seller-guide";

const GUIDE_ID = "amazon";

describe("Guide #033 Amazon FBA Seller", () => {
  it("keeps a single #033 id, exact title, Elite, 15 - 30 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("033");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("033");
    const idsFor033 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "033")
      .map(([id]) => id);
    expect(idsFor033).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Amazon FBA Seller");
    expect(h.name).not.toMatch(/guide upgrade|amazon seller|fulfillment by amazon|private label|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/15\s*-\s*30 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$1,000/);
    expect(h.potentialIncome).toMatch(/\$50,000/);
    expect(h.startupCost).toMatch(/over \$1,000/i);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships COMPLETE kit data: reality check, notes, pricing, supplies, beginner stack", () => {
    expect(AMAZON_FBA_SELLER_REALITY_CHECK.title).toMatch(/does not remove seller responsibility/i);
    expect(AMAZON_FBA_SELLER_NOTES_WORKSHEET).toMatch(/UNIT ECONOMICS/i);
    expect(AMAZON_FBA_SELLER_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(AMAZON_FBA_SELLER_PRICING.intro).toMatch(/\$1,000 - \$50,000\/mo/i);
    expect(AMAZON_FBA_SELLER_PRICING.intro).toMatch(/gross-sales examples/i);
    expect(AMAZON_FBA_SELLER_PRICING.intro).toMatch(/contribution profit per unit/i);
    expect(AMAZON_FBA_SELLER_PRICING.intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(AMAZON_FBA_SELLER_SUPPLIES.items.some((i) => /samples|compliance|unit-economics/i.test(i.name))).toBe(true);
    expect(AMAZON_FBA_SELLER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(amazonFbaSellerToolsDisclaimer()).toMatch(/current fee estimate/i);
    expect(amazonFbaSellerToolsDisclaimer()).toMatch(/reorder\/exit rules/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 8–10", () => {
    const core = AMAZON_FBA_SELLER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Set the Capital Limit and Business Rules",
      "Research a Product Problem, Not a Trend Screenshot",
      "Screen Compliance and Intellectual Property",
      "Find and Verify Suppliers",
      "Build Conservative Unit Economics",
      "Order Samples and Test the Complete Product",
      "Build the Brand and Truthful Listing",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Launch Inventory, Monitor Account Health & Reorder or Exit",
    ]);
    expect(core[7]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[8]?.desc).toMatch(/lawful listing photos/i);
    expect(core[9]?.desc).toMatch(/contribution profit/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    expect(core.filter((s) => /choose your marketing channels/i.test(s.title))).toHaveLength(1);
    expect(core.filter((s) => /make your marketing materials/i.test(s.title))).toHaveLength(1);
    expect(core.filter((s) => /carry out your marketing plan/i.test(s.title))).toHaveLength(1);
  });

  it("uses monthly calculator: $7,200 net sales, $1,300 profit, ~18.1% margin", () => {
    const example = computeAmazonFbaSellerProfit({
      amzUnitsSold: 300,
      amzAvgSellingPrice: 25,
      amzRefunds: 300,
      amzOtherCredits: 0,
      amzLandedCostPerUnit: 8,
      amzReferralFees: 1125,
      amzFbaFulfillmentFees: 900,
      amzStoragePlacementOther: 225,
      amzAdvertising: 800,
      amzCouponsPromotions: 100,
      amzOtherVariableCosts: 0,
      amzSellingPlanSoftware: 40,
      amzTestingCompliance: 100,
      amzInsuranceProfessional: 0,
      amzPhotographyDesign: 150,
      amzOtherOverhead: 60,
      amzUnitsOnHand: 200,
      amzLeadTimeDays: 45,
      amzAvgUnitsSoldPerDay: 10,
    });
    expect(example.grossProductSales).toBe(7500);
    expect(example.netSalesCollected).toBe(7200);
    expect(example.costOfGoodsSold).toBe(2400);
    expect(example.amazonFeesTotal).toBe(2250);
    expect(example.advertisingPromotionsTotal).toBe(900);
    expect(example.fixedCostsTotal).toBe(350);
    expect(example.estimatedProfit).toBe(1300);
    expect(example.netMarginPercent).toBeCloseTo(18.06, 1);
    expect(example.inventoryCashTiedUp).toBe(1600);
    expect(example.reorderPoint).toBe(450);
  });

  it("Download PDF model matches the upgraded on-screen kit title", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Amazon FBA Seller");
    expect(AMAZON_FBA_SELLER_DETAILED_STEPS.some((s) => /unit economics/i.test(s.title))).toBe(true);
  });
});
