import { CORE_SPRINT_IDS, SPRINT_WINDOWS, midSprintDueDateIso, type CoreSprintId, type SprintWindow } from './sprintCalendar';

export const AGENDA_STORAGE_KEY = 'myplan_interactive_agenda';

export type MeetingKind = 'standup' | 'retro' | 'working';
export type MeetingTiming = 'past' | 'today' | 'upcoming';

export interface AgendaAttendee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AgendaItem {
  id: string;
  label: string;
  done: boolean;
  custom?: boolean;
  minutes: number;
  notes: string;
  actionItems: string;
  startedAt?: number;
  createdBy?: string;
  createdByName?: string;
}

export interface AgendaActor {
  email?: string;
  name?: string;
  isSuperAdmin?: boolean;
}

export interface SprintMeeting {
  id: string;
  sprintId: CoreSprintId;
  sprintLabel: string;
  kind: MeetingKind;
  title: string;
  cadenceLabel: string;
  dateIso: string;
  whenLabel: string;
}

export interface RecurringMeetingTaskSeed {
  id: string;
  title: string;
  sprint: 'Sprint 0' | 'Sprint 1' | 'Sprint 2' | 'Sprint 3' | 'Sprint 4';
  category: 'Admin Portal';
  priority: 'high';
  status: 'not_started';
  assignee: 'evelyn';
}

/** Thursday — mid-week of a Mon–Sun sprint. */
export const STANDUP_OFFSET_DAYS = 3;
/** Sunday — sprint close / retrospective. */
export const RETRO_OFFSET_DAYS = 6;

export const DEFAULT_STANDUP_LABELS = [
  'What shipped since Monday?',
  'What is blocked — and who can unblock it?',
  'Mid-sprint scope check: stay in the plan or cut?',
  'Testing / QA pulse',
  'Next 3 days: who owns what?',
] as const;

export const DEFAULT_RETRO_LABELS = [
  'What won this sprint?',
  'What slipped — and why?',
  'Keep / drop / try next sprint',
  'Angela sign-off and feedback',
  'Next sprint kickoff notes',
  'Score actuals vs the Plan scorecard (followers, engagement, shop clicks, sales)',
] as const;

export const DEFAULT_WORKING_LABELS = [
  'Open & purpose',
  'Decisions needed',
  'Parking lot',
  'Close & next steps',
] as const;

export const WORKING_AGENDA_ID = 'working-agenda';
export const KICKOFF_MEETING_ID = 'kickoff-agenda';
export const SAVED_KICKOFF_MEETING_ID = 'saved-kickoff-2026-08-27';
export const SAVED_KICKOFF_MEETING_TITLE = 'Saved Kickoff — August 27, 2026';
export const KICKOFF_DATE_ISO = '2026-08-27';
export const KICKOFF_TIME_LABEL = '4:00–6:30 PM PST / 6:00–8:30 PM CST';
export const KICKOFF_WHEN_LABEL = `Thursday, August 27, 2026 · ${KICKOFF_TIME_LABEL}`;
export const DEFAULT_TOPIC_MINUTES = 10;
export const WORKING_AGENDA_TITLE = 'MY PLAN, NOT MY MOOD — Working Agenda';

export type AgendaDetailField = 'notes' | 'actionItems';

export function agendaDetailFieldLabel(field: AgendaDetailField): string {
  return field === 'notes' ? 'Notes' : 'Description';
}

export function agendaDetailFieldValue(
  item: Pick<AgendaItem, 'notes' | 'actionItems'>,
  field: AgendaDetailField,
): string {
  return field === 'notes' ? item.notes : item.actionItems;
}

export type AgendaStage = 'draft' | 'working';

export function parseAgendaStage(value: unknown): AgendaStage {
  return value === 'working' ? 'working' : 'draft';
}

export function agendaStageLabel(stage: AgendaStage): string {
  return stage === 'working' ? 'Working Agenda' : 'Draft Agenda';
}

