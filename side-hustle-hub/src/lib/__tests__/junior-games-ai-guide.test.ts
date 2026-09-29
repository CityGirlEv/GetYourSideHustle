import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import {
  detailedStepsForGuide,
  guideUsesSkillLearningPlaybook,
} from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { kidsGuideById } from "../kids-guides";
import { kidsGuideMinTier, juniorGuideMinTier } from "../guide-access";
import { resolveLaunchGuideData } from "../resolve-launch-guide-data";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import {
  JUNIOR_GAMES_AI_DETAILED_STEPS,
  JUNIOR_GAMES_AI_NOTES_WORKSHEET,
  JUNIOR_GAMES_AI_REALITY_CHECK,
  computeJuniorGamesAiProfit,
} from "../junior-games-ai-guide";

const GUIDE_ID = "junior-games-ai";

describe("Guide #040 Build a Game with AI — From Idea to Prototype", () => {
  it("keeps a single #040 id, exact title, Elite, 1–2 weeks, and Member guide earnings", () => {
    const catalogDupes = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(catalogDupes).toHaveLength(0);
    expect(formatGuideNumber(GUIDE_ID)).toBe("040");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("040");
    const idsFor040 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "040")
      .map(([id]) => id);
    expect(idsFor040).toEqual([GUIDE_ID]);

    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Build a Game with AI — From Idea to Prototype");
    expect(g.title).not.toMatch(/guide upgrade|ai game guide|game builder|elite guide|member guide|junior games ai/i);
    expect(g.audience).toBe("junior");
    expect(g.free).toBe(false);
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(juniorGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(hustleById(GUIDE_ID)).toBeUndefined();
    expect(guideUsesSkillLearningPlaybook(GUIDE_ID)).toBe(true);

    const data = resolveLaunchGuideData(GUIDE_ID, []);
    expect(data.name).toBe("Build a Game with AI — From Idea to Prototype");
    expect(data.timeframe).toMatch(/1\s*-\s*2 weeks/i);
    expect(data.estEarnings).toMatch(/member guide/i);
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|guardian|before building/i.test(p.label))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/building\/learning/i);
    expect(kit.supplies?.items.some((i) => /computer|notes|folder/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /chatgpt|beginner tool stack/i.test(t.name))).toBe(true);
    expect(JUNIOR_GAMES_AI_REALITY_CHECK.title).toMatch(/build small first/i);
    expect(JUNIOR_GAMES_AI_NOTES_WORKSHEET).toMatch(/MY GAME/i);
  });

  it("includes exactly 11 authored core steps without GYSH marketing inject", () => {
    const core = JUNIOR_GAMES_AI_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/one-sentence game idea/i);
    expect(core[1]?.title).toMatch(/mini game design/i);
    expect(core[4]?.title).toMatch(/core gameplay loop/i);
    expect(core[9]?.title).toMatch(/package the prototype/i);
    expect(core[10]?.title).toMatch(/version 2/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const kitSteps = guideKitForId(GUIDE_ID).steps ?? [];
    expect(kitSteps[0]?.title).toMatch(/parent|partner|friend|someone close/i);
    expect(kitSteps.some((s) => /core gameplay loop/i.test(s.title))).toBe(true);

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /research competitors/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /pick a name for your side hustle/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your first sale/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /^ask for a short review$/i.test(t))).toHaveLength(0);
  });

  it("uses AI Game Prototype Project Calculator with spec example math", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Build a Game with AI — From Idea to Prototype");
    expect(profile.title).toMatch(/ai game prototype project calculator/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 0,
        avgTicket: 50,
        extraEventPay: 15,
        hoursPerShoot: 2,
        editingHoursPerShoot: 2,
        testingHoursPerProject: 1,
      },
      [
        { id: "software", label: "Software/tool cost", amount: 10 },
        { id: "supplies", label: "Asset cost", amount: 0 },
        { id: "ads", label: "Advertising/portfolio", amount: 0 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(65);
    expect(result.expenses).toBe(10);
    expect(result.net).toBe(55);
    expect(result.metrics?.netPerHour).toBe(11);
    expect(result.notes.some((n) => /prototype/i.test(n))).toBe(true);

    const helper = computeJuniorGamesAiProfit({
      projectFee: 50,
      addOnRevenue: 15,
      softwareToolCost: 10,
      planningHours: 2,
      buildHours: 2,
      testingRevisionHours: 1,
    });
    expect(helper.totalRevenue).toBe(65);
    expect(helper.estimatedProjectProfit).toBe(55);
    expect(helper.totalHours).toBe(5);
    expect(helper.effectiveProfitPerHour).toBe(11);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Build a Game with AI — From Idea to Prototype");
    expect(pdf.steps.some((s) => /one-sentence game idea/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /core gameplay loop/i.test(s.title))).toBe(true);
  });
});
