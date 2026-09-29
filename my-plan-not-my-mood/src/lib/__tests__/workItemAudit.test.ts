import { describe, expect, it } from 'vitest';
import {
  MAX_WORK_ITEM_AUDIT,
  WORK_BOARD_AUDIT_EMPTY,
  WORK_BOARD_AUDIT_HEADING,
  WORK_ITEM_AUDIT_EMPTY,
  WORK_ITEM_AUDIT_LABEL,
  attachWorkItemCreatedAudit,
  attachWorkItemFieldAudit,
  collectWorkBoardAudit,
  defaultWorkItemAuditOpen,
  diffWorkItemAudit,
  isWorkItemAuditAction,
  isWorkItemAuditOpen,
  isWorkItemKind,
  mergeWorkItemAudit,
  overlayWorkItemAudit,
  parseWorkItemAudit,
  remapWorkItemAuditItemId,
  toggleWorkItemAuditOpen,
  trimWorkItemAudit,
  workAuditActionLabel,
  workAuditActorFromUser,
  workAuditFieldLabel,
  workBoardAuditSummary,
  workItemAuditFieldMap,
  workItemAuditToggleLabel,
  workItemDeletedEntry,
  type WorkItemAuditEntry,
} from '../workItemAudit';
import { addWorkNote } from '../workNoteEntries';

const now = new Date('2026-09-03T22:00:00.000Z');
const evelyn = { name: 'Evelyn Irving', email: 'evelyn3@cox.net' };

function task(overrides: Record<string, unknown> = {}) {
  return {
    id: 't-1',
    title: 'Approve mockups',
    status: 'not_started',
    assignee: 'angela',
    assignor: 'system',
    sprint: 'Sprint 0',
    phase: 'Phase 1',
    category: 'Apparel',
    priority: 'high',
    dueDate: '2026-09-10',
    notes: '',
    steps: [
      { label: 'Open page', checked: false },
      { label: 'Confirm copy', checked: false },
    ],
    attachments: [],
    onAgenda: false,
    ...overrides,
  };
}

