/** Aggregate task / test / timesheet activity for a calendar day or range. */

import {
  formatDurationHours,
  liveElapsedMs,
  toIsoDate,
  type TimeEntry,
} from "./gysh-time-entries";
import {
  assigneeIncludes,
  mmddyyToIso,
  parseAssigneePeople,
  PARTNER_ASSIGNEES,
  TASK_STATUS_LABELS,
  type GyshTask,
  type PartnerAssignee,
  type TaskStatus,
} from "./gysh-tasks";
import {
  isHumanQaTester,
  testOwnerLabel,
} from "./gysh-roles";
import {
  STATUS_LABELS,
  TEST_CASES,
  type TestStatus,
  type TestStatusesPayload,
} from "./gysh-test-plan";
import {
  BACKLOG_SPRINT,
  DEFAULT_SPRINT_COUNT,
  listUpcomingSprints,
  sprintLabel,
} from "./gysh-sprints";

type ProgressTestCaseRef = { assignees?: readonly string[] };

export type ProgressLine = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  assignee: string;
  when: string;
  /** Sprint index, or BACKLOG_SPRINT (-1). */
  sprint: number;
  sprintLabel: string;
};

export type StatusBucket = { status: string; label: string; count: number };

/** People selectable in the Daily Progress Report user filter. Empty = All. */
export type ProgressReportPerson = PartnerAssignee | "Both" | "Unassigned";

export const PROGRESS_REPORT_PEOPLE: ProgressReportPerson[] = [
  ...PARTNER_ASSIGNEES,
  "Both",
  "Unassigned",
];

/** Sprint filter keys. Empty selection = All sprints. */
export type ProgressSprintFilter = number | "backlog";

/** Unified status filter for tasks + tests. Empty = all statuses. */
export type ProgressStatusFilter =
  | "not_started"
  | "in_progress"
  | "done"
  | "fail"
  | "blocked";

export type ProgressSortBy = "id" | "sprint" | "status";

export const PROGRESS_STATUS_FILTERS: {
  id: ProgressStatusFilter;
  label: string;
  taskStatuses: readonly TaskStatus[];
  testStatuses: readonly TestStatus[];
}[] = [
  {
    id: "not_started",
    label: "Not Started",
    taskStatuses: ["not_started"],
    testStatuses: ["not_run"],
  },
  {
    id: "in_progress",
    label: "In Progress",
    taskStatuses: ["in_progress"],
    testStatuses: ["in_progress"],
  },
  {
    id: "done",
    label: "Done/Pass",
    taskStatuses: ["done"],
    testStatuses: ["pass"],
  },
  {
    id: "fail",
    label: "Fail",
    taskStatuses: [],
    testStatuses: ["fail"],
  },
  {
    id: "blocked",
    label: "Blocked",
    taskStatuses: ["blocked"],
    testStatuses: ["blocked"],
  },
];

export const PROGRESS_SORT_OPTIONS: { id: ProgressSortBy; label: string }[] = [
  { id: "id", label: "ID" },
  { id: "sprint", label: "Sprint" },
  { id: "status", label: "Status" },
];

const TASK_STATUS_SORT: Record<string, number> = {
  in_progress: 0,
  not_started: 1,
  blocked: 2,
  done: 3,
};

const TEST_STATUS_SORT: Record<string, number> = {
  in_progress: 0,
  not_run: 1,
  fail: 2,
  blocked: 3,
  pass: 4,
};

export type DailyProgressReport = {
  from: string;
  to: string;
  label: string;
  /** Human-readable active filters / sort for UI + exports. */
  viewLabel: string;
  tasks: ProgressLine[];
  tests: ProgressLine[];
  taskBuckets: StatusBucket[];
  testBuckets: StatusBucket[];
  openTasks: { inProgress: number; blocked: number; notStarted: number };
  openTests: { inProgress: number; blocked: number; fail: number; notRun: number };
  timeMs: number;
  timeLabel: string;
  timeByPerson: { name: string; ms: number; label: string }[];
};

