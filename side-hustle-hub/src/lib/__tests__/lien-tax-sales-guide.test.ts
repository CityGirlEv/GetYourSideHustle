import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  LIEN_TAX_SALES_DETAILED_STEPS,
  LIEN_TAX_SALES_NOTES_WORKSHEET,
  LIEN_TAX_SALES_PRICING,
  LIEN_TAX_SALES_REALITY_CHECK,
  LIEN_TAX_SALES_SUPPLIES,
  LIEN_TAX_SALES_TOOLS,
  computeLienTaxSaleDealProfit,
  lienTaxSalesToolsDisclaimer,
} from "../lien-tax-sales-guide";

const GUIDE_ID = "lien-tax-sales";

describe("Guide #052 Court Lien & Tax Sale Properties", () => {
  it("keeps a single #052 id, exact title, Elite, deal-cycle time, and deal-dependent earnings", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("052");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("052");
    const idsFor052 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "052")
      .map(([id]) => id);
    expect(idsFor052).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Court Lien & Tax Sale Properties");
    expect(h.name).not.toMatch(
      /guide upgrade|tax lien guide|elite guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["adult"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.timeReq).toMatch(/8\s*-\s*20 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/deal-dependent/i);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toBe("Real Estate");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing with maximum-bid / deal-analysis framework", () => {
    const intro = LIEN_TAX_SALES_PRICING.intro;
    expect(intro).toMatch(/MAXIMUM-BID SYSTEM/i);
    expect(intro).toMatch(/deal-dependent/i);
    expect(intro).toMatch(/Conservative Exit Value/i);
    expect(intro).toMatch(/If any required input is unknown/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(LIEN_TAX_SALES_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(LIEN_TAX_SALES_TOOLS.some((t) => /irs auction/i.test(t.name))).toBe(true);
    expect(lienTaxSalesToolsDisclaimer()).toMatch(/best bid may be no bid/i);
    expect(LIEN_TAX_SALES_REALITY_CHECK.title).toMatch(/what the sale actually sells/i);
    expect(LIEN_TAX_SALES_NOTES_WORKSHEET).toMatch(/PASS GATES/i);
    expect(LIEN_TAX_SALES_SUPPLIES.items.some((i) => /attorney|title/i.test(i.name))).toBe(true);
  });

  it("includes exactly 11 authored core steps without marketing inject", () => {
    const core = LIEN_TAX_SALES_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose One Jurisdiction & Sale Type",
      "Build the Official Sale Calendar",
      "Register & Verify the Money Rules",
      "Create Hard Pass/Fail Gates",
      "Verify the Exact Parcel",
      "Research Title, Liens & Court Records",
      "Investigate Condition, Occupancy & Possession",
      "Map Redemption, Confirmation & Notice Duties",
      "Calculate the Conservative Maximum Bid",
      "Bid With a Written Stop & Save the Record",
      "Complete the Legal Process & Execute the Exit",
    ]);
    expect(core[0]?.desc).toMatch(/tax lien certificate|tax deed|sheriff/i);
    expect(core[3]?.desc).toMatch(/pass gate/i);
    expect(core[5]?.desc).toMatch(/federal tax lien/i);
    expect(core[6]?.desc).toMatch(/do not trespass/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses deal calculator: $11,500 invested, $13,000 proceeds, $1,500 profit, 13.0% return", () => {
    const example = {
      ltsWinningBid: 8000,
      ltsBuyerPremium: 0,
      ltsTitleLegalNotice: 1500,
      ltsSurvivingTaxesLiens: 500,
      ltsRepairsEnvironmental: 800,
      ltsInsuranceSecurityUtilities: 200,
      ltsFinancingHolding: 300,
      ltsSellingClosing: 200,
      ltsOtherCosts: 0,
      ltsActualProceeds: 13000,
    };
    const helper = computeLienTaxSaleDealProfit(example);
    expect(helper.totalCashInvested).toBe(11500);
    expect(helper.estimatedDealProfit).toBe(1500);
    expect(helper.returnOnCashPercent).toBeCloseTo(13.0, 1);
  });
});
