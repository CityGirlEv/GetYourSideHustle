import { describe, expect, it } from 'vitest';
import {
  SPRINT_WINDOWS,
  applyOfficialSprintDates,
  buildSprintWindows,
  isoDateDiffDays,
  isoDateOffsetDays,
  phase1DateRange,
  sprintDatesForId,
  sprintDatesForLabel,
  sprintIdWithDates,
  sprintLabelWithDates,
  sprintPlacementForIso,
  weekdayShortFromIso,
} from '../sprintCalendar';

describe('sprintCalendar', () => {
  it('starts Sprint 0 on Monday Aug 24, 2026 as 2 weeks, then 1-week Mon–Sun windows', () => {
    const [sprint0, sprint1, sprint4] = [
      SPRINT_WINDOWS[0],
      SPRINT_WINDOWS[1],
      SPRINT_WINDOWS[4],
    ];
    expect(sprint0).toMatchObject({
      id: 'sprint0',
      startIso: '2026-08-24',
      endIso: '2026-09-06',
      duration: '2 Weeks',
    });
    expect(sprint0.dates).toContain('Aug 24');
    expect(sprint0.dates).toContain('Sep 6');
    expect(sprint1).toMatchObject({ startIso: '2026-09-07', endIso: '2026-09-13' });
    expect(sprint4).toMatchObject({ startIso: '2026-09-28', endIso: '2026-10-04' });
    expect(SPRINT_WINDOWS).toHaveLength(5);
  });

  it('starts Sprint 1 the Monday after Sprint 0 ends, then keeps 7-day windows', () => {
    const windows = buildSprintWindows('2026-08-24');
    expect(windows.map((w) => w.startIso)).toEqual([
      '2026-08-24',
      '2026-09-07',
      '2026-09-14',
      '2026-09-21',
      '2026-09-28',
    ]);
  });

  it('applies official dates onto sprint and follow-on items', () => {
    const sprint0 = applyOfficialSprintDates({ id: 'sprint0', dates: 'Date TBD', duration: '' });
    expect(sprint0.dates).toContain('Aug 24');
    expect(sprint0.duration).toBe('2 Weeks');
    expect(sprintDatesForId('arch')).toContain('Aug 24');
    expect(sprintDatesForId('socials-ad-infra')).toMatch(/Oct 5/);
    expect(phase1DateRange()).toContain('Aug 24');
    expect(phase1DateRange()).toContain('Oct 4');
  });

  it('puts official sprint dates on board heading labels', () => {
    expect(sprintDatesForLabel('Sprint 0')).toBe(SPRINT_WINDOWS[0].dates);
    expect(sprintDatesForLabel('Sprint 0')).toMatch(/Aug 24/);
    expect(sprintDatesForLabel('Sprint 1')).toBe(SPRINT_WINDOWS[1].dates);
    expect(sprintDatesForLabel('Sprint 4')).toBe(SPRINT_WINDOWS[4].dates);
    expect(sprintDatesForLabel('Not a sprint')).toBe('');
    expect(sprintLabelWithDates('Sprint 0')).toBe(`Sprint 0 · ${SPRINT_WINDOWS[0].dates}`);
    expect(sprintLabelWithDates('Sprint 2')).toBe(`Sprint 2 · ${SPRINT_WINDOWS[2].dates}`);
    expect(sprintLabelWithDates('Not a sprint')).toBe('Not a sprint');
    expect(sprintIdWithDates('sprint0')).toBe(`Sprint 0 · ${SPRINT_WINDOWS[0].dates}`);
    expect(sprintIdWithDates('sprint4')).toBe(`Sprint 4 · ${SPRINT_WINDOWS[4].dates}`);
  });

  it('places ISO dates onto sprint windows and offsets days', () => {
    expect(isoDateOffsetDays('2026-08-24', 11)).toBe('2026-09-04');
    expect(isoDateDiffDays('2026-08-24', '2026-09-04')).toBe(11);
    expect(sprintPlacementForIso('2026-09-04')).toMatchObject({ id: 'sprint0', label: 'Sprint 0', day: 11 });
    expect(sprintPlacementForIso('2026-09-16')).toMatchObject({ id: 'sprint2', label: 'Sprint 2' });
    expect(weekdayShortFromIso('2026-09-04')).toBe('Fri');
  });
});