/**
 * Normalize task assignees ("Tina") and Testing Portal owner ids ("tina")
 * so individual user filters match both systems.
 */
export function normalizeProgressAssignee(
  assignedTo: string | null | undefined,
): string {
  const raw = String(assignedTo ?? "").trim();
  if (!raw || /^unassigned$/i.test(raw)) return "Unassigned";
  if (/^both$/i.test(raw)) return "Both";

  // Testing Portal stores lowercase owner ids: tina | evelyn | lyriq | vitest | playwright
  const lower = raw.toLowerCase();
  if (isHumanQaTester(lower) || lower === "vitest" || lower === "playwright") {
    return testOwnerLabel(lower);
  }

  // Task-style labels / composites (Tina, Tina+Evelyn, Both)
  const partner = PARTNER_ASSIGNEES.find((p) => p.toLowerCase() === lower);
  if (partner) return partner;

  return raw;
}

/** Match Task List / Schedule owner filters (Tina/Evelyn include Both). */
export function assigneeMatchesPeople(
  assignedTo: string | null | undefined,
  people: readonly ProgressReportPerson[],
): boolean {
  if (people.length === 0) return true;
  const raw = normalizeProgressAssignee(assignedTo);
  return people.some((person) => {
    if (person === "Unassigned") return raw === "Unassigned";
    if (person === "Both") {
      // Tasks use "Both"; tests with multi-owner defaults also normalize to "Both".
      // Also treat Tina+Evelyn composites as Both for the filter chip.
      if (raw === "Both") return true;
      const parts = parseAssigneePeople(raw);
      return parts.includes("Tina") && parts.includes("Evelyn") && parts.length === 2;
    }
    if (person === "Lyriq") return raw === "Lyriq" || assigneeIncludes(raw, "Lyriq");
    // Tina/Evelyn: include task "Both" and composites via assigneeIncludes
    return raw === person || assigneeIncludes(raw, person);
  });
}

export function progressSprintKey(sprint: number): ProgressSprintFilter {
  return sprint === BACKLOG_SPRINT ? "backlog" : sprint;
}

export function sprintMatchesFilters(
  sprint: number,
  sprints: readonly ProgressSprintFilter[],
): boolean {
  if (sprints.length === 0) return true;
  return sprints.includes(progressSprintKey(sprint));
}

export function statusMatchesFilters(
  kind: "task" | "test",
  status: string,
  statuses: readonly ProgressStatusFilter[],
): boolean {
  if (statuses.length === 0) return true;
  return statuses.some((id) => {
    const def = PROGRESS_STATUS_FILTERS.find((s) => s.id === id);
    if (!def) return false;
    if (kind === "task") return (def.taskStatuses as readonly string[]).includes(status);
    return (def.testStatuses as readonly string[]).includes(status);
  });
}

export function formatProgressSprintsLabel(
  sprints: readonly ProgressSprintFilter[],
): string {
  if (sprints.length === 0) return "All sprints";
  return [...sprints]
    .map((k) => (k === "backlog" ? "Backlog" : sprintLabel(k)))
    .join(", ");
}

export function formatProgressStatusesLabel(
  statuses: readonly ProgressStatusFilter[],
): string {
  if (statuses.length === 0) return "All statuses";
  return statuses
    .map((id) => PROGRESS_STATUS_FILTERS.find((s) => s.id === id)?.label ?? id)
    .join(", ");
}

export function formatProgressSortLabel(sortBy: ProgressSortBy): string {
  return PROGRESS_SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? "ID";
}

export function formatProgressViewLabel(input: {
  sprints?: readonly ProgressSprintFilter[];
  statuses?: readonly ProgressStatusFilter[];
  sortBy?: ProgressSortBy;
}): string {
  const sprints = input.sprints ?? [];
  const statuses = input.statuses ?? [];
  const sortBy = input.sortBy ?? "id";
  const parts = [
    formatProgressSprintsLabel(sprints),
    formatProgressStatusesLabel(statuses),
    `Sort: ${formatProgressSortLabel(sortBy)}`,
  ];
  return parts.join(" · ");
}

