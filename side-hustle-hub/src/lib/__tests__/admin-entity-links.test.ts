import { describe, expect, it } from "vitest";
import {
  labelAndOptsForEntity,
  mergeEntityCrossLinks,
  withLiveEntityTitle,
  type AdminEntityLinkRow,
} from "../admin-entity-links";

describe("admin entity link titles", () => {
  it("includes live task and test titles in labels", () => {
    const task = labelAndOptsForEntity(
      { kind: "task", id: "T-100" },
      { task: { "T-100": "Ship newsletter" } },
    );
    expect(task.label).toBe("Task T-100 · Ship newsletter");

    const test = labelAndOptsForEntity(
      { kind: "test", id: "VIDEO-003" },
      { test: { "VIDEO-003": "First Short QA" } },
    );
    expect(test.label).toBe("Test VIDEO-003 · First Short QA");
  });

  it("refreshes catalog link labels when titles change", () => {
    const catalog = [
      { label: "Task T-1", opts: { tab: "tasks" as const, taskId: "T-1" } },
    ];
    const before = withLiveEntityTitle(catalog[0], { task: { "T-1": "Old name" } });
    const after = withLiveEntityTitle(catalog[0], { task: { "T-1": "New name" } });
    expect(before.label).toBe("Task T-1 · Old name");
    expect(after.label).toBe("Task T-1 · New name");
  });

  it("merges manual links with live titles and respects suppressions", () => {
    const self = { kind: "cf" as const, id: "sl-s3-yt-first-short" };
    const catalog = [
      { label: "Task T-OLD", opts: { tab: "tasks" as const, taskId: "T-SL-S3-YT-FIRST-SHORT" } },
      { label: "Test VIDEO-003", opts: { tab: "testing" as const, testId: "VIDEO-003" } },
    ];
    const rows: AdminEntityLinkRow[] = [
      {
        id: "1",
        aKind: "cf",
        aId: "sl-s3-yt-first-short",
        bKind: "test",
        bId: "VIDEO-003",
        suppressed: true,
      },
      {
        id: "2",
        aKind: "cf",
        aId: "sl-s3-yt-first-short",
        bKind: "task",
        bId: "T-EXTRA",
        suppressed: false,
      },
    ];
    const merged = mergeEntityCrossLinks(self, catalog, rows, {
      task: {
        "T-SL-S3-YT-FIRST-SHORT": "YouTube Short task",
        "T-EXTRA": "Extra ops task",
      },
      test: { "VIDEO-003": "Should be hidden" },
    });
    expect(merged.some((l) => l.target.id === "VIDEO-003")).toBe(false);
    expect(merged.find((l) => l.target.id === "T-SL-S3-YT-FIRST-SHORT")?.label).toBe(
      "Task T-SL-S3-YT-FIRST-SHORT · YouTube Short task",
    );
    expect(merged.find((l) => l.target.id === "T-EXTRA")?.label).toBe(
      "Task T-EXTRA · Extra ops task",
    );
  });
});
