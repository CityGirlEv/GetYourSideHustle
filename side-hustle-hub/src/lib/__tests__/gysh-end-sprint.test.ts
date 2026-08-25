import { describe, expect, it } from "vitest";
import { applyEndSprintActions } from "../gysh-end-sprint";
import { noteIndicatesRollover } from "../gysh-sprint-board";
import { notesEffectivelyEqual } from "../gysh-note-entries";
import type { GyshTask } from "../gysh-tasks";

function task(partial: Partial<GyshTask> & Pick<GyshTask, "id" | "sprint" | "status">): GyshTask {
  return {
    description: partial.description ?? partial.id,
    assignedTo: partial.assignedTo ?? "Evelyn",
    dueDate: partial.dueDate ?? "08/04/26",
    category: partial.category ?? "admin_ops",
    priority: partial.priority ?? "P1",
    notes: partial.notes ?? "",
    assignBy: partial.assignBy ?? "System",
    dateAssigned: partial.dateAssigned ?? "08/01/26",
    dateCompleted: partial.dateCompleted ?? "",
    tinaDone: partial.tinaDone ?? false,
    evelynDone: partial.evelynDone ?? false,
    attachments: [],
    ...partial,
  };
}

describe("applyEndSprintActions", () => {
  it("rolls open tasks and tests to the next sprint with rollover notes", () => {
    const result = applyEndSprintActions({
      sprint: 2,
      actions: {},
      tasks: [
        task({ id: "T-OPEN", sprint: 2, status: "in_progress", notes: "Keep going" }),
        task({ id: "T-DONE", sprint: 2, status: "done" }),
        task({ id: "T-OTHER", sprint: 3, status: "not_started" }),
      ],
      tests: [{ id: "QA-OPEN", steps: ["a", "b"] }, { id: "QA-PASS" }],
      testStatuses: { "QA-OPEN": "fail", "QA-PASS": "pass" },
      testSprints: { "QA-OPEN": 2, "QA-PASS": 2 },
      testNotes: { "QA-OPEN": "Still failing the flow" },
      testAssignees: { "QA-OPEN": "evelyn" },
      testDueDates: { "QA-OPEN": "08/06/26" },
      actorLabel: "Evelyn",
    });

    expect(result.nextSprint).toBe(3);
    expect(result.taskDelta.map((t) => t.id)).toEqual(["T-OPEN"]);
    expect(result.taskDelta[0]?.sprint).toBe(3);
    expect(noteIndicatesRollover(result.taskDelta[0]?.notes)).toBe(true);
    expect(result.nextTasks.find((t) => t.id === "T-DONE")?.sprint).toBe(2);

    expect(result.testBatch).toHaveLength(1);
    expect(result.testBatch[0]?.caseId).toBe("QA-OPEN");
    expect(result.testBatch[0]?.sprint).toBe(3);
    expect(result.testBatch[0]?.status).toBe("fail");
    expect(noteIndicatesRollover(result.testBatch[0]?.note)).toBe(true);
  });

  it("completes selected items instead of rolling them", () => {
    const result = applyEndSprintActions({
      sprint: 1,
      actions: {
        "task:T-1": "complete",
        "test:QA-1": "complete",
      },
      tasks: [task({ id: "T-1", sprint: 1, status: "in_progress", assignedTo: "Tina" })],
      tests: [{ id: "QA-1", steps: ["one"] }],
      testStatuses: { "QA-1": "in_progress" },
      testSprints: { "QA-1": 1 },
      testNotes: {},
      testAssignees: {},
      testDueDates: {},
      actorLabel: "Tina",
    });

    expect(result.taskDelta[0]?.status).toBe("done");
    expect(result.taskDelta[0]?.sprint).toBe(1);
    expect(result.testBatch[0]?.status).toBe("pass");
    expect(result.testBatch[0]?.sprint).toBe(1);
    expect(result.testBatch[0]?.checkedSteps).toEqual([true]);
  });
});

describe("notesEffectivelyEqual", () => {
  it("treats plain text and structured JSON with the same body as equal", () => {
    const plain = "Old plain note";
    const structured = JSON.stringify([
      {
        id: "legacy",
        author: "Tina",
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
        text: "Old plain note",
      },
    ]);
    expect(notesEffectivelyEqual(plain, structured)).toBe(true);
    expect(notesEffectivelyEqual(plain, "Different")).toBe(false);
  });
});
