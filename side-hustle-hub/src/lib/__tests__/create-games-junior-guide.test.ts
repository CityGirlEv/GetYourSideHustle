import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { computeGuideCalc, guideCalcProfileForId } from "../guide-revenue-calc";
import { kidsGuideMinTier, juniorGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier } from "../age-library-tiers";
import { parseGuideStepDesc } from "../guide-step-checklist";
import {
  CREATE_GAMES_JUNIOR_DETAILED_STEPS,
  CREATE_GAMES_JUNIOR_NOTES_WORKSHEET,
  CREATE_GAMES_JUNIOR_PRICING,
  CREATE_GAMES_JUNIOR_REALITY_CHECK,
  CREATE_GAMES_JUNIOR_SUPPLIES,
  CREATE_GAMES_JUNIOR_TOOLS,
  computeCreateGamesJuniorProfit,
  createGamesJuniorToolsDisclaimer,
} from "../create-games-junior-guide";

const GUIDE_ID = "create-games-junior";

describe("Guide #055 Create Games with AI (Teens)", () => {
  it("keeps a single #055 id, exact title, Elite, 5 - 15 hrs/week, and itch.io pricing", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("055");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("055");
    const idsFor055 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "055")
      .map(([id]) => id);
    expect(idsFor055).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Create Games with AI (Teens)");
    expect(h.name).not.toMatch(
      /guide upgrade|teen ai game guide|elite guide|member guide/i,
    );
    expect(h.category).toBe("AI / Creative");
    expect(h.timeReq).toMatch(/5\s*-\s*15 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/itch\.io/i);
    expect(h.potentialIncome).toMatch(/\$0 – \$200\+/);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior"]));
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(juniorGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(h.description).toMatch(/guardian approval/i);
  });

  it("replaces pricing with demo, tip, commission, and prototype examples", () => {
    const intro = CREATE_GAMES_JUNIOR_PRICING.intro;
    expect(intro).toMatch(/\$25 – \$75/);
    expect(intro).toMatch(/\$75 – \$200\+/);
    expect(intro).toMatch(/pay-what-you-want/i);
    expect(intro).toMatch(/do not promise downloads/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(CREATE_GAMES_JUNIOR_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(CREATE_GAMES_JUNIOR_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(CREATE_GAMES_JUNIOR_TOOLS.some((t) => /godot|gdevelop/i.test(t.name))).toBe(true);
    expect(createGamesJuniorToolsDisclaimer()).toMatch(/guardian-managed publishing/i);
    expect(CREATE_GAMES_JUNIOR_REALITY_CHECK.title).toMatch(/publishing creates real responsibilities/i);
    expect(CREATE_GAMES_JUNIOR_NOTES_WORKSHEET).toMatch(/MY GAME BRIEF/i);
    expect(CREATE_GAMES_JUNIOR_NOTES_WORKSHEET).toMatch(/BEGINNER CHALLENGE/i);
  });

  it("includes exactly 11 authored core steps with guardian publishing workflow", () => {
    const core = CREATE_GAMES_JUNIOR_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Write a One-Page Game Brief",
      "Choose the Engine & Publishing Path",
      "Design the Core Loop & Milestones",
      "Prototype with Placeholders",
      "Use AI with a Change Log",
      "Create & License the Asset Set",
      "Playtest & Write Reproducible Bugs",
      "Make the Release Candidate",
      "Choose Marketing Channels & Make Materials",
      "Publish or Deliver with Guardian Approval",
      "Track Results & Decide the Next Version",
    ]);
    expect(core[1]?.desc).toMatch(/guardian approval/i);
    expect(core[4]?.title).toMatch(/change log/i);
    expect(core[4]?.desc).toMatch(/ai-assisted addition/i);
    expect(core[6]?.desc).toMatch(/blocker/i);
    expect(core[8]?.desc).toMatch(/choose exactly 2 or 3/i);
    expect(core[9]?.desc).toMatch(/tax interview/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses Teen Game Project Profit Calculator: $135 gross, $35 expenses, $100 profit, $5/hr", () => {
    const helper = computeCreateGamesJuniorProfit({
      paidDownloadsTips: 20,
      avgGrossAmount: 3,
      commissionProjects: 1,
      avgCommissionPrice: 75,
      platformRevenueShareFees: 15,
      paymentProcessingFees: 10,
      refundsChargebacks: 0,
      toolAssetCosts: 5,
      otherBusinessExpenses: 5,
      totalHours: 20,
    });
    expect(helper.digitalGrossRevenue).toBe(60);
    expect(helper.commissionRevenue).toBe(75);
    expect(helper.totalGrossRevenue).toBe(135);
    expect(helper.totalExpenses).toBe(35);
    expect(helper.estimatedProfit).toBe(100);
    expect(helper.effectiveProfitPerHour).toBe(5);

    const profile = guideCalcProfileForId(GUIDE_ID);
    const wired = computeGuideCalc(
      profile.mode,
      {
        ...profile.defaults,
        paidDownloadsTips: 20,
        avgGrossAmount: 3,
        commissionProjects: 1,
        avgCommissionPrice: 75,
        platformRevenueShareFees: 15,
        paymentProcessingFees: 10,
        toolAssetCosts: 5,
        otherBusinessExpenses: 5,
        totalHours: 20,
      },
      [],
    );
    expect(Number.isFinite(wired.marginPercent)).toBe(true);
    expect(wired.marginPercent).toBeCloseTo((100 / 135) * 100, 5);
  });
});
