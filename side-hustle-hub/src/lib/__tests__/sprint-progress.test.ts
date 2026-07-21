import { describe, expect, it } from "vitest";
import { currentSprintIndex } from "../gysh-sprints";
import { progressPercent, summarizeBoardProgress } from "../sprint-progress";
import type { BoardCard } from "../gysh-sprint-board";

describe("sprint progress helpers", () => {
  it("computes percent safely", () => {
    expect(progressPercent(0, 0)).toBe(0);
    expect(progressPercent(1, 4)).toBe(25);
    expect(progressPercent(3, 3)).toBe(100);
  });

  it("clamps current sprint index to the plan range", () => {
    expect(currentSprintIndex(new Date(2026, 6, 14))).toBe(0);
    expect(currentSprintIndex(new Date(2025, 0, 1))).toBe(0);
    expect(currentSprintIndex(new Date(2030, 0, 1))).toBe(7);
  });

  it("summarizes current sprint and overall project excluding backlog and Plan", () => {
    const cards: BoardCard[] = [
      {
        key: "a",
        source: "task",
        sourceId: "T-1",
        title: "A",
        notes: "",
        owner: "Tina",
        sprint: 0,
        status: "done",
        kindLabel: "Task",
        kindColor: "#000",
      },
      {
        key: "b",
        source: "task",
        sourceId: "T-2",
        title: "B",
        notes: "",
        owner: "Evelyn",
        sprint: 0,
        status: "todo",
        kindLabel: "Task",
        kindColor: "#000",
      },
      {
        key: "c",
        source: "plan",
        sourceId: "P-1",
        title: "C",
        notes: "",
        owner: "Both",
        sprint: 0,
        status: "done",
        kindLabel: "Plan",
        kindColor: "#000",
      },
      {
        key: "e",
        source: "plan",
        sourceId: "P-2",
        title: "E",
        notes: "",
        owner: "Both",
        sprint: 1,
        status: "done",
        kindLabel: "Plan",
        kindColor: "#000",
      },
      {
        key: "d",
        source: "test",
        sourceId: "TC-1",
        title: "D",
        notes: "",
        owner: "Lyriq",
        sprint: -1,
        status: "done",
        kindLabel: "Test",
        kindColor: "#000",
      },
    ];

    const summary = summarizeBoardProgress(cards, new Date(2026, 6, 15));
    expect(summary.current.sprintIndex).toBe(0);
    expect(summary.current.isCurrent).toBe(true);
    // Sprint 0 Plan item excluded from face total (was 3 with Plan).
    expect(summary.current.done).toBe(1);
    expect(summary.current.total).toBe(2);
    expect(summary.current.percent).toBe(50);
    expect(summary.current.tasks).toBe(2);
    expect(summary.current.tasksDone).toBe(1);
    expect(summary.current.tests).toBe(0);
    expect(summary.current.testsDone).toBe(0);
    // Overall: only committed tasks/tests (A done, B open) — Plan + backlog excluded.
    expect(summary.overall.done).toBe(1);
    expect(summary.overall.total).toBe(2);
    expect(summary.overall.percent).toBe(50);
    expect(summary.sprints).toHaveLength(8);
    expect(summary.sprints[0]?.label).toBe(summary.current.label);
    expect(summary.sprints[0]?.tasks).toBe(2);
    expect(summary.sprints[0]?.tests).toBe(0);
  });
});
