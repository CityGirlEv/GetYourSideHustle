import { describe, expect, it } from "vitest";
import { LAUNCH_GUIDES } from "../launch-guides";
import { guidesForAudience } from "../kids-guides";
import { SENIOR_GUIDE_TEASERS, orderedSeniorGuides } from "../seniors-content";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import {
  adultLibraryMinTier,
  kidsLibraryMinTier,
  juniorLibraryMinTier,
  seniorLibraryMinTier,
} from "../age-library-tiers";
import { guideTierSortRank, type GuideMinTier } from "../guide-access";

function uniqueLibraryTiers(): Record<GuideMinTier, string[]> {
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

  const out: Record<GuideMinTier, string[]> = { free: [], starter: [], pro: [], elite: [] };
  for (const [id, tier] of byId) out[tier].push(id);
  for (const k of Object.keys(out) as GuideMinTier[]) out[k].sort();
  return out;
}

describe("library membership balance", () => {
  it("keeps Starter near 40 after moving a Starter chunk to Pro", () => {
    const t = uniqueLibraryTiers();
    expect(t.free.length).toBeGreaterThanOrEqual(18);
    expect(t.free.length).toBeLessThanOrEqual(22);
    // Target: ~40 Starter, Pro absorbs ~22 former Starter guides
    expect(t.starter.length, `starter=${t.starter.length}`).toBeGreaterThanOrEqual(35);
    expect(t.starter.length, `starter=${t.starter.length}`).toBeLessThanOrEqual(48);
    expect(t.pro.length, `pro=${t.pro.length}`).toBeGreaterThanOrEqual(28);
    expect(t.pro.length).toBeGreaterThan(t.starter.length - 20);
  });
});
