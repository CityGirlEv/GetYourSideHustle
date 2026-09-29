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
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  JUNIOR_GIVE_BACK_TEACH_DETAILED_STEPS,
  JUNIOR_GIVE_BACK_TEACH_NOTES_WORKSHEET,
  JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK,
  computeJuniorGiveBackImpact,
} from "../junior-give-back-teach-guide";

const GUIDE_ID = "junior-give-back-teach";

describe("Guide #009 Give Back: Teach What You Know", () => {
  it("keeps a single #009 id, Free tier, and title", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("009");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("009");
    const idsFor009 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "009")
      .map(([id]) => id);
    expect(idsFor009).toEqual([GUIDE_ID]);

    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Give Back: Teach What You Know");
    expect(g.free).toBe(true);
    expect(g.audience).toBe("junior");
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("free");
    expect(guideUsesGiveBackFoundation(GUIDE_ID)).toBe(true);
  });

  it("ships all prep tabs: prereqs, free pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(
      kit.prerequisites.some((p) => /overview|need|safety|what this guide/i.test(p.label)),
    ).toBe(true);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/free give-back/i);
    expect(kit.suggestedPricing?.items.some((i) => /FREE/i.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => /lesson outline/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /google docs/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK.title).toMatch(/worth sharing/i);
    expect(JUNIOR_GIVE_BACK_TEACH_NOTES_WORKSHEET).toMatch(/GIVE-BACK TEACHING PLAN/i);
  });

  it("includes exactly 11 authored core steps without GYSH marketing inject", () => {
    const core = JUNIOR_GIVE_BACK_TEACH_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/pick something you know/i);
    expect(core[5]?.title).toMatch(/simple invitation/i);
    expect(core[10]?.title).toMatch(/decide what.?s next/i);

    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /research competitors/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /pick a name for your side hustle/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your first sale/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /^ask for a short review$/i.test(t))).toHaveLength(0);

    const kitSteps = guideKitForId(GUIDE_ID).steps ?? [];
    expect(kitSteps[0]?.title).toMatch(/parent|partner|friend|someone close/i);
    expect(kitSteps.some((s) => /pick something you know/i.test(s.title))).toBe(true);
    expect(kitSteps.some((s) => /teach!/i.test(s.title))).toBe(true);
  });

  it("uses Give-Back Impact Calculator (not revenue)", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("impact");
    const profile = guideCalcProfileForId(GUIDE_ID, "Give Back: Teach What You Know");
    expect(profile.title).toMatch(/impact calculator/i);
    expect(profile.disclaimerExtra).toMatch(/FREE/i);

    const result = computeGuideCalc(
      "impact",
      {
        sessions: 2,
        peoplePerSession: 3,
        minutesPerSession: 45,
        prepMinutesPerSession: 30,
        futureRatePerSession: 20,
        futureSessionCount: 4,
      },
      [],
    );
    expect(result.metrics?.totalPeopleHelped).toBe(6);
    expect(result.metrics?.teachingHours).toBe(1.5);
    expect(result.metrics?.prepHours).toBe(1);
    expect(result.metrics?.totalGiveBackHours).toBe(2.5);
    expect(result.metrics?.futureExampleRevenue).toBe(80);
    expect(result.notes.some((n) => /FUTURE EXAMPLE ONLY/i.test(n))).toBe(true);

    const impact = computeJuniorGiveBackImpact({
      sessions: 2,
      peoplePerSession: 3,
      minutesPerSession: 45,
      prepMinutesPerSession: 30,
    });
    expect(impact.totalPeopleHelped).toBe(6);
    expect(impact.totalGiveBackHours).toBe(2.5);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Give Back: Teach What You Know");
    expect(pdf.prerequisites.some((p) => /skill|safety|parent|teach/i.test(p))).toBe(true);
    expect(pdf.pricing?.some((p) => /FREE/i.test(p))).toBe(true);
    expect(pdf.supplies.some((s) => /lesson outline|notebook|timer/i.test(s.name))).toBe(true);
    expect(pdf.tools.some((t) => /google docs|timer|canva/i.test(t))).toBe(true);
    expect(pdf.steps.some((s) => /pick something you know/i.test(s.title))).toBe(true);
    expect(pdf.steps.some((s) => /teach!/i.test(s.title))).toBe(true);
    expect(pdf.steps.some((s) => /choose your marketing channels/i.test(s.title))).toBe(false);
    expect(pdf.steps.length).toBe((kit.steps ?? []).length);
  });
});
