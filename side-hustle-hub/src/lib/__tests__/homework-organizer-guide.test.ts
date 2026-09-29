import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { kidsLibraryMinTier, juniorLibraryMinTier } from "../age-library-tiers";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  HOMEWORK_ORGANIZER_DETAILED_STEPS,
  HOMEWORK_ORGANIZER_NOTES_WORKSHEET,
  HOMEWORK_ORGANIZER_REALITY_CHECK,
  computeHomeworkOrganizerProfit,
} from "../homework-organizer-guide";

const GUIDE_ID = "homework-organizer";

describe("Guide #076 Homework Organizer", () => {
  it("keeps a single #076 id, exact title, Starter membership, 3–10 hrs, and $15–$50/project", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("076");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("076");
    const idsFor076 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "076")
      .map(([id]) => id);
    expect(idsFor076).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Homework Organizer");
    expect(h.name).not.toMatch(/guide upgrade|homework guide|student organizer|starter guide|member guide/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior"]));
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Student Services\s*\/\s*Organization/i);
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|privacy|helpful/i.test(p.label))).toBe(true);
    expect(kit.suggestedPricing?.items.some((i) => /\$15|\$20|\$35|\$50/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$15 – \$50/i);
    expect(kit.supplies?.items.some((i) => /planner|folder|checklist/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /calendar|docs|beginner tool stack/i.test(t.name))).toBe(true);
    expect(HOMEWORK_ORGANIZER_REALITY_CHECK.title).toMatch(/organize/i);
    expect(HOMEWORK_ORGANIZER_REALITY_CHECK.title).toMatch(/homework/i);
    expect(HOMEWORK_ORGANIZER_NOTES_WORKSHEET).toMatch(/MY HOMEWORK ORGANIZER PLAN/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = HOMEWORK_ORGANIZER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/define what you help with/i);
    expect(core[0]?.desc).toMatch(/I DO NOT DO/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[6]?.title).toMatch(/subject folder/i);
    expect(core[7]?.title).toMatch(/planner & due-date/i);
    expect(core[9]?.title).toMatch(/10-minute reset/i);
    expect(core[10]?.title).toMatch(/follow up & get rebooked/i);

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

  it("uses Homework Organizer Profit Calculator with recurring check-in", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Homework Organizer");
    expect(profile.title).toMatch(/homework organizer profit calculator/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 3,
        avgTicket: 25,
        recurringClientRevenue: 20,
        hoursPerShoot: 1,
      },
      [
        { id: "supplies", label: "Printing / supplies", amount: 10 },
        { id: "transport", label: "Travel", amount: 0 },
        { id: "ads", label: "Advertising", amount: 0 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(95);
    expect(result.expenses).toBe(10);
    expect(result.net).toBe(85);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const helper = computeHomeworkOrganizerProfit({
      averageProjectPrice: 25,
      projectsPerWeek: 3,
      recurringCheckInRevenue: 20,
      printingSupplies: 10,
      travel: 0,
      advertising: 0,
      otherExpenses: 0,
      averageHoursPerProject: 1,
    });
    expect(helper.weeklyRevenue).toBe(95);
    expect(helper.weeklyProfit).toBe(85);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(368.05, 1);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(28.333, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Homework Organizer");
    expect(pdf.pricing?.some((p) => /\$15|\$50/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /define what you help with/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /10-minute reset/i.test(s.title))).toBe(true);
  });
});
