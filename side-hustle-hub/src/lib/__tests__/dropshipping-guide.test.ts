import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { LAUNCH_GUIDES } from "../launch-guides";
import { guideKitForId } from "../guide-tools";
import {
  DROPSHIPPING_DETAILED_STEPS,
  DROPSHIPPING_EXTERNAL_LINKS,
  DROPSHIPPING_NOTES_WORKSHEET,
  DROPSHIPPING_PREREQUISITE_EXTRAS,
  DROPSHIPPING_PRICING,
  DROPSHIPPING_REALITY_CHECK,
  DROPSHIPPING_SUPPLIES,
  DROPSHIPPING_TOOLS,
  computeDropshippingProfit,
  dropshippingToolsDisclaimer,
} from "../dropshipping-guide";

const GUIDE_ID = "dropshipping";

describe("Guide #065 Dropshipping Business", () => {
  it("keeps a single #065 id, exact title, Elite, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("065");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("065");
    const idsFor065 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "065")
      .map(([id]) => id);
    expect(idsFor065).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(LAUNCH_GUIDES.find((g) => g.id === GUIDE_ID)?.name).toBe("Dropshipping Business");
    expect(h.name).toBe("Dropshipping Business");
    expect(h.name).not.toMatch(
      /guide upgrade|dropshipping guide|ecommerce guide|online store guide|elite guide|member guide/i,
    );
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(h.timeReq).toMatch(/2\s*-\s*3 weeks/i);
    expect(h.category).toMatch(/Ecommerce\s*\/\s*Online Business/i);
    expect(h.potentialIncome).toMatch(/\$10,000/);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
    expect(guideKitForId(GUIDE_ID).tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
  });

  it("ships COMPLETE tools, supplies, pricing, notes, and beginner stack", () => {
    expect(DROPSHIPPING_TOOLS.some((t) => t.name === "Beginner Tool Stack")).toBe(true);
    expect(dropshippingToolsDisclaimer()).toMatch(/store platform \+ 1–2 vetted suppliers/i);
    expect(dropshippingToolsDisclaimer()).toMatch(/do not treat sales revenue as profit/i);
    expect(DROPSHIPPING_SUPPLIES.starterKitTotal).toMatch(/\$10–80/i);
    expect(DROPSHIPPING_SUPPLIES.items.some((i) => /sample/i.test(i.name) && i.optional)).toBe(true);
    expect(DROPSHIPPING_SUPPLIES.items.some((i) => /pricing spreadsheet/i.test(i.name))).toBe(true);
    expect(DROPSHIPPING_PRICING.intro).toMatch(/\$500 – \$10,000\+/i);
    expect(DROPSHIPPING_PRICING.intro).toMatch(/not treat sales revenue as profit/i);
    expect(DROPSHIPPING_PRICING.intro).toMatch(/minimum sustainable selling price/i);
    expect(DROPSHIPPING_PRICING.intro).toMatch(/\$37/);
    expect(DROPSHIPPING_PRICING.intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(DROPSHIPPING_REALITY_CHECK.title).toMatch(/dropshipping is not .easy money/i);
    expect(DROPSHIPPING_NOTES_WORKSHEET).toMatch(/Fall in love with the NUMBERS/i);
    expect(DROPSHIPPING_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(DROPSHIPPING_PREREQUISITE_EXTRAS.some((p) => /need|overview|before launch|prohibited/i.test(p.label))).toBe(
      true,
    );
    expect(DROPSHIPPING_EXTERNAL_LINKS.some((l) => /shopify/i.test(l.label))).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = DROPSHIPPING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toBe("Choose a Clear Niche & Customer");
    expect(core[1]?.title).toBe("Research Products Before Adding Them");
    expect(core[2]?.title).toBe("Vet Suppliers");
    expect(core[3]?.title).toBe("Build Your Pricing & Profit Sheet");
    expect(core[4]?.title).toBe("Build Your Storefront");
    expect(core[5]?.title).toBe("Choose Your Marketing Channels");
    expect(core[6]?.title).toBe("Make Your Marketing Materials");
    expect(core[7]?.title).toBe("Carry Out Your Marketing Plan");
    expect(core[8]?.title).toBe("Process Orders & Manage Customer Experience");
    expect(core[9]?.title).toBe("Handle Returns, Refunds & Chargebacks Professionally");
    expect(core[10]?.title).toBe("Review Profit & Scale Only Winners");
    expect(core[5]?.desc).toMatch(/pick only 2–3/i);
    expect(core[6]?.desc).toMatch(/fake reviews/i);
    expect(core[7]?.desc).toMatch(/TEST → MEASURE → KEEP \/ IMPROVE \/ STOP/i);
    expect(core[10]?.desc).toMatch(/SCALE WINNERS/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = core.map((s) => s.title);
    expect(titles.filter((t) => t === "Choose Your Marketing Channels")).toHaveLength(1);
    expect(titles.filter((t) => t === "Make Your Marketing Materials")).toHaveLength(1);
    expect(titles.filter((t) => t === "Carry Out Your Marketing Plan")).toHaveLength(1);
  });

  it("uses Dropshipping profit calculator: 100 orders × $39, $25 variable, $300 fixed → $1,100 and ≈ 28.2% margin", () => {
    const helper = computeDropshippingProfit({
      ordersPerMonth: 100,
      averageSellingPrice: 39,
      averageProductCost: 12,
      averageSupplierShipping: 3,
      paymentPlatformFeesPerOrder: 2,
      averageAdCostPerOrder: 6,
      refundChargebackCostPerOrder: 2,
      otherVariableCostPerOrder: 0,
      monthlyStoreAppCosts: 300,
      otherMonthlyExpenses: 0,
    });
    expect(helper.revenue).toBe(3900);
    expect(helper.variableCostPerOrder).toBe(25);
    expect(helper.monthlyVariableCosts).toBe(2500);
    expect(helper.monthlyFixedCosts).toBe(300);
    expect(helper.monthlyProfit).toBe(1100);
    expect(helper.profitPerOrder).toBe(11);
    expect(helper.profitMargin).toBeCloseTo(28.2, 1);
  });
});