describe('workItemAudit', () => {
  it('labels actions, fields, and collapsible toggle copy', () => {
    expect(isWorkItemAuditAction('created')).toBe(true);
    expect(isWorkItemAuditAction('hack')).toBe(false);
    expect(isWorkItemKind('test')).toBe(true);
    expect(isWorkItemKind('user')).toBe(false);
    expect(workAuditActionLabel('deleted')).toBe('Deleted');
    expect(workAuditActionLabel('mystery')).toBe('mystery');
    expect(workAuditFieldLabel('dueDate')).toBe('Due date');
    expect(workAuditFieldLabel('status')).toBe('Status');
    expect(workItemAuditToggleLabel(3)).toBe('Audit trail (3)');
    expect(WORK_ITEM_AUDIT_LABEL).toBe('Audit trail');
    expect(WORK_BOARD_AUDIT_HEADING).toBe('Audit trail');
    expect(WORK_ITEM_AUDIT_EMPTY).toBe('No changes recorded yet.');
    expect(workBoardAuditSummary(0)).toContain('No changes recorded');
    expect(workBoardAuditSummary(1, 'task')).toBe('1 event on this task board');
    expect(workBoardAuditSummary(2, 'test')).toBe('2 events on this test board');
    expect(WORK_BOARD_AUDIT_EMPTY).toMatch(/Status, assignee/);
  });

  it('toggles one item audit panel without closing the others', () => {
    expect(defaultWorkItemAuditOpen()).toEqual({});
    expect(isWorkItemAuditOpen({}, 't-1')).toBe(false);
    const open = toggleWorkItemAuditOpen({ 't-2': true }, 't-1');
    expect(open['t-1']).toBe(true);
    expect(open['t-2']).toBe(true);
    expect(toggleWorkItemAuditOpen(open, 't-1')['t-1']).toBe(false);
  });

  it('parses, trims, and merges entries without duplicating ids', () => {
    expect(parseWorkItemAudit(null)).toEqual([]);
    expect(parseWorkItemAudit([{ id: 'x' }])).toEqual([]);
    const older: WorkItemAuditEntry = {
      id: 'wa-old',
      at: '2026-09-01T12:00:00.000Z',
      kind: 'task',
      itemId: 't-1',
      itemTitle: 'Approve mockups',
      action: 'updated',
      field: 'status',
      from: 'Not Started',
      to: 'In Progress',
      summary: 'Status: Not Started → In Progress',
      actorName: 'Angela Harris',
    };
    const newer: WorkItemAuditEntry = {
      ...older,
      id: 'wa-new',
      at: '2026-09-03T12:00:00.000Z',
      to: 'Done',
      summary: 'Status: In Progress → Done',
    };
    const parsed = parseWorkItemAudit([newer, { junk: true }, older, { ...older, id: '' }]);
    expect(parsed.map((row) => row.id)).toEqual(['wa-new', 'wa-old']);
    expect(trimWorkItemAudit([older, newer], 1).map((row) => row.id)).toEqual(['wa-new']);
    expect(mergeWorkItemAudit([older], [newer, older]).map((row) => row.id)).toEqual(['wa-new', 'wa-old']);
    expect(MAX_WORK_ITEM_AUDIT).toBe(80);
  });

  it('diffs status, assignee, due date, notes, checklist, and files', () => {
    const notes = addWorkNote('', { name: 'Angela', email: 'angela@example.com' }, 'Need Zelle');
    const after = task({
      status: 'in_progress',
      assignee: 'evelyn',
      dueDate: '2026-09-12',
      notes,
      steps: [
        { label: 'Open page', checked: true },
        { label: 'Confirm copy', checked: false },
      ],
      attachments: [{ id: 'f1' }],
      onAgenda: true,
    });
    const entries = diffWorkItemAudit(task(), after, evelyn, 'task', now);
    const byField = Object.fromEntries(entries.map((row) => [row.field, row]));
    expect(byField.status).toMatchObject({
      action: 'updated',
      from: 'Not Started',
      to: 'In Progress',
      summary: 'Status: Not Started → In Progress',
      actorName: 'Evelyn Irving',
      actorEmail: 'evelyn3@cox.net',
    });
    expect(byField.assignee?.to).toBe('Evelyn');
    expect(byField.dueDate?.to).toBe('2026-09-12');
    expect(byField.notes?.summary).toBe('Notes: 0 notes → 1 note');
    expect(byField.steps?.summary).toBe('Checklist: 0/2 checked → 1/2 checked');
    expect(byField.attachments?.summary).toBe('Files: 0 files → 1 file');
    expect(byField.onAgenda?.to).toBe('On agenda');
    expect(workItemAuditFieldMap(task()).status).toBe('Not Started');
    expect(workAuditActorFromUser(evelyn)).toEqual({
      actorName: 'Evelyn Irving',
      actorEmail: 'evelyn3@cox.net',
    });
  });

  it('records checklist label edits even when the checked count stays the same', () => {
    const after = task({
      steps: [
        { label: 'Open Shop Gear', checked: false },
        { label: 'Confirm copy', checked: false },
      ],
    });
    const entries = diffWorkItemAudit(task(), after, evelyn, 'task', now);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.field).toBe('steps');
    expect(entries[0]?.summary).toBe('Checklist steps edited');
  });

  it('skips a no-op patch and stamps created / deleted events', () => {
    expect(diffWorkItemAudit(task(), task(), evelyn, 'task', now)).toEqual([]);
    const unchanged = attachWorkItemFieldAudit(task(), task(), evelyn, 'task', now);
    expect(unchanged.audit).toBeUndefined();

    const renamed = task({ title: 'Approve final mockups' });
    const withAudit = attachWorkItemFieldAudit(task(), renamed, evelyn, 'task', now);
    expect(withAudit.audit?.[0]?.summary).toBe('Title: Approve mockups → Approve final mockups');

    const created = attachWorkItemCreatedAudit(task(), evelyn, 'task', now);
    expect(created.audit?.[0]).toMatchObject({
      action: 'created',
      summary: 'Task created',
      actorEmail: 'evelyn3@cox.net',
    });

    const deleted = workItemDeletedEntry(task({ title: 'Approve mockups' }), evelyn, 'task', now);
    expect(deleted.action).toBe('deleted');
    expect(deleted.summary).toBe('Deleted task “Approve mockups”');

    const createdTest = attachWorkItemCreatedAudit(
      { id: 'qa1', title: 'Hero' },
      evelyn,
      'test',
      now,
    );
    expect(createdTest.audit?.[0]?.summary).toBe('Test created');
  });

  it('collects a board trail, remaps ids, and overlays peer audit onto the kept row', () => {
    const angelaEdit: WorkItemAuditEntry = {
      id: 'wa-a',
      at: '2026-09-03T12:00:00.000Z',
      kind: 'task',
      itemId: 't-1',
      itemTitle: 'Approve mockups',
      action: 'updated',
      field: 'status',
      summary: 'Status: Not Started → In Progress',
    };
    const evelynNote: WorkItemAuditEntry = {
      id: 'wa-e',
      at: '2026-09-03T13:00:00.000Z',
      kind: 'task',
      itemId: 't-1',
      itemTitle: 'Approve mockups',
      action: 'updated',
      field: 'notes',
      summary: 'Notes: 0 notes → 1 note',
    };
    const deleted: WorkItemAuditEntry = {
      id: 'wa-d',
      at: '2026-09-03T14:00:00.000Z',
      kind: 'task',
      itemId: 't-9',
      itemTitle: 'Old task',
      action: 'deleted',
      summary: 'Deleted task “Old task”',
    };
    const testEntry: WorkItemAuditEntry = {
      id: 'wa-q',
      at: '2026-09-03T15:00:00.000Z',
      kind: 'test',
      itemId: 'qa1',
      itemTitle: 'Hero',
      action: 'updated',
      field: 'status',
      summary: 'Status: Not Started → Passed',
    };

    const overlay = overlayWorkItemAudit(
      [{ id: 't-1', title: 'Approve mockups', audit: [angelaEdit] }],
      [{ id: 't-1', title: 'Approve mockups', audit: [evelynNote] }],
    );
    expect(overlay[0]?.audit?.map((row) => row.id).sort()).toEqual(['wa-a', 'wa-e']);

    const remapped = remapWorkItemAuditItemId([angelaEdit], 't-40');
    expect(remapped?.[0]?.itemId).toBe('t-40');

    const all = collectWorkBoardAudit({
      tasks: overlay,
      tests: [{ id: 'qa1', title: 'Hero', audit: [testEntry] }],
      extra: [deleted],
    });
    expect(all.map((row) => row.id)).toEqual(['wa-q', 'wa-d', 'wa-e', 'wa-a']);
    expect(collectWorkBoardAudit({ tasks: overlay, tests: [{ id: 'qa1', title: 'Hero', audit: [testEntry] }], extra: [deleted], kind: 'task' }).every((row) => row.kind === 'task')).toBe(true);
  });
});
