import { describe, expect, it } from "vitest";
import { kidsGuideMinTier } from "../guide-access";
import { guidesForAudience } from "../kids-guides";
import {
  isSeniorGuideFree,
  orderedSeniorGuides,
  SENIOR_GUIDE_TEASERS,
} from "../seniors-content";

describe("orderedSeniorGuides", () => {
  it("lists Free Membership openers before paid and coming-soon teasers", () => {
    const ordered = orderedSeniorGuides(SENIOR_GUIDE_TEASERS);
    const firstPaidIndex = ordered.findIndex((g) => !isSeniorGuideFree(g));
    const lastFreeIndex = ordered.reduce(
      (last, g, i) => (isSeniorGuideFree(g) ? i : last),
      -1,
    );

    expect(ordered.some(isSeniorGuideFree)).toBe(true);
    expect(firstPaidIndex).toBeGreaterThan(lastFreeIndex === -1 ? -1 : lastFreeIndex);
    expect(ordered.filter(isSeniorGuideFree).every((g) => g.status !== "coming_soon")).toBe(true);
  });
});

describe("kids and teens guide lists", () => {
  it("keeps Free-plan guides before paid ones when partitioned", () => {
    for (const audience of ["kids", "junior"] as const) {
      const guides = guidesForAudience(audience);
      const free = guides.filter((g) => kidsGuideMinTier(g.id) === "free");
      const paid = guides.filter((g) => kidsGuideMinTier(g.id) !== "free");
      expect(free.length).toBeGreaterThan(0);
      expect(paid.length).toBeGreaterThan(0);
      expect(free.every((g) => kidsGuideMinTier(g.id) === "free")).toBe(true);
    }
  });
});
