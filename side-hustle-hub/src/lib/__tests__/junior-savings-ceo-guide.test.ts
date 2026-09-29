import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide, SAVINGS_FOUNDATION_GUIDE_IDS } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { kidsGuideById, kidsGuideToLaunchGuideData } from "../kids-guides";
import { kidsGuideMinTier } from "../guide-access";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  guideCalcModeForId,
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  JUNIOR_SAVINGS_CEO_DETAILED_STEPS,
  JUNIOR_SAVINGS_CEO_NOTES_WORKSHEET,
  JUNIOR_SAVINGS_CEO_PRICING,
  JUNIOR_SAVINGS_CEO_REALITY_CHECK,
  computeJuniorSavingsGoal,
} from "../junior-savings-ceo-guide";

const GUIDE_ID = "junior-savings-ceo";

describe("Guide #019 Savings Goals for Future CEOs", () => {
  it("keeps a single #019 id, exact title, Free, 2 weeks, and Unique Unique Free at 20", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("019");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("019");
    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Savings Goals for Future CEOs");
    expect(g.title).not.toMatch(/guide upgrade/i);
    expect(g.free).toBe(true);
    expect(g.audience).toBe("junior");
    expect(kidsGuideToLaunchGuideData(g).timeframe).toBe("2 weeks");
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("free");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("free");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect((SAVINGS_FOUNDATION_GUIDE_IDS as readonly string[]).includes(GUIDE_ID)).toBe(true);
  });

  it("uses earning & savings plan — no business marketing or hourly pricing", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/earning & savings/i);
    expect(String(kit.suggestedPricing?.intro ?? JUNIOR_SAVINGS_CEO_PRICING.intro)).toMatch(
      /weekly savings goal/i,
    );
    expect(kit.supplies?.items.some((i) => /piggy bank/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /piggy bank/i.test(t.name))).toBe(true);
    expect(JUNIOR_SAVINGS_CEO_REALITY_CHECK.title).toMatch(/not a business/i);
    expect(JUNIOR_SAVINGS_CEO_NOTES_WORKSHEET).toMatch(/my savings goal/i);
    expect(guideCalcModeForId(GUIDE_ID)).toBe("savings");
  });

  it("includes exactly 11 authored core steps and no marketing stages", () => {
    const core = JUNIOR_SAVINGS_CEO_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Pick What You’re Saving For",
      "Find or Estimate the Total Cost",
      "Pick a Target Date or Number of Weeks",
      "Calculate Your Weekly Savings Goal",
      "List Safe Ways You Could Earn Money",
      "Pick One or Two Earning Ideas to Try",
      "Decide How Much of Each Earning You Will Save",
      "Add Every Savings Amount to the Piggy Bank",
      "Check Your Progress at the End of Each Week",
      "Adjust the Goal or Timeline if Needed",
      "Celebrate the Milestone and Choose Your Next Goal",
    ]);
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
    expect(titles.some((t) => /research competitors/i.test(t))).toBe(false);
  });

  it("savings calculator: $120 goal, $0 saved, 12 weeks, $5/task, 2 tasks, 100% save = ON TRACK", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Savings Goals for Future CEOs");
    expect(profile.title).toMatch(/savings goal calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "juniorSavingsGoalCost")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const helper = computeJuniorSavingsGoal({
      juniorSavingsGoalCost: 120,
      amountAlreadySaved: 0,
      weeksRemaining: 12,
      averageEarningsPerTask: 5,
      tasksPerWeek: 2,
      savingsPortionPercent: 100,
    });
    expect(helper.stillNeeded).toBe(120);
    expect(helper.weeklySavingsGoal).toBe(10);
    expect(helper.estimatedWeeklyEarnings).toBe(10);
    expect(helper.estimatedWeeklySavings).toBe(10);
    expect(helper.statusLabel).toBe("ON TRACK");

    const result = computeGuideCalc(
      profile.mode,
      {
        juniorSavingsGoalCost: 120,
        amountAlreadySaved: 0,
        weeksRemaining: 12,
        averageEarningsPerTask: 5,
        tasksPerWeek: 2,
        savingsPortionPercent: 100,
      },
      [],
    );
    expect(result.metrics?.weeklySavingsGoal).toBe(10);
    expect(result.metrics?.savingsStatusLabel).toBe("ON TRACK");
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Savings Goals for Future CEOs");
    expect(pdf.steps.some((s) => /pick what you.?re saving for/i.test(s.title))).toBe(true);
  });
});
