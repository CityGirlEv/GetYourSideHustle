import type { GuideMinTier } from "./guide-access";
import { guideNavAssigneesFromPatch } from "./guide-assignee";
import {
  filterGuidesForViewer,
  getGuideVisibilityStatus,
  guideMatchesStatusFilter,
  type GuideCatalogStateMap,
  type GuideVisibilityStatus,
} from "./guide-catalog-state";
import type { HustleAgeGroup } from "./side-hustle-catalog";

export type GuideNavAgeFilter = "all" | HustleAgeGroup;
export type GuideNavStatusFilter =
  | "all"
  | "not_reviewed"
  | "reviewed"
  | GuideVisibilityStatus;
export type GuideNavMembershipFilter = "all" | GuideMinTier;
/** All, Unassigned, or a human QA id that already has guide assignments. */
export type GuideNavAssigneeFilter = "all" | "unassigned" | string;

export type GuideNavStatusOption = Exclude<GuideNavStatusFilter, "all">;
export type GuideNavAgeOption = Exclude<GuideNavAgeFilter, "all">;
export type GuideNavMembershipOption = Exclude<GuideNavMembershipFilter, "all">;
export type GuideNavAssigneeOption = Exclude<GuideNavAssigneeFilter, "all">;

/** True when the selection is empty or explicitly All. */
export function guideNavFilterIsAll(selected: readonly string[]): boolean {
  return selected.length === 0 || selected.includes("all");
}

/**
 * Staff (Admin / QA) Library Admin + listing: open on Pending / Needs Further Review
 * so the review queue is front and center. Members keep Show All.
 */
export const DEFAULT_STAFF_LIBRARY_STATUS_FILTERS: readonly GuideNavStatusFilter[] = [
  "pending",
];

export function defaultLibraryStatusFilters(staffCatalog: boolean): GuideNavStatusFilter[] {
  return staffCatalog ? [...DEFAULT_STAFF_LIBRARY_STATUS_FILTERS] : ["all"];
}

export function guideMatchesAnyAgeFilter(
  audiences: readonly HustleAgeGroup[],
  selected: readonly GuideNavAgeFilter[],
): boolean {
  if (guideNavFilterIsAll(selected)) return true;
  return selected.some((f) => f !== "all" && audiences.includes(f));
}

export function guideMatchesAnyMembershipFilter(
  minTier: GuideMinTier,
  selected: readonly GuideNavMembershipFilter[],
): boolean {
  if (guideNavFilterIsAll(selected)) return true;
  return selected.some((f) => f !== "all" && f === minTier);
}

/**
 * Status chips: OR across all selected facets.
 * Active + Reviewed → live guides OR reviewed guides (union of both).
 */
export function guideMatchesAnyStatusFilter(
  status: GuideVisibilityStatus,
  selected: readonly GuideNavStatusFilter[],
): boolean {
  if (guideNavFilterIsAll(selected)) return true;
  const facets = selected.filter((f): f is GuideNavStatusOption => f !== "all");
  if (facets.length === 0) return true;
  return facets.some((f) => guideMatchesStatusFilter(status, f));
}

/** Assignee chips: OR across Unassigned and selected QA ids. */
export function guideMatchesAnyAssigneeFilter(
  assignees: readonly string[],
  selected: readonly GuideNavAssigneeFilter[],
): boolean {
  if (guideNavFilterIsAll(selected)) return true;
  return selected.some((f) => {
    if (f === "all") return false;
    if (f === "unassigned") return assignees.length === 0;
    return assignees.includes(f);
  });
}

