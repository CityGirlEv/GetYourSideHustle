import { describe, expect, it } from 'vitest';
import { INITIAL_TASKS } from '../workBoard';
import {
  buildWorkBoardStorePayload,
  hydrateWorkBoardFromRemote,
  mergeWorkBoardPayloads,
  parseWorkBoardStorePayload,
  shouldApplyRemoteWorkBoardPull,
  WORKBOARD_API_PATH,
  WORKBOARD_AUTOSAVE_MS,
  WORKBOARD_POLL_MS,
  WORKBOARD_SAVE_HINT,
  workBoardFingerprint,
  workBoardHasUnsavedChanges,
  qaRowFingerprint,
  snapshotRowFingerprints,
  workRowHasUnsavedEdits,
} from '../workBoardStore';

describe('workBoardStore', () => {
  it('parses shared tasks and tests so Angela’s progress is not lost', () => {
    const payload = parseWorkBoardStorePayload({
      tasks: [{ id: 't-900', title: 'Approve mockups', status: 'done', sprint: 'Sprint 1', category: 'Apparel', priority: 'high', assignee: 'angela' }],
      tests: [{ id: 'qa-custom', title: 'Shop Gear on phone', desc: 'Confirm no horizontal scroll', status: 'passed', sprint: 'Sprint 2', category: 'Storefront QA', priority: 'high', assignee: 'angela' }],
      updatedAt: '2026-09-02T20:00:00.000Z',
      updatedBy: 'angela@angelasharris.com',
    });
    expect(payload?.tasks.find((task) => task.id === 't-900')).toMatchObject({
      title: 'Approve mockups',
      status: 'done',
      assignee: 'angela',
    });
    expect(payload?.tests.find((test) => test.id === 'qa-custom')).toMatchObject({
      title: 'Shop Gear on phone',
      status: 'passed',
    });
    expect(payload?.tasks).toHaveLength(1);
    expect(payload?.tests).toHaveLength(1);
    expect(payload?.updatedBy).toBe('angela@angelasharris.com');
    expect(WORKBOARD_API_PATH).toBe('/api/workboard');
  });

  it('accepts qaTests as an alias and rejects junk', () => {
    expect(parseWorkBoardStorePayload(null)).toBeNull();
    expect(parseWorkBoardStorePayload({ updatedBy: 'angela' })).toBeNull();
    const parsed = parseWorkBoardStorePayload({
      qaTests: [{ id: 'qa1', title: 'Hero bubbles', desc: 'Click', status: 'failed' }],
    });
    expect(parsed?.tests.find((test) => test.id === 'qa1')?.status).toBe('failed');
    expect(parsed?.tests.length).toBeGreaterThan(0);
    expect(parsed?.tasks ?? []).toEqual([]);
  });

  it('drops timestamp QA ids so Angela/Evelyn chips are not 3000 fake tests', () => {
    const parsed = parseWorkBoardStorePayload({
      tests: [
        { id: 'qa1', title: 'Hero', status: 'passed', assignee: 'angela' },
        { id: 'qa-1788384351510', title: 'Inflated', status: 'untested', assignee: 'evelyn' },
        { id: 'VT-AUTH-001', title: 'Auth unit tests', status: 'untested' },
      ],
    });
    expect(parsed?.tests.some((test) => test.id === 'qa-1788384351510')).toBe(false);
    expect(parsed?.removedTestIds).toContain('qa-1788384351510');
    expect(parsed?.tests.find((test) => test.id === 'qa1')?.assignee).toBe('angela');
    expect(parsed?.tests.find((test) => test.id === 'VT-AUTH-001')?.suite).toBe('vitest');
    expect(parsed?.tests.find((test) => test.id === 'VT-AUTH-001')?.assignee).toBe('vitest');
  });

  it('remaps QA-owned tests to Unknown and drops cloned task titles', () => {
    const parsed = parseWorkBoardStorePayload({
      tasks: [
        { id: 't-1', title: 'Confirm $10,000 budget paid across three phases', status: 'not_started', sprint: 'Sprint 0', category: 'Infrastructure', priority: 'high', assignee: 'angela' },
        { id: 't-2001', title: 'Confirm $10,000 budget paid across three phases', status: 'done', sprint: 'Sprint 0', category: 'Infrastructure', priority: 'high', assignee: 'angela' },
      ],
      tests: [{ id: 'qa2', title: 'Banner', status: 'untested', assignee: 'qa' }],
    });
    const budget = parsed?.tasks.filter((task) => /Confirm \$10,000 budget/i.test(task.title) && task.assignee === 'angela');
    expect(budget).toHaveLength(1);
    expect(budget?.[0]?.id).toBe('t-1');
    expect(budget?.[0]?.status).toBe('done');
    expect(parsed?.tests.find((test) => test.id === 'qa2')?.assignee).toBe('unassigned');
  });

  it('builds a persistable payload and keeps local data when the database is empty', () => {
    const built = buildWorkBoardStorePayload(
      [{ id: 't-1', title: 'Ship hats', sprint: 'Sprint 2', category: 'Apparel', priority: 'high', status: 'in_progress', assignee: 'angela' }],
      [{ id: 'qa-1', title: 'Hat colors', desc: 'Check whites', sprint: 'Sprint 2', category: 'Storefront QA', priority: 'medium', status: 'untested', assignee: 'qa' }],
      'angela@angelasharris.com',
      new Date('2026-09-02T21:00:00.000Z'),
    );
    expect(built.updatedAt).toBe('2026-09-02T21:00:00.000Z');
    expect(built.updatedBy).toBe('angela@angelasharris.com');
    expect(built.tasks.find((task) => task.id === 't-1')?.status).toBe('in_progress');
    expect(WORKBOARD_SAVE_HINT).toMatch(/shared/i);

    const localTasks = built.tasks;
    const localTests = built.tests;
    expect(hydrateWorkBoardFromRemote({ ...built, empty: true }, localTasks, localTests)).toEqual({
      tasks: localTasks,
      tests: localTests,
    });
    expect(
      hydrateWorkBoardFromRemote(
        {
          tasks: [{ ...localTasks[0]!, status: 'done' }],
          tests: localTests,
          updatedAt: built.updatedAt,
          updatedBy: built.updatedBy,
        },
        localTasks,
        localTests,
      ).tasks[0]?.status,
    ).toBe('done');
  });

  it('keeps Angela’s passed tests when Evelyn’s copy is still untested', () => {
    const angelaTests = [
      { id: 'qa1', title: 'Hero', desc: '', sprint: 'Sprint 1' as const, category: 'Storefront QA' as const, priority: 'high' as const, status: 'passed' as const, assignee: 'angela' as const },
      { id: 'qa-extra', title: 'Phone check', desc: '', sprint: 'Sprint 2' as const, category: 'Storefront QA' as const, priority: 'high' as const, status: 'passed' as const, assignee: 'angela' as const },
    ];
    const evelynTests = [
      { id: 'qa1', title: 'Hero', desc: '', sprint: 'Sprint 1' as const, category: 'Storefront QA' as const, priority: 'high' as const, status: 'untested' as const, assignee: 'qa' as const },
    ];
    const merged = hydrateWorkBoardFromRemote(
      { tasks: [], tests: angelaTests, updatedAt: '2026-09-02T21:00:00.000Z', updatedBy: 'angela@angelasharris.com' },
      [],
      evelynTests,
    );
    expect(merged.tests.find((test) => test.id === 'qa1')?.status).toBe('passed');
    expect(merged.tests.find((test) => test.id === 'qa-extra')?.status).toBe('passed');
  });

  it('keeps both people’s new tasks when the other saves an older copy', () => {
    const evelynBoard = buildWorkBoardStorePayload(
      [{ id: 't-900', title: 'Opulent fonts', sprint: 'Sprint 1', category: 'Launch', priority: 'medium', status: 'not_started', assignee: 'angela' }],
      [],
      'evelyn3@cox.net',
      new Date('2026-09-02T21:00:00.000Z'),
    );
    const angelaBoard = buildWorkBoardStorePayload(
      [{ id: 't-901', title: 'Review mockups', sprint: 'Sprint 1', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'evelyn' }],
      [],
      'angela@angelasharris.com',
      new Date('2026-09-02T21:01:00.000Z'),
    );
    const merged = mergeWorkBoardPayloads(evelynBoard, angelaBoard);
    expect(merged.tasks.find((task) => task.id === 't-900')?.title).toBe('Opulent fonts');
    expect(merged.tasks.find((task) => task.id === 't-901')?.title).toBe('Review mockups');
  });

  it('lets a save downgrade status and update title without losing a peer-only task', () => {
    const existing = buildWorkBoardStorePayload(
      [
        { id: 't-1', title: 'Old title', sprint: 'Sprint 1', category: 'Launch', priority: 'medium', status: 'done', assignee: 'angela' },
        { id: 't-900', title: 'Angela only', sprint: 'Sprint 0', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'evelyn' },
      ],
      [],
      'angela@angelasharris.com',
      new Date('2026-09-02T21:00:00.000Z'),
    );
    const incoming = buildWorkBoardStorePayload(
      [{ id: 't-1', title: 'Renamed', sprint: 'Sprint 1', category: 'Launch', priority: 'medium', status: 'in_progress', assignee: 'angela' }],
      [],
      'evelyn3@cox.net',
      new Date('2026-09-02T21:05:00.000Z'),
    );
    const merged = mergeWorkBoardPayloads(existing, incoming);
    expect(merged.tasks.find((task) => task.id === 't-1')).toMatchObject({
      title: 'Renamed',
      status: 'in_progress',
    });
    expect(merged.tasks.find((task) => task.id === 't-900')?.title).toBe('Angela only');
  });

  it('fingerprints board rows so a live poll can detect Angela’s new task', () => {
    const before = workBoardFingerprint(
      [{ id: 't-1', title: 'Old', sprint: 'Sprint 1', category: 'Launch', priority: 'medium', status: 'not_started', assignee: 'unassigned' }],
      [],
    );
    const after = workBoardFingerprint(
      [{ id: 't-1', title: 'Old', sprint: 'Sprint 1', category: 'Launch', priority: 'medium', status: 'not_started', assignee: 'unassigned' }, { id: 'task-new', title: 'Opulent fonts', sprint: 'Sprint 0', category: 'Launch', priority: 'medium', status: 'not_started', assignee: 'angela' }],
      [],
    );
    expect(before).not.toBe(after);
  });

  it('keeps local title edits when preferLocal is set', () => {
    const remoteTask = {
      id: 't-1',
      title: 'Stale remote title',
      sprint: 'Sprint 1' as const,
      category: 'Launch' as const,
      priority: 'medium' as const,
      status: 'not_started' as const,
      assignee: 'angela' as const,
    };
    const localTask = { ...remoteTask, title: 'Edited in the browser' };
    const withoutPrefer = hydrateWorkBoardFromRemote(
      { tasks: [remoteTask], tests: [], updatedAt: '2026-09-03T01:00:00.000Z', updatedBy: 'evelyn' },
      [localTask],
      [],
    );
    expect(withoutPrefer.tasks.find((task) => task.id === 't-1')?.title).toBe('Stale remote title');

    const withPrefer = hydrateWorkBoardFromRemote(
      { tasks: [remoteTask], tests: [], updatedAt: '2026-09-03T01:00:00.000Z', updatedBy: 'evelyn' },
      [localTask],
      [],
      { preferLocal: true },
    );
    expect(withPrefer.tasks.find((task) => task.id === 't-1')?.title).toBe('Edited in the browser');
  });

  it('keeps a local status downgrade when preferLocal is set, but still adds remote-only rows', () => {
    const remoteTask = {
      id: 't-1',
      title: 'Remote done',
      sprint: 'Sprint 1' as const,
      category: 'Launch' as const,
      priority: 'medium' as const,
      status: 'done' as const,
      assignee: 'angela' as const,
    };
    const localTask = { ...remoteTask, title: 'Local edit', status: 'in_progress' as const };
    const remoteOnly = {
      id: 't-new',
      title: 'Angela added this',
      sprint: 'Sprint 0' as const,
      category: 'Launch' as const,
      priority: 'high' as const,
      status: 'not_started' as const,
      assignee: 'evelyn' as const,
    };
    const merged = hydrateWorkBoardFromRemote(
      { tasks: [remoteTask, remoteOnly], tests: [], updatedAt: '2026-09-03T01:00:00.000Z', updatedBy: 'angela' },
      [localTask],
      [],
      { preferLocal: true },
    );
    expect(merged.tasks.find((task) => task.id === 't-1')).toMatchObject({
      status: 'in_progress',
      title: 'Local edit',
    });
    expect(merged.tasks.find((task) => task.id === 't-new')?.title).toBe('Angela added this');
  });

  it('adds missing Sprint 0 social seed tasks onto an existing saved board', () => {
    const hydrated = hydrateWorkBoardFromRemote(
      {
        tasks: INITIAL_TASKS.filter((task) => !['t-58', 't-59', 't-60', 't-61'].includes(task.id)),
        tests: [],
        updatedAt: '2026-09-03T12:00:00.000Z',
        updatedBy: 'evelyn',
      },
      [],
      [],
    );
    expect(hydrated.tasks.find((task) => task.id === 't-58')?.dueDate).toBe('2026-09-03');
    expect(hydrated.tasks.find((task) => task.id === 't-59')?.assignee).toBe('angela');
    expect(hydrated.tasks.find((task) => task.id === 't-60')?.sprint).toBe('Sprint 2');
    expect(hydrated.tasks.find((task) => task.id === 't-61')?.title).toMatch(/My Plan, Not My Mood/i);
  });

  it('rolls saved Sprint 0 and Sprint 1 tasks and tests onto Sprint 2 without changing assignee', () => {
    const parsed = parseWorkBoardStorePayload({
      tasks: [
        {
          id: 't-49',
          title: 'Set up Resend so tester emails can send',
          sprint: 'Sprint 0',
          category: 'Infrastructure',
          priority: 'high',
          status: 'in_progress',
          assignee: 'evelyn',
          assignor: 'angela',
          dueDate: '2026-09-03',
        },
      ],
      tests: [
        {
          id: 'home-qa1',
          title: 'Home / storefront — brand line and mood entry',
          desc: 'Home loads with brand line and mood tool entry.',
          sprint: 'Sprint 0',
          category: 'Storefront QA',
          priority: 'high',
          status: 'untested',
          assignee: 'unassigned',
        },
      ],
    });
    expect(parsed?.tasks.find((task) => task.id === 't-49')).toMatchObject({
      sprint: 'Sprint 2',
      assignee: 'evelyn',
      assignor: 'angela',
      status: 'in_progress',
      dueDate: '2026-09-03',
    });
    expect(parsed?.tests.find((test) => test.id === 'home-qa1')).toMatchObject({
      sprint: 'Sprint 2',
      assignee: 'unassigned',
      rolledOver: true,
    });
    expect(parsed?.tasks.find((task) => task.id === 't-49')?.rolledOver).toBe(true);
    expect(parsed?.tasks.find((task) => task.id === 't-49')?.notes).toMatch(/Rolled Over to Sprint 2/);
  });

  it('keeps finished closed-sprint work on its locked sprint instead of rolling it forward', () => {
    const parsed = parseWorkBoardStorePayload({
      tasks: [
        {
          id: 't-1',
          title: 'Confirm $10,000 budget paid across three phases',
          sprint: 'Sprint 0',
          category: 'Infrastructure',
          priority: 'high',
          status: 'done',
          assignee: 'angela',
          assignor: 'evelyn',
          completedOn: '2026-09-05',
        },
        {
          id: 't-43',
          title: 'Verify Initial Payment',
          sprint: 'Sprint 0',
          category: 'Infrastructure',
          priority: 'high',
          status: 'done',
          assignee: 'angela',
          assignor: 'evelyn',
        },
        {
          id: 't-27',
          title: 'Create Gear Selections page',
          sprint: 'Sprint 1',
          category: 'Apparel',
          priority: 'high',
          status: 'done',
          assignee: 'evelyn',
          assignor: 'angela',
          rolledOver: true,
          notes: '[{"id":"n-rollover-sprint-2","author":"System","createdAt":"2026-09-14T00:00:00.000Z","updatedAt":"2026-09-14T00:00:00.000Z","text":"Rolled Over to Sprint 2"}]',
        },
      ],
      tests: [
        {
          id: 'home-qa1',
          title: 'Home / storefront — brand line and mood entry',
          sprint: 'Sprint 1',
          category: 'Storefront QA',
          priority: 'high',
          status: 'passed',
          assignee: 'qa',
          rolledOver: true,
        },
      ],
    });
    expect(parsed?.tasks.find((task) => task.id === 't-1')).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'angela',
      assignor: 'evelyn',
      rolledOver: false,
      completedOn: '2026-09-05',
    });
    expect(parsed?.tasks.find((task) => task.id === 't-43')).toMatchObject({
      sprint: 'Sprint 0',
      status: 'done',
      assignee: 'angela',
      rolledOver: false,
    });
    expect(parsed?.tasks.find((task) => task.id === 't-27')).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      assignee: 'evelyn',
      rolledOver: false,
    });
    expect(parsed?.tasks.find((task) => task.id === 't-27')?.notes).not.toMatch(/Rolled Over to Sprint 2/);
    expect(parsed?.tests.find((test) => test.id === 'home-qa1')).toMatchObject({
      sprint: 'Sprint 1',
      status: 'passed',
      rolledOver: false,
    });
  });

  it('keeps a deleted seed task gone across hydrate, parse, and save merge', () => {
    const without = INITIAL_TASKS.filter((task) => task.id !== 't-48');
    const built = buildWorkBoardStorePayload(without, [], 'evelyn3@cox.net', new Date('2026-09-03T08:00:00.000Z'), {
      taskIds: ['t-48'],
    });
    expect(built.tasks.some((task) => task.id === 't-48')).toBe(false);
    expect(built.removedTaskIds).toContain('t-48');

    const parsed = parseWorkBoardStorePayload({
      tasks: without,
      tests: [],
      removedTaskIds: ['t-48'],
      updatedAt: built.updatedAt,
      updatedBy: built.updatedBy,
    });
    expect(parsed?.tasks.some((task) => task.id === 't-48')).toBe(false);
    expect(parsed?.removedTaskIds).toContain('t-48');

    const remoteStillHasIt = {
      tasks: INITIAL_TASKS.filter((task) => task.id === 't-1' || task.id === 't-48'),
      tests: [],
      updatedAt: '2026-09-03T07:00:00.000Z',
      updatedBy: 'angela@angelasharris.com',
    };
    const hydrated = hydrateWorkBoardFromRemote(remoteStillHasIt, without, [], { removedTaskIds: ['t-48'] });
    expect(hydrated.tasks.some((task) => task.id === 't-48')).toBe(false);

    const merged = mergeWorkBoardPayloads(remoteStillHasIt, built);
    expect(merged.tasks.some((task) => task.id === 't-48')).toBe(false);
    expect(merged.removedTaskIds).toContain('t-48');
  });

  it('keeps a deleted seed test gone across hydrate, parse, and save merge', () => {
    const without = [
      { id: 'qa1', title: 'Hero', desc: 'Click', sprint: 'Sprint 2' as const, category: 'Storefront QA' as const, priority: 'high' as const, status: 'untested' as const, assignee: 'angela' as const },
    ];
    const built = buildWorkBoardStorePayload(
      [],
      without,
      'evelyn3@cox.net',
      new Date('2026-09-03T08:00:00.000Z'),
      { testIds: ['home-qa1'] },
    );
    expect(built.tests.some((test) => test.id === 'home-qa1')).toBe(false);
    expect(built.removedTestIds).toContain('home-qa1');

    const parsed = parseWorkBoardStorePayload({
      tasks: [],
      tests: without,
      removedTestIds: ['home-qa1'],
      updatedAt: built.updatedAt,
      updatedBy: built.updatedBy,
    });
    expect(parsed?.tests.some((test) => test.id === 'home-qa1')).toBe(false);
    expect(parsed?.removedTestIds).toContain('home-qa1');
    expect(parsed?.tests).toHaveLength(1);

    const emptySaved = parseWorkBoardStorePayload({
      tasks: [{ id: 't-1', title: 'Keep', sprint: 'Sprint 2', category: 'Launch', priority: 'high', status: 'not_started', assignee: 'angela' }],
      tests: [],
      removedTestIds: ['home-qa1'],
    });
    expect(emptySaved?.tests).toEqual([]);

    const remoteStillHasIt = {
      tasks: [],
      tests: [
        ...without,
        { id: 'home-qa1', title: 'Home / storefront', desc: 'Home loads', sprint: 'Sprint 2' as const, category: 'Storefront QA' as const, priority: 'high' as const, status: 'passed' as const, assignee: 'qa' as const },
      ],
      updatedAt: '2026-09-03T07:00:00.000Z',
      updatedBy: 'angela@angelasharris.com',
    };
    const hydrated = hydrateWorkBoardFromRemote(remoteStillHasIt, [], without, { removedTestIds: ['home-qa1'] });
    expect(hydrated.tests.some((test) => test.id === 'home-qa1')).toBe(false);

    const merged = mergeWorkBoardPayloads(remoteStillHasIt, built);
    expect(merged.tests.some((test) => test.id === 'home-qa1')).toBe(false);
    expect(merged.removedTestIds).toContain('home-qa1');
    expect(merged.tests.find((test) => test.id === 'qa1')?.title).toBe('Hero');
  });

  it('does not apply a live pull while local edits are unsaved or a save is in flight', () => {
    expect(shouldApplyRemoteWorkBoardPull({ dirty: false, saving: false })).toBe(false);
    expect(shouldApplyRemoteWorkBoardPull({ dirty: true, saving: false })).toBe(false);
    expect(shouldApplyRemoteWorkBoardPull({ dirty: false, saving: true })).toBe(false);
    expect(shouldApplyRemoteWorkBoardPull({ dirty: true, saving: true })).toBe(false);
    expect(shouldApplyRemoteWorkBoardPull({ dirty: false, saving: false, hydrated: false })).toBe(true);
    expect(shouldApplyRemoteWorkBoardPull({ dirty: true, saving: true, hydrated: false })).toBe(true);
    expect(WORKBOARD_AUTOSAVE_MS).toBe(0);
    expect(WORKBOARD_POLL_MS).toBe(0);
    expect(WORKBOARD_SAVE_HINT).toMatch(/Save All/i);
  });

  it('turns Save on as soon as the live board differs from the last saved snapshot', () => {
    const saved = workBoardFingerprint(
      [{ id: 't-1', title: 'Old', sprint: 'Sprint 1', category: 'Launch', priority: 'medium', status: 'not_started', assignee: 'unassigned' }],
      [],
    );
    const edited = workBoardFingerprint(
      [{ id: 't-1', title: 'Old', sprint: 'Sprint 1', category: 'Launch', priority: 'medium', status: 'in_progress', assignee: 'unassigned' }],
      [],
    );
    expect(workBoardHasUnsavedChanges(saved, null)).toBe(false);
    expect(workBoardHasUnsavedChanges(saved, saved)).toBe(false);
    expect(workBoardHasUnsavedChanges(edited, saved)).toBe(true);
  });

  it('enables Save only on the test or task row whose status changed', () => {
    const original = {
      id: 'qa1',
      title: 'Hero',
      desc: '',
      sprint: 'Sprint 1' as const,
      category: 'Storefront QA' as const,
      priority: 'high' as const,
      status: 'untested' as const,
      assignee: 'angela' as const,
    };
    const saved = snapshotRowFingerprints([original], qaRowFingerprint);
    const touched = { ...original, status: 'in_progress' as const };
    const untouched = { ...original, id: 'qa2', title: 'Banner' };
    expect(workRowHasUnsavedEdits(original.id, qaRowFingerprint(original), saved)).toBe(false);
    expect(workRowHasUnsavedEdits(touched.id, qaRowFingerprint(touched), saved)).toBe(true);
    expect(workRowHasUnsavedEdits(untouched.id, qaRowFingerprint(untouched), snapshotRowFingerprints([untouched], qaRowFingerprint))).toBe(false);
    expect(workRowHasUnsavedEdits(touched.id, qaRowFingerprint(touched), null)).toBe(false);
  });
});
