import { describe, expect, it } from 'vitest';
import {
  INITIAL_QA_TESTS,
  INITIAL_TASKS,
  mergeMissingSeedQaTests,
  mergeMissingSeedTasks,
  nextTaskId,
  overlayCatalogQaSchedule,
  overlayCatalogTaskSchedule,
  normalizeQaTests,
  normalizeTasks,
} from '../workBoard';
import { OPEN_ROLLOVER_SPRINT } from '../sprintRollover';
import { linkedTestsForTask, pageHrefForWorkItem, taskContentSeed } from '../workItemContentSeed';
import { sprintWindowByLabel } from '../sprintCalendar';
import {
  JOURNAL_ANGELA_DUE,
  JOURNAL_EVELYN_DUE,
  JOURNAL_MAKE_REVIEW_ITEMS,
  JOURNAL_MAKE_REVIEW_SPRINT,
  JOURNAL_PLANNERS_HREF,
  buildJournalMakeReviewQaSeeds,
  buildJournalMakeReviewTasks,
  journalMakeReviewTaskIds,
  journalMakeReviewTestIds,
} from '../journalMakeReview';

describe('journalMakeReview', () => {
  it('puts Evelyn make tasks on day 2 of the next sprint and Angela reviews two days later', () => {
    const nextSprint = sprintWindowByLabel(JOURNAL_MAKE_REVIEW_SPRINT);
    expect(nextSprint?.startIso).toBe('2026-09-21');
    expect(JOURNAL_MAKE_REVIEW_SPRINT).toBe('Sprint 3');
    expect(JOURNAL_EVELYN_DUE).toBe('2026-09-22');
    expect(JOURNAL_ANGELA_DUE).toBe('2026-09-24');

    expect(JOURNAL_MAKE_REVIEW_ITEMS).toHaveLength(2);
    expect(journalMakeReviewTaskIds()).toEqual(['t-211', 't-208', 't-209', 't-210']);
    expect(journalMakeReviewTestIds()).toEqual(['journal-90day', 'journal-deskpad']);

    const tasks = buildJournalMakeReviewTasks();
    expect(tasks).toHaveLength(4);
    expect(tasks.filter((task) => task.assignee === 'evelyn')).toEqual([
      expect.objectContaining({
        id: 't-211',
        title: 'Make the 90-Day Follow-Through Goal Journal',
        sprint: JOURNAL_MAKE_REVIEW_SPRINT,
        dueDate: JOURNAL_EVELYN_DUE,
      }),
      expect.objectContaining({
        id: 't-209',
        title: 'Make the What’s The Plan Daily Execution Desk Pad',
        sprint: JOURNAL_MAKE_REVIEW_SPRINT,
        dueDate: JOURNAL_EVELYN_DUE,
      }),
    ]);
    expect(tasks.filter((task) => task.assignee === 'angela')).toEqual([
      expect.objectContaining({
        id: 't-208',
        title: 'Review the 90-Day Follow-Through Goal Journal',
        sprint: JOURNAL_MAKE_REVIEW_SPRINT,
        dueDate: JOURNAL_ANGELA_DUE,
      }),
      expect.objectContaining({
        id: 't-210',
        title: 'Review the What’s The Plan Daily Execution Desk Pad',
        sprint: JOURNAL_MAKE_REVIEW_SPRINT,
        dueDate: JOURNAL_ANGELA_DUE,
      }),
    ]);
  });

  it('seeds two Angela proofread tests linked to each journal pair with a Planners page link', () => {
    const seeds = buildJournalMakeReviewQaSeeds();
    expect(seeds).toHaveLength(2);
    expect(seeds.every((test) => test.assignee === 'angela' && test.dueDate === JOURNAL_ANGELA_DUE)).toBe(true);

    for (const item of JOURNAL_MAKE_REVIEW_ITEMS) {
      expect(linkedTestsForTask(item.makeTaskId)).toEqual([item.testId]);
      expect(linkedTestsForTask(item.reviewTaskId)).toEqual([item.testId]);
      expect(pageHrefForWorkItem(item.makeTaskId)).toBe(JOURNAL_PLANNERS_HREF);
      expect(pageHrefForWorkItem(item.reviewTaskId)).toBe(JOURNAL_PLANNERS_HREF);
      expect(pageHrefForWorkItem(item.testId)).toBe(JOURNAL_PLANNERS_HREF);
      expect(taskContentSeed(item.makeTaskId)?.description).toMatch(item.productName);
    }

    const board = INITIAL_QA_TESTS.filter((test) => test.id.startsWith('journal-'));
    expect(board).toHaveLength(seeds.length);
    const normalized = normalizeQaTests(board);
    for (const test of normalized) {
      expect(test.sprint).toBe(OPEN_ROLLOVER_SPRINT);
      expect(test.assignee).toBe('angela');
      expect(test.dueDate).toBe(JOURNAL_ANGELA_DUE);
      expect(test.steps?.[0]?.href).toBe(JOURNAL_PLANNERS_HREF);
      expect(test.steps?.[0]?.label).toMatch(/^Go to Planners page/);
      expect(test.steps?.some((step) => /Read every heading/.test(step.label))).toBe(true);
    }

    const [ninetyDay] = normalizeTasks(INITIAL_TASKS.filter((item) => item.id === 't-211'));
    expect(ninetyDay.assignee).toBe('evelyn');
    expect(ninetyDay.dueDate).toBe(JOURNAL_EVELYN_DUE);
    expect(ninetyDay.steps?.[0]?.href).toBe(JOURNAL_PLANNERS_HREF);
    expect(ninetyDay.linkedTestIds).toEqual(['journal-90day']);

    const [angelaReview] = normalizeTasks(INITIAL_TASKS.filter((item) => item.id === 't-208'));
    expect(angelaReview.assignee).toBe('angela');
    expect(angelaReview.dueDate).toBe(JOURNAL_ANGELA_DUE);
    expect(angelaReview.linkedTestIds).toEqual(['journal-90day']);
  });

  it('merges journal tasks and tests onto an existing board and overlays stale dates', () => {
    expect(
      mergeMissingSeedTasks(INITIAL_TASKS.filter((item) => item.id !== 't-211')).some((item) => item.id === 't-211'),
    ).toBe(true);
    expect(
      mergeMissingSeedQaTests(INITIAL_QA_TESTS.filter((test) => !test.id.startsWith('journal-'))).some(
        (test) => test.id === 'journal-90day',
      ),
    ).toBe(true);

    const staleTasks = overlayCatalogTaskSchedule([
      { ...INITIAL_TASKS.find((task) => task.id === 't-211')!, dueDate: '2026-09-19', sprint: 'Sprint 2' },
      { ...INITIAL_TASKS.find((task) => task.id === 't-208')!, dueDate: '2026-09-19', sprint: 'Sprint 2' },
    ]);
    expect(staleTasks[0]).toMatchObject({ dueDate: JOURNAL_EVELYN_DUE, sprint: OPEN_ROLLOVER_SPRINT });
    expect(staleTasks[1]).toMatchObject({ dueDate: JOURNAL_ANGELA_DUE, sprint: OPEN_ROLLOVER_SPRINT });

    const staleTest = overlayCatalogQaSchedule([
      { ...INITIAL_QA_TESTS.find((test) => test.id === 'journal-90day')!, dueDate: '2026-09-19', sprint: 'Sprint 2' },
    ]);
    expect(staleTest[0]).toMatchObject({ dueDate: JOURNAL_ANGELA_DUE, sprint: OPEN_ROLLOVER_SPRINT });

    expect(nextTaskId(INITIAL_TASKS)).toBe('t-212');
  });
});
