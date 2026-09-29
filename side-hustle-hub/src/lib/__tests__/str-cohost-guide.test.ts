import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import {
  STR_COHOST_DETAILED_STEPS,
  STR_COHOST_PRICING,
  computeStrCohostProfit,
} from "../str-cohost-guide";

const GUIDE_ID = "str-cohost";

describe("Guide #029 Airbnb Arbitrage Hosting", () => {
  it("keeps a single #029 id, exact title, Elite, 10–25 hrs, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("029");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("029");
    const idsFor029 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "029")
      .map(([id]) => id);
    expect(idsFor029).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Airbnb Arbitrage Hosting");
    expect(h.name).not.toMatch(/guide upgrade|arbitrage guide|elite guide|member guide/i);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(h.timeReq).toMatch(/10\s*-\s*25 hrs\/week/i);
    expect(h.category).toMatch(/Short-Term Rentals\s*\/\s*Hospitality\s*\/\s*Real Estate Business/i);
    expect(h.potentialIncome).toMatch(/MARKET-DEPENDENT/i);
    expect(h.potentialIncome).not.toMatch(/\$\d[\d,]*\s*[–-]\s*\$\d/);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(FREE_WIZARD_HUSTLE_IDS).toHaveLength(20);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing with unit economics and ships STR supplies/tools", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/earnings & unit economics/i);
    expect(kit.suggestedPricing?.intro).toMatch(/MARKET-DEPENDENT/i);
    expect(kit.suggestedPricing?.intro).toMatch(/do NOT count refundable guest deposits/i);
    expect(kit.suggestedPricing?.intro).toMatch(/\$2,250/);
    expect(kit.suggestedPricing?.items.some((i) => /market-dependent/i.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => /written STR/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.prerequisites.some((p) => /written landlord/i.test(`${p.label} ${p.detail}`))).toBe(
      true,
    );
    expect(STR_COHOST_PRICING.intro).toMatch(/≈ 20 booked nights/i);
  });

  it("includes exactly 11 authored core steps and does not inject generic marketing", () => {
    const core = STR_COHOST_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/choose a market & research legality/i);
    expect(core[1]?.title).toMatch(/research demand & seasonality/i);
    expect(core[2]?.title).toMatch(/build the unit-economics model/i);
    expect(core[3]?.title).toMatch(/find str-friendly property owners/i);
    expect(core[4]?.title).toMatch(/get written permission/i);
    expect(core[5]?.title).toMatch(/licenses, insurance/i);
    expect(core[6]?.title).toMatch(/furnish & create the guest experience/i);
    expect(core[7]?.title).toMatch(/create the listing & launch materials/i);
    expect(core[8]?.title).toMatch(/set nightly pricing & availability/i);
    expect(core[9]?.title).toMatch(/operate guests, cleaning/i);
    expect(core[10]?.title).toMatch(/review profit & decide whether to scale/i);
    expect(core[7]?.desc).toMatch(/listing optimization/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.some((t) => /choose your marketing channels/i.test(t))).toBe(false);
    expect(titles.some((t) => /make your marketing materials/i.test(t))).toBe(false);
    expect(titles.some((t) => /carry out your marketing plan/i.test(t))).toBe(false);
  });

  it("uses unit-economics calculator: 20 nights × $150 − $2,250 = $750, occupancy ≈ 66.7%", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Airbnb Arbitrage Hosting");
    expect(profile.title).toMatch(/unit economics calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "bookedNights")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "nightlyRate")).toBe(false);

    const calc = computeStrCohostProfit({
      availableNights: 30,
      bookedNights: 20,
      avgNightlyRevenue: 150,
      rent: 1800,
      utilities: 300,
      insurance: 150,
    });
    expect(calc.grossBookingRevenue).toBe(3000);
    expect(calc.monthlyExpenses).toBe(2250);
    expect(calc.operatingProfit).toBe(750);
    expect(calc.occupancyPercent).toBeCloseTo(66.666, 2);

    const result = computeGuideCalc(
      profile.mode,
      {
        availableNights: 30,
        bookedNights: 20,
        avgNightlyRevenue: 150,
        otherHostRevenue: 0,
        initialSetupInvestment: 7500,
      },
      profile.budget.map((line) =>
        line.id === "rent"
          ? { ...line, amount: 1800 }
          : line.id === "utilities"
            ? { ...line, amount: 300 }
            : line.id === "insurance"
              ? { ...line, amount: 150 }
              : line,
      ),
    );
    expect(result.revenue).toBe(3000);
    expect(result.expenses).toBe(2250);
    expect(result.net).toBe(750);
    expect(result.metrics?.occupancyPercent).toBeCloseTo(66.666, 2);
    expect(result.metrics?.monthsToRecoverSetup).toBe(10);
  });
});
