import { describe, expect, it } from 'vitest';
import {
  INITIAL_QA_TESTS,
  INITIAL_TASKS,
  mergeMissingSeedQaTests,
  mergeMissingSeedTasks,
  nextTaskId,
  normalizeQaTests,
  normalizeTasks,
} from '../workBoard';
import { OPEN_ROLLOVER_SPRINT } from '../sprintRollover';
import { linkedTestsForTask, pageHrefForWorkItem, taskContentSeed } from '../workItemContentSeed';
import { TODAYS_NEW_TEST_PARENT_DUE, dueDateForTodaysNewTest } from '../todaysReviewDueDates';
import {
  FORM_CONTACT_HREF,
  FORM_CONTACT_TEST_ID,
  FORM_DEMO_EMAIL,
  FORM_DEMO_NAME,
  FORM_SIGNUP_HREF,
  FORM_SIGNUP_TEST_ID,
  FORM_WALKTHROUGH_ASSIGNEE,
  FORM_WALKTHROUGH_SPECS,
  FORM_WALKTHROUGH_SPRINT,
  FORM_WALKTHROUGH_TASK_ID,
  buildFormWalkthroughQaSeeds,
  formWalkthroughTaskTitle,
  formWalkthroughTestCount,
  formWalkthroughTestIds,
} from '../formWalkthroughTests';

describe('formWalkthroughTests', () => {
  it('gives Angela two Sprint 2 form tests with DEMO DATA and page links on step 1', () => {
    expect(formWalkthroughTestIds()).toEqual([FORM_CONTACT_TEST_ID, FORM_SIGNUP_TEST_ID]);
    expect(formWalkthroughTestCount()).toBe(2);
    expect(formWalkthroughTaskTitle()).toBe('Contact and Email Sign-Up Forms (2 tests)');
    expect(FORM_WALKTHROUGH_SPECS[0]?.path).toBe(FORM_CONTACT_HREF);
    expect(FORM_WALKTHROUGH_SPECS[1]?.path).toBe(FORM_SIGNUP_HREF);
    expect(FORM_DEMO_NAME).toBe('TEST USER');
    expect(FORM_DEMO_EMAIL).toMatch(/example\.com$/);

    const task = INITIAL_TASKS.find((item) => item.id === FORM_WALKTHROUGH_TASK_ID);
    expect(task).toMatchObject({
      title: formWalkthroughTaskTitle(),
      sprint: OPEN_ROLLOVER_SPRINT,
      assignee: FORM_WALKTHROUGH_ASSIGNEE,
      assignor: 'evelyn',
      category: 'QA & Testing',
      dueDate: TODAYS_NEW_TEST_PARENT_DUE,
    });
    expect(linkedTestsForTask(FORM_WALKTHROUGH_TASK_ID)).toEqual(formWalkthroughTestIds());
    expect(taskContentSeed(FORM_WALKTHROUGH_TASK_ID)?.description).toMatch(/2 tests/);
    expect(pageHrefForWorkItem(FORM_WALKTHROUGH_TASK_ID)).toBe(FORM_CONTACT_HREF);
    expect(pageHrefForWorkItem(FORM_CONTACT_TEST_ID)).toBe(FORM_CONTACT_HREF);
    expect(pageHrefForWorkItem(FORM_SIGNUP_TEST_ID)).toBe(FORM_SIGNUP_HREF);

    const seeds = buildFormWalkthroughQaSeeds();
    expect(seeds).toHaveLength(2);
    expect(seeds.every((test) => test.assignee === 'angela' && test.sprint === FORM_WALKTHROUGH_SPRINT)).toBe(true);
    expect(seeds.map((test) => test.dueDate)).toEqual([dueDateForTodaysNewTest(0), dueDateForTodaysNewTest(1)]);

    const board = INITIAL_QA_TESTS.filter((item) => item.id.startsWith('form-'));
    expect(board).toHaveLength(seeds.length);
    const normalized = normalizeQaTests(board);
    for (const test of normalized) {
      expect(test).toMatchObject({
        sprint: OPEN_ROLLOVER_SPRINT,
        assignee: 'angela',
      });
      expect(test.steps?.[0]?.href, test.id).toBe(pageHrefForWorkItem(test.id));
      expect(test.linkedTaskIds).toContain(FORM_WALKTHROUGH_TASK_ID);
    }

    const [reviewTask] = normalizeTasks(
      INITIAL_TASKS.filter((item) => item.id === FORM_WALKTHROUGH_TASK_ID),
    );
    expect(reviewTask.linkedTestIds).toHaveLength(formWalkthroughTestCount());

    expect(
      mergeMissingSeedTasks(INITIAL_TASKS.filter((item) => item.id !== FORM_WALKTHROUGH_TASK_ID)).some(
        (item) => item.id === FORM_WALKTHROUGH_TASK_ID,
      ),
    ).toBe(true);
    expect(
      mergeMissingSeedQaTests(INITIAL_QA_TESTS.filter((test) => !test.id.startsWith('form-'))).some(
        (test) => test.id === FORM_CONTACT_TEST_ID,
      ),
    ).toBe(true);
    expect(normalizeQaTests([{ id: FORM_SIGNUP_TEST_ID }])[0]?.title).toBe(
      'Email Sign Up form — mailing list',
    );
    expect(nextTaskId(INITIAL_TASKS)).toBe('t-212');
  });
});
