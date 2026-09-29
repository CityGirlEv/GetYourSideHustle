import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { kidsLibraryMinTier } from "../age-library-tiers";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { formatPricingLine } from "../guide-suggested-pricing";
import {
  MOTHERS_HELPER_DETAILED_STEPS,
  MOTHERS_HELPER_NOTES_WORKSHEET,
  MOTHERS_HELPER_PRICING,
  MOTHERS_HELPER_REALITY_CHECK,
  computeMothersHelperProfit,
} from "../mothers-helper-guide";

const GUIDE_ID = "mothers-helper";

describe("Guide #001 Babysitter's Helper / Mother's Helper", () => {
  it("keeps a single #001 id, exact title, Free membership, and 2–8 hrs + $10–$40/job", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("001");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("001");
    const idsFor001 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "001")
      .map(([id]) => id);
    expect(idsFor001).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Babysitter's Helper / Mother's Helper");
    expect(h.name).not.toMatch(/guide upgrade|junior guide|member guide/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["kids", "junior"]));
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.minTier).toBe("free");
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("free");
    expect(h.category).toMatch(/Kids\s*\/\s*Family/i);
    expect(h.description).toMatch(/STILL HOME|parent present|NOT solo babysitting/i);
    expect(hustleById("babysitting")?.name).toMatch(/Babysitting/i);
    expect(hustleById("babysitting")?.id).not.toBe(GUIDE_ID);
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(
      kit.prerequisites.some((p) => /parent|present|need|overview/i.test(p.label)),
    ).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/MOTHER'S HELPER STARTER EXAMPLES/i);
    expect(kit.suggestedPricing?.intro).toMatch(/\$10–\$40\/job \(examples\)/i);
    expect(kit.suggestedPricing?.raiseTip).toMatch(
      /Always agree on Job \+ Time \+ Tasks \+ Price BEFORE starting/i,
    );
    expect(kit.suggestedPricing?.items.map(formatPricingLine)).toEqual([
      "Quick Help: $10–$15/job — 30–60 minutes of simple parent-present help",
      "Standard Help: $15–$25/job — 1–2 hours of play, toys, activities, or simple kid-related help",
      "Longer Helper Session: $25–$40/job — longer parent-present session with multiple approved tasks",
    ]);
    expect(MOTHERS_HELPER_PRICING.items.every((i) => i.label)).toBe(true);
    expect(kit.supplies?.items.some((i) => /book|toy|craft|notebook|snack/i.test(i.name))).toBe(
      true,
    );
    expect(kit.tools.some((t) => /calendar|notes|parent/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(MOTHERS_HELPER_REALITY_CHECK.title).toMatch(/PARENT STAYS HOME/i);
    expect(MOTHERS_HELPER_NOTES_WORKSHEET).toMatch(/MOTHER'S HELPER PLAN/i);
    expect(MOTHERS_HELPER_NOTES_WORKSHEET).toMatch(/Parent Will Remain Present/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = MOTHERS_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/decide how you can help/i);
    expect(core[1]?.title).toMatch(/set your starter price/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/talk to the parent/i);
    expect(core[10]?.title).toMatch(/get rebooked/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(core[0]?.desc).toMatch(/Do NOT advertise yourself as providing solo babysitting/i);
    expect(core[2]?.desc).toMatch(/trusted|parent-approved|Family friends/i);
    expect(core[5]?.desc).toMatch(/Will you be home|remain present/i);

    const kitSteps = guideKitForId(GUIDE_ID).steps ?? [];
    expect(kitSteps.some((s) => /decide how you can help/i.test(s.title))).toBe(true);
    expect(kitSteps.some((s) => /get rebooked/i.test(s.title))).toBe(true);
  });

  it("uses Mother's Helper Earnings Calculator with tips + total weekly hours", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Babysitter's Helper / Mother's Helper");
    expect(profile.title).toMatch(/mother's helper earnings calculator/i);
    expect(profile.defaults).toMatchObject({
      extraEventPay: 0,
      hoursWorkedPerWeek: 0,
    });

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 3,
        avgTicket: 20,
        extraEventPay: 0,
        hoursWorkedPerWeek: 3,
      },
      [{ id: "other", label: "Weekly expenses", amount: 5 }],
    );
    expect(result.revenue).toBe(60);
    expect(result.expenses).toBe(5);
    expect(result.net).toBe(55);
    expect(result.metrics?.netPerHour).toBeCloseTo(55 / 3, 5);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);
    expect(result.notes.some((n) => /jobs\/week|tips\/extra/i.test(n))).toBe(true);

    const helper = computeMothersHelperProfit({
      averageJobPrice: 20,
      jobsPerWeek: 3,
      tipsExtraPay: 0,
      weeklyExpenses: 5,
      hoursWorkedPerWeek: 3,
    });
    expect(helper.weeklyRevenue).toBe(60);
    expect(helper.weeklyProfit).toBe(55);
    expect(helper.effectiveHourlyRate).toBeCloseTo(18.3333, 3);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(238.15, 1);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Babysitter's Helper / Mother's Helper");
    expect(pdf.prerequisites.some((p) => /parent|present|helper/i.test(p))).toBe(true);
    expect(pdf.pricing?.some((p) => /\$10|\$15|\$25|\$40/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /decide how you can help/i.test(s.title))).toBe(true);
    expect(pdf.steps.some((s) => /get rebooked/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /be a great helper/i.test(s.title))).toBe(true);
  });
});
