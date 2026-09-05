/**
 * Week-by-week bars for the posting calendar.
 * Organic-only. Personal Facebook 6.2K is the reach engine.
 * Brand pages (NonNegotiation FB / IG / TikTok / YouTube) start near zero.
 */

import { PHASE_1_CONTENT_FACTORY, type ContentFactoryItem } from './contentFactory';
import { sprintWindowById, type CoreSprintId } from './sprintCalendar';
import {
  ORGANIC_AVERAGE_ORDER_VALUE,
  ORGANIC_CLICK_RATE,
  ORGANIC_CONVERSION_RATE,
  ORGANIC_FACEBOOK_FOLLOWERS,
  ORGANIC_UNIQUE_WEEKLY_REACH_RATE,
  roundMoney,
  splitOrganicUnits,
} from './sprintRoi';

export const SCORECARD_SECTION_ID = 'ip-sprint-scorecard';

export const SCORECARD_ASSUMPTIONS =
  'Organic only — no paid ads. Reach is 8% of Angela’s personal Facebook each week. Shop clicks are 3% of that reach. Orders are 5% of clicks, then scaled by that week’s posting (photos vs live vs on-body). Engagement is 2.5% of weekly reach. Brand-page followers start at 0. Organic is lumpy: a zero-order week can still be on track if two-week sales hit the sprint bar.';

export const ENGAGEMENT_RATE_OF_REACH = 0.025;
export const COMMENT_RATE_OF_REACH = 0.004;
export const SHARE_RATE_OF_REACH = 0.003;

export type ScorecardWeekId = 's0w1' | 's0w2' | 's1' | 's2' | 's3' | 's4';
export type LiveKind = 'none' | 'photo' | 'on-body';

export interface ScorecardBand {
  min: number;
  target: number;
  stretch: number;
}

export interface ScorecardMetric extends ScorecardBand {
  id: string;
  label: string;
  unit: 'count' | 'usd';
  howToMeasure: string;
}

export interface WeekScorecard {
  id: ScorecardWeekId;
  sprintId: CoreSprintId;
  sprintLabel: string;
  weekLabel: string;
  startIso: string;
  endIso: string;
  dates: string;
  retroIso: string;
  postsPlanned: number;
  livesPlanned: number;
  liveKind: LiveKind;
  startingPersonalFb: number;
  endingPersonalFb: number;
  startingBrandEach: number;
  endingBrandEach: number;
  uniqueReach: number;
  metrics: ScorecardMetric[];
  note: string;
}

export interface SprintScorecardRollup {
  sprintId: CoreSprintId;
  label: string;
  dates: string;
  postsPlanned: number;
  livesPlanned: number;
  orders: ScorecardBand;
  revenue: ScorecardBand;
  personalFbEnd: number;
  brandEachEnd: number;
}

type WeekSpec = {
  id: ScorecardWeekId;
  sprintId: CoreSprintId;
  weekIndex: 0 | 1;
  weekLabel: string;
  intensity: number;
  growth: number;
  liveKind: LiveKind;
  liveViewRate: number;
  brandGain: number;
  note: string;
};

