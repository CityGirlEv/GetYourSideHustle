import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import {
  guideCalcModeForId,
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import {
  ESTATE_SALE_NOTES_WORKSHEET,
  ESTATE_SALE_REALITY_CHECK,
  ESTATE_SALE_DETAILED_STEPS,
} from "../estate-sale-antique-resales-guide";

const GUIDE_ID = "estate-sale-listing-helper";

describe("Guide #066 Estate Sale & Antique Resales", () => {
  it("keeps a single #066 id and updated title", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("066");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("066");
    const idsFor066 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "066")
      .map(([id]) => id);
    expect(idsFor066).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Estate Sale & Antique Resales");
    expect(h.audiences).toEqual(["adult", "senior"]);
    expect(h.category).toMatch(/Reselling/i);
    expect(h.description).toMatch(/resell/i);
  });

  it("ships all prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /buy-low|requirements|before buying/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.tabLabel).toMatch(/pricing for profit/i);
    expect(kit.suggestedPricing?.intro).toMatch(/maximum buy price/i);
    expect(kit.supplies?.items.some((i) => /shipping scale/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /bubble wrap/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /google lens/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /ebay sold/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /estatesales\.net/i.test(t.name))).toBe(true);
    expect(ESTATE_SALE_REALITY_CHECK.title).toMatch(/old doesn.?t always mean valuable/i);
    expect(ESTATE_SALE_NOTES_WORKSHEET).toMatch(/Reseller Field Notebook/i);
    expect(ESTATE_SALE_NOTES_WORKSHEET).toMatch(/BOLO/i);
    expect(ESTATE_SALE_NOTES_WORKSHEET).toMatch(/Shop Your Own House/i);
  });

  it("includes the 11 authored launch steps", () => {
    const core = ESTATE_SALE_DETAILED_STEPS.filter(
      (s) =>
        !/pick how you will tell|make your marketing|carry out the marketing/i.test(s.title),
    );
    expect(core).toHaveLength(11);
    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Choose 1–3 categories to learn",
        "Set a starting inventory budget",
        "Find estate sales and other sources",
        "Review sale photos and create a Look For list",
        "Inspect items carefully on site",
        "Research before buying",
        "Calculate potential profit before purchasing",
        "Buy and record immediately",
        "Clean carefully and photograph for listing",
        "List on the best marketplace",
        "Log the sale and review your buy decision",
        "Make Your First Sale",
        "Ask for a Short Review",
      ]),
    );
  });

  it("uses Resale Profit Calculator mode with max buy price", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("resale");
    const profile = guideCalcProfileForId(GUIDE_ID, "Estate Sale & Antique Resales");
    expect(profile.mode).toBe("resale");
    expect(profile.title).toMatch(/Resale Profit/i);
    expect(profile.disclaimerExtra).toMatch(/Planning estimates only/i);

    const result = computeGuideCalc(
      "resale",
      {
        purchasePrice: 35,
        expectedSellingPrice: 100,
        marketplaceFees: 13,
        paymentFees: 3,
        shippingPaidBySeller: 5,
        packagingCost: 2,
        cleaningRepairCost: 2,
        otherCosts: 0,
        desiredProfit: 40,
      },
      [],
    );
    expect(result.expenses).toBe(60);
    expect(result.net).toBe(40);
    expect(result.marginPercent).toBeCloseTo(40, 5);
    expect(result.metrics?.maxBuyPrice).toBe(35);
    expect(result.metrics?.roiPercent).toBeCloseTo((40 / 39) * 100, 5);
  });
});
