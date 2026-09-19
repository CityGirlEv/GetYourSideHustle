import { describe, expect, it } from 'vitest';
import {
  INITIAL_QA_TESTS,
  INITIAL_TASKS,
  applyBulkQaPatch,
  applyBulkTaskPatch,
  applyQaInlinePatch,
  applyTaskInlinePatch,
  applyTaskInlinePatchToList,
  applyTaskBlockedWithNote,
  applyTasksBlockedWithNote,
  taskNeedsBlockedNote,
  BLOCKED_NOTE_REQUIRED_MESSAGE,
  normalizeAssignor,
  workAssigneeFromActor,
  ASSIGNOR_OPTIONS,
  ASSIGNEE_LABELS,
  normalizeTasks,
  normalizeQaTests,
  currentSprintLabel,
  defaultWorkBoardFilters,
  defaultTaskBoardFilters,
  defaultTestingPortalFilters,
  filterTasks,
  matchesDueDateFilter,
  setSingleFilterValue,
  singleFilterValue,
  sortWorkBoardItems,
  toggleWorkBoardSort,
  workBoardTodayIso,
  DEFAULT_WORK_BOARD_SORT,
  compareWorkBoardBoardOrder,
  workBoardCompletionRank,
  workBoardPriorityRank,
  workBoardStatusRank,
  FILTER_SECTION_TONES,
  SPRINT_SECTION_TONES,
  TASK_STATUS_TONES,
  QA_STATUS_TONES,
  taskStatusRowClass,
  workPriorityTextClass,
  workDueDateTextClass,
  workOverdueTextClass,
  workDueDateControlClass,
  qaStatusRowClass,
  taskStatusLegend,
  qaStatusLegend,
  defaultFilterSectionTab,
  defaultOpenFilterSections,
  defaultMoreFiltersOpen,
  COLLAPSED_FILTER_SECTION_IDS,
  defaultOpenSprintSections,
  FILTER_SECTION_IDS,
  FILTER_SECTION_LABELS,
  isFilterSectionTab,
  selectFilterSection,
  mergeMissingSeedTasks,
  mergeMissingSeedQaTests,
  overlaySupersededSeedTasks,
  overlayCatalogQaSchedule,
  formatTaskCode,
  formatQaCode,
  nextTaskId,
  canonicalizeTaskIds,
  allSeedQaTests,
  pruneDuplicateTasks,
  buildAssigneeChipCounts,
  buildSprintChipCounts,
  TEST_ASSIGNEE_OPTIONS,
  normalizeTestAssignee,
  qaIsDone,
  taskIsDone,
  sprintTextClass,
  toggleFilterSection,
  filterSectionSummary,
  resetQaTestsToNotStarted,
  resetTasksToNotStarted,
  setManySelected,
  shouldResetWorkBoardStatuses,
  sprintSectionStats,
  countRolledOverItems,
  formatRolledOverCount,
  toggleSelectedId,
  allIdsSelected,
  applyFilterChipClick,
  isFilterShowingAll,
  selectAllFilterValues,
  toggleSprintSection,
  SPRINT_OPTIONS,
  type TaskStatus,
  markWorkItemDirty,
  workItemIsDirty,
  anyWorkItemsDirty,
  workBoardSaveButtonTone,
  workBoardPersistIsDisabled,
  SAVE_ALL_LABEL,
  type SprintCategory,
} from '../workBoard';
import { phase1WebsiteReviewTestCount } from '../phase1WebsiteReview';
import { sprint2WebsiteReviewTestCount } from '../sprint2WebsiteReview';
import { formWalkthroughTestCount } from '../formWalkthroughTests';
import { moodWorkflowTestCount } from '../moodWorkflow';
import { journalMakeReviewTestIds } from '../journalMakeReview';

