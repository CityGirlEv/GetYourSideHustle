import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import {
  LOCAL_EVENT_CONTENT_DETAILED_STEPS,
  LOCAL_EVENT_CONTENT_NOTES_WORKSHEET,
  LOCAL_EVENT_CONTENT_REALITY_CHECK,
} from "../local-event-content-creator-guide";

const GUIDE_ID = "local-event-content-creator";

describe("Guide #083 Local Event Content Creator", () => {
  it("keeps title, #083, Elite, 3–10 hrs/week, and $15–$50/project examples", () => {
    expect(formatGuideNumber(GUIDE_ID)).toBe("083");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("083");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Local Event Content Creator");
    expect(h.minTier).toBe("elite");
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.category).toBe("Content Creation / Local Services");
  });

  it("ships 11 authored steps, 3 marketing stages, and smartphone-first (not videography)", () => {
    expect(LOCAL_EVENT_CONTENT_DETAILED_STEPS).toHaveLength(11);
    expect(LOCAL_EVENT_CONTENT_REALITY_CHECK.title).toMatch(/professional videographer/i);
    expect(LOCAL_EVENT_CONTENT_NOTES_WORKSHEET).toMatch(/LOCAL EVENT CONTENT PLAN/i);
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.items.some((i) => /\$15/.test(i.price))).toBe(true);
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.some((t) => /choose your marketing channels/i.test(t))).toBe(true);
    expect(titles.some((t) => /make your marketing materials/i.test(t))).toBe(true);
    expect(titles.some((t) => /carry out your marketing plan/i.test(t))).toBe(true);
    expect(titles.some((t) => /shot list/i.test(t))).toBe(true);
    expect(titles.some((t) => /wedding film|cinematic/i.test(t))).toBe(false);
    for (const step of LOCAL_EVENT_CONTENT_DETAILED_STEPS) {
      for (const c of parseGuideStepDesc(step.desc).filter((s) => s.kind === "check")) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });
});
