import { describe, expect, it } from 'vitest';
import {
  DEFAULT_KICKOFF_ATTENDEES,
  KICKOFF_DATE_ISO,
  KICKOFF_MEETING_TITLE,
  KICKOFF_SEED_TOPICS,
  KICKOFF_TIME_LABEL,
  KICKOFF_WHEN_LABEL,
  addAgendaAttendee,
  draftKickoffFromWork,
  kickoffMailto,
  removeAgendaAttendee,
} from '../kickoffAgenda';
import type { TaskItem } from '../workBoard';

describe('kickoffAgenda', () => {
  it('seeds kickoff topics, attendees, and a draft from work', () => {
    const tasks: TaskItem[] = [
      {
        id: 't-1',
        title: 'Setup Canonical Domain',
        sprint: 'Sprint 0',
        category: 'Infrastructure',
        priority: 'high',
        status: 'not_started',
        assignee: 'evelyn',
      },
    ];
    const draft = draftKickoffFromWork(tasks);
    expect(KICKOFF_MEETING_TITLE).toMatch(/Kickoff/i);
    expect(KICKOFF_DATE_ISO).toBe('2026-08-27');
    expect(KICKOFF_TIME_LABEL).toBe('4:00–6:30 PM PST / 6:00–8:30 PM CST');
    expect(KICKOFF_WHEN_LABEL).toContain('Thursday, August 27, 2026');
    expect(KICKOFF_SEED_TOPICS.length).toBeGreaterThanOrEqual(6);
    expect(draft.some((item) => /Sprint 0/i.test(item.label))).toBe(true);
    expect(draft.some((item) => /Website pages|Page-by-page/i.test(item.label))).toBe(true);
    expect(DEFAULT_KICKOFF_ATTENDEES.map((person) => person.name).join(' ')).toMatch(/Angela/);
    expect(DEFAULT_KICKOFF_ATTENDEES.map((person) => person.name).join(' ')).toMatch(/Evelyn/);
  });

  it('adds and removes attendees and builds an admin email draft', () => {
    const added = addAgendaAttendee(DEFAULT_KICKOFF_ATTENDEES, { name: 'QA Lead', email: 'qa@test.com' });
    expect(added).toHaveLength(3);
    expect(removeAgendaAttendee(added, added[2]!.id)).toHaveLength(2);
    const mailto = kickoffMailto({
      title: KICKOFF_MEETING_TITLE,
      topic: 'Kickoff',
      attendees: DEFAULT_KICKOFF_ATTENDEES,
      items: KICKOFF_SEED_TOPICS,
    });
    expect(mailto.startsWith('mailto:')).toBe(true);
    expect(mailto).toContain('Angela');
  });
});