export function workingAgendaTitle(currentTitle = ''): string {
  const title = currentTitle.trim();
  if (!title || /kickoff/i.test(title) || /draft/i.test(title)) return WORKING_AGENDA_TITLE;
  return title;
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

export function meetingDateIso(startIso: string, offsetDays: number): string {
  return toIso(addDays(parseLocalDate(startIso), offsetDays));
}

export function standupDateIso(startIso: string, endIso?: string): string {
  if (endIso) return midSprintDueDateIso(startIso, endIso);
  return meetingDateIso(startIso, STANDUP_OFFSET_DAYS);
}

export function retroDateIso(startIso: string, endIso?: string): string {
  if (endIso) return endIso;
  return meetingDateIso(startIso, RETRO_OFFSET_DAYS);
}

export function formatMeetingDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function sprintLabelFromId(id: CoreSprintId): RecurringMeetingTaskSeed['sprint'] {
  const index = CORE_SPRINT_IDS.indexOf(id);
  return `Sprint ${index}` as RecurringMeetingTaskSeed['sprint'];
}

export function normalizeAgendaItem(
  item: Partial<AgendaItem> & Pick<AgendaItem, 'id' | 'label'>,
): AgendaItem {
  const minutes = Number(item.minutes);
  return {
    id: item.id,
    label: String(item.label ?? '').trim() || 'Untitled topic',
    done: Boolean(item.done),
    custom: item.custom,
    minutes: Number.isFinite(minutes) && minutes >= 0 ? Math.round(minutes) : DEFAULT_TOPIC_MINUTES,
    notes: typeof item.notes === 'string' ? item.notes : '',
    actionItems: typeof item.actionItems === 'string' ? item.actionItems : '',
    startedAt: typeof item.startedAt === 'number' && Number.isFinite(item.startedAt) ? item.startedAt : undefined,
    createdBy: typeof item.createdBy === 'string' && item.createdBy.trim() ? item.createdBy.trim() : undefined,
    createdByName: typeof item.createdByName === 'string' && item.createdByName.trim()
      ? item.createdByName.trim()
      : undefined,
  };
}

export function canMutateAgendaItem(
  item: Pick<AgendaItem, 'createdBy'>,
  actor?: AgendaActor | null,
): boolean {
  if (!canFacilitateAgenda(actor)) return false;
  if (actor?.isSuperAdmin) return true;
  const email = (actor?.email ?? '').trim().toLowerCase();
  const owner = (item.createdBy ?? '').trim().toLowerCase();
  if (!owner) return true;
  return email === owner;
}

export function canFacilitateAgenda(actor?: AgendaActor | null): boolean {
  return Boolean(actor?.email?.trim());
}

export function canRemoveAgendaItem(
  item: Pick<AgendaItem, 'createdBy'>,
  actor?: AgendaActor | null,
): boolean {
  if (!canFacilitateAgenda(actor)) return false;
  if (actor?.isSuperAdmin) return true;
  const owner = (item.createdBy ?? '').trim().toLowerCase();
  if (!owner) return true;
  return canMutateAgendaItem(item, actor);
}

export function defaultAgendaItems(kind: MeetingKind): AgendaItem[] {
  const labels =
    kind === 'standup'
      ? DEFAULT_STANDUP_LABELS
      : kind === 'retro'
        ? DEFAULT_RETRO_LABELS
        : DEFAULT_WORKING_LABELS;
  const minutes = kind === 'retro' ? 15 : DEFAULT_TOPIC_MINUTES;
  return labels.map((label, index) =>
    normalizeAgendaItem({
      id: `${kind}-${index + 1}`,
      label,
      done: false,
      minutes,
    }),
  );
}

export type AgendaItemInput = Partial<AgendaItem> & Pick<AgendaItem, 'id' | 'label'>;

export function mergeAgendaItems(saved: AgendaItemInput[] | undefined, kind: MeetingKind): AgendaItem[] {
  const defaults = defaultAgendaItems(kind);
  if (!Array.isArray(saved) || saved.length === 0) return defaults;

  const savedById = new Map(saved.map((item) => [item.id, item]));
  const mergedDefaults = defaults.map((item) => {
    const prior = savedById.get(item.id);
    return prior ? { ...item, done: Boolean(prior.done) } : item;
  });
  const custom = saved.filter((item) => item.custom && item.label.trim());
  return [
    ...mergedDefaults.map((item) => normalizeAgendaItem(item)),
    ...custom.map((item) => normalizeAgendaItem({ ...item, label: item.label.trim(), custom: true })),
  ];
}

export function toggleAgendaItem(items: AgendaItem[], id: string, actor?: AgendaActor | null): AgendaItem[] {
  return items.map((item) => {
    if (item.id !== id || !canMutateAgendaItem(item, actor)) return item;
    return { ...item, done: !item.done };
  });
}

export const AGENDA_DRAG_HINT = 'Drag item to where you want it in the Agenda';

export function defaultOpenAgendaItems(itemIds: string[] = []): Record<string, boolean> {
  return Object.fromEntries(itemIds.map((id) => [id, false]));
}

export function toggleAgendaItemOpen(
  open: Record<string, boolean>,
  id: string,
): Record<string, boolean> {
  return { ...open, [id]: !open[id] };
}

export function setAllAgendaItemsOpen(
  itemIds: string[],
  expanded: boolean,
): Record<string, boolean> {
  return Object.fromEntries(itemIds.map((id) => [id, expanded]));
}

export function addCustomAgendaItem(
  items: AgendaItem[],
  label: string,
  minutes = DEFAULT_TOPIC_MINUTES,
  actor?: AgendaActor | null,
): AgendaItem[] {
  const trimmed = label.trim();
  if (!trimmed) return items;
  return [
    normalizeAgendaItem({
      id: `custom-${Date.now()}-${items.length}`,
      label: trimmed,
      done: false,
      custom: true,
      minutes,
      createdBy: actor?.email?.trim() || undefined,
      createdByName: actor?.name?.trim() || undefined,
    }),
    ...items,
  ];
}

export function removeAgendaItem(items: AgendaItem[], id: string, actor?: AgendaActor | null): AgendaItem[] {
  return items.filter((item) => item.id !== id || !canRemoveAgendaItem(item, actor));
}

export function moveAgendaItem(
  items: AgendaItem[],
  id: string,
  direction: -1 | 1,
  actor?: AgendaActor | null,
): AgendaItem[] {
  const index = items.findIndex((item) => item.id === id);
  return placeAgendaItem(items, id, index + direction, actor);
}

export function placeAgendaItem(
  items: AgendaItem[],
  id: string,
  toIndex: number,
  actor?: AgendaActor | null,
  facilitate = false,
): AgendaItem[] {
  const index = items.findIndex((item) => item.id === id);
  const nextIndex = Math.max(0, Math.min(toIndex, items.length - 1));
  if (index < 0 || nextIndex === index) return items;
  const allowed = facilitate
    ? canFacilitateAgenda(actor)
    : canMutateAgendaItem(items[index]!, actor);
  if (!allowed) return items;
  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(nextIndex, 0, moved);
  return next;
}

export function updateAgendaItemMinutes(
  items: AgendaItem[],
  id: string,
  minutes: number,
  actor?: AgendaActor | null,
): AgendaItem[] {
  if (!canFacilitateAgenda(actor) || !items.some((item) => item.id === id)) return items;
  return items.map((item) =>
    item.id === id ? normalizeAgendaItem({ ...item, minutes }) : item,
  );
}

export function updateAgendaItem(
  items: AgendaItem[],
  id: string,
  patch: Partial<Omit<AgendaItem, 'id'>>,
  actor?: AgendaActor | null,
): AgendaItem[] {
  return items.map((item) => {
    if (item.id !== id || !canMutateAgendaItem(item, actor)) return item;
    return normalizeAgendaItem({
      ...item,
      ...patch,
      id: item.id,
      createdBy: item.createdBy,
      createdByName: item.createdByName,
    });
  });
}

/** Start is facilitation, not an authorship edit — any viewer can run a section. */
export function startAgendaItem(items: AgendaItem[], id: string, now = Date.now()): AgendaItem[] {
  if (!items.some((item) => item.id === id)) return items;
  return items.map((item) =>
    normalizeAgendaItem({
      ...item,
      startedAt: item.id === id ? now : undefined,
    }),
  );
}

export function stopAgendaItem(items: AgendaItem[], id: string): AgendaItem[] {
  return items.map((item) =>
    item.id === id ? normalizeAgendaItem({ ...item, startedAt: undefined }) : item,
  );
}

export function agendaItemRemainingSeconds(
  item: Pick<AgendaItem, 'minutes' | 'startedAt'>,
  now = Date.now(),
): number | null {
  if (typeof item.startedAt !== 'number') return null;
  return Math.round(item.minutes * 60 - (now - item.startedAt) / 1000);
}

export function formatAgendaTimer(totalSeconds: number): string {
  const overtime = totalSeconds < 0;
  const abs = Math.abs(Math.trunc(totalSeconds));
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  return `${overtime ? '-' : ''}${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function isAgendaItemDirty(
  saved: Pick<AgendaItem, 'label' | 'minutes' | 'notes' | 'actionItems'>,
  draft: Pick<AgendaItem, 'label' | 'minutes' | 'notes' | 'actionItems'>,
): boolean {
  return (
    saved.label !== draft.label ||
    saved.minutes !== draft.minutes ||
    saved.notes !== draft.notes ||
    saved.actionItems !== draft.actionItems
  );
}

export function totalAgendaMinutes(items: AgendaItem[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.minutes) ? item.minutes : 0), 0);
}

export function formatAgendaDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(Number.isFinite(totalMinutes) ? totalMinutes : 0));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) return `${rest} min`;
  if (rest === 0) return hours === 1 ? '1 hr' : `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

export function agendaProgress(items: AgendaItem[]): { done: number; total: number } {
  return { done: items.filter((item) => item.done).length, total: items.length };
}

export function meetingTiming(dateIso: string, now = new Date()): MeetingTiming {
  const start = parseLocalDate(dateIso);
  const end = parseLocalDate(dateIso);
  end.setHours(23, 59, 59, 999);
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'today';
}

export function buildSprintMeetings(windows: SprintWindow[] = SPRINT_WINDOWS): SprintMeeting[] {
  return windows.flatMap((window) => {
    const standupIso = standupDateIso(window.startIso, window.endIso);
    const retroIso = retroDateIso(window.startIso, window.endIso);
    const sprintLabel = sprintLabelFromId(window.id);
    return [
      {
        id: `standup-${window.id}`,
        sprintId: window.id,
        sprintLabel,
        kind: 'standup' as const,
        title: `${sprintLabel} Mid-Sprint Stand-Up`,
        cadenceLabel: 'Mid-sprint check-in',
        dateIso: standupIso,
        whenLabel: formatMeetingDate(standupIso),
      },
      {
        id: `retro-${window.id}`,
        sprintId: window.id,
        sprintLabel,
        kind: 'retro' as const,
        title: `${sprintLabel} Retrospective`,
        cadenceLabel: 'Sprint close',
        dateIso: retroIso,
        whenLabel: formatMeetingDate(retroIso),
      },
    ];
  });
}

export function meetingsForSprint(
  sprintId: string,
  meetings: SprintMeeting[] = buildSprintMeetings(),
): SprintMeeting[] {
  return meetings.filter((meeting) => meeting.sprintId === sprintId);
}

export type AgendaStateMap = Record<string, AgendaItemInput[]>;

export function loadAgendaState(raw: string | null): AgendaStateMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as AgendaStateMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function workingAgendaMeeting(now = new Date()): SprintMeeting {
  const dateIso = toIso(now);
  return {
    id: WORKING_AGENDA_ID,
    sprintId: 'sprint0',
    sprintLabel: 'Working',
    kind: 'working',
    title: 'Working Agenda',
    cadenceLabel: 'Working agenda',
    dateIso,
    whenLabel: dateIso === KICKOFF_DATE_ISO ? KICKOFF_WHEN_LABEL : formatMeetingDate(dateIso),
  };
}

export function saveFinalAgenda(
  state: AgendaStateMap,
  fromMeeting: Pick<SprintMeeting, 'id'>,
  items: AgendaItem[],
): AgendaStateMap {
  const finalized = items.map((item) => normalizeAgendaItem(item));
  return writeMeetingItems(
    writeMeetingItems(state, fromMeeting.id, finalized),
    WORKING_AGENDA_ID,
    finalized,
  );
}

export function kickoffAgendaMeeting(): SprintMeeting {
  return {
    id: KICKOFF_MEETING_ID,
    sprintId: 'sprint0',
    sprintLabel: 'Sprint 0',
    kind: 'working',
    title: 'Kickoff Meeting',
    cadenceLabel: 'Project kickoff',
    dateIso: KICKOFF_DATE_ISO,
    whenLabel: KICKOFF_WHEN_LABEL,
  };
}

export function savedKickoffMeeting(): SprintMeeting {
  return {
    id: SAVED_KICKOFF_MEETING_ID,
    sprintId: 'sprint0',
    sprintLabel: 'Sprint 0',
    kind: 'working',
    title: SAVED_KICKOFF_MEETING_TITLE,
    cadenceLabel: 'Saved meeting',
    dateIso: KICKOFF_DATE_ISO,
    whenLabel: KICKOFF_WHEN_LABEL,
  };
}

export function listAgendaMeetings(
  windows: SprintWindow[] = SPRINT_WINDOWS,
  now = new Date(),
): SprintMeeting[] {
  return [savedKickoffMeeting(), kickoffAgendaMeeting(), workingAgendaMeeting(now), ...buildSprintMeetings(windows)];
}

export const MEETING_SCHEDULE_LABEL = 'Meeting Schedule';
export const OVERALL_MEETING_SCHEDULE_LABEL = 'Overall Meeting Schedule';

export function isScheduledAgendaMeeting(meeting: Pick<SprintMeeting, 'kind'>): boolean {
  return meeting.kind === 'standup' || meeting.kind === 'retro';
}

export function splitAgendaMeetings(meetings: SprintMeeting[]): {
  current: SprintMeeting[];
  scheduled: SprintMeeting[];
} {
  return {
    current: meetings.filter((meeting) => !isScheduledAgendaMeeting(meeting)),
    scheduled: meetings.filter(isScheduledAgendaMeeting),
  };
}

export type AgendaBoardTab = 'agenda' | 'previous-menus';

export function agendaBoardTabs(): { id: AgendaBoardTab; label: string }[] {
  return [
    { id: 'agenda', label: 'Agenda' },
    { id: 'previous-menus', label: 'Previous Menus' },
  ];
}

/** Saved kickoff archive and any meeting whose date has already passed. */
export function isPreviousAgendaMenu(meeting: Pick<SprintMeeting, 'id' | 'dateIso'>, now = new Date()): boolean {
  if (meeting.id === SAVED_KICKOFF_MEETING_ID) return true;
  if (meeting.id === WORKING_AGENDA_ID) return false;
  return meetingTiming(meeting.dateIso, now) === 'past';
}

export function meetingsForAgendaTab(
  meetings: SprintMeeting[],
  tab: AgendaBoardTab,
  now = new Date(),
): SprintMeeting[] {
  return meetings.filter((meeting) =>
    tab === 'previous-menus' ? isPreviousAgendaMenu(meeting, now) : !isPreviousAgendaMenu(meeting, now),
  );
}

export function defaultMeetingIdForAgendaTab(tab: AgendaBoardTab): string {
  return tab === 'previous-menus' ? SAVED_KICKOFF_MEETING_ID : WORKING_AGENDA_ID;
}

/** Soonest live meeting that is today or later; otherwise the Working Agenda. */
export function upcomingAgendaMeeting(
  meetings: SprintMeeting[] = listAgendaMeetings(),
  now = new Date(),
): SprintMeeting {
  const live = meetingsForAgendaTab(meetings, 'agenda', now);
  const dated = live
    .filter((meeting) => meeting.id !== WORKING_AGENDA_ID && meetingTiming(meeting.dateIso, now) !== 'past')
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  return dated[0] ?? live.find((meeting) => meeting.id === WORKING_AGENDA_ID) ?? workingAgendaMeeting(now);
}

/** Union meetings by id; overlay rows win when the same item id exists twice. */
export function mergeAgendaStateMaps(base: AgendaStateMap, overlay: AgendaStateMap): AgendaStateMap {
  const meetingIds = new Set([...Object.keys(base), ...Object.keys(overlay)]);
  const out: AgendaStateMap = {};
  for (const meetingId of meetingIds) {
    const baseItems = Array.isArray(base[meetingId]) ? base[meetingId]! : [];
    const overlayItems = Array.isArray(overlay[meetingId]) ? overlay[meetingId]! : [];
    if (overlayItems.length === 0) {
      out[meetingId] = baseItems;
      continue;
    }
    if (baseItems.length === 0) {
      out[meetingId] = overlayItems;
      continue;
    }
    const byId = new Map<string, AgendaItemInput>();
    const order: string[] = [];
    for (const item of [...baseItems, ...overlayItems]) {
      const id = String(item.id ?? '').trim();
      if (!id) continue;
      if (!byId.has(id)) order.push(id);
      byId.set(id, item);
    }
    out[meetingId] = order.map((id) => byId.get(id)!);
  }
  return out;
}

/** Defer queue skips the working pad and the saved archive; kickoff still leads stand-ups. */
export function agendaDeferQueue(meetings: SprintMeeting[]): SprintMeeting[] {
  return meetings.filter(
    (meeting) => meeting.id !== WORKING_AGENDA_ID && meeting.id !== SAVED_KICKOFF_MEETING_ID,
  );
}

export function nextAgendaMeeting(
  meetings: SprintMeeting[],
  currentId: string,
): SprintMeeting | null {
  const queue = agendaDeferQueue(meetings);
  const index = queue.findIndex((meeting) => meeting.id === currentId);
  if (index >= 0) return queue[index + 1] ?? null;
  return queue.find(isScheduledAgendaMeeting) ?? null;
}

export function deferAgendaItem(
  state: AgendaStateMap,
  meetings: SprintMeeting[],
  fromMeeting: SprintMeeting,
  itemId: string,
  actor?: AgendaActor | null,
): AgendaStateMap {
  const nextMeeting = nextAgendaMeeting(meetings, fromMeeting.id);
  if (!nextMeeting) return state;
  const fromItems = itemsForMeeting(state, fromMeeting);
  const item = fromItems.find((row) => row.id === itemId);
  if (!item || !canMutateAgendaItem(item, actor)) return state;
  const deferredNote = item.notes.includes('Deferred from')
    ? item.notes
    : [`Deferred from ${fromMeeting.title}.`, item.notes].filter(Boolean).join(' ');
  const deferred = normalizeAgendaItem({
    ...item,
    id: `deferred-${nextMeeting.id}-${item.id}`,
    custom: true,
    done: false,
    notes: deferredNote,
    createdBy: item.createdBy,
    createdByName: item.createdByName,
  });
  return writeMeetingItems(
    writeMeetingItems(state, fromMeeting.id, removeAgendaItem(fromItems, itemId, actor)),
    nextMeeting.id,
    [...itemsForMeeting(state, nextMeeting), deferred],
  );
}

export function itemsForMeeting(state: AgendaStateMap, meeting: SprintMeeting): AgendaItem[] {
  const saved = state[meeting.id];
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map((item) =>
      normalizeAgendaItem({ ...item, id: item.id, label: item.label || 'Untitled topic' }),
    );
  }
  return defaultAgendaItems(meeting.kind);
}

export function writeMeetingItems(
  state: AgendaStateMap,
  meetingId: string,
  items: AgendaItem[],
): AgendaStateMap {
  return { ...state, [meetingId]: items };
}

export function recurringMeetingTaskSeeds(
  windows: SprintWindow[] = SPRINT_WINDOWS,
): RecurringMeetingTaskSeed[] {
  return windows.flatMap((window) => {
    const sprint = sprintLabelFromId(window.id);
    const standupIso = standupDateIso(window.startIso, window.endIso);
    const retroIso = retroDateIso(window.startIso, window.endIso);
    return [
      {
        id: `t-standup-${window.id}`,
        title: `Mid-sprint stand-up — ${sprint} (${formatMeetingDate(standupIso)})`,
        sprint,
        category: 'Admin Portal',
        priority: 'high',
        status: 'not_started',
        assignee: 'evelyn',
      },
      {
        id: `t-retro-${window.id}`,
        title: `Sprint retrospective — ${sprint} (${formatMeetingDate(retroIso)})`,
        sprint,
        category: 'Admin Portal',
        priority: 'high',
        status: 'not_started',
        assignee: 'evelyn',
      },
    ];
  });
}
