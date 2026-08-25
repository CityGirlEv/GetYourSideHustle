import { describe, expect, it } from "vitest";
import { isUnlockMoveToOpenSprint } from "../closed-sprints";

describe("isUnlockMoveToOpenSprint", () => {
  it("allows leaving a closed sprint for an open sprint or backlog", () => {
    expect(isUnlockMoveToOpenSprint([0, 1], 1, 3)).toBe(true);
    expect(isUnlockMoveToOpenSprint(new Set([2]), 2, -1)).toBe(true);
  });

  it("rejects same-sprint, open-to-open, and locked-to-locked moves", () => {
    expect(isUnlockMoveToOpenSprint([0], 0, 0)).toBe(false);
    expect(isUnlockMoveToOpenSprint([0], 2, 3)).toBe(false);
    expect(isUnlockMoveToOpenSprint([0, 1], 0, 1)).toBe(false);
  });
});
