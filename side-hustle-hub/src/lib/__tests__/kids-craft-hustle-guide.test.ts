import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { kidsGuideById } from "../kids-guides";
import { kidsGuideMinTier } from "../guide-access";
import { kidsLibraryMinTier } from "../age-library-tiers";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { computeGuideCalc, guideCalcProfileForId } from "../guide-revenue-calc";
import {
  KIDS_CRAFT_HUSTLE_DETAILED_STEPS,
  KIDS_CRAFT_HUSTLE_NOTES_WORKSHEET,
  KIDS_CRAFT_HUSTLE_PRICING,
  KIDS_CRAFT_HUSTLE_REALITY_CHECK,
  KIDS_CRAFT_HUSTLE_SUPPLIES,
  KIDS_CRAFT_HUSTLE_TOOLS,
  computeKidsCraftHustleProfit,
  kidsCraftHustleToolsDisclaimer,
} from "../kids-craft-hustle-guide";

const GUIDE_ID = "kids-craft-hustle";

describe("Guide #053 Craft Hustle Starter + Kevina Kindness Extra", () => {
  it("keeps a single #053 id, exact title, Starter, and kids-guide summary fields", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("053");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("053");
    const idsFor053 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "053")
      .map(([id]) => id);
    expect(idsFor053).toEqual([GUIDE_ID]);

    const g = kidsGuideById(GUIDE_ID)!;
    expect(g.title).toBe("Craft Hustle Starter + Kevina Kindness Extra");
    expect(g.title).not.toMatch(
      /guide upgrade|kids craft guide|craft business guide|kevina craft guide|starter guide|member guide/i,
    );
    expect(g.audience).toBe("kids");
    expect(g.free).toBe(false);
    expect(g.summary).toMatch(/Kevina|kindness/i);
    expect(g.parentTip).toMatch(/parent|supervise/i);
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(hustleById(GUIDE_ID)).toBeUndefined();
    expect(SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID)).toHaveLength(0);
  });

  it("replaces pricing with kindness-extra examples and Evelyn confirmation flags", () => {
    const intro = KIDS_CRAFT_HUSTLE_PRICING.intro;
    expect(intro).toMatch(/NEEDS EVELYN CONFIRMATION/i);
    expect(intro).toMatch(/\$1 – \$3/);
    expect(intro).toMatch(/\$1–\$5|\$2 – \$5/);
    expect(intro).toMatch(/kindness extra/i);
    expect(intro).toMatch(/cost calculation/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(KIDS_CRAFT_HUSTLE_SUPPLIES.items.some((i) => /kindness|sticker|charm/i.test(i.name))).toBe(
      true,
    );
    expect(KIDS_CRAFT_HUSTLE_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(KIDS_CRAFT_HUSTLE_TOOLS.some((t) => /etsy/i.test(t.name))).toBe(true);
    expect(kidsCraftHustleToolsDisclaimer()).toMatch(/parent\/guardian runs the business side/i);
    expect(KIDS_CRAFT_HUSTLE_REALITY_CHECK.title).toMatch(/parent\/guardian runs the business side/i);
    expect(KIDS_CRAFT_HUSTLE_NOTES_WORKSHEET).toMatch(/KINDNESS EXTRA/i);
  });

  it("includes exactly 11 authored core steps with Kevina kindness extra", () => {
    const core = KIDS_CRAFT_HUSTLE_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Pick One Tiny Craft",
      "Set Parent & Safety Rules",
      "Create Three Original Samples",
      "Test Quality & Choose the Winner",
      "Calculate Cost & Set a Fair Price",
      "Add the Kevina Kindness Extra",
      "Make a Small Test Batch",
      "Choose a Safe Sales Channel",
      "Create the Display or Listing",
      "Make Sales & Track Real Profit",
      "Review, Restock & Share Kindness",
    ]);
    expect(core[1]?.desc).toMatch(/parent\/guardian decides/i);
    expect(core[5]?.title).toMatch(/Kevina Kindness Extra/i);
    expect(core[7]?.desc).toMatch(/school fair/i);
    expect(core[9]?.desc).toMatch(/profit = revenue/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = core.map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(0);
  });

  it("uses craft batch calculator: $105 revenue, $42 expenses, $63 profit, $2.10/unit", () => {
    const helper = computeKidsCraftHustleProfit({
      itemsSold: 20,
      avgPricePerItem: 3,
      setsSold: 5,
      avgPricePerSet: 9,
      otherRevenue: 0,
      materials: 20,
      packaging: 8,
      platformPaymentFees: 4,
      eventTableFees: 5,
      shipping: 0,
      refundsReplacements: 0,
      kindnessExtrasGiving: 5,
      otherExpenses: 0,
      totalUnitsSoldOverride: 30,
    });
    expect(helper.itemRevenue).toBe(60);
    expect(helper.setRevenue).toBe(45);
    expect(helper.totalRevenue).toBe(105);
    expect(helper.totalExpenses).toBe(42);
    expect(helper.estimatedProfit).toBe(63);
    expect(helper.totalUnitsSold).toBe(30);
    expect(helper.profitPerUnit).toBeCloseTo(2.1, 2);

    const profile = guideCalcProfileForId(GUIDE_ID);
    const wired = computeGuideCalc(
      profile.mode,
      {
        ...profile.defaults,
        itemsSold: 20,
        avgPricePerItem: 3,
        setsSold: 5,
        avgPricePerSet: 9,
        materials: 20,
        packaging: 8,
        platformPaymentFees: 4,
        eventTableFees: 5,
        kindnessExtrasGiving: 5,
        totalUnitsSoldOverride: 30,
      },
      [],
    );
    expect(Number.isFinite(wired.marginPercent)).toBe(true);
    expect(wired.marginPercent).toBeCloseTo(60, 5);
  });
});
