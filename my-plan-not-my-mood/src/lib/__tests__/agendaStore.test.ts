import { describe, expect, it } from 'vitest';
import {
  buildAgendaStorePayload,
  parseAgendaStorePayload,
} from '../agendaStore';
import { isAgendaItemDirty } from '../sprintAgenda';

describe('agendaStore', () => {
  it('parses a valid shared agenda payload', () => {
    const payload = parseAgendaStorePayload({
      meetings: {
        kickoff: [{ id: 'custom-1', label: 'Invite Angela', notes: 'Send calendar', minutes: 8 }],
      },
      meta: {
        title: 'Kickoff',
        topic: 'Scope',
        stage: 'working',
        attendees: [{ id: 'a1', name: 'Angela', email: 'angela@example.com', role: 'Admin' }],
      },
      updatedAt: '2026-08-27T21:00:00.000Z',
      updatedBy: 'nonnegotiation@gmail.com',
    });

    expect(payload?.meetings.kickoff?.[0]).toMatchObject({
      id: 'custom-1',
      label: 'Invite Angela',
    });
    expect(payload?.meta?.attendees[0]?.name).toBe('Angela');
    expect(payload?.meta?.stage).toBe('working');
    expect(payload?.updatedBy).toBe('nonnegotiation@gmail.com');
  });

  it('rejects missing meetings and drops invalid attendees', () => {
    expect(parseAgendaStorePayload({ meta: {} })).toBeNull();
    expect(parseAgendaStorePayload(null)).toBeNull();
    const parsed = parseAgendaStorePayload({
      meetings: {},
      meta: { title: 'Kickoff', topic: '', attendees: [{ name: 'No id' }, { id: 'ok', name: 'Ok' }] },
    });
    expect(parsed?.meta?.attendees).toEqual([{ id: 'ok', name: 'Ok', email: '', role: '' }]);
  });

  it('builds a store payload with a timestamp and author', () => {
    const payload = buildAgendaStorePayload(
      { kickoff: [{ id: 'k1', label: 'Open' }] },
      { title: 'Kickoff', topic: 'Plan', attendees: [] },
      'angela@myplannotmymood.com',
      new Date('2026-08-27T22:00:00.000Z'),
    );
    expect(payload.updatedAt).toBe('2026-08-27T22:00:00.000Z');
    expect(payload.updatedBy).toBe('angela@myplannotmymood.com');
    expect(payload.meetings.kickoff?.[0]?.label).toBe('Open');
  });
});

describe('isAgendaItemDirty', () => {
  const saved = {
    id: 'custom-1',
    label: 'Invite Angela',
    done: false,
    minutes: 10,
    notes: 'Send invite',
    actionItems: 'Calendar hold',
  };

  it('is clean when editable fields match', () => {
    expect(isAgendaItemDirty(saved, saved)).toBe(false);
  });

  it('is dirty when label, minutes, notes, or actions change', () => {
    expect(isAgendaItemDirty(saved, { ...saved, label: 'Invite Angela + Evelyn' })).toBe(true);
    expect(isAgendaItemDirty(saved, { ...saved, minutes: 15 })).toBe(true);
    expect(isAgendaItemDirty(saved, { ...saved, notes: 'Updated' })).toBe(true);
    expect(isAgendaItemDirty(saved, { ...saved, actionItems: 'Follow up' })).toBe(true);
  });
});
