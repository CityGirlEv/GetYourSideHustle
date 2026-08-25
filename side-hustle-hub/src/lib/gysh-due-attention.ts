/**
 * Login / daily attention: overdue tasks (existing) + overdue tests for a partner.
 */

import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
  isAutomatedTestId,
  isWizardMatrixCaseId,
} from "./gysh-automated-tests";
import { isHumanQaTester, type QaTesterId } from "./gysh-roles";
import { sprintForUnstoredTest } from "./gysh-sprint-board";
import { dueDateForSprint } from "./gysh-sprints";
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
  parseMMDDYY,
  startOfToday,
  type PartnerAssignee,
} from "./gysh-tasks";

export type AttentionTest = {
  id: string;
  title: string;
  dueDate: string;
  status: TestStatus;
};

function partnerTesterId(me: PartnerAssignee): QaTesterId {
  return me.toLowerCase() as QaTesterId;
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

/** Incomplete test statuses that can still be overdue. */
export function isTestOpen(status: TestStatus): boolean {
  return status === "not_run" || status === "in_progress";
}

/** Due date before today (MM/DD/YY), same rule as tasks. */
export function isTestOverdue(
  dueDate: string,
  status: TestStatus,
  today = startOfToday(),
): boolean {
  if (!isTestOpen(status)) return false;
  const due = parseMMDDYY(dueDate);
  if (!due) return false;
  return due.getTime() < today.getTime();
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

function testMatchesPartner(assignee: string, caseAssignees: TestCase["assignees"], me: PartnerAssignee): boolean {
  const id = partnerTesterId(me);
  if (assignee && isHumanQaTester(assignee)) return assignee === id;
  return caseAssignees.includes(id);
}

function resolvedDueDate(
  id: string,
  t: TestCase,
  dueDates: Record<string, string>,
  sprints: Record<string, number>,
): string {
  const existing = String(dueDates[id] || "").trim();
  if (existing) return existing;
  const sprint = sprints[id] ?? sprintForUnstoredTest(t);
  return dueDateForSprint(sprint);
}

/**
 * Overdue open tests assigned to `me` (tina / evelyn / lyriq), using
 * test_case_status dueDate when set, else sprint default due.
 */
export function dueAttentionTests(
  payload: TestStatusesPayload,
  me: PartnerAssignee,
): { overdue: AttentionTest[] } {
  const today = startOfToday();
  const cases = catalogCases(payload.generatedCases ?? []);
  const overdue: AttentionTest[] = [];

  for (const t of cases) {
    const status = (payload.statuses[t.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    if (!isTestOpen(status)) continue;

    const assignee = effectiveAssignee(t, payload.assignees[t.id]);
    if (!testMatchesPartner(assignee, t.assignees, me)) continue;

    // Skip pure automated suite ownership (no human on the case).
    if (!isHumanQaTester(assignee) && !t.assignees.some(isHumanQaTester)) continue;

    const dueDate = resolvedDueDate(t.id, t, payload.dueDates, payload.sprints);
    if (!isTestOverdue(dueDate, status, today)) continue;

    overdue.push({ id: t.id, title: t.title, dueDate, status });
  }

  overdue.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "") || a.id.localeCompare(b.id));
  return { overdue };
}
