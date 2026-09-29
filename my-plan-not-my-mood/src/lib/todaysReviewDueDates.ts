import { isoDateOffsetDays } from './sprintCalendar';

/**
 * Due window for tests (and their parent review tasks) seeded on 17 Sep 2026:
 * Phase 1 website review, Sprint 2 website review, form walkthroughs, and mood workflow.
 * Spread across Sprint 3 (Mon Sep 21 – Sun Sep 27).
 */
export const TODAYS_NEW_TEST_SPRINT = 'Sprint 3' as const;
export const TODAYS_NEW_TEST_DUE_START = '2026-09-21';
export const TODAYS_NEW_TEST_DUE_END = '2026-09-27';

/** Parent review tasks close Sprint 3 on 9/27. */
export const TODAYS_NEW_TEST_PARENT_DUE = TODAYS_NEW_TEST_DUE_END;

export const TODAYS_NEW_TEST_PARENT_IDS = ['t-203', 't-204', 't-205', 't-206'] as const;

export function todaysNewTestDueDates(): string[] {
  const dates: string[] = [];
  let cursor = TODAYS_NEW_TEST_DUE_START;
  while (cursor <= TODAYS_NEW_TEST_DUE_END) {
    dates.push(cursor);
    cursor = isoDateOffsetDays(cursor, 1);
  }
  return dates;
}

/** Spread a catalog across every day of Sprint 3. */
export function dueDateForTodaysNewTest(index: number): string {
  const dates = todaysNewTestDueDates();
  const i = ((index % dates.length) + dates.length) % dates.length;
  return dates[i] ?? TODAYS_NEW_TEST_DUE_END;
}

export function isTodaysNewTestDueDate(iso: string | undefined): boolean {
  return Boolean(iso && iso >= TODAYS_NEW_TEST_DUE_START && iso <= TODAYS_NEW_TEST_DUE_END);
}

export function isTodaysNewTestId(id: string): boolean {
  return /^(p1web-|s2web-|form-|mood-|journal-)/.test(String(id || ''));
}

export function isTodaysNewTestParentId(id: string): boolean {
  return (TODAYS_NEW_TEST_PARENT_IDS as readonly string[]).includes(String(id || ''));
}
