/**
 * Change history for Tasks and QA tests.
 * Stored on each row (and as a board-level log for deletes) so it rides with D1.
 * Notes remain a separate stamped thread — this trail records who changed which field.
 */

import { parseWorkNotes } from './workNoteEntries';

export const MAX_WORK_ITEM_AUDIT = 80;
export const MAX_WORK_BOARD_AUDIT = 400;
export const WORK_ITEM_AUDIT_LABEL = 'Audit trail';
export const WORK_BOARD_AUDIT_HEADING = 'Audit trail';
export const WORK_ITEM_AUDIT_EMPTY = 'No changes recorded yet.';
export const WORK_BOARD_AUDIT_EMPTY =
  'No changes recorded yet. Status, assignee, due date, and other edits appear here.';

export type WorkItemKind = 'task' | 'test';
export type WorkItemAuditAction = 'created' | 'updated' | 'deleted';

export const WORK_AUDIT_ACTION_LABELS: Record<WorkItemAuditAction, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
};

export const WORK_AUDIT_FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  status: 'Status',
  assignee: 'Assignee',
  assignor: 'Assignor',
  sprint: 'Sprint',
  phase: 'Phase',
  category: 'Category',
  priority: 'Priority',
  dueDate: 'Due date',
  onAgenda: 'Agenda',
  notes: 'Notes',
  steps: 'Checklist',
  attachments: 'Files',
  description: 'Description',
};

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
  untested: 'Not Started',
  passed: 'Passed',
  failed: 'Failed',
  fixed_retest: 'Fixed / Retest',
  failed_retest: 'Failed / Retest',
};

