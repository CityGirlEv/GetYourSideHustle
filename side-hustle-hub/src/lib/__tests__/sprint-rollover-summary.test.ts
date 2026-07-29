import { describe, expect, it } from "vitest";
import {
  countRolledIntoSprint,
  countTasksRolledIntoSprint,
  itemRolledRelativeToSprint,
  noteIndicatesRollover,
  noteRolledFromSprint,
  sprintRolloverSummary,
  testIsRolledOver,
} from "../gysh-sprint-board";

describe("sprintRolloverSummary", () => {
  const statuses = {
    a: "rolled_over",
    b: "fixed_cursor",
    c: "pass",
    d: "not_run",
    "PROOF-KG-ghost": "rolled_over",
  } as const;
  const sprints = {
    a: 2,
    b: 2,
    c: 1,
    d: 2,
    "PROOF-KG-ghost": 2,
  };
  const notes = {
    a: "",
    b: '[{"id":"n1","author":"Evelyn","createdAt":"2026-07-28T07:17:21.474Z","updatedAt":"2026-07-28T07:17:21.474Z","text":"Rolled over from Sprint 1"}]',
    c: "",
    d: "",
    "PROOF-KG-ghost": "",
  };
  const known = new Set(["a", "b", "c", "d"]);
  const tasks = [
    { sprint: 2, notes: '[{"text":"Rolled over from Sprint 1"}]' },
    { sprint: 2, notes: '[{"text":"Rolling over from Sprint 1"}]' }, // legacy wording still counts
    { sprint: 2, notes: "no roll" },
    { sprint: 1, notes: "" },
  ];

  it("detects End Sprint rollover notes", () => {
    expect(noteIndicatesRollover(notes.b)).toBe(true);
    expect(noteIndicatesRollover('[{"text":"Rolling over from Sprint 1"}]')).toBe(true);
    expect(testIsRolledOver("fixed_cursor", notes.b)).toBe(true);
    expect(testIsRolledOver("fail", "")).toBe(false);
    expect(testIsRolledOver("rolled_over", "")).toBe(true);
    expect(noteRolledFromSprint(notes.b, 1)).toBe(true);
    expect(noteRolledFromSprint(notes.b, 2)).toBe(false);
    // Counts for Sprint 1 (rolled out) and Sprint 2 (now living there with the note)
    expect(itemRolledRelativeToSprint(2, notes.b, 1, "fixed_cursor")).toBe(true);
    expect(itemRolledRelativeToSprint(2, notes.b, 2, "fixed_cursor")).toBe(true);
    expect(itemRolledRelativeToSprint(2, notes.b, 3, "fixed_cursor")).toBe(false);
  });

  it("counts status rolled_over and note-based rolls", () => {
    expect(countRolledIntoSprint(statuses, sprints, 2, known, notes)).toBe(2);
    expect(countRolledIntoSprint(statuses, sprints, 2, known)).toBe(1);
  });

  it("counts rolled-over tasks on a sprint", () => {
    expect(countTasksRolledIntoSprint(tasks, 2)).toBe(2);
    expect(countTasksRolledIntoSprint(tasks, 1)).toBe(0);
  });

  it("Sprint 2 fromPrev breaks out tests and tasks for bubble lines", () => {
    const s2 = sprintRolloverSummary(statuses, sprints, 2, known, notes, tasks);
    expect(s2.fromPrevTests).toBe(2);
    expect(s2.fromPrevTasks).toBe(2);
    expect(s2.toNextTests).toBe(0);
    expect(s2.toNextTasks).toBe(0);
  });

  it("Sprint 1 toNext breaks out tests and tasks rolled to S2", () => {
    const s1 = sprintRolloverSummary(statuses, sprints, 1, known, notes, tasks);
    expect(s1.toNextTests).toBe(2);
    expect(s1.toNextTasks).toBe(2);
    expect(s1.fromPrevTests).toBe(0);
    expect(s1.fromPrevTasks).toBe(0);
  });
});
