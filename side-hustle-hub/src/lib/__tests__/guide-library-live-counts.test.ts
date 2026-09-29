import { describe, expect, it } from "vitest";
import {
  allAgesGuidesFreePerkTitle,
  applyLiveGuideLibraryCountsFromStates,
  copyMentionsFreeGuideAllotment,
  copyMentionsMembershipGuideAllotment,
  freeMembershipGuidesBanner,
  freeMembershipGuidesTag,
  freeMembershipTagline,
  getLiveGuideLibraryCounts,
  membershipFreeGuidesPerkTitle,
  membershipTiersWithAudienceGuideCounts,
  membershipTiersWithLiveFreeCount,
  numberedTierPerksWithAudienceGuideCount,
  numberedTierPerksWithLiveFreeCount,
} from "../guide-library-live-counts";
import { countFreeGuideLibrary, countGuidesForMembershipAudience } from "../guide-library-pool";
import type { GuideCatalogStateMap } from "../guide-catalog-state";

describe("guide-library-live-counts copy", () => {
  it("interpolates free allotment into Free Membership verbiage", () => {
    expect(freeMembershipGuidesTag(19)).toBe(
      "Free comes with 19 Side Hustle Guides to choose from",
    );
    expect(freeMembershipGuidesBanner(19)).toBe("19 Side Hustle Guides to choose from");
    expect(freeMembershipTagline(19)).toContain("Includes 19 Side Hustle Guides");
    expect(allAgesGuidesFreePerkTitle(7)).toBe(freeMembershipGuidesTag(7));
  });

  it("detects allotment copy for perk remapping", () => {
    expect(copyMentionsFreeGuideAllotment(freeMembershipGuidesTag(20))).toBe(true);
    expect(copyMentionsFreeGuideAllotment("Member guides unlock")).toBe(false);
    expect(copyMentionsMembershipGuideAllotment("Kids, Teens, Adults & Seniors Guides, ideas, etc.")).toBe(
      true,
    );
  });

  it("updates shared cache from catalog states", () => {
    const states: GuideCatalogStateMap = {};
    const next = applyLiveGuideLibraryCountsFromStates(states);
    expect(next.loaded).toBe(true);
    expect(getLiveGuideLibraryCounts().loaded).toBe(true);
    expect(typeof next.totalActive).toBe("number");
    expect(typeof next.freeActive).toBe("number");
  });
});

describe("membership live free guide count", () => {
  it("rewrites Free tier tagline and perk titles from live freeActive", () => {
    const freeN = 12;
    const tiers = membershipTiersWithLiveFreeCount(freeN);
    const free = tiers.find((t) => t.id === "free");
    expect(free?.tagline).toBe(freeMembershipTagline(freeN));

    const perks = numberedTierPerksWithLiveFreeCount("free", "adult", freeN);
    const allotment = perks.find((p) => copyMentionsMembershipGuideAllotment(p.title));
    expect(allotment?.title).toBe(membershipFreeGuidesPerkTitle(freeN, "adult"));
    expect(allotment?.numberedTitle).toContain(String(freeN));
  });

  it("static Free fallback matches inventory Free count (not a hard-coded 20)", () => {
    const inventoryFree = countFreeGuideLibrary();
    expect(inventoryFree).toBeGreaterThan(0);
    const tiers = membershipTiersWithLiveFreeCount(inventoryFree);
    expect(tiers[0]?.tagline).toContain(String(inventoryFree));
  });

  it("audience-scoped membership tiers embed that demographic’s guide counts", () => {
    const adultFree = countGuidesForMembershipAudience("adult", "free");
    const tiers = membershipTiersWithAudienceGuideCounts("adult");
    expect(tiers[0]?.tagline).toContain(String(adultFree));
    expect(tiers[0]?.tagline).toMatch(/Adults/i);

    const perks = numberedTierPerksWithAudienceGuideCount("free", "adult", adultFree);
    expect(perks.some((p) => p.title.includes(String(adultFree)))).toBe(true);
  });
});
