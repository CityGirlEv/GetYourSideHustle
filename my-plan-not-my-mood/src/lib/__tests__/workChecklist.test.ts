import { describe, expect, it } from 'vitest';
import {
  addChecklistStep,
  applyChecklistStepEdit,
  applyFirstStepPageHref,
  checkAllChecklistSteps,
  checklistAllChecked,
  ensurePageLinkAsStepOne,
  firstStepPointsToPage,
  formatStepPageHref,
  inferHrefFromOpenLabel,
  normalizeWorkChecklist,
  toggleChecklistStep,
  updateChecklistStep,
} from '../workChecklist';
import {
  applyQaInlinePatch,
  applyTaskInlinePatch,
  canCompleteWithChecklist,
  clampStatusToChecklist,
  cycleQaStatus,
  cycleTaskStatus,
  qaWorkflowFieldsForStatus,
  type QaTestItem,
  type TaskItem,
} from '../workBoard';

const baseTask = (): TaskItem => ({
  id: 't-1',
  title: 'Sample task',
  description: '',
  notes: '',
  steps: [],
  sprint: 'Sprint 1',
  category: 'Storefront',
  priority: 'high',
  status: 'not_started',
  assignee: 'angela',
});

const baseTest = (): QaTestItem => ({
  id: 'qa-1',
  title: 'Sample test',
  description: '',
  desc: '',
  steps: [],
  sprint: 'Sprint 1',
  category: 'Storefront QA',
  priority: 'high',
  status: 'untested',
  assignee: 'qa',
});

describe('workChecklist + completion gates', () => {
  it('puts a page URL as step 1', () => {
    let steps = addChecklistStep([], { label: 'Click Buy' });
    steps = ensurePageLinkAsStepOne(steps, '/shop-gear');
    expect(steps[0].href).toBe('/shop-gear');
    expect(steps[0].label).toMatch(/Open the page/i);
    expect(steps).toHaveLength(2);
  });

  it('adds a page href to step 1 without inserting a new row', () => {
    const steps = applyFirstStepPageHref(
      [{ id: 's1', label: 'Review the three-phase payment schedule on the Plan / Budget', checked: true }],
      '/admin/budget',
    );
    expect(steps).toHaveLength(1);
    expect(steps[0].href).toBe('/admin/budget');
    expect(steps[0].checked).toBe(true);
    expect(steps[0].label).toMatch(/Plan \/ Budget/i);
  });

  it('infers a page link from an Open-the-page first step when href is missing', () => {
    const about = applyFirstStepPageHref(
      [{ id: 's1', label: 'Open About', checked: false }],
      undefined,
    );
    expect(about[0]?.href).toBe('/about');
    const home = applyFirstStepPageHref(
      [{ id: 's1', label: 'Open the home page', checked: false }],
      undefined,
    );
    expect(home[0]?.href).toBe('/');
    expect(inferHrefFromOpenLabel('Open Shop Gear')).toBe('/gear');
    expect(inferHrefFromOpenLabel('Open Privacy Policy')).toBe('/privacy');
    expect(inferHrefFromOpenLabel('Go to Beta Testing Guide page')).toBe('/beta-guide');
    expect(firstStepPointsToPage({ label: 'Open FAQ', href: undefined })).toBe(true);
    expect(firstStepPointsToPage({ label: 'Confirm contrast is readable' })).toBe(false);
    expect(formatStepPageHref('/about')).toBe('/about');
    expect(formatStepPageHref('https://nonnegotiation.com/gear')).toBe('https://nonnegotiation.com/gear');
  });

  it('refuses Done or Passed until every checkbox is checked', () => {
    const steps = normalizeWorkChecklist([
      { id: 's1', label: 'Open page', href: '/pay', checked: true },
      { id: 's2', label: 'Confirm Zelle', checked: false },
    ]);
    expect(checklistAllChecked(steps)).toBe(false);
    expect(checkAllChecklistSteps(steps).every((step) => step.checked)).toBe(true);
    expect(canCompleteWithChecklist('task', steps, 'done').ok).toBe(false);
    expect(canCompleteWithChecklist('test', steps, 'passed').ok).toBe(false);
    expect(clampStatusToChecklist('task', 'in_progress', 'done', steps)).toBe('in_progress');
    expect(clampStatusToChecklist('test', 'in_progress', 'passed', steps)).toBe('in_progress');

    const done = applyTaskInlinePatch(baseTask(), { steps, status: 'done' });
    expect(done.status).toBe('not_started');
    expect(checklistAllChecked(done.steps)).toBe(false);

    const passed = applyQaInlinePatch(baseTest(), { steps, status: 'passed' });
    expect(passed.status).toBe('untested');
    expect(checklistAllChecked(passed.steps)).toBe(false);

    const checked = toggleChecklistStep(steps, 's2', true);
    expect(canCompleteWithChecklist('task', checked, 'done').ok).toBe(true);
    expect(canCompleteWithChecklist('test', checked, 'passed').ok).toBe(true);
    expect(applyTaskInlinePatch(baseTask(), { steps: checked, status: 'done' }).status).toBe('done');
    expect(applyQaInlinePatch(baseTest(), { steps: checked, status: 'passed' }).status).toBe('passed');
  });

  it('keeps spaces while a Super Admin is typing a step label', () => {
    const steps = [{ id: 's1', label: 'Open', checked: false }];
    const typed = updateChecklistStep(steps, 's1', { label: 'Open the ' });
    expect(typed[0]?.label).toBe('Open the ');
    const superAdmin = applyChecklistStepEdit(steps, 's1', { label: 'Click Buy now' }, { isSuperAdmin: true });
    expect(superAdmin[0]?.label).toBe('Click Buy now');
    const blocked = applyChecklistStepEdit(steps, 's1', { label: 'Hijack' }, { isSuperAdmin: false });
    expect(blocked[0]?.label).toBe('Open');
  });

  it('tasks never enter the QA retest cycle', () => {
    const task = applyTaskInlinePatch(baseTask(), {
      steps: [{ id: 's1', label: 'Do it', checked: true }],
      status: 'done',
    });
    expect(task.status).toBe('done');
    expect(task.assignee).toBe('angela');
  });
});

