/** Closed sprints stay on the board as locked sections. Outstanding work rolls forward. */

import { parseWorkNotes, serializeWorkNotes } from './workNoteEntries';
import { sprintDatesForLabel } from './sprintCalendar';

export const LOCKED_SPRINTS = ['Sprint 0', 'Sprint 1'] as const;
export const LATEST_CLOSED_SPRINT = 'Sprint 1';
/** Sprint 0 ended Sunday Sep 6, 2026. Only work finished on or before this date stays on Sprint 0. */
export const SPRINT_0_END_ISO = '2026-09-06';
/** Sprint 1 ran Mon Sep 7 – Sun Sep 13, 2026. */
export const SPRINT_1_START_ISO = '2026-09-07';
/** Sprint 1 closed Sunday Sep 13, 2026. Native Sprint 2 work finished after this date stays on Sprint 2. */
export const LATEST_CLOSED_SPRINT_END_ISO = '2026-09-13';
/** Late Done/Passed marks on Sep 13–14 still count as Sprint 1 work. */
export const SPRINT_1_LATE_DONE_ISO = '2026-09-14';
export const OPEN_ROLLOVER_SPRINT = 'Sprint 2';

export const SPRINT_ROLLOVER: Record<string, string> = {
  'Sprint 0': 'Sprint 2',
  'Sprint 1': 'Sprint 2',
};

export const ROLLOVER_NOTE_TEXT = 'Rolled Over to Sprint 2';
export const ROLLOVER_NOTE_ID = 'n-rollover-sprint-2';
export const ROLLOVER_NOTE_AT = '2026-09-14T00:00:00.000Z';
export const PRIOR_ROLLOVER_NOTE_TEXT = 'Rolled Over to Sprint 1';
export const PRIOR_ROLLOVER_NOTE_ID = 'n-rollover-sprint-1';
export const ROLLOVER_STATUS_ID = 'rolled_over';
export const ROLLOVER_STATUS_LABEL = 'Rolled Over';

/** Former Sprint 0/1 work-board seeds that already sit on a later sprint in the catalog. */
export const CLOSED_SPRINT_CARRYOVER_IDS = new Set([
  't-1',
  't-2',
  't-3',
  't-4',
  't-31',
  't-32',
  't-41',
  't-42',
  't-43',
  't-49',
  't-50',
  't-51',
  't-55',
  't-56',
  't-57',
  't-58',
  't-59',
  't-60',
  't-61',
  't-62',
  't-63',
  't-65',
  't-66',
  't-67',
  't-68',
  't-69',
  't-71',
  't-72',
  't-73',
  't-74',
  't-75',
  't-76',
  'cf-qa1',
  'cf-qa3',
  'logo-qa1',
  'home-qa1',
  'domain-qa1',
  'cf-s0-qa',
  'VT-BOARD-001',
  'VT-ASSETS-001',
  'VT-PLAN-001',
  'VT-SITE-001',
  'PW-HOME-001',
  'PW-PAY-001',
]);

export function isSprintLocked(sprint: string | null | undefined): boolean {
  return (LOCKED_SPRINTS as readonly string[]).includes(String(sprint ?? ''));
}

export function canAssignSprint(sprint: string | null | undefined): boolean {
  return Boolean(sprint) && !isSprintLocked(sprint);
}

/** Move a locked sprint onto its open successor. Unlocked labels stay put. */
export function rolloverSprint<T extends string>(sprint: T): T {
  if (!isSprintLocked(sprint)) return sprint;
  const next = SPRINT_ROLLOVER[sprint];
  return (next ?? OPEN_ROLLOVER_SPRINT) as T;
}

/** Walk locked sprints until the first open one (Sprint 0 → Sprint 2). */
export function firstOpenRolloverSprint(sprint: string | null | undefined): string {
  let current = String(sprint ?? OPEN_ROLLOVER_SPRINT);
  const seen = new Set<string>();
  if (!isSprintLocked(current)) return OPEN_ROLLOVER_SPRINT;
  while (isSprintLocked(current) && SPRINT_ROLLOVER[current] && !seen.has(current)) {
    seen.add(current);
    current = SPRINT_ROLLOVER[current];
  }
  return isSprintLocked(current) ? OPEN_ROLLOVER_SPRINT : current;
}

export function workItemRootId(id: string | null | undefined): string {
  return String(id ?? '').split('::')[0];
}

export function isClosedSprintCarryoverId(id: string | null | undefined): boolean {
  const root = workItemRootId(id);
  return CLOSED_SPRINT_CARRYOVER_IDS.has(root) || root.startsWith('cf-s0-') || root.startsWith('cf-s1-');
}

