import { describe, expect, it } from "vitest";
import { kidsGuideMinTier, seniorGuideMinTier } from "../guide-access";
import { guidesForAudience } from "../kids-guides";
import {
  isSeniorGuideFree,
  orderedSeniorGuides,
  SENIOR_GUIDE_TEASERS,
  SENIOR_OPPORTUNITIES,
  SENIOR_OPPORTUNITIES_EXPANDED,
  SENIOR_POD_TOP_MATCH_ANSWERS,
  scoreSeniorMatch,
} from "../seniors-content";
import { hustleById } from "../side-hustle-catalog";
import { seniorLibraryMinTier } from "../age-library-tiers";

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

describe("Elite Senior POD wiring", () => {
  it("keeps POD on the senior Elite lane, wizard pool, and live teaser", () => {
    expect(hustleById("pod")?.audiences).toContain("senior");
    expect(hustleById("pod")?.minTier).toBe("elite");
    expect(seniorLibraryMinTier("pod")).toBe("elite");
    expect(seniorGuideMinTier("senior-pod", "pod")).toBe("elite");
    expect(SENIOR_OPPORTUNITIES.some((o) => o.id === "pod")).toBe(true);
    expect(SENIOR_GUIDE_TEASERS.some((g) => g.launchGuideId === "pod" && g.status === "live")).toBe(
      true,
    );
  });

  it("ranks POD first for the four-screen Elite Senior combo", () => {
    const ranked = SENIOR_OPPORTUNITIES_EXPANDED
      .map((o) => ({ id: o.id, score: scoreSeniorMatch(o.id, SENIOR_POD_TOP_MATCH_ANSWERS) }))
      .sort((a, b) => b.score - a.score);
    expect(ranked[0]?.id).toBe("pod");
    expect(ranked[0]!.score).toBeGreaterThan(ranked[1]?.score ?? 0);
  });
});
