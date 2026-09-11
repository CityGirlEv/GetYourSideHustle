import { describe, expect, it } from "vitest";
import { guidesForAudience } from "../kids-guides";
import { LAUNCH_GUIDES } from "../launch-guides";
import { hustleById, SIDE_HUSTLES, hustleCardPeek } from "../side-hustle-catalog";
import {
  KIDS_FREE_GUIDE_IDS,
  kidsLibraryMinTier,
  MAX_FREE_GUIDES_PER_AGE,
} from "../age-library-tiers";

/** Mirrors FreeGuidesPage kidsGuidesAll construction. */
function kidsGuidesAllLikePage(): { id: string }[] {
  const fromLaunch = LAUNCH_GUIDES.filter((g) => hustleById(g.id)?.audiences.includes("kids"));
  const seen = new Set(fromLaunch.map((g) => g.id));
  const extras = SIDE_HUSTLES.filter((h) => h.audiences.includes("kids") && !seen.has(h.id));
  const launchIds = [...fromLaunch.map((g) => g.id), ...extras.map((h) => h.id)];
  const kidsAll = guidesForAudience("kids");
  const seen2 = new Set(launchIds);
  return [
    ...launchIds.map((id) => ({ id })),
    ...kidsAll.filter((g) => !seen2.has(g.id)).map((g) => ({ id: g.id })),
  ];
}

describe("Kids Free library count", () => {
  it("shows exactly 10 Free guides in the Kids Guides library (page merge)", () => {
    const all = kidsGuidesAllLikePage();
    const freeIds = [...new Set(all.filter((g) => kidsLibraryMinTier(g.id) === "free").map((g) => g.id))].sort();
    expect(KIDS_FREE_GUIDE_IDS.length).toBe(MAX_FREE_GUIDES_PER_AGE);
    expect(freeIds, `free=${freeIds.join(", ")}`).toHaveLength(10);
    for (const id of KIDS_FREE_GUIDE_IDS) {
      expect(freeIds).toContain(id);
    }
  });
});
