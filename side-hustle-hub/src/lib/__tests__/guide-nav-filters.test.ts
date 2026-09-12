import { describe, expect, it } from "vitest";
import type { GuideCatalogStateMap } from "../guide-catalog-state";
import {
  countGuideNavByAge,
  countGuideNavByAssignee,
  countGuideNavByMembership,
  countGuideNavByStatus,
  defaultLibraryStatusFilters,
  DEFAULT_STAFF_LIBRARY_STATUS_FILTERS,
  filterGuideNavItems,
  guideMatchesAnyAgeFilter,
  guideMatchesAnyAssigneeFilter,
  guideMatchesAnyMembershipFilter,
  guideMatchesAnyStatusFilter,
} from "../guide-nav-filters";
import type { HustleAgeGroup } from "../side-hustle-catalog";

const states: GuideCatalogStateMap = {
  a: {
    guideId: "a",
    status: "active",
    published: true,
    deleted: false,
    custom: false,
    patch: { assignee: "tina" },
  },
  b: {
    guideId: "b",
    status: "pending",
    published: false,
    deleted: false,
    custom: false,
    patch: { assignee: "evelyn" },
  },
  c: {
    guideId: "c",
    status: "inactive",
    published: false,
    deleted: false,
    custom: false,
    patch: {},
  },
  d: {
    guideId: "d",
    status: "active",
    published: true,
    deleted: false,
    custom: false,
    patch: { assignee: "tina+lyriq" },
  },
  e: {
    guideId: "e",
    status: "reviewed_by_qa",
    published: false,
    deleted: false,
    custom: false,
    patch: {},
  },
};

const guides = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }];

const audiences: Record<string, HustleAgeGroup[]> = {
  a: ["kids", "junior"],
  b: ["adult"],
  c: ["senior", "adult"],
  d: ["kids"],
  e: ["adult"],
};

const tiers = {
  a: "free" as const,
  b: "starter" as const,
  c: "pro" as const,
  d: "elite" as const,
  e: "free" as const,
};

describe("filterGuideNavItems", () => {
  const base = {
    catalogStates: states,
    audiencesOf: (id: string) => audiences[id] ?? [],
    minTierOf: (id: string) => tiers[id as keyof typeof tiers] ?? "free",
  };

  it("hides pending/inactive from non-admins; shows Active + Reviewed by QA", () => {
    const next = filterGuideNavItems(guides, {
      ...base,
      ageFilters: ["all"],
      statusFilters: ["all"],
      membershipFilters: ["all"],
      isAdmin: false,
    });
    expect(next.map((g) => g.id)).toEqual(["a", "d", "e"]);
  });

  it("lets admins filter by Active / Pending / Reviewed by QA / Inactive", () => {
    const pending = filterGuideNavItems(guides, {
      ...base,
      ageFilters: ["all"],
      statusFilters: ["pending"],
      membershipFilters: ["all"],
      isAdmin: true,
    });
    expect(pending.map((g) => g.id)).toEqual(["b"]);

    const reviewed = filterGuideNavItems(guides, {
      ...base,
      ageFilters: ["all"],
      statusFilters: ["reviewed_by_qa"],
      membershipFilters: ["all"],
      isAdmin: true,
    });
    expect(reviewed.map((g) => g.id)).toEqual(["e"]);
  });

  it("filters by age and membership together", () => {
    const next = filterGuideNavItems(guides, {
      ...base,
      ageFilters: ["adult"],
      statusFilters: ["all"],
      membershipFilters: ["pro"],
      isAdmin: true,
    });
    expect(next.map((g) => g.id)).toEqual(["c"]);
  });

  it("ORs multi-selected ages, memberships, and statuses", () => {
    const next = filterGuideNavItems(guides, {
      ...base,
      ageFilters: ["kids", "adult"],
      statusFilters: ["pending", "inactive"],
      membershipFilters: ["starter", "pro"],
      isAdmin: true,
    });
    expect(next.map((g) => g.id).sort()).toEqual(["b", "c"]);
  });
  it("ORs Active with Not Reviewed / Reviewed (union of matches)", () => {
    const notReviewedOrActive = filterGuideNavItems(guides, {
      ...base,
      ageFilters: ["all"],
      statusFilters: ["active", "not_reviewed"],
      membershipFilters: ["all"],
      isAdmin: true,
    });
    /** Active (a,d,e) ∪ not reviewed (a,c,d) → a, c, d, e. Pending (b) is Reviewed. */
    expect(notReviewedOrActive.map((g) => g.id).sort()).toEqual(["a", "c", "d", "e"]);

    const reviewedOrActive = filterGuideNavItems(guides, {
      ...base,
      ageFilters: ["all"],
      statusFilters: ["active", "reviewed"],
      membershipFilters: ["all"],
      isAdmin: true,
    });
    /** Active (a,d,e) ∪ reviewed (b pending + e) → a, b, d, e. */
    expect(reviewedOrActive.map((g) => g.id).sort()).toEqual(["a", "b", "d", "e"]);
  });
});

