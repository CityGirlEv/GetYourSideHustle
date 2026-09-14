import { describe, expect, it } from "vitest";
import {
  defaultStatusForGuide,
  filterGuidesForViewer,
  filterGuidesForWizardResults,
  getGuideVisibilityStatus,
  guideHeldVisibilityStatuses,
  guideHoldsActive,
  guideHoldsInactive,
  guideIsHiddenReviewStatus,
  guideMatchesStatusFilter,
  guideIsReviewed,
  guideStatusFromPublishedCode,
  guideStatusToPublishedCode,
  guidesDefaultPublished,
  guideStatusAfterVisibilityPick,
  isGuideEligibleForWizardResults,
  isGuidePublished,
  isGuideVisibleToPublic,
  toggleGuideReviewed,
  overlayGuideCatalogState,
  overlayGuideCatalogStateMap,
  mergeGuideCatalogStateMapsPreferNewer,
  withForcedFreeActivePolicy,
} from "../guide-catalog-state";
import { countGuideNavByAssignee } from "../guide-nav-filters";

describe("guidesDefaultPublished", () => {
  it("defaults Active so the public library lists guides without a D1 row", () => {
    expect(guidesDefaultPublished(false)).toBe(true);
    expect(guidesDefaultPublished(true)).toBe(true);
    expect(guidesDefaultPublished()).toBe(true);
  });
});

describe("guide catalog visibility", () => {
  it("shows guides with no state to the public (membership still gates access)", () => {
    expect(isGuideVisibleToPublic("beach-shell-jewelry", {})).toBe(true);
    expect(isGuidePublished("beach-shell-jewelry", {})).toBe(true);
    expect(defaultStatusForGuide("beach-shell-jewelry")).toBe("active");
  });

  it("keeps explicit Active on upgraded guides instead of forcing Pending", () => {
    const states = {
      babysitting: {
        guideId: "babysitting",
        status: "active" as const,
        published: true,
        deleted: false,
        custom: false,
        patch: {},
      },
      "mothers-helper": {
        guideId: "mothers-helper",
        status: "reviewed_by_dev" as const,
        published: true,
        deleted: false,
        custom: false,
        patch: {},
      },
    };
    expect(defaultStatusForGuide("babysitting")).toBe("active");
    expect(getGuideVisibilityStatus("babysitting", states)).toBe("active");
    expect(isGuideVisibleToPublic("babysitting", states)).toBe(true);
    expect(getGuideVisibilityStatus("mothers-helper", states)).toBe("reviewed_by_dev");
    expect(isGuideVisibleToPublic("mothers-helper", states)).toBe(true);
  });

  it("does not coerce a saved Active row back to Pending for leftover backfill ids", () => {
    expect(getGuideVisibilityStatus("airbnb", {
      airbnb: {
        guideId: "airbnb",
        status: "active",
        published: true,
        deleted: false,
        custom: false,
        patch: {},
      },
    })).toBe("active");
  });

  it("honors explicit Active / Inactive / Pending / In Review rows", () => {
    const states = {
      a: {
        guideId: "a",
        status: "active" as const,
        published: true,
        deleted: false,
        custom: false,
        patch: {},
      },
      b: {
        guideId: "b",
        status: "inactive" as const,
        published: false,
        deleted: false,
        custom: false,
        patch: {},
      },
      c: {
        guideId: "c",
        status: "pending" as const,
        published: false,
        deleted: false,
        custom: false,
        patch: {},
      },
      d: {
        guideId: "d",
        status: "reviewed_by_qa" as const,
        published: false,
        deleted: false,
        custom: false,
        patch: {},
      },
    };
    expect(isGuidePublished("a", states)).toBe(true);
    expect(isGuidePublished("b", states)).toBe(false);
    expect(isGuidePublished("c", states)).toBe(false);
    expect(isGuidePublished("d", states)).toBe(true);
    expect(getGuideVisibilityStatus("c", states)).toBe("pending");
    expect(getGuideVisibilityStatus("d", states)).toBe("reviewed_by_qa");
    expect(isGuideVisibleToPublic("c", states)).toBe(false);
    expect(isGuideVisibleToPublic("d", states)).toBe(true);
  });

  it("admins see inactive guides; members/guests see Active + Reviewed by QA", () => {
    const states = {
      hidden: {
        guideId: "hidden",
        status: "inactive" as const,
        published: false,
        deleted: false,
        custom: false,
        patch: {},
      },
      live: {
        guideId: "live",
        status: "active" as const,
        published: true,
        deleted: false,
        custom: false,
        patch: {},
      },
      qa: {
        guideId: "qa",
        status: "reviewed_by_qa" as const,
        published: false,
        deleted: false,
        custom: false,
        patch: {},
      },
    };
    const guides = [{ id: "hidden" }, { id: "also-new" }, { id: "live" }, { id: "qa" }];
    expect(filterGuidesForViewer(guides, states, { isAdmin: true })).toHaveLength(4);
    expect(filterGuidesForViewer(guides, states, { isAdmin: false }).map((g) => g.id)).toEqual([
      "also-new",
      "live",
      "qa",
    ]);
  });

  it("forced Free-active policy activates Free guides and leaves others inactive", () => {
    const forced = withForcedFreeActivePolicy({});
    const freeId = Object.keys(forced).find((id) => forced[id].status === "active");
    const inactiveId = Object.keys(forced).find((id) => forced[id].status === "inactive");
    expect(freeId).toBeTruthy();
    expect(inactiveId).toBeTruthy();
    expect(forced[freeId!].published).toBe(true);
    expect(forced[inactiveId!].published).toBe(false);
  });
});

