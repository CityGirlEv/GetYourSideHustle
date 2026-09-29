import { describe, expect, it } from "vitest";
import {
  effectiveGuideAudiences,
  effectiveGuideMembershipSelection,
  membershipSelectionFromMinTier,
  minTierFromMembershipSelection,
  normalizeMembershipSelection,
  toggleAgeAudienceSelection,
  toggleMembershipSelection,
} from "../guide-library-update";
import type { GuideCatalogStateMap } from "../guide-catalog-state";

describe("membership selection", () => {
  it("selects exactly one membership level (radio)", () => {
    expect(toggleMembershipSelection(["starter"], "elite")).toEqual(["elite"]);
    expect(toggleMembershipSelection(["free", "starter", "pro", "elite"], "pro")).toEqual([
      "pro",
    ]);
    expect(toggleMembershipSelection(["elite"], "free")).toEqual(["free"]);
    expect(minTierFromMembershipSelection(["pro"])).toBe("pro");
  });

  it("derives a single bubble from minTier", () => {
    expect(membershipSelectionFromMinTier("free")).toEqual(["free"]);
    expect(membershipSelectionFromMinTier("starter")).toEqual(["starter"]);
    expect(membershipSelectionFromMinTier("pro")).toEqual(["pro"]);
    expect(membershipSelectionFromMinTier("elite")).toEqual(["elite"]);
  });

  it("re-clicking the active level keeps that one check", () => {
    expect(toggleMembershipSelection(["starter"], "starter")).toEqual(["starter"]);
  });

  it("legacy multi-select patches display as the lowest (min) tier only", () => {
    const states: GuideCatalogStateMap = {
      g1: {
        guideId: "g1",
        status: "active",
        published: true,
        deleted: false,
        custom: false,
        patch: {
          membershipTiers: ["free", "starter", "pro", "elite"],
          minTier: "free",
        },
      },
    };
    expect(effectiveGuideMembershipSelection("g1", states, "elite")).toEqual(["free"]);
    expect(minTierFromMembershipSelection(["free", "starter", "pro", "elite"])).toBe("free");
  });

  it("reads a single membershipTiers patch as stored", () => {
    const states: GuideCatalogStateMap = {
      g1: {
        guideId: "g1",
        status: "active",
        published: true,
        deleted: false,
        custom: false,
        patch: { membershipTiers: ["pro"], minTier: "pro" },
      },
    };
    expect(effectiveGuideMembershipSelection("g1", states, "free")).toEqual(["pro"]);
  });

  it("normalize does not expand lone Elite to all", () => {
    expect(normalizeMembershipSelection(["elite"])).toEqual(["elite"]);
  });
});

describe("age audience selection", () => {
  it("requires at least one age group", () => {
    expect(toggleAgeAudienceSelection(["adult"], "adult")).toEqual(["adult"]);
  });

  it("toggles include/exclude", () => {
    expect(toggleAgeAudienceSelection(["adult"], "kids")).toEqual(["kids", "adult"]);
    expect(toggleAgeAudienceSelection(["kids", "adult"], "kids")).toEqual(["adult"]);
  });

  it("reads audiences from catalog patch", () => {
    const states: GuideCatalogStateMap = {
      g1: {
        guideId: "g1",
        status: "active",
        published: true,
        deleted: false,
        custom: false,
        patch: { audiences: ["kids", "junior"] },
      },
    };
    expect(effectiveGuideAudiences("g1", states, ["adult"])).toEqual([
      "kids",
      "junior",
    ]);
  });

  it("moves a guide between age lanes when Admin patches audiences", async () => {
    const { guideIdsForLibraryAudience, audiencesForLibraryGuideId } = await import(
      "../guide-library-pool"
    );
    const guideId = "airbnb";
    const before = audiencesForLibraryGuideId(guideId);
    expect(before.length).toBeGreaterThan(0);

    const states: GuideCatalogStateMap = {
      [guideId]: {
        guideId,
        status: "active",
        published: true,
        deleted: false,
        custom: false,
        patch: { audiences: ["senior"] },
      },
    };
    expect(audiencesForLibraryGuideId(guideId, states)).toEqual(["senior"]);
    expect(guideIdsForLibraryAudience("senior", states)).toContain(guideId);
    for (const age of ["kids", "junior", "adult"] as const) {
      if (!before.includes(age)) continue;
      expect(guideIdsForLibraryAudience(age, states)).not.toContain(guideId);
    }
  });
});
