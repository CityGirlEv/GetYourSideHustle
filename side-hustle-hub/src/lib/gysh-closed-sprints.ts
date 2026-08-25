/**
 * Closed / locked sprints — client helpers.
 * After End Sprint / Close, items still assigned to that sprint cannot be modified
 * (except Evelyn, who can bypass via canBypassSprintLock).
 */

import { api } from "./api";
import { canBypassSprintLock } from "./gysh-assignment";
import {
  currentSprintIndex,
  DEFAULT_SPRINT_COUNT,
  sprintLabel,
} from "./gysh-sprints";

export const SPRINT_LOCKED_MESSAGE =
  "This sprint is closed and locked. No further modifications can be made to items in it.";

export function sprintLockedMessage(sprintIndex: number): string {
  return `${SPRINT_LOCKED_MESSAGE} (${sprintLabel(sprintIndex)})`;
}

/** True when the sprint is in the closed set (for badges / Re-open UI). */
export function isSprintLocked(
  closed: Iterable<number> | null | undefined,
  sprint: number | null | undefined,
): boolean {
  if (sprint === null || sprint === undefined) return false;
  const idx = Number(sprint);
  if (!Number.isFinite(idx) || idx < 0) return false;
  if (!closed) return false;
  if (closed instanceof Set) return closed.has(idx);
  for (const n of closed) {
    if (Number(n) === idx) return true;
  }
  return false;
}

/**
 * True when edits to this sprint should be blocked for this actor.
 * Evelyn can still modify closed sprints; others cannot.
 */
export function isSprintEditLocked(
  closed: Iterable<number> | null | undefined,
  sprint: number | null | undefined,
  actor?: { email?: string; name?: string } | null,
): boolean {
  if (canBypassSprintLock(actor)) return false;
  return isSprintLocked(closed, sprint);
}

/**
 * True when a save is only pulling an item out of a closed sprint into an
 * open sprint / backlog. Anyone may do this — it does not reopen the sprint.
 */
export function isUnlockMoveToOpenSprint(
  closed: Iterable<number> | null | undefined,
  fromSprint: number | null | undefined,
  toSprint: number | null | undefined,
): boolean {
  if (fromSprint === null || fromSprint === undefined) return false;
  if (toSprint === null || toSprint === undefined) return false;
  const from = Number(fromSprint);
  const to = Number(toSprint);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) return false;
  return isSprintLocked(closed, from) && !isSprintLocked(closed, to);
}

/**
 * Sprint for a newly created test: the current sprint if it is open,
 * otherwise the next open sprint. Never a closed sprint.
 */
export function sprintForNewTest(
  closed?: Iterable<number> | null,
  ref: Date = new Date(),
): number {
  return firstUnlockedSprint(closed, ref) ?? Math.max(1, currentSprintIndex(ref));
}

/**
 * First placement when a test has no stored sprint.
 * Backlog stays backlog. Closed or already-ended sprints redirect to the
 * current open sprint. Future/open suggested bands are kept.
 */
export function placeUnstoredTestSprint(
  suggested: number,
  closed?: Iterable<number> | null,
  ref: Date = new Date(),
): number {
  if (!Number.isFinite(suggested) || suggested < 0) return suggested;
  const current = currentSprintIndex(ref);
  if (isSprintLocked(closed, suggested) || suggested < current) {
    return sprintForNewTest(closed, ref);
  }
  return suggested;
}

/** Current sprint if unlocked, else the next open sprint. Null if none are open. */
export function firstUnlockedSprint(
  closed: Iterable<number> | null | undefined,
  ref: Date = new Date(),
): number | null {
  const current = currentSprintIndex(ref);
  for (let i = current; i < DEFAULT_SPRINT_COUNT; i++) {
    if (!isSprintLocked(closed, i)) return i;
  }
  for (let i = 0; i < current; i++) {
    if (!isSprintLocked(closed, i)) return i;
  }
  return null;
}

/** First open sprint after `fromSprint` (walks past other closed sprints). */
export function nextUnlockedSprint(
  closed: Iterable<number> | null | undefined,
  fromSprint: number | null | undefined,
  ref: Date = new Date(),
): number | null {
  const from = Number(fromSprint);
  const start = Number.isFinite(from) ? from + 1 : currentSprintIndex(ref);
  for (let i = Math.max(0, start); i < DEFAULT_SPRINT_COUNT; i++) {
    if (!isSprintLocked(closed, i)) return i;
  }
  return firstUnlockedSprint(closed, ref);
}

export async function fetchClosedSprints(): Promise<number[]> {
  const data = await api<{ closed?: number[] }>("closed-sprints");
  return (data.closed ?? [])
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

export async function closeSprint(sprintIndex: number): Promise<number[]> {
  const data = await api<{ closed?: number[] }>("closed-sprints", {
    method: "POST",
    body: { sprintIndex },
  });
  return (data.closed ?? [])
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

/** Admin: unlock a closed sprint (removes from closed_sprints). */
export async function reopenSprint(sprintIndex: number): Promise<number[]> {
  const data = await api<{ closed?: number[] }>("closed-sprints", {
    method: "DELETE",
    body: { sprintIndex },
  });
  return (data.closed ?? [])
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 0);
}
