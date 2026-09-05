import { describe, expect, it } from 'vitest';
import { linkedTasksForTest, linkedTestsForTask, taskContentSeed } from '../workItemContentSeed';
import { allSeedQaTests, INITIAL_TASKS, normalizeQaTests, normalizeTasks } from '../workBoard';

describe('task ↔ test cross-links and seeded descriptions', () => {
  it('links Gear / Shop / Pay / Logo tasks to their QA tests', () => {
    expect(linkedTestsForTask('t-27')).toEqual(['gear-sel-qa1']);
    expect(linkedTestsForTask('t-43')).toEqual(['pay-qa1']);
    expect(linkedTestsForTask('t-44')).toEqual(['shop-gear-page-qa1', 'shop-gear-page-qa2']);
    expect(linkedTasksForTest('pay-qa1')).toContain('t-43');
    expect(linkedTasksForTest('logo-qa1')).toEqual(expect.arrayContaining(['t-41', 't-42']));
  });

  it('auto-populates description and steps from seeds on normalize', () => {
    const [task] = normalizeTasks([
      {
        id: 't-43',
        title: 'Make Payment — Phase 1 ($4,000) via Zelle or Cash App (preferred)',
        sprint: 'Sprint 0',
        category: 'Infrastructure',
        priority: 'high',
        status: 'not_started',
        assignee: 'angela',
      },
    ]);
    expect(task.description).toMatch(/Phase 1/i);
    expect(task.steps?.length).toBeGreaterThan(0);
    expect(task.steps?.[0]?.href).toBe('/pay');
    expect(task.linkedTestIds).toEqual(['pay-qa1']);
    expect(taskContentSeed('t-43')?.description).toBeTruthy();

    const [test] = normalizeQaTests([
      {
        id: 'pay-qa1',
        title: 'Make Payment page — Zelle, Cash App, Venmo, Stripe',
        desc: 'Angela’s Make Payment task opens /pay.',
        sprint: 'Sprint 0',
        category: 'Storefront QA',
        priority: 'high',
        status: 'untested',
        assignee: 'qa',
      },
    ]);
    expect(test.description).toBeTruthy();
    expect(test.steps?.length).toBeGreaterThan(0);
    expect(test.steps?.[0]?.href).toBe('/pay');
    expect(test.linkedTaskIds).toContain('t-43');
  });

  it('links the Plan / Budget first step and every seeded first step to its page', () => {
    const [budgetTask] = normalizeTasks([
      {
        id: 't-1',
        title: 'Confirm $10,000 budget paid across three phases',
        sprint: 'Sprint 0',
        category: 'Infrastructure',
        priority: 'high',
        status: 'not_started',
        assignee: 'angela',
        steps: [
          {
            id: 's-t-1-1',
            label: 'Review the three-phase payment schedule on the Plan / Budget',
            checked: true,
          },
        ],
      },
    ]);
    expect(budgetTask.steps?.[0]?.label).toMatch(/Plan \/ Budget/i);
    expect(budgetTask.steps?.[0]?.href).toBe('/admin/budget');
    expect(budgetTask.steps?.[0]?.checked).toBe(true);

    const tasks = normalizeTasks(INITIAL_TASKS);
    for (const task of tasks) {
      expect(task.steps?.[0]?.href, `${task.id} first step`).toBeTruthy();
    }

    const tests = normalizeQaTests(allSeedQaTests());
    for (const test of tests) {
      expect(test.steps?.[0]?.href, `${test.id} first step`).toBeTruthy();
    }
  });
});
