import { describe, expect, it } from 'vitest';
import { SPRINT_WINDOWS } from '../sprintCalendar';
import {
  AGENDA_DRAG_HINT,
  addCustomAgendaItem,
  agendaDetailFieldLabel,
  agendaDetailFieldValue,
  defaultOpenAgendaItems,
  agendaProgress,
  buildSprintMeetings,
  canFacilitateAgenda,
  canMutateAgendaItem,
  canRemoveAgendaItem,
  defaultAgendaItems,
  deferAgendaItem,
  itemsForMeeting,
  kickoffAgendaMeeting,
  listAgendaMeetings,
  meetingTiming,
  MEETING_SCHEDULE_LABEL,
  OVERALL_MEETING_SCHEDULE_LABEL,
  mergeAgendaItems,
  nextAgendaMeeting,
  parseAgendaStage,
  placeAgendaItem,
  saveFinalAgenda,
  setAllAgendaItemsOpen,
  splitAgendaMeetings,
  recurringMeetingTaskSeeds,
  removeAgendaItem,
  retroDateIso,
  standupDateIso,
  toggleAgendaItem,
  toggleAgendaItemOpen,
  agendaItemRemainingSeconds,
  formatAgendaDuration,
  formatAgendaTimer,
  isAgendaItemDirty,
  startAgendaItem,
  stopAgendaItem,
  updateAgendaItem,
  updateAgendaItemMinutes,
  WORKING_AGENDA_ID,
  WORKING_AGENDA_TITLE,
  agendaStageLabel,
  workingAgendaTitle,
  agendaBoardTabs,
  defaultMeetingIdForAgendaTab,
  isPreviousAgendaMenu,
  meetingsForAgendaTab,
  SAVED_KICKOFF_MEETING_ID,
} from '../sprintAgenda';

const SUPER = { email: 'nonnegotiation@gmail.com', name: 'Evelyn', isSuperAdmin: true };
const ANGELA = { email: 'angela@myplannotmymood.com', name: 'Angela Harris', isSuperAdmin: false };

