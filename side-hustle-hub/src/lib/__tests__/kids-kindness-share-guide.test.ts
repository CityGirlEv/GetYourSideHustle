import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide, guideUsesGiveBackFoundation } from "../guide-detailed-steps";
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
  KIDS_KINDNESS_SHARE_DETAILED_STEPS,
  KIDS_KINDNESS_SHARE_NOTES_WORKSHEET,
  KIDS_KINDNESS_SHARE_REALITY_CHECK,
  computeKidsKindnessCounter,
} from "../kids-kindness-share-guide";

const GUIDE_ID = "kids-kindness-share";

describe("Guide #008 Give Back: Share a Skill for Free", () => {
  it("keeps a single #008 id, Free tier, and title", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("008");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("008");
    const idsFor008 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "008")
      .map(([id]) => id);
    expect(idsFor008).toEqual([GUIDE_ID]);

    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Give Back: Share a Skill for Free");
    expect(g.free).toBe(true);
    expect(g.audience).toBe("kids");
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("free");
    expect(guideUsesGiveBackFoundation(GUIDE_ID)).toBe(true);
  });

  it("is distinct from #009 teach-what-you-know", () => {
    expect(GUIDE_ID).not.toBe("junior-give-back-teach");
    expect(formatGuideNumber("junior-give-back-teach")).toBe("009");
    expect(kidsGuideById(GUIDE_ID)?.title).not.toBe("Give Back: Teach What You Know");
  });

  it("ships all prep tabs: prereqs, free pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.length).toBeGreaterThan(0);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/kindness|free/i);
    expect(kit.suggestedPricing?.items.some((i) => /FREE|free|kindness/i.test(i.price))).toBe(
      true,
    );
    expect(kit.supplies?.items.length).toBeGreaterThan(0);
    expect(kit.tools.length).toBeGreaterThan(0);
    expect(KIDS_KINDNESS_SHARE_REALITY_CHECK.title).toMatch(/kindness/i);
    expect(KIDS_KINDNESS_SHARE_NOTES_WORKSHEET).toMatch(/GIVE-BACK PLAN/i);
  });

  it("includes exactly 11 authored core steps without GYSH marketing inject", () => {
    const core = KIDS_KINDNESS_SHARE_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/what are you good at/i);
    expect(core[5]?.title).toMatch(/get ready/i);
    expect(core[10]?.title).toMatch(/pass it on/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your first sale/i.test(t))).toHaveLength(0);

    const kitSteps = guideKitForId(GUIDE_ID).steps ?? [];
    expect(kitSteps.some((s) => /what are you good at/i.test(s.title))).toBe(true);
    expect(kitSteps.some((s) => /count your kindness/i.test(s.title))).toBe(true);
  });

  it("uses Kindness Counter (not revenue)", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("kindness");
    const profile = guideCalcProfileForId(GUIDE_ID, "Give Back: Share a Skill for Free");
    expect(profile.title).toMatch(/kindness counter/i);
    expect(profile.disclaimerExtra).toMatch(/no revenue|kindness/i);

    const result = computeGuideCalc(
      "kindness",
      {
        activitiesCompleted: 3,
        peopleHelped: 4,
        minutesHelping: 90,
        monthlyGoal: 5,
      },
      [],
    );
    expect(result.revenue).toBe(0);
    expect(result.expenses).toBe(0);
    expect(result.metrics?.totalActivities).toBe(3);
    expect(result.metrics?.totalPeopleHelpedKindness).toBe(4);
    expect(result.metrics?.totalHelpingMinutes).toBe(90);
    expect(result.metrics?.totalHelpingHours).toBe(1.5);
    expect(result.metrics?.kindnessMonthlyGoal).toBe(5);
    expect(result.metrics?.kindnessStillToGo).toBe(2);

    const counter = computeKidsKindnessCounter({
      activitiesCompleted: 3,
      peopleHelped: 4,
      minutesHelping: 90,
      monthlyGoal: 5,
    });
    expect(counter.totalHelpingHours).toBe(1.5);
    expect(counter.stillToGo).toBe(2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Give Back: Share a Skill for Free");
    expect(pdf.prerequisites.length).toBeGreaterThan(0);
    expect(pdf.pricing?.some((p) => /FREE|free|kindness/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /what are you good at/i.test(s.title))).toBe(true);
    expect(pdf.steps.some((s) => /pass it on/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /what are you good at/i.test(s.title))).toBe(true);
  });
});
