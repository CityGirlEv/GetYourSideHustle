import { describe, expect, it } from "vitest";
import { sprintWorkClearForPartner } from "../gysh-sprint-complete";
import type { GyshTask } from "../gysh-tasks";
import type { TestStatusesPayload } from "../gysh-test-plan";
import { currentSprintIndex } from "../gysh-sprints";

function task(partial: Partial<GyshTask> & Pick<GyshTask, "id" | "assignedTo" | "status" | "sprint">): GyshTask {
  return {
    description: partial.description || partial.id,
    category: "content",
    priority: "P1",
    assignBy: "Test",
    dateAssigned: "07/14/26",
    dueDate: "07/20/26",
    dateCompleted: "",
    notes: "",
    tinaDone: false,
    evelynDone: false,
    attachments: [],
    ...partial,
  };
}

describe("sprintWorkClearForPartner", () => {
  const sprint = currentSprintIndex(new Date(2026, 6, 16)); // Sprint 0 window

  it("requires sprint work before celebrating", () => {
    const empty: TestStatusesPayload = {
      statuses: {},
      notes: {},
      assignees: {},
      sprints: {},
      dueDates: {},
      checkedSteps: {},
      failedStepIndex: {},
      assignedBy: {},
      dateAssigned: {},
      updatedAt: {},
      updatedBy: {},
      generatedCases: [],
    };
    const result = sprintWorkClearForPartner([], empty, "Evelyn", new Date(2026, 6, 16));
    expect(result.hasSprintWork).toBe(false);
    expect(result.allClear).toBe(false);
  });

  it("is clear when all assigned sprint tasks are done", () => {
    const tasks = [
      task({ id: "T-1", assignedTo: "Evelyn", status: "done", sprint }),
      task({ id: "T-2", assignedTo: "Tina", status: "in_progress", sprint }),
    ];
    const empty: TestStatusesPayload = {
      statuses: {},
      notes: {},
      assignees: {},
      sprints: {},
      dueDates: {},
      checkedSteps: {},
      failedStepIndex: {},
      assignedBy: {},
      dateAssigned: {},
      updatedAt: {},
      updatedBy: {},
      generatedCases: [],
    };
    const result = sprintWorkClearForPartner(tasks, empty, "Evelyn", new Date(2026, 6, 16));
    expect(result.hasSprintWork).toBe(true);
    expect(result.tasksClear).toBe(true);
    expect(result.allClear).toBe(true);
  });

  it("is not clear while a Both task remains open for Evelyn", () => {
    const tasks = [task({ id: "T-3", assignedTo: "Both", status: "in_progress", sprint })];
    const empty: TestStatusesPayload = {
      statuses: {},
      notes: {},
      assignees: {},
      sprints: {},
      dueDates: {},
      checkedSteps: {},
      failedStepIndex: {},
      assignedBy: {},
      dateAssigned: {},
      updatedAt: {},
      updatedBy: {},
      generatedCases: [],
    };
    const result = sprintWorkClearForPartner(tasks, empty, "Evelyn", new Date(2026, 6, 16));
    expect(result.allClear).toBe(false);
  });
});
