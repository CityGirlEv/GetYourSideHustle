import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import {
  AIRBNB_TURNOVER_CHECKER_DETAILED_STEPS,
  AIRBNB_TURNOVER_CHECKER_NOTES_WORKSHEET,
  AIRBNB_TURNOVER_CHECKER_REALITY_CHECK,
} from "../airbnb-turnover-checker-guide";

const GUIDE_ID = "airbnb-turnover-checker";

describe("Guide #032 Airbnb Turnover Checker", () => {
  it("keeps title, #032, Starter, 2–8 hrs/week, and $10–$40/job examples", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("032");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("032");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Airbnb Turnover Checker");
    expect(h.minTier).toBe("starter");
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
  });

  it("ships 11 authored steps, 3 marketing stages, and is not a cleaning/PM playbook", () => {
    expect(AIRBNB_TURNOVER_CHECKER_DETAILED_STEPS).toHaveLength(11);
    expect(AIRBNB_TURNOVER_CHECKER_REALITY_CHECK.title).toMatch(/final check/i);
    expect(AIRBNB_TURNOVER_CHECKER_NOTES_WORKSHEET).toMatch(/TURNOVER CHECKER PLAN/i);
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/turnover check/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$10/.test(i.price))).toBe(true);
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.some((t) => /choose your marketing channels/i.test(t))).toBe(true);
    expect(titles.some((t) => /make your marketing materials/i.test(t))).toBe(true);
    expect(titles.some((t) => /carry out your marketing plan/i.test(t))).toBe(true);
    expect(titles.some((t) => /walk the property/i.test(t))).toBe(true);
    expect(titles.some((t) => /cleaning service/i.test(t))).toBe(false);
    for (const step of AIRBNB_TURNOVER_CHECKER_DETAILED_STEPS) {
      for (const c of parseGuideStepDesc(step.desc).filter((s) => s.kind === "check")) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });
});
