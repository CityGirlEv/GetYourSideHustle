import { resolveTestStatus } from "@/lib/test-result-resolve";
import type { TestStatus } from "@/lib/test-plan";
import type { CheckedSteps } from "@/lib/cloud-sync";

const EMPTY_CHECKS: CheckedSteps = { steps: [], substeps: [] };

/** Compare step/substep check payloads regardless of array order. */
export function checkedStepsEqual(a: CheckedSteps, b: CheckedSteps): boolean {
  return (
    JSON.stringify([...a.steps].sort((x, y) => x - y)) ===
      JSON.stringify([...b.steps].sort((x, y) => x - y)) &&
    JSON.stringify([...a.substeps].sort()) === JSON.stringify([...b.substeps].sort())
  );
}

/** Drop checked-step draft rows that already match the saved baseline. */
export function omitMatchingCheckedStepDrafts(
  draft: Record<string, CheckedSteps>,
  saved: Record<string, CheckedSteps>,
): Record<string, CheckedSteps> {
  let changed = false;
  const next = { ...draft };
  for (const [id, value] of Object.entries(draft)) {
    const baseline = saved[id] ?? EMPTY_CHECKS;
    if (checkedStepsEqual(value, baseline)) {
      delete next[id];
      changed = true;
    }
  }
  return changed ? next : draft;
}

/** Keep an actively engaged test visible when auto-start moves it out of a status filter. */
export function statusFilterMatchesOrEngaged(
  statusFilter: readonly string[],
  status: TestStatus,
  testId: string,
  engaged: ReadonlySet<string>,
): boolean {
  if (statusFilter.length === 0 || statusFilter.includes(status)) return true;
  return engaged.has(testId);
}

/** Fields that can be saved without touching status, notes, severity, or step checks. */
export const METADATA_ONLY_SAVE_FIELDS = new Set([
  "assignee",
  "devAssignee",
  "sprint",
]);

/** True when every pending change for a test is owner/sprint metadata only. */
export function isMetadataOnlyPendingChanges(
  testId: string,
  changes: Array<{ testId: string; field: string }>,
): boolean {
  const fields = changes.filter((c) => c.testId === testId).map((c) => c.field);
  if (fields.length === 0) return false;
  return fields.every((f) => METADATA_ONLY_SAVE_FIELDS.has(f));
}

/** Move to in progress when the tester checks steps but has not finished the list. */
export function shouldForceInProgressStatus(
  allStepsChecked: boolean,
  status: TestStatus,
  hasAnyCheck: boolean,
): boolean {
  if (allStepsChecked) return false;
  if (status === "in_progress") return false;
  if (status === "not_run" && !hasAnyCheck) return false;
  // Pass with unchecked steps is still being verified; leave fail/blocked as-is.
  if (status === "pass") return true;
  if (status === "not_run" && hasAnyCheck) return true;
  return false;
}

/** How long local writes stay protected from cloud hydrate overwriting React state. */
export const CLOUD_RELOAD_GUARD_MS = 5000;

export function resolveSavedStatusBaseline(
  savedStatuses: Record<string, TestStatus>,
  id: string,
): TestStatus {
  return resolveTestStatus(savedStatuses, id);
}

export function shouldSkipCloudReload(input: {
  pendingCount: number;
  saveInFlight: boolean;
  cooldownUntil: number;
  now?: number;
}): boolean {
  const now = input.now ?? Date.now();
  return input.pendingCount > 0 || input.saveInFlight || now < input.cooldownUntil;
}

/** Prefer in-memory saved statuses for tests written locally within the guard window. */
export function mergeStatusesRespectingRecentWrites(
  loaded: Record<string, TestStatus>,
  reactSaved: Record<string, TestStatus>,
  recentWrites: Map<string, number>,
  now: number = Date.now(),
): Record<string, TestStatus> {
  const merged = { ...loaded };
  for (const [id, writtenAt] of recentWrites) {
    if (now - writtenAt < CLOUD_RELOAD_GUARD_MS && reactSaved[id] !== undefined) {
      merged[id] = reactSaved[id]!;
    }
  }
  return merged;
}

export function noteLocalTestWrites(
  recentWrites: Map<string, number>,
  testIds: Iterable<string>,
  now: number = Date.now(),
): void {
  for (const id of testIds) recentWrites.set(id, now);
}

export function touchCloudReloadCooldown(
  cooldownUntilRef: { current: number },
  ms: number = CLOUD_RELOAD_GUARD_MS,
  now: number = Date.now(),
): void {
  cooldownUntilRef.current = now + ms;
}

/** Drop string draft rows that already match the saved baseline. */
export function omitMatchingStringDrafts<T extends string>(
  draft: Record<string, T>,
  saved: Record<string, T>,
  resolveBaseline?: (id: string) => T,
): Record<string, T> {
  let changed = false;
  const next = { ...draft };
  for (const [id, value] of Object.entries(draft)) {
    const baseline = resolveBaseline ? resolveBaseline(id) : ((saved[id] ?? "") as T);
    if (value === baseline) {
      delete next[id];
      changed = true;
    }
  }
  return changed ? next : draft;
}

/** Drop status draft rows that already match the saved baseline. */
export function omitMatchingStatusDrafts(
  draft: Record<string, TestStatus>,
  saved: Record<string, TestStatus>,
  resolveBaseline?: (id: string) => TestStatus,
): Record<string, TestStatus> {
  let changed = false;
  const next = { ...draft };
  for (const [id, value] of Object.entries(draft)) {
    const baseline = resolveBaseline ? resolveBaseline(id) : resolveSavedStatusBaseline(saved, id);
    if (value === baseline) {
      delete next[id];
      changed = true;
    }
  }
  return changed ? next : draft;
}

/** Remove one test id from a draft overlay map (immutable). */
export function omitTestDraft<T>(draft: Record<string, T>, testId: string): Record<string, T> {
  if (!(testId in draft)) return draft;
  const next = { ...draft };
  delete next[testId];
  return next;
}

/** Unique test ids referenced by pending change keys like "TEST-1:status". */
export function testIdsFromPendingKeys(selectedKeys: Iterable<string>): string[] {
  const ids = new Set<string>();
  for (const key of selectedKeys) {
    const sep = key.lastIndexOf(":");
    if (sep > 0) ids.add(key.slice(0, sep));
  }
  return [...ids];
}

/** Drop ids from an engagement set; returns the original set when nothing changed. */
export function disengageTestIds(engaged: Set<string>, testIds: Iterable<string>): Set<string> {
  let changed = false;
  const next = new Set(engaged);
  for (const id of testIds) {
    if (next.delete(id)) changed = true;
  }
  return changed ? next : engaged;
}

/** Test ids touched by pending changes and/or row engagement. */
export function unionDiscardTestIds(
  pendingChanges: { key: string }[],
  engaged: Set<string>,
): string[] {
  const ids = new Set(testIdsFromPendingKeys(pendingChanges.map((c) => c.key)));
  for (const id of engaged) ids.add(id);
  return [...ids];
}

/** Drop recent-write guard entries so reload can read reverted localStorage. */
export function clearRecentLocalWrites(
  recentWrites: Map<string, number>,
  testIds?: Iterable<string>,
): void {
  if (!testIds) {
    recentWrites.clear();
    return;
  }
  for (const id of testIds) recentWrites.delete(id);
}
