import { describe, expect, it } from 'vitest';
import {
  SITE_ANALYTICS_ANGELA_TASK,
  SITE_ANALYTICS_CADENCE_DAYS,
  SITE_ANALYTICS_CHANNELS,
  SITE_ANALYTICS_EVELYN_TASK,
  SITE_ANALYTICS_FIRST_SPRINT_INDEX,
  SITE_ANALYTICS_PLATFORMS,
  SITE_ANALYTICS_SPRINT_DELIVERABLE,
  SITE_ANALYTICS_TASK_HREF,
  SITE_ANALYTICS_TASK_START_NUMBER,
  buildSiteAnalyticsInstances,
  buildSiteAnalyticsSeedTasks,
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
    expect(screensForPlatform('facebook')).toEqual(expect.arrayContaining(['Overview (last 2 days)', 'Reach', 'Followers']));
    expect(screensForPlatform('instagram')).toEqual(
      expect.arrayContaining(['Insights overview (last 2 days)', 'Profile activity — profile visits and website taps']),
    );
    expect(screensForPlatform('tiktok')).toEqual(expect.arrayContaining(['Video views', 'Top videos in this window']));
    expect(screensForPlatform('youtube')).toEqual(expect.arrayContaining(['Analytics overview', 'Traffic sources']));
    expect(screensForPlatform('personal')).toEqual(
      expect.arrayContaining(['Personal Facebook Insights overview', 'Personal Instagram Insights overview']),
    );
    expect(SITE_ANALYTICS_PLATFORMS.every((platform) => platform.screens.length >= 5)).toBe(true);
  });

  it('schedules Monday, Wednesday, and Friday only — every other day', () => {
    expect(SITE_ANALYTICS_CADENCE_DAYS).toBe(2);
    expect(SITE_ANALYTICS_FIRST_SPRINT_INDEX).toBe(1);
    expect(isSiteAnalyticsSubmitWeekday('2026-09-07')).toBe(true);
    expect(isSiteAnalyticsSubmitWeekday('2026-09-08')).toBe(false);
    expect(siteAnalyticsDueIsosForWindow('2026-09-07', '2026-09-13')).toEqual([
      '2026-09-07',
      '2026-09-09',
      '2026-09-11',
    ]);
    expect(nextSiteAnalyticsDueIso('2026-09-07')).toBe('2026-09-09');
    expect(siteAnalyticsIsDue('2026-09-07', '2026-09-08')).toBe(false);
    expect(siteAnalyticsIsDue('2026-09-07', '2026-09-09')).toBe(true);
  });

  it('builds a gather task and an associated review task for each platform on each MWF', () => {
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
      dueDate: '2026-09-07',
      sprint: 'Sprint 1',
      groupId: 'analytics-2026-09-07-facebook',
    });
    expect(seeds.find((row) => row.id === `t-${SITE_ANALYTICS_TASK_START_NUMBER + 1}`)).toMatchObject({
      assignee: 'evelyn',
      dueDate: '2026-09-07',
      sprint: 'Sprint 1',
      groupId: 'analytics-2026-09-07-facebook',
    });
    expect(siteAnalyticsTaskById('t-83')?.title).toMatch(/Gather Facebook analytics/);
    expect(siteAnalyticsTaskById('t-84')?.title).toMatch(/Review Facebook analytics/);
    const facebookGather = siteAnalyticsContentSeed('t-83');
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
