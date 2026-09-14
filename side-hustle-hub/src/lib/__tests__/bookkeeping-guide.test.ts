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
  BOOKKEEPING_DETAILED_STEPS,
  BOOKKEEPING_NOTES_WORKSHEET,
  BOOKKEEPING_REALITY_CHECK,
  computeBookkeepingProfit,
} from "../bookkeeping-guide";

const GUIDE_ID = "bookkeeping";

describe("Guide #039 Bookkeeping & Admin Support", () => {
  it("keeps a single #039 id, exact title, Elite membership, 5–15 hrs, and $25–$60/hour", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("039");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("039");
    const idsFor039 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "039")
      .map(([id]) => id);
    expect(idsFor039).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Bookkeeping & Admin Support");
    expect(h.name).not.toMatch(/guide upgrade|bookkeeping guide|admin support guide|elite guide|member guide/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.audiences).not.toContain("junior");
    expect(h.timeReq).toMatch(/5\s*-\s*15 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$25/);
    expect(h.potentialIncome).toMatch(/\$60/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Business Services\s*\/\s*Bookkeeping\s*\/\s*Administration/i);
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before starting|terms/i.test(p.label))).toBe(true);
    expect(kit.suggestedPricing?.items.some((i) => /\$25|\$35|\$45|\$60/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$25 – \$60/i);
    expect(kit.supplies?.items.some((i) => /computer|spreadsheet|file/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /quickbooks|sheets|beginner tool stack/i.test(t.name))).toBe(true);
    expect(BOOKKEEPING_REALITY_CHECK.title).toMatch(/bookkeeping and professional accounting/i);
    expect(BOOKKEEPING_NOTES_WORKSHEET).toMatch(/MY BOOKKEEPING & ADMIN SERVICE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = BOOKKEEPING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/choose your service lane/i);
    expect(core[0]?.desc).toMatch(/I DO NOT OFFER/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/intake/i);
    expect(core[7]?.desc).toMatch(/invoice/i);
    expect(core[8]?.desc).toMatch(/calendar/i);
    expect(core[9]?.title).toMatch(/reconcile/i);
    expect(core[10]?.title).toMatch(/recurring/i);

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

  it("uses Bookkeeping & Admin Support Profit Calculator", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Bookkeeping & Admin Support");
    expect(profile.title).toMatch(/bookkeeping & admin support profit calculator/i);
    expect(profile.disclaimerExtra).toMatch(/billable hours/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 8,
        avgTicket: 35,
        monthlyRetainerRevenue: 0,
        nonBillableHoursPerWeek: 2,
      },
      [
        { id: "software", label: "Software", amount: 10 },
        { id: "insurance", label: "Insurance", amount: 5 },
        { id: "ads", label: "Advertising", amount: 5 },
        { id: "transport", label: "Travel", amount: 5 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(280);
    expect(result.expenses).toBe(25);
    expect(result.net).toBe(255);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);
    expect(result.metrics?.netPerHour).toBeCloseTo(25.5, 5);

    const helper = computeBookkeepingProfit({
      hourlyRate: 35,
      billableHoursPerWeek: 8,
      monthlyRetainerRevenue: 0,
      softwareCost: 10,
      insuranceBusinessCost: 5,
      advertising: 5,
      travel: 5,
      otherExpenses: 0,
      nonBillableAdminHoursPerWeek: 2,
    });
    expect(helper.weeklyRevenue).toBe(280);
    expect(helper.weeklyProfit).toBe(255);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(1104.15, 1);
    expect(helper.effectiveProfitPerWorkingHour).toBeCloseTo(25.5, 5);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Bookkeeping & Admin Support");
    expect(pdf.pricing?.some((p) => /\$25|\$60/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /choose your service lane/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /intake/i.test(s.title))).toBe(true);
  });
});
