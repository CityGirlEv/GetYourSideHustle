import { describe, expect, it } from "vitest";
import { LAUNCH_GUIDES } from "../launch-guides";
import { guidesForAudience } from "../kids-guides";
import { SENIOR_GUIDE_TEASERS, orderedSeniorGuides, isSeniorGuideFree } from "../seniors-content";
import { hustleById, SIDE_HUSTLES, FREE_WIZARD_HUSTLE_IDS } from "../side-hustle-catalog";
import {
  adultLibraryMinTier,
  kidsLibraryMinTier,
  juniorLibraryMinTier,
  seniorLibraryMinTier,
} from "../age-library-tiers";
import { guideTierSortRank, type GuideMinTier } from "../guide-access";

describe("Membership Free unique count", () => {
  it("rounds to 20 unique Free guides across ages (library merge)", () => {
    const byId = new Map<string, GuideMinTier>();
    const take = (id: string, tier: GuideMinTier) => {
      const prev = byId.get(id);
      if (!prev || guideTierSortRank(tier) < guideTierSortRank(prev)) byId.set(id, tier);
    };

    for (const g of LAUNCH_GUIDES) {
      if (hustleById(g.id)?.audiences.includes("adult")) take(g.id, adultLibraryMinTier(g.id));
    }
    for (const h of SIDE_HUSTLES) {
      if (h.audiences.includes("adult")) take(h.id, adultLibraryMinTier(h.id));
    }

    for (const g of guidesForAudience("kids")) take(g.id, kidsLibraryMinTier(g.id));
    for (const h of SIDE_HUSTLES.filter((x) => x.audiences.includes("kids"))) {
      take(h.id, kidsLibraryMinTier(h.id));
    }

    for (const g of guidesForAudience("junior")) take(g.id, juniorLibraryMinTier(g.id));
    for (const h of SIDE_HUSTLES.filter((x) => x.audiences.includes("junior"))) {
      take(h.id, juniorLibraryMinTier(h.id));
    }

    for (const g of orderedSeniorGuides(SENIOR_GUIDE_TEASERS)) {
      take(g.id, seniorLibraryMinTier(g.id, g.launchGuideId));
    }
    for (const h of SIDE_HUSTLES.filter((x) => x.audiences.includes("senior"))) {
      take(h.id, seniorLibraryMinTier(h.id));
    }

    const freeIds = [...byId.entries()].filter(([, t]) => t === "free").map(([id]) => id).sort();
    expect(FREE_WIZARD_HUSTLE_IDS).toContain("leaf-raking");
    expect(freeIds).toContain("leaf-raking");
    expect(freeIds.length, `free ids: ${freeIds.join(", ")}`).toBe(20);
  });
});
