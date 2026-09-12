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
import {
  KIDS_PARTY_GAME_HOST_DETAILED_STEPS,
  KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET,
  KIDS_PARTY_GAME_HOST_REALITY_CHECK,
} from "../kids-party-game-host-guide";

const GUIDE_ID = "kids-party-game-host";

describe("Guide #078 Kids Party Game Host", () => {
  it("keeps a single #078 id and title", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("078");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("078");
    const idsFor078 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "078")
      .map(([id]) => id);
    expect(idsFor078).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Kids Party Game Host");
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult"]));
    expect(h.audiences).toHaveLength(2);
    expect(h.category).toMatch(/Events/i);
    expect(h.description).toMatch(/games|birthday|party/i);
  });

  it("ships all prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /entertainment|not childcare|you do need/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.tabLabel).toMatch(/simple party packages/i);
    expect(kit.suggestedPricing?.intro).toMatch(/quote formula/i);
    expect(kit.supplies?.items.some((i) => /tote|bin/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /bean bag/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /canva/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /spotify|apple music/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /google forms/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /party host toolkit/i.test(t.name))).toBe(true);
    expect(KIDS_PARTY_GAME_HOST_REALITY_CHECK.title).toMatch(/keep the fun moving/i);
    expect(KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET).toMatch(/My Party Host Planner/i);
    expect(KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET).toMatch(/Practice Party/i);
  });

  it("includes exactly 11 authored core steps plus marketing titles", () => {
    const core = KIDS_PARTY_GAME_HOST_DETAILED_STEPS.filter(
      (s) =>
        !/pick how you will tell|make your marketing|carry out the marketing/i.test(s.title),
    );
    expect(core).toHaveLength(11);
    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Choose the age groups you are comfortable hosting",
        "Create a list of 15–20 easy games",
        "Build a small reusable Party Game Kit",
        "Create 2–3 simple party packages",
        "Make a basic flyer/social post advertising your service",
        "Ask the client for party details",
        "Choose games appropriate for the ages, space, and group size",
        "Create a simple party game schedule plus 2 backup games",
        "Arrive 15–20 minutes early and set up",
        "Host the games",
        "Clean up, collect payment, and thank the client",
        "Make Your First Sale",
        "Ask for a Short Review",
      ]),
    );
  });

  it("uses Service Profit Calculator with party expense lines", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("service");
    const profile = guideCalcProfileForId(GUIDE_ID, "Kids Party Game Host");
    expect(profile.mode).toBe("service");
    expect(profile.title).toMatch(/Service Profit Calculator/i);
    expect(profile.disclaimerExtra).toMatch(/Planning estimates only/i);
    expect(profile.budget.map((b) => b.id)).toEqual([
      "supplies",
      "prizes",
      "transport",
      "other",
    ]);

    const result = computeGuideCalc(
      "service",
      { jobsPerMonth: 2, avgTicket: 85 },
      [
        { id: "supplies", label: "Supply cost", amount: 10 },
        { id: "prizes", label: "Prize cost", amount: 10 },
        { id: "transport", label: "Travel cost", amount: 5 },
        { id: "other", label: "Other expenses", amount: 5 },
      ],
    );
    expect(result.revenue).toBe(170);
    expect(result.expenses).toBe(30);
    expect(result.net).toBe(140);
    expect(result.metrics?.netPerDelivery).toBe(70);
  });
});
