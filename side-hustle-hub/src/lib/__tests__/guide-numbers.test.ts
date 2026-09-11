import { describe, expect, it } from "vitest";
import { applyBulkGuideAction, emptyGuideCatalogState, GUIDE_BULK_STATUS_OPTIONS } from "../guide-catalog-state";
import { uniqueGuideLibraryCount, uniqueGuideLibraryIds } from "../guide-library-pool";
import {
  formatGuideNumber,
  orderedGuideIdsForNumbering,
} from "../guide-numbers";
import {
  countGuideLibraryByStatus,
  sumGuideStatusBuckets,
} from "../guide-status-counts";
import { guideIsFreePlanGuide } from "../guide-catalog-state";

describe("guide library numbers + status counts", () => {
  it("assigns Free guides 001+ then the rest; unique count matches library pool", () => {
    const ordered = orderedGuideIdsForNumbering();
    const unique = uniqueGuideLibraryIds();
    expect(ordered.length).toBe(unique.length);
    expect(uniqueGuideLibraryCount()).toBeGreaterThan(57);
    expect(uniqueGuideLibraryCount()).toBe(117);

    const freeFirst = ordered.filter((id) => guideIsFreePlanGuide(id));
    const freeCount = freeFirst.length;
    expect(freeCount).toBe(20);
    expect(formatGuideNumber(ordered[0]!)).toBe("001");
    expect(formatGuideNumber(ordered[freeCount - 1]!)).toBe(String(freeCount).padStart(3, "0"));
    expect(formatGuideNumber(ordered[freeCount]!)).toBe(String(freeCount + 1).padStart(3, "0"));

    // All free ids appear before any non-free id in the numbering order.
    let sawNonFree = false;
    for (const id of ordered) {
      const isFree = guideIsFreePlanGuide(id);
      if (!isFree) sawNonFree = true;
      else expect(sawNonFree).toBe(false);
    }
  });

  it("status buckets can be scoped to a membership/age pool", () => {
    const freeIds = uniqueGuideLibraryIds().filter((id) => guideIsFreePlanGuide(id));
    const counts = countGuideLibraryByStatus({}, freeIds);
    expect(counts.all).toBe(freeIds.length);
    expect(sumGuideStatusBuckets(counts)).toBe(freeIds.length);
    expect(counts.active).toBe(freeIds.length);
    expect(counts.inactive).toBe(0);
  });

  it("exposes bulk status options including Reviewed by QA", () => {
    expect(GUIDE_BULK_STATUS_OPTIONS.map((o) => o.value)).toEqual([
      "active",
      "pending",
      "fixed_rereview",
      "reviewed_by_qa",
      "reviewed_by_dev",
      "inactive",
    ]);
    expect(GUIDE_BULK_STATUS_OPTIONS.find((o) => o.value === "pending")?.label).toBe(
      "Pending / Needs Further Review",
    );
    expect(GUIDE_BULK_STATUS_OPTIONS.find((o) => o.value === "fixed_rereview")?.label).toBe(
      "Fixed/Re-Review",
    );
    expect(GUIDE_BULK_STATUS_OPTIONS.find((o) => o.value === "reviewed_by_qa")?.label).toBe(
      "Reviewed by QA / No Changes",
    );
  });

  it("delete soft-deletes to Inactive and keeps the guide number", () => {
    const id = orderedGuideIdsForNumbering()[0]!;
    const num = formatGuideNumber(id);
    expect(num).toBe("001");
    const deleted = applyBulkGuideAction(emptyGuideCatalogState(id), "delete");
    expect(deleted.deleted).toBe(true);
    expect(deleted.status).toBe("inactive");
    expect(formatGuideNumber(id)).toBe(num);
  });
});