const WEEK_SPECS: WeekSpec[] = [
  {
    id: 's0w1',
    sprintId: 'sprint0',
    weekIndex: 0,
    weekLabel: 'Week 1',
    intensity: 0.75,
    growth: 0.0025,
    liveKind: 'none',
    liveViewRate: 0,
    brandGain: 15,
    note: 'Paused week. Content Factory posting starts Friday Sep 4 (Sprint 0 week 2).',
  },
  {
    id: 's0w2',
    sprintId: 'sprint0',
    weekIndex: 1,
    weekLabel: 'Week 2',
    intensity: 1,
    growth: 0.005,
    liveKind: 'photo',
    liveViewRate: 0.016,
    brandGain: 25,
    note: 'Posting starts Friday Sep 4: one welcome per platform (house + brand). Cadence resumes Saturday. Shop link in every post.',
  },
  {
    id: 's1',
    sprintId: 'sprint1',
    weekIndex: 0,
    weekLabel: 'Week 1',
    intensity: 1.25,
    growth: 0.008,
    liveKind: 'on-body',
    liveViewRate: 0.026,
    brandGain: 40,
    note: 'First live wearing the tee. On-body clip to personal + NonNegotiation. Keep selling while picks finish.',
  },
  {
    id: 's2',
    sprintId: 'sprint2',
    weekIndex: 0,
    weekLabel: 'Week 1',
    intensity: 1.1,
    growth: 0.006,
    liveKind: 'none',
    liveViewRate: 0,
    brandGain: 50,
    note: 'Tee, hoodie, and hat CTAs. Same Shop Gear URL. New channels amplify Facebook; they do not replace it.',
  },
  {
    id: 's3',
    sprintId: 'sprint3',
    weekIndex: 0,
    weekLabel: 'Week 1',
    intensity: 1,
    growth: 0.005,
    liveKind: 'none',
    liveViewRate: 0,
    brandGain: 40,
    note: 'About / FAQ posts still sell. Cadence holds. Do not drop the shop link.',
  },
  {
    id: 's4',
    sprintId: 'sprint4',
    weekIndex: 0,
    weekLabel: 'Week 1',
    intensity: 1.25,
    growth: 0.01,
    liveKind: 'on-body',
    liveViewRate: 0.03,
    brandGain: 80,
    note: 'Launch-week selling on the same organic Facebook. Live views stay 0 unless a live is on the calendar. Stretch is a strong posting week, not ads.',
  },
];

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number): string {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

function formatDates(startIso: string, endIso: string): string {
  const start = parseIso(startIso);
  const end = parseIso(endIso);
  const fmt = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

export function scorecardWeekWindow(spec: Pick<WeekSpec, 'sprintId' | 'weekIndex'>): {
  startIso: string;
  endIso: string;
} {
  const sprint = sprintWindowById(spec.sprintId);
  const startIso = sprint?.startIso ?? '2026-08-24';
  const endIso = sprint?.endIso ?? addDays(startIso, 6);
  if (spec.sprintId !== 'sprint0') return { startIso, endIso };
  const weekStart = addDays(startIso, spec.weekIndex * 7);
  return { startIso: weekStart, endIso: addDays(weekStart, 6) };
}

function inRange(iso: string, startIso: string, endIso: string): boolean {
  return iso >= startIso && iso <= endIso;
}

export function isLiveContentRow(item: Pick<ContentFactoryItem, 'kind' | 'title'>): boolean {
  if (item.kind !== 'post') return false;
  return /(?:go live|live wearing|first live|on-body live)/i.test(item.title);
}

export function plannedPostsInRange(
  startIso: string,
  endIso: string,
  items: ContentFactoryItem[] = PHASE_1_CONTENT_FACTORY,
): ContentFactoryItem[] {
  return items.filter((item) => item.kind === 'post' && inRange(item.dateIso, startIso, endIso));
}

function band(target: number, floor = 0.6, ceil = 1.5): ScorecardBand {
  const safe = Math.max(0, target);
  return {
    min: roundMoney(safe * floor),
    target: roundMoney(safe),
    stretch: roundMoney(safe * ceil),
  };
}

function countBand(target: number, floor = 0.6, ceil = 1.5): ScorecardBand {
  const safe = Math.max(0, target);
  return {
    min: Math.max(0, Math.round(safe * floor)),
    target: Math.round(safe),
    stretch: Math.round(safe * ceil),
  };
}

function metric(
  id: string,
  label: string,
  unit: ScorecardMetric['unit'],
  howToMeasure: string,
  values: ScorecardBand,
): ScorecardMetric {
  return { id, label, unit, howToMeasure, ...values };
}

export function formatScorecardNumber(value: number, unit: 'count' | 'usd' = 'count'): string {
  if (unit === 'usd') {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  }
  if (value !== 0 && Math.abs(value) < 10 && !Number.isInteger(value)) return value.toFixed(1);
  return String(Math.round(value));
}

export function buildWeekScorecards(
  items: ContentFactoryItem[] = PHASE_1_CONTENT_FACTORY,
  startingFollowers = ORGANIC_FACEBOOK_FOLLOWERS,
): WeekScorecard[] {
  let personalFb = startingFollowers;
  let brandEach = 0;
  return WEEK_SPECS.map((spec) => {
    const window = scorecardWeekWindow(spec);
    const posts = plannedPostsInRange(window.startIso, window.endIso, items);
    const lives = posts.filter(isLiveContentRow);
    const liveKind: LiveKind = lives.length === 0 ? 'none' : spec.liveKind;
    const uniqueReach = Math.round(personalFb * ORGANIC_UNIQUE_WEEKLY_REACH_RATE);
    const clicks = uniqueReach * ORGANIC_CLICK_RATE;
    const orders = roundMoney(clicks * ORGANIC_CONVERSION_RATE * spec.intensity);
    const revenue = roundMoney(orders * ORGANIC_AVERAGE_ORDER_VALUE);
    const split = splitOrganicUnits(orders);
    const engagements = Math.round(uniqueReach * ENGAGEMENT_RATE_OF_REACH);
    const comments = Math.round(uniqueReach * COMMENT_RATE_OF_REACH);
    const shares = Math.round(uniqueReach * SHARE_RATE_OF_REACH);
    const liveViews = liveKind === 'none' ? 0 : Math.round(personalFb * spec.liveViewRate);
    const fbGain = Math.max(1, Math.round(personalFb * spec.growth));
    const endingPersonalFb = personalFb + fbGain;
    const endingBrandEach = brandEach + spec.brandGain;
    const cadenceTarget = Math.max(posts.length, 5);

    const row: WeekScorecard = {
      id: spec.id,
      sprintId: spec.sprintId,
      sprintLabel: spec.sprintId === 'sprint0' ? 'Sprint 0' : `Sprint ${spec.sprintId.slice(-1)}`,
      weekLabel: spec.weekLabel,
      startIso: window.startIso,
      endIso: window.endIso,
      dates: formatDates(window.startIso, window.endIso),
      retroIso: window.endIso,
      postsPlanned: posts.length,
      livesPlanned: lives.length,
      liveKind,
      startingPersonalFb: personalFb,
      endingPersonalFb,
      startingBrandEach: brandEach,
      endingBrandEach,
      uniqueReach,
      metrics: [
        metric(
          'posts',
          'Public posts published',
          'count',
          'Content Factory rows marked done that week',
          {
            min: Math.max(1, posts.length - 1),
            target: posts.length,
            stretch: cadenceTarget,
          },
        ),
        metric(
          'reach',
          'Unique weekly reach (personal FB)',
          'count',
          'Facebook professional dashboard → Reach, unique people',
          countBand(uniqueReach, 0.7, 1.4),
        ),
        metric(
          'engagement',
          'Engagements (reactions + comments + shares)',
          'count',
          'Facebook post insights, summed for the week',
          countBand(engagements, 0.6, 1.6),
        ),
        metric(
          'comments',
          'Comments asking price / size / link',
          'count',
          'Count comments that mention the shop, a size, or a price',
          countBand(comments, 0.4, 2),
        ),
        metric(
          'shares',
          'Shares / reshares',
          'count',
          'Facebook shares + Stories reshares',
          countBand(shares, 0.4, 2),
        ),
        metric(
          'live-views',
          'Live views (if a live is on the calendar)',
          'count',
          'Facebook / Instagram live replay views',
          liveKind === 'none'
            ? { min: 0, target: 0, stretch: 0 }
            : countBand(liveViews, 0.6, 1.8),
        ),
        metric(
          'clicks',
          'Shop Gear clicks',
          'count',
          'Shopify / link-in-bio clicks, or Facebook outbound clicks to /gear',
          countBand(clicks, 0.5, 1.6),
        ),
        metric(
          'orders',
          'Orders (mostly $38 tees)',
          'count',
          'Shopify orders this week. 0 is possible; judge the sprint total.',
          band(orders, 0.4, 2),
        ),
        metric(
          'tees',
          'Tee units',
          'count',
          'Shopify — tee SKUs only',
          band(split.tee, 0.4, 2),
        ),
        metric(
          'revenue',
          'Merchandise sales',
          'usd',
          'Shopify net sales (tees, hoodie, hat)',
          band(revenue, 0.4, 2),
        ),
        metric(
          'fb-followers',
          'Personal Facebook followers (end of week)',
          'count',
          'Angela’s personal Facebook follower count on Sunday',
          {
            min: personalFb,
            target: endingPersonalFb,
            stretch: endingPersonalFb + Math.round(fbGain * 0.8),
          },
        ),
        metric(
          'brand-followers',
          'Each NonNegotiation page (FB / IG / TikTok / YouTube)',
          'count',
          'Follower count on each brand page Sunday night. Pages start near 0.',
          {
            min: brandEach,
            target: endingBrandEach,
            stretch: endingBrandEach + Math.round(spec.brandGain * 0.5),
          },
        ),
      ],
      note: spec.note,
    };

    personalFb = endingPersonalFb;
    brandEach = endingBrandEach;
    return row;
  });
}

export function rollupSprintScorecards(
  weeks: WeekScorecard[] = buildWeekScorecards(),
): SprintScorecardRollup[] {
  const ids: CoreSprintId[] = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4'];
  return ids.map((sprintId) => {
    const rows = weeks.filter((week) => week.sprintId === sprintId);
    const first = rows[0];
    const last = rows[rows.length - 1];
    const orders = rows.reduce((sum, week) => sum + (week.metrics.find((m) => m.id === 'orders')?.target ?? 0), 0);
    const revenue = rows.reduce((sum, week) => sum + (week.metrics.find((m) => m.id === 'revenue')?.target ?? 0), 0);
    const sprint = sprintWindowById(sprintId);
    return {
      sprintId,
      label: first?.sprintLabel ?? sprintId,
      dates: sprint?.dates ?? `${first?.dates ?? ''}`.replace(/ ·.*/, ''),
      postsPlanned: rows.reduce((sum, week) => sum + week.postsPlanned, 0),
      livesPlanned: rows.reduce((sum, week) => sum + week.livesPlanned, 0),
      orders: band(orders, 0.4, 2),
      revenue: band(revenue, 0.4, 2),
      personalFbEnd: last?.endingPersonalFb ?? ORGANIC_FACEBOOK_FOLLOWERS,
      brandEachEnd: last?.endingBrandEach ?? 0,
    };
  });
}

export function scorecardByWeekId(
  id: ScorecardWeekId,
  weeks: WeekScorecard[] = buildWeekScorecards(),
): WeekScorecard | undefined {
  return weeks.find((week) => week.id === id);
}
