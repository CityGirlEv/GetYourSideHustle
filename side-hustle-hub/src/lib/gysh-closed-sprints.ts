/**
 * Closed / locked sprints — client helpers.
 * After End Sprint / Close, items still assigned to that sprint cannot be modified.
 */

import { api } from "./api";
import { sprintLabel } from "./gysh-sprints";

export const SPRINT_LOCKED_MESSAGE =
  "This sprint is closed and locked. No further modifications can be made to items in it.";

export function sprintLockedMessage(sprintIndex: number): string {
  return `${SPRINT_LOCKED_MESSAGE} (${sprintLabel(sprintIndex)})`;
}

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
