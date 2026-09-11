import { GEAR_SALES_BUDGET_TOTAL, GEAR_SALES_LINE_ITEMS_SEED } from './gearSalesPlan';

/** Personal Facebook following Angela named for organic reach (6.2K). */
export const ORGANIC_FACEBOOK_FOLLOWERS = 6_200;
export const ORGANIC_FACEBOOK_FOLLOWERS_LABEL = '6.2K';
export const ORGANIC_POSTS_PER_WEEK = 5;
export const ORGANIC_ONLY_NOTE =
  'Angela sells only through regular social posts — no paid ads. These numbers are a forecast from her 6,200 personal Facebook friends and followers. They are an estimate, not a promise, and not a product code.';

export const SPRINT_ROI_HEADING = 'Sprint ROI — expected hoodie sales from Facebook';

export const SPRINT_ROI_GLOSSARY_TITLE = 'What these words mean';

export const SPRINT_ROI_GLOSSARY: Array<{ term: string; meaning: string }> = [
  {
    term: 'Why a week can show $10 when a hoodie is $55',
    meaning:
      'A customer still pays about $55. The $10 on a sprint card is not a cheaper hoodie and not a product name. Most weeks nobody buys. Some weeks someone buys one hoodie. The model averages those weeks, so a slow week looks like a small dollar number.',
  },
  {
    term: 'Hoodie price and leftover',
    meaning:
      'Live hoodie price is about $55. Cost to make is about $35. About $20 is left on each hoodie before the 70/30 split and before the $10,000 build fee.',
  },
  {
    term: 'Less than 1 order',
    meaning:
      'Most weeks the model expects fewer than one buyer. Nobody buys a piece of a hoodie. You might sell none this week and one next week. The average is “less than 1.”',
  },
  {
    term: '5% buy rate',
    meaning:
      'Of people who click the shop, we assume 5 out of 100 buy. That is why the weekly order count stays small.',
  },
  {
    term: 'Units',
    meaning: 'All items sold that week: hoodies + shirts + hats. Most of those items are hoodies.',
  },
  {
    term: 'Build fee this sprint',
    meaning:
      'Evelyn’s Phase 1 work for that week (part of the $10,000). It is not the $35 cost to make a hoodie.',
  },
  {
    term: 'Net',
    meaning:
      'Money left after blanks, print, store fees, and shipping. It does not subtract the $10,000 build fee.',
  },
  {
    term: 'ROI',
    meaning:
      'Compares leftover product money to Evelyn’s sprint build fee. Hoodie sales will not pay back the $10,000 during Phase 1.',
  },
];

export const SPRINT_ROI_FUNNEL_TITLE = 'How we get from 6,200 followers to a hoodie';

/** Unique weekly reach of the follower base after overlap across posts. */
export const ORGANIC_UNIQUE_WEEKLY_REACH_RATE = 0.08;
/** Clicks through to Shop Gear from people who saw a post. */
export const ORGANIC_CLICK_RATE = 0.03;
/** Purchase rate among clicks — warmer personal-network traffic. */
export const ORGANIC_CONVERSION_RATE = 0.05;
/** First-drop prices. Hoodies are what is selling. */
export const TEE_PRICE = 38;
export const HOODIE_PRICE = 55;
export const HOODIE_COST = 35;
export const HOODIE_LEFTOVER = HOODIE_PRICE - HOODIE_COST;
export const HAT_PRICE = 32;
/** Share of organic units. Live sales lead with hoodies. */
export const ORGANIC_HOODIE_MIX = 0.7;
export const ORGANIC_TEE_MIX = 0.2;
export const ORGANIC_HAT_MIX = 0.1;
/** Mix of $55 hoodie / $38 tee / $32 hat. */
export const ORGANIC_AVERAGE_ORDER_VALUE =
  Math.round((TEE_PRICE * ORGANIC_TEE_MIX + HOODIE_PRICE * ORGANIC_HOODIE_MIX + HAT_PRICE * ORGANIC_HAT_MIX) * 100) /
  100;
/** Hoodie leftover ÷ price (~$20 of $55). Not Angela’s $10K build fee. */
export const ORGANIC_CONTRIBUTION_MARGIN =
  Math.round((HOODIE_LEFTOVER / HOODIE_PRICE) * 100) / 100;

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
  expectedHoodieRevenue: number;
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
  lever: 'hoodies' | 'reach' | 'clicks' | 'conversion' | 'repeats';
}

/** Actions that lift organic hoodie sales without paid ads. */
export const ROI_LEVER_LABELS: Record<RoiImprovementSuggestion['lever'], string> = {
  hoodies: 'Hoodies',
  reach: 'Who sees the post',
  clicks: 'Who clicks the shop',
  conversion: 'Who buys',
  repeats: 'Second order',
};