describe("pending needs-further-review flags", () => {
  it("treats Pending as Reviewed and Inactive (still hidden from members)", () => {
    expect(guideIsReviewed("pending")).toBe(true);
    expect(guideIsReviewed("active")).toBe(false);
    expect(guideIsReviewed("inactive")).toBe(false);
    expect(guideIsReviewed("reviewed_by_qa")).toBe(true);
    expect(guideHoldsInactive("pending")).toBe(true);
    expect(guideHoldsInactive("inactive")).toBe(true);
    expect(guideHoldsInactive("fixed_rereview")).toBe(false);
    expect(guideHoldsInactive("active")).toBe(false);
    expect(guideMatchesStatusFilter("pending", "inactive")).toBe(true);
    expect(guideMatchesStatusFilter("inactive", "inactive")).toBe(true);
    expect(guideMatchesStatusFilter("fixed_rereview", "inactive")).toBe(false);
    expect(guideHeldVisibilityStatuses("pending")).toEqual(["pending", "inactive"]);
    expect(guideIsReviewed("fixed_rereview")).toBe(false);
    expect(guideHeldVisibilityStatuses("fixed_rereview")).toEqual(["fixed_rereview"]);
    expect(isGuideVisibleToPublic("c", {
      c: {
        guideId: "c",
        status: "pending",
        published: false,
        deleted: false,
        custom: false,
        patch: {},
      },
    })).toBe(false);
  });

  it("keeps Pending when picking Inactive, and goes live Reviewed when picking Active", () => {
    expect(guideStatusAfterVisibilityPick("active", "pending", false)).toBe("pending");
    expect(guideStatusAfterVisibilityPick("pending", "inactive", false)).toBe("pending");
    expect(guideStatusAfterVisibilityPick("pending", "active", false)).toBe("reviewed_by_qa");
    expect(guideStatusAfterVisibilityPick("pending", "active", true)).toBe("reviewed_by_dev");
    expect(guideStatusAfterVisibilityPick("pending", "fixed_rereview", false)).toBe("fixed_rereview");
    expect(guideStatusAfterVisibilityPick("fixed_rereview", "inactive", false)).toBe("inactive");
    expect(guideStatusAfterVisibilityPick("fixed_rereview", "active", false)).toBe("reviewed_by_qa");
    // Active always flips to Reviewed (Not Reviewed unchecked).
    expect(guideStatusAfterVisibilityPick("inactive", "active", false)).toBe("reviewed_by_qa");
    expect(guideStatusAfterVisibilityPick("inactive", "active", true)).toBe("reviewed_by_dev");
    expect(guideStatusAfterVisibilityPick("active", "active", false)).toBe("reviewed_by_qa");
    expect(guideStatusAfterVisibilityPick("reviewed_by_qa", "active", false)).toBe("reviewed_by_qa");
  });

  it("leaves Pending in place when Reviewed is already implied", () => {
    expect(toggleGuideReviewed("pending", true, false)).toBe("pending");
    expect(toggleGuideReviewed("fixed_rereview", true, false)).toBe("reviewed_by_qa");
    expect(toggleGuideReviewed("fixed_rereview", true, true)).toBe("reviewed_by_dev");
    expect(toggleGuideReviewed("pending", false, false)).toBe("active");
    expect(toggleGuideReviewed("active", true, false)).toBe("reviewed_by_qa");
  });

  it("holds Active + Reviewed only — not Fixed/Re-Review — after pass", () => {
    expect(guideHeldVisibilityStatuses("reviewed_by_qa")).toEqual(["active", "reviewed_by_qa"]);
    expect(guideHeldVisibilityStatuses("reviewed_by_dev")).toEqual(["active", "reviewed_by_dev"]);
    expect(guideHeldVisibilityStatuses("reviewed_by_qa")).not.toContain("fixed_rereview");
    expect(guideHeldVisibilityStatuses("reviewed_by_dev")).not.toContain("fixed_rereview");
  });

  it("sends Fixed/Re-Review back to QA as Not Reviewed after a Pending fix", () => {
    expect(guideIsHiddenReviewStatus("fixed_rereview")).toBe(true);
    expect(guideHoldsActive("fixed_rereview")).toBe(false);
    expect(guideStatusAfterVisibilityPick("pending", "fixed_rereview", false)).toBe("fixed_rereview");
    expect(guideHeldVisibilityStatuses("fixed_rereview")).not.toContain("inactive");
    expect(guideHeldVisibilityStatuses("fixed_rereview")).not.toContain("pending");
  });

  it("round-trips Fixed/Re-Review through the D1 published code", () => {
    expect(guideStatusToPublishedCode("fixed_rereview")).toBe(5);
    expect(guideStatusFromPublishedCode(5)).toBe("fixed_rereview");
    expect(isGuideVisibleToPublic("fixed", {
      fixed: {
        guideId: "fixed",
        status: "fixed_rereview",
        published: false,
        deleted: false,
        custom: false,
        patch: {},
      },
    })).toBe(false);
  });
});

