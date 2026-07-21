/**
 * Compute rollout sprint/due assignments from catalog + current D1 snapshot (stdin JSON).
 * Prints JSON: { tasks, tests, planRemaps }
 */
import {
  applyRolloutSprintSchedule,
  TASK_SPRINT_MAP,
} from "../src/lib/gysh-sprint-board";
import { BACKLOG_SPRINT, dueDateForSprint } from "../src/lib/gysh-sprints";
import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
} from "../src/lib/gysh-automated-tests";
import { TEST_CASES, withDefaultSuite } from "../src/lib/gysh-test-plan";
import type { GyshTask } from "../src/lib/gysh-tasks";
import type { PlanItem } from "../src/lib/gysh-sprints";

type Snapshot = {
  tasks: Array<{
    id: string;
    category: string;
    notes: string;
    sprint: number;
    dueDate: string;
    assignedTo: string;
    description?: string;
    priority?: string;
    status?: string;
    assignBy?: string;
    dateAssigned?: string;
    dateCompleted?: string;
    tinaDone?: boolean;
    evelynDone?: boolean;
  }>;
  testSprints: Record<string, number>;
  testDueDates: Record<string, string>;
  planItems: PlanItem[];
};

const raw = await new Promise<string>((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (c) => {
    buf += c;
  });
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
});

const snap = JSON.parse(raw || "{}") as Snapshot;
const tests = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
];

const tasks = (snap.tasks ?? []).map(
  (t) =>
    ({
      id: t.id,
      description: t.description ?? "",
      category: t.category as GyshTask["category"],
      priority: (t.priority as GyshTask["priority"]) ?? "P2",
      status: (t.status as GyshTask["status"]) ?? "not_started",
      assignBy: t.assignBy ?? "",
      assignedTo: (t.assignedTo as GyshTask["assignedTo"]) ?? "Unassigned",
      dateAssigned: t.dateAssigned ?? "",
      dueDate: t.dueDate ?? "",
      dateCompleted: t.dateCompleted ?? "",
      notes: t.notes ?? "",
      sprint: typeof t.sprint === "number" ? t.sprint : 0,
      tinaDone: t.tinaDone ?? false,
      evelynDone: t.evelynDone ?? false,
      attachments: [],
    }) satisfies GyshTask,
);

const result = applyRolloutSprintSchedule({
  planItems: snap.planItems ?? [],
  tasks,
  tests,
  testSprints: snap.testSprints ?? {},
  testDueDates: snap.testDueDates ?? {},
  mode: "force",
});

const taskUpdates = result.tasks
  .filter((t, i) => {
    const prev = tasks[i];
    return !prev || prev.sprint !== t.sprint || prev.dueDate !== t.dueDate;
  })
  .map((t) => ({
    id: t.id,
    sprint: t.sprint,
    dueDate: t.dueDate,
    assignedTo: t.assignedTo,
  }));

const testUpdates = result.testChangedIds.map((id) => ({
  id,
  sprint: result.testSprints[id] ?? BACKLOG_SPRINT,
  dueDate: result.testDueDates[id] ?? "",
}));

const planUpdates = result.planItems
  .filter((item) => {
    const prev = (snap.planItems ?? []).find((p) => p.id === item.id);
    return !prev || prev.sprint !== item.sprint || prev.date !== item.date;
  })
  .map((item) => ({
    id: item.id,
    sprint: item.sprint,
    date: item.date,
    dateLabel: item.dateLabel,
    title: item.title,
    notes: item.notes,
  }));

process.stdout.write(
  JSON.stringify({
    taskUpdates,
    testUpdates,
    planUpdates,
    summary: {
      tasksChanged: taskUpdates.length,
      testsChanged: testUpdates.length,
      planChanged: planUpdates.length,
      mappedTasks: Object.keys(TASK_SPRINT_MAP).length,
      sampleDue: {
        s2: dueDateForSprint(2),
        s4: dueDateForSprint(4),
        s5: dueDateForSprint(5),
        s6: dueDateForSprint(6),
      },
    },
  }),
);
