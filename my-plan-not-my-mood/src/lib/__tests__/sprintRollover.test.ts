import { describe, expect, it } from 'vitest';
import {
  LOCKED_SPRINTS,
  ROLLOVER_NOTE_TEXT,
  ROLLOVER_STATUS_ID,
  ROLLOVER_STATUS_LABEL,
  assignableSprintOptions,
  canAssignSprint,
  hasRolloverNote,
  isSprintLocked,
  matchesRolledOverStatusFilter,
  rolloverLockedSprintItems,
  rolloverOutstandingContentFactoryItems,
  rolloverSprint,
  rolloverWorkItemSprint,
  sprintSectionTitle,
  sprintSelectOptions,
  stampRolloverNote,
} from '../sprintRollover';

describe('sprintRollover', () => {
  it('rolls Sprint 0 work to Sprint 1, stamps the note, and keeps assignee intact', () => {
    expect(LOCKED_SPRINTS).toEqual(['Sprint 0']);
    expect(isSprintLocked('Sprint 0')).toBe(true);
    expect(isSprintLocked('Sprint 1')).toBe(false);
    expect(canAssignSprint('Sprint 0')).toBe(false);
    expect(canAssignSprint('Sprint 1')).toBe(true);
    expect(rolloverSprint('Sprint 0')).toBe('Sprint 1');
    expect(ROLLOVER_STATUS_LABEL).toBe('Rolled Over');

    const task = {
      id: 't-49',
      title: 'Set up Resend so tester emails can send',
      sprint: 'Sprint 0',
      assignee: 'evelyn',
      assignor: 'angela',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-09-03',
      notes: '',
    };
    const rolled = rolloverWorkItemSprint(task);
    expect(rolled.sprint).toBe('Sprint 1');
    expect(rolled.rolledOver).toBe(true);
    expect(rolled.assignee).toBe('evelyn');
    expect(rolled.assignor).toBe('angela');
    expect(rolled.status).toBe('in_progress');
    expect(rolled.dueDate).toBe('2026-09-03');
    expect(hasRolloverNote(rolled.notes)).toBe(true);
    expect(rolled.notes).toContain(ROLLOVER_NOTE_TEXT);
  });

  it('does not let assignment land on a locked sprint and exposes a Rolled Over status filter', () => {
    expect(assignableSprintOptions(['Sprint 0', 'Sprint 1', 'Sprint 2'])).toEqual(['Sprint 1', 'Sprint 2']);
    expect(sprintSelectOptions(['Sprint 0', 'Sprint 1', 'Sprint 2'])).toEqual(['Sprint 1', 'Sprint 2']);
    expect(sprintSectionTitle('Sprint 0')).toBe('Sprint 0 · Locked');
    expect(
      rolloverLockedSprintItems([
        { id: 'a', sprint: 'Sprint 0', assignee: 'angela', notes: '' },
        { id: 'b', sprint: 'Sprint 2', assignee: 'qa', notes: '' },
      ]),
    ).toEqual([
      expect.objectContaining({ id: 'a', sprint: 'Sprint 1', assignee: 'angela', rolledOver: true }),
      { id: 'b', sprint: 'Sprint 2', assignee: 'qa', notes: '' },
    ]);
    expect(
      matchesRolledOverStatusFilter({ status: 'not_started', rolledOver: true }, new Set([ROLLOVER_STATUS_ID])),
    ).toBe(true);
    expect(matchesRolledOverStatusFilter({ status: 'not_started' }, new Set([ROLLOVER_STATUS_ID]))).toBe(false);
  });

  it('keeps finished Sprint 0 work on Sprint 0 and puts wrongly rolled done items back', () => {
    const finished = rolloverWorkItemSprint({
      id: 't-1',
      title: 'Confirm $10,000 budget paid across three phases',
      sprint: 'Sprint 0',
      assignee: 'angela',
      assignor: 'evelyn',
      status: 'done',
      notes: '',
    });
    expect(finished).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'angela',
      assignor: 'evelyn',
    });
    expect(finished.rolledOver).toBeFalsy();
    expect(hasRolloverNote(finished.notes)).toBe(false);

    const wronglyRolled = rolloverWorkItemSprint({
      id: 't-1',
      sprint: 'Sprint 1',
      assignee: 'angela',
      status: 'done',
      rolledOver: true,
      notes: stampRolloverNote('Keep this note.'),
    });
    expect(wronglyRolled).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'angela',
      rolledOver: false,
    });
    expect(hasRolloverNote(wronglyRolled.notes)).toBe(false);
    expect(wronglyRolled.notes).toContain('Keep this note.');

    const passed = rolloverWorkItemSprint({
      id: 'home-qa1',
      sprint: 'Sprint 1',
      assignee: 'qa',
      status: 'passed',
      rolledOver: true,
      desc: stampRolloverNote(''),
    });
    expect(passed).toMatchObject({
      sprint: 'Sprint 0',
      status: 'passed',
      assignee: 'qa',
      rolledOver: false,
    });
    expect(hasRolloverNote(passed.desc)).toBe(false);
  });

  it('moves outstanding Content Factory Sprint 0 rows and leaves done rows on Sprint 0', () => {
    const rows = rolloverOutstandingContentFactoryItems([
      { id: 'cf-s0-mon-angela', sprint: 'Sprint 0', status: 'not_started', assignee: 'angela', channel: 'facebook' },
      { id: 'cf-s0-tue-evelyn', sprint: 'Sprint 0', status: 'done', assignee: 'evelyn', channel: 'youtube' },
      {
        id: 'cf-s0-wed-done',
        sprint: 'Sprint 1',
        status: 'done',
        assignee: 'evelyn',
        channel: 'tiktok',
        rolledOver: true,
        note: ROLLOVER_NOTE_TEXT,
      },
    ]);
    expect(rows[0]).toMatchObject({
      sprint: 'Sprint 1',
      status: 'not_started',
      assignee: 'angela',
      rolledOver: true,
      note: ROLLOVER_NOTE_TEXT,
    });
    expect(rows[1]).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'evelyn',
    });
    expect(rows[1].rolledOver).toBeFalsy();
    expect(rows[2]).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'evelyn',
      rolledOver: false,
      note: '',
    });
  });
});
