import { describe, expect, it } from 'vitest';
import { KICKOFF_MEETING_ID } from '../sprintAgenda';
import {
  SAVED_KICKOFF_DECISIONS,
  SAVED_KICKOFF_MEETING_ID,
  SAVED_KICKOFF_PATH,
  agendaMeetingPath,
  parseAgendaMeetingParam,
  savedKickoffAgendaItems,
  savedKickoffMeeting,
  savedKickoffPlanLink,
  seedSavedKickoffIfMissing,
} from '../savedMeetings';

describe('savedMeetings', () => {
  it('archives the August 27 kickoff and exposes a plan link', () => {
    const meeting = savedKickoffMeeting();
    expect(meeting.id).toBe(SAVED_KICKOFF_MEETING_ID);
    expect(meeting.title).toMatch(/Saved Kickoff/i);
    expect(SAVED_KICKOFF_PATH).toBe('/admin/agenda?meeting=saved-kickoff-2026-08-27');
    expect(savedKickoffPlanLink()).toEqual({
      id: 'saved-kickoff',
      label: 'Open saved kickoff meeting',
      href: SAVED_KICKOFF_PATH,
    });
    expect(SAVED_KICKOFF_DECISIONS).toMatch(/\$10,000/);
    expect(SAVED_KICKOFF_DECISIONS).toMatch(/Coming Soon/);
    expect(savedKickoffAgendaItems().some((item) => /gear sales/i.test(item.label))).toBe(true);
  });

  it('reads an allowed meeting id from the agenda URL and seeds the archive once', () => {
    expect(parseAgendaMeetingParam('?meeting=saved-kickoff-2026-08-27', [SAVED_KICKOFF_MEETING_ID])).toBe(
      SAVED_KICKOFF_MEETING_ID,
    );
    expect(parseAgendaMeetingParam('?meeting=nope', [SAVED_KICKOFF_MEETING_ID])).toBe(KICKOFF_MEETING_ID);
    expect(agendaMeetingPath(SAVED_KICKOFF_MEETING_ID)).toBe(SAVED_KICKOFF_PATH);
    const seeded = seedSavedKickoffIfMissing({});
    expect(seeded[SAVED_KICKOFF_MEETING_ID]?.length).toBeGreaterThan(0);
    const kept = [{ id: 'x', label: 'Kept', done: false, minutes: 5, notes: '', actionItems: '' }];
    expect(seedSavedKickoffIfMissing({ [SAVED_KICKOFF_MEETING_ID]: kept })[SAVED_KICKOFF_MEETING_ID]).toEqual(kept);
  });
});
