/**
 * Guide Library status-tab counts.
 * Pass a filtered `poolIds` (age / membership / search) so Active+Pending+…
 * match the guides visible under the current non-status filters.
 */

import {
  getGuideVisibilityStatus,
  guideMatchesStatusFilter,
  type GuideCatalogStateMap,
} from "./guide-catalog-state";
import type { GuideNavStatusFilter } from "./guide-nav-filters";
import { uniqueGuideLibraryIds } from "./guide-library-pool";

export type GuideStatusTabCounts = Record<GuideNavStatusFilter, number>;

export function countGuideLibraryByStatus(
  catalogStates: GuideCatalogStateMap | null | undefined,
  poolIds: readonly string[] = uniqueGuideLibraryIds(),
): GuideStatusTabCounts {
  const counts: GuideStatusTabCounts = {
    all: poolIds.length,
    active: 0,
    pending: 0,
    fixed_rereview: 0,
    not_reviewed: 0,
    reviewed: 0,
    reviewed_by_qa: 0,
    reviewed_by_dev: 0,
    inactive: 0,
  };
  for (const id of poolIds) {
    const status = getGuideVisibilityStatus(id, catalogStates);
    if (status === "pending") counts.pending += 1;
    else if (status === "fixed_rereview") counts.fixed_rereview += 1;
    else if (status === "reviewed_by_qa") counts.reviewed_by_qa += 1;
    else if (status === "reviewed_by_dev") counts.reviewed_by_dev += 1;
    if (guideMatchesStatusFilter(status, "active")) counts.active += 1;
    if (guideMatchesStatusFilter(status, "inactive")) counts.inactive += 1;
    if (guideMatchesStatusFilter(status, "not_reviewed")) counts.not_reviewed += 1;
    if (guideMatchesStatusFilter(status, "reviewed")) counts.reviewed += 1;
  }
  return counts;
}

/**
 * Exclusive status partition (plain Active + Pending + Reviewed QA/Dev + exclusive Inactive).
 * `counts.inactive` is held-Inactive (Pending + exclusive Inactive), matching the chip —
 * subtract Pending so the partition still equals `counts.all`.
 */
export function sumGuideStatusBuckets(counts: GuideStatusTabCounts): number {
  const exclusiveInactive = Math.max(0, counts.inactive - counts.pending);
  const plainActive = Math.max(
    0,
    counts.all -
      counts.pending -
      counts.fixed_rereview -
      counts.reviewed_by_qa -
      counts.reviewed_by_dev -
      exclusiveInactive,
  );
  return (
    plainActive +
    counts.pending +
    counts.fixed_rereview +
    counts.reviewed_by_qa +
    counts.reviewed_by_dev +
    exclusiveInactive
  );
}
