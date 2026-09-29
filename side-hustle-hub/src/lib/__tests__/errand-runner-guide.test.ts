import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  ERRAND_RUNNER_DETAILED_STEPS,
  ERRAND_RUNNER_NOTES_WORKSHEET,
  ERRAND_RUNNER_REALITY_CHECK,
  computeErrandRunnerProfit,
} from "../errand-runner-guide";

const GUIDE_ID = "errand-runner";

describe("Guide #005 Errand Runner", () => {
  it("keeps a single #005 id, exact title, Free library access, 2–8 hrs, and $10–$40/job", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("005");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("005");
    const idsFor005 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "005")
      .map(([id]) => id);
    expect(idsFor005).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Errand Runner");
    expect(h.name).not.toMatch(/guide upgrade|errand guide|free guide|member guide/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("free");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("free");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(h.category).toMatch(/Local Services\s*\/\s*Errands/i);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before accepting|minors/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.items.some((i) => /\$10|\$15|\$25|\$40/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$10 – \$40/i);
    expect(kit.suggestedPricing?.intro).toMatch(/merchandise/i);
    expect(kit.supplies?.items.some((i) => /phone|receipt|bag/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /maps|sheets|beginner tool stack|referrals|flyer/i.test(t.name))).toBe(true);
    expect(ERRAND_RUNNER_REALITY_CHECK.title).toMatch(/know what you are picking up/i);
    expect(ERRAND_RUNNER_NOTES_WORKSHEET).toMatch(/MY ERRAND RUNNER PLAN/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = ERRAND_RUNNER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/choose the errands you will offer/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/exact errand details/i);
    expect(core[6]?.title).toMatch(/plan the route/i);
    expect(core[7]?.desc).toMatch(/pharmacy/i);
    expect(core[9]?.desc).toMatch(/reimbursement|revenue/i);
    expect(core[10]?.title).toMatch(/recurring routes/i);

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

  it("uses Errand Runner Profit Calculator and excludes merchandise from revenue", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Errand Runner");
    expect(profile.title).toMatch(/errand runner profit calculator/i);
    expect(profile.disclaimerExtra).toMatch(/merchandise is not earned revenue/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 5,
        avgTicket: 20,
        extraEventPay: 10,
        hoursPerShoot: 1,
      },
      [
        { id: "transport", label: "Fuel / travel", amount: 15 },
        { id: "tolls", label: "Parking / tolls", amount: 5 },
        { id: "supplies", label: "Business supplies", amount: 5 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(110);
    expect(result.expenses).toBe(25);
    expect(result.net).toBe(85);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const helper = computeErrandRunnerProfit({
      averageServiceFee: 20,
      jobsPerWeek: 5,
      tipsExtraPay: 10,
      fuelTravel: 15,
      parkingTolls: 5,
      businessSupplies: 5,
      otherExpenses: 0,
      hoursPerJobIncludingTravel: 1,
    });
    expect(helper.weeklyServiceRevenue).toBe(110);
    expect(helper.weeklyProfit).toBe(85);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(368.05, 1);
    expect(helper.effectiveProfitPerHour).toBe(17);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Errand Runner");
    expect(pdf.pricing?.some((p) => /\$10|\$40/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /choose the errands you will offer/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /plan the route/i.test(s.title))).toBe(true);
  });
});
