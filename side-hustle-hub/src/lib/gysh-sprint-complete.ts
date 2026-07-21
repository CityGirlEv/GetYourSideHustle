/**
 * Detect when a partner has finished all of their current-sprint work
 * (tasks + open human QA tests) for celebration UX.
 */

import { dueAttentionTests, isTestOpen } from "./gysh-due-attention";
import { currentSprintIndex } from "./gysh-sprints";
import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
  isAutomatedTestId,
  isWizardMatrixCaseId,
} from "./gysh-automated-tests";
import { isHumanQaTester } from "./gysh-roles";
import {
  DEFAULT_TEST_STATUS,
  TEST_CASES,
  withDefaultSuite,
  type GeneratedTestCase,
  type TestCase,
  type TestStatus,
  type TestStatusesPayload,
} from "./gysh-test-plan";
import {
  dueAttentionTasks,
  taskMatchesAssignee,
  type GyshTask,
  type PartnerAssignee,
} from "./gysh-tasks";

export type SprintClearResult = {
  sprintIndex: number;
  /** Partner has at least one task or test in the current sprint. */
  hasSprintWork: boolean;
  /** Every assigned current-sprint task is done. */
  tasksClear: boolean;
  /** Every assigned current-sprint open test is closed (not not_run / in_progress). */
  testsClear: boolean;
  /** hasSprintWork && tasksClear && testsClear */
  allClear: boolean;
  taskTotal: number;
  taskDone: number;
  testTotal: number;
  testDone: number;
};

function partnerTesterId(me: PartnerAssignee): string {
  return me.toLowerCase();
}

function generatedToCase(g: GeneratedTestCase): TestCase {
  return {
    id: g.id,
    area: g.area,
    title: g.title,
    priority: g.priority,
    roles: ["qa", "admin"],
    assignees: ["evelyn"],
    suite: g.suite,
    steps: g.steps,
    expected: g.expected,
  };
}

function catalogCases(generated: GeneratedTestCase[]): TestCase[] {
  const base = [
    ...withDefaultSuite(TEST_CASES),
    ...AUTOMATED_VITEST_CASES,
    ...AUTOMATED_PLAYWRIGHT_CASES,
  ];
  const seen = new Set(base.map((c) => c.id));
  const extras = generated.filter((g) => !seen.has(g.id)).map(generatedToCase);
  return [...base, ...extras].filter((t) => !isWizardMatrixCaseId(t.id));
}

function effectiveAssignee(t: TestCase, override: string | undefined): string {
  const isFailGen = /^(VT|PW)-FAIL-/i.test(t.id);
  if (isFailGen) {
    if (override && isHumanQaTester(override)) return override;
    return t.assignees[0] ?? "evelyn";
  }
  if (isAutomatedTestId(t.id) || t.suite === "vitest" || t.suite === "playwright") {
    return t.assignees[0] ?? "";
  }
  if (override && isHumanQaTester(override)) return override;
  return t.assignees[0] ?? "";
}

function testMatchesPartner(
  assignee: string,
  caseAssignees: TestCase["assignees"],
  me: PartnerAssignee,
): boolean {
  const id = partnerTesterId(me);
  if (assignee && isHumanQaTester(assignee)) return assignee === id;
  return caseAssignees.includes(id as TestCase["assignees"][number]);
}

function isTestComplete(status: TestStatus): boolean {
  return !isTestOpen(status);
}

/**
 * Whether the partner's current-sprint tasks and human QA tests are all finished.
 * Empty sprint work → not allClear (no empty-state fireworks).
 */
export function sprintWorkClearForPartner(
  tasks: GyshTask[],
  testPayload: TestStatusesPayload,
  me: PartnerAssignee,
  ref: Date = new Date(),
): SprintClearResult {
  const sprintIndex = currentSprintIndex(ref);

  const myTasks = tasks.filter(
    (t) => Number(t.sprint) === sprintIndex && taskMatchesAssignee(t, me),
  );
  const taskDone = myTasks.filter((t) => t.status === "done").length;
  const tasksClear = myTasks.length === 0 || taskDone === myTasks.length;

  // Only tests explicitly placed on the current sprint (board/D1 sprint map).
  // Do not invent work from catalog defaults — that would never let partners celebrate.
  const cases = catalogCases(testPayload.generatedCases ?? []);
  let testTotal = 0;
  let testDone = 0;
  for (const t of cases) {
    if (!(t.id in testPayload.sprints)) continue;
    if (Number(testPayload.sprints[t.id]) !== sprintIndex) continue;

    const assignee = effectiveAssignee(t, testPayload.assignees[t.id]);
    if (!testMatchesPartner(assignee, t.assignees, me)) continue;
    if (!isHumanQaTester(assignee) && !t.assignees.some(isHumanQaTester)) continue;

    const status = (testPayload.statuses[t.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    testTotal += 1;
    if (isTestComplete(status)) testDone += 1;
  }
  const testsClear = testTotal === 0 || testDone === testTotal;

  const hasSprintWork = myTasks.length > 0 || testTotal > 0;
  const allClear = hasSprintWork && tasksClear && testsClear;

  return {
    sprintIndex,
    hasSprintWork,
    tasksClear,
    testsClear,
    allClear,
    taskTotal: myTasks.length,
    taskDone,
    testTotal,
    testDone,
  };
}

/** True when overdue attention is empty (safe to celebrate instead of nag). */
export function attentionClearForPartner(
  tasks: GyshTask[],
  testPayload: TestStatusesPayload,
  me: PartnerAssignee,
): boolean {
  const attention = dueAttentionTasks(tasks, me);
  const tests = dueAttentionTests(testPayload, me);
  return (
    attention.overdue.length === 0 &&
    attention.dueToday.length === 0 &&
    tests.overdue.length === 0
  );
}
