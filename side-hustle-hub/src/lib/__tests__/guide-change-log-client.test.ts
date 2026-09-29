import { describe, expect, it } from "vitest";
import { mapGuideChangeLogEntries } from "../guide-catalog-client";
import { formatGuideChangeLogSummary } from "../guide-change-log";

describe("mapGuideChangeLogEntries", () => {
  it("maps API rows into typed change-log entries", () => {
    const entries = mapGuideChangeLogEntries([
      {
        id: 9,
        guideId: "handyman",
        changedAt: "2026-09-10T18:00:00.000Z",
        changedBy: "Evelyn",
        action: "content",
        fromStatus: "active",
        toStatus: "active",
        detail: { fields: ["assignee", "steps"] },
      },
      {
        id: 10,
        guideId: "handyman",
        changedAt: "2026-09-10T19:00:00.000Z",
        changedBy: "Tina",
        action: "bogus",
        fromStatus: "pending",
        toStatus: "active",
      },
    ]);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.action).toBe("content");
    expect(entries[0]?.detail?.fields).toEqual(["assignee", "steps"]);
    expect(entries[1]?.action).toBe("status");
    expect(formatGuideChangeLogSummary(entries[0]!)).toBe(
      "Content updated (assignee, steps)",
    );
  });
});
