/** Persist editorial calendar checkbox progress (local cache + server sync). */

export const CALENDAR_TASK_DONE_PREFIX = "calendar-task-done:";

export function calendarTaskStorageId(event: { date: string; id: string }): string {
  return `${event.date}:${event.id}`;
}

export function loadCalendarCompletedEvents(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  const out: Record<string, boolean> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    if (!key.startsWith(CALENDAR_TASK_DONE_PREFIX)) continue;
    if (localStorage.getItem(key) !== "true") continue;
    out[key.slice(CALENDAR_TASK_DONE_PREFIX.length)] = true;
  }
  return out;
}

export function setCalendarTaskCompleted(storageId: string, completed: boolean): void {
  if (typeof window === "undefined") return;
  const key = `${CALENDAR_TASK_DONE_PREFIX}${storageId}`;
  if (completed) localStorage.setItem(key, "true");
  else localStorage.removeItem(key);
}

/** Write the full merged map to localStorage (device cache). */
export function persistCalendarProgressLocally(completed: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  const activeIds = new Set<string>();
  for (const [storageId, value] of Object.entries(completed)) {
    if (value) {
      activeIds.add(storageId);
      setCalendarTaskCompleted(storageId, true);
    }
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    if (!key.startsWith(CALENDAR_TASK_DONE_PREFIX)) continue;
    const storageId = key.slice(CALENDAR_TASK_DONE_PREFIX.length);
    if (!activeIds.has(storageId)) {
      localStorage.removeItem(key);
    }
  }
}

/** Union server + local checkbox state (both devices keep completed tasks). */
export function mergeCalendarProgressMaps(
  server: Record<string, boolean>,
  local: Record<string, boolean>,
): Record<string, boolean> {
  const merged: Record<string, boolean> = { ...server };
  for (const [key, value] of Object.entries(local)) {
    if (value) merged[key] = true;
  }
  return merged;
}

export function hasLocalOnlyCalendarProgress(
  server: Record<string, boolean>,
  local: Record<string, boolean>,
): boolean {
  return Object.keys(local).some((key) => local[key] && !server[key]);
}

/** Scoped id first; falls back to legacy id-only keys from earlier builds. */
export function isCalendarTaskDone(
  completedEvents: Record<string, boolean>,
  event: { date: string; id: string },
): boolean {
  const scoped = calendarTaskStorageId(event);
  return !!(completedEvents[scoped] ?? completedEvents[event.id]);
}

/** Facebook post slots marked done on any day — skip duplicate launch rows later in the week. */
export function completedFacebookPostSlots(
  completedEvents: Record<string, boolean>,
): Set<number> {
  const slots = new Set<number>();
  for (const [key, done] of Object.entries(completedEvents)) {
    if (!done) continue;
    const match = key.match(/facebook_post:(\d+):launch/);
    if (match) slots.add(Number(match[1]));
  }
  return slots;
}