describe("overlayGuideCatalogState", () => {
  const assigned = {
    guideId: "cleaning-service",
    status: "active" as const,
    published: true,
    deleted: false,
    custom: false,
    patch: { assignee: "evelyn" },
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("keeps stored assignee when a status-only save returns an empty patch", () => {
    const incoming = {
      ...assigned,
      status: "reviewed_by_qa" as const,
      patch: {},
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    const next = overlayGuideCatalogState(assigned, incoming);
    expect(next.patch.assignee).toBe("evelyn");
    expect(next.status).toBe("reviewed_by_qa");
  });

  it("allows clearing assignee when the stored patch explicitly sets empty", () => {
    const incoming = { ...assigned, patch: { assignee: "" } };
    expect(overlayGuideCatalogState(assigned, incoming).patch.assignee).toBe("");
  });

  it("bulk-overlays many guides without dropping assignees", () => {
    const prev = {
      a: { ...assigned, guideId: "a" },
      b: { ...assigned, guideId: "b", patch: { assignee: "tina" } },
    };
    const incoming = {
      a: { ...assigned, guideId: "a", status: "inactive" as const, published: false, patch: {} },
      b: { ...assigned, guideId: "b", status: "inactive" as const, published: false, patch: {} },
    };
    const merged = overlayGuideCatalogStateMap(prev, incoming);
    expect(merged.a.patch.assignee).toBe("evelyn");
    expect(merged.b.patch.assignee).toBe("tina");
    expect(merged.a.status).toBe("inactive");
    const counts = countGuideNavByAssignee([{ id: "a" }, { id: "b" }], merged);
    expect(counts.unassigned).toBe(0);
    expect(counts.byId.evelyn).toBe(1);
    expect(counts.byId.tina).toBe(1);
  });
});

describe("mergeGuideCatalogStateMapsPreferNewer", () => {
  it("does not drop D1 assignees when a newer bulk status row has an empty patch", () => {
    const remote = {
      a: {
        guideId: "a",
        status: "active" as const,
        published: true,
        deleted: false,
        custom: false,
        patch: { assignee: "tina" },
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    };
    const local = {
      a: {
        guideId: "a",
        status: "inactive" as const,
        published: false,
        deleted: false,
        custom: false,
        patch: {},
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    };
    const merged = mergeGuideCatalogStateMapsPreferNewer(remote, local);
    expect(merged.a.patch.assignee).toBe("tina");
    expect(merged.a.status).toBe("inactive");
  });
});
