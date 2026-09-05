import { GEAR_SALES_BUDGET_TOTAL, GEAR_SALES_LINE_ITEMS_SEED } from './gearSalesPlan';

/** Personal Facebook following Angela named for organic reach (6.2K). */
export const ORGANIC_FACEBOOK_FOLLOWERS = 6_200;
export const ORGANIC_FACEBOOK_FOLLOWERS_LABEL = '6.2K';
export const ORGANIC_POSTS_PER_WEEK = 5;
export const ORGANIC_ONLY_NOTE =
  'Angela is organic-only — no paid ads. Reach is modeled from her personal Facebook (6.2K followers) and a fairly active posting cadence.';

/** Unique weekly reach of the follower base after overlap across posts. */
export const ORGANIC_UNIQUE_WEEKLY_REACH_RATE = 0.08;
/** Clicks through to Shop Gear from people who saw a post. */
export const ORGANIC_CLICK_RATE = 0.03;
/** Purchase rate among clicks — warmer personal-network traffic. */
export const ORGANIC_CONVERSION_RATE = 0.05;
/** First-drop prices. Tees are the volume SKU. */
export const TEE_PRICE = 38;
export const HOODIE_PRICE = 68;
export const HAT_PRICE = 32;
/** Share of organic units. First drop leads with tees. */
export const ORGANIC_TEE_MIX = 0.7;
export const ORGANIC_HOODIE_MIX = 0.15;
export const ORGANIC_HAT_MIX = 0.15;
/** Mix of $38 tee / $32 hat / $68 hoodie. */
export const ORGANIC_AVERAGE_ORDER_VALUE =
  Math.round((TEE_PRICE * ORGANIC_TEE_MIX + HOODIE_PRICE * ORGANIC_HOODIE_MIX + HAT_PRICE * ORGANIC_HAT_MIX) * 100) /
  100;
/** After blanks, print, Shopify, and shipping — not Angela’s $10K build fee. */
export const ORGANIC_CONTRIBUTION_MARGIN = 0.4;

export type SprintRoiId = 'sprint0' | 'sprint1' | 'sprint2' | 'sprint3' | 'sprint4';

export interface OrganicUnitSplit {
  tee: number;
  hoodie: number;
  hat: number;
}

export interface SprintRoiRow {
  id: SprintRoiId;
  label: string;
  investment: number;
  sellingWeeks: number;
  expectedUnits: number;
  expectedTeeUnits: number;
  expectedTeeRevenue: number;
  expectedHoodieUnits: number;
  expectedHatUnits: number;
  expectedRevenue: number;
  expectedNet: number;
  roiPercent: number;
  note: string;
}

export interface RoiImprovementSuggestion {
  id: string;
  title: string;
  suggestion: string;
  lever: 'tees' | 'reach' | 'clicks' | 'conversion' | 'repeats';
}

/** Actions that lift organic tee sales without paid ads. */
export const ROI_IMPROVEMENT_SUGGESTIONS: RoiImprovementSuggestion[] = [
  {
    id: 'tees-first',
    title: 'Lead every shop CTA with the $38 tee',
    suggestion:
      'Model 70% of organic units as tees. Put the tee mockup and $38 price in Facebook, TikTok, and YouTube before the hoodie.',
    lever: 'tees',
  },
  {
    id: 'cadence',
    title: 'Do not skip the 5-post week',
    suggestion:
      'The model assumes 5 organic posts per week. Missed days cut unique reach (8%) and expected tee sales in the same week.',
    lever: 'reach',
  },
  {
    id: 'shop-link',
    title: 'Put the shop link in every post starting now',
    suggestion: 'Click-through is modeled at 3%. Shop Gear is live. A post without nonnegotiation.com/gear cannot convert a tee.',
    lever: 'clicks',
  },
  {
    id: 'tiktok-youtube',
    title: 'Add TikTok and YouTube Shorts to the same week',
    suggestion:
      'Facebook 6.2K is the only reach in this model. The same scene packet posted 9:16 to TikTok and YouTube the same day adds reach the $10K fee does not currently buy.',
    lever: 'reach',
  },
  {
    id: 'stories',
    title: 'Weekend Stories reshare the tee',
    suggestion:
      'Sunday Stories are already on the Content Factory calendar. Crop the tee graphic for extra unique reach without a new shoot.',
    lever: 'reach',
  },
  {
    id: 'on-body',
    title: 'Angela on-camera in the tee',
    suggestion:
      'Personal-network conversion (5%) is warmer when the wearer is Angela, not a flat mockup.',
    lever: 'conversion',
  },
  {
    id: 'repeats',
    title: 'Use Shopify order email for the second tee',
    suggestion:
      'Trailing 90-day organic is still only a handful of tees. A post-purchase email (second color or second slogan) is the cheapest lift after the first order.',
    lever: 'repeats',
  },
];

