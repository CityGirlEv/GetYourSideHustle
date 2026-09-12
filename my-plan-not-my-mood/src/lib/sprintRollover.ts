/** Closed sprints stay on the board as locked sections. Outstanding work rolls forward. */

import { parseWorkNotes, serializeWorkNotes } from './workNoteEntries';

export const LOCKED_SPRINTS = ['Sprint 0'] as const;

export const SPRINT_ROLLOVER: Record<(typeof LOCKED_SPRINTS)[number], string> = {
  'Sprint 0': 'Sprint 1',
};

export const ROLLOVER_NOTE_TEXT = 'Rolled Over to Sprint 1';
export const ROLLOVER_NOTE_ID = 'n-rollover-sprint-1';
export const ROLLOVER_NOTE_AT = '2026-09-11T00:00:00.000Z';
export const ROLLOVER_STATUS_ID = 'rolled_over';
export const ROLLOVER_STATUS_LABEL = 'Rolled Over';

/** Former Sprint 0 work-board seeds that already sit on Sprint 1 in the catalog. */
export const CLOSED_SPRINT_CARRYOVER_IDS = new Set([
  't-1',
  't-2',
  't-3',
  't-4',
  't-31',
  't-32',
  't-41',
  't-42',
  't-49',
  't-50',
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

/** Move a locked sprint onto its open successor. Other labels stay put. */
export function rolloverSprint<T extends string>(sprint: T): T {
  const next = SPRINT_ROLLOVER[sprint as (typeof LOCKED_SPRINTS)[number]];
  return (next ?? sprint) as T;
}

export function workItemRootId(id: string | null | undefined): string {
  return String(id ?? '').split('::')[0];
}

export function isClosedSprintCarryoverId(id: string | null | undefined): boolean {
  const root = workItemRootId(id);
  return CLOSED_SPRINT_CARRYOVER_IDS.has(root) || root.startsWith('cf-s0-');
}

export function hasRolloverNote(raw: string | null | undefined): boolean {
  return parseWorkNotes(raw).some(
    (entry) => entry.id === ROLLOVER_NOTE_ID || entry.text.trim() === ROLLOVER_NOTE_TEXT,
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
    (entry) => entry.id !== ROLLOVER_NOTE_ID && entry.text.trim() !== ROLLOVER_NOTE_TEXT,
  );
  return serializeWorkNotes(entries);
}

export function isOutstandingWorkStatus(status: string | null | undefined): boolean {
  return status !== 'done' && status !== 'passed';
}

function hasRolloverStamp(item: {
  rolledOver?: boolean;
  notes?: string;
  desc?: string;
  note?: string;
}): boolean {
  if (item.rolledOver) return true;
  if (hasRolloverNote(item.notes) || hasRolloverNote(item.desc)) return true;
  return String(item.note ?? '').trim() === ROLLOVER_NOTE_TEXT;
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
  if (item.sprint !== 'Sprint 1') return false;
  if (hasRolloverStamp(item)) return true;
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

function clearRolloverMarks<T extends { sprint: string }>(item: T): T {
  const record = item as T & Record<string, unknown>;
  const key = notesKeyForItem(record);
  const next: T & { rolledOver?: boolean; sprint: string } = {
    ...item,
    sprint: 'Sprint 0',
    rolledOver: false,
  };
  if (key === 'notes') next.notes = unstampRolloverNote(String(record.notes ?? ''));
  if (key === 'desc') next.desc = unstampRolloverNote(String(record.desc ?? ''));
  if (key === 'note' && String(record.note ?? '').trim() === ROLLOVER_NOTE_TEXT) next.note = '';
  return next;
}

function stampRolloverMarks<T extends { sprint: string }>(item: T): T {
  const nextSprint = rolloverSprint(isSprintLocked(item.sprint) ? item.sprint : 'Sprint 0');
  const record = item as T & Record<string, unknown>;
  const key = notesKeyForItem(record);
  const next: T & { rolledOver: boolean; sprint: string } = {
    ...item,
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
  return next;
}

function alreadyRestoredToClosedSprint(item: { sprint: string; rolledOver?: boolean; notes?: string; desc?: string; note?: string }): boolean {
  return item.sprint === 'Sprint 0' && !hasRolloverStamp(item);
}

function stripRolloverKeepSprint<T extends { sprint: string }>(item: T): T {
  const record = item as T & Record<string, unknown>;
  const key = notesKeyForItem(record);
  const next: T & { rolledOver?: boolean } = { ...item, rolledOver: false };
  if (key === 'notes' && hasRolloverNote(String(record.notes ?? ''))) {
    next.notes = unstampRolloverNote(String(record.notes ?? ''));
  }
  if (key === 'desc' && hasRolloverNote(String(record.desc ?? ''))) {
    next.desc = unstampRolloverNote(String(record.desc ?? ''));
  }
  if (key === 'note' && String(record.note ?? '').trim() === ROLLOVER_NOTE_TEXT) next.note = '';
  return next;
}

/** Undone closed-sprint work rolls forward. Finished closed-sprint work stays on Sprint 0. */
export function rolloverWorkItemSprint<T extends { sprint: string; status?: string; rolledOver?: boolean }>(item: T): T {
  if (!isSprintLocked(item.sprint) && item.sprint !== 'Sprint 1') {
    return hasRolloverStamp(item) ? stripRolloverKeepSprint(item) : item;
  }
  if (!originatedInClosedSprint(item)) return item;
  if (!isOutstandingWorkStatus(item.status)) {
    return alreadyRestoredToClosedSprint(item) ? item : clearRolloverMarks(item);
  }
  return stampRolloverMarks(item);
}

export function rolloverLockedSprintItems<T extends { sprint: string }>(items: T[]): T[] {
  return items.map(rolloverWorkItemSprint);
}

/** Content Factory: outstanding Sprint 0 rows move; finished rows stay on Sprint 0. */
export function rolloverOutstandingContentFactoryItems<T extends { sprint: string; status: string }>(
  items: T[],
): T[] {
  return items.map(rolloverWorkItemSprint);
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

export function matchesRolledOverStatusFilter(
  item: { status: string; rolledOver?: boolean },
  filter: Set<string>,
): boolean {
  if (filter.size === 0) return true;
  if (filter.has(item.status)) return true;
  return filter.has(ROLLOVER_STATUS_ID) && Boolean(item.rolledOver);
}
