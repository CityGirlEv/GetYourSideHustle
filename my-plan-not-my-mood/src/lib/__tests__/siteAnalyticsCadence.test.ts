import { describe, expect, it } from 'vitest';
import {
  SITE_ANALYTICS_ANGELA_START_ISO,
  SITE_ANALYTICS_ANGELA_TASK,
  SITE_ANALYTICS_CADENCE_DAYS,
  SITE_ANALYTICS_CHANNELS,
  SITE_ANALYTICS_EVELYN_TASK,
  SITE_ANALYTICS_FIRST_SPRINT_INDEX,
  SITE_ANALYTICS_PLATFORMS,
  SITE_ANALYTICS_REVIEW_START_ISO,
  SITE_ANALYTICS_SPRINT_DELIVERABLE,
  SITE_ANALYTICS_TASK_HREF,
  SITE_ANALYTICS_TASK_START_NUMBER,
  SITE_ANALYTICS_TODAY_ISO,
  buildSiteAnalyticsInstances,
  buildSiteAnalyticsSeedTasks,
  dueDateForAngelaAnalyticsSlot,
  dueDateForEvelynAnalyticsReview,
  isSiteAnalyticsSubmitWeekday,
  nextSiteAnalyticsDueIso,
  screensForPlatform,
  siteAnalyticsContentSeed,
  siteAnalyticsDueIsosForWindow,
  siteAnalyticsGuidesNextCreate,
  siteAnalyticsIsDue,
  siteAnalyticsTaskById,
} from '../siteAnalyticsCadence';

