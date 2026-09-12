import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  BABYSITTING_DETAILED_STEPS,
  BABYSITTING_NOTES_WORKSHEET,
  BABYSITTING_REALITY_CHECK,
  computeBabysittingProfit,
} from "../babysitting-guide";

const GUIDE_ID = "babysitting";

describe("Guide #002 Babysitting Service", () => {
  it("keeps a single #002 id, exact title, Free membership, 4–12 hrs, and $12–$25/hour", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("002");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("002");
    const idsFor002 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "002")
      .map(([id]) => id);
    expect(idsFor002).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Babysitting Service");
    expect(h.name).not.toMatch(/guide upgrade|elite guide|member guide/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult"]));
    expect(h.timeReq).toMatch(/4\s*-\s*12 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$12/);
    expect(h.potentialIncome).toMatch(/\$25/);
    expect(h.minTier).toBe("free");
    expect(h.category).toMatch(/Kids\s*\/\s*Family/i);
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before accepting/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.items.some((i) => /\$12|\$15|\$18|\$25/i.test(i.price))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.intro).toMatch(/\$12–\$25/i);
    expect(kit.supplies?.items.some((i) => /phone|charger|emergency/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /calendar|phone|beginner tool stack/i.test(t.name))).toBe(true);
    expect(BABYSITTING_REALITY_CHECK.title).toMatch(/parents set the rules/i);
    expect(BABYSITTING_NOTES_WORKSHEET).toMatch(/MY BABYSITTING PLANNER/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = BABYSITTING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/decide what you can handle/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[6]?.title).toMatch(/safety & house instructions/i);
    expect(core[10]?.title).toMatch(/get rebooked/i);

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
    expect(core[2]?.desc).toMatch(/trusted|parent-approved|Junior\/Teen/i);
  });

  it("uses Babysitting Earnings Calculator with hourly × hours × jobs", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Babysitting Service");
    expect(profile.title).toMatch(/babysitting earnings calculator/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 2,
        avgTicket: 15,
        hoursPerJob: 4,
        extraEventPay: 0,
      },
      [{ id: "other", label: "Weekly expenses", amount: 10 }],
    );
    expect(result.revenue).toBe(120);
    expect(result.expenses).toBe(10);
    expect(result.net).toBe(110);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const helper = computeBabysittingProfit({
      hourlyRate: 15,
      hoursPerJob: 4,
      jobsPerWeek: 2,
      weeklyExpenses: 10,
    });
    expect(helper.jobPay).toBe(60);
    expect(helper.weeklyRevenue).toBe(120);
    expect(helper.weeklyProfit).toBe(110);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(476.3, 1);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Babysitting Service");
    expect(pdf.pricing?.some((p) => /\$12|\$25/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /decide what you can handle/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /safety & house instructions/i.test(s.title))).toBe(true);
  });
});