describe('QA Fixed/Retest workflow', () => {
  it('Failed assigns to Dev and remembers the tester', () => {
    const fields = qaWorkflowFieldsForStatus(
      { ...baseTest(), assignee: 'angela', assignor: 'unassigned' },
      'failed',
    );
    expect(fields).toEqual({ status: 'failed', assignee: 'dev', assignor: 'angela' });
  });

  it('Fixed/Retest and Failed/Retest return the ticket to the tester', () => {
    const failed = applyQaInlinePatch(
      { ...baseTest(), assignee: 'angela' },
      { status: 'failed' },
    );
    expect(failed.assignee).toBe('dev');
    expect(failed.assignor).toBe('angela');

    const fixed = applyQaInlinePatch(failed, { status: 'fixed_retest' });
    expect(fixed.status).toBe('fixed_retest');
    expect(fixed.assignee).toBe('angela');

    const notABug = applyQaInlinePatch(failed, { status: 'failed_retest' });
    expect(notABug.status).toBe('failed_retest');
    expect(notABug.assignee).toBe('angela');
  });

  it('blocks Done until leftover steps are checked, then skips Done when cycling', () => {
    const started = applyTaskInlinePatch(baseTask(), {
      steps: [{ id: 's1', label: 'Do it', checked: false }],
      status: 'in_progress',
    });
    expect(started.status).toBe('in_progress');
    const blocked = applyTaskInlinePatch(started, { status: 'done' });
    expect(blocked.status).toBe('in_progress');
    expect(blocked.steps?.every((step) => step.checked)).toBe(false);
    expect(cycleTaskStatus('in_progress', started.steps)).toBe('blocked');
    const done = applyTaskInlinePatch(started, {
      steps: checkAllChecklistSteps(started.steps),
      status: 'done',
    });
    expect(done.status).toBe('done');
    expect(done.steps?.every((step) => step.checked)).toBe(true);
    const reopened = applyTaskInlinePatch(done, {
      steps: [{ id: 's1', label: 'Do it', checked: false }],
    });
    expect(reopened.status).toBe('in_progress');
  });

  it('blocks Pass until leftover steps are checked, then skips Pass when cycling', () => {
    const test = applyQaInlinePatch(baseTest(), {
      steps: [{ id: 's1', label: 'Open', checked: false }],
      status: 'passed',
    });
    expect(test.status).toBe('untested');
    expect(test.steps?.every((step) => step.checked)).toBe(false);
    expect(cycleQaStatus('in_progress', test.steps)).toBe('failed');
    const passed = applyQaInlinePatch(test, {
      steps: checkAllChecklistSteps(test.steps),
      status: 'passed',
    });
    expect(passed.status).toBe('passed');
    expect(passed.steps?.every((step) => step.checked)).toBe(true);
  });
});
