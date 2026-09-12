import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import {
  guideCalcModeForId,
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  YOUTH_SPORTS_HELPER_DETAILED_STEPS,
  YOUTH_SPORTS_HELPER_NOTES_WORKSHEET,
  YOUTH_SPORTS_HELPER_REALITY_CHECK,
} from "../youth-sports-helper-guide";

const GUIDE_ID = "youth-sports-helper";

describe("Guide #117 Youth Sports Practice Helper", () => {
  it("keeps a single #117 id and title", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("117");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("117");
    const idsFor117 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "117")
      .map(([id]) => id);
    expect(idsFor117).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Youth Sports Practice Helper");
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.category).toMatch(/Sports|Youth/i);
    expect(h.potentialIncome).toMatch(/\$20/);
  });

  it("ships all prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(
      kit.prerequisites.some((p) =>
        /helper|coach|requirements|overview|tasks/i.test(p.label),
      ),
    ).toBe(true);
    expect(kit.suggestedPricing?.items.some((i) => /PER PRACTICE/i.test(i.label))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/recurring/i);
    expect(kit.supplies?.items.some((i) => /sunscreen|athletic/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /google docs/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /canva/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(YOUTH_SPORTS_HELPER_REALITY_CHECK.title).toMatch(/you help/i);
    expect(YOUTH_SPORTS_HELPER_NOTES_WORKSHEET).toMatch(/Practice Helper Planner/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = YOUTH_SPORTS_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);

    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    // No duplicate Create/Execute injection
    expect(titles.filter((t) => /create your marketing campaign/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /execute your marketing campaign/i.test(t))).toHaveLength(0);

    expect(titles).toEqual(
      expect.arrayContaining([
        "Choose what you will help with",
        "Set your price",
        "Choose Your Marketing Channels",
        "Make Your Marketing Materials",
        "Carry Out Your Marketing Plan",
        "Talk with the coach",
        "Confirm the first practice",
        "Set up practice",
        "Help during practice",
        "Clean up",
        "Get rebooked",
        "Make Your First Sale",
        "Ask for a Short Review",
      ]),
    );
  });

  it("uses Practice Helper Earnings Calculator with weekly → monthly estimate", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("service");
    const profile = guideCalcProfileForId(GUIDE_ID, "Youth Sports Practice Helper");
    expect(profile.title).toMatch(/Practice Helper Earnings Calculator/i);
    expect(profile.budget.map((b) => b.id)).toEqual(["transport", "other"]);
    expect(profile.defaults.extraEventPay).toBe(0);
    expect(profile.defaults.hoursPerPractice).toBe(0);

    const result = computeGuideCalc(
      "service",
      { jobsPerMonth: 3, avgTicket: 30, extraEventPay: 0, hoursPerPractice: 1.5 },
      [
        { id: "transport", label: "Weekly travel expenses", amount: 10 },
        { id: "other", label: "Other expenses", amount: 5 },
      ],
    );
    expect(result.revenue).toBe(90);
    expect(result.expenses).toBe(15);
    expect(result.net).toBe(75);
    expect(result.metrics?.netPerHour).toBeCloseTo(75 / 4.5, 5);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);
    expect(result.notes.some((n) => /324\.75/.test(n))).toBe(true);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Youth Sports Practice Helper");
    expect(pdf.prerequisites.some((p) => /helper|coach|practice/i.test(p))).toBe(true);
    expect(pdf.pricing?.some((p) => /PER PRACTICE|RECURRING/i.test(p))).toBe(true);
    expect(pdf.supplies.some((s) => /sunscreen|athletic|clipboard/i.test(s.name))).toBe(true);
    expect(pdf.tools.some((t) => /canva|google docs|phone timer/i.test(t))).toBe(true);
    expect(pdf.steps.some((s) => /choose your marketing channels/i.test(s.title))).toBe(true);
    expect(pdf.steps.some((s) => /get rebooked/i.test(s.title))).toBe(true);
    expect(pdf.steps.length).toBe((kit.steps ?? []).length);
  });
});