describe('siteAnalyticsCadence', () => {
  it('lists the screens to capture on each posting platform', () => {
    expect(SITE_ANALYTICS_PLATFORMS.map((platform) => platform.id)).toEqual([
      'facebook',
      'instagram',
      'tiktok',
      'youtube',
      'personal',
    ]);
    expect(SITE_ANALYTICS_CHANNELS).toEqual(['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Personal']);
    expect(screensForPlatform('facebook')).toEqual(
      expect.arrayContaining(['Overview (latest current window — not today’s already-uploaded screenshots)', 'Reach', 'Followers']),
    );
    expect(screensForPlatform('instagram')).toEqual(
      expect.arrayContaining([
        'Insights overview (latest current window — not today’s already-uploaded screenshots)',
        'Profile activity — profile visits and website taps',
      ]),
    );
    expect(screensForPlatform('tiktok')).toEqual(expect.arrayContaining(['Video views', 'Top videos in this window']));
    expect(screensForPlatform('youtube')).toEqual(expect.arrayContaining(['Analytics overview', 'Traffic sources']));
    expect(screensForPlatform('personal')).toEqual(
      expect.arrayContaining(['Personal Facebook Insights overview', 'Personal Instagram Insights overview']),
    );
    expect(SITE_ANALYTICS_PLATFORMS.every((platform) => platform.screens.length >= 5)).toBe(true);
  });

  it('schedules Angela every 3 days starting tomorrow, with reviews the next day', () => {
    expect(SITE_ANALYTICS_CADENCE_DAYS).toBe(3);
    expect(SITE_ANALYTICS_FIRST_SPRINT_INDEX).toBe(1);
    expect(SITE_ANALYTICS_TODAY_ISO).toBe('2026-09-17');
    expect(SITE_ANALYTICS_ANGELA_START_ISO).toBe('2026-09-18');
    expect(SITE_ANALYTICS_REVIEW_START_ISO).toBe('2026-09-19');
    expect(dueDateForAngelaAnalyticsSlot(0)).toBe('2026-09-18');
    expect(dueDateForAngelaAnalyticsSlot(1)).toBe('2026-09-21');
    expect(dueDateForEvelynAnalyticsReview('2026-09-18')).toBe('2026-09-19');
    expect(isSiteAnalyticsSubmitWeekday('2026-09-07')).toBe(true);
    expect(isSiteAnalyticsSubmitWeekday('2026-09-08')).toBe(false);
    expect(siteAnalyticsDueIsosForWindow('2026-09-07', '2026-09-13')).toEqual([
      '2026-09-07',
      '2026-09-09',
      '2026-09-11',
    ]);
    expect(nextSiteAnalyticsDueIso('2026-09-18')).toBe('2026-09-21');
    expect(siteAnalyticsIsDue('2026-09-18', '2026-09-20')).toBe(false);
    expect(siteAnalyticsIsDue('2026-09-18', '2026-09-21')).toBe(true);
  });

  it('builds a gather task and an associated review task for each platform on each original MWF slot', () => {
    const instances = buildSiteAnalyticsInstances();
    const seeds = buildSiteAnalyticsSeedTasks();
    const days = 12;
    const platforms = SITE_ANALYTICS_PLATFORMS.length;
    expect(instances).toHaveLength(days * platforms * 2);
    expect(seeds).toHaveLength(days * platforms * 2);
    expect(instances.every((row) => ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'].includes(row.sprintLabel))).toBe(true);
    expect(instances.filter((row) => row.role === 'angela')).toHaveLength(days * platforms);
    expect(instances.filter((row) => row.role === 'evelyn')).toHaveLength(days * platforms);
    expect(new Set(instances.map((row) => row.platformId))).toEqual(
      new Set(['facebook', 'instagram', 'tiktok', 'youtube', 'personal']),
    );
    expect(seeds.find((row) => row.id === `t-${SITE_ANALYTICS_TASK_START_NUMBER}`)).toMatchObject({
      assignee: 'angela',
      dueDate: SITE_ANALYTICS_ANGELA_START_ISO,
      sprint: 'Sprint 2',
      groupId: 'analytics-2026-09-07-facebook',
    });
    expect(seeds.find((row) => row.id === `t-${SITE_ANALYTICS_TASK_START_NUMBER + 1}`)).toMatchObject({
      assignee: 'evelyn',
      dueDate: SITE_ANALYTICS_REVIEW_START_ISO,
      sprint: 'Sprint 2',
      groupId: 'analytics-2026-09-07-facebook',
    });
    const angelaSeeds = seeds.filter((row) => row.assignee === 'angela');
    const evelynSeeds = seeds.filter((row) => row.assignee === 'evelyn');
    expect(angelaSeeds.every((row) => row.dueDate >= SITE_ANALYTICS_ANGELA_START_ISO)).toBe(true);
    expect(evelynSeeds.every((row) => row.dueDate >= SITE_ANALYTICS_REVIEW_START_ISO)).toBe(true);
    expect(angelaSeeds.some((row) => row.dueDate === SITE_ANALYTICS_ANGELA_START_ISO)).toBe(true);
    expect(angelaSeeds.some((row) => row.dueDate === dueDateForAngelaAnalyticsSlot(1))).toBe(true);
    const facebookPairs = seeds.filter((row) => row.groupId === 'analytics-2026-09-07-facebook');
    expect(facebookPairs).toHaveLength(2);
    const angelaDue = facebookPairs.find((row) => row.assignee === 'angela')?.dueDate;
    const evelynDue = facebookPairs.find((row) => row.assignee === 'evelyn')?.dueDate;
    expect(evelynDue).toBe(dueDateForEvelynAnalyticsReview(angelaDue ?? ''));
    expect(siteAnalyticsTaskById('t-83')?.title).toMatch(/Gather Facebook analytics/);
    expect(siteAnalyticsTaskById('t-84')?.title).toMatch(/Review Facebook analytics/);
    const facebookGather = siteAnalyticsContentSeed('t-83');
    expect(facebookGather?.description).toMatch(/latest/i);
    expect(facebookGather?.description).toMatch(/already-uploaded/);
    expect(facebookGather?.steps[0]).toEqual(expect.objectContaining({ href: SITE_ANALYTICS_TASK_HREF }));
    expect(facebookGather?.steps.some((step) => String(typeof step === 'string' ? step : step.label).includes('Capture: Reach'))).toBe(
      true,
    );
    expect(SITE_ANALYTICS_ANGELA_TASK).toMatch(/each posting platform/);
    expect(SITE_ANALYTICS_EVELYN_TASK).toMatch(/next create/i);
    expect(SITE_ANALYTICS_SPRINT_DELIVERABLE).toMatch(/each posting platform/);
  });

  it('rejects a next-create guide that skips Evelyn’s review recommendations', () => {
    expect(siteAnalyticsGuidesNextCreate({ hasRecommendations: true, usedForNextCreate: true })).toBe(true);
    expect(siteAnalyticsGuidesNextCreate({ hasRecommendations: false, usedForNextCreate: true })).toBe(false);
    expect(siteAnalyticsGuidesNextCreate({ hasRecommendations: true, usedForNextCreate: false })).toBe(false);
  });
});