function noteLooksLikeRollover(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed === ROLLOVER_NOTE_TEXT ||
    trimmed === PRIOR_ROLLOVER_NOTE_TEXT ||
    trimmed.startsWith('Rolled Over to Sprint ')
  );
}

export function hasRolloverNote(raw: string | null | undefined): boolean {
  return parseWorkNotes(raw).some(
    (entry) =>
      entry.id === ROLLOVER_NOTE_ID ||
      entry.id === PRIOR_ROLLOVER_NOTE_ID ||
      noteLooksLikeRollover(entry.text),
  );
}

export function stampRolloverNote(raw: string | null | undefined): string {
  const entries = parseWorkNotes(raw);
  if (entries.some((entry) => entry.id === ROLLOVER_NOTE_ID || entry.text.trim() === ROLLOVER_NOTE_TEXT)) {
    return serializeWorkNotes(entries);
  }
  return serializeWorkNotes([
    ...entries,
    {
      id: ROLLOVER_NOTE_ID,
      author: 'System',
      createdAt: ROLLOVER_NOTE_AT,
      updatedAt: ROLLOVER_NOTE_AT,
      text: ROLLOVER_NOTE_TEXT,
    },
  ]);
}

export function unstampRolloverNote(raw: string | null | undefined): string {
  const entries = parseWorkNotes(raw).filter(
    (entry) =>
      entry.id !== ROLLOVER_NOTE_ID &&
      entry.id !== PRIOR_ROLLOVER_NOTE_ID &&
      !noteLooksLikeRollover(entry.text),
  );
  return serializeWorkNotes(entries);
}

export function unstampLatestRolloverNote(raw: string | null | undefined): string {
  const entries = parseWorkNotes(raw).filter(
    (entry) => entry.id !== ROLLOVER_NOTE_ID && entry.text.trim() !== ROLLOVER_NOTE_TEXT,
  );
  return serializeWorkNotes(entries);
}

export function isOutstandingWorkStatus(status: string | null | undefined): boolean {
  return status !== 'done' && status !== 'passed';
}

const FINISHED_STATUS_MARKERS = new Set(['done', 'passed', 'Done', 'Passed']);