describe("guideMatchesAny* helpers", () => {
  it("treats empty or all as unfiltered", () => {
    expect(guideMatchesAnyAgeFilter(["adult"], ["all"])).toBe(true);
    expect(guideMatchesAnyAgeFilter(["adult"], [])).toBe(true);
    expect(guideMatchesAnyMembershipFilter("pro", ["all"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("pending", ["all"])).toBe(true);
  });

  it("matches when any selected facet hits", () => {
    expect(guideMatchesAnyAgeFilter(["kids", "adult"], ["senior", "kids"])).toBe(true);
    expect(guideMatchesAnyMembershipFilter("elite", ["free", "elite"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("pending", ["inactive", "pending"])).toBe(true);
  });

  it("ORs Active with Not Reviewed / Reviewed", () => {
    expect(guideMatchesAnyStatusFilter("active", ["active", "not_reviewed"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("reviewed_by_qa", ["active", "not_reviewed"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("pending", ["active", "not_reviewed"])).toBe(false);
    expect(guideMatchesAnyStatusFilter("inactive", ["active", "reviewed"])).toBe(false);

    expect(guideMatchesAnyStatusFilter("reviewed_by_qa", ["active", "reviewed"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("reviewed_by_dev", ["active", "reviewed"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("active", ["active", "reviewed"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("pending", ["active", "reviewed"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("fixed_rereview", ["reviewed"])).toBe(false);
    expect(guideMatchesAnyStatusFilter("fixed_rereview", ["not_reviewed"])).toBe(true);
    expect(guideMatchesAnyStatusFilter("fixed_rereview", ["pending"])).toBe(false);
    expect(guideMatchesAnyStatusFilter("fixed_rereview", ["fixed_rereview"])).toBe(true);
  });
});

describe("guide nav counts", () => {
  it("counts age overlaps and statuses", () => {
    expect(countGuideNavByAge(guides, (id) => audiences[id] ?? []).adult).toBe(3);
    /** Active filter = live (Active + Reviewed by QA/Dev). */
    expect(countGuideNavByStatus(guides, states).active).toBe(3);
    expect(countGuideNavByStatus(guides, states).reviewed_by_qa).toBe(1);
    expect(countGuideNavByStatus(guides, states).not_reviewed).toBe(3);
    expect(countGuideNavByStatus(guides, states).reviewed).toBe(2);
    expect(countGuideNavByMembership(guides, (id) => tiers[id as keyof typeof tiers]).free).toBe(2);
  });

  it("filters Not Reviewed guides", () => {
    const next = filterGuideNavItems(guides, {
      catalogStates: states,
      audiencesOf: (id) => audiences[id] ?? [],
      minTierOf: (id) => tiers[id as keyof typeof tiers] ?? "free",
      ageFilters: ["all"],
      statusFilters: ["not_reviewed"],
      membershipFilters: ["all"],
      isAdmin: true,
    });
    expect(next.map((g) => g.id).sort()).toEqual(["a", "c", "d"]);
  });

  it("applies status filters to the nav list even when isAdmin is false", () => {
    const next = filterGuideNavItems(guides, {
      catalogStates: states,
      audiencesOf: (id) => audiences[id] ?? [],
      minTierOf: (id) => tiers[id as keyof typeof tiers] ?? "free",
      ageFilters: ["all"],
      statusFilters: ["active"],
      membershipFilters: ["all"],
      isAdmin: false,
    });
    /** Non-admin viewer pool is Active + Reviewed by QA; Active filter keeps the live set. */
    expect(next.map((g) => g.id).sort()).toEqual(["a", "d", "e"]);
  });

  it("filters by assignee and only counts QAs with assignments", () => {
    const counts = countGuideNavByAssignee(guides, states);
    expect(counts.unassigned).toBe(2);
    expect(counts.byId.tina).toBe(2);
    expect(counts.byId.evelyn).toBe(1);
    expect(counts.byId.lyriq).toBe(1);
    expect(counts.byId.candace).toBeUndefined();

    expect(guideMatchesAnyAssigneeFilter([], ["unassigned"])).toBe(true);
    expect(guideMatchesAnyAssigneeFilter(["tina"], ["unassigned"])).toBe(false);
    expect(guideMatchesAnyAssigneeFilter(["tina"], ["tina", "evelyn"])).toBe(true);

    const tinaOnly = filterGuideNavItems(guides, {
      catalogStates: states,
      audiencesOf: (id) => audiences[id] ?? [],
      minTierOf: (id) => tiers[id as keyof typeof tiers] ?? "free",
      ageFilters: ["all"],
      statusFilters: ["all"],
      membershipFilters: ["all"],
      assigneeFilters: ["tina"],
      isAdmin: true,
    });
    expect(tinaOnly.map((g) => g.id).sort()).toEqual(["a", "d"]);

    const unassigned = filterGuideNavItems(guides, {
      catalogStates: states,
      audiencesOf: (id) => audiences[id] ?? [],
      minTierOf: (id) => tiers[id as keyof typeof tiers] ?? "free",
      ageFilters: ["all"],
      statusFilters: ["all"],
      membershipFilters: ["all"],
      assigneeFilters: ["unassigned"],
      isAdmin: true,
    });
    expect(unassigned.map((g) => g.id).sort()).toEqual(["c", "e"]);
  });
});

describe("defaultLibraryStatusFilters", () => {
  it("defaults staff library admin/listing to Pending / Needs Further Review", () => {
    expect(DEFAULT_STAFF_LIBRARY_STATUS_FILTERS).toEqual(["pending"]);
    expect(defaultLibraryStatusFilters(true)).toEqual(["pending"]);
  });

  it("defaults members to Show All", () => {
    expect(defaultLibraryStatusFilters(false)).toEqual(["all"]);
  });
});
