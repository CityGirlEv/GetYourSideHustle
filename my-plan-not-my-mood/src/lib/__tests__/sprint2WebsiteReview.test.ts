import { describe, expect, it } from 'vitest';
import { OPEN_ROLLOVER_SPRINT } from '../sprintRollover';
import {
  INITIAL_QA_TESTS,
  INITIAL_TASKS,
  mergeMissingSeedQaTests,
  mergeMissingSeedTasks,
  nextTaskId,
  normalizeQaTests,
  normalizeTasks,
} from '../workBoard';
import { linkedTestsForTask, pageHrefForWorkItem, taskContentSeed } from '../workItemContentSeed';
import { headerPublicLinkDestinations, footerPublicLinkDestinations } from '../siteLinkDestinations';
import {
  SPRINT_2_WEBSITE_REVIEW_PAGES,
  SPRINT_2_WEBSITE_REVIEW_SPRINT,
  SPRINT_2_WEBSITE_REVIEW_TASK_ID,
  buildSprint2WebsiteReviewQaSeeds,
  sprint2WebsiteReviewTaskTitle,
  sprint2WebsiteReviewTestCount,
  sprint2WebsiteReviewTestIds,
} from '../sprint2WebsiteReview';
import { TODAYS_NEW_TEST_PARENT_DUE, isTodaysNewTestDueDate } from '../todaysReviewDueDates';

describe('sprint2WebsiteReview', () => {
  it('covers every public page plus header, footer, and sitemap link tests in Sprint 2', () => {
    const paths = SPRINT_2_WEBSITE_REVIEW_PAGES.map((page) => page.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/gear',
        '/gear/hoodies',
        '/gear/hats',
        '/planners',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms-of-use',
        '/faq',
        '/join',
        '/pay',
        '/sitemap',
        '/beta-rewards',
        '/list',
      ]),
    );
    expect(sprint2WebsiteReviewTestIds()).toEqual(
      expect.arrayContaining(['s2web-header-links', 's2web-footer-links', 's2web-sitemap-links']),
    );
    expect(sprint2WebsiteReviewTestCount()).toBe(SPRINT_2_WEBSITE_REVIEW_PAGES.length + 3);
    expect(headerPublicLinkDestinations().length).toBeGreaterThanOrEqual(8);
    expect(footerPublicLinkDestinations().length).toBeGreaterThanOrEqual(10);
  });

  it('seeds one Angela Sprint 2 task whose title includes the website test count', () => {
    const count = sprint2WebsiteReviewTestCount();
    expect(sprint2WebsiteReviewTaskTitle()).toBe(`Sprint 2 Website Review (${count} tests)`);
    const task = INITIAL_TASKS.find((item) => item.id === SPRINT_2_WEBSITE_REVIEW_TASK_ID);
    expect(task).toMatchObject({
      title: sprint2WebsiteReviewTaskTitle(),
      assignee: 'angela',
      assignor: 'evelyn',
      phase: 'Phase 1',
      category: 'QA & Testing',
      sprint: OPEN_ROLLOVER_SPRINT,
      dueDate: TODAYS_NEW_TEST_PARENT_DUE,
    });
    expect(linkedTestsForTask(SPRINT_2_WEBSITE_REVIEW_TASK_ID)).toEqual(sprint2WebsiteReviewTestIds());
    expect(taskContentSeed(SPRINT_2_WEBSITE_REVIEW_TASK_ID)?.description).toMatch(
      new RegExp(`${count} website tests`),
    );
    expect(taskContentSeed(SPRINT_2_WEBSITE_REVIEW_TASK_ID)?.description).toMatch(/wording, grammar, punctuation/i);
  });

  it('assigns every Sprint 2 website review test to Angela with A-to-Z copy steps', () => {
    const seeds = buildSprint2WebsiteReviewQaSeeds();
    expect(seeds.every((test) => test.assignee === 'angela' && test.sprint === SPRINT_2_WEBSITE_REVIEW_SPRINT)).toBe(true);
    expect(seeds.every((test) => isTodaysNewTestDueDate(test.dueDate))).toBe(true);
    const board = INITIAL_QA_TESTS.filter((test) => test.id.startsWith('s2web-'));
    expect(board).toHaveLength(seeds.length);
    const normalized = normalizeQaTests(board);
    for (const test of normalized) {
      expect(test.steps?.[0]?.href, test.id).toBe(pageHrefForWorkItem(test.id));
      expect(test.steps?.some((step) => /Read every heading and body block A to Z/.test(step.label))).toBe(true);
      expect(test.linkedTaskIds).toContain(SPRINT_2_WEBSITE_REVIEW_TASK_ID);
    }
    const [reviewTask] = normalizeTasks(
      INITIAL_TASKS.filter((item) => item.id === SPRINT_2_WEBSITE_REVIEW_TASK_ID),
    );
    expect(reviewTask.steps?.[0]?.href).toBe('/sitemap');
    expect(reviewTask.linkedTestIds).toHaveLength(sprint2WebsiteReviewTestCount());
  });

  it('merges the Sprint 2 website review task and tests onto an existing board', () => {
    expect(
      mergeMissingSeedTasks(INITIAL_TASKS.filter((item) => item.id !== SPRINT_2_WEBSITE_REVIEW_TASK_ID)).some(
        (item) => item.id === SPRINT_2_WEBSITE_REVIEW_TASK_ID,
      ),
    ).toBe(true);
    expect(
      mergeMissingSeedQaTests(INITIAL_QA_TESTS.filter((test) => !test.id.startsWith('s2web-'))).some(
        (test) => test.id === 's2web-header-links',
      ),
    ).toBe(true);
    expect(nextTaskId(INITIAL_TASKS)).toBe('t-212');
  });
});
