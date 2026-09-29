import { describe, expect, it } from 'vitest';
import { INITIAL_QA_TESTS, INITIAL_TASKS, normalizeQaTests, normalizeTasks } from '../workBoard';
import { phase1WebsiteReviewTestIds, PHASE_1_WEBSITE_REVIEW_TASK_ID } from '../phase1WebsiteReview';
import { sprint2WebsiteReviewTestIds, SPRINT_2_WEBSITE_REVIEW_TASK_ID } from '../sprint2WebsiteReview';
import { formWalkthroughTestIds, FORM_WALKTHROUGH_TASK_ID } from '../formWalkthroughTests';
import { moodWorkflowTestIds, MOOD_WORKFLOW_TASK_ID } from '../moodWorkflow';
import {
  TODAYS_NEW_TEST_DUE_END,
  TODAYS_NEW_TEST_DUE_START,
  TODAYS_NEW_TEST_PARENT_DUE,
  TODAYS_NEW_TEST_SPRINT,
  dueDateForTodaysNewTest,
  isTodaysNewTestDueDate,
  todaysNewTestDueDates,
} from '../todaysReviewDueDates';

const TODAYS_TEST_IDS = [
  ...phase1WebsiteReviewTestIds(),
  ...sprint2WebsiteReviewTestIds(),
  ...formWalkthroughTestIds(),
  ...moodWorkflowTestIds(),
];

const TODAYS_PARENT_TASK_IDS = [
  PHASE_1_WEBSITE_REVIEW_TASK_ID,
  SPRINT_2_WEBSITE_REVIEW_TASK_ID,
  FORM_WALKTHROUGH_TASK_ID,
  MOOD_WORKFLOW_TASK_ID,
];

describe('todaysReviewDueDates', () => {
  it('spreads catalog rows across every day of Sprint 3', () => {
    expect(todaysNewTestDueDates()).toEqual([
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
    ]);
    expect(dueDateForTodaysNewTest(0)).toBe(TODAYS_NEW_TEST_DUE_START);
    expect(dueDateForTodaysNewTest(1)).toBe('2026-09-22');
    expect(dueDateForTodaysNewTest(6)).toBe(TODAYS_NEW_TEST_DUE_END);
    expect(dueDateForTodaysNewTest(7)).toBe(TODAYS_NEW_TEST_DUE_START);
    expect(TODAYS_NEW_TEST_DUE_START).toBe('2026-09-21');
    expect(TODAYS_NEW_TEST_DUE_END).toBe('2026-09-27');
    expect(TODAYS_NEW_TEST_PARENT_DUE).toBe('2026-09-27');
    expect(TODAYS_NEW_TEST_SPRINT).toBe('Sprint 3');
    expect(isTodaysNewTestDueDate('2026-09-21')).toBe(true);
    expect(isTodaysNewTestDueDate('2026-09-27')).toBe(true);
    expect(isTodaysNewTestDueDate('2026-09-19')).toBe(false);
  });

  it('puts every test created today on Sprint 3 dates, including earlier website and form tests', () => {
    const board = INITIAL_QA_TESTS.filter((test) => TODAYS_TEST_IDS.includes(test.id));
    expect(board).toHaveLength(TODAYS_TEST_IDS.length);
    expect(board.length).toBeGreaterThan(20);
    for (const test of board) {
      expect(test.sprint, test.id).toBe(TODAYS_NEW_TEST_SPRINT);
      expect(isTodaysNewTestDueDate(test.dueDate), test.id).toBe(true);
    }
    const uniqueDue = new Set(board.map((test) => test.dueDate));
    expect(uniqueDue.size).toBe(todaysNewTestDueDates().length);

    const normalized = normalizeQaTests(board);
    for (const test of normalized) {
      expect(test.sprint, test.id).toBe(TODAYS_NEW_TEST_SPRINT);
      expect(isTodaysNewTestDueDate(test.dueDate), test.id).toBe(true);
    }

    for (const id of TODAYS_PARENT_TASK_IDS) {
      const task = INITIAL_TASKS.find((item) => item.id === id);
      expect(task?.sprint, id).toBe(TODAYS_NEW_TEST_SPRINT);
      expect(task?.dueDate, id).toBe(TODAYS_NEW_TEST_PARENT_DUE);
    }
    const parentNormalized = normalizeTasks(INITIAL_TASKS.filter((item) => TODAYS_PARENT_TASK_IDS.includes(item.id)));
    expect(parentNormalized.every((task) => task.dueDate === TODAYS_NEW_TEST_PARENT_DUE)).toBe(true);
    expect(parentNormalized.every((task) => task.sprint === TODAYS_NEW_TEST_SPRINT)).toBe(true);
  });
});
