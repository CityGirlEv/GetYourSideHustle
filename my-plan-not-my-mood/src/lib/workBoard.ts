/**
 * Task & QA test board — filter chips, search, and counts (GYSH-style).
 */

import { currentSprintWindow, dueDateForSprintLabel, sprintLabelWithDates } from './sprintCalendar';

import { normalizeWorkAttachments, type WorkAttachmentMeta } from './workAttachments';
import { addWorkNote, workNotesHaveText, type WorkNoteActor } from './workNoteEntries';
import {
  checkAllChecklistSteps,
  checklistAllChecked,
  clearFailedHere,
  markFailedHere,
  normalizeWorkChecklist,
  type WorkChecklistStep,
} from './workChecklist';
import {
  buildSeededSteps,
  linkedTasksForTest,
  linkedTestsForTask,
  pageHrefForWorkItem,
  qaContentSeed,
  resolvePersistedSteps,
  taskContentSeed,
} from './workItemContentSeed';
import { AUTOMATED_TEST_SEEDS } from './automatedTests';
import { buildSiteAnalyticsSeedTasks } from './siteAnalyticsCadence';
import {
  isTodaysNewTestId,
  isTodaysNewTestParentId,
} from './todaysReviewDueDates';
import {
  buildPhase1WebsiteReviewQaSeeds,
  buildPhase1WebsiteReviewTask,
} from './phase1WebsiteReview';
import {
  buildSprint2WebsiteReviewQaSeeds,
  buildSprint2WebsiteReviewTask,
} from './sprint2WebsiteReview';
import {
  buildFormWalkthroughQaSeeds,
  buildFormWalkthroughTask,
} from './formWalkthroughTests';
import {
  buildMoodWorkflowQaSeeds,
  buildMoodWorkflowTask,
} from './moodWorkflow';
import {
  buildJournalMakeReviewQaSeeds,
  buildJournalMakeReviewTasks,
  isJournalMakeReviewTaskId,
} from './journalMakeReview';
import {
  canAssignSprint,
  countRolledOverItems,
  formatRolledOverCount,
  isOutstandingWorkStatus,
  isSprintLocked,
  matchesRolledOverStatusFilter,
  rolloverLockedSprintItems,
  rolloverWorkItemSprint,
  ROLLOVER_STATUS_ID,
  ROLLOVER_STATUS_LABEL,
} from './sprintRollover';
import { parseWorkItemAudit, type WorkItemAuditEntry } from './workItemAudit';
import {
  isAutomatedQaTest,
  isInflatedQaId,
  pruneInflatedQaTests,
  suiteForQaTest,
  SUITE_LABELS,
  type TestSuite,
} from './testSuites';

export type SprintCategory = 'Sprint 0' | 'Sprint 1' | 'Sprint 2' | 'Sprint 3' | 'Sprint 4';
export type WorkPhase = 'Phase 1' | 'Phase 2' | 'Phase 3';
export type WorkPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'done' | 'blocked';
/** QA — Not Started / In Progress / Blocked / Passed, plus fail and retest. */
export type QaStatus =
  | 'untested'
  | 'in_progress'
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'fixed_retest'
  | 'failed_retest';
export type WorkAssignee =
  | 'angela'
  | 'evelyn'
  | 'dev'
  | 'qa'
  | 'unassigned'
  | 'system'
  | 'vitest'
  | 'playwright';

export const SPRINT_OPTIONS: SprintCategory[] = [
  'Sprint 0',
  'Sprint 1',
  'Sprint 2',
  'Sprint 3',
  'Sprint 4',
];

export const PHASE_OPTIONS: WorkPhase[] = ['Phase 1', 'Phase 2', 'Phase 3'];
export const PHASE_LABELS: Record<WorkPhase, string> = {
  'Phase 1': 'Phase 1 · Gear',
  'Phase 2': 'Phase 2 · Memberships — Coming Soon',
  'Phase 3': 'Phase 3 · Future',
};

export const TASK_STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'done', 'blocked'];
export const QA_STATUSES: QaStatus[] = [
  'untested',
  'in_progress',
  'blocked',
  'passed',
  'failed',
  'fixed_retest',
  'failed_retest',
];
export const PRIORITY_OPTIONS: WorkPriority[] = ['high', 'medium', 'low'];
export const TASK_ASSIGNEE_OPTIONS: WorkAssignee[] = [
  'angela',
  'evelyn',
  'dev',
  'qa',
  'unassigned',
  'vitest',
  'playwright',
];
/** People, QA, Unknown, Vitest, and Playwright on the task board. */
export const ASSIGNEE_OPTIONS: WorkAssignee[] = TASK_ASSIGNEE_OPTIONS;
/** Testing Portal chips: people, Testers, Unknown, Vitest, and Playwright. */
export const TEST_ASSIGNEE_OPTIONS: WorkAssignee[] = [
  'angela',
  'evelyn',
  'dev',
  'qa',
  'unassigned',
  'vitest',
  'playwright',
];

/** Who assigned the work. Never Unknown — System created the seeded row. */
export const ASSIGNOR_OPTIONS: WorkAssignee[] = ['angela', 'evelyn', 'dev', 'qa', 'system'];

/** Assignees available for multi-select (excludes unassigned). */
export const MULTI_ASSIGNEE_OPTIONS: WorkAssignee[] = [
  'angela',
  'evelyn',
  'dev',
  'qa',
  'vitest',
  'playwright',
];

export const TASK_CATEGORIES = [
  'Infrastructure',
  'Storefront',
  'Apparel',
  'Features',
  'Content',
  'Admin Portal',
  'Launch',
  'QA & Testing',
] as const;