function isoDateFromUnknown(value: unknown): string | null {
  const match = String(value ?? '').trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

/** First Done / Passed date from `completedOn` or a status audit row. */
export function workItemFinishedOnIso(item: {
  completedOn?: string;
  audit?: Array<{ field?: string; to?: string; at?: string }>;
}): string | null {
  const stamped = isoDateFromUnknown(item.completedOn);
  if (stamped) return stamped;
  const finish = (item.audit ?? []).find(
    (entry) => entry.field === 'status' && FINISHED_STATUS_MARKERS.has(String(entry.to ?? '')),
  );
  return isoDateFromUnknown(finish?.at);
}

export function finishedOnOrBeforeClosedSprint(item: {
  completedOn?: string;
  audit?: Array<{ field?: string; to?: string; at?: string }>;
}): boolean {
  const finishedOn = workItemFinishedOnIso(item);
  return Boolean(finishedOn && finishedOn <= LATEST_CLOSED_SPRINT_END_ISO);
}

export function countRolledOverItems(items: Array<{ rolledOver?: boolean }>): number {
  return items.filter((item) => item.rolledOver).length;
}

export function formatRolledOverCount(count: number): string {
  if (count <= 0) return '';
  return `${count} rolled over`;
}

function hasRolloverStamp(item: {
  rolledOver?: boolean;
  notes?: string;
  desc?: string;
  note?: string;
}): boolean {
  if (item.rolledOver) return true;
  if (hasRolloverNote(item.notes) || hasRolloverNote(item.desc)) return true;
  return noteLooksLikeRollover(String(item.note ?? ''));
}

export function originatedInClosedSprint(item: {
  id?: string;
  sprint?: string;
  rolledOver?: boolean;
  notes?: string;
  desc?: string;
  note?: string;
}): boolean {
  if (isSprintLocked(item.sprint)) return true;
  if (hasRolloverStamp(item)) return true;
  if (item.sprint !== OPEN_ROLLOVER_SPRINT) return false;
  return isClosedSprintCarryoverId(item.id);
}

export function shouldStampRollover(item: {
  id?: string;
  sprint?: string;
  status?: string;
  rolledOver?: boolean;
  notes?: string;
  desc?: string;
  note?: string;
}): boolean {
  return isOutstandingWorkStatus(item.status) && originatedInClosedSprint(item);
}

function notesKeyForItem(item: Record<string, unknown>): 'notes' | 'desc' | 'note' {
  if ('channel' in item || 'sprintId' in item) return 'note';
  if ('desc' in item) return 'desc';
  return 'notes';
}

function finishedHomeSprint(item: {
  id?: string;
  sprint: string;
  dueDate?: string;
  completedOn?: string;
  audit?: Array<{ field?: string; to?: string; at?: string }>;
  rolledOver?: boolean;
  notes?: string;
  desc?: string;
  note?: string;
}): string {
  const finishedOn = workItemFinishedOnIso(item);
  if (finishedOn && finishedOn <= SPRINT_0_END_ISO) return 'Sprint 0';

  const originatedClosed = isSprintLocked(item.sprint) || originatedInClosedSprint(item);
  if (originatedClosed) {
    if (finishedOn && finishedOn <= SPRINT_1_LATE_DONE_ISO) return LATEST_CLOSED_SPRINT;
    const due = isoDateFromUnknown(item.dueDate);
    if (due && due <= SPRINT_0_END_ISO) return 'Sprint 0';
    if (item.sprint === 'Sprint 0') return 'Sprint 0';
    return LATEST_CLOSED_SPRINT;
  }

  if (finishedOn && finishedOn <= SPRINT_1_LATE_DONE_ISO) return LATEST_CLOSED_SPRINT;
  if (finishedOn && finishedOn > SPRINT_1_LATE_DONE_ISO) return OPEN_ROLLOVER_SPRINT;
  // No completion date: Sprint 0 Done stays on Sprint 0. Other finished work is Sprint 1.
  if (item.sprint === 'Sprint 0') return 'Sprint 0';
  return LATEST_CLOSED_SPRINT;
}

function shouldKeepOnClosedSprint(item: {
  id?: string;
  sprint?: string;
  status?: string;
  rolledOver?: boolean;
  notes?: string;
  desc?: string;
  note?: string;
  completedOn?: string;
  audit?: Array<{ field?: string; to?: string; at?: string }>;
}): boolean {
  if (isOutstandingWorkStatus(item.status)) return false;
  if (isSprintLocked(item.sprint) || originatedInClosedSprint(item)) return true;
  const finishedOn = workItemFinishedOnIso(item);
  if (finishedOn && finishedOn > SPRINT_1_LATE_DONE_ISO) return false;
  return finishedOnOrBeforeClosedSprint(item);
}

function clearRolloverMarks<T extends { sprint: string }>(item: T): T {
  const record = item as T & Record<string, unknown>;
  const key = notesKeyForItem(record);
  const home = finishedHomeSprint(item);
  const next: Record<string, unknown> = {
    ...record,
    sprint: home,
    rolledOver: false,
  };
  if (key === 'notes') next.notes = unstampRolloverNote(String(record.notes ?? ''));
  if (key === 'desc') next.desc = unstampRolloverNote(String(record.desc ?? ''));
  if (key === 'note' && noteLooksLikeRollover(String(record.note ?? ''))) next.note = '';
  return next as T;
}

function stampRolloverMarks<T extends { sprint: string }>(item: T): T {
  const nextSprint =
    isSprintLocked(item.sprint) || item.sprint === OPEN_ROLLOVER_SPRINT || !item.sprint
      ? firstOpenRolloverSprint(isSprintLocked(item.sprint) ? item.sprint : LATEST_CLOSED_SPRINT)
      : item.sprint;
  const record = item as T & Record<string, unknown>;
  const key = notesKeyForItem(record);
  const next: Record<string, unknown> = {
    ...record,
    sprint: nextSprint,
    rolledOver: true,
  };

  if (key === 'notes') next.notes = stampRolloverNote(String(record.notes ?? ''));
  if (key === 'desc') {
    const desc = String(record.desc ?? '');
    const hasDescription = String(record.description ?? '').trim().length > 0;
    const descIsNotes = desc.trim().startsWith('[');
    if (!hasDescription && desc && !descIsNotes) {
      next.description = desc;
      next.desc = stampRolloverNote('');
    } else {
      next.desc = stampRolloverNote(descIsNotes || hasDescription ? desc : '');
    }
  }
  if (key === 'note') next.note = ROLLOVER_NOTE_TEXT;
  return next as T;
}

function alreadyRestoredToClosedSprint(item: {
  sprint: string;
  rolledOver?: boolean;
  notes?: string;
  desc?: string;
  note?: string;
  completedOn?: string;
  audit?: Array<{ field?: string; to?: string; at?: string }>;
}): boolean {
  if (item.sprint !== finishedHomeSprint(item)) return false;
  if (!isSprintLocked(item.sprint) && item.sprint !== LATEST_CLOSED_SPRINT) return false;
  return !item.rolledOver && String(item.note ?? '').trim() !== ROLLOVER_NOTE_TEXT;
}

function stripRolloverKeepSprint<T extends { sprint: string }>(item: T): T {
  const record = item as T & Record<string, unknown>;
  const key = notesKeyForItem(record);
  const next: Record<string, unknown> = { ...record, rolledOver: false };
  if (key === 'notes' && hasRolloverNote(String(record.notes ?? ''))) {
    next.notes = unstampLatestRolloverNote(String(record.notes ?? ''));
  }
  if (key === 'desc' && hasRolloverNote(String(record.desc ?? ''))) {
    next.desc = unstampLatestRolloverNote(String(record.desc ?? ''));
  }
  if (key === 'note' && String(record.note ?? '').trim() === ROLLOVER_NOTE_TEXT) next.note = '';
  return next as T;
}

export type RolloverWorkItemOptions = {
  /** Catalog seeds still roll outstanding locked-sprint rows forward. Saved/user boards do not. */
  migrateOutstandingLocked?: boolean;
};

/** Undone closed-sprint work rolls forward. Finished closed-sprint work stays on its locked sprint. */
export function rolloverWorkItemSprint<
  T extends {
    id?: string;
    sprint: string;
    status?: string;
    rolledOver?: boolean;
    dueDate?: string;
    completedOn?: string;
    audit?: Array<{ field?: string; to?: string; at?: string }>;
  },
>(item: T, options: RolloverWorkItemOptions = {}): T & { rolledOver?: boolean } {
  if (shouldKeepOnClosedSprint(item)) {
    return alreadyRestoredToClosedSprint(item) ? item : clearRolloverMarks(item);
  }
  const catalogMigrate = options.migrateOutstandingLocked === true;
  if (catalogMigrate && isOutstandingWorkStatus(item.status) && isSprintLocked(item.sprint)) {
    return stampRolloverMarks(item);
  }
  if (!isSprintLocked(item.sprint) && item.sprint !== OPEN_ROLLOVER_SPRINT && !hasRolloverStamp(item) && !isClosedSprintCarryoverId(item.id)) {
    return item;
  }
  if (!originatedInClosedSprint(item)) {
    return hasRolloverStamp(item) && !isSprintLocked(item.sprint) && item.sprint !== OPEN_ROLLOVER_SPRINT
      ? stripRolloverKeepSprint(item)
      : item;
  }
  if (item.sprint === OPEN_ROLLOVER_SPRINT && item.rolledOver) {
    return item;
  }
  return stampRolloverMarks(item);
}

export function rolloverLockedSprintItems<T extends { sprint: string }>(
  items: T[],
  options: RolloverWorkItemOptions = {},
): T[] {
  return items.map((item) => rolloverWorkItemSprint(item, options));
}

/** Content Factory catalog: outstanding locked-sprint rows move; finished rows stay put. */
export function rolloverOutstandingContentFactoryItems<T extends { sprint: string; status: string }>(
  items: T[],
): T[] {
  return items.map((item) => rolloverWorkItemSprint(item, { migrateOutstandingLocked: true }));
}

export function assignableSprintOptions<T extends string>(options: readonly T[]): T[] {
  return options.filter((sprint) => !isSprintLocked(sprint));
}

/** Assignment dropdowns omit locked sprints unless the row is still on one. */
export function sprintSelectOptions<T extends string>(options: readonly T[], current?: T): T[] {
  const assignable = assignableSprintOptions(options);
  if (current && isSprintLocked(current) && !assignable.includes(current)) {
    return [current, ...assignable];
  }
  return assignable;
}

export function sprintSectionTitle(sprint: string): string {
  return isSprintLocked(sprint) ? `${sprint} · Locked` : sprint;
}

/** Filter bubble label: `Sprint 0 · Locked · Mon, Aug 24 – Sun, Sep 6, 2026`. */
export function sprintChipLabel(sprint: string): string {
  const dates = sprintDatesForLabel(sprint);
  const title = sprintSectionTitle(sprint);
  return dates ? `${title} · ${dates}` : title;
}

export function matchesRolledOverStatusFilter(
  item: { status: string; rolledOver?: boolean },
  filter: Set<string>,
): boolean {
  if (filter.size === 0) return true;
  if (filter.has(item.status)) return true;
  return filter.has(ROLLOVER_STATUS_ID) && Boolean(item.rolledOver);
}
