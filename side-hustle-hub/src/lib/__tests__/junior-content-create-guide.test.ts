import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { kidsGuideById } from "../kids-guides";
import { kidsGuideMinTier, juniorGuideMinTier } from "../guide-access";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import {
  JUNIOR_CONTENT_CREATE_DETAILED_STEPS,
  JUNIOR_CONTENT_CREATE_NOTES_WORKSHEET,
  JUNIOR_CONTENT_CREATE_PRICING,
  JUNIOR_CONTENT_CREATE_REALITY_CHECK,
  JUNIOR_CONTENT_CREATE_SUPPLIES,
  JUNIOR_CONTENT_CREATE_TOOLS,
  computeJuniorContentCreateProfit,
  juniorContentCreateToolsDisclaimer,
} from "../junior-content-create-guide";

const GUIDE_ID = "junior-content-create";

describe("Guide #051 Content Creation Starter (Parent-Friendly)", () => {
  it("keeps a single #051 id, exact title, Elite, and lives in kids-guides", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("051");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("051");
    const idsFor051 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "051")
      .map(([id]) => id);
    expect(idsFor051).toEqual([GUIDE_ID]);

    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Content Creation Starter (Parent-Friendly)");
    expect(g.title).not.toMatch(
      /guide upgrade|content creator guide|elite guide|member guide/i,
    );
    expect(g.audience).toBe("junior");
    expect(g.free).toBe(false);
    expect(g.summary).toMatch(/privacy-first|no stranger/i);
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(juniorGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(hustleById(GUIDE_ID)).toBeUndefined();
    expect(SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID)).toHaveLength(0);
  });

  it("replaces pricing with parent-managed content examples", () => {
    const intro = JUNIOR_CONTENT_CREATE_PRICING.intro;
    expect(intro).toMatch(/\$10 – \$30/);
    expect(intro).toMatch(/\$25 – \$60/);
    expect(intro).toMatch(/practice \/ portfolio piece/i);
    expect(intro).toMatch(/parent\/guardian/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(JUNIOR_CONTENT_CREATE_SUPPLIES.starterKitTotal).toMatch(/\$10 – \$35/);
    expect(JUNIOR_CONTENT_CREATE_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(
      true,
    );
    expect(juniorContentCreateToolsDisclaimer()).toMatch(/safety manager/i);
    expect(JUNIOR_CONTENT_CREATE_REALITY_CHECK.title).toMatch(/parent is the safety manager/i);
    expect(JUNIOR_CONTENT_CREATE_NOTES_WORKSHEET).toMatch(/MY CONTENT CREATION PLAN/i);
    expect(JUNIOR_CONTENT_CREATE_NOTES_WORKSHEET).toMatch(/BEGINNER CHALLENGE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 5–7", () => {
    const core = JUNIOR_CONTENT_CREATE_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose One Safe Purpose & Topic",
      "Set the Family Safety Rules",
      "Define the Content Package",
      "Make Three Offline Samples",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Complete a Client Brief",
      "Create, Check & Get Approval",
      "Deliver the Files & Track Profit",
      "Build a Safe Portfolio & Repeat",
    ]);
    expect(core[1]?.desc).toMatch(/direct messages/i);
    expect(core[4]?.desc).toMatch(/choose exactly 2 or 3/i);
    expect(core[6]?.desc).toMatch(/do not spam/i);
    expect(core[8]?.desc).toMatch(/parent review/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses Parent-Friendly Content Profit Calculator: $105 revenue, $15 expenses, $90 profit, $15/hr", () => {
    const example = {
      singlePiecesPerMonth: 3,
      avgPricePerSinglePiece: 20,
      threePostPacksPerMonth: 1,
      avgPricePerPack: 45,
      otherApprovedCreativeRevenue: 0,
      designAppCosts: 10,
      propsPrinting: 5,
      paymentFees: 0,
      otherBusinessExpenses: 0,
      totalHours: 6,
    };
    const helper = computeJuniorContentCreateProfit(example);
    expect(helper.singlePieceRevenue).toBe(60);
    expect(helper.packRevenue).toBe(45);
    expect(helper.monthlyRevenue).toBe(105);
    expect(helper.monthlyExpenses).toBe(15);
    expect(helper.estimatedMonthlyProfit).toBe(90);
    expect(helper.effectiveProfitPerHour).toBe(15);
  });
});
