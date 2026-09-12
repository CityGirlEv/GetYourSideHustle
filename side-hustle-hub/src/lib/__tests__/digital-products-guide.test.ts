import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  DIGITAL_PRODUCTS_DETAILED_STEPS,
  DIGITAL_PRODUCTS_NOTES_WORKSHEET,
  DIGITAL_PRODUCTS_REALITY_CHECK,
  computeDigitalProductProfit,
} from "../digital-products-guide";

const GUIDE_ID = "digital-products";

describe("Guide #062 Digital Products", () => {
  it("keeps a single #062 id, exact title, Elite membership, 2–6 weeks, and $200–$10,000/month", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("062");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("062");
    const idsFor062 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "062")
      .map(([id]) => id);
    expect(idsFor062).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Digital Products");
    expect(h.name).not.toMatch(/guide upgrade|elite guide|member guide|digital product guide/i);
    expect(h.minTier).toBe("elite");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(h.potentialIncome).toMatch(/\$200/);
    expect(h.potentialIncome).toMatch(/\$10,000/);
    expect(h.category).toMatch(/Digital/i);
    expect(h.description).toMatch(/ebooks|printables|planners|templates|mini-courses|book publishing/i);
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before selling/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.intro).toMatch(/\$200–\$10,000/i);
    expect(kit.suggestedPricing?.intro).toMatch(/not profit|revenue is not profit/i);
    expect(kit.supplies?.items.some((i) => /computer|creation|selling/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /canva/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(DIGITAL_PRODUCTS_REALITY_CHECK.title).toMatch(/start with one useful product/i);
    expect(DIGITAL_PRODUCTS_NOTES_WORKSHEET).toMatch(/MY DIGITAL PRODUCT PLAN/i);
    expect(DIGITAL_PRODUCTS_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps with all 3 marketing stages", () => {
    const core = DIGITAL_PRODUCTS_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/pick one product/i);
    expect(core[4]?.title).toMatch(/choose your marketing channels/i);
    expect(core[5]?.title).toMatch(/make your marketing materials/i);
    expect(core[7]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[1]?.desc).toMatch(/DO NOT copy/i);
    expect(core[6]?.desc).toMatch(/platform fees/i);

    for (const step of core) {
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

  it("uses Digital Product Profit Calculator and rounds required sales up", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Digital Products");
    expect(profile.title).toMatch(/digital product profit calculator/i);

    const result = computeGuideCalc(
      "product",
      { units: 50, price: 15, monthlyProfitGoal: 1000 },
      [
        { id: "platform", label: "Platform fees", amount: 50 },
        { id: "payment", label: "Payment processing", amount: 25 },
        { id: "advertising", label: "Advertising", amount: 50 },
        { id: "software", label: "Software", amount: 0 },
        { id: "refunds", label: "Refunds", amount: 0 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(750);
    expect(result.expenses).toBe(125);
    expect(result.net).toBe(625);
    expect(result.metrics?.profitPerSale).toBeCloseTo(12.5, 5);
    expect(result.metrics?.salesNeeded).toBe(80);

    const helper = computeDigitalProductProfit({
      productPrice: 15,
      salesPerMonth: 50,
      platformFees: 50,
      paymentProcessingFees: 25,
      advertising: 50,
      monthlyProfitGoal: 1000,
    });
    expect(helper.grossRevenue).toBe(750);
    expect(helper.totalExpenses).toBe(125);
    expect(helper.estimatedProfit).toBe(625);
    expect(helper.profitPerSale).toBeCloseTo(12.5, 5);
    expect(helper.salesNeeded).toBe(80);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Digital Products");
    expect(pdf.steps.some((s) => /pick one product/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /carry out your marketing plan/i.test(s.title))).toBe(true);
  });
});
