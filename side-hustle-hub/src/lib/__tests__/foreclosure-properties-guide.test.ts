import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import {
  detailedStepsForGuide,
  guideUsesInvestmentAcquisitionPlaybook,
} from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { seniorLibraryMinTier } from "../age-library-tiers";
import { countFreeGuideLibrary, uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  FORECLOSURE_PROPERTIES_DETAILED_STEPS,
  FORECLOSURE_PROPERTIES_NOTES_WORKSHEET,
  FORECLOSURE_PROPERTIES_REALITY_CHECK,
  computeForeclosureFlip,
  computeForeclosureRental,
} from "../foreclosure-properties-guide";

const GUIDE_ID = "foreclosure-properties";

describe("Guide #098 Purchase Foreclosure Properties", () => {
  it("keeps a single #098 id, exact title, Elite, deal-cycle time, and deal-dependent earnings", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("098");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("098");
    const idsFor098 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "098")
      .map(([id]) => id);
    expect(idsFor098).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Purchase Foreclosure Properties");
    expect(h.name).not.toMatch(
      /guide upgrade|foreclosure guide|foreclosure investing|reo guide|elite guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.timeReq).toMatch(/10\s*-\s*25 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/deal-dependent/i);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Real Estate\s*\/\s*Investing/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
    expect(guideUsesInvestmentAcquisitionPlaybook(GUIDE_ID)).toBe(true);
  });

  it("replaces pricing with deal-analysis / max-offer framework", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.intro).toMatch(/DEAL-DEPENDENT/i);
    expect(kit.suggestedPricing?.intro).toMatch(/MAXIMUM SAFE PURCHASE PRICE/i);
    expect(kit.suggestedPricing?.intro).toMatch(/\$120,000/);
    expect(kit.suggestedPricing?.intro).toMatch(/\$400\/month/);
    expect(kit.suggestedPricing?.intro).toMatch(/not promises of return/i);
    expect(kit.suggestedPricing?.intro).toMatch(/WHOLESALE/);
    expect(kit.tools.some((t) => /beginner safety stack/i.test(t.name))).toBe(true);
    expect(FORECLOSURE_PROPERTIES_REALITY_CHECK.title).toMatch(/low price does not automatically mean a good deal/i);
    expect(FORECLOSURE_PROPERTIES_NOTES_WORKSHEET).toMatch(/MY MAXIMUM PRICE/i);
    expect(FORECLOSURE_PROPERTIES_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps without GYSH marketing inject", () => {
    const core = FORECLOSURE_PROPERTIES_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/investment strategy & buy box/i);
    expect(core[2]?.title).toMatch(/source foreclosure/i);
    expect(core[7]?.title).toMatch(/maximum offer & walk-away/i);
    expect(core[8]?.desc).toMatch(/independently verify wiring/i);
    expect(core[9]?.desc).toMatch(/legal right to possession/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your first sale/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /^ask for a short review$/i.test(t))).toHaveLength(0);
  });

  it("uses Foreclosure Deal Analyzer: $120k max offer and $400 rental cash flow", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Purchase Foreclosure Properties");
    expect(profile.title).toMatch(/foreclosure deal analyzer/i);

    const flip = computeForeclosureFlip({
      conservativeArv: 250000,
      repairs: 45000,
      closingTitleLegal: 8000,
      financingCosts: 12000,
      sellingCosts: 20000,
      repairContingency: 10000,
      desiredProfit: 35000,
    });
    expect(flip.maxPurchasePrice).toBe(120000);

    const rental = computeForeclosureRental({
      monthlyRent: 2000,
      otherOperating: 700,
      debtService: 900,
    });
    expect(rental.monthlyCashFlow).toBe(400);

    const result = computeGuideCalc(
      "service",
      {
        conservativeArv: 250000,
        purchasePrice: 120000,
        closingTitleLegal: 8000,
        repairs: 45000,
        repairContingency: 10000,
        financingCosts: 12000,
        sellingCosts: 20000,
        desiredProfit: 35000,
        monthlyRent: 2000,
        otherOperating: 700,
        debtService: 900,
      },
      [],
    );
    expect(result.net).toBe(35000);
    expect(result.metrics?.maxBuyPrice).toBe(120000);
    expect(result.metrics?.monthlyCashFlow).toBe(400);
    expect(result.notes.join(" ")).toMatch(/not promises of return/i);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Purchase Foreclosure Properties");
    expect(pdf.pricing?.some((p) => /\$120,000|deal-dependent|max/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /buy box/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /walk-away/i.test(s.title))).toBe(true);
  });
});
