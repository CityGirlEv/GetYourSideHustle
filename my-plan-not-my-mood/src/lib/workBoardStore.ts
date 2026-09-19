import { isLogoApiUnavailable } from './logoStore';
import { pruneInflatedQaTests, inflatedQaIdsFromRaw, suiteForQaTest } from './testSuites';
import { rolloverLockedSprintItems } from './sprintRollover';
import {
  INITIAL_TASKS,
  allSeedQaTests,
  normalizeQaTests,
  normalizeTasks,
  overlaySupersededSeedTasks,
  overlayCatalogQaSchedule,
  mergeMissingSeedTasks,
  mergeMissingSeedQaTests,
  pruneDuplicateTasks,
  type QaTestItem,
  type TaskItem,
} from './workBoard';

export const WORKBOARD_API_PATH = '/api/workboard';
export const WORKBOARD_STORE_ID = 'v1';
export const WORKBOARD_SAVE_HINT =
  'This board is shared. Click Save All to write your edits to the database.';

export interface WorkBoardStorePayload {
  tasks: TaskItem[];
  tests: QaTestItem[];
  updatedAt: string;
  updatedBy: string | null;
  empty?: boolean;
  removedTaskIds?: string[];
  removedTestIds?: string[];
}

export interface WorkBoardStoreResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export const TASK_STATUS_RANK: Record<string, number> = {
  not_started: 0,
  blocked: 1,
  in_progress: 2,
  done: 3,
};

