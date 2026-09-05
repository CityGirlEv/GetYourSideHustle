/** Sprint 0 started Monday Aug 24, 2026. Sprint 0 is 2 weeks; Sprint 1+ are 1 week each. */
export const SPRINT_0_START_ISO = '2026-08-24';

export const CORE_SPRINT_IDS = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4'] as const;
export type CoreSprintId = (typeof CORE_SPRINT_IDS)[number];

export interface SprintWindow {
  id: CoreSprintId;
  label: string;
  startIso: string;
  endIso: string;
  dates: string;
  duration: string;
}

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatWeekdayMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatRange(start: Date, end: Date): string {
  return `${formatWeekdayMonthDay(start)} – ${formatWeekdayMonthDay(end)}, ${end.getFullYear()}`;
}

export function isoDateOffsetDays(iso: string, days: number): string {
  return toIso(addDays(parseLocalDate(iso), days));
}

export function isoDateDiffDays(fromIso: string, toIso: string): number {
  const from = parseLocalDate(fromIso);
  const to = parseLocalDate(toIso);
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function weekdayShortFromIso(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString('en-US', { weekday: 'short' });
}

/** Map a calendar date onto a Phase 1 sprint window (overflow stays on Sprint 4). */
export function sprintPlacementForIso(dateIso: string): {
  id: CoreSprintId;
  label: string;
  day: number;
} {
  const date = parseLocalDate(dateIso);
  for (const window of SPRINT_WINDOWS) {
    const start = parseLocalDate(window.startIso);
    const end = parseLocalDate(window.endIso);
    end.setHours(23, 59, 59, 999);
    if (date >= start && date <= end) {
      return { id: window.id, label: window.label, day: isoDateDiffDays(window.startIso, dateIso) };
    }
  }
  const last = SPRINT_WINDOWS[SPRINT_WINDOWS.length - 1] ?? SPRINT_WINDOWS[0];
  const first = SPRINT_WINDOWS[0] ?? last;
  if (last && date > parseLocalDate(last.endIso)) {
    return { id: last.id, label: last.label, day: isoDateDiffDays(last.startIso, dateIso) };
  }
  return { id: first.id, label: first.label, day: 0 };
}

/** Inclusive mid-point of a sprint window (due date / mid-sprint check-in). */
export function midSprintDueDateIso(startIso: string, endIso: string): string {
  const start = parseLocalDate(startIso);
  const end = parseLocalDate(endIso);
  const spanDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return toIso(addDays(start, Math.floor(spanDays / 2)));
}

/**
 * Sprint 0 = 2 weeks (Mon–Sun spanning 14 days).
 * Sprint 1+ = 1 week each, starting the Monday after the previous sprint ends.
 */
export function buildSprintWindows(sprint0StartIso = SPRINT_0_START_ISO): SprintWindow[] {
  const windows: SprintWindow[] = [];
  let nextStart = parseLocalDate(sprint0StartIso);

  CORE_SPRINT_IDS.forEach((id, index) => {
    const lengthDays = index === 0 ? 14 : 7;
    const start = nextStart;
    const end = addDays(start, lengthDays - 1);
    windows.push({
      id,
      label: `Sprint ${index}`,
      startIso: toIso(start),
      endIso: toIso(end),
      dates: formatRange(start, end),
      duration: index === 0 ? '2 Weeks' : '1 Week',
    });
    nextStart = addDays(end, 1);
  });

  return windows;
}

export const SPRINT_WINDOWS = buildSprintWindows();

export function currentSprintWindow(now = new Date()) {
  for (const window of SPRINT_WINDOWS) {
    const start = parseLocalDate(window.startIso);
    const end = parseLocalDate(window.endIso);
    end.setHours(23, 59, 59, 999);
    if (now >= start && now <= end) return window;
  }
  const first = SPRINT_WINDOWS[0];
  const last = SPRINT_WINDOWS[SPRINT_WINDOWS.length - 1];
  if (first && now < parseLocalDate(first.startIso)) return first;
  return last ?? first;
}

export function sprintWindowById(id: string): SprintWindow | undefined {
  return SPRINT_WINDOWS.find((window) => window.id === id);
}

export function sprintWindowByLabel(label: string): SprintWindow | undefined {
  return SPRINT_WINDOWS.find((window) => window.label === label);
}

/** Official date range for a board sprint heading (`Sprint 0` … `Sprint 4`). */
export function sprintDatesForLabel(label: string): string {
  return sprintWindowByLabel(label)?.dates ?? '';
}

/** Mid-sprint due date for a board sprint label (`Sprint 0` … `Sprint 4`). */
export function dueDateForSprintLabel(label: string): string {
  const window = sprintWindowByLabel(label);
  if (!window) return '';
  return midSprintDueDateIso(window.startIso, window.endIso);
}

export function sprintDatesForId(id: string): string | undefined {
  if (id === 'arch' || id === 'design') {
    const sprint0 = sprintWindowById('sprint0');
    const sprint1 = sprintWindowById('sprint1');
    if (sprint0 && sprint1) return `${sprint0.dates.split(' – ')[0]} – ${sprint1.dates.replace(/^.*? – /, '')}`;
  }
  if (id === 'socials-ad-infra' || id === 'content-factory-engine') {
    const sprint4 = sprintWindowById('sprint4');
    return sprint4 ? `Starts ${addDaysLabel(sprint4.endIso, 1)}` : undefined;
  }
  if (id === 'maint-website' || id === 'maint-socials') {
    const sprint4 = sprintWindowById('sprint4');
    return sprint4 ? `Ongoing from ${addDaysLabel(sprint4.endIso, 1)}` : undefined;
  }
  return sprintWindowById(id)?.dates;
}

function addDaysLabel(iso: string, days: number): string {
  return formatWeekdayMonthDay(addDays(parseLocalDate(iso), days));
}

export function phase1DateRange(): string {
  const first = sprintWindowById('sprint0');
  const last = sprintWindowById('sprint4');
  if (!first || !last) return '';
  return `${first.dates.split(' – ')[0]} – ${last.dates.replace(/^.*? – /, '')}`;
}

export function applyOfficialSprintDates<T extends { id: string; dates?: string; duration?: string }>(
  item: T,
): T {
  const window = sprintWindowById(item.id);
  if (window) {
    return { ...item, dates: window.dates, duration: window.duration };
  }
  const dates = sprintDatesForId(item.id);
  if (dates) return { ...item, dates };
  return item;
}