export function organicWeeklyOrders(
  followers = ORGANIC_FACEBOOK_FOLLOWERS,
  uniqueReachRate = ORGANIC_UNIQUE_WEEKLY_REACH_RATE,
  clickRate = ORGANIC_CLICK_RATE,
  conversionRate = ORGANIC_CONVERSION_RATE,
): number {
  return Math.max(0, followers) * uniqueReachRate * clickRate * conversionRate;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roiPercent(investment: number, expectedNet: number): number {
  if (investment <= 0) return 0;
  return roundMoney(((expectedNet - investment) / investment) * 100);
}

export function formatRoiPercent(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}%`;
  return `${rounded}%`;
}

export function formatExpectedUnits(value: number): string {
  if (value === 0) return '0';
  if (Math.abs(value) < 10) return value.toFixed(1);
  return String(Math.round(value));
}

export function splitOrganicUnits(totalUnits: number): OrganicUnitSplit {
  const safe = Math.max(0, totalUnits);
  return {
    tee: roundMoney(safe * ORGANIC_TEE_MIX),
    hoodie: roundMoney(safe * ORGANIC_HOODIE_MIX),
    hat: roundMoney(safe * ORGANIC_HAT_MIX),
  };
}

export function teeRevenueFromUnits(teeUnits: number): number {
  return roundMoney(Math.max(0, teeUnits) * TEE_PRICE);
}

export function roiImprovementBlob(
  suggestions: RoiImprovementSuggestion[] = ROI_IMPROVEMENT_SUGGESTIONS,
): string {
  return suggestions.map((row) => `${row.title} ${row.suggestion} ${row.lever}`).join(' ').toLowerCase();
}

function sprintInvestment(id: SprintRoiId): number {
  return GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === id)?.baseAmount ?? 0;
}

const SPRINT_ROI_META: Record<
  SprintRoiId,
  { label: string; sellingWeeks: number; note: string }
> = {
  sprint0: {
    label: 'Sprint 0',
    sellingWeeks: 0.5,
    note: 'Shop Gear is live. Soft-sell Angela’s 6.2K Facebook now. Samples are on order. Socials are parallel, not a gate.',
  },
  sprint1: {
    label: 'Sprint 1',
    sellingWeeks: 1,
    note: 'Selling continues. Angela’s samples arrive. First on-body live. Design picks do not pause the shop.',
  },
  sprint2: {
    label: 'Sprint 2',
    sellingWeeks: 1,
    note: 'Full week of organic selling. Hoodie/hat pages catch up. New channels amplify Facebook, they do not replace it.',
  },
  sprint3: {
    label: 'Sprint 3',
    sellingWeeks: 1,
    note: 'Launch pages and order email ride beside the live shop. Every post still sells tees.',
  },
  sprint4: {
    label: 'Sprint 4',
    sellingWeeks: 1,
    note: 'Launch-week lives wearing the sample tee. Same organic Facebook reach; no paid ads.',
  },
};

export function buildSprintRoiRow(
  id: SprintRoiId,
  weeklyOrders = organicWeeklyOrders(),
): SprintRoiRow {
  const meta = SPRINT_ROI_META[id];
  const investment = sprintInvestment(id);
  const expectedUnits = roundMoney(weeklyOrders * meta.sellingWeeks);
  const split = splitOrganicUnits(expectedUnits);
  const expectedRevenue = roundMoney(expectedUnits * ORGANIC_AVERAGE_ORDER_VALUE);
  const expectedNet = roundMoney(expectedRevenue * ORGANIC_CONTRIBUTION_MARGIN);
  return {
    id,
    label: meta.label,
    investment,
    sellingWeeks: meta.sellingWeeks,
    expectedUnits,
    expectedTeeUnits: split.tee,
    expectedTeeRevenue: teeRevenueFromUnits(split.tee),
    expectedHoodieUnits: split.hoodie,
    expectedHatUnits: split.hat,
    expectedRevenue,
    expectedNet,
    roiPercent: roiPercent(investment, expectedNet),
    note: meta.note,
  };
}

export const SPRINT_ROI_IDS: SprintRoiId[] = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4'];

export function sprintRoiRows(weeklyOrders = organicWeeklyOrders()): SprintRoiRow[] {
  return SPRINT_ROI_IDS.map((id) => buildSprintRoiRow(id, weeklyOrders));
}

export function phase1OrganicRoi(weeklyOrders = organicWeeklyOrders()): {
  investment: number;
  expectedUnits: number;
  expectedTeeUnits: number;
  expectedTeeRevenue: number;
  expectedRevenue: number;
  expectedNet: number;
  roiPercent: number;
  trailing90DayUnits: number;
  trailing90DayRevenue: number;
  trailing90DayTeeUnits: number;
  trailing90DayTeeRevenue: number;
} {
  const rows = sprintRoiRows(weeklyOrders);
  const expectedUnits = roundMoney(rows.reduce((sum, row) => sum + row.expectedUnits, 0));
  const expectedTeeUnits = roundMoney(rows.reduce((sum, row) => sum + row.expectedTeeUnits, 0));
  const expectedTeeRevenue = roundMoney(rows.reduce((sum, row) => sum + row.expectedTeeRevenue, 0));
  const expectedRevenue = roundMoney(rows.reduce((sum, row) => sum + row.expectedRevenue, 0));
  const expectedNet = roundMoney(rows.reduce((sum, row) => sum + row.expectedNet, 0));
  const trailingUnitsRaw = weeklyOrders * 13;
  const trailingSplit = splitOrganicUnits(trailingUnitsRaw);
  return {
    investment: GEAR_SALES_BUDGET_TOTAL,
    expectedUnits,
    expectedTeeUnits,
    expectedTeeRevenue,
    expectedRevenue,
    expectedNet,
    roiPercent: roiPercent(GEAR_SALES_BUDGET_TOTAL, expectedNet),
    trailing90DayUnits: roundMoney(trailingUnitsRaw),
    trailing90DayRevenue: roundMoney(trailingUnitsRaw * ORGANIC_AVERAGE_ORDER_VALUE),
    trailing90DayTeeUnits: trailingSplit.tee,
    trailing90DayTeeRevenue: teeRevenueFromUnits(trailingSplit.tee),
  };
}

export function sprintRoiById(
  id: string,
  rows: SprintRoiRow[] = sprintRoiRows(),
): SprintRoiRow | undefined {
  return rows.find((row) => row.id === id);
}
