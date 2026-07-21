import { describe, expect, it } from "vitest";
import { isSprintLocked, sprintLockedMessage } from "../gysh-closed-sprints";

describe("isSprintLocked", () => {
  it("returns false for backlog and missing sets", () => {
    expect(isSprintLocked(undefined, 0)).toBe(false);
    expect(isSprintLocked([], 0)).toBe(false);
    expect(isSprintLocked([0, 1], -1)).toBe(false);
  });

  it("matches closed sprint indexes", () => {
    expect(isSprintLocked([0, 2], 0)).toBe(true);
    expect(isSprintLocked(new Set([1]), 1)).toBe(true);
    expect(isSprintLocked([0, 2], 1)).toBe(false);
  });
});

describe("sprintLockedMessage", () => {
  it("names the sprint", () => {
    expect(sprintLockedMessage(0)).toContain("Sprint 0");
    expect(sprintLockedMessage(0)).toMatch(/closed and locked/i);
  });
});
