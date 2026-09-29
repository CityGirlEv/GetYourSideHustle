import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  CLOSET_CLEANOUT_LISTING_DETAILED_STEPS,
  CLOSET_CLEANOUT_LISTING_NOTES_WORKSHEET,
  CLOSET_CLEANOUT_LISTING_REALITY_CHECK,
  computeClosetCleanoutListingProfit,
} from "../closet-cleanout-listing-guide";

const GUIDE_ID = "closet-cleanout-listing";

describe("Guide #047 Closet Clean-Out Listing Helper", () => {
  it("keeps a single #047 id, exact title, Starter membership, 3–10 hrs, and $15–$50/project", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("047");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("047");
    const idsFor047 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "047")
      .map(([id]) => id);
    expect(idsFor047).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Closet Clean-Out Listing Helper");
    expect(h.name).not.toMatch(
      /guide upgrade|closet listing guide|closet cleanout guide|starter guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Resale Support\s*\/\s*Organization/i);
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before starting|minors/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.items.some((i) => /\$15|\$25|\$40|\$50/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$15 – \$50/i);
    expect(kit.suggestedPricing?.intro).toMatch(/not automatically your business revenue/i);
    expect(kit.supplies?.items.some((i) => /phone|tape|hanger|donation/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /camera|sheets|beginner tool stack/i.test(t.name))).toBe(true);
    expect(CLOSET_CLEANOUT_LISTING_REALITY_CHECK.title).toMatch(
      /the client decides what gets sold or donated/i,
    );
    expect(CLOSET_CLEANOUT_LISTING_NOTES_WORKSHEET).toMatch(/MY CLOSET LISTING SERVICE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = CLOSET_CLEANOUT_LISTING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/define your listing-helper service/i);
    expect(core[0]?.desc).toMatch(/I DO NOT OFFER/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/sort the approved items/i);
    expect(core[6]?.title).toMatch(/photograph/i);
    expect(core[7]?.desc).toMatch(/measurements/i);
    expect(core[8]?.desc).toMatch(/client-approved list price/i);
    expect(core[9]?.title).toMatch(/list or hand off/i);
    expect(core[10]?.title).toMatch(/track status/i);

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

  it("uses Closet Clean-Out Listing Helper Profit Calculator", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Closet Clean-Out Listing Helper");
    expect(profile.title).toMatch(/closet clean-out listing helper profit calculator/i);
    expect(profile.blurb).toMatch(/merchandise proceeds are not your service revenue/i);
    expect(profile.disclaimerExtra).toMatch(/\$80 is not automatically your revenue/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 3,
        avgTicket: 35,
        extraEventPay: 15,
        hoursPerShoot: 2,
      },
      [
        { id: "transport", label: "Travel", amount: 8 },
        { id: "supplies", label: "Supplies", amount: 5 },
        { id: "ads", label: "Advertising", amount: 5 },
        { id: "other", label: "Other", amount: 2 },
      ],
    );
    expect(result.revenue).toBe(120);
    expect(result.expenses).toBe(20);
    expect(result.net).toBe(100);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);
    expect(result.metrics?.netPerHour).toBeCloseTo(16.67, 2);

    const helper = computeClosetCleanoutListingProfit({
      averageProjectFee: 35,
      projectsPerWeek: 3,
      addOnRevenue: 15,
      travel: 8,
      supplies: 5,
      advertising: 5,
      otherExpenses: 2,
      averageHoursPerProject: 2,
    });
    expect(helper.weeklyRevenue).toBe(120);
    expect(helper.weeklyProfit).toBe(100);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(433, 0);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(16.67, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Closet Clean-Out Listing Helper");
    expect(pdf.pricing?.some((p) => /\$15|\$50/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /define your listing-helper service/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /sort the approved items/i.test(s.title))).toBe(true);
  });
});