export const ROI_IMPROVEMENT_SUGGESTIONS: RoiImprovementSuggestion[] = [
  {
    id: 'hoodies-first',
    title: 'Lead every shop post with the $55 hoodie',
    suggestion:
      'Hoodies are what is selling. Show the hoodie photo and the $55 price first. About 7 out of 10 items in this forecast are hoodies.',
    lever: 'hoodies',
  },
  {
    id: 'cadence',
    title: 'Post five times a week',
    suggestion:
      'The forecast assumes five posts each week. Skip a day and fewer people see the shop, so that week’s hoodie estimate drops.',
    lever: 'reach',
  },
  {
    id: 'shop-link',
    title: 'Put the shop link in every post',
    suggestion:
      'About 3 out of 100 people who see a post click the shop. Shop Gear is live. A post without the shop link cannot sell a hoodie.',
    lever: 'clicks',
  },
  {
    id: 'tiktok-youtube',
    title: 'Add TikTok and YouTube Shorts the same week',
    suggestion:
      'This forecast only counts Angela’s 6,200 Facebook people. The same clip on TikTok and YouTube can bring extra shoppers the $10,000 fee does not currently count.',
    lever: 'reach',
  },
  {
    id: 'stories',
    title: 'Reshare the hoodie on weekend Stories',
    suggestion:
      'Sunday Stories are already on the Content Factory calendar. Crop the hoodie graphic so more of the same 6,200 people see it without a new photo shoot.',
    lever: 'reach',
  },
  {
    id: 'on-body',
    title: 'Angela wears the hoodie on camera',
    suggestion:
      'More people buy when Angela is wearing the hoodie, not when the post is only a flat mockup.',
    lever: 'conversion',
  },
  {
    id: 'repeats',
    title: 'Ask the first buyer about a second color',
    suggestion:
      'Even 90 days of Facebook-only selling is still only a handful of hoodies. After the first order, a store email for a second color or slogan is the cheapest next sale.',
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

export function formatShirtCount(value: number, noun = 'hoodie'): string {
  const n = Math.max(0, value);
  if (n === 0) return `0 ${noun}s`;
  if (n < 0.75) return `less than 1 ${noun}`;
  if (n < 1.5) return `about 1 ${noun}`;
  return `about ${Math.round(n)} ${noun}s`;
}

export function describeSprintSellingWindow(weeks: number): string {
  if (weeks <= 0) return 'No selling days counted in this sprint.';
  if (weeks < 1) {
    return 'About half a week of selling. Sprint 0 is a short start week, so the hoodie estimate is smaller than a full week.';
  }
  if (weeks === 1) return 'One full week of selling.';
  return `${weeks} weeks of selling.`;
}

export function formatUsd(value: number): string {
  const rounded = Math.round(Math.max(0, value));
  return `$${rounded.toLocaleString()}`;
}

export function organicFunnelSteps(
  followers = ORGANIC_FACEBOOK_FOLLOWERS,
): Array<{ label: string; detail: string }> {
  const saw = Math.round(followers * ORGANIC_UNIQUE_WEEKLY_REACH_RATE);
  const clicked = Math.round(followers * ORGANIC_UNIQUE_WEEKLY_REACH_RATE * ORGANIC_CLICK_RATE);
  const bought = organicWeeklyOrders(followers);
  return [
    {
      label: 'Followers',
      detail: `Start with ${followers.toLocaleString()} people on Angela’s personal Facebook.`,
    },
    {
      label: 'See a post',
      detail: `About 8% see a post in a given week — roughly ${saw.toLocaleString()} people.`,
    },
    {
      label: 'Click the shop',
      detail: `About 3% of those click the shop link — roughly ${clicked} people.`,
    },
    {
      label: 'Buy',
      detail: `About 5 out of 100 of those clickers buy. That is ${formatShirtCount(bought, 'order')} per full week.`,
    },
  ];
}

export function sprintRoiPlainLines(row: SprintRoiRow): Array<{ label: string; value: string }> {
  return [
    { label: 'Selling time', value: describeSprintSellingWindow(row.sellingWeeks) },
    {
      label: 'Hoodies we expect people to buy',
      value: `${formatShirtCount(row.expectedHoodieUnits)} · ${formatUsd(row.expectedHoodieRevenue)} at about $55 each`,
    },
    {
      label: 'Shirts and hats in the same mix',
      value: `${formatShirtCount(row.expectedTeeUnits, 'shirt')} · ${formatShirtCount(row.expectedHatUnits, 'hat')}`,
    },
    {
      label: 'All items together',
      value: `${formatShirtCount(row.expectedUnits, 'item')} · ${formatUsd(row.expectedRevenue)} in product sales`,
    },
    {
      label: 'Left after print and shipping',
      value: `${formatUsd(row.expectedNet)} (this is not profit after the $10,000 build fee)`,
    },
    {
      label: 'Build fee this sprint',
      value: `${formatUsd(row.investment)} of the $10,000 Phase 1 work`,
    },
  ];
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

export function hoodieRevenueFromUnits(hoodieUnits: number): number {
  return roundMoney(Math.max(0, hoodieUnits) * HOODIE_PRICE);
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
    note: 'Shop Gear is already open. This is only about half a week of selling, so the hoodie number is smaller than later sprints. Soft-sell Angela’s Facebook now. TikTok and Instagram can start in parallel — they do not have to be finished before a hoodie can sell.',
  },
  sprint1: {
    label: 'Sprint 1',
    sellingWeeks: 1,
    note: 'A full week of selling. Angela can wear the hoodie on live. Picking designs does not pause the shop. Expect less than one $55 hoodie from Facebook this week.',
  },
  sprint2: {
    label: 'Sprint 2',
    sellingWeeks: 1,
    note: 'Another full week of the same Facebook selling. Shirt and hat pages can catch up, but the forecast still assumes most orders are hoodies. New channels help Facebook; they do not replace it.',
  },
  sprint3: {
    label: 'Sprint 3',
    sellingWeeks: 1,
    note: 'Launch pages go out beside the live shop. Orders stay on SnatchVault (my-plan-gear, Non-Negotiable menu). Every post still needs the shop link. Hoodie sales stay Facebook-organic — still less than one hoodie this week in the model.',
  },
  sprint4: {
    label: 'Sprint 4',
    sellingWeeks: 1,
    note: 'Launch-week lives wearing the hoodie. Same 6,200 Facebook people, still no paid ads. Most weeks still sell fewer than one hoodie unless more people see the post or more clickers buy.',
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
    expectedHoodieRevenue: hoodieRevenueFromUnits(split.hoodie),
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
  expectedHoodieUnits: number;
  expectedHoodieRevenue: number;
  expectedRevenue: number;
  expectedNet: number;
  roiPercent: number;
  trailing90DayUnits: number;
  trailing90DayRevenue: number;
  trailing90DayTeeUnits: number;
  trailing90DayTeeRevenue: number;
  trailing90DayHoodieUnits: number;
  trailing90DayHoodieRevenue: number;
} {
  const rows = sprintRoiRows(weeklyOrders);
  const expectedUnits = roundMoney(rows.reduce((sum, row) => sum + row.expectedUnits, 0));
  const expectedTeeUnits = roundMoney(rows.reduce((sum, row) => sum + row.expectedTeeUnits, 0));
  const expectedTeeRevenue = roundMoney(rows.reduce((sum, row) => sum + row.expectedTeeRevenue, 0));
  const expectedHoodieUnits = roundMoney(rows.reduce((sum, row) => sum + row.expectedHoodieUnits, 0));
  const expectedHoodieRevenue = roundMoney(rows.reduce((sum, row) => sum + row.expectedHoodieRevenue, 0));
  const expectedRevenue = roundMoney(rows.reduce((sum, row) => sum + row.expectedRevenue, 0));
  const expectedNet = roundMoney(rows.reduce((sum, row) => sum + row.expectedNet, 0));
  const trailingUnitsRaw = weeklyOrders * 13;
  const trailingSplit = splitOrganicUnits(trailingUnitsRaw);
  return {
    investment: GEAR_SALES_BUDGET_TOTAL,
    expectedUnits,
    expectedTeeUnits,
    expectedTeeRevenue,
    expectedHoodieUnits,
    expectedHoodieRevenue,
    expectedRevenue,
    expectedNet,
    roiPercent: roiPercent(GEAR_SALES_BUDGET_TOTAL, expectedNet),
    trailing90DayUnits: roundMoney(trailingUnitsRaw),
    trailing90DayRevenue: roundMoney(trailingUnitsRaw * ORGANIC_AVERAGE_ORDER_VALUE),
    trailing90DayTeeUnits: trailingSplit.tee,
    trailing90DayTeeRevenue: teeRevenueFromUnits(trailingSplit.tee),
    trailing90DayHoodieUnits: trailingSplit.hoodie,
    trailing90DayHoodieRevenue: hoodieRevenueFromUnits(trailingSplit.hoodie),
  };
}

export function sprintRoiById(
  id: string,
  rows: SprintRoiRow[] = sprintRoiRows(),
): SprintRoiRow | undefined {
  return rows.find((row) => row.id === id);
}
