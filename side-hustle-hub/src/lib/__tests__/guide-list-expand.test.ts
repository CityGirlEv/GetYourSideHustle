import { describe, expect, it } from "vitest";
import {
  exactMembershipTabCounts,
  filterGuidesByExactMembershipTier,
  filterGuidesByMembershipSelection,
  freeAgeMembershipTabCounts,
  tierGroupOpenState,
  toggleFilterSelection,
  uniqueGuidesByLowestTier,
} from "../guide-list-expand";

describe("guide list expand/collapse all", () => {
  it("opens every membership tier group", () => {
    expect(tierGroupOpenState(true)).toEqual({
      free: true,
      starter: true,
      pro: true,
      elite: true,
    });
  });

  it("collapses every membership tier group", () => {
    expect(tierGroupOpenState(false)).toEqual({
      free: false,
      starter: false,
      pro: false,
      elite: false,
    });
  });
});

describe("exact membership filter", () => {
  const guides = [
    { id: "a", tier: "free" as const },
    { id: "b", tier: "starter" as const },
    { id: "c", tier: "pro" as const },
    { id: "d", tier: "elite" as const },
    { id: "e", tier: "elite" as const },
  ];
  const minOf = (g: (typeof guides)[number]) => g.tier;

  it("Show All includes every unique guide including Free", () => {
    expect(filterGuidesByExactMembershipTier(guides, "all", minOf).map((g) => g.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("multi-select Pro + Elite returns Pro guides plus all tiers (Elite = all)", () => {
    expect(
      filterGuidesByMembershipSelection(guides, ["pro", "elite"], minOf).map((g) => g.id),
    ).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("Elite lists every guide", () => {
    expect(filterGuidesByExactMembershipTier(guides, "elite", minOf).map((g) => g.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("Starter lists Free + Starter (Starter plan)", () => {
    expect(filterGuidesByExactMembershipTier(guides, "starter", minOf).map((g) => g.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("Pro lists Starter + Pro only", () => {
    expect(filterGuidesByExactMembershipTier(guides, "pro", minOf).map((g) => g.id)).toEqual([
      "b",
      "c",
    ]);
  });

  it("keeps only Free guides for Free", () => {
    expect(filterGuidesByExactMembershipTier(guides, "free", minOf).map((g) => g.id)).toEqual([
      "a",
    ]);
  });

  it("membership counts match plan contents", () => {
    expect(exactMembershipTabCounts(guides, minOf)).toEqual({
      all: 5,
      free: 1,
      starter: 2,
      pro: 2,
      elite: 5,
    });
  });

  it("sorts Pro tab with Pro guides before Starter", async () => {
    const { sortGuidesForMembershipTab } = await import("../guide-list-expand");
    const filtered = filterGuidesByExactMembershipTier(guides, "pro", minOf);
    expect(
      sortGuidesForMembershipTab("pro", filtered, minOf, (g) => g.id).map((g) => g.id),
    ).toEqual(["c", "b"]);
  });

  it("sorts Elite tab highest-tier first", async () => {
    const { sortGuidesForMembershipTab } = await import("../guide-list-expand");
    expect(
      sortGuidesForMembershipTab("elite", guides, minOf, (g) => g.id).map((g) => g.id),
    ).toEqual(["d", "e", "c", "b", "a"]);
  });
});

describe("freeAgeMembershipTabCounts", () => {
  it("puts the Free total on Show All and Free; paid tabs are N/A (not zero)", () => {
    expect(freeAgeMembershipTabCounts(20)).toEqual({
      all: 20,
      free: 20,
      starter: null,
      pro: null,
      elite: null,
    });
  });
});

describe("membershipTabEnabledOnAgeFree", () => {
  it("allows Show All and Free only", async () => {
    const { membershipTabEnabledOnAgeFree } = await import("../guide-list-expand");
    expect(membershipTabEnabledOnAgeFree("all")).toBe(true);
    expect(membershipTabEnabledOnAgeFree("free")).toBe(true);
    expect(membershipTabEnabledOnAgeFree("starter")).toBe(false);
    expect(membershipTabEnabledOnAgeFree("pro")).toBe(false);
    expect(membershipTabEnabledOnAgeFree("elite")).toBe(false);
  });
});

describe("clampMembershipFiltersForAges", () => {
  it("keeps Starter when Adults is selected", async () => {
    const { clampMembershipFiltersForAges } = await import("../guide-list-expand");
    expect(clampMembershipFiltersForAges(["starter"], ["adult"])).toEqual(["starter"]);
    expect(clampMembershipFiltersForAges(["starter", "pro"], ["adult", "senior"])).toEqual([
      "starter",
      "pro",
    ]);
  });

  it("clamps paid membership to Free for Kids/Teens-only ages", async () => {
    const { clampMembershipFiltersForAges } = await import("../guide-list-expand");
    expect(clampMembershipFiltersForAges(["starter"], ["kids"])).toEqual(["free"]);
    expect(clampMembershipFiltersForAges(["pro"], ["junior", "kids"])).toEqual(["free"]);
    expect(clampMembershipFiltersForAges(["all"], ["kids"])).toEqual(["all"]);
  });
});

describe("uniqueGuidesByLowestTier", () => {
  it("dedupes by id and keeps the lowest membership tier", () => {
    const merged = uniqueGuidesByLowestTier([
      [
        { id: "a", tier: "starter", item: "adult-a" },
        { id: "b", tier: "pro", item: "adult-b" },
      ],
      [
        { id: "a", tier: "free", item: "kids-a" },
        { id: "c", tier: "elite", item: "kids-c" },
      ],
    ]);
    expect(merged.map((e) => ({ id: e.id, tier: e.tier, item: e.item }))).toEqual([
      { id: "a", tier: "free", item: "kids-a" },
      { id: "b", tier: "pro", item: "adult-b" },
      { id: "c", tier: "elite", item: "kids-c" },
    ]);
  });

  it("does not sort by itself — callers apply Free-first alphabetical order", () => {
    const merged = uniqueGuidesByLowestTier([
      [
        { id: "elite-1", tier: "elite", item: "e" },
        { id: "starter-1", tier: "starter", item: "s" },
        { id: "free-1", tier: "free", item: "f" },
        { id: "pro-1", tier: "pro", item: "p" },
      ],
    ]);
    expect(merged.map((e) => e.id)).toEqual(["elite-1", "starter-1", "free-1", "pro-1"]);
  });

  it("keeps the earlier batch card when tiers tie", () => {
    const merged = uniqueGuidesByLowestTier([
      [{ id: "x", tier: "free", item: "adult" }],
      [{ id: "x", tier: "free", item: "kids" }],
    ]);
    expect(merged).toEqual([{ id: "x", tier: "free", item: "adult" }]);
  });
});

describe("sortGuidesFreeFirstThenAlphabetical", () => {
  it("lists Free A–Z first, then all other guides A–Z by name", async () => {
    const { sortGuidesFreeFirstThenAlphabetical } = await import("../guide-list-expand");
    const guides = [
      { id: "e", name: "Zebra", tier: "elite" as const },
      { id: "f2", name: "Banana", tier: "free" as const },
      { id: "f1", name: "Apple", tier: "free" as const },
      { id: "s", name: "Mango", tier: "starter" as const },
      { id: "p", name: "Lemon", tier: "pro" as const },
    ];
    expect(
      sortGuidesFreeFirstThenAlphabetical(
        guides,
        (g) => g.tier,
        (g) => g.name,
      ).map((g) => g.id),
    ).toEqual(["f1", "f2", "p", "s", "e"]);
  });
});

describe("toggleFilterSelection", () => {
  it("adds a chip and drops exclusive Show All", () => {
    expect(toggleFilterSelection(["all"], "pro", ["all"])).toEqual(["pro"]);
  });

  it("toggles a second membership on", () => {
    expect(toggleFilterSelection(["pro"], "elite", ["all"])).toEqual(["pro", "elite"]);
  });

  it("keeps at least one selection when toggling off", () => {
    expect(toggleFilterSelection(["elite"], "elite", ["all"])).toEqual(["elite"]);
  });

  it("Show All replaces other selections", () => {
    expect(toggleFilterSelection(["pro", "elite"], "all", ["all"])).toEqual(["all"]);
  });
});

describe("toggleLibraryFilterSelection", () => {
  it("returns to Show All when the last specific option is unchecked", async () => {
    const { toggleLibraryFilterSelection } = await import("../guide-list-expand");
    expect(toggleLibraryFilterSelection(["pro"], "pro", "all")).toEqual(["all"]);
    expect(toggleLibraryFilterSelection(["kids", "adult"], "kids", "all")).toEqual(["adult"]);
    expect(toggleLibraryFilterSelection(["all"], "adult", "all")).toEqual(["adult"]);
    expect(toggleLibraryFilterSelection(["adult"], "kids", "all")).toEqual(["adult", "kids"]);
  });
});