export const QA_CATEGORIES = [
  'Storefront QA',
  'Affirmations QA',
  'Auth & Admin',
  'E2E Flows',
  'Content QA',
  'Vitest',
  'Playwright',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type QaCategory = (typeof QA_CATEGORIES)[number];

export const ASSIGNEE_LABELS: Record<WorkAssignee, string> = {
  angela: 'Angela',
  evelyn: 'Evelyn',
  dev: 'Dev Team',
  qa: 'Testers',
  unassigned: 'Unknown',
  system: 'System',
  vitest: 'Vitest',
  playwright: 'Playwright',
};

export function isPersonAssignor(value: unknown): value is WorkAssignee {
  return value === 'angela' || value === 'evelyn' || value === 'dev' || value === 'qa';
}

/** Assignor is never Unknown. Missing or Unknown seeded rows were created by System. */
export function normalizeAssignor(value: unknown): WorkAssignee {
  if (value === 'system' || isPersonAssignor(value)) return value;
  return 'system';
}

/** Map the signed-in portal user to a board person, or System when it is not a named assignee. */
export function workAssigneeFromActor(actor?: { email?: string; name?: string } | null): WorkAssignee {
  const email = String(actor?.email ?? '').trim().toLowerCase();
  const name = String(actor?.name ?? '').trim().toLowerCase();
  if (email.includes('angela') || name.includes('angela')) return 'angela';
  if (email.includes('evelyn') || name.includes('evelyn')) return 'evelyn';
  if (email.includes('dev') || /\bdev\b/.test(name)) return 'dev';
  return 'system';
}

const TASK_PROGRESS_RANK: Record<TaskStatus, number> = {
  not_started: 0,
  blocked: 1,
  in_progress: 2,
  done: 3,
};

/** Automated suites own Vitest/Playwright. Testers, Angela, Evelyn, and Dev stay named. Everyone else is Unknown. */
export function normalizeTestAssignee(assignee: unknown, suite?: TestSuite): WorkAssignee {
  if (suite === 'vitest' || suite === 'playwright') return suite;
  if (assignee === 'angela' || assignee === 'evelyn' || assignee === 'dev' || assignee === 'qa') {
    return assignee;
  }
  return 'unassigned';
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
};

export type RolloverStatusFilter = typeof ROLLOVER_STATUS_ID;
export type TaskStatusFilter = TaskStatus | RolloverStatusFilter;
export type QaStatusFilter = QaStatus | RolloverStatusFilter;

export const TASK_STATUS_FILTER_OPTIONS: TaskStatusFilter[] = [...TASK_STATUSES, ROLLOVER_STATUS_ID];
export const QA_STATUS_FILTER_OPTIONS: QaStatusFilter[] = [...QA_STATUSES, ROLLOVER_STATUS_ID];
export const TASK_STATUS_FILTER_LABELS: Record<TaskStatusFilter, string> = {
  ...TASK_STATUS_LABELS,
  [ROLLOVER_STATUS_ID]: ROLLOVER_STATUS_LABEL,
};

export const QA_STATUS_LABELS: Record<QaStatus, string> = {
  untested: 'Not Started',
  in_progress: 'In Progress',
  passed: 'Passed',
  failed: 'Failed',
  blocked: 'Blocked',
  fixed_retest: 'Fixed / Retest',
  failed_retest: 'Failed / Retest',
};

export const QA_STATUS_FILTER_LABELS: Record<QaStatusFilter, string> = {
  ...QA_STATUS_LABELS,
  [ROLLOVER_STATUS_ID]: ROLLOVER_STATUS_LABEL,
};

/** Compact chip labels (FXR / FD/R) for Fixed/Retest and Failed/Retest. */
export const QA_STATUS_SHORT_LABELS: Record<QaStatus, string> = {
  untested: 'Not Started',
  in_progress: 'In Progress',
  passed: 'Passed',
  failed: 'Failed',
  blocked: 'Blocked',
  fixed_retest: 'FXR',
  failed_retest: 'FD/R',
};

export const PRIORITY_LABELS: Record<WorkPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export interface TaskItem {
  id: string;
  title: string;
  /** Overall description of the task (auto-seeded when empty). */
  description?: string;
  notes?: string;
  /** Ordered steps. Setting status to Done checks any remaining boxes. Super Admin can edit/delete. */
  steps?: WorkChecklistStep[];
  /** Related QA test ids for tasks that need testing. */
  linkedTestIds?: string[];
  sprint: SprintCategory;
  phase?: WorkPhase;
  category: TaskCategory;
  priority: WorkPriority;
  status: TaskStatus;
  assignee: WorkAssignee;
  assignor?: WorkAssignee;
  /** ISO date `YYYY-MM-DD`, or empty when unset. */
  dueDate?: string;
  /** Links split copies when multiple assignees own the same logical task. */
  groupId?: string;
  attachments?: WorkAttachmentMeta[];
  /** When true, this task is on the upcoming agenda. */
  onAgenda?: boolean;
  /** Closed-sprint carryover. Work status stays Not Started / In Progress / Done. */
  rolledOver?: boolean;
  /** ISO date `YYYY-MM-DD` when the task first reached Done. */
  completedOn?: string;
  audit?: WorkItemAuditEntry[];
}

export interface QaTestItem {
  id: string;
  title: string;
  /** Overall description of the test (auto-seeded when empty). */
  description?: string;
  /** Stamped notes thread (JSON) or legacy plain text. */
  desc: string;
  /** Ordered steps. Setting status to Passed checks any remaining boxes. Super Admin can edit/delete. */
  steps?: WorkChecklistStep[];
  /** Related task ids this test covers. */
  linkedTaskIds?: string[];
  sprint: SprintCategory;
  phase?: WorkPhase;
  category: QaCategory;
  priority: WorkPriority;
  status: QaStatus;
  assignee: WorkAssignee;
  assignor?: WorkAssignee;
  /** ISO date `YYYY-MM-DD`, or empty when unset. */
  dueDate?: string;
  /** Links split copies when multiple assignees own the same logical test. */
  groupId?: string;
  attachments?: WorkAttachmentMeta[];
  /** manual = Angela/Evelyn walkthrough; vitest/playwright = automated suites. */
  suite?: TestSuite;
  /** Closed-sprint carryover. Work status stays Not Started / Passed / Failed. */
  rolledOver?: boolean;
  /** ISO date `YYYY-MM-DD` when the test first reached Passed. */
  completedOn?: string;
  audit?: WorkItemAuditEntry[];
}

/** Display code for a task id (`t-12` → `T-12`). Never uses Date.now()-style ids. */
export function formatTaskCode(id: string, allTasks: Array<{ id: string }> = []): string {
  const root = String(id || '').split('::')[0];
  const match = root.match(/^t-(\d+)$/i);
  if (match) return `T-${match[1]}`;
  const idx = allTasks.findIndex((item) => item.id === id);
  if (idx >= 0) return `T-${idx + 1}`;
  return 'T-?';
}

/** Stable Q-n from position in the full test list (1-based). Vitest/Playwright keep catalog ids. */
export function formatQaCode(id: string, allTests: Array<{ id: string }> = []): string {
  const root = String(id || '').split('::')[0];
  if (/^VT-/i.test(root) || /^PW-/i.test(root)) return root.toUpperCase();
  const idx = allTests.findIndex((item) => item.id === id);
  if (idx >= 0) {
    const manuals = allTests.filter((item) => suiteForQaTest(item) === 'manual');
    const manualIdx = manuals.findIndex((item) => item.id === id);
    if (manualIdx >= 0) return `Q-${manualIdx + 1}`;
    return `Q-${idx + 1}`;
  }
  const digits = String(id || '').match(/(\d+)$/);
  return digits && Number(digits[1]) < 10_000 ? `Q-${digits[1]}` : `Q-${String(id || '').slice(0, 10).toUpperCase()}`;
}

/** Next `t-N` id after the highest existing canonical task number. */
export function nextTaskId(existing: Array<{ id: string }>): string {
  let max = 0;
  for (const item of existing) {
    const root = String(item.id || '').split('::')[0];
    const match = root.match(/^t-(\d+)$/i);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `t-${max + 1}`;
}

function isCanonicalTaskRootId(root: string): boolean {
  return /^t-\d+$/i.test(root);
}

/**
 * Rewrite legacy `task-<timestamp>` (and other non-canonical) ids to short `t-N`.
 * Keeps `::assignee` split suffixes.
 */
export function canonicalizeTaskIds(tasks: TaskItem[]): TaskItem[] {
  let max = 0;
  for (const item of tasks) {
    const root = String(item.id || '').split('::')[0];
    const match = root.match(/^t-(\d+)$/i);
    if (match) max = Math.max(max, Number(match[1]));
  }

  return tasks.map((task) => {
    const raw = String(task.id || '');
    const parts = raw.split('::');
    const root = parts[0] || '';
    const suffix = parts.length > 1 ? `::${parts.slice(1).join('::')}` : '';
    if (isCanonicalTaskRootId(root)) return task;
    max += 1;
    const nextId = `t-${max}${suffix}`;
    return {
      ...task,
      id: nextId,
      groupId: task.groupId || root || undefined,
    };
  });
}

export function taskDedupeKey(task: { title: string; assignee: WorkAssignee }): string {
  return `${task.assignee}::${task.title.trim().toLowerCase().replace(/\s+/g, ' ')}`;
}

function canonicalTaskNumber(id: string): number | null {
  const match = String(id || '').split('::')[0].match(/^t-(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function preferTaskIdentity(a: TaskItem, b: TaskItem, seedIds: Set<string>): TaskItem {
  const aRoot = String(a.id || '').split('::')[0];
  const bRoot = String(b.id || '').split('::')[0];
  const aSeed = seedIds.has(aRoot);
  const bSeed = seedIds.has(bRoot);
  if (aSeed && !bSeed) return a;
  if (!aSeed && bSeed) return b;
  const aNum = canonicalTaskNumber(aRoot);
  const bNum = canonicalTaskNumber(bRoot);
  if (aNum != null && bNum != null && bNum !== aNum) return bNum < aNum ? b : a;
  return a;
}

function mergeDuplicateTask(kept: TaskItem, extra: TaskItem, seedIds: Set<string>): TaskItem {
  const identity = preferTaskIdentity(kept, extra, seedIds);
  const extraRank = TASK_PROGRESS_RANK[extra.status] ?? 0;
  const keptRank = TASK_PROGRESS_RANK[kept.status] ?? 0;
  const progress = extraRank > keptRank ? extra : kept;
  return {
    ...progress,
    id: identity.id,
    groupId: identity.groupId,
    title: identity.title || progress.title,
    assignee: identity.assignee,
  };
}

/**
 * Shared-board unions plus t-N rewrites cloned the same titles into thousands of rows.
 * Keep one task per title+assignee (prefer seed ids, keep the most progressed status).
 */
export function pruneDuplicateTasks(tasks: TaskItem[]): { tasks: TaskItem[]; removedIds: string[] } {
  const seedIds = new Set(INITIAL_TASKS.map((seed) => seed.id.split('::')[0]));
  const best = new Map<string, TaskItem>();
  const order: string[] = [];
  const removedIds: string[] = [];

  for (const task of tasks) {
    const key = taskDedupeKey(task);
    const current = best.get(key);
    if (!current) {
      best.set(key, task);
      order.push(key);
      continue;
    }
    const merged = mergeDuplicateTask(current, task, seedIds);
    const loserId = merged.id === task.id ? current.id : task.id;
    if (loserId !== merged.id) removedIds.push(loserId);
    best.set(key, merged);
  }

  return { tasks: order.map((key) => best.get(key)!), removedIds };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseWorkDueDate(value: unknown): string {
  const raw = String(value ?? '').trim();
  return ISO_DATE.test(raw) ? raw : '';
}

export function formatWorkDueDate(value?: string): string {
  const iso = parseWorkDueDate(value);
  if (!iso) return 'No due date';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatWorkDueDateShort(value?: string): string {
  const iso = parseWorkDueDate(value);
  if (!iso) return 'No date';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function workBoardTodayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function matchesDueDateFilter(
  dueDate: string | undefined,
  filter: DueDateFilter,
  today = workBoardTodayIso(),
): boolean {
  if (filter === 'all') return true;
  const due = parseWorkDueDate(dueDate);
  if (filter === 'none') return !due;
  if (!due) return false;
  if (filter === 'overdue') return due < today;
  if (filter === 'today') return due === today;
  return due > today;
}

export function isWorkDueDatePast(dueDate: string | undefined, today = workBoardTodayIso()): boolean {
  const due = parseWorkDueDate(dueDate);
  return Boolean(due && due < today);
}

export function toggleWorkBoardSort(current: WorkBoardSort, key: WorkBoardSortKey): WorkBoardSort {
  if (current.key === key) {
    return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
  }
  return { key, dir: 'asc' };
}

export function singleFilterValue<T extends string>(selected: Set<T>): string {
  return selected.size === 1 ? [...selected][0]! : 'all';
}

export function setSingleFilterValue<T extends string>(value: string, ordered: readonly T[]): Set<T> {
  if (!value || value === 'all') return new Set();
  return (ordered as readonly string[]).includes(value) ? new Set([value as T]) : new Set();
}

function sprintSortIndex(sprint: string): number {
  const index = SPRINT_OPTIONS.indexOf(sprint as SprintCategory);
  return index < 0 ? SPRINT_OPTIONS.length : index;
}

export type WorkBoardSortRow = {
  id: string;
  title: string;
  sprint: string;
  status: string;
  assignee: string;
  dueDate?: string;
  priority?: string;
};

const WORK_STATUS_SORT_INDEX: Record<string, number> = {
  not_started: 0,
  untested: 0,
  in_progress: 1,
  blocked: 2,
  failed: 3,
  failed_retest: 3,
  fixed_retest: 4,
  done: 5,
  passed: 5,
};

/** Done/Passed sink to the bottom of the board. */
export function workBoardCompletionRank(status: string): number {
  return status === 'done' || status === 'passed' ? 1 : 0;
}

export function workBoardPriorityRank(priority?: string): number {
  const index = PRIORITY_OPTIONS.indexOf(priority as WorkPriority);
  return index < 0 ? PRIORITY_OPTIONS.length : index;
}

/** Not Started / Untested, then In Progress, then the rest. */
export function workBoardStatusRank(status: string): number {
  return WORK_STATUS_SORT_INDEX[status] ?? 8;
}

function compareWorkDueDates(aDue: string, bDue: string): number {
  if (!aDue && !bDue) return 0;
  if (!aDue) return 1;
  if (!bDue) return -1;
  return aDue.localeCompare(bDue);
}

/** Open work first, then urgency, then Not Started before In Progress. */
export function compareWorkBoardBoardOrder(a: WorkBoardSortRow, b: WorkBoardSortRow): number {
  const done = workBoardCompletionRank(a.status) - workBoardCompletionRank(b.status);
  if (done) return done;
  const urgency = workBoardPriorityRank(a.priority) - workBoardPriorityRank(b.priority);
  if (urgency) return urgency;
  const status = workBoardStatusRank(a.status) - workBoardStatusRank(b.status);
  if (status) return status;
  const due = compareWorkDueDates(parseWorkDueDate(a.dueDate), parseWorkDueDate(b.dueDate));
  if (due) return due;
  return a.id.localeCompare(b.id);
}

export function compareWorkBoardRows(a: WorkBoardSortRow, b: WorkBoardSortRow, sort: WorkBoardSort): number {
  const dir = sort.dir === 'desc' ? -1 : 1;
  let cmp = 0;
  if (sort.key === 'status') cmp = compareWorkBoardBoardOrder(a, b);
  else if (sort.key === 'title') cmp = a.title.localeCompare(b.title);
  else if (sort.key === 'sprint') cmp = sprintSortIndex(a.sprint) - sprintSortIndex(b.sprint);
  else if (sort.key === 'assignee') {
    cmp = (ASSIGNEE_LABELS[a.assignee as WorkAssignee] || a.assignee).localeCompare(
      ASSIGNEE_LABELS[b.assignee as WorkAssignee] || b.assignee,
    );
  } else {
    cmp = compareWorkDueDates(parseWorkDueDate(a.dueDate), parseWorkDueDate(b.dueDate));
  }
  if (cmp !== 0) return cmp * dir;
  if (sort.key !== 'status') {
    const board = compareWorkBoardBoardOrder(a, b);
    if (board) return board;
  }
  return a.id.localeCompare(b.id);
}

export function sortWorkBoardItems<T extends WorkBoardSortRow>(items: T[], sort: WorkBoardSort): T[] {
  return [...items].sort((a, b) => compareWorkBoardRows(a, b, sort));
}

export function toggleWorkItemOpen(
  open: Record<string, boolean>,
  id: string,
): Record<string, boolean> {
  return { ...open, [id]: !open[id] };
}

export const SAVE_ALL_LABEL = 'Save All';

/** Record which cards have local edits that still need a database save. */
export function markWorkItemDirty(prev: ReadonlySet<string>, ids: readonly string[]): Set<string> {
  const next = new Set(prev);
  for (const id of ids) {
    const trimmed = String(id ?? '').trim();
    if (trimmed) next.add(trimmed);
  }
  return next;
}

export function workItemIsDirty(dirtyIds: ReadonlySet<string>, id: string): boolean {
  return dirtyIds.has(id);
}

export function anyWorkItemsDirty(...sets: Array<ReadonlySet<string>>): boolean {
  return sets.some((set) => set.size > 0);
}

/** Idle save looks gray; live save uses the rust fill. Do not use rust at reduced opacity. */
export function workBoardSaveButtonTone(enabled: boolean, options?: { clickable?: boolean }): string {
  const clickable = options?.clickable ?? enabled;
  const cursor = clickable ? 'cursor-pointer' : 'cursor-not-allowed';
  if (enabled) {
    return `bg-[#C2410C] hover:bg-[#9A3412] text-white border-[#1F1917] ${cursor}`;
  }
  return `bg-[#D4CCC2] text-[#7A716A] border-[#C4BBB0] ${cursor} hover:bg-[#D4CCC2]`;
}

/** Save All stays clickable so persist cannot get trapped behind a gray button. */
export function workBoardPersistIsDisabled(): false {
  return false;
}

/** Collapse every row that belongs to a sprint. Used when that sprint section is opened. */
export function collapseWorkItemsInSprint<T extends { id: string; sprint: SprintCategory }>(
  openRows: Record<string, boolean>,
  items: T[],
  sprint: SprintCategory,
): Record<string, boolean> {
  const next = { ...openRows };
  for (const item of items) {
    if (item.sprint === sprint) next[item.id] = false;
  }
  return next;
}

export function phaseForSprint(_sprint: SprintCategory, explicit?: WorkPhase): WorkPhase {
  if (explicit && PHASE_OPTIONS.includes(explicit)) return explicit;
  return 'Phase 1';
}

export function itemPhase(item: { sprint: SprintCategory; phase?: WorkPhase }): WorkPhase {
  return phaseForSprint(item.sprint, item.phase);
}

export function currentPhaseLabel(now = new Date()): WorkPhase {
  return phaseForSprint(currentSprintLabel(now));
}

export function getWorkItemGroupId(item: { id: string; groupId?: string }): string {
  if (item.groupId) return item.groupId;
  const splitIdx = item.id.indexOf('::');
  return splitIdx >= 0 ? item.id.slice(0, splitIdx) : item.id;
}

export function findGroupItems<T extends { id: string; groupId?: string }>(
  items: T[],
  itemId: string,
): T[] {
  const target = items.find((i) => i.id === itemId);
  if (!target) return [];
  const gid = getWorkItemGroupId(target);
  return items.filter((i) => getWorkItemGroupId(i) === gid);
}

export function getGroupAssignees<T extends { id: string; groupId?: string; assignee: WorkAssignee }>(
  items: T[],
  itemId: string,
): WorkAssignee[] {
  return findGroupItems(items, itemId).map((i) => i.assignee);
}

export function isSplitWorkItem<T extends { id: string; groupId?: string }>(
  items: T[],
  item: T,
): boolean {
  const gid = getWorkItemGroupId(item);
  return items.filter((i) => getWorkItemGroupId(i) === gid).length > 1;
}

/**
 * Replace one logical task/test with one row per assignee so each person can update status independently.
 */
export function reassignWorkItemGroup<T extends TaskItem | QaTestItem>(
  items: T[],
  itemId: string,
  selectedAssignees: WorkAssignee[],
): T[] {
  const groupItems = findGroupItems(items, itemId);
  if (groupItems.length === 0) return items;

  const template = { ...groupItems[0] };
  const rootId = getWorkItemGroupId(template);
  const uniqueAssignees = [
    ...new Set(selectedAssignees.filter((a) => a !== 'unassigned')),
  ] as WorkAssignee[];

  const assignees =
    uniqueAssignees.length > 0 ? uniqueAssignees : (['unassigned'] as WorkAssignee[]);

  const statusByAssignee = new Map(groupItems.map((i) => [i.assignee, i]));
  const idsToRemove = new Set(groupItems.map((i) => i.id));

  let newItems: T[];
  if (assignees.length === 1) {
    const assignee = assignees[0]!;
    const existing = statusByAssignee.get(assignee);
    newItems = [
      {
        ...(existing ?? template),
        id: rootId,
        assignee,
        groupId: undefined,
      } as T,
    ];
  } else {
    newItems = assignees.map((assignee) => {
      const existing = statusByAssignee.get(assignee);
      return {
        ...(existing ?? template),
        id: `${rootId}::${assignee}`,
        assignee,
        groupId: rootId,
      } as T;
    });
  }

  return [...items.filter((i) => !idsToRemove.has(i.id)), ...newItems];
}

export function createSplitWorkItems<T extends TaskItem | QaTestItem>(
  template: Omit<T, 'id' | 'assignee' | 'groupId'>,
  assignees: WorkAssignee[],
  rootId: string,
): T[] {
  const active = [...new Set(assignees.filter((a) => a !== 'unassigned'))];
  if (active.length === 0) {
    return [{ ...template, id: rootId, assignee: 'unassigned', groupId: undefined } as T];
  }
  if (active.length === 1) {
    return [{ ...template, id: rootId, assignee: active[0]!, groupId: undefined } as T];
  }
  return active.map(
    (assignee) =>
      ({
        ...template,
        id: `${rootId}::${assignee}`,
        assignee,
        groupId: rootId,
      }) as T,
  );
}

export type WorkBoardFilters<T extends string> = {
  phase: Set<WorkPhase>;
  sprint: Set<SprintCategory>;
  status: Set<T>;
  priority: Set<WorkPriority>;
  assignee: Set<WorkAssignee>;
  category: Set<string>;
  due: DueDateFilter;
};

export const DUE_DATE_FILTERS = ['all', 'overdue', 'today', 'upcoming', 'none'] as const;
export type DueDateFilter = (typeof DUE_DATE_FILTERS)[number];

export const DUE_DATE_FILTER_LABELS: Record<DueDateFilter, string> = {
  all: 'All dates',
  overdue: 'Past due',
  today: 'Due today',
  upcoming: 'Upcoming',
  none: 'No due date',
};

export const WORK_BOARD_SORT_KEYS = ['title', 'sprint', 'status', 'assignee', 'dueDate'] as const;
export type WorkBoardSortKey = (typeof WORK_BOARD_SORT_KEYS)[number];
export type WorkBoardSortDir = 'asc' | 'desc';
export type WorkBoardSort = { key: WorkBoardSortKey; dir: WorkBoardSortDir };

export const WORK_BOARD_SORT_LABELS: Record<WorkBoardSortKey, string> = {
  title: 'Title',
  sprint: 'Sprint',
  status: 'Status',
  assignee: 'Assignee',
  dueDate: 'Due date',
};

export const DEFAULT_WORK_BOARD_SORT: WorkBoardSort = { key: 'status', dir: 'asc' };

export function emptyFilters<T extends string>(): WorkBoardFilters<T> {
  return {
    phase: new Set(),
    sprint: new Set(),
    status: new Set(),
    priority: new Set(),
    assignee: new Set(),
    category: new Set(),
    due: 'all',
  };
}

/** All chips start on All so every sprint is visible. */
export function defaultWorkBoardFilters<T extends string>(
  _now = new Date(),
): WorkBoardFilters<T> {
  return emptyFilters<T>();
}

const PERSON_SPRINT_BOARD_ASSIGNEES = new Set<WorkAssignee>(['angela', 'evelyn', 'dev']);

/** Current sprint + the signed-in person's work. Status, priority, and category stay All. */
export function defaultPersonSprintBoardFilters<T extends string>(
  actor?: { email?: string; name?: string } | null,
  now = new Date(),
): WorkBoardFilters<T> {
  const filters = emptyFilters<T>();
  filters.sprint = new Set([currentSprintLabel(now)]);
  const assignee = workAssigneeFromActor(actor);
  if (PERSON_SPRINT_BOARD_ASSIGNEES.has(assignee)) {
    filters.assignee = new Set([assignee]);
  }
  return filters;
}

/** Task List landing filters: current sprint, signed-in name, All statuses. */
export function defaultTaskBoardFilters<T extends string>(
  actor?: { email?: string; name?: string } | null,
  now = new Date(),
): WorkBoardFilters<T> {
  return defaultPersonSprintBoardFilters<T>(actor, now);
}

/** Testing Portal: current sprint and every assignee so all testers show. Status, priority, and category stay All. */
export function defaultTestingPortalFilters<T extends string>(
  _actor?: { email?: string; name?: string } | null,
  now = new Date(),
): WorkBoardFilters<T> {
  const filters = emptyFilters<T>();
  filters.sprint = new Set([currentSprintLabel(now)]);
  return filters;
}

export function isWorkBoardFilterActive<T extends string>(
  filters: WorkBoardFilters<T>,
  search = '',
): boolean {
  return (
    filters.phase.size > 0 ||
    filters.sprint.size > 0 ||
    filters.status.size > 0 ||
    filters.priority.size > 0 ||
    filters.assignee.size > 0 ||
    filters.category.size > 0 ||
    filters.due !== 'all' ||
    search.trim().length > 0
  );
}

export function workBoardFilterKey<T extends string>(
  filters: WorkBoardFilters<T>,
  search = '',
): string {
  return JSON.stringify({
    phase: [...filters.phase].sort(),
    sprint: [...filters.sprint].sort(),
    status: [...filters.status].sort(),
    priority: [...filters.priority].sort(),
    assignee: [...filters.assignee].sort(),
    category: [...filters.category].sort(),
    due: filters.due ?? 'all',
    search: search.trim().toLowerCase(),
  });
}

export function toggleSelectedId(ids: Set<string>, id: string): Set<string> {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function setManySelected(ids: Set<string>, nextIds: string[], selectAll: boolean): Set<string> {
  const next = new Set(ids);
  for (const id of nextIds) {
    if (selectAll) next.add(id);
    else next.delete(id);
  }
  return next;
}

export function allIdsSelected(selected: Set<string>, ids: string[]): boolean {
  return ids.length > 0 && ids.every((id) => selected.has(id));
}

export type FilterChipClickOpts<T> = {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  ordered?: readonly T[];
  lastIndex?: number | null;
};

export function toggleFilterValue<T>(prev: Set<T>, value: T): Set<T> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function selectAllFilterValues<T>(ordered: readonly T[]): Set<T> {
  return new Set();
}

export function isFilterShowingAll<T>(selected: Set<T>, ordered: readonly T[]): boolean {
  return selected.size === 0 || (ordered.length > 0 && ordered.every((value) => selected.has(value)));
}

export function normalizeFilterSelection<T>(selected: Set<T>, ordered: readonly T[]): Set<T> {
  if (ordered.length > 0 && selected.size === ordered.length) return new Set<T>();
  return selected;
}

export function applyFilterChipClick<T>(
  prev: Set<T>,
  value: T,
  opts: FilterChipClickOpts<T> = {},
): { next: Set<T>; lastIndex: number | null } {
  const ordered = opts.ordered ?? [];
  const idx = ordered.indexOf(value);
  const lastIndex = idx >= 0 ? idx : (opts.lastIndex ?? null);

  if (opts.shiftKey && opts.lastIndex != null && idx >= 0 && ordered.length > 0) {
    const next = new Set(prev);
    for (let i = Math.min(opts.lastIndex, idx); i <= Math.max(opts.lastIndex, idx); i++) {
      next.add(ordered[i]!);
    }
    return { next: normalizeFilterSelection(next, ordered), lastIndex: idx };
  }

  const next = normalizeFilterSelection(toggleFilterValue(prev, value), ordered);
  return { next, lastIndex };
}

export interface FilterChipCount {
  id: string;
  label: string;
  total: number;
  done: number;
  accent?: string;
}

function inferTaskCategory(title: string, sprint?: string): TaskCategory {
  const t = title.toLowerCase();
  if (t.includes('qa') || t.includes('test') || t.includes('vitest')) return 'QA & Testing';
  if (t.includes('admin') || t.includes('user') || t.includes('auth')) return 'Admin Portal';
  if (t.includes('feature') || t.includes('affirmation') || t.includes('mood')) return 'Features';
  if (t.includes('deploy') || t.includes('launch') || t.includes('staging')) return 'Launch';
  if (sprint === 'Sprint 0') return 'Infrastructure';
  if (sprint === 'Sprint 1') return 'Storefront';
  if (sprint === 'Sprint 2') return 'Features';
  if (sprint === 'Sprint 3') return 'Admin Portal';
  return 'Launch';
}

export function normalizeTask(raw: Record<string, unknown>): TaskItem {
  const legacySprint = raw.sprint ?? raw.category;
  const parsedSprint = SPRINT_OPTIONS.includes(legacySprint as SprintCategory)
    ? (legacySprint as SprintCategory)
    : 'Sprint 4';
  const sprint = parsedSprint;

  let status: TaskStatus = 'not_started';
  if (raw.status && TASK_STATUSES.includes(raw.status as TaskStatus)) {
    status = raw.status as TaskStatus;
  } else if (raw.completed === true) {
    status = 'done';
  }

  const categoryRaw = raw.category;
  const category =
    TASK_CATEGORIES.includes(categoryRaw as TaskCategory) && raw.sprint
      ? (categoryRaw as TaskCategory)
      : inferTaskCategory(String(raw.title ?? ''), sprint);

  const assignee = TASK_ASSIGNEE_OPTIONS.includes(raw.assignee as WorkAssignee)
    ? (raw.assignee as WorkAssignee)
    : 'unassigned';

  const priority = PRIORITY_OPTIONS.includes(raw.priority as WorkPriority)
    ? (raw.priority as WorkPriority)
    : 'medium';

  const phase = PHASE_OPTIONS.includes(raw.phase as WorkPhase)
    ? (raw.phase as WorkPhase)
    : phaseForSprint(sprint);

  const assignor = normalizeAssignor(raw.assignor);

  const id = String(raw.id ?? 'task-new');
  const seed = taskContentSeed(id);
  const seededSteps = seed ? buildSeededSteps(id, seed.steps) : [];
  const audit = parseWorkItemAudit(raw.audit);
  const completedOn = parseWorkDueDate(raw.completedOn) || undefined;

  return rolloverWorkItemSprint({
    id,
    title: String(raw.title ?? ''),
    description:
      String(raw.description ?? '').trim() ||
      seed?.description ||
      String(raw.title ?? '').trim(),
    notes: String(raw.notes ?? ''),
    steps: resolvePersistedSteps(raw.steps, seededSteps, pageHrefForWorkItem(id)),
    linkedTestIds: linkedTestsForTask(id),
    sprint,
    phase,
    category,
    priority,
    status,
    assignee,
    assignor,
    dueDate: parseWorkDueDate(raw.dueDate) || dueDateForSprintLabel(parsedSprint),
    attachments: normalizeWorkAttachments(raw.attachments),
    onAgenda: raw.onAgenda === true,
    rolledOver: raw.rolledOver === true,
    completedOn,
    ...(audit.length > 0 ? { audit } : {}),
  });
}

export function normalizeTasks(rawList: unknown[]): TaskItem[] {
  return pruneDuplicateTasks(
    canonicalizeTaskIds(rawList.map((item) => normalizeTask(item as Record<string, unknown>))),
  ).tasks;
}

export type TaskInlinePatch = Partial<
  Pick<
    TaskItem,
    | 'title'
    | 'description'
    | 'notes'
    | 'steps'
    | 'sprint'
    | 'phase'
    | 'category'
    | 'priority'
    | 'status'
    | 'assignee'
    | 'assignor'
    | 'dueDate'
    | 'attachments'
    | 'onAgenda'
  >
>;

export const BLOCKED_NOTE_REQUIRED_MESSAGE = 'Enter a note explaining why this task is blocked.';

export function taskNeedsBlockedNote(
  currentStatus: string | undefined,
  nextStatus: string | undefined,
): boolean {
  return nextStatus === 'blocked' && currentStatus !== 'blocked';
}

export function applyTaskBlockedWithNote(
  task: TaskItem,
  noteText: string,
  noteActor: WorkNoteActor,
  patchActor?: WorkAssignee,
): { ok: true; task: TaskItem } | { ok: false; error: string } {
  const note = noteText.trim();
  if (!note) return { ok: false, error: BLOCKED_NOTE_REQUIRED_MESSAGE };
  if (task.status === 'blocked') return { ok: true, task };
  const notes = addWorkNote(task.notes, noteActor, note);
  return { ok: true, task: applyTaskInlinePatch(task, { status: 'blocked', notes }, patchActor) };
}

export function applyTasksBlockedWithNote(
  tasks: TaskItem[],
  ids: Iterable<string>,
  noteText: string,
  noteActor: WorkNoteActor,
  patchActor?: WorkAssignee,
): { ok: true; tasks: TaskItem[] } | { ok: false; error: string } {
  const note = noteText.trim();
  if (!note) return { ok: false, error: BLOCKED_NOTE_REQUIRED_MESSAGE };
  const selected = new Set(ids);
  return {
    ok: true,
    tasks: tasks.map((task) => {
      if (!selected.has(task.id) || !taskNeedsBlockedNote(task.status, 'blocked')) return task;
      const applied = applyTaskBlockedWithNote(task, note, noteActor, patchActor);
      return applied.ok ? applied.task : task;
    }),
  };
}

export function applyTaskInlinePatch(task: TaskItem, patch: TaskInlinePatch, actor?: WorkAssignee): TaskItem {
  const next: TaskItem = { ...task };
  if (patch.title !== undefined) {
    next.title = patch.title;
  }
  if (patch.description !== undefined) next.description = patch.description;
  if (patch.notes !== undefined) next.notes = patch.notes;
  if (patch.steps !== undefined) next.steps = normalizeWorkChecklist(patch.steps);
  if (patch.sprint !== undefined && SPRINT_OPTIONS.includes(patch.sprint) && canAssignSprint(patch.sprint)) {
    next.sprint = patch.sprint;
    if (patch.dueDate === undefined) next.dueDate = dueDateForSprintLabel(patch.sprint);
  }
  if (patch.phase !== undefined && PHASE_OPTIONS.includes(patch.phase)) next.phase = patch.phase;
  if (patch.category !== undefined && (TASK_CATEGORIES as readonly string[]).includes(patch.category)) {
    next.category = patch.category;
  }
  if (patch.priority !== undefined && PRIORITY_OPTIONS.includes(patch.priority)) next.priority = patch.priority;
  if (patch.status !== undefined && TASK_STATUSES.includes(patch.status)) {
    const blockedMissingNote =
      taskNeedsBlockedNote(task.status, patch.status) &&
      (patch.notes === undefined || !workNotesHaveText(patch.notes));
    if (!blockedMissingNote) {
      if (patch.status === 'done') {
        next.steps = checkAllChecklistSteps(next.steps ?? task.steps);
      }
      next.status = patch.status;
      if (patch.status === 'done') {
        next.completedOn = next.completedOn || workBoardTodayIso();
      } else if (isOutstandingWorkStatus(patch.status)) {
        next.completedOn = undefined;
      }
    }
  }
  if (patch.assignee !== undefined && ASSIGNEE_OPTIONS.includes(patch.assignee)) next.assignee = patch.assignee;
  if (patch.assignor !== undefined) {
    next.assignor = normalizeAssignor(patch.assignor);
  } else if (patch.assignee !== undefined && next.assignee !== task.assignee) {
    next.assignor = normalizeAssignor(actor);
  }
  next.assignor = normalizeAssignor(next.assignor);
  if (patch.dueDate !== undefined) {
    next.dueDate = patch.dueDate === '' ? '' : parseWorkDueDate(patch.dueDate) || task.dueDate;
  }
  if (patch.attachments !== undefined) next.attachments = normalizeWorkAttachments(patch.attachments);
  if (patch.onAgenda !== undefined) next.onAgenda = Boolean(patch.onAgenda);
  return patch.status !== undefined ? rolloverWorkItemSprint(next) : next;
}

export function applyTaskInlinePatchToList(
  tasks: TaskItem[],
  id: string,
  patch: TaskInlinePatch,
  actor?: WorkAssignee,
): TaskItem[] {
  return tasks.map((task) => (task.id === id ? applyTaskInlinePatch(task, patch, actor) : task));
}

export function applyBulkTaskPatch(
  tasks: TaskItem[],
  ids: Iterable<string>,
  patch: TaskInlinePatch,
  actor?: WorkAssignee,
): TaskItem[] {
  const selected = new Set(ids);
  return tasks.map((task) => (selected.has(task.id) ? applyTaskInlinePatch(task, patch, actor) : task));
}

export type QaInlinePatch = Partial<
  Pick<
    QaTestItem,
    | 'title'
    | 'description'
    | 'desc'
    | 'steps'
    | 'sprint'
    | 'phase'
    | 'category'
    | 'priority'
    | 'status'
    | 'assignee'
    | 'assignor'
    | 'dueDate'
    | 'attachments'
    | 'suite'
  >
>;

/** Remember the tester, hand Failed tests to Dev, and return Fixed/FD retests to the tester. */
export function qaWorkflowFieldsForStatus(
  test: QaTestItem,
  nextStatus: QaStatus,
): Pick<QaTestItem, 'status' | 'assignee' | 'assignor'> {
  if (isAutomatedQaTest(test)) {
    return {
      status: nextStatus,
      assignee: normalizeTestAssignee(test.assignee, suiteForQaTest(test)),
      assignor: normalizeAssignor(test.assignor),
    };
  }
  const tester: WorkAssignee =
    test.assignee === 'angela' || test.assignee === 'evelyn' || test.assignee === 'qa'
      ? test.assignee
      : test.assignor === 'angela' || test.assignor === 'evelyn' || test.assignor === 'qa'
        ? test.assignor
        : 'unassigned';
  if (nextStatus === 'failed') {
    return {
      status: nextStatus,
      assignor: isPersonAssignor(tester) ? tester : normalizeAssignor(test.assignor),
      assignee: 'dev',
    };
  }
  if (nextStatus === 'fixed_retest' || nextStatus === 'failed_retest') {
    return {
      status: nextStatus,
      assignee: tester,
      assignor: normalizeAssignor(test.assignor),
    };
  }
  return {
    status: nextStatus,
    assignee: test.assignee,
    assignor: normalizeAssignor(test.assignor),
  };
}

export function applyQaInlinePatch(test: QaTestItem, patch: QaInlinePatch, actor?: WorkAssignee): QaTestItem {
  const previousAssignee = test.assignee;
  const next: QaTestItem = { ...test };
  if (patch.title !== undefined) next.title = patch.title;
  if (patch.description !== undefined) next.description = patch.description;
  if (patch.desc !== undefined) next.desc = patch.desc;
  if (patch.steps !== undefined) next.steps = normalizeWorkChecklist(patch.steps);
  if (patch.sprint !== undefined && SPRINT_OPTIONS.includes(patch.sprint) && canAssignSprint(patch.sprint)) {
    next.sprint = patch.sprint;
    if (patch.dueDate === undefined) next.dueDate = dueDateForSprintLabel(patch.sprint);
  }
  if (patch.phase !== undefined && PHASE_OPTIONS.includes(patch.phase)) next.phase = patch.phase;
  if (patch.category !== undefined && (QA_CATEGORIES as readonly string[]).includes(patch.category)) {
    next.category = patch.category;
  }
  if (patch.priority !== undefined && PRIORITY_OPTIONS.includes(patch.priority)) next.priority = patch.priority;
  if (patch.status !== undefined && QA_STATUSES.includes(patch.status)) {
    if (patch.status === 'passed') {
      next.steps = checkAllChecklistSteps(next.steps ?? test.steps);
    }
    const workflow = qaWorkflowFieldsForStatus(next, patch.status);
    next.status = workflow.status;
    // Only auto-route assignee/assignor when status changed and caller did not override them.
    if (patch.assignee === undefined) next.assignee = workflow.assignee;
    if (patch.assignor === undefined) next.assignor = workflow.assignor;
    if (next.status === 'passed') {
      next.completedOn = next.completedOn || workBoardTodayIso();
    } else if (isOutstandingWorkStatus(next.status)) {
      next.completedOn = undefined;
    }
  }
  if (patch.assignee !== undefined && TEST_ASSIGNEE_OPTIONS.includes(patch.assignee)) next.assignee = patch.assignee;
  if (patch.assignor !== undefined) next.assignor = normalizeAssignor(patch.assignor);
  if (patch.dueDate !== undefined) {
    next.dueDate = patch.dueDate === '' ? '' : parseWorkDueDate(patch.dueDate) || test.dueDate;
  }
  if (patch.attachments !== undefined) next.attachments = normalizeWorkAttachments(patch.attachments);
  const suite = suiteForQaTest({ ...next, suite: patch.suite ?? next.suite });
  next.suite = suite;
  next.assignee = normalizeTestAssignee(next.assignee, suite);
  if (patch.assignor === undefined && patch.assignee !== undefined && next.assignee !== previousAssignee) {
    next.assignor = normalizeAssignor(actor);
  }
  next.assignor = normalizeAssignor(next.assignor);
  return patch.status !== undefined ? rolloverWorkItemSprint(next) : next;
}

export function applyQaInlinePatchToList(
  tests: QaTestItem[],
  id: string,
  patch: QaInlinePatch,
  actor?: WorkAssignee,
): QaTestItem[] {
  return tests.map((test) => (test.id === id ? applyQaInlinePatch(test, patch, actor) : test));
}

export function applyBulkQaPatch(
  tests: QaTestItem[],
  ids: Iterable<string>,
  patch: QaInlinePatch,
  actor?: WorkAssignee,
): QaTestItem[] {
  const selected = new Set(ids);
  return tests.map((test) => (selected.has(test.id) ? applyQaInlinePatch(test, patch, actor) : test));
}

export function currentSprintLabel(now = new Date()): SprintCategory {
  const label = currentSprintWindow(now)?.label;
  return SPRINT_OPTIONS.includes(label as SprintCategory) ? (label as SprintCategory) : 'Sprint 0';
}

export interface SprintSectionStats {
  sprint: SprintCategory;
  total: number;
  done: number;
  percent: number;
  blocked: number;
  rolledOver: number;
}

export { countRolledOverItems, formatRolledOverCount };

export function sprintSectionStats<T extends { sprint: SprintCategory; status: string; rolledOver?: boolean }>(
  items: T[],
  isDone: (item: T) => boolean,
): SprintSectionStats[] {
  return SPRINT_OPTIONS.map((sprint) => {
    const inSprint = items.filter((item) => item.sprint === sprint);
    const done = inSprint.filter(isDone).length;
    const blocked = inSprint.filter((item) => item.status === 'blocked').length;
    return {
      sprint,
      total: inSprint.length,
      done,
      percent: inSprint.length ? Math.round((done / inSprint.length) * 100) : 0,
      blocked,
      rolledOver: countRolledOverItems(inSprint),
    };
  });
}

export function groupItemsBySprint<T extends { sprint: SprintCategory }>(
  items: T[],
): Record<SprintCategory, T[]> {
  return SPRINT_OPTIONS.reduce((acc, sprint) => {
    acc[sprint] = items.filter((item) => item.sprint === sprint);
    return acc;
  }, {} as Record<SprintCategory, T[]>);
}

export function groupAndSortItemsBySprint<T extends WorkBoardSortRow & { sprint: SprintCategory }>(
  items: T[],
  sort: WorkBoardSort,
): Record<SprintCategory, T[]> {
  const grouped = groupItemsBySprint(items);
  return SPRINT_OPTIONS.reduce((acc, sprint) => {
    acc[sprint] = sortWorkBoardItems(grouped[sprint], sort);
    return acc;
  }, {} as Record<SprintCategory, T[]>);
}

export function defaultOpenSprintSections(_current = currentSprintLabel()): Record<SprintCategory, boolean> {
  return SPRINT_OPTIONS.reduce((acc, sprint) => {
    acc[sprint] = !isSprintLocked(sprint);
    return acc;
  }, {} as Record<SprintCategory, boolean>);
}

export function toggleSprintSection(
  open: Record<SprintCategory, boolean>,
  sprint: SprintCategory,
): Record<SprintCategory, boolean> {
  return { ...open, [sprint]: !open[sprint] };
}

export interface BoardTone {
  header: string;
  chip: string;
  panel: string;
  selected: string;
  selectedAll: string;
  /** Matching ink for titles, sprint labels, and compact sprint controls. */
  ink: string;
}

/** Distinct sprint palettes — cream washes with clear ink, not muddy tan. */
export const SPRINT_SECTION_TONES: Record<SprintCategory, BoardTone> = {
  'Sprint 0': {
    header: 'bg-[#FED7AA] text-[#9A3412] border-[#FDBA74]',
    chip: 'bg-[#FFF7ED] text-[#9A3412]',
    panel: 'bg-[#FFF7ED]',
    selected: 'border-[#FDBA74] bg-[#FED7AA] text-[#9A3412]',
    selectedAll: 'border-[#FDBA74] bg-[#FDBA74] text-[#7C2D12]',
    ink: 'text-[#9A3412]',
  },
  'Sprint 1': {
    header: 'bg-[#FDE68A] text-[#92400E] border-[#FCD34D]',
    chip: 'bg-[#FFFBEB] text-[#92400E]',
    panel: 'bg-[#FFFBEB]',
    selected: 'border-[#FCD34D] bg-[#FDE68A] text-[#92400E]',
    selectedAll: 'border-[#FCD34D] bg-[#FCD34D] text-[#78350F]',
    ink: 'text-[#92400E]',
  },
  'Sprint 2': {
    header: 'bg-[#A7F3D0] text-[#065F46] border-[#6EE7B7]',
    chip: 'bg-[#ECFDF5] text-[#065F46]',
    panel: 'bg-[#ECFDF5]',
    selected: 'border-[#6EE7B7] bg-[#A7F3D0] text-[#065F46]',
    selectedAll: 'border-[#6EE7B7] bg-[#6EE7B7] text-[#064E3B]',
    ink: 'text-[#065F46]',
  },
  'Sprint 3': {
    header: 'bg-[#BFDBFE] text-[#1E3A8A] border-[#93C5FD]',
    chip: 'bg-[#EFF6FF] text-[#1E3A8A]',
    panel: 'bg-[#EFF6FF]',
    selected: 'border-[#93C5FD] bg-[#BFDBFE] text-[#1E3A8A]',
    selectedAll: 'border-[#93C5FD] bg-[#93C5FD] text-[#1E40AF]',
    ink: 'text-[#1E3A8A]',
  },
  'Sprint 4': {
    header: 'bg-[#E9D5FF] text-[#6B21A8] border-[#D8B4FE]',
    chip: 'bg-[#FAF5FF] text-[#6B21A8]',
    panel: 'bg-[#FAF5FF]',
    selected: 'border-[#D8B4FE] bg-[#E9D5FF] text-[#6B21A8]',
    selectedAll: 'border-[#D8B4FE] bg-[#D8B4FE] text-[#581C87]',
    ink: 'text-[#6B21A8]',
  },
};

export const SPRINT_SWATCH: Record<SprintCategory, string> = {
  'Sprint 0': '#9A3412',
  'Sprint 1': '#92400E',
  'Sprint 2': '#065F46',
  'Sprint 3': '#1E3A8A',
  'Sprint 4': '#6B21A8',
};

export function sprintTextClass(sprint: SprintCategory): string {
  return SPRINT_SECTION_TONES[sprint].ink;
}

export function sprintControlClass(sprint: SprintCategory): string {
  const tone = SPRINT_SECTION_TONES[sprint];
  return `${tone.chip} ${tone.ink}`;
}

export const FILTER_SECTION_IDS = ['sprint', 'assignee', 'status', 'category', 'priority'] as const;
export type FilterSectionId = (typeof FILTER_SECTION_IDS)[number];
export const PRIMARY_FILTER_SECTION_IDS = ['sprint', 'assignee'] as const;
export const COLLAPSED_FILTER_SECTION_IDS = ['status', 'category', 'priority'] as const;

export const FILTER_SECTION_LABELS: Record<FilterSectionId, string> = {
  assignee: 'Assignee',
  sprint: 'Sprint',
  priority: 'Priority',
  category: 'Category',
  status: 'Status',
};

export const FILTER_TABS_HINT =
  'Open a section for its bubbles · Click bubbles to multi-select · All shows every item';

export function defaultFilterSectionTab(): FilterSectionId {
  return 'assignee';
}

export function isFilterSectionTab(value: unknown): value is FilterSectionId {
  return typeof value === 'string' && (FILTER_SECTION_IDS as readonly string[]).includes(value);
}

export function defaultOpenFilterSections(): Record<FilterSectionId, boolean> {
  return {
    assignee: true,
    sprint: true,
    priority: false,
    category: false,
    status: false,
  };
}

export function defaultMoreFiltersOpen(): boolean {
  return false;
}

export function isCollapsedFilterSection(id: FilterSectionId): boolean {
  return (COLLAPSED_FILTER_SECTION_IDS as readonly string[]).includes(id);
}

export function selectFilterSection(id: FilterSectionId): Record<FilterSectionId, boolean> {
  return {
    assignee: id === 'assignee',
    sprint: id === 'sprint',
    priority: id === 'priority',
    category: id === 'category',
    status: id === 'status',
  };
}

export function toggleFilterSection(
  open: Record<FilterSectionId, boolean>,
  id: FilterSectionId,
): Record<FilterSectionId, boolean> {
  return { ...open, [id]: !open[id] };
}

export function filterSectionSummary(
  selected: Set<string>,
  ordered: readonly string[],
  chips: FilterChipCount[],
): string {
  if (isFilterShowingAll(selected, ordered) || selected.size === 0) return 'All';
  const labels = chips.filter((chip) => selected.has(chip.id)).map((chip) => chip.label);
  return labels.length ? labels.join(', ') : `${selected.size} selected`;
}

export const FILTER_SECTION_TONES: Record<FilterSectionId, BoardTone> = {
  sprint: {
    header: 'bg-[#FFEDD5] text-[#9A3412]',
    chip: 'bg-[#FFF7ED] text-[#9A3412]',
    panel: 'bg-[#FFF7ED]',
    selected: 'border-[#FDBA74] bg-[#FED7AA] text-[#9A3412]',
    selectedAll: 'border-[#FDBA74] bg-[#FED7AA] text-[#7C2D12]',
    ink: 'text-[#9A3412]',
  },
  status: {
    header: 'bg-[#D1FAE5] text-[#065F46]',
    chip: 'bg-[#ECFDF5] text-[#065F46]',
    panel: 'bg-[#ECFDF5]',
    selected: 'border-[#6EE7B7] bg-[#A7F3D0] text-[#065F46]',
    selectedAll: 'border-[#6EE7B7] bg-[#A7F3D0] text-[#064E3B]',
    ink: 'text-[#065F46]',
  },
  priority: {
    header: 'bg-[#FEF3C7] text-[#92400E]',
    chip: 'bg-[#FFFBEB] text-[#92400E]',
    panel: 'bg-[#FFFBEB]',
    selected: 'border-[#FCD34D] bg-[#FDE68A] text-[#92400E]',
    selectedAll: 'border-[#FCD34D] bg-[#FDE68A] text-[#78350F]',
    ink: 'text-[#92400E]',
  },
  assignee: {
    header: 'bg-[#DBEAFE] text-[#1E3A8A]',
    chip: 'bg-[#EFF6FF] text-[#1E3A8A]',
    panel: 'bg-[#EFF6FF]',
    selected: 'border-[#93C5FD] bg-[#BFDBFE] text-[#1E3A8A]',
    selectedAll: 'border-[#93C5FD] bg-[#BFDBFE] text-[#1E40AF]',
    ink: 'text-[#1E3A8A]',
  },
  category: {
    header: 'bg-[#FCE7F3] text-[#9D174D]',
    chip: 'bg-[#FDF2F8] text-[#9D174D]',
    panel: 'bg-[#FDF2F8]',
    selected: 'border-[#F9A8D4] bg-[#FBCFE8] text-[#9D174D]',
    selectedAll: 'border-[#F9A8D4] bg-[#FBCFE8] text-[#831843]',
    ink: 'text-[#9D174D]',
  },
};

export const TASK_STATUS_TONES: Record<TaskStatus, string> = {
  done: 'bg-[#B8D4C4] text-[#2F5A48] border-[#8FB5A4]',
  in_progress: 'bg-[#F6E56A] text-[#6B5808] border-[#D4C43A]',
  blocked: 'bg-[#E8D4A0] text-[#5C4A1C] border-[#C9B46A]',
  not_started: 'bg-[#F4EBE6] text-[#6B4538] border-[#DCC0B0]',
};

export const QA_STATUS_TONES: Record<QaStatus, string> = {
  passed: 'bg-[#B8D4C4] text-[#2F5A48] border-[#8FB5A4]',
  in_progress: 'bg-[#F6E56A] text-[#6B5808] border-[#D4C43A]',
  failed: 'bg-[#E4B8A4] text-[#5C3328] border-[#C9A08C]',
  blocked: 'bg-[#E8D4A0] text-[#5C4A1C] border-[#C9B46A]',
  untested: 'bg-[#F4EBE6] text-[#6B4538] border-[#DCC0B0]',
  fixed_retest: 'bg-[#B8C8DC] text-[#2F4460] border-[#8FA4BC]',
  failed_retest: 'bg-[#DCC8B8] text-[#5C3328] border-[#C9A08C]',
};

export const TASK_STATUS_SWATCH: Record<TaskStatus, string> = {
  done: '#5A9A78',
  in_progress: '#D4B820',
  blocked: '#C4A44A',
  not_started: '#C4A090',
};

export const QA_STATUS_SWATCH: Record<QaStatus, string> = {
  passed: '#5A9A78',
  in_progress: '#D4B820',
  failed: '#C46A4A',
  blocked: '#C4A44A',
  untested: '#C4A090',
  fixed_retest: '#5A7A9A',
  failed_retest: '#A87858',
};

export function taskStatusRowClass(status: TaskStatus): string {
  return `border-l-8 ${TASK_STATUS_TONES[status]}`;
}

export function qaStatusRowClass(status: QaStatus): string {
  return `border-l-8 ${QA_STATUS_TONES[status]}`;
}

export function taskStatusLegend(): Array<{ id: TaskStatus; label: string; className: string }> {
  return TASK_STATUSES.map((status) => ({
    id: status,
    label: TASK_STATUS_LABELS[status],
    className: TASK_STATUS_TONES[status],
  }));
}

export function qaStatusLegend(): Array<{ id: QaStatus; label: string; className: string }> {
  return QA_STATUSES.map((status) => ({
    id: status,
    label: QA_STATUS_LABELS[status],
    className: QA_STATUS_TONES[status],
  }));
}

export const PRIORITY_TONES: Record<WorkPriority, string> = {
  high: 'bg-[#E4B8A4] text-[#5C3328] border-[#C9A08C]',
  medium: 'bg-[#E8D4A0] text-[#5C4A1C] border-[#C9B46A]',
  low: 'bg-[#D4CCC0] text-[#3F3832] border-[#B8AFA3]',
};

/** Title/code color: past due is red. High priority no longer paints the row. */
export function workPriorityTextClass(priority?: WorkPriority | string): string {
  return priority === 'high' ? 'text-[#DC2626]' : 'text-[#1F1917]';
}

export const WORK_PAST_DUE_TEXT_CLASS = 'text-[#DC2626]';
export const WORK_DUE_OK_TEXT_CLASS = 'text-[#1F1917]';

export function workOverdueTextClass(overdue: boolean): string {
  return overdue ? WORK_PAST_DUE_TEXT_CLASS : WORK_DUE_OK_TEXT_CLASS;
}

export function workDueDateTextClass(
  dueDate?: string,
  options?: { done?: boolean; today?: string },
): string {
  if (options?.done) return WORK_DUE_OK_TEXT_CLASS;
  return workOverdueTextClass(isWorkDueDatePast(dueDate, options?.today));
}

export function workDueDateControlClass(overdue: boolean): string {
  return overdue
    ? `bg-[#FEE2E2] border-[#FECACA] ${WORK_PAST_DUE_TEXT_CLASS} [&::-webkit-datetime-edit]:text-[#DC2626] [&::-webkit-datetime-edit-fields-wrapper]:text-[#DC2626]`
    : `bg-white border-[#E5DFD3] ${WORK_DUE_OK_TEXT_CLASS} [&::-webkit-datetime-edit]:text-[#1F1917] [&::-webkit-datetime-edit-fields-wrapper]:text-[#1F1917]`;
}

export const INITIAL_TASKS: TaskItem[] = rolloverLockedSprintItems([
  { id: 't-1', title: 'Confirm $10,000 in three payments — $3,500 received', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Infrastructure', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-43', title: 'Make Payment — Payment 2 ($3,500) due Sprint 1 via Zelle or Cash App', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Infrastructure', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-2', title: 'Keep the brand line on every Phase 1 page and email', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-3', title: 'Host the shirt drop on nonnegotiation.com', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Infrastructure', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-4', title: 'Brand foundation and gear storefront shell', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-5', title: 'Developing Shirts — first drop brief', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-6', title: 'Scope 3 shirt styles, 1 hoodie, and 1 hat', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-7', title: 'Angela selects the first 2–3 shirt designs', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-8', title: 'Go over styles and pricing so production costs are known', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-9', title: 'Include T-Shirt Design in the $10K Phase 1 budget', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-27', title: 'Create Gear Selections page with style-card uploads (tee, hoodie, and hat on each card)', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-31', title: 'Post the Phase 1 sales cadence — shop link in every Facebook post (socials in parallel)', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-32', title: 'Stock Asset Library and prep Content Factory copy for each sprint', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-41', title: 'Upload logo concepts Evelyn created for Angela', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-42', title: 'Pick the chosen logo mark from Logo Concepts', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-10', title: 'Build Shop Gear catalog for the selected designs', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'dev' },
  { id: 't-11', title: 'Product variants, mockups, and checkout', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'dev' },
  { id: 't-12', title: 'About page', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'dev' },
  { id: 't-13', title: 'Contact page', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'dev' },
  { id: 't-14', title: 'Privacy Policy page', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'dev' },
  { id: 't-15', title: 'Terms of Use page', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'dev' },
  { id: 't-16', title: 'FAQ page', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront', priority: 'medium', status: 'not_started', assignee: 'dev' },
  { id: 't-17', title: 'Confirm Orders on SnatchVault — collection, Non-Negotiable menu, and 70/30 split', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Features', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-18', title: 'Put Coming Soon on Memberships / Join — do not configure members', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Features', priority: 'high', status: 'not_started', assignee: 'dev' },
  { id: 't-19', title: 'QA Shop Gear, launch pages, and SnatchVault Orders', sprint: 'Sprint 4', phase: 'Phase 1', category: 'QA & Testing', priority: 'high', status: 'not_started', assignee: 'qa' },
  { id: 't-20', title: 'Send Gmail account invite to Angela', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-21', title: 'Determine Beta Tester rewards (Angela — brand, gift & recognition)', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-22', title: 'Determine Beta Tester rewards (Evelyn — credits, fulfillment & tracking)', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-23', title: 'Launch the gear storefront to production', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'evelyn' },
  { id: 't-24', title: 'Review organic sprint ROI (6.2K Facebook, no paid ads)', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Features', priority: 'high', status: 'not_started', assignee: 'angela' },
  { id: 't-30', title: 'Refresh sprint ROI when production costs and live sales are known', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Features', priority: 'medium', status: 'not_started', assignee: 'evelyn' },
  { id: 't-25', title: 'Memberships configuration — Phase 2 discussion (Coming Soon until then)', sprint: 'Sprint 4', phase: 'Phase 2', category: 'Features', priority: 'medium', status: 'not_started', assignee: 'evelyn' },
  { id: 't-26', title: 'Future features (mood, planners, retainers) — open for Phase 3 discussion', sprint: 'Sprint 4', phase: 'Phase 3', category: 'Features', priority: 'low', status: 'not_started', assignee: 'angela' },
  { id: 't-44', title: 'Build the Shop Gear page', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-45', title: 'Put the selected gear on the Shopify store', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-46', title: 'Test the Shop Gear page', sprint: 'Sprint 2', phase: 'Phase 1', category: 'QA & Testing', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-47', title: 'Test the Shop Gear page', sprint: 'Sprint 2', phase: 'Phase 1', category: 'QA & Testing', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-48', title: 'Pick the shirt and hoodie blank brand on Gear Selections', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-49', title: 'Set up Resend so tester emails can send (account, nonnegotiation.com domain, API key, Cloudflare RESEND_API_KEY / FROM_EMAIL / ADMIN_NOTIFY_EMAIL)', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Infrastructure', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-50', title: 'Content Factory Sprint 0 — sell now: bios, pinned post, shop link, live talk track', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-51', title: 'Content Factory Sprint 1 — keep selling + first on-body live', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-52', title: 'Content Factory Sprint 2 — keep selling tees, hoodie, and hat', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-53', title: 'Content Factory Sprint 3 — About/FAQ cadence with shop link in every post', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-54', title: 'Content Factory Sprint 4 — launch-week cadence (shop already live)', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-55', title: 'Create or re-purpose the NonNegotiation TikTok page', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-56', title: 'Create or re-purpose the NonNegotiation YouTube channel', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-57', title: 'Create or re-purpose the NonNegotiation Instagram page', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-58', title: 'Add Evelyn as an authorized user on the NonNegotiation TikTok page', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn', dueDate: '2026-09-03' },
  { id: 't-59', title: 'Add Evelyn as an authorized user on the NonNegotiation YouTube channel', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn', dueDate: '2026-09-03' },
  { id: 't-60', title: 'Add Evelyn as an authorized user on the NonNegotiation Instagram page', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn', dueDate: '2026-09-03' },
  { id: 't-61', title: 'Keep NonNegotiation as the house — introduce MY PLAN, NOT MY MOOD as a brand under it', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn', dueDate: '2026-09-03' },
  { id: 't-62', title: 'Order Angela’s sample tees from Shopify so she has product in hand for live', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Apparel', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-63', title: 'Soft-sell tees NOW on Angela’s 6.2K Facebook — shop link in every post', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-64', title: 'Run the first live wearing the tee and pin Shop Gear in comments', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-65', title: 'Put Shop Gear on NonNegotiation Facebook, Instagram, TikTok, and YouTube bios', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-66', title: 'Angela personal Facebook and Instagram: bio, pinned post, and live pin selling tees', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-67', title: 'Evelyn personal Facebook and Instagram: bio and one support post selling tees', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-68', title: 'Use the live talk track on every live (no-sample now, on-body when the box arrives)', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-69', title: 'Confirm nonnegotiation.com/gear is the only shop URL we send people to', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-70', title: 'After samples arrive, post the on-body clip to personal pages and NonNegotiation', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-71', title: 'Present MY PLAN, NOT MY MOOD as a brand under NonNegotiation (Home and Shop Gear)', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-72', title: 'Walk Home and Shop Gear — this is what Angela sends people to from live', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-73', title: 'At each sprint retro, score actuals vs the Plan scorecard', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn', dueDate: '2026-09-06' },
  { id: 't-74', title: 'Welcome/intro: NonNegotiation is the house, MY PLAN, NOT MY MOOD is the brand — every platform', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn', dueDate: '2026-09-04' },
  { id: 't-75', title: 'Create 3 T-shirt sales videos for Sprint 0', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-76', title: 'Create 3 T-shirt sales videos for Sprint 1', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-77', title: 'Create 3 T-shirt sales videos for Sprint 2', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-78', title: 'Create 3 T-shirt sales videos for Sprint 3', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-79', title: 'Create 3 T-shirt sales videos for Sprint 4', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Content', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  { id: 't-80', title: 'Introduce the Phase 1 website — About, Contact, Privacy, Terms, and FAQ go live', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-81', title: 'Add mailing list sign-up — email capture, not a membership', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Features', priority: 'high', status: 'not_started', assignee: 'evelyn', assignor: 'angela' },
  { id: 't-82', title: 'Review the live website and mailing list sign-up', sprint: 'Sprint 3', phase: 'Phase 1', category: 'QA & Testing', priority: 'high', status: 'not_started', assignee: 'angela', assignor: 'evelyn' },
  buildPhase1WebsiteReviewTask(),
  buildSprint2WebsiteReviewTask(),
  buildFormWalkthroughTask(),
  buildMoodWorkflowTask(),
  ...buildJournalMakeReviewTasks(),
  ...buildSiteAnalyticsSeedTasks(),
], { migrateOutstandingLocked: true });

export const WORK_BOARD_STATUS_RESET_KEY = 'myplan_work_board_status_reset_rev';
export const WORK_BOARD_STATUS_RESET_REV = 1;

export function resetTasksToNotStarted(tasks: TaskItem[]): TaskItem[] {
  return tasks.map((task) => ({ ...task, status: 'not_started' }));
}

export function resetQaTestsToNotStarted(tests: QaTestItem[]): QaTestItem[] {
  return tests.map((test) => ({ ...test, status: 'untested' }));
}

export function shouldResetWorkBoardStatuses(
  storedRev: number,
  currentRev = WORK_BOARD_STATUS_RESET_REV,
): boolean {
  return !Number.isFinite(storedRev) || storedRev < currentRev;
}

/** Append seed tasks that are missing from a saved board (keeps user progress). */
/** Prior seed titles we still rewrite when the task is not started. */
const SUPERSEDED_SEED_TITLES: Record<string, string[]> = {
  't-24': [
    'Build ROI per phase after shirt costs are known',
    'Build ROI per phase after production costs are known',
    'Build ROI per phase after costs are real',
  ],
  't-26': ['Future features (mood, planners, socials) — open for Phase 3 discussion'],
  't-31': ['Post the Phase 1 Content Factory organic Facebook cadence (no paid ads)'],
  't-50': ['Content Factory Sprint 0 — complete posts, prep, and logo rows'],
  't-51': ['Content Factory Sprint 1 — complete gear rows and organic posts'],
  't-52': ['Content Factory Sprint 2 — complete shop-live cadence'],
  't-53': ['Content Factory Sprint 3 — complete About/FAQ cadence'],
  't-54': ['Content Factory Sprint 4 — complete launch-week cadence'],
  't-61': [
    'Decide if My Plan, Not My Mood gets a separate page, or we re-purpose / keep / rename NonNegotiation',
  ],
  't-71': ['Present the tee drop on the NonNegotiation website (Home and Shop Gear)'],
  't-74': ['Post a welcome/intro on Facebook, TikTok, YouTube, personal pages, and the website'],
  't-17': ['Configure Phase 1 email (orders, fulfillment, contact, admin)'],
  't-19': ['QA Shop Gear, launch pages, and Phase 1 email'],
  't-83': [
    'Provide site analytics for the socials no less than every 3 days',
    'Upload site analytics — Mon Sep 7 (Sprint 1)',
  ],
  't-84': [
    'Review site analytics, make recommendations, and use them as the guide for the next create',
    'Review analytics & guide next create — Mon Sep 7 (Sprint 1)',
  ],
};

export function overlaySupersededSeedTasks(
  existing: TaskItem[],
  seeds: TaskItem[] = INITIAL_TASKS,
): TaskItem[] {
  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));
  const retitled = existing.map((task) => {
    const seed = seedById.get(task.id);
    const oldTitles = SUPERSEDED_SEED_TITLES[task.id];
    if (!seed || !oldTitles || task.status !== 'not_started') return task;
    if (!oldTitles.includes(task.title)) return task;
    return { ...task, title: seed.title, priority: seed.priority, assignee: seed.assignee };
  });
  return overlayCatalogTaskSchedule(retitled, seeds);
}

export function overlayCatalogTaskSchedule(
  existing: TaskItem[],
  seeds: TaskItem[] = INITIAL_TASKS,
): TaskItem[] {
  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));
  return existing.map((task) => {
    const seed = seedById.get(task.id);
    if (!seed || task.status === 'done') return task;
    const isAnalytics = String(seed.groupId ?? task.groupId ?? '').startsWith('analytics-');
    const isParent = isTodaysNewTestParentId(task.id);
    const isJournal = isJournalMakeReviewTaskId(task.id);
    if (!isAnalytics && !isParent && !isJournal) return task;
    return {
      ...task,
      title: isAnalytics ? seed.title : task.title,
      dueDate: seed.dueDate,
      sprint: seed.sprint,
      groupId: seed.groupId ?? task.groupId,
    };
  });
}

export function overlayCatalogQaSchedule(
  existing: QaTestItem[],
  seeds: QaTestItem[] = allSeedQaTests(),
): QaTestItem[] {
  const seedById = new Map(seeds.filter((seed) => isTodaysNewTestId(seed.id)).map((seed) => [seed.id, seed]));
  return existing.map((test) => {
    const seed = seedById.get(test.id);
    if (!seed || test.status === 'passed') return test;
    return {
      ...test,
      dueDate: seed.dueDate,
      sprint: seed.sprint,
    };
  });
}

export function mergeMissingSeedTasks(
  existing: TaskItem[],
  seeds: TaskItem[] = INITIAL_TASKS,
  removedIds: readonly string[] = [],
): TaskItem[] {
  const ids = new Set(existing.map((t) => t.id));
  const removed = new Set(removedIds);
  const missing = seeds.filter((t) => !ids.has(t.id) && !removed.has(t.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

export function mergeMissingSeedQaTests(
  existing: QaTestItem[],
  seeds: QaTestItem[] = allSeedQaTests(),
  removedIds: readonly string[] = [],
): QaTestItem[] {
  const ids = new Set(existing.map((t) => t.id));
  const removed = new Set(removedIds);
  const missing = seeds.filter((t) => !ids.has(t.id) && !removed.has(t.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

const INITIAL_QA_TEST_SEEDS: QaTestItem[] = [
  { id: 'qa1', title: 'Hero Interactive Speech Bubbles over 5 Characters', desc: 'Clicking bubbles selects mood and scrolls smoothly to action card', sprint: 'Sprint 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'qa2', title: 'WHICH MOOD AM I IN TODAY Banner Style Match', desc: 'Question banner uses Rust Orange bg and crisp white font matching buttons', sprint: 'Sprint 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'qa3', title: '2-Column Desktop Grid for Products & Mood Output', desc: 'Left column renders mockup images; right column renders details box', sprint: 'Sprint 2', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'qa4', title: 'Slide-Over Shopping Cart Drawer & Badge Count', desc: 'Adding items updates cart badge counter dynamically', sprint: 'Sprint 2', category: 'E2E Flows', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'qa5', title: '#WhatWonToday Social Digital Receipt Generator', desc: 'Generates victory determination card with 1-click share & download', sprint: 'Sprint 2', category: 'E2E Flows', priority: 'medium', status: 'untested', assignee: 'qa' },
  { id: 'qa6', title: 'Free 7-Day Reset Starter Kit Printable Modal', desc: 'Modal collects email & 7-day goal, dispatching printable PDF', sprint: 'Sprint 2', category: 'E2E Flows', priority: 'medium', status: 'untested', assignee: 'angela' },
  { id: 'aff-qa1', title: 'Morning Micro-Set (Identity + Confidence)', desc: 'Loads 8-affirmation pool, 3s breath cue, 20-30s sequence', sprint: 'Sprint 2', category: 'Affirmations QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'aff-qa2', title: 'Midday Micro-Set (Boundaries + Truths)', desc: 'Loads boundary-focused pool, emotional reset trigger', sprint: 'Sprint 2', category: 'Affirmations QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'aff-qa3', title: 'Night Micro-Set (Healing + Release + Faith)', desc: 'Loads release & faith pool, day closing protocol', sprint: 'Sprint 2', category: 'Affirmations QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'aff-qa4', title: 'Rotation & Weighted Personalization Engine', desc: 'Prevents repetition fatigue, dynamic reflection weighting', sprint: 'Sprint 2', category: 'Affirmations QA', priority: 'high', status: 'untested', assignee: 'dev' },
  { id: 'aff-qa5', title: '10-Second Reflection & Zero-Guilt Skip', desc: 'Allows selecting resonant phrase, persists to localStorage', sprint: 'Sprint 2', category: 'Affirmations QA', priority: 'medium', status: 'untested', assignee: 'qa' },
  { id: 'aff-qa6', title: 'Daily Completion State (Morning/Midday/Night)', desc: 'Tracks day-by-day status, persistent calendar resetting', sprint: 'Sprint 2', category: 'Affirmations QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'aff-qa7', title: 'Responsive & Accessibility Compliance', desc: 'Tested on Mobile, Tablet & Desktop with high contrast', sprint: 'Sprint 3', category: 'Affirmations QA', priority: 'medium', status: 'untested', assignee: 'qa' },
  { id: 'aff-qa8', title: 'Voice Trust Layer Architectural Specs', desc: 'Planned data model & coach effect fields prepared', sprint: 'Sprint 3', category: 'Affirmations QA', priority: 'low', status: 'untested', assignee: 'dev' },
  { id: 'auth-qa1', title: 'Admin Role Gates — Testing + Tasks Only', desc: 'Admin users see only Testing Portal and Task List tabs', sprint: 'Sprint 3', category: 'Auth & Admin', priority: 'high', status: 'untested', assignee: 'angela' },
  { id: 'gear-sel-qa1', title: 'Gear Selections — style-card upload and Angela picks', desc: 'Evelyn loads style cards named like E-ShirtLebberingBeige and TShirtTieDieRainbowSpiral. Cards already include hat, hoodie, and tee and group by style. Angela picks up to 3 tees, 1 hoodie, and 1 hat. PDF, SVG, and oversized files are rejected.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'sprint-roi-qa1', title: 'Sprint ROI — hoodie sales, scorecard, and improvement suggestions on the Plan', desc: 'Each Phase 1 sprint lists organic ROI and a weekly scorecard (followers, engagement, clicks, sales). Shop is live from Sprint 0. 6.2K personal Facebook, organic-only, no paid ads.', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'cf-qa1', title: 'Content Factory — Phase 1 calendar by sprint, assignee, and channel', desc: 'Content Factory lists organic posts and prep work for Sprints 0–4. The Posting Schedule tab is one document by date, platform, time, and what to post. Filter by sprint, assignee, and channel (Facebook, YouTube, TikTok, Personal). Angela posts; Evelyn preps assets.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'cf-qa2', title: 'Content Factory — Asset Library grouped by style', desc: 'Asset Library groups cards by style name (E-ShirtLebberingBeige, TShirtTieDieRainbowSpiral). Each style can hold several cards; tee, hoodie, and hat live on the same card.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'cf-qa3', title: 'Asset Library — image reject paths', desc: 'Non-image and oversized files are rejected. Caption assets save text without an image.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'logo-qa1', title: 'Logo Concepts — upload and Angela’s chosen mark', desc: 'Evelyn chooses a logo folder to load every file at once. Subfolders named seal, wordmark, lockup, or colorway sort automatically. Angela picks one chosen mark. PDF and oversized files are rejected. SVG is allowed.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'pay-qa1', title: 'Make Payment page — Zelle, Cash App, Venmo, Stripe', desc: 'Angela’s Make Payment task opens /pay. Payment 1 ($3,500) is already paid. Payment 2 ($3,500) is due Sprint 1. Zelle (619-507-9568) and Cash App ($ChingChicks) are preferred. Venmo is @Evelyn-Irving. Stripe is card/Apple Pay.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'shop-gear-page-qa1', title: 'Shop Gear page — Evelyn test', desc: 'Walk the Shop Gear page: selected styles, hoodie/shirt brand, hat colors, and Shopify listings. Confirm the page loads, images are sharp, and checkout or store links work.', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'evelyn' },
  { id: 'shop-gear-page-qa2', title: 'Shop Gear page — Angela test', desc: 'Angela opens Shop Gear and confirms her selected styles, shirt/hoodie brand, and hat colors look right before the Shopify listings go live.', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'angela' },
  { id: 'gear-brand-qa1', title: 'Gear Selections — shirt/hoodie brand pick', desc: 'Angela chooses up to 2 blank brands (Gildan, Comfort Colors, Bella+Canvas, Next Level, Independent Trading, Lane Seven) for shirts and hoodies. The pick saves with her other gear selections.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  // Site pages
  { id: 'home-qa1', title: 'Home / storefront — brand line and mood entry', desc: 'Home loads with brand line and mood tool entry; no horizontal scroll on mobile.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'domain-qa1', title: 'Production domain — nonnegotiation.com loads storefront', desc: 'https://nonnegotiation.com serves the Phase 1 storefront over HTTPS.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'evelyn' },
  { id: 'mood-qa1', title: 'What’s Your Mood tool — select and scroll', desc: 'Mood bubbles select a mood and scroll to the action area.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'receipt-qa1', title: 'What Won Today receipt — generate, share, download', desc: 'Receipt generator creates a shareable/downloadable card.', sprint: 'Sprint 2', phase: 'Phase 1', category: 'E2E Flows', priority: 'medium', status: 'untested', assignee: 'qa' },
  { id: 'about-qa1', title: 'About page — brand story and mobile layout', desc: 'About page loads with brand story; mobile has no horizontal scroll.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'contact-qa1', title: 'Contact page — channels and layout', desc: 'Contact page lists working contact paths and is mobile-friendly.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'privacy-qa1', title: 'Privacy Policy page', desc: 'Privacy Policy is reachable from the footer and readable on mobile.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'terms-qa1', title: 'Terms of Use page', desc: 'Terms of Use is reachable from the footer and readable on mobile.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'faq-qa1', title: 'FAQ page — Phase 1 questions', desc: 'FAQ answers order/brand questions and works on mobile.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'medium', status: 'untested', assignee: 'qa' },
  { id: 'join-qa1', title: 'Join / Memberships — Coming Soon only', desc: 'Join shows Coming Soon; no live member signup in Phase 1.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'email-qa1', title: 'Orders — SnatchVault collection, Non-Negotiable menu, 70/30 split', desc: 'https://snatchvault.com/collections/my-plan-gear is live. Home menu is Non-Negotiable with Tees, Hoodies, and Hats. Split is 70/30.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Auth & Admin', priority: 'high', status: 'untested', assignee: 'evelyn' },
  { id: 'launch-qa1', title: 'Production launch smoke — Shop Gear + payments path', desc: 'After launch, Shop Gear and payment/store links work on production.', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  // Content Factory per sprint
  { id: 'cf-s0-qa', title: 'Content Factory Sprint 0 — sell-now posts, bios, and live talk track', desc: 'Sprint 0 CF spans two weeks: shop link in every post, bios/pinned post, no-sample live, lifestyle tee mockup.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'cf-s1-qa', title: 'Content Factory Sprint 1 — gear picks and posts', desc: 'Sprint 1 CF includes gear uploads/picks and organic posts; filters work.', sprint: 'Sprint 1', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'cf-s2-qa', title: 'Content Factory Sprint 2 — keep-selling cadence', desc: 'Sprint 2 CF keeps selling tees, hoodie, and hat with the Shop Gear URL — shop is already live.', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'cf-s3-qa', title: 'Content Factory Sprint 3 — about/FAQ cadence', desc: 'Sprint 3 CF includes About/FAQ posts and weekend prep.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'cf-s4-qa', title: 'Content Factory Sprint 4 — launch week cadence', desc: 'Sprint 4 CF includes drop announcement and launch-week organic posts.', sprint: 'Sprint 4', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'website-qa1', title: 'Phase 1 website — launch pages live', desc: 'About, Contact, Privacy, Terms, and FAQ load from the footer. Home introduces the website. Mobile has no horizontal scroll.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'list-qa1', title: 'Mailing list sign-up — email only, not a membership', desc: 'Sign-up accepts a valid email (optional first name), rejects empty/invalid/duplicate, and does not open Join / memberships.', sprint: 'Sprint 3', phase: 'Phase 1', category: 'Storefront QA', priority: 'high', status: 'untested', assignee: 'qa' },
  { id: 'analytics-qa1', title: 'Site analytics — latest screens per platform every 3 days', desc: 'Angela uploads the latest analytics for Facebook, Instagram, TikTok, YouTube, and Personal starting tomorrow, then every 3 days. Do not re-upload today’s already-captured screenshots. Each task lists the screens to capture.', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'angela' },
  { id: 'analytics-qa2', title: 'Site analytics review — each platform upload guides the next create', desc: 'Evelyn has an associated review task due the day after each platform gather. Recommendations from that review guide the next create on that platform.', sprint: 'Sprint 2', phase: 'Phase 1', category: 'Content QA', priority: 'high', status: 'untested', assignee: 'evelyn' },
  ...buildPhase1WebsiteReviewQaSeeds(),
  ...buildSprint2WebsiteReviewQaSeeds(),
  ...buildFormWalkthroughQaSeeds(),
  ...buildMoodWorkflowQaSeeds(),
  ...buildJournalMakeReviewQaSeeds(),
];

export const INITIAL_QA_TESTS: QaTestItem[] = rolloverLockedSprintItems(
  INITIAL_QA_TEST_SEEDS.map((test) => ({
    ...test,
    assignee: normalizeTestAssignee(test.assignee),
  })),
  { migrateOutstandingLocked: true },
);

function automatedQaItems(): QaTestItem[] {
  return rolloverLockedSprintItems(AUTOMATED_TEST_SEEDS.map((seed) => ({
    id: seed.id,
    title: seed.title,
    description: seed.description,
    desc: seed.desc,
    sprint: seed.sprint,
    category: seed.category,
    priority: 'high' as const,
    status: 'untested' as const,
    assignee: seed.suite,
    suite: seed.suite,
    steps: [{ id: `s-${seed.id}-1`, label: `Run: ${seed.command}`, href: pageHrefForWorkItem(seed.id), checked: false }],
  })), { migrateOutstandingLocked: true });
}

/** Manual walkthroughs + Vitest catalog + Playwright catalog. */
export function allSeedQaTests(): QaTestItem[] {
  return [...INITIAL_QA_TESTS, ...automatedQaItems()];
}

export function normalizeQaTests(rawList: unknown[] | null | undefined, legacyChecks?: Record<string, boolean>): QaTestItem[] {
  // An explicit empty list is a saved board (including after deletes). Do not resurrect catalog seeds.
  if (Array.isArray(rawList) && rawList.length === 0) return [];
  const source =
    !Array.isArray(rawList)
      ? INITIAL_QA_TESTS.map((t) => ({
          ...t,
          status: legacyChecks?.[t.id] ? ('passed' as QaStatus) : t.status,
        }))
      : rawList;

  const mapped = source.flatMap((raw) => {
    const item = raw as Partial<QaTestItem>;
    const id = String(item.id ?? '').trim();
    if (!id || isInflatedQaId(id)) return [];
    const status =
      item.status && QA_STATUSES.includes(item.status)
        ? item.status
        : legacyChecks?.[id]
          ? 'passed'
          : 'untested';

    const parsedSprint = SPRINT_OPTIONS.includes(item.sprint as SprintCategory)
      ? (item.sprint as SprintCategory)
      : 'Sprint 2';
    const sprint = parsedSprint;
    const catalog = INITIAL_QA_TESTS.find((row) => row.id === id);
    const seed = qaContentSeed(id);
    const rawDesc = String(item.desc ?? '');
    const rawDescription = String(item.description ?? '').trim();
    // Legacy seeds stored the overall write-up in `desc`; stamped notes are JSON arrays.
    const legacyPlainDesc = rawDesc.trim() && !rawDesc.trim().startsWith('[') ? rawDesc.trim() : '';
    const notesRaw = legacyPlainDesc && !rawDescription ? '' : rawDesc;
    const seededSteps = seed ? buildSeededSteps(id, seed.steps) : [];
    const suite = suiteForQaTest({ id, suite: item.suite, category: item.category });
    const audit = parseWorkItemAudit(item.audit);
    const completedOn = parseWorkDueDate(item.completedOn) || undefined;

    return [
      rolloverWorkItemSprint({
        id,
        title: String(item.title ?? '').trim() || catalog?.title || '',
        description: rawDescription || seed?.description || legacyPlainDesc || String(item.title ?? '').trim(),
        desc: notesRaw,
        steps: resolvePersistedSteps(item.steps, seededSteps, pageHrefForWorkItem(id)),
        linkedTaskIds: linkedTasksForTest(id),
        sprint,
        phase: PHASE_OPTIONS.includes(item.phase as WorkPhase) ? (item.phase as WorkPhase) : phaseForSprint(sprint),
        category: QA_CATEGORIES.includes(item.category as QaCategory)
          ? (item.category as QaCategory)
          : suite === 'vitest'
            ? 'Vitest'
            : suite === 'playwright'
              ? 'Playwright'
              : 'Storefront QA',
        priority: PRIORITY_OPTIONS.includes(item.priority as WorkPriority) ? (item.priority as WorkPriority) : 'medium',
        status,
        assignee: normalizeTestAssignee(item.assignee, suite),
        assignor: normalizeAssignor(item.assignor),
        dueDate: parseWorkDueDate(item.dueDate) || dueDateForSprintLabel(parsedSprint),
        attachments: normalizeWorkAttachments(item.attachments),
        suite,
        rolledOver: item.rolledOver === true,
        completedOn,
        ...(audit.length > 0 ? { audit } : {}),
      } satisfies QaTestItem),
    ];
  });

  return pruneInflatedQaTests(mapped).tests;
}

function matchesSet<T>(value: T, set: Set<T>): boolean {
  return set.size === 0 || set.has(value);
}

export function taskMatchesSearch(task: TaskItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    task.title,
    task.notes ?? '',
    task.category,
    task.sprint,
    TASK_STATUS_LABELS[task.status],
    PRIORITY_LABELS[task.priority],
    ASSIGNEE_LABELS[task.assignee],
    ASSIGNEE_LABELS[normalizeAssignor(task.assignor)],
    task.dueDate ?? '',
  ].some((s) => s.toLowerCase().includes(q));
}

export function qaMatchesSearch(test: QaTestItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    test.title,
    test.desc,
    test.category,
    test.sprint,
    QA_STATUS_LABELS[test.status],
    PRIORITY_LABELS[test.priority],
    ASSIGNEE_LABELS[test.assignee],
    ASSIGNEE_LABELS[normalizeAssignor(test.assignor)],
    SUITE_LABELS[suiteForQaTest(test)],
    test.dueDate ?? '',
  ].some((s) => s.toLowerCase().includes(q));
}

export function filterTasks(
  tasks: TaskItem[],
  filters: WorkBoardFilters<TaskStatusFilter>,
  search: string,
): TaskItem[] {
  return tasks.filter(
    (t) =>
      matchesSet(t.sprint, filters.sprint) &&
      matchesRolledOverStatusFilter(t, filters.status) &&
      matchesSet(t.priority, filters.priority) &&
      matchesSet(t.assignee, filters.assignee) &&
      matchesSet(t.category, filters.category) &&
      matchesDueDateFilter(t.dueDate, filters.due ?? 'all') &&
      taskMatchesSearch(t, search),
  );
}

export function filterQaTests(
  tests: QaTestItem[],
  filters: WorkBoardFilters<QaStatusFilter>,
  search: string,
): QaTestItem[] {
  return tests.filter(
    (t) =>
      matchesSet(t.sprint, filters.sprint) &&
      matchesRolledOverStatusFilter(t, filters.status) &&
      matchesSet(t.priority, filters.priority) &&
      matchesSet(t.assignee, filters.assignee) &&
      matchesSet(t.category, filters.category) &&
      matchesDueDateFilter(t.dueDate, filters.due ?? 'all') &&
      qaMatchesSearch(t, search),
  );
}

function countDoneForTasks(items: TaskItem[], predicate: (t: TaskItem) => boolean): { total: number; done: number } {
  const matched = items.filter(predicate);
  return { total: matched.length, done: matched.filter((t) => t.status === 'done').length };
}

function countPassedForQa(items: QaTestItem[], predicate: (t: QaTestItem) => boolean): { total: number; done: number } {
  const matched = items.filter(predicate);
  return { total: matched.length, done: matched.filter((t) => t.status === 'passed').length };
}

export function buildSprintChipCounts<T extends TaskItem | QaTestItem>(
  items: T[],
  isDone: (item: T) => boolean,
): FilterChipCount[] {
  return SPRINT_OPTIONS.map((sprint) => {
    const matched = items.filter((i) => i.sprint === sprint);
    return {
      id: sprint,
      label: sprintLabelWithDates(sprint),
      total: matched.length,
      done: matched.filter(isDone).length,
      accent: SPRINT_SWATCH[sprint],
    };
  });
}

export function buildStatusChipCounts<T extends string>(
  items: { status: T }[],
  options: T[],
  labels: Record<T, string>,
  isDone: (status: T) => boolean,
  accents?: Partial<Record<T, string>>,
): FilterChipCount[] {
  return options.map((status) => {
    const matched = items.filter((i) => i.status === status);
    return {
      id: status,
      label: labels[status],
      total: matched.length,
      done: matched.filter((i) => isDone(i.status)).length,
      accent: accents?.[status],
    };
  });
}

export function appendRolledOverStatusChip<T extends { rolledOver?: boolean; status: string }>(
  chips: FilterChipCount[],
  items: T[],
  isDone: (item: T) => boolean,
): FilterChipCount[] {
  const matched = items.filter((item) => item.rolledOver);
  return [
    ...chips,
    {
      id: ROLLOVER_STATUS_ID,
      label: ROLLOVER_STATUS_LABEL,
      total: matched.length,
      done: matched.filter(isDone).length,
      accent: '#C2410C',
    },
  ];
}

export function buildPriorityChipCounts<T extends { priority: WorkPriority; status: string }>(
  items: T[],
  isDone: (item: T) => boolean,
): FilterChipCount[] {
  return PRIORITY_OPTIONS.map((priority) => {
    const matched = items.filter((i) => i.priority === priority);
    return {
      id: priority,
      label: PRIORITY_LABELS[priority],
      total: matched.length,
      done: matched.filter(isDone).length,
    };
  });
}

export function buildAssigneeChipCounts<T extends { assignee: WorkAssignee; status: string }>(
  items: T[],
  isDone: (item: T) => boolean,
  assignees: WorkAssignee[] = TASK_ASSIGNEE_OPTIONS,
): FilterChipCount[] {
  return assignees.map((assignee) => {
    const matched = items.filter((i) => i.assignee === assignee);
    return {
      id: assignee,
      label: ASSIGNEE_LABELS[assignee],
      total: matched.length,
      done: matched.filter(isDone).length,
      accent:
        assignee === 'angela'
          ? '#C2410C'
          : assignee === 'evelyn'
            ? '#1F1917'
            : assignee === 'dev'
              ? '#2563EB'
              : assignee === 'qa'
                ? '#10B981'
                : assignee === 'vitest'
                  ? '#2563EB'
                  : assignee === 'playwright'
                    ? '#7C3AED'
                    : '#9CA3AF',
    };
  });
}

export function buildCategoryChipCounts<T extends { category: string; status: string }>(
  items: T[],
  categories: readonly string[],
  isDone: (item: T) => boolean,
): FilterChipCount[] {
  return categories.map((category) => {
    const matched = items.filter((i) => i.category === category);
    return {
      id: category,
      label: category,
      total: matched.length,
      done: matched.filter(isDone).length,
    };
  });
}

export function taskIsDone(task: TaskItem): boolean {
  return task.status === 'done';
}

export function qaIsDone(test: QaTestItem): boolean {
  return test.status === 'passed';
}

/** Human hint when Done/Passed is blocked by unchecked steps. */
export function checklistBlockMessage(kind: 'task' | 'test'): string {
  return kind === 'task'
    ? 'Check every step before marking this task Done.'
    : 'Check every step before marking this test Passed.';
}

export function canCompleteWithChecklist(
  kind: 'task' | 'test',
  steps: WorkChecklistStep[] | null | undefined,
  nextStatus: string,
): { ok: true } | { ok: false; error: string } {
  const needsAll =
    (kind === 'task' && nextStatus === 'done') || (kind === 'test' && nextStatus === 'passed');
  if (!needsAll || checklistAllChecked(steps)) return { ok: true };
  return { ok: false, error: checklistBlockMessage(kind) };
}
