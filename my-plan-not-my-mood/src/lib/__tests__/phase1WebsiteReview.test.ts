import { describe, expect, it } from 'vitest';
import { HEADER_PUBLIC_LINKS, routePath, type StoreRoute } from '../storeRoutes';
import { FOOTER_COMMON_LINK_IDS, launchPageById } from '../launchPages';
import { AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE } from '../membership';
import { INCLUDED_WEBSITE_PAGES } from '../websiteScope';
import {
  INITIAL_QA_TESTS,
  INITIAL_TASKS,
  allSeedQaTests,
  mergeMissingSeedQaTests,
  mergeMissingSeedTasks,
  nextTaskId,
  normalizeQaTests,
  normalizeTasks,
} from '../workBoard';
import { linkedTestsForTask, pageHrefForWorkItem, taskContentSeed } from '../workItemContentSeed';
import {
  PHASE_1_NAV_CLICKS,
  PHASE_1_WEBSITE_REVIEW_PAGES,
  PHASE_1_WEBSITE_REVIEW_TASK_ID,
  buildPhase1WebsiteReviewQaSeeds,
  footerCommonClickPaths,
  headerPublicClickPaths,
  phase1WebsiteReviewTaskTitle,
  phase1WebsiteReviewTestCount,
  phase1WebsiteReviewTestIds,
} from '../phase1WebsiteReview';
import { TODAYS_NEW_TEST_PARENT_DUE, isTodaysNewTestDueDate } from '../todaysReviewDueDates';

describe('phase1WebsiteReview', () => {
  it('covers every included Phase 1 page plus every header and footer click destination', () => {
    const pagePaths = PHASE_1_WEBSITE_REVIEW_PAGES.map((page) => page.path);
    expect(INCLUDED_WEBSITE_PAGES.map((page) => page.id)).toEqual([
      'home',
      'gear',
      'about',
      'contact',
      'privacy',
      'terms',
      'faq',
      'join',
    ]);
    expect(pagePaths).toEqual(
      expect.arrayContaining(['/', '/gear', '/about', '/contact', '/privacy', '/terms', '/faq', '/join']),
    );
    expect(headerPublicClickPaths()).toEqual(
      HEADER_PUBLIC_LINKS.map((link) => routePath(link.route as StoreRoute)),
    );
    expect(footerCommonClickPaths()).toEqual(FOOTER_COMMON_LINK_IDS.map((id) => launchPageById(id).path));
    expect(PHASE_1_NAV_CLICKS.some((click) => click.path === 'https://snatchvault.com/collections/my-plan-hoodie-collection')).toBe(true);
    expect(PHASE_1_NAV_CLICKS.some((click) => click.path === 'https://snatchvault.com/collections/my-plan-sports-hat')).toBe(true);
    expect(PHASE_1_NAV_CLICKS.some((click) => click.path === 'https://snatchvault.com/collections/my-plan-gear')).toBe(true);
    expect(PHASE_1_NAV_CLICKS.some((click) => click.path === 'https://snatchvault.com/collections/non-negotiables-letter-tees')).toBe(true);
    expect(PHASE_1_NAV_CLICKS.filter((click) => click.gatedToJoin).length).toBeGreaterThanOrEqual(2);
  });

  it('seeds one Angela task whose title includes the website test count', () => {
    const count = phase1WebsiteReviewTestCount();
    expect(count).toBe(phase1WebsiteReviewTestIds().length);
    expect(count).toBeGreaterThanOrEqual(INCLUDED_WEBSITE_PAGES.length + 2);
    expect(phase1WebsiteReviewTaskTitle()).toBe(`Phase 1 Website Review (${count} tests)`);

    const task = INITIAL_TASKS.find((item) => item.id === PHASE_1_WEBSITE_REVIEW_TASK_ID);
    expect(task).toMatchObject({
      title: phase1WebsiteReviewTaskTitle(),
      assignee: 'angela',
      assignor: 'evelyn',
      phase: 'Phase 1',
      category: 'QA & Testing',
      sprint: 'Sprint 3',
      dueDate: TODAYS_NEW_TEST_PARENT_DUE,
    });
    expect(linkedTestsForTask(PHASE_1_WEBSITE_REVIEW_TASK_ID)).toEqual(phase1WebsiteReviewTestIds());
    expect(linkedTestsForTask(PHASE_1_WEBSITE_REVIEW_TASK_ID)).toHaveLength(count);
    expect(taskContentSeed(PHASE_1_WEBSITE_REVIEW_TASK_ID)?.description).toMatch(new RegExp(`${count} website tests`));
    expect(taskContentSeed(PHASE_1_WEBSITE_REVIEW_TASK_ID)?.description).toContain(
      AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE,
    );
  });

  it('assigns every Phase 1 website review test to Angela with content-review steps', () => {
    const seeds = buildPhase1WebsiteReviewQaSeeds();
    expect(seeds.every((test) => test.assignee === 'angela')).toBe(true);
    expect(seeds.every((test) => isTodaysNewTestDueDate(test.dueDate))).toBe(true);
    expect(seeds.map((test) => test.id)).toEqual(phase1WebsiteReviewTestIds());
    expect(seeds.some((test) => test.id === 'p1web-clicks')).toBe(true);
    expect(seeds.some((test) => test.id === 'p1web-affirmations-scope')).toBe(true);

    const board = INITIAL_QA_TESTS.filter((test) => test.id.startsWith('p1web-'));
    expect(board).toHaveLength(seeds.length);
    expect(board.every((test) => test.assignee === 'angela')).toBe(true);

    const normalized = normalizeQaTests(allSeedQaTests()).filter((test) => test.id.startsWith('p1web-'));
    expect(normalized).toHaveLength(seeds.length);
    for (const test of normalized) {
      expect(test.steps?.[0]?.href, test.id).toBe(pageHrefForWorkItem(test.id));
      expect(test.steps?.some((step) => /Read every heading and body block/.test(step.label))).toBe(true);
      expect(test.linkedTaskIds).toContain(PHASE_1_WEBSITE_REVIEW_TASK_ID);
    }

    const [reviewTask] = normalizeTasks(
      INITIAL_TASKS.filter((item) => item.id === PHASE_1_WEBSITE_REVIEW_TASK_ID),
    );
    expect(reviewTask.steps?.[0]?.href).toBe('/');
    expect(reviewTask.linkedTestIds).toHaveLength(phase1WebsiteReviewTestCount());
  });

  it('merges the new website review task and tests onto an existing board', () => {
    expect(
      mergeMissingSeedTasks(INITIAL_TASKS.filter((item) => item.id !== PHASE_1_WEBSITE_REVIEW_TASK_ID)).some(
        (item) => item.id === PHASE_1_WEBSITE_REVIEW_TASK_ID,
      ),
    ).toBe(true);
    expect(
      mergeMissingSeedQaTests(INITIAL_QA_TESTS.filter((test) => !test.id.startsWith('p1web-'))).some(
        (test) => test.id === 'p1web-home',
      ),
    ).toBe(true);
    expect(nextTaskId(INITIAL_TASKS)).toBe('t-212');
  });

  it('treats public Affirmations as a membership scope change, not included Phase 1 work', () => {
    const spec = PHASE_1_WEBSITE_REVIEW_PAGES.concat();
    expect(spec.some((page) => page.id === 'p1web-affirmations-scope')).toBe(false);
    const affirm = phase1WebsiteReviewTestIds().includes('p1web-affirmations-scope');
    expect(affirm).toBe(true);
    expect(AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE).toMatch(/scope change/i);
    expect(AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE).toMatch(/Join to Unlock/);
  });
});