/** Compact sprint chip options: Backlog + Sprint 0…N. */
export function listProgressSprintFilterOptions(
  count = DEFAULT_SPRINT_COUNT,
): { key: ProgressSprintFilter; label: string; shortLabel: string }[] {
  return [
    { key: "backlog", label: "Backlog", shortLabel: "Backlog" },
    ...listUpcomingSprints(count).map((s) => ({
      key: s.index as ProgressSprintFilter,
      label: s.label,
      shortLabel: s.index === 0 ? "S0" : `S${s.index}`,
    })),
  ];
}

function resolveTaskSprint(task: GyshTask): number {
  return typeof task.sprint === "number" && Number.isFinite(task.sprint)
    ? task.sprint
    : 0;
}

function resolveTestSprint(id: string, testPayload: TestStatusesPayload): number {
  const stored = testPayload.sprints?.[id];
  if (typeof stored === "number" && Number.isFinite(stored)) return stored;
  return BACKLOG_SPRINT;
}

function statusSortRank(kind: "task" | "test", status: string): number {
  const map = kind === "task" ? TASK_STATUS_SORT : TEST_STATUS_SORT;
  return map[status] ?? 50;
}

function compareProgressLines(
  a: ProgressLine,
  b: ProgressLine,
  kind: "task" | "test",
  sortBy: ProgressSortBy,
): number {
  if (sortBy === "sprint") {
    const sprintCmp = a.sprint - b.sprint;
    if (sprintCmp !== 0) return sprintCmp;
    const statusCmp = statusSortRank(kind, a.status) - statusSortRank(kind, b.status);
    if (statusCmp !== 0) return statusCmp;
    return a.id.localeCompare(b.id);
  }
  if (sortBy === "status") {
    const statusCmp = statusSortRank(kind, a.status) - statusSortRank(kind, b.status);
    if (statusCmp !== 0) return statusCmp;
    const sprintCmp = a.sprint - b.sprint;
    if (sprintCmp !== 0) return sprintCmp;
    return a.id.localeCompare(b.id);
  }
  return a.id.localeCompare(b.id);
}

function resolveTestAssigneeDisplay(
  id: string,
  testPayload: TestStatusesPayload,
  caseById: Map<string, ProgressTestCaseRef>,
): string {
  const stored = String(testPayload.assignees?.[id] ?? "").trim();
  if (stored) return normalizeProgressAssignee(stored);

  const c = caseById.get(id);
  if (!c?.assignees?.length) return "Unassigned";

  const humans = c.assignees.filter((a) => isHumanQaTester(String(a)));
  if (humans.length === 0) {
    return normalizeProgressAssignee(String(c.assignees[0] ?? ""));
  }
  if (humans.length === 1) return normalizeProgressAssignee(humans[0]);
  // Multi-human catalog owners → Both (matches sprint board labeling)
  if (
    humans.includes("tina") &&
    humans.includes("evelyn") &&
    humans.every((h) => h === "tina" || h === "evelyn")
  ) {
    return "Both";
  }
  return humans.map((h) => testOwnerLabel(h)).join(" + ");
}

function timeEntryMatchesPeople(
  entry: TimeEntry,
  people: readonly ProgressReportPerson[],
): boolean {
  if (people.length === 0) return true;
  const hay = `${entry.userName ?? ""} ${entry.userEmail ?? ""}`.toLowerCase();
  return people.some((person) => {
    if (person === "Unassigned" || person === "Both") return false;
    return hay.includes(person.toLowerCase());
  });
}

function localDayFromIsoTimestamp(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return toIsoDate(d);
}

export function dayInRange(day: string | null | undefined, from: string, to: string): boolean {
  if (!day) return false;
  return day >= from && day <= to;
}

function taskActivityDay(task: GyshTask): string | null {
  const fromUpdated = localDayFromIsoTimestamp(task.updatedAt);
  if (fromUpdated) return fromUpdated;
  const completed = mmddyyToIso(task.dateCompleted);
  return completed || null;
}

