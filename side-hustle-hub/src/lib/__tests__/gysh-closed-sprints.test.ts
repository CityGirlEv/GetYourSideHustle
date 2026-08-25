import { describe, expect, it } from "vitest";
import {
  firstUnlockedSprint,
  isSprintLocked,
  isUnlockMoveToOpenSprint,
  nextUnlockedSprint,
  placeUnstoredTestSprint,
  sprintForNewTest,
  sprintLockedMessage,
} from "../gysh-closed-sprints";
import { currentSprintIndex } from "../gysh-sprints";
import {
  buildUnlockTaskPatch,
  countTasksRolledIntoSprint,
  healClosedSprintTaskLeftovers,
  healClosedSprintTestLeftovers,
  noteIndicatesRollover,
} from "../gysh-sprint-board";
import type { GyshTask } from "../gysh-tasks";

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

describe("isUnlockMoveToOpenSprint", () => {
  it("allows locked → current open sprint or backlog", () => {
    expect(isUnlockMoveToOpenSprint([0, 1], 1, 3)).toBe(true);
    expect(isUnlockMoveToOpenSprint([0], 0, -1)).toBe(true);
  });

  it("rejects staying put, open→open, or locked→locked", () => {
    expect(isUnlockMoveToOpenSprint([0], 0, 0)).toBe(false);
    expect(isUnlockMoveToOpenSprint([0], 2, 3)).toBe(false);
    expect(isUnlockMoveToOpenSprint([0, 1], 0, 1)).toBe(false);
  });
});

describe("firstUnlockedSprint", () => {
  it("prefers the current sprint when it is open", () => {
    const now = new Date("2026-08-23T18:00:00");
    expect(firstUnlockedSprint([0, 1], now)).toBe(currentSprintIndex(now));
  });

  it("skips closed current sprint and returns the next open one", () => {
    const now = new Date("2026-08-23T18:00:00");
    const current = currentSprintIndex(now);
    expect(firstUnlockedSprint([current], now)).toBe(current + 1);
  });

  it("returns null when every committed sprint is closed", () => {
    expect(firstUnlockedSprint([0, 1, 2, 3, 4, 5, 6, 7])).toBeNull();
  });
});

describe("sprintForNewTest", () => {
  it("never returns a closed sprint", () => {
    const now = new Date("2026-08-23T18:00:00");
    expect(sprintForNewTest([0, 1, 2], now)).toBe(3);
    expect(sprintForNewTest([0, 1, 2, 3], now)).toBe(4);
  });

  it("uses the current sprint when it is open", () => {
    const now = new Date("2026-08-23T18:00:00");
    expect(sprintForNewTest([0, 1], now)).toBe(currentSprintIndex(now));
  });
});

describe("placeUnstoredTestSprint", () => {
  it("sends new tests to the current open sprint instead of a closed band", () => {
    const now = new Date("2026-08-23T18:00:00");
    expect(placeUnstoredTestSprint(1, [0, 1, 2], now)).toBe(3);
    expect(placeUnstoredTestSprint(0, [0, 1, 2], now)).toBe(3);
    expect(placeUnstoredTestSprint(2, undefined, now)).toBe(3);
    expect(placeUnstoredTestSprint(4, [0, 1, 2], now)).toBe(4);
  });

  it("keeps backlog for generated-failure board rows", () => {
    expect(placeUnstoredTestSprint(-1, [0, 1, 2])).toBe(-1);
  });
});

describe("nextUnlockedSprint", () => {
  it("walks past closed sprints to the next open one", () => {
    expect(nextUnlockedSprint([0, 1, 2], 2)).toBe(3);
    expect(nextUnlockedSprint([0, 1, 2], 0)).toBe(3);
  });
});

describe("healClosedSprint leftovers", () => {
  const closed = [0, 1, 2];

  function task(partial: Partial<GyshTask> & Pick<GyshTask, "id" | "sprint" | "status">): GyshTask {
    return {
      description: partial.id,
      assignedTo: "Evelyn",
      dueDate: "08/03/26",
      category: "admin_ops",
      priority: "P2",
      notes: "",
      assignBy: "System",
      dateAssigned: "08/01/26",
      dateCompleted: "",
      attachments: [],
      ...partial,
    };
  }

  it("rolls incomplete closed-sprint tasks to the next open sprint and counts them", () => {
    const { tasks, changed } = healClosedSprintTaskLeftovers(
      [
        task({ id: "T-SL-S2-FB-WELCOME", sprint: 2, status: "in_progress" }),
        task({ id: "T-DONE", sprint: 2, status: "done" }),
        task({ id: "T-OPEN", sprint: 3, status: "not_started" }),
      ],
      closed,
      "Evelyn",
    );
    expect(changed.map((t) => t.id)).toEqual(["T-SL-S2-FB-WELCOME"]);
    expect(tasks.find((t) => t.id === "T-SL-S2-FB-WELCOME")?.sprint).toBe(3);
    expect(tasks.find((t) => t.id === "T-DONE")?.sprint).toBe(2);
    expect(noteIndicatesRollover(changed[0]?.notes)).toBe(true);
    expect(countTasksRolledIntoSprint(tasks, 3)).toBe(1);
    expect(countTasksRolledIntoSprint(tasks, 2)).toBe(0);
  });

  it("rolls incomplete closed-sprint tests and includes them in the rollover count", () => {
    const healed = healClosedSprintTestLeftovers({
      sprints: { "QA-S2": 2, "QA-PASS": 2, "QA-S3": 3 },
      statuses: { "QA-S2": "not_run", "QA-PASS": "pass", "QA-S3": "in_progress" },
      notes: {},
      dueDates: {},
      closed,
      actorLabel: "Evelyn",
    });
    expect(healed.changedIds).toEqual(["QA-S2"]);
    expect(healed.sprints["QA-S2"]).toBe(3);
    expect(healed.sprints["QA-PASS"]).toBe(2);
    expect(noteIndicatesRollover(healed.notes["QA-S2"])).toBe(true);
  });
});

describe("buildUnlockTaskPatch", () => {
  it("moves the task, sets sprint due, and stamps a rollover note", () => {
    const patch = buildUnlockTaskPatch(
      { sprint: 1, notes: "" },
      4,
      "Evelyn",
    );
    expect(patch.sprint).toBe(4);
    expect(patch.dueDate).toBeTruthy();
    expect(noteIndicatesRollover(patch.notes)).toBe(true);
    expect(patch.notes).toMatch(/Sprint 1/);
  });

  it("does not duplicate an existing rollover note from that sprint", () => {
    const existing =
      '[{"id":"n1","author":"Evelyn","createdAt":"2026-08-01T00:00:00.000Z","updatedAt":"2026-08-01T00:00:00.000Z","text":"Rolled over from Sprint 1"}]';
    const patch = buildUnlockTaskPatch({ sprint: 1, notes: existing }, 4, "Evelyn");
    expect((patch.notes.match(/Rolled over from Sprint 1/g) ?? []).length).toBe(1);
  });
});
