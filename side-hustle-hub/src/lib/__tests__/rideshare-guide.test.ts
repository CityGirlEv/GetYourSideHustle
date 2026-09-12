import { describe, expect, it } from "vitest";
import { guideKitForId, formatGuideToolLine } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById } from "../side-hustle-catalog";
import { guideCalcModeForId, guideCalcProfileForId } from "../guide-revenue-calc";
import {
  RIDESHARE_DETAILED_STEPS,
  RIDESHARE_NOTES_WORKSHEET,
  RIDESHARE_REALITY_CHECK,
} from "../rideshare-guide";

const GUIDE_ID = "rideshare";

describe("Guide #018 Rideshare (Uber / Lyft)", () => {
  it("keeps the exact title, #018, Pro membership, 3–7 day timeline, and $600–$3,500/mo example", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("018");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("018");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Rideshare (Uber / Lyft)");
    expect(h.name).not.toMatch(/guide upgrade|driver guide|pro guide/i);
    expect(h.minTier).toBe("pro");
    expect(h.timeReq).toMatch(/3\s*-\s*7 days/i);
    expect(h.potentialIncome).toMatch(/\$600/);
    expect(h.potentialIncome).toMatch(/\$3,500/);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
  });

  it("ships earnings strategy, supplies, Uber/Lyft tools, and profit callout", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /qualify|vehicle|license/i.test(p.label + p.detail))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.tabLabel).toMatch(/earnings|shift strategy/i);
    expect(kit.suggestedPricing?.intro).toMatch(/do NOT set passenger prices/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$600/i.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => /phone mount/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /uber/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /lyft/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /mileage/i.test(t.name))).toBe(true);
    for (const tool of kit.tools) {
      expect(formatGuideToolLine(tool), tool.id).not.toMatch(/free plan available/i);
    }
    expect(RIDESHARE_REALITY_CHECK.title).toMatch(/gross earnings are not profit/i);
    expect(RIDESHARE_NOTES_WORKSHEET).toMatch(/MY RIDESHARE PLAN/i);
    expect(RIDESHARE_NOTES_WORKSHEET).toMatch(/Profit Per Mile/i);
  });

  it("uses 11 authored steps and does not inject marketing channels", () => {
    expect(RIDESHARE_DETAILED_STEPS).toHaveLength(11);
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Check Whether You and Your Vehicle Qualify",
        "Estimate Your Real Cost to Drive",
        "Complete Platform Onboarding",
        "Prep Your Vehicle",
        "Build Your Peak-Window Plan",
        "Learn Your Market",
        "Run a Test Shift",
        "Provide a Safe, Professional Ride",
        "Track Every Shift",
        "Improve Your Driving Strategy",
        "Build a Repeatable Weekly Plan",
      ]),
    );
    expect(titles.some((t) => /choose your marketing channels/i.test(t))).toBe(false);
    expect(titles.some((t) => /make your first sale/i.test(t))).toBe(false);
    expect(titles.filter((t) => /uber|lyft|qualify|vehicle/i.test(t)).length).toBeGreaterThan(0);
  });

  it("uses delivery-style profit math with rideshare cash expenses (not IRS mileage as cash)", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("delivery");
    const profile = guideCalcProfileForId(GUIDE_ID, "Rideshare (Uber / Lyft)");
    expect(profile.title).toMatch(/rideshare profit calculator/i);
    expect(profile.disclaimerExtra).toMatch(/does NOT subtract the IRS/i);
    expect(profile.budget.some((l) => /maintenance/i.test(l.label))).toBe(true);
    expect(profile.budget.some((l) => /insurance/i.test(l.label))).toBe(true);
  });
});
