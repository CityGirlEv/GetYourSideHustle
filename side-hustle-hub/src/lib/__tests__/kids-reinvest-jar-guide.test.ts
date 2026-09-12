import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide, guideUsesSavingsFoundation } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { kidsGuideById } from "../kids-guides";
import { kidsGuideMinTier } from "../guide-access";
import {
  guideCalcModeForId,
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  KIDS_REINVEST_JAR_DETAILED_STEPS,
  KIDS_REINVEST_JAR_NOTES_WORKSHEET,
  KIDS_REINVEST_JAR_REALITY_CHECK,
  computeKidsMoneySplit,
} from "../kids-reinvest-jar-guide";

const GUIDE_ID = "kids-reinvest-jar";

describe("Guide #074 Grow Your Hustle: Put Some Earnings Back", () => {
  it("keeps a single #074 id, Starter tier, and title", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("074");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("074");
    const idsFor074 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "074")
      .map(([id]) => id);
    expect(idsFor074).toEqual([GUIDE_ID]);

    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Grow Your Hustle: Put Some Earnings Back");
    expect(g.free).toBe(false);
    expect(g.audience).toBe("kids");
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(guideUsesSavingsFoundation(GUIDE_ID)).toBe(true);
  });

  it("ships Fun / Save / Grow tabs: prereqs, splitter pricing, supplies, tools, notes", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.length).toBeGreaterThan(0);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/money split/i);
    expect(kit.suggestedPricing?.items.some((i) => /100%/i.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => /fun/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /grow/i.test(i.name))).toBe(true);
    expect(kit.tools.length).toBeGreaterThan(0);
    expect(KIDS_REINVEST_JAR_REALITY_CHECK.title).toMatch(/coin a job/i);
    expect(KIDS_REINVEST_JAR_NOTES_WORKSHEET).toMatch(/GROW-YOUR-HUSTLE PLAN/i);
    expect(KIDS_REINVEST_JAR_NOTES_WORKSHEET).toMatch(/FUN/i);
  });

  it("includes exactly 11 authored core steps without GYSH marketing inject", () => {
    const core = KIDS_REINVEST_JAR_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/track what you earn/i);
    expect(core[3]?.title).toMatch(/three jars/i);
    expect(core[10]?.title).toMatch(/do it again/i);

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
    expect(titles.filter((t) => /pick a name for your side hustle/i.test(t))).toHaveLength(0);

    const kitSteps = guideKitForId(GUIDE_ID).steps ?? [];
    expect(kitSteps.some((s) => /three jars/i.test(s.title))).toBe(true);
    expect(kitSteps.some((s) => /put some earnings back/i.test(s.title))).toBe(true);
  });

  it("uses the Fun / Save / Grow money splitter (expenses before split)", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("split");
    const profile = guideCalcProfileForId(GUIDE_ID, "Grow Your Hustle: Put Some Earnings Back");
    expect(profile.title).toMatch(/money splitter/i);
    expect(profile.disclaimerExtra).toMatch(/100%/i);

    const result = computeGuideCalc(
      "split",
      {
        moneyCollected: 9,
        hustleExpenses: 0,
        savePercent: 40,
        enjoyPercent: 30,
        growPercent: 30,
      },
      [],
    );
    expect(result.metrics?.moneyAvailable).toBe(9);
    expect(result.metrics?.saveAmount).toBeCloseTo(3.6, 5);
    expect(result.metrics?.enjoyAmount).toBeCloseTo(2.7, 5);
    expect(result.metrics?.growAmount).toBeCloseTo(2.7, 5);
    expect(result.metrics?.percentagesValid).toBe(true);

    const invalid = computeGuideCalc(
      "split",
      { moneyCollected: 9, hustleExpenses: 0, savePercent: 40, enjoyPercent: 30, growPercent: 20 },
      [],
    );
    expect(invalid.metrics?.percentagesValid).toBe(false);
    expect(invalid.metrics?.saveAmount).toBe(0);

    const split = computeKidsMoneySplit({
      moneyCollected: 9,
      hustleExpenses: 0,
      funPercent: 30,
      savePercent: 40,
      growPercent: 30,
    });
    expect(split.percentagesValid).toBe(true);
    expect(split.funAmount).toBeCloseTo(2.7, 5);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Grow Your Hustle: Put Some Earnings Back");
    expect(pdf.prerequisites.length).toBeGreaterThan(0);
    expect(pdf.steps.some((s) => /three jars/i.test(s.title))).toBe(true);
    expect(pdf.steps.some((s) => /put some earnings back/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /three jars/i.test(s.title))).toBe(true);
  });
});
