/**
 * Pure End Sprint apply helpers — rollover / complete open tasks + tests.
 * SchedulePage persists the returned deltas (never a full-board task PUT).
 */

import { appendActorNote } from "./gysh-note-entries";
import { rolloverNoteText } from "./gysh-sprint-board";
import { dueDateForSprint, withSprintDueDate } from "./gysh-sprints";
import {
  applyPartnerDone,
  requiresPartnerDone,
  type GyshTask,
} from "./gysh-tasks";
import type { TestStatus } from "./gysh-test-plan";

export type EndSprintAction = "rollover" | "complete";

export type EndSprintTestBatchItem = {
  caseId: string;
  status: TestStatus;
  note?: string;
  assignee?: string;
  sprint?: number;
  dueDate?: string;
  checkedSteps?: boolean[];
  stepCount?: number;
};

export type EndSprintApplyInput = {
  sprint: number;
  actions: Record<string, EndSprintAction>;
  tasks: GyshTask[];
  /** Catalog tests considered for End Sprint (same set as the modal). */
  tests: Array<{ id: string; steps?: string[] }>;
  testStatuses: Record<string, TestStatus | undefined>;
  testSprints: Record<string, number | undefined>;
  testNotes: Record<string, string | undefined>;
  testAssignees: Record<string, string | undefined>;
  testDueDates: Record<string, string | undefined>;
  /** Fallback assignees when D1 has none (catalog defaults). */
  defaultAssignees?: Record<string, string | undefined>;
  actorLabel: string;
};

export type EndSprintApplyResult = {
  nextSprint: number;
  nextTasks: GyshTask[];
  /** Only rows that changed — safe to PUT without touching locked sprints. */
  taskDelta: GyshTask[];
  testBatch: EndSprintTestBatchItem[];
};

/**
 * Build next task list + test status batch for End Sprint confirm.
 * Incomplete = tasks not done; tests not pass / conditional_approval (same as modal).
 */
export function applyEndSprintActions(input: EndSprintApplyInput): EndSprintApplyResult {
  const sprint = input.sprint;
  const nextSprint = sprint + 1;
  const nextDue = dueDateForSprint(nextSprint);
  const taskDelta: GyshTask[] = [];

  const nextTasks = input.tasks.map((t) => {
    if (Number(t.sprint) !== sprint || t.status === "done") return t;
    const action = input.actions[`task:${t.id}`] ?? "rollover";
    let next: GyshTask;
    if (action === "complete") {
      next = applyPartnerDone(t, {
        status: "done",
        ...(requiresPartnerDone(t.assignedTo)
          ? { tinaDone: true, evelynDone: true }
          : {}),
      });
    } else {
      next = {
        ...t,
        ...withSprintDueDate({ sprint: nextSprint }),
        status: t.status === "not_started" ? "in_progress" : t.status,
        notes: appendActorNote(t.notes, input.actorLabel, rolloverNoteText(sprint)),
      };
    }
    taskDelta.push(next);
    return next;
  });

  const testBatch: EndSprintTestBatchItem[] = [];
  for (const t of input.tests) {
    const rowSprint = Number(input.testSprints[t.id]);
    if (rowSprint !== sprint) continue;
    const st = input.testStatuses[t.id] ?? "not_run";
    if (st === "pass" || st === "conditional_approval") continue;
    const action = input.actions[`test:${t.id}`] ?? "rollover";
    const assignee =
      input.testAssignees[t.id] || input.defaultAssignees?.[t.id] || "";
    const note = input.testNotes[t.id] ?? "";
    if (action === "complete") {
      const stepCount = Array.isArray(t.steps) ? t.steps.length : 0;
      testBatch.push({
        caseId: t.id,
        status: "pass",
        note: note.trim() || "Completed at sprint end",
        assignee,
        sprint,
        dueDate: input.testDueDates[t.id],
        ...(stepCount > 0
          ? { stepCount, checkedSteps: Array.from({ length: stepCount }, () => true) }
          : {}),
      });
    } else {
      const workStatus = st === "rolled_over" ? "not_run" : st;
      testBatch.push({
        caseId: t.id,
        status: workStatus,
        note: appendActorNote(note, input.actorLabel, rolloverNoteText(sprint)),
        assignee,
        sprint: nextSprint,
        dueDate: nextDue || input.testDueDates[t.id],
      });
    }
  }

  return { nextSprint, nextTasks, taskDelta, testBatch };
}
