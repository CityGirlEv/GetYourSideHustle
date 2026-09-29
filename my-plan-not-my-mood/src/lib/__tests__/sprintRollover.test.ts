import { describe, expect, it } from 'vitest';
import {
  LATEST_CLOSED_SPRINT_END_ISO,
  SPRINT_0_END_ISO,
  SPRINT_1_LATE_DONE_ISO,
  LOCKED_SPRINTS,
  OPEN_ROLLOVER_SPRINT,
  ROLLOVER_NOTE_TEXT,
  ROLLOVER_STATUS_ID,
  ROLLOVER_STATUS_LABEL,
  assignableSprintOptions,
  canAssignSprint,
  countRolledOverItems,
  formatRolledOverCount,
  hasRolloverNote,
  isSprintLocked,
  matchesRolledOverStatusFilter,
  rolloverLockedSprintItems,
  rolloverOutstandingContentFactoryItems,
  rolloverSprint,
  rolloverWorkItemSprint,
  sprintChipLabel,
  sprintSectionTitle,
  sprintSelectOptions,
  stampRolloverNote,
  workItemFinishedOnIso,
} from '../sprintRollover';

describe('sprintRollover', () => {
  it('locks Sprint 0 and Sprint 1 as closed and rolls outstanding work to Sprint 2', () => {
    expect(LOCKED_SPRINTS).toEqual(['Sprint 0', 'Sprint 1']);
    expect(OPEN_ROLLOVER_SPRINT).toBe('Sprint 2');
    expect(isSprintLocked('Sprint 0')).toBe(true);
    expect(isSprintLocked('Sprint 1')).toBe(true);
    expect(isSprintLocked('Sprint 2')).toBe(false);
    expect(canAssignSprint('Sprint 0')).toBe(false);
    expect(canAssignSprint('Sprint 1')).toBe(false);
    expect(canAssignSprint('Sprint 2')).toBe(true);
    expect(rolloverSprint('Sprint 0')).toBe('Sprint 2');
    expect(rolloverSprint('Sprint 1')).toBe('Sprint 2');
    expect(ROLLOVER_STATUS_LABEL).toBe('Rolled Over');
    expect(ROLLOVER_NOTE_TEXT).toBe('Rolled Over to Sprint 2');

    const fromSprint0 = rolloverWorkItemSprint({
      id: 't-49',
      title: 'Set up Resend so tester emails can send',
      sprint: 'Sprint 0',
      assignee: 'evelyn',
      assignor: 'angela',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-09-03',
      notes: '',
    });
    expect(fromSprint0.sprint).toBe('Sprint 2');
    expect(fromSprint0.rolledOver).toBe(true);
    expect(fromSprint0.assignee).toBe('evelyn');
    expect(fromSprint0.assignor).toBe('angela');
    expect(fromSprint0.status).toBe('in_progress');
    expect(fromSprint0.dueDate).toBe('2026-09-03');
    expect(hasRolloverNote(fromSprint0.notes)).toBe(true);
    expect(fromSprint0.notes).toContain(ROLLOVER_NOTE_TEXT);

    const fromSprint1 = rolloverWorkItemSprint({
      id: 't-27',
      title: 'Create Gear Selections page',
      sprint: 'Sprint 1',
      assignee: 'evelyn',
      assignor: 'angela',
      status: 'not_started',
      notes: '',
    });
    expect(fromSprint1).toMatchObject({
      sprint: 'Sprint 2',
      assignee: 'evelyn',
      assignor: 'angela',
      status: 'not_started',
      rolledOver: true,
    });
    expect(hasRolloverNote(fromSprint1.notes)).toBe(true);
  });

  it('does not let assignment land on Sprint 0 or Sprint 1 and exposes a Rolled Over status filter', () => {
    expect(assignableSprintOptions(['Sprint 0', 'Sprint 1', 'Sprint 2'])).toEqual(['Sprint 2']);
    expect(sprintSelectOptions(['Sprint 0', 'Sprint 1', 'Sprint 2'])).toEqual(['Sprint 2']);
    expect(sprintSectionTitle('Sprint 0')).toBe('Sprint 0 · Locked');
    expect(sprintSectionTitle('Sprint 1')).toBe('Sprint 1 · Locked');
    expect(sprintSectionTitle('Sprint 2')).toBe('Sprint 2');
    expect(sprintChipLabel('Sprint 0')).toMatch(/^Sprint 0 · Locked · /);
    expect(sprintChipLabel('Sprint 1')).toMatch(/^Sprint 1 · Locked · /);
    expect(sprintChipLabel('Sprint 2')).toMatch(/^Sprint 2 · /);
    expect(sprintChipLabel('Sprint 2')).not.toMatch(/Locked/);
    expect(
      rolloverLockedSprintItems([
        { id: 'a', sprint: 'Sprint 0', assignee: 'angela', notes: '' },
        { id: 's1', sprint: 'Sprint 1', assignee: 'evelyn', notes: '' },
        { id: 'b', sprint: 'Sprint 3', assignee: 'qa', notes: '' },
      ]),
    ).toEqual([
      expect.objectContaining({ id: 'a', sprint: 'Sprint 2', assignee: 'angela', rolledOver: true }),
      expect.objectContaining({ id: 's1', sprint: 'Sprint 2', assignee: 'evelyn', rolledOver: true }),
      { id: 'b', sprint: 'Sprint 3', assignee: 'qa', notes: '' },
    ]);
    expect(
      rolloverLockedSprintItems([{ id: 's1', sprint: 'Sprint 1', assignee: 'evelyn', notes: '' }], {
        migrateOutstandingLocked: true,
      }),
    ).toEqual([
      expect.objectContaining({ id: 's1', sprint: 'Sprint 2', assignee: 'evelyn', rolledOver: true }),
    ]);
    expect(
      matchesRolledOverStatusFilter({ status: 'not_started', rolledOver: true }, new Set([ROLLOVER_STATUS_ID])),
    ).toBe(true);
    expect(matchesRolledOverStatusFilter({ status: 'not_started' }, new Set([ROLLOVER_STATUS_ID]))).toBe(false);
  });

  it('keeps finished closed-sprint work on its locked sprint and restores wrongly rolled done items to Sprint 1', () => {
    const finishedSprint0 = rolloverWorkItemSprint({
      id: 't-1',
      title: 'Confirm $10,000 budget paid across three phases',
      sprint: 'Sprint 0',
      assignee: 'angela',
      assignor: 'evelyn',
      status: 'done',
      completedOn: '2026-09-05',
      notes: '',
    });
    expect(finishedSprint0).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'angela',
      assignor: 'evelyn',
      completedOn: '2026-09-05',
    });
    expect(finishedSprint0.rolledOver).toBeFalsy();
    expect(hasRolloverNote(finishedSprint0.notes)).toBe(false);

    const sprint0CompletionRolledForward = rolloverWorkItemSprint({
      id: 't-4',
      sprint: 'Sprint 2',
      status: 'done',
      completedOn: '2026-09-05',
      rolledOver: true,
      notes: stampRolloverNote(''),
    });
    expect(sprint0CompletionRolledForward).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      completedOn: '2026-09-05',
      rolledOver: false,
    });

    const undatedSprint0Done = rolloverWorkItemSprint({
      id: 't-43',
      title: 'Verify Initial Payment',
      sprint: 'Sprint 0',
      assignee: 'angela',
      status: 'done',
      notes: '',
    });
    expect(undatedSprint0Done).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'angela',
    });
    expect(undatedSprint0Done.rolledOver).toBeFalsy();

    const sprint0MarkedInSprint1 = rolloverWorkItemSprint({
      id: 't-3',
      title: 'Host the shirt drop on nonnegotiation.com',
      sprint: 'Sprint 0',
      assignee: 'evelyn',
      status: 'done',
      completedOn: '2026-09-12',
      notes: '',
    });
    expect(sprint0MarkedInSprint1).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      completedOn: '2026-09-12',
      rolledOver: false,
    });

    const finishedOnSprint1 = rolloverWorkItemSprint({
      id: 't-1',
      sprint: 'Sprint 1',
      assignee: 'angela',
      status: 'done',
      rolledOver: true,
      notes: stampRolloverNote('Keep this note.'),
    });
    expect(finishedOnSprint1).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      assignee: 'angela',
      rolledOver: false,
    });
    expect(hasRolloverNote(finishedOnSprint1.notes)).toBe(false);
    expect(finishedOnSprint1.notes).toContain('Keep this note.');

    const wronglyOnSprint2 = rolloverWorkItemSprint({
      id: 't-1',
      sprint: 'Sprint 2',
      assignee: 'angela',
      status: 'done',
      rolledOver: true,
      notes: stampRolloverNote('Keep this note.'),
    });
    expect(wronglyOnSprint2).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      assignee: 'angela',
      rolledOver: false,
    });
    expect(hasRolloverNote(wronglyOnSprint2.notes)).toBe(false);
    expect(wronglyOnSprint2.notes).toContain('Keep this note.');

    const passed = rolloverWorkItemSprint({
      id: 'home-qa1',
      sprint: 'Sprint 1',
      assignee: 'qa',
      status: 'passed',
      rolledOver: true,
      desc: stampRolloverNote(''),
    });
    expect(passed).toMatchObject({
      sprint: 'Sprint 1',
      status: 'passed',
      assignee: 'qa',
      rolledOver: false,
    });
    expect(hasRolloverNote(passed.desc)).toBe(false);
  });

  it('keeps work finished on or before Sep 13 on Sprint 1 as done or passed', () => {
    expect(SPRINT_0_END_ISO).toBe('2026-09-06');
    expect(LATEST_CLOSED_SPRINT_END_ISO).toBe('2026-09-13');
    expect(SPRINT_1_LATE_DONE_ISO).toBe('2026-09-14');
    expect(
      workItemFinishedOnIso({
        completedOn: '2026-09-12',
        audit: [{ field: 'status', to: 'Done', at: '2026-09-10T12:00:00.000Z' }],
      }),
    ).toBe('2026-09-12');
    expect(
      workItemFinishedOnIso({
        audit: [{ field: 'status', to: 'Passed', at: '2026-09-11T18:00:00.000Z' }],
      }),
    ).toBe('2026-09-11');

    const doneBeforeClose = rolloverWorkItemSprint({
      id: 't-native-s2',
      sprint: 'Sprint 2',
      status: 'done',
      completedOn: '2026-09-12',
      notes: '',
    });
    expect(doneBeforeClose).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      rolledOver: false,
      completedOn: '2026-09-12',
    });

    const passedBeforeClose = rolloverWorkItemSprint({
      id: 'qa-native-s2',
      sprint: 'Sprint 2',
      status: 'passed',
      audit: [{ field: 'status', to: 'Passed', at: '2026-09-13T21:00:00.000Z' }],
      desc: '',
    });
    expect(passedBeforeClose).toMatchObject({
      sprint: 'Sprint 1',
      status: 'passed',
      rolledOver: false,
    });

    const nativeDoneToday = rolloverWorkItemSprint({
      id: 't-native-s2-today',
      sprint: 'Sprint 2',
      status: 'done',
      completedOn: '2026-09-14',
      notes: '',
    });
    expect(nativeDoneToday).toMatchObject({
      sprint: 'Sprint 2',
      status: 'done',
      completedOn: '2026-09-14',
    });
    expect(nativeDoneToday.rolledOver).toBeFalsy();

    const doneAfterClose = rolloverWorkItemSprint({
      id: 't-native-s2-later',
      sprint: 'Sprint 2',
      status: 'done',
      completedOn: '2026-09-15',
      notes: '',
    });
    expect(doneAfterClose).toMatchObject({
      sprint: 'Sprint 2',
      status: 'done',
    });
    expect(doneAfterClose.rolledOver).toBeFalsy();

    const lateMarkYesterdayOrToday = rolloverWorkItemSprint({
      id: 't-49',
      sprint: 'Sprint 2',
      status: 'done',
      rolledOver: true,
      completedOn: '2026-09-14',
      notes: stampRolloverNote(''),
    });
    expect(lateMarkYesterdayOrToday).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      rolledOver: false,
      completedOn: '2026-09-14',
    });
    expect(hasRolloverNote(lateMarkYesterdayOrToday.notes)).toBe(false);

    const lateCarryoverDueInSprint0 = rolloverWorkItemSprint({
      id: 't-27',
      sprint: 'Sprint 2',
      status: 'done',
      assignee: 'evelyn',
      dueDate: '2026-08-30',
      completedOn: '2026-09-19',
      rolledOver: true,
      notes: stampRolloverNote(''),
    });
    expect(lateCarryoverDueInSprint0).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'evelyn',
      dueDate: '2026-08-30',
      rolledOver: false,
    });

    expect(countRolledOverItems([{ rolledOver: true }, { rolledOver: false }, { rolledOver: true }])).toBe(2);
    expect(formatRolledOverCount(0)).toBe('');
    expect(formatRolledOverCount(3)).toBe('3 rolled over');
  });

  it('moves outstanding Content Factory locked-sprint rows and leaves done rows on their locked sprint', () => {
    const rows = rolloverOutstandingContentFactoryItems([
      { id: 'cf-s0-mon-angela', sprint: 'Sprint 0', status: 'not_started', assignee: 'angela', channel: 'facebook' },
      { id: 'cf-s1-tue-evelyn', sprint: 'Sprint 1', status: 'not_started', assignee: 'evelyn', channel: 'youtube' },
      {
        id: 'cf-s0-tue-evelyn',
        sprint: 'Sprint 0',
        status: 'done',
        assignee: 'evelyn',
        channel: 'youtube',
        completedOn: '2026-09-05',
      },
      {
        id: 'cf-s0-wed-late',
        sprint: 'Sprint 0',
        status: 'done',
        assignee: 'evelyn',
        channel: 'tiktok',
      },
      {
        id: 'cf-s1-wed-done',
        sprint: 'Sprint 1',
        status: 'done',
        assignee: 'evelyn',
        channel: 'tiktok',
        rolledOver: true,
        note: ROLLOVER_NOTE_TEXT,
      },
    ]);
    expect(rows[0]).toMatchObject({
      sprint: 'Sprint 2',
      status: 'not_started',
      assignee: 'angela',
      rolledOver: true,
      note: ROLLOVER_NOTE_TEXT,
    });
    expect(rows[1]).toMatchObject({
      sprint: 'Sprint 2',
      status: 'not_started',
      assignee: 'evelyn',
      rolledOver: true,
      note: ROLLOVER_NOTE_TEXT,
    });
    expect(rows[2]).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'evelyn',
      completedOn: '2026-09-05',
    });
    expect(rows[2].rolledOver).toBeFalsy();
    expect(rows[3]).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'evelyn',
    });
    expect(rows[3].rolledOver).toBeFalsy();
    expect(rows[4]).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      assignee: 'evelyn',
      rolledOver: false,
      note: '',
    });
  });
});
