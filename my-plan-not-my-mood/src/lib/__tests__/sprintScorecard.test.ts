import { describe, expect, it } from 'vitest';
import { PHASE_1_CONTENT_FACTORY } from '../contentFactory';
import { ORGANIC_FACEBOOK_FOLLOWERS } from '../sprintRoi';
import {
  SCORECARD_ASSUMPTIONS,
  SCORECARD_SECTION_ID,
  buildWeekScorecards,
  formatScorecardNumber,
  isLiveContentRow,
  plannedPostsInRange,
  rollupSprintScorecards,
  scorecardByWeekId,
  scorecardWeekWindow,
} from '../sprintScorecard';

describe('sprintScorecard', () => {
  it('splits Sprint 0 into two weeks and keeps later sprints at one week', () => {
    expect(scorecardWeekWindow({ sprintId: 'sprint0', weekIndex: 0 })).toEqual({
      startIso: '2026-08-24',
      endIso: '2026-08-30',
    });
    expect(scorecardWeekWindow({ sprintId: 'sprint0', weekIndex: 1 })).toEqual({
      startIso: '2026-08-31',
      endIso: '2026-09-06',
    });
    expect(scorecardWeekWindow({ sprintId: 'sprint1', weekIndex: 0 })).toEqual({
      startIso: '2026-09-07',
      endIso: '2026-09-13',
    });
  });

  it('projects followers, engagement, clicks, and sales for every posting week', () => {
    const weeks = buildWeekScorecards();
    expect(weeks.map((week) => week.id)).toEqual(['s0w1', 's0w2', 's1', 's2', 's3', 's4']);
    expect(SCORECARD_ASSUMPTIONS).toMatch(/organic only/i);
    expect(SCORECARD_SECTION_ID).toBe('ip-sprint-scorecard');
    expect(weeks[0]?.startingPersonalFb).toBe(ORGANIC_FACEBOOK_FOLLOWERS);
    expect(weeks[0]?.postsPlanned).toBe(0);
    expect(weeks[0]?.livesPlanned).toBe(0);
    expect(weeks[0]?.metrics.find((m) => m.id === 'live-views')?.target).toBe(0);
    expect(weeks[1]?.postsPlanned).toBeGreaterThan(0);
    expect(weeks[1]?.endingPersonalFb).toBeGreaterThan(weeks[0]!.endingPersonalFb);
    expect(weeks[5]?.endingPersonalFb).toBeGreaterThan(weeks[0]!.startingPersonalFb);

    for (const week of weeks) {
      if (week.id === 's0w1') continue;
      expect(week.postsPlanned).toBeGreaterThan(0);
      expect(week.uniqueReach).toBeGreaterThan(0);
      const orders = week.metrics.find((m) => m.id === 'orders');
      const revenue = week.metrics.find((m) => m.id === 'revenue');
      const clicks = week.metrics.find((m) => m.id === 'clicks');
      const liveViews = week.metrics.find((m) => m.id === 'live-views');
      expect(orders?.target).toBeGreaterThan(0);
      expect(revenue?.target).toBeGreaterThan(0);
      expect(clicks?.target).toBeGreaterThan(0);
      expect(orders!.min).toBeLessThanOrEqual(orders!.target);
      expect(orders!.stretch).toBeGreaterThanOrEqual(orders!.target);
      if (week.liveKind === 'none') {
        expect(liveViews?.target).toBe(0);
      } else {
        expect(liveViews?.target).toBeGreaterThan(0);
      }
    }

    const onBody = scorecardByWeekId('s1', weeks);
    expect(onBody?.livesPlanned).toBeGreaterThan(0);
    expect(onBody?.liveKind).toBe('on-body');
    expect(onBody?.metrics.find((m) => m.id === 'live-views')?.target).toBeGreaterThan(
      weeks[1]!.metrics.find((m) => m.id === 'live-views')!.target,
    );

    const rollups = rollupSprintScorecards(weeks);
    expect(rollups).toHaveLength(5);
    expect(rollups[0]?.postsPlanned).toBe(weeks[0]!.postsPlanned + weeks[1]!.postsPlanned);
    expect(rollups[0]?.orders.target).toBeGreaterThan(weeks[0]!.metrics.find((m) => m.id === 'orders')!.target);
    expect(formatScorecardNumber(38, 'usd')).toMatch(/\$38/);
    expect(isLiveContentRow({ kind: 'post', title: 'Go live — pin Shop Gear' })).toBe(true);
    expect(plannedPostsInRange('2026-08-24', '2026-08-30', PHASE_1_CONTENT_FACTORY)).toHaveLength(0);
    expect(plannedPostsInRange('2026-09-04', '2026-09-06', PHASE_1_CONTENT_FACTORY).length).toBeGreaterThan(0);
  });
});
