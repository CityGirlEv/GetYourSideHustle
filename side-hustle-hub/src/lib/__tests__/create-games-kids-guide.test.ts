import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { computeGuideCalc, guideCalcProfileForId } from "../guide-revenue-calc";
import { kidsGuideMinTier } from "../guide-access";
import { kidsLibraryMinTier } from "../age-library-tiers";
import { parseGuideStepDesc } from "../guide-step-checklist";
import {
  CREATE_GAMES_KIDS_DETAILED_STEPS,
  CREATE_GAMES_KIDS_NOTES_WORKSHEET,
  CREATE_GAMES_KIDS_PRICING,
  CREATE_GAMES_KIDS_REALITY_CHECK,
  CREATE_GAMES_KIDS_SUPPLIES,
  CREATE_GAMES_KIDS_TOOLS,
  computeCreateGamesKidsProfit,
  createGamesKidsToolsDisclaimer,
} from "../create-games-kids-guide";

const GUIDE_ID = "create-games-kids";

describe("Guide #054 Create Games with AI (Kids)", () => {
  it("keeps a single #054 id, exact title, Elite, 2 - 8 hrs/week, and school-fair pricing", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("054");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("054");
    const idsFor054 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "054")
      .map(([id]) => id);
    expect(idsFor054).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Create Games with AI (Kids)");
    expect(h.name).not.toMatch(
      /guide upgrade|kids ai game guide|elite guide|member guide/i,
    );
    expect(h.category).toBe("AI / Creative");
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/school fair/i);
    expect(h.potentialIncome).toMatch(/family tips/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["kids"]));
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(h.description).toMatch(/parent nearby/i);
  });

  it("replaces pricing with learning-first and parent-managed fair examples", () => {
    const intro = CREATE_GAMES_KIDS_PRICING.intro;
    expect(intro).toMatch(/school fair/i);
    expect(intro).toMatch(/\$1 – \$3/);
    expect(intro).toMatch(/\$5 – \$20/);
    expect(intro).toMatch(/do not promise app-store/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(CREATE_GAMES_KIDS_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(CREATE_GAMES_KIDS_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(CREATE_GAMES_KIDS_TOOLS.some((t) => /scratch/i.test(t.name))).toBe(true);
    expect(createGamesKidsToolsDisclaimer()).toMatch(/ai is a helper/i);
    expect(CREATE_GAMES_KIDS_REALITY_CHECK.title).toMatch(/ai is a helper/i);
    expect(CREATE_GAMES_KIDS_NOTES_WORKSHEET).toMatch(/MY GAME PLAN/i);
    expect(CREATE_GAMES_KIDS_NOTES_WORKSHEET).toMatch(/BEGINNER CHALLENGE/i);
  });

  it("includes exactly 11 authored core steps with parent safety and paper prototype", () => {
    const core = CREATE_GAMES_KIDS_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Pick One Tiny Game Idea",
      "Set the Parent Safety & Tool Rules",
      "Write the Rules Before Building",
      "Make a Paper Prototype",
      "Use AI for a Short Idea List",
      "Build One Playable Level",
      "Add Original Art, Words & Sound",
      "Run a Family Playtest",
      "Fix the Three Biggest Problems",
      "Choose Safe Sharing & Marketing Channels",
      "Share, Record Results & Plan Version Two",
    ]);
    expect(core[1]?.desc).toMatch(/parent\/guardian/i);
    expect(core[3]?.title).toMatch(/paper prototype/i);
    expect(core[4]?.desc).toMatch(/privacy-safe prompt/i);
    expect(core[9]?.desc).toMatch(/choose exactly 2 or 3/i);
    expect(core[10]?.desc).toMatch(/parent handles/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses Kids Game Project Calculator: $35 revenue, $12 expenses, $23 profit", () => {
    const helper = computeCreateGamesKidsProfit({
      fairPlayCardsSold: 15,
      pricePerPlayCard: 2,
      parentApprovedFamilyTips: 5,
      customFamilyGames: 0,
      avgPricePerCustomGame: 0,
      printingEventFees: 8,
      supplies: 4,
      toolAssetCosts: 0,
      otherExpenses: 0,
    });
    expect(helper.playCardRevenue).toBe(30);
    expect(helper.customGameRevenue).toBe(0);
    expect(helper.totalRevenue).toBe(35);
    expect(helper.totalExpenses).toBe(12);
    expect(helper.estimatedProfit).toBe(23);

    const profile = guideCalcProfileForId(GUIDE_ID);
    const wired = computeGuideCalc(
      profile.mode,
      {
        ...profile.defaults,
        fairPlayCardsSold: 15,
        pricePerPlayCard: 2,
        parentApprovedFamilyTips: 5,
        printingEventFees: 8,
        supplies: 4,
      },
      [],
    );
    expect(Number.isFinite(wired.marginPercent)).toBe(true);
    expect(wired.marginPercent).toBeCloseTo((23 / 35) * 100, 5);
  });
});