/** Filter the guide-detail sidebar list by age, membership, assignee, and (admin) visibility status. */
export function filterGuideNavItems<T extends { id: string }>(
  guides: T[],
  opts: {
    ageFilters: readonly GuideNavAgeFilter[];
    statusFilters: readonly GuideNavStatusFilter[];
    membershipFilters: readonly GuideNavMembershipFilter[];
    assigneeFilters?: readonly GuideNavAssigneeFilter[];
    catalogStates: GuideCatalogStateMap;
    isAdmin: boolean;
    audiencesOf: (id: string) => readonly HustleAgeGroup[];
    minTierOf: (id: string) => GuideMinTier;
  },
): T[] {
  const visible = filterGuidesForViewer(guides, opts.catalogStates, { isAdmin: opts.isAdmin });
  const assigneeFilters = opts.assigneeFilters ?? ["all"];
  return visible.filter((g) => {
    if (!guideMatchesAnyAgeFilter(opts.audiencesOf(g.id), opts.ageFilters)) return false;
    if (!guideMatchesAnyMembershipFilter(opts.minTierOf(g.id), opts.membershipFilters)) return false;
    if (
      !guideMatchesAnyStatusFilter(
        getGuideVisibilityStatus(g.id, opts.catalogStates),
        opts.statusFilters,
      )
    ) {
      return false;
    }
    if (
      !guideMatchesAnyAssigneeFilter(
        guideNavAssigneesFromPatch(opts.catalogStates[g.id]?.patch?.assignee),
        assigneeFilters,
      )
    ) {
      return false;
    }
    return true;
  });
}

export function countGuideNavByAge<T extends { id: string }>(
  guides: T[],
  audiencesOf: (id: string) => readonly HustleAgeGroup[],
): Record<GuideNavAgeFilter, number> {
  const counts: Record<GuideNavAgeFilter, number> = {
    all: guides.length,
    kids: 0,
    junior: 0,
    adult: 0,
    senior: 0,
  };
  for (const g of guides) {
    for (const age of audiencesOf(g.id)) {
      if (age in counts) counts[age] += 1;
    }
  }
  return counts;
}

export function countGuideNavByStatus<T extends { id: string }>(
  guides: T[],
  catalogStates: GuideCatalogStateMap,
): Record<GuideNavStatusFilter, number> {
  const counts: Record<GuideNavStatusFilter, number> = {
    all: guides.length,
    active: 0,
    pending: 0,
    fixed_rereview: 0,
    not_reviewed: 0,
    reviewed: 0,
    reviewed_by_qa: 0,
    reviewed_by_dev: 0,
    inactive: 0,
  };
  for (const g of guides) {
    const status = getGuideVisibilityStatus(g.id, catalogStates);
    if (status === "pending") counts.pending += 1;
    else if (status === "fixed_rereview") counts.fixed_rereview += 1;
    else if (status === "inactive") counts.inactive += 1;
    else if (status === "reviewed_by_qa") counts.reviewed_by_qa += 1;
    else if (status === "reviewed_by_dev") counts.reviewed_by_dev += 1;
    if (guideMatchesStatusFilter(status, "active")) counts.active += 1;
    if (guideMatchesStatusFilter(status, "not_reviewed")) counts.not_reviewed += 1;
    if (guideMatchesStatusFilter(status, "reviewed")) counts.reviewed += 1;
  }
  return counts;
}

export function countGuideNavByMembership<T extends { id: string }>(
  guides: T[],
  minTierOf: (id: string) => GuideMinTier,
): Record<GuideNavMembershipFilter, number> {
  const counts: Record<GuideNavMembershipFilter, number> = {
    all: guides.length,
    free: 0,
    starter: 0,
    pro: 0,
    elite: 0,
  };
  for (const g of guides) {
    counts[minTierOf(g.id)] += 1;
  }
  return counts;
}

/**
 * Counts for assignee filter chips.
 * Only returns Unassigned + QAs who have ≥1 guide — never zero-assignment people.
 */
export function countGuideNavByAssignee<T extends { id: string }>(
  guides: T[],
  catalogStates: GuideCatalogStateMap,
): { all: number; unassigned: number; byId: Record<string, number> } {
  const byId: Record<string, number> = {};
  let unassigned = 0;
  for (const g of guides) {
    const assignees = guideNavAssigneesFromPatch(catalogStates[g.id]?.patch?.assignee);
    if (!assignees.length) {
      unassigned += 1;
      continue;
    }
    for (const id of assignees) {
      byId[id] = (byId[id] ?? 0) + 1;
    }
  }
  return { all: guides.length, unassigned, byId };
}
