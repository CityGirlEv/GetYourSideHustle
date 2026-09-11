import { describe, expect, it } from "vitest";
import {
  countItemRolloversForSprintFocus,
  countRolledIntoSprint,
  countTasksRolledIntoSprint,
  formatRolloverFromToLabel,
  itemAssignedToSprintFilterSet,
  itemBelongsToSprintFilter,
  itemMatchesSprintFilterSet,
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

  it("Sprint 1 chip omits from S0 when nothing rolled in (no zero noise)", () => {
    const s1 = sprintRolloverSummary(statuses, sprints, 1, known, notes, tasks);
    expect(s1.fromPrev).toBe(0);
    expect(s1.chipHint).not.toContain("from S0:");
    expect(s1.banner).not.toContain("rolled over from Sprint 0");
    expect(s1.chipHint).toContain("→ S2:");
  });

  it("Sprint 1 chip shows from S0 when something actually rolled in", () => {
    const s1 = sprintRolloverSummary(
      { ...statuses, from0: "fail" },
      { ...sprints, from0: 1 },
      1,
      new Set([...known, "from0"]),
      {
        ...notes,
        from0:
          '[{"id":"n0","author":"Evelyn","createdAt":"2026-07-28T07:17:21.474Z","updatedAt":"2026-07-28T07:17:21.474Z","text":"Rolled over from Sprint 0"}]',
      },
      tasks,
    );
    expect(s1.chipHint).toContain("from S0:");
    expect(s1.banner).toContain("rolled over from Sprint 0");
  });

  it("includes task rollover counts when tasks are passed (not forced to 0)", () => {
    const s1 = sprintRolloverSummary(statuses, sprints, 1, known, notes, tasks);
    expect(s1.toNextTasks).toBe(2);
    expect(s1.chipHint).toContain("2 tasks");
    const withoutTasks = sprintRolloverSummary(statuses, sprints, 1, known, notes);
    expect(withoutTasks.toNextTasks).toBe(0);
  });

  it("itemBelongsToSprintFilter keeps outbound rollovers on the source sprint filter", () => {
    const note = '[{"text":"Rolled over from Sprint 4"}]';
    expect(itemBelongsToSprintFilter(4, "", 4)).toBe(true);
    expect(itemBelongsToSprintFilter(5, note, 4)).toBe(true);
    expect(itemBelongsToSprintFilter(5, note, 5)).toBe(true);
    expect(itemBelongsToSprintFilter(5, note, 3)).toBe(false);
    expect(itemBelongsToSprintFilter(5, "", 4)).toBe(false);
  });

  it("itemMatchesSprintFilterSet includes outbound carries for any selected focus", () => {
    const note = '[{"text":"Rolled over from Sprint 4"}]';
    expect(itemMatchesSprintFilterSet(5, note, new Set([4]))).toBe(true);
    expect(itemMatchesSprintFilterSet(5, note, new Set([5]))).toBe(true);
    expect(itemMatchesSprintFilterSet(5, note, new Set([3, 4]))).toBe(true);
    expect(itemMatchesSprintFilterSet(5, note, new Set([3]))).toBe(false);
    expect(itemMatchesSprintFilterSet(5, "", new Set([4]))).toBe(false);
  });

  it("itemAssignedToSprintFilterSet lists only the assigned sprint (no outbound carries)", () => {
    const from5 = '[{"text":"Rolled over from Sprint 5"}]';
    const from4 = '[{"text":"Rolled over from Sprint 4"}]';
    expect(itemAssignedToSprintFilterSet(6, from5, new Set([5]))).toBe(false);
    expect(itemAssignedToSprintFilterSet(5, from5, new Set([5]))).toBe(false);
    expect(itemAssignedToSprintFilterSet(5, "", new Set([5]))).toBe(true);
    expect(itemAssignedToSprintFilterSet(5, from4, new Set([5]))).toBe(true);
    expect(itemAssignedToSprintFilterSet(6, from5, new Set([6]))).toBe(true);
    expect(itemAssignedToSprintFilterSet(6, "", new Set())).toBe(true);
  });

  it("countItemRolloversForSprintFocus splits from-prev vs to-next", () => {
    const items = [
      { sprint: 4, notes: '[{"text":"Rolled over from Sprint 3"}]' },
      { sprint: 5, notes: '[{"text":"Rolled over from Sprint 4"}]' },
      { sprint: 5, notes: '[{"text":"Rolled over from Sprint 4"}]' },
      { sprint: 4, notes: "" },
    ];
    expect(countItemRolloversForSprintFocus(items, new Set([4]))).toEqual({
      fromPrev: 1,
      toNext: 2,
    });
    expect(formatRolloverFromToLabel({ fromPrev: 1, toNext: 2 }, 4)).toBe(
      "from S3: 1 · → S5: 2",
    );
  });
});
