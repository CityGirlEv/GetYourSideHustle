import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MOOD_OPTIONS } from '../../data/moods';
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
import { TODAYS_NEW_TEST_PARENT_DUE, dueDateForTodaysNewTest } from '../todaysReviewDueDates';
import { flattenLeaves } from '../siteMap';
import { APP_SITE_TREE } from '../siteMap';
import {
  MOOD_AREA_HREF,
  MOOD_BUBBLES_TEST_ID,
  MOOD_HERO_BUBBLES_HREF,
  MOOD_HOW_IT_WORKS_HREF,
  MOOD_SHAKE_RESULT_ID,
  isMoodShakeMobileViewport,
  scrollMoodShakeResultIntoView,
  MOOD_WORKFLOW_ASSIGNEE,
  MOOD_WORKFLOW_MAP_HREF,
  MOOD_WORKFLOW_MAP_TEST_ID,
  MOOD_WORKFLOW_SPRINT,
  MOOD_WORKFLOW_STEPS,
  MOOD_WORKFLOW_TASK_ID,
  buildMoodWorkflowQaSeeds,
  moodButtonLabels,
  moodWorkflowTaskTitle,
  moodWorkflowTestCount,
  moodWorkflowTestIds,
} from '../moodWorkflow';

describe('moodWorkflow', () => {
  it('catalogs every mood button and a five-step bubble-to-suggestion workflow', () => {
    expect(moodButtonLabels()).toEqual(MOOD_OPTIONS.map((mood) => mood.label));
    expect(moodButtonLabels()).toEqual([
      'TIRED',
      'OVER IT',
      'PROCRASTINATING',
      'ANXIOUS',
      'FIRED UP',
      'MOTIVATE ME!',
    ]);
    expect(MOOD_WORKFLOW_STEPS).toHaveLength(5);
    expect(MOOD_WORKFLOW_STEPS[0]?.href).toBe(MOOD_AREA_HREF);
    expect(MOOD_WORKFLOW_STEPS[1]?.href).toBe(MOOD_HERO_BUBBLES_HREF);
    expect(MOOD_WORKFLOW_STEPS[3]?.href).toBe(MOOD_HOW_IT_WORKS_HREF);
    expect(MOOD_WORKFLOW_STEPS.every((step) => /^Go to /i.test(step.label))).toBe(true);
    const leaves = flattenLeaves(APP_SITE_TREE);
    expect(leaves.find((leaf) => leaf.id === 'mood')?.path).toBe('/#mood-tool');
    expect(leaves.find((leaf) => leaf.id === 'mood-hero-bubbles')?.path).toBe(MOOD_HERO_BUBBLES_HREF);
    expect(leaves.find((leaf) => leaf.id === 'mood-workflow')?.path).toBe(MOOD_WORKFLOW_MAP_HREF);
  });

  it('gives Angela two Sprint 2 tests with Go-to deep links for bubbles and the workflow map', () => {
    expect(moodWorkflowTestIds()).toEqual([MOOD_BUBBLES_TEST_ID, MOOD_WORKFLOW_MAP_TEST_ID]);
    expect(moodWorkflowTestCount()).toBe(2);
    expect(moodWorkflowTaskTitle()).toBe('What’s Your Mood — bubbles, suggestions, and workflow (2 tests)');

    const task = INITIAL_TASKS.find((item) => item.id === MOOD_WORKFLOW_TASK_ID);
    expect(task).toMatchObject({
      title: moodWorkflowTaskTitle(),
      sprint: MOOD_WORKFLOW_SPRINT,
      assignee: MOOD_WORKFLOW_ASSIGNEE,
      assignor: 'evelyn',
      category: 'QA & Testing',
      dueDate: TODAYS_NEW_TEST_PARENT_DUE,
    });
    expect(linkedTestsForTask(MOOD_WORKFLOW_TASK_ID)).toEqual(moodWorkflowTestIds());
    expect(taskContentSeed(MOOD_WORKFLOW_TASK_ID)?.description).toMatch(/2 tests/);
    expect(pageHrefForWorkItem(MOOD_WORKFLOW_TASK_ID)).toBe(MOOD_AREA_HREF);
    expect(pageHrefForWorkItem(MOOD_BUBBLES_TEST_ID)).toBe(MOOD_AREA_HREF);
    expect(pageHrefForWorkItem(MOOD_WORKFLOW_MAP_TEST_ID)).toBe(MOOD_WORKFLOW_MAP_HREF);

    const seeds = buildMoodWorkflowQaSeeds();
    expect(seeds).toHaveLength(2);
    expect(seeds.every((test) => test.assignee === 'angela' && test.sprint === MOOD_WORKFLOW_SPRINT)).toBe(true);
    expect(seeds.map((test) => test.dueDate)).toEqual([dueDateForTodaysNewTest(0), dueDateForTodaysNewTest(1)]);

    const board = INITIAL_QA_TESTS.filter((item) => item.id.startsWith('mood-bubbles') || item.id.startsWith('mood-workflow'));
    expect(board).toHaveLength(seeds.length);
    const normalized = normalizeQaTests(board);
    for (const test of normalized) {
      expect(test.steps?.[0]?.href, test.id).toBe(pageHrefForWorkItem(test.id));
      expect(test.steps?.[0]?.label, test.id).toMatch(/^Go to /);
      expect(test.linkedTaskIds).toContain(MOOD_WORKFLOW_TASK_ID);
    }

    const bubbleTest = normalized.find((test) => test.id === MOOD_BUBBLES_TEST_ID);
    for (const mood of MOOD_OPTIONS) {
      expect(bubbleTest?.steps?.some((step) => step.label.includes(mood.label)), mood.label).toBe(true);
      expect(bubbleTest?.steps?.some((step) => step.label.includes(mood.responseTitle)), mood.id).toBe(true);
    }

    const mapTest = normalized.find((test) => test.id === MOOD_WORKFLOW_MAP_TEST_ID);
    expect(mapTest?.steps?.some((step) => step.href === MOOD_WORKFLOW_MAP_HREF)).toBe(true);
    expect(mapTest?.steps?.some((step) => /workflow map/i.test(step.label))).toBe(true);

    const [reviewTask] = normalizeTasks(
      INITIAL_TASKS.filter((item) => item.id === MOOD_WORKFLOW_TASK_ID),
    );
    expect(reviewTask.linkedTestIds).toHaveLength(moodWorkflowTestCount());
    expect(reviewTask.steps?.[0]?.href).toBe(MOOD_AREA_HREF);
    expect(reviewTask.steps?.[0]?.label).toMatch(/^Go to /);

    expect(
      mergeMissingSeedTasks(INITIAL_TASKS.filter((item) => item.id !== MOOD_WORKFLOW_TASK_ID)).some(
        (item) => item.id === MOOD_WORKFLOW_TASK_ID,
      ),
    ).toBe(true);
    expect(
      mergeMissingSeedQaTests(INITIAL_QA_TESTS.filter((test) => test.id !== MOOD_BUBBLES_TEST_ID)).some(
        (test) => test.id === MOOD_BUBBLES_TEST_ID,
      ),
    ).toBe(true);
    expect(nextTaskId(INITIAL_TASKS)).toBe('t-212');
  });

  it('scrolls the How to shake it panel into view on mobile after a mood is chosen', () => {
    expect(MOOD_HOW_IT_WORKS_HREF).toBe(`/#${MOOD_SHAKE_RESULT_ID}`);
    expect(isMoodShakeMobileViewport(390)).toBe(true);
    expect(isMoodShakeMobileViewport(1024)).toBe(false);

    const el = document.createElement('div');
    el.getBoundingClientRect = () =>
      ({
        top: 800,
        bottom: 1400,
        left: 0,
        right: 320,
        width: 320,
        height: 600,
        x: 0,
        y: 800,
        toJSON() {
          return {};
        },
      }) as DOMRect;
    const header = document.createElement('header');
    header.getBoundingClientRect = () =>
      ({
        top: 0,
        bottom: 112,
        left: 0,
        right: 320,
        width: 320,
        height: 112,
        x: 0,
        y: 0,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    const calls: Array<{ top: number; behavior: ScrollBehavior }> = [];
    const scrollTo = (opts: { top: number; behavior: ScrollBehavior }) => {
      calls.push(opts);
    };

    expect(scrollMoodShakeResultIntoView(() => el, { width: 1024, scrollTo, header })).toBe(false);
    expect(calls).toHaveLength(0);
    expect(scrollMoodShakeResultIntoView(() => null, { width: 390, scrollTo, header })).toBe(false);
    expect(scrollMoodShakeResultIntoView(() => el, { width: 390, scrollTo, header, scrollY: 0 })).toBe(true);
    expect(calls[0]?.behavior).toBe('smooth');
    expect(calls[0]?.top).toBe(800 - 112 - 8);

    const panel = readFileSync(resolve(process.cwd(), 'src/components/MoodShakePanel.tsx'), 'utf8');
    expect(panel).toContain('scrollMoodShakeResultIntoView');
    expect(panel).toContain('MOOD_SHAKE_RESULT_ID');
    expect(panel).toContain('MOOD_SHAKE_SCROLL_MARGIN_CLASS');
    expect(panel).toContain('panelRef.current');
  });
});