const ASSIGNEE_LABELS: Record<string, string> = {
  angela: 'Angela',
  evelyn: 'Evelyn',
  dev: 'Dev Team',
  qa: 'Beta Testers',
  unassigned: 'Unknown',
  system: 'System',
  vitest: 'Vitest',
  playwright: 'Playwright',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const ACTIONS = new Set<string>(Object.keys(WORK_AUDIT_ACTION_LABELS));
const KINDS = new Set<string>(['task', 'test']);

export interface WorkItemAuditEntry {
  id: string;
  at: string;
  kind: WorkItemKind;
  itemId: string;
  itemTitle: string;
  action: WorkItemAuditAction;
  field?: string;
  from?: string;
  to?: string;
  summary: string;
  actorName?: string;
  actorEmail?: string;
}

export type WorkAuditActor = {
  name?: string;
  email?: string;
};

export type WorkAuditableItem = {
  id: string;
  title: string;
  status?: string;
  assignee?: string;
  assignor?: string;
  sprint?: string;
  phase?: string;
  category?: string;
  priority?: string;
  dueDate?: string;
  onAgenda?: boolean;
  notes?: string;
  desc?: string;
  description?: string;
  steps?: Array<{ label?: string; checked?: boolean }>;
  attachments?: unknown[];
  audit?: WorkItemAuditEntry[];
};

export function isWorkItemAuditAction(value: unknown): value is WorkItemAuditAction {
  return typeof value === 'string' && ACTIONS.has(value);
}

export function isWorkItemKind(value: unknown): value is WorkItemKind {
  return typeof value === 'string' && KINDS.has(value);
}

export function workAuditActionLabel(action: WorkItemAuditAction | string): string {
  return isWorkItemAuditAction(action) ? WORK_AUDIT_ACTION_LABELS[action] : action;
}

export function workAuditFieldLabel(field: string | undefined): string {
  if (!field) return '';
  return WORK_AUDIT_FIELD_LABELS[field] ?? field;
}

export function workItemAuditToggleLabel(count: number): string {
  return `${WORK_ITEM_AUDIT_LABEL} (${Math.max(0, count)})`;
}

export function workBoardAuditSummary(count: number, kind: WorkItemKind | 'all' = 'all'): string {
  if (count <= 0) return WORK_BOARD_AUDIT_EMPTY;
  const noun = kind === 'task' ? 'this task board' : kind === 'test' ? 'this test board' : 'tasks and tests';
  return `${count} event${count === 1 ? '' : 's'} on ${noun}`;
}

export function workAuditActorFromUser(user?: WorkAuditActor | null): Pick<
  WorkItemAuditEntry,
  'actorName' | 'actorEmail'
> {
  const actorName = String(user?.name ?? '').trim();
  const actorEmail = String(user?.email ?? '').trim();
  return {
    actorName: actorName || undefined,
    actorEmail: actorEmail || undefined,
  };
}

function newAuditId(now = new Date()): string {
  return `wa-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function blankDisplay(value: string | undefined): string {
  const text = String(value ?? '').trim();
  return text || '—';
}

function notesCount(raw: string | undefined): string {
  const count = parseWorkNotes(raw).length;
  if (count === 0) return '0 notes';
  return `${count} note${count === 1 ? '' : 's'}`;
}

function checklistDisplay(steps: WorkAuditableItem['steps']): string {
  const list = Array.isArray(steps) ? steps : [];
  const checked = list.filter((step) => step.checked).length;
  return `${checked}/${list.length} checked`;
}

function checklistKey(steps: WorkAuditableItem['steps']): string {
  const list = Array.isArray(steps) ? steps : [];
  return list.map((step) => `${String(step.label ?? '')}\0${step.checked ? '1' : '0'}`).join('|');
}

function attachmentsDisplay(attachments: unknown[] | undefined): string {
  const count = Array.isArray(attachments) ? attachments.length : 0;
  if (count === 0) return '0 files';
  return `${count} file${count === 1 ? '' : 's'}`;
}

function displayStatus(value: string | undefined): string {
  const raw = String(value ?? '').trim();
  return STATUS_LABELS[raw] ?? blankDisplay(raw);
}

function displayAssignee(value: string | undefined): string {
  const raw = String(value ?? '').trim();
  return ASSIGNEE_LABELS[raw] ?? blankDisplay(raw);
}

function displayPriority(value: string | undefined): string {
  const raw = String(value ?? '').trim();
  return PRIORITY_LABELS[raw] ?? blankDisplay(raw);
}

function displayDue(value: string | undefined): string {
  const raw = String(value ?? '').trim();
  return raw || 'No due date';
}

function displayAgenda(value: boolean | undefined): string {
  return value ? 'On agenda' : 'Off agenda';
}

export function workItemAuditFieldMap(item: WorkAuditableItem): Record<string, string> {
  return {
    title: blankDisplay(item.title),
    status: displayStatus(item.status),
    assignee: displayAssignee(item.assignee),
    assignor: displayAssignee(item.assignor),
    sprint: blankDisplay(item.sprint),
    phase: blankDisplay(item.phase),
    category: blankDisplay(item.category),
    priority: displayPriority(item.priority),
    dueDate: displayDue(item.dueDate),
    onAgenda: displayAgenda(item.onAgenda),
    notes: notesCount(item.notes ?? item.desc),
    steps: checklistDisplay(item.steps),
    attachments: attachmentsDisplay(item.attachments),
  };
}

function workItemAuditCompareKey(item: WorkAuditableItem): Record<string, string> {
  return {
    ...workItemAuditFieldMap(item),
    stepsKey: checklistKey(item.steps),
  };
}

export function parseWorkItemAudit(raw: unknown): WorkItemAuditEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: WorkItemAuditEntry[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const entry = row as Partial<WorkItemAuditEntry>;
    const id = String(entry.id ?? '').trim();
    const at = String(entry.at ?? '').trim();
    const itemId = String(entry.itemId ?? '').trim();
    const summary = String(entry.summary ?? '').trim();
    if (!id || !at || !itemId || !summary) continue;
    const kind = isWorkItemKind(entry.kind) ? entry.kind : 'task';
    const action = isWorkItemAuditAction(entry.action) ? entry.action : 'updated';
    const field = String(entry.field ?? '').trim();
    const from = String(entry.from ?? '').trim();
    const to = String(entry.to ?? '').trim();
    out.push({
      id,
      at,
      kind,
      itemId,
      itemTitle: String(entry.itemTitle ?? '').trim(),
      action,
      field: field || undefined,
      from: from || undefined,
      to: to || undefined,
      summary,
      actorName: String(entry.actorName ?? '').trim() || undefined,
      actorEmail: String(entry.actorEmail ?? '').trim() || undefined,
    });
  }
  return out;
}

export function sortWorkItemAuditNewestFirst(entries: WorkItemAuditEntry[]): WorkItemAuditEntry[] {
  return entries
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const byTime = String(b.row.at).localeCompare(String(a.row.at));
      if (byTime !== 0) return byTime;
      return a.index - b.index;
    })
    .map((item) => item.row);
}

export function trimWorkItemAudit(
  entries: WorkItemAuditEntry[],
  limit = MAX_WORK_ITEM_AUDIT,
): WorkItemAuditEntry[] {
  return sortWorkItemAuditNewestFirst(entries).slice(0, Math.max(0, limit));
}

export function mergeWorkItemAudit(
  ...groups: Array<WorkItemAuditEntry[] | undefined>
): WorkItemAuditEntry[] {
  const seen = new Set<string>();
  const merged: WorkItemAuditEntry[] = [];
  for (const group of groups) {
    for (const entry of parseWorkItemAudit(group ?? [])) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      merged.push(entry);
    }
  }
  return trimWorkItemAudit(merged, MAX_WORK_BOARD_AUDIT);
}

export function remapWorkItemAuditItemId(
  entries: WorkItemAuditEntry[] | undefined,
  nextId: string,
): WorkItemAuditEntry[] | undefined {
  const id = String(nextId ?? '').trim();
  const parsed = parseWorkItemAudit(entries ?? []);
  if (!id || parsed.length === 0) return parsed.length ? parsed : undefined;
  return parsed.map((entry) => ({ ...entry, itemId: id }));
}

function changeSummary(field: string, from: string, to: string): string {
  const label = workAuditFieldLabel(field) || field;
  if (field === 'steps' && from === to) return 'Checklist steps edited';
  return `${label}: ${from} → ${to}`;
}

export function diffWorkItemAudit(
  before: WorkAuditableItem,
  after: WorkAuditableItem,
  actor: WorkAuditActor | null | undefined,
  kind: WorkItemKind,
  now = new Date(),
): WorkItemAuditEntry[] {
  const prev = workItemAuditCompareKey(before);
  const next = workItemAuditCompareKey(after);
  const displayPrev = workItemAuditFieldMap(before);
  const displayNext = workItemAuditFieldMap(after);
  const actorSnap = workAuditActorFromUser(actor);
  const at = now.toISOString();
  const itemId = String(after.id || before.id || '').trim();
  const itemTitle = String(after.title || before.title || '').trim();
  const fields = Object.keys(displayNext);
  const entries: WorkItemAuditEntry[] = [];

  for (const field of fields) {
    const compareFrom = prev[field === 'steps' ? 'stepsKey' : field] ?? '';
    const compareTo = next[field === 'steps' ? 'stepsKey' : field] ?? '';
    if (compareFrom === compareTo) continue;
    const from = displayPrev[field] ?? '—';
    const to = displayNext[field] ?? '—';
    entries.push({
      id: newAuditId(now),
      at,
      kind,
      itemId,
      itemTitle,
      action: 'updated',
      field,
      from,
      to,
      summary: changeSummary(field, from, to),
      ...actorSnap,
    });
  }

  return entries;
}

export function prependWorkItemAudit(
  existing: WorkItemAuditEntry[] | undefined,
  incoming: WorkItemAuditEntry[],
  limit = MAX_WORK_ITEM_AUDIT,
): WorkItemAuditEntry[] {
  return trimWorkItemAudit([...(incoming ?? []), ...(existing ?? [])], limit);
}

export function attachWorkItemFieldAudit<T extends WorkAuditableItem>(
  before: T,
  after: T,
  actor: WorkAuditActor | null | undefined,
  kind: WorkItemKind,
  now = new Date(),
): T & { audit?: WorkItemAuditEntry[] } {
  const entries = diffWorkItemAudit(before, after, actor, kind, now);
  if (entries.length === 0) return after;
  return {
    ...after,
    audit: prependWorkItemAudit(after.audit ?? before.audit, entries),
  };
}

export function attachWorkItemCreatedAudit<T extends WorkAuditableItem>(
  item: T,
  actor: WorkAuditActor | null | undefined,
  kind: WorkItemKind,
  now = new Date(),
): T & { audit: WorkItemAuditEntry[] } {
  const actorSnap = workAuditActorFromUser(actor);
  const entry: WorkItemAuditEntry = {
    id: newAuditId(now),
    at: now.toISOString(),
    kind,
    itemId: item.id,
    itemTitle: item.title,
    action: 'created',
    summary: kind === 'test' ? 'Test created' : 'Task created',
    ...actorSnap,
  };
  return {
    ...item,
    audit: prependWorkItemAudit(item.audit, [entry]),
  };
}

export function workItemDeletedEntry(
  item: WorkAuditableItem,
  actor: WorkAuditActor | null | undefined,
  kind: WorkItemKind,
  now = new Date(),
): WorkItemAuditEntry {
  const actorSnap = workAuditActorFromUser(actor);
  const label = kind === 'test' ? 'test' : 'task';
  const title = String(item.title || '').trim() || item.id;
  return {
    id: newAuditId(now),
    at: now.toISOString(),
    kind,
    itemId: item.id,
    itemTitle: item.title,
    action: 'deleted',
    summary: `Deleted ${label} “${title}”`,
    ...actorSnap,
  };
}

export function overlayWorkItemAudit<T extends { id: string; audit?: WorkItemAuditEntry[] }>(
  chosen: T[],
  ...sources: T[][]
): T[] {
  const byId = new Map<string, WorkItemAuditEntry[]>();
  for (const list of [chosen, ...sources]) {
    for (const item of list) {
      byId.set(item.id, mergeWorkItemAudit(byId.get(item.id), item.audit));
    }
  }
  return chosen.map((item) => {
    const audit = byId.get(item.id) ?? parseWorkItemAudit(item.audit);
    return audit.length > 0 ? { ...item, audit: trimWorkItemAudit(audit, MAX_WORK_ITEM_AUDIT) } : item;
  });
}

export function collectWorkBoardAudit(options: {
  tasks?: Array<{ id: string; title: string; audit?: WorkItemAuditEntry[] }>;
  tests?: Array<{ id: string; title: string; audit?: WorkItemAuditEntry[] }>;
  extra?: WorkItemAuditEntry[];
  kind?: WorkItemKind | 'all';
}): WorkItemAuditEntry[] {
  const kind = options.kind ?? 'all';
  const fromTasks =
    kind === 'test'
      ? []
      : (options.tasks ?? []).flatMap((task) =>
          parseWorkItemAudit(task.audit).map((entry) => ({
            ...entry,
            kind: 'task' as const,
            itemId: entry.itemId || task.id,
            itemTitle: entry.itemTitle || task.title,
          })),
        );
  const fromTests =
    kind === 'task'
      ? []
      : (options.tests ?? []).flatMap((test) =>
          parseWorkItemAudit(test.audit).map((entry) => ({
            ...entry,
            kind: 'test' as const,
            itemId: entry.itemId || test.id,
            itemTitle: entry.itemTitle || test.title,
          })),
        );
  const extra = parseWorkItemAudit(options.extra).filter((entry) => kind === 'all' || entry.kind === kind);
  return mergeWorkItemAudit(fromTasks, fromTests, extra);
}

export function defaultWorkItemAuditOpen(): Record<string, boolean> {
  return {};
}

export function isWorkItemAuditOpen(open: Record<string, boolean>, id: string): boolean {
  return open[id] === true;
}

export function toggleWorkItemAuditOpen(
  open: Record<string, boolean>,
  id: string,
): Record<string, boolean> {
  return { ...open, [id]: !isWorkItemAuditOpen(open, id) };
}
