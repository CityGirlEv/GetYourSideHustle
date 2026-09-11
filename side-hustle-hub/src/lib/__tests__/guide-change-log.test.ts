import { describe, expect, it } from "vitest";
import {
  formatGuideChangeLogSummary,
  formatGuideChangeLogWhen,
  isGuideChangeLogAction,
} from "../guide-change-log";

describe("guide change log", () => {
  it("recognizes log actions", () => {
    expect(isGuideChangeLogAction("status")).toBe(true);
    expect(isGuideChangeLogAction("bulk_status")).toBe(true);
    expect(isGuideChangeLogAction("qa_pass")).toBe(true);
    expect(isGuideChangeLogAction("nope")).toBe(false);
  });

  it("summarizes status and review transitions", () => {
    expect(
      formatGuideChangeLogSummary({
        id: 1,
        guideId: "gardening-club",
        changedAt: "2026-09-10T12:00:00.000Z",
        changedBy: "Evelyn Irving",
        action: "status",
        fromStatus: "active",
        toStatus: "reviewed_by_dev",
      }),
    ).toBe("Status: Active → Reviewed by Dev");

    expect(
      formatGuideChangeLogSummary({
        id: 2,
        guideId: "gardening-club",
        changedAt: "2026-09-10T12:00:00.000Z",
        changedBy: "Lyriq",
        action: "qa_pass",
        fromStatus: "active",
        toStatus: "reviewed_by_qa",
      }),
    ).toBe("QA Pass: Active → Reviewed by QA / No Changes");
  });

  it("summarizes membership and bulk updates", () => {
    expect(
      formatGuideChangeLogSummary({
        id: 3,
        guideId: "a",
        changedAt: "2026-09-10T12:00:00.000Z",
        changedBy: "Evelyn",
        action: "min_tier",
        detail: { minTier: "pro" },
      }),
    ).toBe("Membership floor → pro");

    expect(
      formatGuideChangeLogSummary({
        id: 4,
        guideId: "a",
        changedAt: "2026-09-10T12:00:00.000Z",
        changedBy: "Evelyn",
        action: "bulk_status",
        fromStatus: "pending",
        toStatus: "active",
      }),
    ).toBe("Bulk status: Pending / Needs Further Review → Active");
  });

  it("formats timestamps for display", () => {
    const label = formatGuideChangeLogWhen("2026-09-10T18:30:00.000Z");
    expect(label.length).toBeGreaterThan(5);
    expect(label).not.toBe("2026-09-10T18:30:00.000Z");
  });
});