function formatWhen(isoDay: string | null, fallback = "—"): string {
  if (!isoDay) return fallback;
  const [y, m, d] = isoDay.split("-").map(Number);
  if (!y || !m || !d) return fallback;
  return `${m}/${d}/${String(y).slice(-2)}`;
}

function bucketTasks(lines: ProgressLine[]): StatusBucket[] {
  const order: TaskStatus[] = ["done", "in_progress", "blocked", "not_started"];
  const counts = new Map<string, number>();
  for (const line of lines) {
    counts.set(line.status, (counts.get(line.status) ?? 0) + 1);
  }
  return order
    .filter((s) => (counts.get(s) ?? 0) > 0)
    .map((s) => ({ status: s, label: TASK_STATUS_LABELS[s], count: counts.get(s)! }));
}

function bucketTests(lines: ProgressLine[]): StatusBucket[] {
  const order: TestStatus[] = ["pass", "fail", "in_progress", "blocked", "not_run"];
  const counts = new Map<string, number>();
  for (const line of lines) {
    counts.set(line.status, (counts.get(line.status) ?? 0) + 1);
  }
  return order
    .filter((s) => (counts.get(s) ?? 0) > 0)
    .map((s) => ({ status: s, label: STATUS_LABELS[s], count: counts.get(s)! }));
}

export function formatRangeLabel(from: string, to: string): string {
  if (from === to) return formatWhen(from);
  return `${formatWhen(from)} – ${formatWhen(to)}`;
}

/** Distinct ISO days with task/test/timesheet activity (newest first) — for history chips. */
export function collectProgressActivityDays(input: {
  tasks: GyshTask[];
  testPayload: TestStatusesPayload;
  timeEntries: TimeEntry[];
  limit?: number;
}): string[] {
  const days = new Set<string>();
  for (const task of input.tasks) {
    const day = taskActivityDay(task);
    if (day) days.add(day);
  }
  for (const iso of Object.values(input.testPayload.updatedAt ?? {})) {
    const day = localDayFromIsoTimestamp(iso);
    if (day) days.add(day);
  }
  for (const entry of input.timeEntries) {
    if (entry.workDate) days.add(entry.workDate);
  }
  const limit = input.limit ?? 30;
  return [...days].sort((a, b) => b.localeCompare(a)).slice(0, limit);
}

