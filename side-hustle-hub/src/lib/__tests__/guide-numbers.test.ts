import { describe, expect, it } from "vitest";
import { applyBulkGuideAction, emptyGuideCatalogState, GUIDE_BULK_STATUS_OPTIONS } from "../guide-catalog-state";
import { uniqueGuideLibraryCount, uniqueGuideLibraryIds } from "../guide-library-pool";
import {
  formatGuideNumber,
  orderedGuideIdsForNumbering,
  testCaseIdWithNumber,
} from "../guide-numbers";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import {
  countGuideLibraryByStatus,
  sumGuideStatusBuckets,
} from "../guide-status-counts";
import { guideIsFreePlanGuide } from "../guide-catalog-state";
import { GUIDE_REVIEW_CASES } from "../gysh-guide-review-cases";

describe("guide library numbers + status counts", () => {
  it("pins every library guide to a fixed # and covers the full pool", () => {
    const ordered = orderedGuideIdsForNumbering();
    const unique = uniqueGuideLibraryIds();
    expect(ordered.length).toBeGreaterThanOrEqual(unique.length);
    expect(uniqueGuideLibraryCount()).toBe(117);
    expect(formatGuideNumber("rideshare")).toBe("018");
    expect(PINNED_GUIDE_NUMBERS.rideshare).toBe("018");
    expect(formatGuideNumber("handyman")).toBe("011");
    for (const id of unique) {
      expect(formatGuideNumber(id), id).toMatch(/^\d{3}$/);
    }
    // Numbers stay ordered ascending by pin
    for (let i = 1; i < ordered.length; i++) {
      expect(formatGuideNumber(ordered[i]!).localeCompare(formatGuideNumber(ordered[i - 1]!))).toBeGreaterThanOrEqual(0);
    }
  });

  it("does not renumber when a guide leaves Free (rideshare stays 018)", () => {
    expect(guideIsFreePlanGuide("rideshare")).toBe(false);
    expect(formatGuideNumber("rideshare")).toBe("018");
  });

  it("puts the guide # on GUIDE-REV test ids and titles", () => {
    expect(testCaseIdWithNumber("GUIDE-REV-launch-rideshare")).toBe(
      "#018 · GUIDE-REV-launch-rideshare",
    );
    expect(testCaseIdWithNumber("VIDEO-003-EVELYN")).toBe("VIDEO-003-EVELYN");
    const rideshareCase = GUIDE_REVIEW_CASES.find((c) => c.id.includes("rideshare"));
    expect(rideshareCase?.title).toMatch(/#018/);
    for (const c of GUIDE_REVIEW_CASES.filter((x) => x.id.startsWith("GUIDE-REV-"))) {
      expect(c.title, c.id).toMatch(/#\d{3}/);
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
    const id = "mothers-helper";
    const num = formatGuideNumber(id);
    expect(num).toBe("001");
    const deleted = applyBulkGuideAction(emptyGuideCatalogState(id), "delete");
    expect(deleted.deleted).toBe(true);
    expect(deleted.status).toBe("inactive");
    expect(formatGuideNumber(id)).toBe(num);
  });
});