export const QA_STATUS_RANK: Record<string, number> = {
  untested: 0,
  in_progress: 1,
  blocked: 2,
  failed: 3,
  failed_retest: 4,
  fixed_retest: 5,
  passed: 6,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function uniqueIds(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const id = String(value ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function withoutRemoved<T extends { id: string }>(items: T[], removedIds: string[]): T[] {
  if (removedIds.length === 0) return items;
  const removed = new Set(removedIds);
  return items.filter((item) => !removed.has(item.id));
}

/** Only the first hydrate may apply a remote board. Later pulls overwrite saved edits. */
export function shouldApplyRemoteWorkBoardPull(options: {
  dirty: boolean;
  saving: boolean;
  hydrated?: boolean;
}): boolean {
  if (options.hydrated === false) return true;
  return false;
}

/** True once the live board differs from the last successful database snapshot. */
export function workBoardHasUnsavedChanges(
  currentFingerprint: string,
  savedFingerprint: string | null | undefined,
): boolean {
  if (!savedFingerprint) return false;
  return currentFingerprint !== savedFingerprint;
}

/** Manual save only — edits stay local until the user clicks Save All. */
export const WORKBOARD_AUTOSAVE_MS = 0;
/** Do not poll D1 after the first load; a live pull reverts fields the user just saved. */
export const WORKBOARD_POLL_MS = 0;

/** Keep every row from both boards; if the same id exists twice, keep the more progressed status. */
export function mergeWorkItemsByProgress<T extends { id: string; status: string }>(
  remote: T[],
  local: T[],
  rank: Record<string, number>,
  preferLocal = false,
): T[] {
  const chosen = new Map<string, T>();
  if (preferLocal) {
    // Unsaved editor: local row wins entirely for shared ids; still pick up remote-only rows.
    const localById = new Map(local.map((item) => [item.id, item]));
    for (const item of remote) {
      chosen.set(item.id, localById.get(item.id) ?? item);
    }
    for (const item of local) {
      chosen.set(item.id, item);
    }
  } else {
    // Equal status: later item wins (remote), so a live poll can pick up peer field edits.
    for (const item of [...local, ...remote]) {
      const current = chosen.get(item.id);
      if (!current || (rank[item.status] ?? 0) >= (rank[current.status] ?? 0)) {
        chosen.set(item.id, item);
      }
    }
  }
  const out: T[] = [];
  const seen = new Set<string>();
  for (const item of [...remote, ...local]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(chosen.get(item.id)!);
  }
  return out;
}

export function hydrateWorkBoardFromRemote(
  remote: WorkBoardStorePayload | null,
  localTasks: TaskItem[],
  localTests: QaTestItem[],
  options: { preferLocal?: boolean; removedTaskIds?: string[]; removedTestIds?: string[] } = {},
): { tasks: TaskItem[]; tests: QaTestItem[] } {
  const preferLocal = Boolean(options.preferLocal);
  const removedTaskIds = uniqueIds([...(remote?.removedTaskIds ?? []), ...(options.removedTaskIds ?? [])]);
  const removedTestIds = uniqueIds([...(remote?.removedTestIds ?? []), ...(options.removedTestIds ?? [])]);
  const remoteIsEmpty = !remote || remote.empty;
  const remoteTasks = withoutRemoved(remoteIsEmpty ? [] : remote.tasks, removedTaskIds);
  const remoteTests = withoutRemoved(remoteIsEmpty ? [] : remote.tests, removedTestIds);
  const localTasksKept = withoutRemoved(localTasks, removedTaskIds);
  const localTestsKept = withoutRemoved(localTests, removedTestIds);
  if (remoteIsEmpty && localTasksKept.length === 0 && localTestsKept.length === 0) {
    return {
      tasks: rolloverLockedSprintItems(withoutRemoved(INITIAL_TASKS, removedTaskIds)),
      tests: rolloverLockedSprintItems(withoutRemoved(allSeedQaTests(), removedTestIds)),
    };
  }
  const progressed = mergeWorkItemsByProgress(remoteTasks, localTasksKept, TASK_STATUS_RANK, preferLocal);
  const mergedTasks = pruneDuplicateTasks(
    overlaySupersededSeedTasks(
      remoteIsEmpty
        ? progressed
        : mergeMissingSeedTasks(progressed, INITIAL_TASKS, removedTaskIds),
    ),
  );
  const progressedTests = mergeWorkItemsByProgress(remoteTests, localTestsKept, QA_STATUS_RANK, preferLocal);
  const mergedTests = pruneInflatedQaTests(
    overlayCatalogQaSchedule(
      remoteIsEmpty
        ? progressedTests
        : mergeMissingSeedQaTests(progressedTests, allSeedQaTests(), removedTestIds),
    ),
  );
  return {
    tasks: rolloverLockedSprintItems(withoutRemoved(mergedTasks.tasks, removedTaskIds)),
    tests: rolloverLockedSprintItems(withoutRemoved(mergedTests.tests, removedTestIds)),
  };
}

/** Incoming rows win by id. Keep peer-only rows. Never re-seed over a saved board. */
export function mergeWorkBoardPayloads(
  existing: WorkBoardStorePayload | null | undefined,
  incoming: WorkBoardStorePayload,
): WorkBoardStorePayload {
  if (!existing || existing.empty) return incoming;
  const removedTaskIds = uniqueIds([...(existing.removedTaskIds ?? []), ...(incoming.removedTaskIds ?? [])]);
  const removedTestIds = uniqueIds([...(existing.removedTestIds ?? []), ...(incoming.removedTestIds ?? [])]);
  const incomingTaskIds = new Set(incoming.tasks.map((task) => task.id));
  const incomingTestIds = new Set(incoming.tests.map((test) => test.id));
  const mergedTasks = pruneDuplicateTasks(
    overlaySupersededSeedTasks(
      withoutRemoved(
        [...incoming.tasks, ...existing.tasks.filter((task) => !incomingTaskIds.has(task.id))],
        removedTaskIds,
      ),
    ),
  );
  const mergedTests = pruneInflatedQaTests(
    overlayCatalogQaSchedule(
      withoutRemoved(
        [...incoming.tests, ...existing.tests.filter((test) => !incomingTestIds.has(test.id))],
        removedTestIds,
      ),
    ),
  );
  return {
    ...incoming,
    tasks: rolloverLockedSprintItems(withoutRemoved(mergedTasks.tasks, removedTaskIds)),
    tests: rolloverLockedSprintItems(withoutRemoved(mergedTests.tests, removedTestIds)),
    removedTaskIds: uniqueIds([...removedTaskIds, ...mergedTasks.removedIds]),
    removedTestIds: uniqueIds([...removedTestIds, ...mergedTests.removedIds]),
  };
}

export function parseWorkBoardStorePayload(value: unknown): WorkBoardStorePayload | null {
  if (!isRecord(value)) return null;
  const tasksRaw = Array.isArray(value.tasks) ? value.tasks : null;
  const testsRaw = Array.isArray(value.tests)
    ? value.tests
    : Array.isArray(value.qaTests)
      ? value.qaTests
      : null;
  if (!tasksRaw && !testsRaw) return null;
  const incomingRemovedTaskIds = uniqueIds(value.removedTaskIds);
  const incomingRemovedTestIds = uniqueIds(value.removedTestIds);
  // Trust the stored board. Re-seeding here resets titles/status back to the catalog.
  const prunedTests = pruneInflatedQaTests(overlayCatalogQaSchedule(normalizeQaTests(testsRaw ?? [])));
  const prunedTasks = pruneDuplicateTasks(overlaySupersededSeedTasks(normalizeTasks(tasksRaw ?? [])));
  const removedTaskIds = uniqueIds([
    ...(Array.isArray(value.removedTaskIds) ? value.removedTaskIds : []),
    ...prunedTasks.removedIds,
  ]);
  const removedTestIds = uniqueIds([
    ...uniqueIds(value.removedTestIds),
    ...prunedTests.removedIds,
    ...inflatedQaIdsFromRaw(testsRaw),
  ]);
  return {
    tasks: withoutRemoved(prunedTasks.tasks, removedTaskIds),
    tests: withoutRemoved(prunedTests.tests, removedTestIds),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    updatedBy: typeof value.updatedBy === 'string' && value.updatedBy.trim() ? value.updatedBy.trim() : null,
    removedTaskIds,
    removedTestIds,
  };
}

export function buildWorkBoardStorePayload(
  tasks: TaskItem[],
  tests: QaTestItem[],
  updatedBy: string | null,
  now = new Date(),
  removed: { taskIds?: string[]; testIds?: string[] } = {},
): WorkBoardStorePayload {
  const removedTaskIds = uniqueIds(removed.taskIds);
  const removedTestIds = uniqueIds(removed.testIds);
  const prunedTasks = pruneDuplicateTasks(overlaySupersededSeedTasks(normalizeTasks(tasks)));
  const prunedTests = pruneInflatedQaTests(overlayCatalogQaSchedule(normalizeQaTests(tests)));
  return {
    tasks: withoutRemoved(prunedTasks.tasks, removedTaskIds),
    tests: withoutRemoved(prunedTests.tests, removedTestIds),
    updatedAt: now.toISOString(),
    updatedBy: updatedBy?.trim() || null,
    removedTaskIds: uniqueIds([...removedTaskIds, ...prunedTasks.removedIds]),
    removedTestIds: uniqueIds([...removedTestIds, ...prunedTests.removedIds]),
  };
}

export function taskRowFingerprint(task: TaskItem): string {
  return JSON.stringify([
    task.id,
    task.title,
    task.status,
    task.assignee,
    task.assignor ?? '',
    task.notes ?? '',
    task.description ?? '',
    task.sprint,
    task.priority,
    task.category,
    task.dueDate ?? '',
    task.steps ?? [],
    task.linkedTestIds ?? [],
    task.attachments ?? [],
    Boolean(task.onAgenda),
    Boolean(task.rolledOver),
    task.completedOn ?? '',
  ]);
}

export function qaRowFingerprint(test: QaTestItem): string {
  return JSON.stringify([
    test.id,
    test.title,
    test.status,
    test.assignee,
    test.assignor ?? '',
    test.desc ?? '',
    test.description ?? '',
    test.sprint,
    test.priority,
    test.category,
    test.dueDate ?? '',
    test.steps ?? [],
    test.linkedTaskIds ?? [],
    test.attachments ?? [],
    test.suite ?? suiteForQaTest(test),
    Boolean(test.rolledOver),
    test.completedOn ?? '',
  ]);
}

export function snapshotRowFingerprints<T extends { id: string }>(
  items: T[],
  fingerprint: (item: T) => string,
): Map<string, string> {
  return new Map(items.map((item) => [item.id, fingerprint(item)]));
}

/** Card Save is on only when this row differs from the last saved snapshot. */
export function workRowHasUnsavedEdits(
  id: string,
  liveFingerprint: string,
  savedById: Map<string, string> | null,
): boolean {
  if (!savedById) return false;
  const saved = savedById.get(id);
  if (saved === undefined) return true;
  return liveFingerprint !== saved;
}

export function workBoardFingerprint(tasks: TaskItem[], tests: QaTestItem[]): string {
  return JSON.stringify({
    tasks: tasks.map((task) => JSON.parse(taskRowFingerprint(task))),
    tests: tests.map((test) => JSON.parse(qaRowFingerprint(test))),
  });
}

export async function fetchWorkBoardStore(): Promise<WorkBoardStorePayload | null> {
  try {
    const response = await fetch(WORKBOARD_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { empty?: boolean } & Record<string, unknown>;
    if (data.empty) return { tasks: [], tests: [], updatedAt: '', updatedBy: null, empty: true };
    return parseWorkBoardStorePayload(data);
  } catch {
    return null;
  }
}

export const isWorkBoardApiUnavailable = isLogoApiUnavailable;

export async function saveWorkBoardStore(payload: WorkBoardStorePayload): Promise<WorkBoardStoreResult> {
  try {
    // Worker merges with D1. Do not GET-then-merge here — that re-hydrates seeds and can
    // overwrite a local delete/edit before the save lands.
    const response = await fetch(WORKBOARD_API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!response.ok || data.ok !== true) {
      return { ok: false, error: data.error || `Work board API failed (${response.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the work board database' };
  }
}