export function buildDailyProgressReport(input: {
  from: string;
  to: string;
  tasks: GyshTask[];
  testPayload: TestStatusesPayload;
  timeEntries: TimeEntry[];
  /** Empty / omitted = all people. */
  people?: readonly ProgressReportPerson[];
  /** Empty / omitted = all sprints. */
  sprints?: readonly ProgressSprintFilter[];
  /** Empty / omitted = all statuses. */
  statuses?: readonly ProgressStatusFilter[];
  /** Default: id. */
  sortBy?: ProgressSortBy;
}): DailyProgressReport {
  const { from, to, tasks, testPayload, timeEntries } = input;
  const people = input.people ?? [];
  const sprints = input.sprints ?? [];
  const statuses = input.statuses ?? [];
  const sortBy = input.sortBy ?? "id";
  const titleById = new Map<string, string>();
  const caseById = new Map<string, ProgressTestCaseRef>();
  for (const c of TEST_CASES) {
    titleById.set(c.id, c.title);
    caseById.set(c.id, c);
  }
  for (const c of testPayload.generatedCases ?? []) {
    titleById.set(c.id, c.title);
  }

  const taskLines: ProgressLine[] = [];
  for (const task of tasks) {
    const day = taskActivityDay(task);
    if (!dayInRange(day, from, to)) continue;
    const assignee = normalizeProgressAssignee(task.assignedTo || "Unassigned");
    if (!assigneeMatchesPeople(assignee, people)) continue;
    const sprint = resolveTaskSprint(task);
    if (!sprintMatchesFilters(sprint, sprints)) continue;
    if (!statusMatchesFilters("task", task.status, statuses)) continue;
    taskLines.push({
      id: task.id,
      title: task.description,
      status: task.status,
      statusLabel: TASK_STATUS_LABELS[task.status],
      assignee,
      when: formatWhen(day),
      sprint,
      sprintLabel: sprintLabel(sprint),
    });
  }
  taskLines.sort((a, b) => compareProgressLines(a, b, "task", sortBy));

  const testLines: ProgressLine[] = [];
  const statusIds = new Set([
    ...Object.keys(testPayload.statuses ?? {}),
    ...Object.keys(testPayload.updatedAt ?? {}),
  ]);
  for (const id of statusIds) {
    const day = localDayFromIsoTimestamp(testPayload.updatedAt?.[id]);
    if (!dayInRange(day, from, to)) continue;
    const status = (testPayload.statuses?.[id] ?? "not_run") as TestStatus;
    const assignee = resolveTestAssigneeDisplay(id, testPayload, caseById);
    if (!assigneeMatchesPeople(assignee, people)) continue;
    const sprint = resolveTestSprint(id, testPayload);
    if (!sprintMatchesFilters(sprint, sprints)) continue;
    if (!statusMatchesFilters("test", status, statuses)) continue;
    testLines.push({
      id,
      title: titleById.get(id) ?? id,
      status,
      statusLabel: STATUS_LABELS[status] ?? status,
      assignee,
      when: formatWhen(day),
      sprint,
      sprintLabel: sprintLabel(sprint),
    });
  }
  testLines.sort((a, b) => compareProgressLines(a, b, "test", sortBy));

  const openTasks = { inProgress: 0, blocked: 0, notStarted: 0 };
  for (const t of tasks) {
    if (!assigneeMatchesPeople(t.assignedTo || "Unassigned", people)) continue;
    const sprint = resolveTaskSprint(t);
    if (!sprintMatchesFilters(sprint, sprints)) continue;
    if (t.status === "in_progress") openTasks.inProgress += 1;
    else if (t.status === "blocked") openTasks.blocked += 1;
    else if (t.status === "not_started") openTasks.notStarted += 1;
  }

  const openTests = { inProgress: 0, blocked: 0, fail: 0, notRun: 0 };
  for (const [id, status] of Object.entries(testPayload.statuses ?? {})) {
    const assignee = resolveTestAssigneeDisplay(id, testPayload, caseById);
    if (!assigneeMatchesPeople(assignee, people)) continue;
    const sprint = resolveTestSprint(id, testPayload);
    if (!sprintMatchesFilters(sprint, sprints)) continue;
    if (status === "in_progress") openTests.inProgress += 1;
    else if (status === "blocked") openTests.blocked += 1;
    else if (status === "fail") openTests.fail += 1;
    else if (status === "not_run") openTests.notRun += 1;
  }

  const byPerson = new Map<string, number>();
  let timeMs = 0;
  for (const entry of timeEntries) {
    if (!dayInRange(entry.workDate, from, to)) continue;
    if (!timeEntryMatchesPeople(entry, people)) continue;
    const ms = liveElapsedMs(entry);
    timeMs += ms;
    const name = entry.userName || entry.userEmail || "Unknown";
    byPerson.set(name, (byPerson.get(name) ?? 0) + ms);
  }

  const timeByPerson = [...byPerson.entries()]
    .map(([name, ms]) => ({ name, ms, label: formatDurationHours(ms) }))
    .sort((a, b) => b.ms - a.ms);

  return {
    from,
    to,
    label: formatRangeLabel(from, to),
    viewLabel: formatProgressViewLabel({ sprints, statuses, sortBy }),
    tasks: taskLines,
    tests: testLines,
    taskBuckets: bucketTasks(taskLines),
    testBuckets: bucketTests(testLines),
    openTasks,
    openTests,
    timeMs,
    timeLabel: formatDurationHours(timeMs),
    timeByPerson,
  };
}