describe('sprintAgenda', () => {
  it('schedules kickoff for Thursday August 27 from 4:00–6:30 PM PST', () => {
    expect(kickoffAgendaMeeting()).toMatchObject({
      dateIso: '2026-08-27',
      whenLabel: 'Thursday, August 27, 2026 · 4:00–6:30 PM PST / 6:00–8:30 PM CST',
    });
    expect(parseAgendaStage('working')).toBe('working');
    expect(parseAgendaStage('draft')).toBe('draft');
    expect(agendaStageLabel('working')).toBe('Working Agenda');
    expect(workingAgendaTitle('MY PLAN, NOT MY MOOD — Kickoff Meeting')).toBe(WORKING_AGENDA_TITLE);
  });

  it('saves the current agenda as the working agenda', () => {
    const items = addCustomAgendaItem(defaultAgendaItems('working'), 'Budget decision', 10, SUPER);
    const next = saveFinalAgenda({}, { id: 'kickoff-agenda' }, items);
    expect(next['kickoff-agenda']?.map((item) => item.label)).toEqual(items.map((item) => item.label));
    expect(next[WORKING_AGENDA_ID]?.map((item) => item.label)).toEqual(items.map((item) => item.label));
  });

  it('places stand-up on Thursday mid-sprint and retro on Sunday close', () => {
    const sprint0 = SPRINT_WINDOWS[0];
    expect(sprint0?.startIso).toBe('2026-08-24');
    expect(standupDateIso(sprint0!.startIso)).toBe('2026-08-27');
    expect(retroDateIso(sprint0!.startIso)).toBe('2026-08-30');
  });

  it('builds one stand-up and one retrospective per sprint', () => {
    const meetings = buildSprintMeetings();
    expect(meetings).toHaveLength(10);
    expect(meetings.filter((m) => m.kind === 'standup')).toHaveLength(5);
    expect(meetings.filter((m) => m.kind === 'retro')).toHaveLength(5);
    expect(meetings[0]).toMatchObject({
      id: 'standup-sprint0',
      title: 'Sprint 0 Mid-Sprint Stand-Up',
      cadenceLabel: 'Mid-sprint check-in',
      dateIso: '2026-08-30',
    });
    expect(meetings[1]).toMatchObject({
      id: 'retro-sprint0',
      title: 'Sprint 0 Retrospective',
      cadenceLabel: 'Sprint close',
      dateIso: '2026-09-06',
    });
  });

  it('merges saved checks without dropping new default topics', () => {
    const saved = [
      { id: 'standup-1', label: 'old', done: true },
      { id: 'custom-1', label: 'Invite Angela', done: false, custom: true },
    ];
    const merged = mergeAgendaItems(saved, 'standup');
    expect(merged[0]?.done).toBe(true);
    expect(merged.some((item) => item.id === 'standup-2')).toBe(true);
    expect(merged.at(-1)).toMatchObject({ id: 'custom-1', label: 'Invite Angela', custom: true });
  });

  it('toggles, adds, and removes agenda items', () => {
    const start = defaultAgendaItems('retro');
    expect(toggleAgendaItem(start, 'retro-1', SUPER)[0]?.done).toBe(true);
    const withCustom = addCustomAgendaItem(start, '  Parking lot  ', 10, SUPER);
    expect(withCustom[0]?.label).toBe('Parking lot');
    const toggled = toggleAgendaItem(withCustom, withCustom[0]!.id, SUPER);
    expect(toggled[0]?.done).toBe(true);
    expect(agendaProgress(toggled).done).toBe(1);
    expect(addCustomAgendaItem(start, '   ')).toEqual(start);
    expect(removeAgendaItem(withCustom, withCustom[0]!.id, SUPER).some((item) => item.custom)).toBe(false);
  });

  it('starts one section timer at a time and formats remaining time', () => {
    const seed = defaultAgendaItems('working');
    const now = 1_700_000_000_000;
    const started = startAgendaItem(seed, 'working-1', now);
    expect(started[0]?.startedAt).toBe(now);
    expect(started[1]?.startedAt).toBeUndefined();
    expect(agendaItemRemainingSeconds(started[0]!, now)).toBe(started[0]!.minutes * 60);
    expect(formatAgendaTimer(125)).toBe('2:05');
    expect(formatAgendaTimer(-8)).toBe('-0:08');

    const switched = startAgendaItem(started, 'working-2', now + 1000);
    expect(switched[0]?.startedAt).toBeUndefined();
    expect(switched[1]?.startedAt).toBe(now + 1000);
    expect(stopAgendaItem(switched, 'working-2')[1]?.startedAt).toBeUndefined();
    expect(startAgendaItem(seed, 'missing')).toEqual(seed);
  });

  it('labels notes and description fields for the larger editor', () => {
    const item = { notes: 'Open the kickoff', actionItems: 'Confirm attendees' };
    expect(agendaDetailFieldLabel('notes')).toBe('Notes');
    expect(agendaDetailFieldLabel('actionItems')).toBe('Description');
    expect(agendaDetailFieldValue(item, 'notes')).toBe('Open the kickoff');
    expect(agendaDetailFieldValue(item, 'actionItems')).toBe('Confirm attendees');
  });

  it('detects unsaved agenda item edits', () => {
    const item = defaultAgendaItems('working')[0]!;
    expect(isAgendaItemDirty(item, item)).toBe(false);
    expect(isAgendaItemDirty(item, { ...item, notes: 'Hold for Angela' })).toBe(true);
  });

  it('lets users update and delete only their own agenda items', () => {
    const seed = defaultAgendaItems('working');
    expect(canMutateAgendaItem(seed[0]!, ANGELA)).toBe(true);
    expect(canMutateAgendaItem(seed[0]!, SUPER)).toBe(true);
    expect(canRemoveAgendaItem(seed[0]!, ANGELA)).toBe(true);
    expect(canRemoveAgendaItem(seed[0]!, SUPER)).toBe(true);
    expect(canRemoveAgendaItem(seed[0]!, null)).toBe(false);
    expect(toggleAgendaItem(seed, 'working-1', ANGELA)[0]?.done).toBe(true);
    expect(updateAgendaItem(seed, 'working-1', { label: 'Hijack' }, ANGELA)[0]?.label).toBe('Hijack');
    expect(updateAgendaItem(seed, 'working-1', { label: 'Super edit' }, SUPER)[0]?.label).toBe('Super edit');
    expect(removeAgendaItem(seed, 'working-1', ANGELA)).toHaveLength(seed.length - 1);

    const withOwn = addCustomAgendaItem(seed, 'Angela follow-up', 10, ANGELA);
    const own = withOwn[0]!;
    expect(own.createdBy).toBe(ANGELA.email);
    expect(canMutateAgendaItem(own, ANGELA)).toBe(true);
    expect(canMutateAgendaItem(own, SUPER)).toBe(true);
    expect(canRemoveAgendaItem(own, ANGELA)).toBe(true);
    expect(canRemoveAgendaItem(own, SUPER)).toBe(true);
    expect(updateAgendaItem(withOwn, own.id, { notes: 'Mine' }, ANGELA)[0]?.notes).toBe('Mine');
    expect(updateAgendaItem(withOwn, own.id, { notes: 'Hijack' }, SUPER)[0]?.notes).toBe('Hijack');
    expect(removeAgendaItem(withOwn, own.id, ANGELA).some((item) => item.id === own.id)).toBe(false);
    expect(removeAgendaItem(withOwn, own.id, SUPER).some((item) => item.id === own.id)).toBe(false);

    const evelynItem = addCustomAgendaItem(seed, 'Evelyn topic', 10, SUPER)[0]!;
    expect(canMutateAgendaItem(evelynItem, ANGELA)).toBe(false);
    expect(canMutateAgendaItem(evelynItem, SUPER)).toBe(true);
    expect(removeAgendaItem([evelynItem], evelynItem.id, ANGELA)).toHaveLength(1);
    expect(removeAgendaItem([evelynItem], evelynItem.id, SUPER)).toHaveLength(0);
  });

  it('classifies meeting timing and seeds recurring task rows', () => {
    expect(meetingTiming('2026-08-27', new Date(2026, 7, 26))).toBe('upcoming');
    expect(meetingTiming('2026-08-27', new Date(2026, 7, 27, 12))).toBe('today');
    expect(meetingTiming('2026-08-27', new Date(2026, 7, 28))).toBe('past');
    const seeds = recurringMeetingTaskSeeds();
    expect(seeds).toHaveLength(10);
    expect(seeds[0]?.id).toBe('t-standup-sprint0');
    expect(seeds[1]?.id).toBe('t-retro-sprint0');
    expect(seeds.every((task) => task.category === 'Admin Portal')).toBe(true);
  });

  it('groups stand-ups and retros under Meeting Schedule', () => {
    const { current, scheduled } = splitAgendaMeetings(listAgendaMeetings());
    expect(MEETING_SCHEDULE_LABEL).toBe('Meeting Schedule');
    expect(OVERALL_MEETING_SCHEDULE_LABEL).toBe('Overall Meeting Schedule');
    expect(current.map((meeting) => meeting.id)).toEqual([
      'saved-kickoff-2026-08-27',
      'kickoff-agenda',
      'working-agenda',
    ]);
    expect(scheduled.every((meeting) => meeting.kind === 'standup' || meeting.kind === 'retro')).toBe(true);
    expect(scheduled).toHaveLength(10);
  });

  it('puts saved kickoff and past meetings on Previous Menus', () => {
    const meetings = listAgendaMeetings();
    expect(agendaBoardTabs().map((tab) => tab.id)).toEqual(['agenda', 'previous-menus']);
    expect(defaultMeetingIdForAgendaTab('previous-menus')).toBe(SAVED_KICKOFF_MEETING_ID);
    expect(defaultMeetingIdForAgendaTab('agenda')).toBe(WORKING_AGENDA_ID);
    expect(isPreviousAgendaMenu({ id: SAVED_KICKOFF_MEETING_ID, dateIso: '2026-08-27' })).toBe(true);
    expect(isPreviousAgendaMenu({ id: WORKING_AGENDA_ID, dateIso: '2026-08-28' })).toBe(false);
    const afterKickoff = new Date(2026, 7, 28, 12);
    const previous = meetingsForAgendaTab(meetings, 'previous-menus', afterKickoff);
    const current = meetingsForAgendaTab(meetings, 'agenda', afterKickoff);
    expect(previous.map((meeting) => meeting.id)).toContain(SAVED_KICKOFF_MEETING_ID);
    expect(previous.map((meeting) => meeting.id)).toContain('kickoff-agenda');
    expect(current.map((meeting) => meeting.id)).toContain(WORKING_AGENDA_ID);
    expect(current.map((meeting) => meeting.id)).not.toContain(SAVED_KICKOFF_MEETING_ID);
    expect(current.every((meeting) => !isPreviousAgendaMenu(meeting, afterKickoff))).toBe(true);
  });

  it('defers an agenda item onto the next meeting and no-ops on the last one', () => {
    const meetings = listAgendaMeetings();
    const kickoff = meetings.find((meeting) => meeting.id === 'kickoff-agenda')!;
    const firstStandup = meetings.find((meeting) => meeting.id === 'standup-sprint0')!;
    const lastRetro = meetings[meetings.length - 1]!;
    expect(nextAgendaMeeting(meetings, kickoff.id)?.id).toBe('standup-sprint0');
    expect(nextAgendaMeeting(meetings, firstStandup.id)?.id).toBe('retro-sprint0');
    expect(nextAgendaMeeting(meetings, WORKING_AGENDA_ID)?.id).toBe('standup-sprint0');
    expect(nextAgendaMeeting(meetings, lastRetro.id)).toBeNull();

    const source = addCustomAgendaItem(defaultAgendaItems('working'), 'Budget decision', 10, SUPER);
    const deferredItem = source[0]!;
    const nextState = deferAgendaItem(
      { [kickoff.id]: source },
      meetings,
      kickoff,
      deferredItem.id,
      SUPER,
    );
    expect(itemsForMeeting(nextState, kickoff).some((item) => item.id === deferredItem.id)).toBe(false);
    const moved = itemsForMeeting(nextState, firstStandup).at(-1);
    expect(moved?.label).toBe('Budget decision');
    expect(moved?.notes).toContain('Deferred from Kickoff Meeting');
    expect(deferAgendaItem({ [lastRetro.id]: source }, meetings, lastRetro, deferredItem.id, SUPER)).toEqual({
      [lastRetro.id]: source,
    });
    expect(deferAgendaItem({ [kickoff.id]: source }, meetings, kickoff, deferredItem.id, ANGELA)).toEqual({
      [kickoff.id]: source,
    });
  });

  it('formats meeting length and lets facilitators change times and reorder', () => {
    const seed = defaultAgendaItems('working');
    expect(formatAgendaDuration(45)).toBe('45 min');
    expect(formatAgendaDuration(60)).toBe('1 hr');
    expect(formatAgendaDuration(105)).toBe('1 hr 45 min');
    expect(canFacilitateAgenda(SUPER)).toBe(true);
    expect(canFacilitateAgenda(null)).toBe(false);

    const timed = updateAgendaItemMinutes(seed, 'working-1', 25, SUPER);
    expect(timed[0]?.minutes).toBe(25);
    expect(updateAgendaItemMinutes(seed, 'working-1', 25, null)[0]?.minutes).toBe(seed[0]?.minutes);

    const reordered = placeAgendaItem(seed, seed[2]!.id, 0, ANGELA, true);
    expect(reordered[0]?.id).toBe(seed[2]?.id);
    expect(placeAgendaItem(seed, seed[2]!.id, 0, null, true)[0]?.id).toBe(seed[0]?.id);
  });

  it('collapses agenda items by default and toggles one or all open', () => {
    const ids = ['kickoff-1', 'kickoff-2'];
    const closed = defaultOpenAgendaItems(ids);
    expect(closed['kickoff-1']).toBe(false);
    expect(toggleAgendaItemOpen(closed, 'kickoff-1')['kickoff-1']).toBe(true);
    expect(setAllAgendaItemsOpen(ids, true)['kickoff-2']).toBe(true);
    expect(setAllAgendaItemsOpen(ids, false)['kickoff-1']).toBe(false);
  });

  it('adds new agenda items at the top and lets them be placed by drag', () => {
    const seed = defaultAgendaItems('working');
    const withNew = addCustomAgendaItem(seed, 'Brand review', 15, SUPER);
    expect(withNew[0]).toMatchObject({ label: 'Brand review', minutes: 15, custom: true });
    expect(withNew[1]?.id).toBe(seed[0]?.id);
    expect(AGENDA_DRAG_HINT).toBe('Drag item to where you want it in the Agenda');
    const movedDown = placeAgendaItem(withNew, withNew[0]!.id, 2, SUPER);
    expect(movedDown[2]?.label).toBe('Brand review');
    expect(placeAgendaItem(withNew, withNew[0]!.id, 2, ANGELA)[0]?.label).toBe('Brand review');
  });

  it('reads saved items for a meeting from state', () => {
    const meeting = buildSprintMeetings()[0]!;
    const items = itemsForMeeting(
      { [meeting.id]: [{ id: 'standup-1', label: 'x', done: true }] },
      meeting,
    );
    expect(items[0]?.done).toBe(true);
  });
});
