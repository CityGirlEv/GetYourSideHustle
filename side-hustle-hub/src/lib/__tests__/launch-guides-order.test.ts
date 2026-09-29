import { describe, expect, it } from "vitest";
import { adultGuideMinTier } from "../guide-access";
import { LAUNCH_GUIDES, sortGuidesFreeFirst } from "../launch-guides";

describe("launch guides free-first order", () => {
  it("lists Free Membership guides before paid ones", () => {
    expect(adultGuideMinTier(LAUNCH_GUIDES[0].id)).toBe("free");
    const firstPaidIdx = LAUNCH_GUIDES.findIndex((g) => adultGuideMinTier(g.id) !== "free");
    expect(firstPaidIdx).toBeGreaterThan(0);
    for (let i = 0; i < firstPaidIdx; i++) {
      expect(adultGuideMinTier(LAUNCH_GUIDES[i].id)).toBe("free");
    }
    for (let i = firstPaidIdx; i < LAUNCH_GUIDES.length; i++) {
      expect(adultGuideMinTier(LAUNCH_GUIDES[i].id)).not.toBe("free");
    }
  });

  it("sortGuidesFreeFirst is stable by name within a tier", () => {
    const sample = [
      { id: "rideshare", name: "Rideshare" },
      { id: "handyman", name: "Handyman Services" },
      { id: "ai-assets", name: "AI Asset Studio" },
    ];
    const sorted = sortGuidesFreeFirst(sample);
    expect(sorted.map((g) => g.id)).toEqual(["handyman", "rideshare", "ai-assets"]);
  });
});
