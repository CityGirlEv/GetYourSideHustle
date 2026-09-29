import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import {
  detailedStepsForGuide,
  guideUsesSkillLearningPlaybook,
} from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { kidsGuideById } from "../kids-guides";
import { kidsGuideMinTier } from "../guide-access";
import { resolveLaunchGuideData } from "../resolve-launch-guide-data";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  KIDS_GAMES_AI_DETAILED_STEPS,
  KIDS_GAMES_AI_NOTES_WORKSHEET,
  KIDS_GAMES_AI_REALITY_CHECK,
  computeKidsGamesAiProject,
} from "../kids-games-ai-guide";

const GUIDE_ID = "kids-games-ai";

describe("Guide #087 Make a Tiny Game with AI (Parent Nearby)", () => {
  it("keeps a single #087 id, exact title, Elite, a few days, and Member guide", () => {
    const catalogDupes = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(catalogDupes).toHaveLength(0);
    expect(formatGuideNumber(GUIDE_ID)).toBe("087");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("087");
    const idsFor087 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "087")
      .map(([id]) => id);
    expect(idsFor087).toEqual([GUIDE_ID]);

    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Make a Tiny Game with AI (Parent Nearby)");
    expect(g.title).not.toMatch(
      /guide upgrade|tiny game guide|ai game guide|kids ai guide|elite guide|member guide/i,
    );
    expect(g.audience).toBe("kids");
    expect(g.free).toBe(false);
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(hustleById(GUIDE_ID)).toBeUndefined();
    expect(guideUsesSkillLearningPlaybook(GUIDE_ID)).toBe(true);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");

    const data = resolveLaunchGuideData(GUIDE_ID, []);
    expect(data.name).toBe("Make a Tiny Game with AI (Parent Nearby)");
    expect(data.timeframe).toMatch(/a few days/i);
    expect(data.estEarnings).toMatch(/member guide/i);
  });

  it("replaces pricing with learning-first and parent-managed examples", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.intro).toMatch(/PRIMARY GOAL: LEARN \+ CREATE/i);
    expect(kit.suggestedPricing?.intro).toMatch(/FREE PROJECT/i);
    expect(kit.suggestedPricing?.intro).toMatch(/\$5 – \$15/);
    expect(kit.suggestedPricing?.intro).toMatch(/parent-managed/i);
    expect(kit.supplies?.items.some((i) => /paper|notebook|planning/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack|paper plan/i.test(t.name))).toBe(true);
    expect(KIDS_GAMES_AI_REALITY_CHECK.title).toMatch(/kid creates; the adult handles/i);
    expect(KIDS_GAMES_AI_NOTES_WORKSHEET).toMatch(/MY TINY GAME/i);
    expect(KIDS_GAMES_AI_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps without GYSH marketing inject", () => {
    const core = KIDS_GAMES_AI_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/pick one tiny game idea/i);
    expect(core[2]?.desc).toMatch(/do not provide private information/i);
    expect(core[3]?.desc).toMatch(/do not copy copyrighted/i);
    expect(core[10]?.title).toMatch(/share safely/i);

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
    expect(titles.filter((t) => /research competitors/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /pick a name for your side hustle/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /make your first sale/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /^ask for a short review$/i.test(t))).toHaveLength(0);
  });

  it("uses Tiny Game Project Calculator: $20 gross, $4 costs, $16 remaining", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Make a Tiny Game with AI (Parent Nearby)");
    expect(profile.title).toMatch(/tiny game project calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "projectsMade")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "freeProjects")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "paidProjects")).toBe(true);

    const result = computeGuideCalc(
      "service",
      {
        paidProjects: 2,
        avgProjectPrice: 10,
        supplyToolCost: 4,
        otherApprovedCost: 0,
        savePercent: 50,
        enjoyPercent: 25,
        growPercent: 25,
      },
      [],
    );
    expect(result.revenue).toBe(20);
    expect(result.expenses).toBe(4);
    expect(result.net).toBe(16);
    expect(result.notes.join(" ")).toMatch(/parent-managed/i);

    const helper = computeKidsGamesAiProject({
      paidProjects: 2,
      avgProjectPrice: 10,
      supplyToolCost: 4,
      savePercent: 50,
      enjoyPercent: 25,
      growPercent: 25,
    });
    expect(helper.grossProjectMoney).toBe(20);
    expect(helper.projectCosts).toBe(4);
    expect(helper.amountRemaining).toBe(16);
    expect(helper.saveAmount).toBe(8);
    expect(helper.enjoyAmount).toBe(4);
    expect(helper.growAmount).toBe(4);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Make a Tiny Game with AI (Parent Nearby)");
    expect(pdf.steps.some((s) => /pick one tiny game idea/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /share safely/i.test(s.title))).toBe(true);
  });
});
