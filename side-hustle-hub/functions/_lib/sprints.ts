/**
 * Minimal sprint window helpers for Pages Functions (mirrors src/lib/gysh-sprints.ts).
 * Sprint 0 anchors Tue Jul 14 – Mon Jul 20, 2026.
 * Sprint 3+ include a 2-week pause after Soft Launch (Sprint 2 ended Mon Aug 3).
 */

export const BACKLOG_SPRINT = -1;
export const SPRINT_ZERO_START = new Date(2026, 6, 14);
export const DEFAULT_SPRINT_COUNT = 8;
export const SPRINT_PAUSE_WEEKS_AFTER_S2 = 2;
export const SPRINT_PAUSE_AFTER_INDEX = 2;

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sprintCalendarWeekOffset(index: number): number {
  const idx = Math.floor(index);
  if (!Number.isFinite(idx) || idx <= SPRINT_PAUSE_AFTER_INDEX) return 0;
  return SPRINT_PAUSE_WEEKS_AFTER_S2;
}

function sprintStartTuesday(ref: Date): Date {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = d.getDay(); // 0 Sun … 6 Sat
  const delta = day === 0 ? -5 : day === 1 ? -6 : 2 - day;
  d.setDate(d.getDate() + delta);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sprintEndMonday(startTue: Date): Date {
  const end = new Date(startTue);
  end.setDate(startTue.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatDisplayDate(d: Date): string {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function getSprintWindow(index: number): {
  index: number;
  label: string;
  start: Date;
  end: Date;
  rangeLabel: string;
} {
  const baseStart = new Date(SPRINT_ZERO_START);
  const start = new Date(baseStart);
  const weeks = Math.floor(index) + sprintCalendarWeekOffset(index);
  start.setDate(baseStart.getDate() + weeks * 7);
  const end = sprintEndMonday(start);
  const label = index === 0 ? "Sprint 0" : `Sprint ${index}`;
  return {
    index,
    label,
    start,
    end,
    rangeLabel: `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`,
  };
}

export function currentSprintIndex(ref: Date = new Date()): number {
  const tue = sprintStartTuesday(ref);
  const base = new Date(SPRINT_ZERO_START);
  base.setHours(0, 0, 0, 0);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeks = Math.floor((tue.getTime() - base.getTime()) / msPerWeek);
  if (!Number.isFinite(weeks)) return 0;
  let idx: number;
  if (weeks <= SPRINT_PAUSE_AFTER_INDEX) {
    idx = weeks;
  } else if (weeks <= SPRINT_PAUSE_AFTER_INDEX + SPRINT_PAUSE_WEEKS_AFTER_S2) {
    idx = SPRINT_PAUSE_AFTER_INDEX + 1;
  } else {
    idx = weeks - SPRINT_PAUSE_WEEKS_AFTER_S2;
  }
  return Math.max(0, Math.min(DEFAULT_SPRINT_COUNT - 1, idx));
}

export function sprintLabel(sprint: number): string {
  if (sprint === BACKLOG_SPRINT) return "Backlog";
  return sprint === 0 ? "Sprint 0" : `Sprint ${sprint}`;
}

/** Sprint 0 → planning Sunday (Tue+5); Sprint N≥1 → Tue+2. Backlog → "". */
export function dueDateForSprint(sprint: number): string {
  if (sprint === BACKLOG_SPRINT || !Number.isFinite(sprint) || sprint < 0) return "";
  const idx = Math.floor(sprint);
  const sw = getSprintWindow(idx);
  const offset = idx === 0 ? 5 : 2;
  const due = new Date(sw.start);
  due.setDate(sw.start.getDate() + offset);
  due.setHours(0, 0, 0, 0);
  const mm = String(due.getMonth() + 1).padStart(2, "0");
  const dd = String(due.getDate()).padStart(2, "0");
  const yy = String(due.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}
