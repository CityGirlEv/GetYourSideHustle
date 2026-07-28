/**
 * Closed / locked sprints — client helpers.
 * After End Sprint / Close, items still assigned to that sprint cannot be modified
 * (except Evelyn, who can bypass via canBypassSprintLock).
 */

import { api } from "./api";
import { canBypassSprintLock } from "./gysh-assignment";
import { sprintLabel } from "./gysh-sprints";

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
