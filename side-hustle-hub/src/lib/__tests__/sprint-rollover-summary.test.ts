import { describe, expect, it } from "vitest";
import {
  countRolledIntoSprint,
  sprintRolloverSummary,
} from "../gysh-sprint-board";

describe("sprintRolloverSummary", () => {
  const statuses = {
    a: "rolled_over",
    b: "rolled_over",
    c: "pass",
    d: "not_run",
  } as const;
  const sprints = {
    a: 2,
    b: 2,
    c: 1,
    d: 2,
  };

  it("counts rolled_over tests on a sprint", () => {
    expect(countRolledIntoSprint(statuses, sprints, 2)).toBe(2);
    expect(countRolledIntoSprint(statuses, sprints, 1)).toBe(0);
  });

  it("Sprint 1 shows count rolled to Sprint 2", () => {
    const s1 = sprintRolloverSummary(statuses, sprints, 1);
    expect(s1.toNext).toBe(2);
    expect(s1.fromPrev).toBe(0);
    expect(s1.chipHint).toBe("2 → S2");
    expect(s1.banner).toContain("rolled over to Sprint 2");
  });

  it("Sprint 2 shows count rolled from Sprint 1", () => {
    const s2 = sprintRolloverSummary(statuses, sprints, 2);
    expect(s2.toNext).toBe(0);
    expect(s2.fromPrev).toBe(2);
    expect(s2.chipHint).toBe("2 from S1");
    expect(s2.banner).toContain("rolled over from Sprint 1");
  });
});