describe('workBoard seed merge', () => {
  it('seeds every task and existing QA test as not started', () => {
    expect(INITIAL_TASKS.every((task) => task.status === 'not_started')).toBe(true);
    expect(INITIAL_QA_TESTS.every((test) => test.status === 'untested')).toBe(true);
    expect(resetTasksToNotStarted([{ ...INITIAL_TASKS[0], status: 'done' }])[0]?.status).toBe('not_started');
    expect(resetQaTestsToNotStarted([{ ...INITIAL_QA_TESTS[0], status: 'passed' }])[0]?.status).toBe('untested');
    expect(shouldResetWorkBoardStatuses(0)).toBe(true);
    expect(shouldResetWorkBoardStatuses(1)).toBe(false);
  });

  it('seeds Developing Shirts and launch-page tasks from the kickoff', () => {
    expect(INITIAL_TASKS.some((t) => /Developing Shirts/i.test(t.title))).toBe(true);
    expect(INITIAL_TASKS.some((t) => t.title === 'About page')).toBe(true);
    expect(INITIAL_TASKS.some((t) => t.title === 'Contact page')).toBe(true);
    expect(INITIAL_TASKS.some((t) => /Privacy Policy/i.test(t.title))).toBe(true);
    expect(INITIAL_TASKS.some((t) => /Orders on SnatchVault/i.test(t.title))).toBe(true);
    expect(INITIAL_TASKS.some((t) => /Coming Soon on Memberships/i.test(t.title))).toBe(true);
    expect(INITIAL_TASKS.find((t) => t.id === 't-24')?.title).toMatch(/organic sprint ROI/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-30')?.assignee).toBe('evelyn');
  });

  it('seeds the Gear Selections page as Evelyn’s Sprint 1 task', () => {
    const createPage = INITIAL_TASKS.find((t) => t.id === 't-27');
    expect(createPage?.title).toMatch(/Gear Selections/i);
    expect(createPage?.assignee).toBe('evelyn');
    expect(createPage?.sprint).toBe('Sprint 2');
    expect(createPage?.category).toBe('Apparel');
    expect(INITIAL_QA_TESTS.some((t) => t.id === 'gear-sel-qa1')).toBe(true);
    expect(INITIAL_QA_TESTS.some((t) => t.id === 'sprint-roi-qa1')).toBe(true);
    expect(INITIAL_TASKS.find((t) => t.id === 't-31')?.assignee).toBe('angela');
    expect(INITIAL_TASKS.find((t) => t.id === 't-32')?.assignee).toBe('evelyn');
    expect(INITIAL_TASKS.find((t) => t.id === 't-41')?.title).toMatch(/logo concepts/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-41')?.assignee).toBe('evelyn');
    expect(INITIAL_TASKS.find((t) => t.id === 't-42')?.assignee).toBe('angela');
    expect(INITIAL_QA_TESTS.some((t) => t.id === 'cf-qa1')).toBe(true);
    expect(INITIAL_QA_TESTS.some((t) => t.id === 'logo-qa1')).toBe(true);
    expect(INITIAL_TASKS.find((t) => t.id === 't-44')?.title).toMatch(/Shop Gear page/);
    expect(INITIAL_TASKS.find((t) => t.id === 't-44')?.assignee).toBe('evelyn');
    expect(INITIAL_TASKS.find((t) => t.id === 't-45')?.title).toMatch(/Shopify/);
    expect(INITIAL_TASKS.find((t) => t.id === 't-45')?.assignee).toBe('evelyn');
    expect(INITIAL_TASKS.find((t) => t.id === 't-46')?.assignee).toBe('evelyn');
    expect(INITIAL_TASKS.find((t) => t.id === 't-47')?.assignee).toBe('angela');
    expect(INITIAL_TASKS.find((t) => t.id === 't-46')?.title).toBe('Test the Shop Gear page');
    expect(INITIAL_TASKS.find((t) => t.id === 't-47')?.title).toBe('Test the Shop Gear page');
    expect(INITIAL_TASKS.find((t) => t.id === 't-48')?.assignee).toBe('angela');
    expect(INITIAL_TASKS.find((t) => t.id === 't-48')?.title).toMatch(/blank brand/);
    expect(INITIAL_QA_TESTS.find((t) => t.id === 'shop-gear-page-qa1')?.assignee).toBe('evelyn');
    expect(INITIAL_QA_TESTS.find((t) => t.id === 'shop-gear-page-qa2')?.assignee).toBe('angela');
    expect(INITIAL_TASKS.find((t) => t.id === 't-203')?.assignee).toBe('angela');
    expect(INITIAL_TASKS.find((t) => t.id === 't-203')?.title).toMatch(/Phase 1 Website Review \(\d+ tests\)/);
    expect(INITIAL_TASKS.find((t) => t.id === 't-204')?.assignee).toBe('angela');
    expect(INITIAL_TASKS.find((t) => t.id === 't-204')?.title).toMatch(/Sprint 2 Website Review \(\d+ tests\)/);
    expect(INITIAL_TASKS.find((t) => t.id === 't-204')?.sprint).toBe('Sprint 3');
    expect(INITIAL_QA_TESTS.filter((t) => t.id.startsWith('p1web-')).every((t) => t.assignee === 'angela')).toBe(true);
    expect(INITIAL_QA_TESTS.filter((t) => t.id.startsWith('s2web-')).every((t) => t.assignee === 'angela' && t.sprint === 'Sprint 3')).toBe(true);
    expect(INITIAL_QA_TESTS.some((t) => t.id === 'gear-brand-qa1')).toBe(true);
    const merged = mergeMissingSeedQaTests(INITIAL_QA_TESTS.filter((t) => t.id !== 'gear-sel-qa1' && t.id !== 'sprint-roi-qa1' && t.id !== 'logo-qa1' && t.id !== 'pay-qa1' && t.id !== 'shop-gear-page-qa1' && t.id !== 'gear-brand-qa1'));
    expect(merged.some((t) => t.id === 'gear-sel-qa1')).toBe(true);
    expect(merged.some((t) => t.id === 'sprint-roi-qa1')).toBe(true);
    expect(merged.some((t) => t.id === 'logo-qa1')).toBe(true);
    expect(merged.some((t) => t.id === 'pay-qa1')).toBe(true);
    expect(mergeMissingSeedTasks(INITIAL_TASKS.filter((t) => t.id !== 't-48')).some((t) => t.id === 't-48')).toBe(true);
  });

  it('seeds Angela’s Make Payment task for Phase 1', () => {
    const pay = INITIAL_TASKS.find((t) => t.id === 't-43');
    expect(pay?.title).toMatch(/Make Payment/i);
    expect(pay?.assignee).toBe('angela');
    expect(pay?.sprint).toBe('Sprint 2');
    expect(pay?.priority).toBe('high');
    const payQa = INITIAL_QA_TESTS.find((t) => t.id === 'pay-qa1');
    expect(payQa?.description ?? payQa?.desc).toMatch(/Zelle/);
    expect(mergeMissingSeedTasks(INITIAL_TASKS.filter((t) => t.id !== 't-43')).some((t) => t.id === 't-43')).toBe(true);
  });

  it('seeds Evelyn’s Sprint 0 Resend setup task', () => {
    const resend = INITIAL_TASKS.find((t) => t.id === 't-49');
    expect(resend?.title).toMatch(/Resend/i);
    expect(resend?.assignee).toBe('evelyn');
    expect(resend?.sprint).toBe('Sprint 2');
    expect(resend?.priority).toBe('high');
    expect(mergeMissingSeedTasks(INITIAL_TASKS.filter((t) => t.id !== 't-49')).some((t) => t.id === 't-49')).toBe(true);
  });

  it('seeds Angela’s Sprint 0 TikTok, YouTube, and Instagram page tasks', () => {
    const tiktok = INITIAL_TASKS.find((t) => t.id === 't-55');
    const youtube = INITIAL_TASKS.find((t) => t.id === 't-56');
    const instagram = INITIAL_TASKS.find((t) => t.id === 't-57');
    expect(tiktok).toMatchObject({
      title: 'Create or re-purpose the NonNegotiation TikTok page',
      sprint: 'Sprint 2',
      assignee: 'angela',
      category: 'Content',
      status: 'not_started',
    });
    expect(youtube).toMatchObject({
      title: 'Create or re-purpose the NonNegotiation YouTube channel',
      sprint: 'Sprint 2',
      assignee: 'angela',
    });
    expect(instagram).toMatchObject({
      title: 'Create or re-purpose the NonNegotiation Instagram page',
      sprint: 'Sprint 2',
      assignee: 'angela',
    });
    const without = INITIAL_TASKS.filter((t) => t.id !== 't-55' && t.id !== 't-56' && t.id !== 't-57');
    const merged = mergeMissingSeedTasks(without);
    expect(merged.some((t) => t.id === 't-55')).toBe(true);
    expect(merged.some((t) => t.id === 't-56')).toBe(true);
    expect(merged.some((t) => t.id === 't-57')).toBe(true);
  });

  it('seeds Angela’s Sprint 0 access and brand-page decision tasks due today', () => {
    const tiktokAccess = INITIAL_TASKS.find((t) => t.id === 't-58');
    const youtubeAccess = INITIAL_TASKS.find((t) => t.id === 't-59');
    const instagramAccess = INITIAL_TASKS.find((t) => t.id === 't-60');
    const brandDecision = INITIAL_TASKS.find((t) => t.id === 't-61');
    expect(tiktokAccess).toMatchObject({
      title: 'Add Evelyn as an authorized user on the NonNegotiation TikTok page',
      sprint: 'Sprint 2',
      assignee: 'angela',
      dueDate: '2026-09-03',
    });
    expect(youtubeAccess).toMatchObject({
      title: 'Add Evelyn as an authorized user on the NonNegotiation YouTube channel',
      sprint: 'Sprint 2',
      assignee: 'angela',
      dueDate: '2026-09-03',
    });
    expect(instagramAccess).toMatchObject({
      title: 'Add Evelyn as an authorized user on the NonNegotiation Instagram page',
      sprint: 'Sprint 2',
      assignee: 'angela',
      dueDate: '2026-09-03',
    });
    expect(brandDecision).toMatchObject({
      title: 'Keep NonNegotiation as the house — introduce MY PLAN, NOT MY MOOD as a brand under it',
      sprint: 'Sprint 2',
      assignee: 'angela',
      dueDate: '2026-09-03',
    });
    const without = INITIAL_TASKS.filter((t) => !['t-58', 't-59', 't-60', 't-61'].includes(t.id));
    const merged = mergeMissingSeedTasks(without);
    expect(merged.some((t) => t.id === 't-58')).toBe(true);
    expect(merged.some((t) => t.id === 't-61')).toBe(true);
  });

  it('seeds Sprint 0 sales tasks for live, NonNegotiation, and personal pages', () => {
    const ids = ['t-62', 't-63', 't-64', 't-65', 't-66', 't-67', 't-68', 't-69', 't-70', 't-71', 't-72', 't-73', 't-74'];
    for (const id of ids) {
      expect(INITIAL_TASKS.find((t) => t.id === id), id).toBeTruthy();
    }
    expect(INITIAL_TASKS.find((t) => t.id === 't-62')?.title).toMatch(/sample tees/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-64')?.title).toMatch(/live wearing the tee/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-65')?.title).toMatch(/NonNegotiation Facebook/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-66')?.title).toMatch(/Angela personal/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-67')?.title).toMatch(/Evelyn personal/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-68')?.title).toMatch(/talk track/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-71')?.title).toMatch(/brand under NonNegotiation/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-71')?.assignee).toBe('evelyn');
    expect(INITIAL_TASKS.find((t) => t.id === 't-72')?.title).toMatch(/sends people to from live/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-72')?.assignee).toBe('angela');
    expect(INITIAL_TASKS.find((t) => t.id === 't-50')?.title).toMatch(/sell now/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-51')?.title).toMatch(/on-body live/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-52')?.title).toMatch(/keep selling tees/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-73')?.title).toMatch(/scorecard/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-73')?.dueDate).toBe('2026-09-06');
    expect(INITIAL_TASKS.find((t) => t.id === 't-74')?.title).toMatch(/house/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-74')?.dueDate).toBe('2026-09-04');
    const videoIds = ['t-75', 't-76', 't-77', 't-78', 't-79'] as const;
    const videoTitles = ['Sprint 0', 'Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'] as const;
    const videoSprints = ['Sprint 2', 'Sprint 2', 'Sprint 2', 'Sprint 3', 'Sprint 4'] as const;
    videoIds.forEach((id, index) => {
      expect(INITIAL_TASKS.find((t) => t.id === id)).toMatchObject({
        title: `Create 3 T-shirt sales videos for ${videoTitles[index]}`,
        sprint: videoSprints[index],
        assignee: 'angela',
        category: 'Content',
      });
    });
    const analytics = INITIAL_TASKS.filter((task) => String(task.groupId ?? '').startsWith('analytics-'));
    expect(analytics).toHaveLength(120);
    expect(analytics.every((task) => task.sprint !== 'Sprint 0' && task.sprint !== 'Sprint 1')).toBe(true);
    expect(INITIAL_TASKS.every((task) => task.sprint !== 'Sprint 0' && task.sprint !== 'Sprint 1')).toBe(true);
    expect(INITIAL_QA_TESTS.every((test) => test.sprint !== 'Sprint 0' && test.sprint !== 'Sprint 1')).toBe(true);
    expect(allSeedQaTests().every((test) => test.sprint !== 'Sprint 0' && test.sprint !== 'Sprint 1')).toBe(true);
    expect(INITIAL_TASKS.find((task) => task.id === 't-49')).toMatchObject({
      rolledOver: true,
      assignee: 'evelyn',
    });
    expect(INITIAL_TASKS.find((task) => task.id === 't-49')?.notes).toMatch(/Rolled Over to Sprint 2/);
    expect(INITIAL_QA_TESTS.find((test) => test.id === 'home-qa1')?.rolledOver).toBe(true);
    expect(INITIAL_QA_TESTS.find((test) => test.id === 'home-qa1')?.desc).toMatch(/Rolled Over to Sprint 2/);
    expect(analytics.filter((task) => task.assignee === 'angela')).toHaveLength(60);
    expect(analytics.filter((task) => task.assignee === 'evelyn')).toHaveLength(60);
    expect(INITIAL_TASKS.find((t) => t.id === 't-83')?.title).toMatch(/Gather Facebook analytics/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-84')?.title).toMatch(/Review Facebook analytics/i);
    expect(INITIAL_TASKS.find((t) => t.id === 't-83')?.groupId).toBe('analytics-2026-09-07-facebook');
    expect(INITIAL_TASKS.find((t) => t.id === 't-83')?.dueDate).toBe('2026-09-18');
    expect(INITIAL_TASKS.find((t) => t.id === 't-84')?.dueDate).toBe('2026-09-19');
    expect(analytics.filter((task) => task.assignee === 'angela').every((task) => (task.dueDate ?? '') >= '2026-09-18')).toBe(true);
    expect(analytics.filter((task) => task.assignee === 'evelyn').every((task) => (task.dueDate ?? '') >= '2026-09-19')).toBe(true);
    expect(mergeMissingSeedTasks(INITIAL_TASKS.filter((t) => t.id !== 't-83')).some((t) => t.id === 't-83')).toBe(true);
    expect(mergeMissingSeedTasks(INITIAL_TASKS.filter((t) => !videoIds.includes(t.id as (typeof videoIds)[number]))).some((t) => t.id === 't-75')).toBe(
      true,
    );
    const without = INITIAL_TASKS.filter((t) => !ids.includes(t.id));
    const merged = mergeMissingSeedTasks(without);
    expect(merged.some((t) => t.id === 't-68')).toBe(true);
    expect(merged.some((t) => t.id === 't-70')).toBe(true);
    expect(merged.some((t) => t.id === 't-71')).toBe(true);
    expect(merged.some((t) => t.id === 't-72')).toBe(true);
  });

  it('includes the Angela Gmail invite task in the seed list', () => {
    const invite = INITIAL_TASKS.find((t) => t.id === 't-20');
    expect(invite?.title).toBe('Send Gmail account invite to Angela');
    expect(invite?.assignee).toBe('evelyn');
    expect(invite?.status).toBe('not_started');
  });

  it('includes separate Beta Tester reward tasks for Angela and Evelyn', () => {
    const angela = INITIAL_TASKS.find((t) => t.id === 't-21');
    const evelyn = INITIAL_TASKS.find((t) => t.id === 't-22');
    expect(angela?.assignee).toBe('angela');
    expect(evelyn?.assignee).toBe('evelyn');
    expect(angela?.title).toMatch(/Beta Tester rewards/i);
    expect(evelyn?.title).toMatch(/Beta Tester rewards/i);
    expect(angela?.id).not.toBe(evelyn?.id);
    expect(angela?.status).toBe('not_started');
    expect(evelyn?.status).toBe('not_started');
  });

  it('adds missing seed tasks without dropping saved progress', () => {
    const saved = INITIAL_TASKS.filter((t) => t.id !== 't-20').map((t) =>
      t.id === 't-13' ? { ...t, status: 'in_progress' as const } : t,
    );
    const merged = mergeMissingSeedTasks(saved);
    expect(merged.find((t) => t.id === 't-13')?.status).toBe('in_progress');
    expect(merged.some((t) => t.id === 't-20')).toBe(true);
  });

  it('does not resurrect a seed task that was deleted', () => {
    const without = INITIAL_TASKS.filter((t) => t.id !== 't-48');
    expect(mergeMissingSeedTasks(without, INITIAL_TASKS, ['t-48']).some((t) => t.id === 't-48')).toBe(false);
    expect(mergeMissingSeedTasks(without).some((t) => t.id === 't-48')).toBe(true);
  });

  it('does not resurrect a seed test that was deleted, and empty saved lists stay empty', () => {
    const without = INITIAL_QA_TESTS.filter((t) => t.id !== 'home-qa1');
    expect(mergeMissingSeedQaTests(without, INITIAL_QA_TESTS, ['home-qa1']).some((t) => t.id === 'home-qa1')).toBe(false);
    expect(mergeMissingSeedQaTests(without).some((t) => t.id === 'home-qa1')).toBe(true);
    expect(normalizeQaTests([])).toEqual([]);
  });

  it('rewrites the superseded Phase 1 ROI task title when it is still not started', () => {
    const saved = INITIAL_TASKS.map((t) =>
      t.id === 't-24'
        ? { ...t, title: 'Build ROI per phase after shirt costs are known', priority: 'medium' as const }
        : t,
    );
    const overlay = overlaySupersededSeedTasks(saved);
    expect(overlay.find((t) => t.id === 't-24')?.title).toMatch(/organic sprint ROI/i);
    expect(overlay.find((t) => t.id === 't-24')?.priority).toBe('high');
    const started = overlaySupersededSeedTasks(
      saved.map((t) => (t.id === 't-24' ? { ...t, status: 'in_progress' as const } : t)),
    );
    expect(started.find((t) => t.id === 't-24')?.title).toBe('Build ROI per phase after shirt costs are known');
  });

  it('overlays analytics and new-review due dates onto saved incomplete rows', () => {
    const staleAnalytics = overlaySupersededSeedTasks([
      {
        ...INITIAL_TASKS.find((task) => task.id === 't-83')!,
        dueDate: '2026-09-07',
        sprint: 'Sprint 1',
        title: 'Upload site analytics — Mon Sep 7 (Sprint 1)',
      },
      {
        ...INITIAL_TASKS.find((task) => task.id === 't-84')!,
        dueDate: '2026-09-07',
        sprint: 'Sprint 1',
      },
      {
        ...INITIAL_TASKS.find((task) => task.id === 't-203')!,
        dueDate: '2026-09-20',
        sprint: 'Sprint 2',
      },
    ]);
    expect(staleAnalytics.find((task) => task.id === 't-83')).toMatchObject({
      dueDate: '2026-09-18',
      sprint: 'Sprint 2',
    });
    expect(staleAnalytics.find((task) => task.id === 't-84')?.dueDate).toBe('2026-09-19');
    expect(staleAnalytics.find((task) => task.id === 't-203')).toMatchObject({
      dueDate: '2026-09-27',
      sprint: 'Sprint 3',
    });
    const doneKept = overlaySupersededSeedTasks([
      { ...INITIAL_TASKS.find((task) => task.id === 't-83')!, status: 'done', dueDate: '2026-09-17' },
    ]);
    expect(doneKept[0]?.dueDate).toBe('2026-09-17');

    const staleTest = overlayCatalogQaSchedule([
      { ...INITIAL_QA_TESTS.find((test) => test.id === 'p1web-home')!, dueDate: '2026-09-19', sprint: 'Sprint 2' },
    ]);
    expect(staleTest[0]?.sprint).toBe('Sprint 3');
    expect(staleTest[0]?.dueDate).toBe('2026-09-21');
  });

  it('applies every inline task parameter and rejects invalid values', () => {
    const task = INITIAL_TASKS[0];
    const updated = applyTaskInlinePatch(task, {
      title: 'Rename domain setup',
      notes: 'Wait on Angela’s Zelle.',
      sprint: 'Sprint 2',
      category: 'Features',
      priority: 'low',
      status: 'blocked',
      assignee: 'qa',
      assignor: 'evelyn',
      dueDate: '2026-09-15',
    });
    expect(updated).toMatchObject({
      id: task.id,
      title: 'Rename domain setup',
      notes: 'Wait on Angela’s Zelle.',
      sprint: 'Sprint 2',
      category: 'Features',
      priority: 'low',
      status: 'blocked',
      assignee: 'qa',
      assignor: 'evelyn',
      dueDate: '2026-09-15',
    });
    expect(applyTaskInlinePatch(task, { title: 'Draft title' }).title).toBe('Draft title');
    expect(applyTaskInlinePatch(task, { sprint: 'Sprint 99' as SprintCategory }).sprint).toBe(task.sprint);
    expect(applyTaskInlinePatch(task, { sprint: 'Sprint 0' }).sprint).toBe(task.sprint);
    expect(applyTaskInlinePatch(task, { sprint: 'Sprint 1' }).sprint).toBe(task.sprint);
    expect(applyQaInlinePatch(INITIAL_QA_TESTS[0], { sprint: 'Sprint 0' }).sprint).toBe(INITIAL_QA_TESTS[0].sprint);
    expect(applyQaInlinePatch(INITIAL_QA_TESTS[0], { sprint: 'Sprint 1' }).sprint).toBe(INITIAL_QA_TESTS[0].sprint);
    const finishedCarryover = applyTaskInlinePatch(INITIAL_TASKS.find((row) => row.id === 't-1')!, { status: 'done' });
    expect(finishedCarryover).toMatchObject({
      id: 't-1',
      status: 'done',
      completedOn: workBoardTodayIso(),
    });
    if (workBoardTodayIso() <= '2026-09-14') {
      expect(finishedCarryover).toMatchObject({ sprint: 'Sprint 1', rolledOver: false });
      expect(finishedCarryover.notes).not.toMatch(/Rolled Over to Sprint 2/);
    } else {
      expect(finishedCarryover.sprint).toBe('Sprint 2');
    }
    const lateSprint1Mark = applyTaskInlinePatch(
      { ...INITIAL_TASKS.find((row) => row.id === 't-1')!, completedOn: '2026-09-14' },
      { status: 'done' },
    );
    expect(lateSprint1Mark).toMatchObject({
      id: 't-1',
      sprint: 'Sprint 1',
      status: 'done',
      rolledOver: false,
      completedOn: '2026-09-14',
    });
    expect(applyTaskInlinePatch(finishedCarryover, { status: 'not_started' }).completedOn).toBeUndefined();
    const finishedBeforeClose = normalizeTasks([
      {
        id: 't-900',
        title: 'Finished during Sprint 1',
        status: 'done',
        sprint: 'Sprint 2',
        completedOn: '2026-09-12',
        category: 'Launch',
        priority: 'high',
        assignee: 'angela',
      },
    ])[0];
    expect(finishedBeforeClose).toMatchObject({
      sprint: 'Sprint 1',
      status: 'done',
      rolledOver: false,
      completedOn: '2026-09-12',
    });
    const passedBeforeClose = applyQaInlinePatch(
      { ...INITIAL_QA_TESTS[0], sprint: 'Sprint 2', rolledOver: false, completedOn: '2026-09-10' },
      { status: 'passed' },
    );
    expect(passedBeforeClose).toMatchObject({
      sprint: 'Sprint 1',
      status: 'passed',
      rolledOver: false,
      completedOn: '2026-09-10',
    });
    const list = applyTaskInlinePatchToList([task], task.id, { status: 'in_progress' });
    expect(list[0].status).toBe('in_progress');
  });

  it('requires a note when a task is set to Blocked', () => {
    const task = INITIAL_TASKS[0];
    const actor = { name: 'Evelyn Irving', email: 'evelyn@example.com' };
    expect(taskNeedsBlockedNote('not_started', 'blocked')).toBe(true);
    expect(taskNeedsBlockedNote('blocked', 'blocked')).toBe(false);
    expect(taskNeedsBlockedNote('blocked', 'in_progress')).toBe(false);
    expect(applyTaskInlinePatch(task, { status: 'blocked' }).status).toBe(task.status);
    expect(applyTaskBlockedWithNote(task, '   ', actor)).toEqual({
      ok: false,
      error: BLOCKED_NOTE_REQUIRED_MESSAGE,
    });
    const blocked = applyTaskBlockedWithNote(task, 'Waiting on Zelle confirmation', actor);
    expect(blocked.ok).toBe(true);
    if (blocked.ok) {
      expect(blocked.task.status).toBe('blocked');
      expect(blocked.task.notes).toMatch(/Waiting on Zelle confirmation/);
    }
    const already = applyTaskBlockedWithNote(
      { ...task, status: 'blocked', notes: '[{"id":"n-1","author":"Evelyn","createdAt":"2026-09-17T00:00:00.000Z","updatedAt":"2026-09-17T00:00:00.000Z","text":"Already blocked"}]' },
      'Another note',
      actor,
    );
    expect(already.ok).toBe(true);
    if (already.ok) {
      expect(already.task.notes).toContain('Already blocked');
      expect(already.task.notes).not.toContain('Another note');
    }
    expect(applyTasksBlockedWithNote(INITIAL_TASKS, ['t-1', 't-2'], '', actor).ok).toBe(false);
    const bulk = applyTasksBlockedWithNote(INITIAL_TASKS, ['t-1', 't-2'], 'Vendor delay', actor);
    expect(bulk.ok).toBe(true);
    if (bulk.ok) {
      expect(bulk.tasks.find((row) => row.id === 't-1')?.status).toBe('blocked');
      expect(bulk.tasks.find((row) => row.id === 't-2')?.status).toBe('blocked');
      expect(bulk.tasks.find((row) => row.id === 't-3')?.status).not.toBe('blocked');
    }
  });

  it('lets filter dropdowns multi-select and treat All as every value', () => {
    const ordered = ['Sprint 0', 'Sprint 1', 'Sprint 2'] as const;
    expect(isFilterShowingAll(selectAllFilterValues(ordered), ordered)).toBe(true);
    const first = applyFilterChipClick(new Set<string>(), 'Sprint 0', { ordered }).next;
    expect([...first]).toEqual(['Sprint 0']);
    const two = applyFilterChipClick(first, 'Sprint 1', { ordered }).next;
    expect(two.has('Sprint 0')).toBe(true);
    expect(two.has('Sprint 1')).toBe(true);
    const allSelected = applyFilterChipClick(two, 'Sprint 2', { ordered }).next;
    expect(isFilterShowingAll(allSelected, ordered)).toBe(true);
    expect(allSelected.size).toBe(0);
  });

  it('toggles and bulk-selects row ids for board editing', () => {
    const one = toggleSelectedId(new Set(), 't-1');
    expect(one.has('t-1')).toBe(true);
    expect(toggleSelectedId(one, 't-1').has('t-1')).toBe(false);
    const many = setManySelected(new Set(), ['t-1', 't-2'], true);
    expect(allIdsSelected(many, ['t-1', 't-2'])).toBe(true);
    expect(allIdsSelected(setManySelected(many, ['t-1'], false), ['t-1', 't-2'])).toBe(false);
  });

  it('bulk-edits selected tasks and tests and keeps sprint section stats', () => {
    const bulkTasks = applyBulkTaskPatch(INITIAL_TASKS, ['t-1', 't-2'], { priority: 'low' });
    expect(bulkTasks.find((t) => t.id === 't-1')?.priority).toBe('low');
    expect(bulkTasks.find((t) => t.id === 't-3')?.priority).toBe('high');
    const bulkTests = applyBulkQaPatch(INITIAL_QA_TESTS, [INITIAL_QA_TESTS[0].id], { status: 'blocked' });
    expect(bulkTests[0].status).toBe('blocked');
    const dueIds = [INITIAL_QA_TESTS[0].id, INITIAL_QA_TESTS[1].id];
    const dueBulk = applyBulkQaPatch(INITIAL_QA_TESTS, dueIds, { dueDate: '2026-09-18' });
    expect(dueBulk.find((test) => test.id === dueIds[0])?.dueDate).toBe('2026-09-18');
    expect(dueBulk.find((test) => test.id === dueIds[1])?.dueDate).toBe('2026-09-18');
    expect(applyBulkQaPatch(dueBulk, dueIds, { dueDate: '' }).find((test) => test.id === dueIds[0])?.dueDate).toBe('');
    const taskDue = applyBulkTaskPatch(INITIAL_TASKS, ['t-1', 't-2'], { dueDate: '2026-09-19' });
    expect(taskDue.find((task) => task.id === 't-1')?.dueDate).toBe('2026-09-19');
    expect(taskDue.find((task) => task.id === 't-2')?.dueDate).toBe('2026-09-19');
    expect(applyQaInlinePatch(INITIAL_QA_TESTS[0], { title: 'Renamed QA' }).title).toBe('Renamed QA');
    const qaPatched = applyQaInlinePatch(INITIAL_QA_TESTS[0], {
      assignor: 'angela',
      dueDate: '2026-09-20',
      phase: 'Phase 1',
      desc: 'Updated steps',
    });
    expect(qaPatched).toMatchObject({
      assignor: 'angela',
      dueDate: '2026-09-20',
      phase: 'Phase 1',
      desc: 'Updated steps',
    });
    expect(applyQaInlinePatch(qaPatched, { dueDate: 'nope' }).dueDate).toBe('2026-09-20');
    expect(applyQaInlinePatch(qaPatched, { dueDate: '' }).dueDate).toBe('');
    const stats = sprintSectionStats(INITIAL_TASKS, (t) => t.status === 'done');
    expect(stats).toHaveLength(5);
    expect(stats[0].sprint).toBe('Sprint 0');
    expect(stats[0].total).toBe(0);
    expect(stats.find((row) => row.sprint === 'Sprint 1')?.total).toBe(0);
    expect(stats.find((row) => row.sprint === 'Sprint 2')?.total).toBeGreaterThan(0);
    expect(stats.find((row) => row.sprint === 'Sprint 2')?.rolledOver).toBe(countRolledOverItems(INITIAL_TASKS.filter((task) => task.sprint === 'Sprint 2')));
    expect(countRolledOverItems(INITIAL_TASKS)).toBeGreaterThan(0);
    expect(countRolledOverItems(INITIAL_QA_TESTS)).toBeGreaterThan(0);
    expect(formatRolledOverCount(countRolledOverItems(INITIAL_TASKS))).toMatch(/rolled over/);
  });

  it('defaults every sprint section open on the task and test boards', () => {
    const current = currentSprintLabel(new Date('2026-08-26T12:00:00'));
    expect(current).toBe('Sprint 0');
    const open = defaultOpenSprintSections(current);
    expect(open['Sprint 0']).toBe(false);
    expect(open['Sprint 1']).toBe(false);
    expect(SPRINT_OPTIONS.filter((sprint) => sprint !== 'Sprint 0' && sprint !== 'Sprint 1').every((sprint) => open[sprint])).toBe(true);
    expect(toggleSprintSection(open, 'Sprint 2')['Sprint 2']).toBe(false);
  });

  it('grays save until a task or test card is dirty, then enables that card and Save All', () => {
    expect(SAVE_ALL_LABEL).toBe('Save All');
    expect(workBoardPersistIsDisabled()).toBe(false);
    const idle = workBoardSaveButtonTone(false);
    const live = workBoardSaveButtonTone(true);
    const idleClickable = workBoardSaveButtonTone(false, { clickable: true });
    expect(idle).toContain('#D4CCC2');
    expect(idle).not.toContain('#C2410C');
    expect(idle).toContain('cursor-not-allowed');
    expect(idleClickable).toContain('#D4CCC2');
    expect(idleClickable).toContain('cursor-pointer');
    expect(live).toContain('#C2410C');
    expect(anyWorkItemsDirty(new Set(), new Set())).toBe(false);
    const dirtyTasks = markWorkItemDirty(new Set(), ['t-1']);
    expect(workItemIsDirty(dirtyTasks, 't-1')).toBe(true);
    expect(workItemIsDirty(dirtyTasks, 't-2')).toBe(false);
    expect(anyWorkItemsDirty(dirtyTasks, new Set())).toBe(true);
    expect(workItemIsDirty(markWorkItemDirty(dirtyTasks, ['t-2', '']), 't-2')).toBe(true);
  });

  it('defaults task and test filters to all sprints', () => {
    const now = new Date('2026-09-02T12:00:00');
    const taskFilters = defaultWorkBoardFilters(now);
    const testFilters = defaultWorkBoardFilters(now);
    expect(taskFilters.sprint.size).toBe(0);
    expect(testFilters.sprint.size).toBe(0);
    expect(taskFilters.status.size).toBe(0);
    expect(testFilters.assignee.size).toBe(0);
    expect(taskFilters.due).toBe('all');
  });

  it('defaults Testing Portal filters to the current sprint and signed-in person', () => {
    const now = new Date('2026-09-14T12:00:00');
    const filters = defaultTestingPortalFilters({ email: 'evelyn3@cox.net', name: 'Evelyn Irving' }, now);
    expect([...filters.sprint]).toEqual([currentSprintLabel(now)]);
    expect([...filters.assignee]).toEqual(['evelyn']);
    expect(filters.status.size).toBe(0);
    expect(filters.priority.size).toBe(0);
    expect(filters.category.size).toBe(0);
    expect(filters.due).toBe('all');
    const qaOnly = defaultTestingPortalFilters({ email: 'qa@example.com', name: 'QA Tester' }, now);
    expect([...qaOnly.sprint]).toEqual([currentSprintLabel(now)]);
    expect(qaOnly.assignee.size).toBe(0);
  });

  it('defaults the Task List to the current sprint, signed-in name, and All statuses', () => {
    const now = new Date('2026-09-17T12:00:00');
    const evelyn = defaultTaskBoardFilters({ email: 'evelyn3@cox.net', name: 'Evelyn Irving' }, now);
    expect([...evelyn.sprint]).toEqual([currentSprintLabel(now)]);
    expect([...evelyn.assignee]).toEqual(['evelyn']);
    expect(evelyn.status.size).toBe(0);
    expect(evelyn.priority.size).toBe(0);
    expect(evelyn.category.size).toBe(0);
    expect(evelyn.due).toBe('all');
    const angela = defaultTaskBoardFilters({ email: 'angela@angelasharris.com', name: 'Angela' }, now);
    expect([...angela.sprint]).toEqual([currentSprintLabel(now)]);
    expect([...angela.assignee]).toEqual(['angela']);
    expect(angela.status.size).toBe(0);
    const unknown = defaultTaskBoardFilters({ email: 'guest@example.com', name: 'Guest' }, now);
    expect([...unknown.sprint]).toEqual([currentSprintLabel(now)]);
    expect(unknown.assignee.size).toBe(0);
    expect(unknown.status.size).toBe(0);
  });

  it('sorts and filters list columns including due date', () => {
    const items = [
      { id: 'a', title: 'Zebra', sprint: 'Sprint 2' as const, status: 'done', assignee: 'evelyn', dueDate: '2026-09-10' },
      { id: 'b', title: 'Apple', sprint: 'Sprint 0' as const, status: 'not_started', assignee: 'angela', dueDate: '2026-09-03' },
      { id: 'c', title: 'Middle', sprint: 'Sprint 1' as const, status: 'in_progress', assignee: 'angela' },
    ];
    const byTitle = sortWorkBoardItems(items, { key: 'title', dir: 'asc' });
    expect(byTitle.map((row) => row.id)).toEqual(['b', 'c', 'a']);
    const byDue = sortWorkBoardItems(items, { key: 'dueDate', dir: 'asc' });
    expect(byDue.map((row) => row.id)).toEqual(['b', 'a', 'c']);
    expect(toggleWorkBoardSort({ key: 'title', dir: 'asc' }, 'title')).toEqual({ key: 'title', dir: 'desc' });
    expect(toggleWorkBoardSort({ key: 'title', dir: 'asc' }, 'dueDate')).toEqual({ key: 'dueDate', dir: 'asc' });
    expect(matchesDueDateFilter('2026-09-03', 'today', '2026-09-03')).toBe(true);
    expect(matchesDueDateFilter('2026-09-02', 'overdue', '2026-09-03')).toBe(true);
    expect(matchesDueDateFilter('', 'none')).toBe(true);
    expect(singleFilterValue(new Set(['Sprint 0']))).toBe('Sprint 0');
    expect(setSingleFilterValue('all', SPRINT_OPTIONS).size).toBe(0);
    expect(setSingleFilterValue('Sprint 0', SPRINT_OPTIONS).has('Sprint 0')).toBe(true);
    expect(filterTasks(INITIAL_TASKS, { ...defaultWorkBoardFilters<TaskStatus>(), due: 'today' }, '').some((task) => task.id === 't-58')).toBe(
      workBoardTodayIso() === '2026-09-03',
    );
    expect(filterTasks(INITIAL_TASKS, { ...defaultWorkBoardFilters<TaskStatus>(), due: 'none' }, '').length).toBeGreaterThan(0);
  });

  it('orders tasks and tests: open work first, then urgency, then not started before in progress', () => {
    expect(DEFAULT_WORK_BOARD_SORT).toEqual({ key: 'status', dir: 'asc' });
    expect(workBoardCompletionRank('done')).toBe(1);
    expect(workBoardCompletionRank('passed')).toBe(1);
    expect(workBoardCompletionRank('not_started')).toBe(0);
    expect(workBoardCompletionRank('untested')).toBe(0);
    expect(workBoardPriorityRank('high')).toBeLessThan(workBoardPriorityRank('medium'));
    expect(workBoardPriorityRank('medium')).toBeLessThan(workBoardPriorityRank('low'));
    expect(workBoardStatusRank('not_started')).toBe(workBoardStatusRank('untested'));
    expect(workBoardStatusRank('not_started')).toBeLessThan(workBoardStatusRank('in_progress'));
    expect(workBoardStatusRank('in_progress')).toBeLessThan(workBoardStatusRank('blocked'));
    expect(workBoardStatusRank('nope')).toBe(8);

    const tasks = [
      { id: 'd-high', title: 'Done high', sprint: 'Sprint 0', status: 'done', assignee: 'angela', priority: 'high', dueDate: '2026-09-01' },
      { id: 'ip-high', title: 'IP high', sprint: 'Sprint 0', status: 'in_progress', assignee: 'angela', priority: 'high' },
      { id: 'ns-low', title: 'NS low', sprint: 'Sprint 0', status: 'not_started', assignee: 'angela', priority: 'low' },
      { id: 'ns-high', title: 'NS high', sprint: 'Sprint 0', status: 'not_started', assignee: 'angela', priority: 'high' },
      { id: 'ns-med', title: 'NS med', sprint: 'Sprint 0', status: 'not_started', assignee: 'angela', priority: 'medium' },
      { id: 'blocked-high', title: 'Blocked high', sprint: 'Sprint 0', status: 'blocked', assignee: 'angela', priority: 'high' },
      { id: 'd-low', title: 'Done low', sprint: 'Sprint 0', status: 'done', assignee: 'angela', priority: 'low' },
    ];
    expect(sortWorkBoardItems(tasks, DEFAULT_WORK_BOARD_SORT).map((row) => row.id)).toEqual([
      'ns-high',
      'ip-high',
      'blocked-high',
      'ns-med',
      'ns-low',
      'd-high',
      'd-low',
    ]);

    const tests = [
      { id: 'pass-high', title: 'Passed high', sprint: 'Sprint 0', status: 'passed', assignee: 'evelyn', priority: 'high' },
      { id: 'ip-med', title: 'IP med', sprint: 'Sprint 0', status: 'in_progress', assignee: 'evelyn', priority: 'medium' },
      { id: 'untested-high', title: 'Untested high', sprint: 'Sprint 0', status: 'untested', assignee: 'evelyn', priority: 'high' },
      { id: 'failed-high', title: 'Failed high', sprint: 'Sprint 0', status: 'failed', assignee: 'evelyn', priority: 'high' },
      { id: 'untested-low', title: 'Untested low', sprint: 'Sprint 0', status: 'untested', assignee: 'evelyn', priority: 'low' },
    ];
    expect(sortWorkBoardItems(tests, DEFAULT_WORK_BOARD_SORT).map((row) => row.id)).toEqual([
      'untested-high',
      'failed-high',
      'ip-med',
      'untested-low',
      'pass-high',
    ]);

    const junk = { id: 'junk', title: 'Junk', sprint: 'Sprint 0', status: 'nope', assignee: 'qa', priority: 'urgent' };
    const ns = { id: 'ns', title: 'NS', sprint: 'Sprint 0', status: 'not_started', assignee: 'angela', priority: 'high' };
    expect(compareWorkBoardBoardOrder(junk, ns)).toBeGreaterThan(0);
    expect(sortWorkBoardItems([junk, ns], DEFAULT_WORK_BOARD_SORT).map((row) => row.id)).toEqual(['ns', 'junk']);
  });

  it('gives each filter header its own shaded color instead of one rust fill', () => {
    const headers = Object.values(FILTER_SECTION_TONES).map((tone) => tone.header);
    expect(new Set(headers).size).toBe(headers.length);
    expect(FILTER_SECTION_TONES.sprint.header).toContain('#E8B89A');
    expect(FILTER_SECTION_TONES.status.header).toContain('#7FB3A8');
    expect(FILTER_SECTION_TONES.priority.header).toContain('#E0C878');
    expect(FILTER_SECTION_TONES.assignee.header).toContain('#8FA8C4');
    expect(FILTER_SECTION_TONES.category.header).toContain('#C4A8C0');
    expect(headers.every((header) => !header.includes('#C2410C'))).toBe(true);
    expect(SPRINT_SECTION_TONES['Sprint 0'].header).not.toContain('#C2410C');
    expect(new Set(SPRINT_OPTIONS.map((sprint) => SPRINT_SECTION_TONES[sprint].ink)).size).toBe(5);
    expect(SPRINT_SECTION_TONES['Sprint 0'].ink).toBe(sprintTextClass('Sprint 0'));
    expect(SPRINT_SECTION_TONES['Sprint 4'].ink).toContain('#5A3D7A');
    expect(buildSprintChipCounts(INITIAL_TASKS, taskIsDone).every((chip) => Boolean(chip.accent))).toBe(true);
    expect(TASK_STATUS_TONES.done).toContain('#B8D4C4');
    expect(taskStatusRowClass('done')).toContain('border-l-8');
    expect(taskStatusRowClass('in_progress')).toContain('#F6E56A');
    expect(taskStatusRowClass('blocked')).toContain('#E8D4A0');
    expect(taskStatusRowClass('not_started')).toContain('#F4EBE6');
    expect(workPriorityTextClass('high')).toBe('text-[#DC2626]');
    expect(workPriorityTextClass('medium')).toBe('text-[#1F1917]');
    expect(workPriorityTextClass('low')).toBe('text-[#1F1917]');
    expect(workDueDateTextClass('2026-09-16', { today: '2026-09-17' })).toBe('text-[#DC2626]');
    expect(workDueDateTextClass('2026-09-17', { today: '2026-09-17' })).toBe('text-[#1F1917]');
    expect(workDueDateTextClass('2026-09-21', { today: '2026-09-17' })).toBe('text-[#1F1917]');
    expect(workDueDateTextClass('2026-09-16', { today: '2026-09-17', done: true })).toBe('text-[#1F1917]');
    expect(workDueDateTextClass(undefined, { today: '2026-09-17' })).toBe('text-[#1F1917]');
    expect(workOverdueTextClass(true)).toBe('text-[#DC2626]');
    expect(workOverdueTextClass(false)).toBe('text-[#1F1917]');
    expect(workDueDateControlClass(true)).toContain('text-[#DC2626]');
    expect(workDueDateControlClass(false)).toContain('text-[#1F1917]');
    expect(workDueDateControlClass(false)).not.toContain('text-[#DC2626]');
    expect(qaStatusRowClass('passed')).toContain('#B8D4C4');
    expect(qaStatusRowClass('in_progress')).toContain('#F6E56A');
    expect(qaStatusRowClass('failed')).toContain('#E4B8A4');
    expect(qaStatusRowClass('blocked')).toContain('#E8D4A0');
    expect(qaStatusRowClass('untested')).toContain('#F4EBE6');
    expect(new Set(taskStatusLegend().map((item) => item.className)).size).toBe(4);
    expect(new Set(qaStatusLegend().map((item) => item.className)).size).toBe(7);
    expect(QA_STATUS_TONES.failed).not.toBe(QA_STATUS_TONES.passed);
  });

  it('opens Sprint and Assignee filter sections and toggles them independently', () => {
    expect(FILTER_SECTION_IDS).toEqual(['sprint', 'assignee', 'status', 'category', 'priority']);
    expect(defaultFilterSectionTab()).toBe('assignee');
    expect(FILTER_SECTION_LABELS.assignee).toBe('Assignee');
    expect(isFilterSectionTab('assignee')).toBe(true);
    expect(isFilterSectionTab('notes')).toBe(false);
    const open = defaultOpenFilterSections();
    expect(open.assignee).toBe(true);
    expect(open.sprint).toBe(true);
    expect(open.priority).toBe(false);
    expect(open.category).toBe(false);
    expect(open.status).toBe(false);
    expect(defaultMoreFiltersOpen()).toBe(false);
    expect(COLLAPSED_FILTER_SECTION_IDS).toEqual(['status', 'category', 'priority']);
    const sprint = selectFilterSection('sprint');
    expect(sprint.sprint).toBe(true);
    expect(sprint.assignee).toBe(false);
    const openedPriority = toggleFilterSection(open, 'priority');
    expect(openedPriority.priority).toBe(true);
    expect(openedPriority.assignee).toBe(true);
    expect(openedPriority.sprint).toBe(true);
    expect(toggleFilterSection(open, 'assignee').assignee).toBe(false);
    expect(toggleFilterSection(open, 'assignee').sprint).toBe(true);
    expect(filterSectionSummary(new Set(), ['angela', 'evelyn'], [{ id: 'angela', label: 'Angela', done: 0, total: 1 }])).toBe(
      'All',
    );
    expect(
      filterSectionSummary(new Set(['evelyn']), ['angela', 'evelyn'], [
        { id: 'angela', label: 'Angela', done: 0, total: 1 },
        { id: 'evelyn', label: 'Evelyn', done: 1, total: 2 },
      ]),
    ).toBe('Evelyn');
  });

  it('formats stable task and QA numbers', () => {
    expect(formatTaskCode('t-12')).toBe('T-12');
    expect(formatTaskCode('t-43::angela')).toBe('T-43');
    expect(formatTaskCode('task-1788384351510', [{ id: 't-1' }, { id: 'task-1788384351510' }])).toBe('T-2');
    expect(nextTaskId([{ id: 't-49' }, { id: 't-12' }])).toBe('t-50');
    expect(formatQaCode(INITIAL_QA_TESTS[0].id, INITIAL_QA_TESTS)).toBe('Q-1');
    expect(formatQaCode(INITIAL_QA_TESTS[5].id, INITIAL_QA_TESTS)).toBe('Q-6');
    expect(formatQaCode('VT-AUTH-001', allSeedQaTests())).toBe('VT-AUTH-001');
    expect(formatQaCode('PW-HOME-001', allSeedQaTests())).toBe('PW-HOME-001');
  });

  it('keeps Vitest catalog cases off Angela and Evelyn', () => {
    const seeded = allSeedQaTests();
    const vitest = seeded.find((test) => test.id === 'VT-AUTH-001');
    expect(vitest?.suite).toBe('vitest');
    expect(applyQaInlinePatch(vitest!, { assignee: 'evelyn' }).assignee).toBe('vitest');
    expect(applyQaInlinePatch(vitest!, { assignee: 'angela' }).suite).toBe('vitest');
    const passed = applyQaInlinePatch(
      { ...vitest!, steps: [{ id: 's-1', label: 'Run bun run test', checked: true }] },
      { status: 'passed' },
    );
    expect(passed.assignee).toBe('vitest');
    expect(passed.status).toBe('passed');
  });

  it('rewrites timestamp task ids to short t-N codes', () => {
    const rewritten = canonicalizeTaskIds([
      {
        id: 't-49',
        title: 'Keep',
        sprint: 'Sprint 0',
        category: 'Infrastructure',
        priority: 'high',
        status: 'not_started',
        assignee: 'evelyn',
      },
      {
        id: 'task-1788384351510',
        title: 'Legacy',
        sprint: 'Sprint 1',
        category: 'Apparel',
        priority: 'medium',
        status: 'not_started',
        assignee: 'angela',
      },
    ]);
    expect(rewritten[0].id).toBe('t-49');
    expect(rewritten[1].id).toBe('t-50');
    expect(formatTaskCode(rewritten[1].id)).toBe('T-50');
  });

  it('collapses cloned task titles so Angela/Evelyn chips are not hundreds of duplicates', () => {
    const seed = INITIAL_TASKS.find((task) => task.assignee === 'angela')!;
    const clones = Array.from({ length: 40 }, (_, index) => ({
      ...seed,
      id: `t-${2000 + index}`,
      status: index === 7 ? ('done' as const) : seed.status,
    }));
    const pruned = pruneDuplicateTasks([seed, ...clones, INITIAL_TASKS.find((task) => task.assignee === 'evelyn')!]);
    expect(pruned.tasks).toHaveLength(2);
    expect(pruned.tasks.find((task) => task.assignee === 'angela')).toMatchObject({
      id: seed.id,
      status: 'done',
    });
    expect(pruned.removedIds).toHaveLength(40);
  });

  it('puts unclaimed tests on Unknown and Vitest/Playwright on their own assignee chips', () => {
    expect(normalizeTestAssignee('qa')).toBe('unassigned');
    expect(INITIAL_QA_TESTS.every((test) => test.assignee !== 'qa')).toBe(true);
    const seeded = allSeedQaTests();
    const chips = buildAssigneeChipCounts(seeded, qaIsDone, TEST_ASSIGNEE_OPTIONS);
    expect(chips.find((chip) => chip.id === 'qa')).toBeUndefined();
    expect(chips.find((chip) => chip.id === 'unassigned')?.label).toBe('Unknown');
    expect(chips.find((chip) => chip.id === 'vitest')).toMatchObject({ label: 'Vitest', total: 9 });
    expect(chips.find((chip) => chip.id === 'playwright')).toMatchObject({ label: 'Playwright', total: 7 });
    expect(chips.find((chip) => chip.id === 'angela')?.total).toBe(
      4 +
        phase1WebsiteReviewTestCount() +
        sprint2WebsiteReviewTestCount() +
        formWalkthroughTestCount() +
        moodWorkflowTestCount() +
        journalMakeReviewTestIds().length,
    );
    expect(chips.find((chip) => chip.id === 'evelyn')?.total).toBe(4);
    const taskChips = buildAssigneeChipCounts(INITIAL_TASKS, taskIsDone);
    expect(taskChips.find((chip) => chip.id === 'angela')?.total).toBe(107);
    expect(taskChips.find((chip) => chip.id === 'evelyn')?.total).toBe(84);
    expect(taskChips.find((chip) => chip.id === 'qa')?.total).toBe(1);
    expect(taskChips.find((chip) => chip.id === 'vitest')).toMatchObject({ label: 'Vitest', total: 0 });
    expect(taskChips.find((chip) => chip.id === 'playwright')).toMatchObject({ label: 'Playwright', total: 0 });
  });

  it('lets a task be assigned to Vitest or Playwright', () => {
    const updated = applyTaskInlinePatch(INITIAL_TASKS[0], { assignee: 'vitest' });
    expect(updated.assignee).toBe('vitest');
    expect(applyTaskInlinePatch(INITIAL_TASKS[0], { assignee: 'playwright' }).assignee).toBe('playwright');
  });

  it('uses System as assignor until a person changes the assignee', () => {
    expect(normalizeAssignor('unassigned')).toBe('system');
    expect(normalizeAssignor(undefined)).toBe('system');
    expect(ASSIGNEE_LABELS.system).toBe('System');
    expect(ASSIGNOR_OPTIONS.includes('unassigned')).toBe(false);
    expect(workAssigneeFromActor({ email: 'angela@angelasharris.com' })).toBe('angela');
    const [task] = normalizeTasks([
      {
        id: 't-1',
        title: 'Budget',
        sprint: 'Sprint 0',
        category: 'Infrastructure',
        priority: 'high',
        status: 'not_started',
        assignee: 'angela',
      },
    ]);
    expect(task.assignor).toBe('system');
    expect(task.sprint).toBe('Sprint 2');
    expect(task.assignee).toBe('angela');
    const reassigned = applyTaskInlinePatch(task, { assignee: 'evelyn' }, 'angela');
    expect(reassigned.assignee).toBe('evelyn');
    expect(reassigned.assignor).toBe('angela');
    const renamed = applyTaskInlinePatch(reassigned, { title: 'Budget renamed' }, 'evelyn');
    expect(renamed.assignor).toBe('angela');
    const test = applyQaInlinePatch(
      { ...INITIAL_QA_TESTS[0], assignee: 'unassigned', assignor: 'unassigned' },
      { assignee: 'angela' },
      'evelyn',
    );
    expect(test.assignor).toBe('evelyn');
  });
});
