/**
 * Public Beta Tester Rewards guide — modeled on GYSH’s credit guide,
 * adapted to My Plan, Not My Mood (Testing Portal priorities and Coming Soon memberships).
 */

import { PUBLIC_CONTACT_EMAIL } from './launchPages';
import type { WorkPriority } from './workBoard';

export const BETA_REWARDS_PATH = '/beta-rewards';
export const BETA_REWARDS_PATH_ALIASES = ['/beta-tester-rewards', '/beta-credits'] as const;

export const BETA_REWARDS_TITLE = 'Beta Tester Rewards';
export const BETA_REWARDS_KICKER = 'Beta Testing Program';
export const BETA_REWARDS_SUBTITLE =
  'How you earn Plan Credits for honest testing on My Plan, Not My Mood, and how those credits turn into recognition, gear, and future perks.';
export const BETA_REWARDS_META_TITLE = 'Beta Tester Rewards | My Plan, Not My Mood';
export const BETA_REWARDS_META_DESCRIPTION =
  'Earn Plan Credits for Pass, Fail, and re-test work in Testing Portal. See reward levels and how Angela and Evelyn fulfill perks.';
export const BETA_CREDIT_NAME = 'Plan Credits';

export const BETA_CREDIT_REWARDS: Record<WorkPriority, number> = {
  high: 10,
  medium: 5,
  low: 3,
};

export const BETA_REPRO_FAIL_BONUS = 5;
export const BETA_RETEST_BONUS = 5;

export const BETA_CREDIT_PRIORITY_ROWS: ReadonlyArray<{
  priority: WorkPriority;
  label: string;
  meaning: string;
  credits: number;
}> = [
  {
    priority: 'high',
    label: 'High',
    meaning: 'Show-stopper or high-complexity flows (accounts, checkout path, core tools)',
    credits: BETA_CREDIT_REWARDS.high,
  },
  {
    priority: 'medium',
    label: 'Medium',
    meaning: 'Core feature paths (launch pages, Content Factory, boards)',
    credits: BETA_CREDIT_REWARDS.medium,
  },
  {
    priority: 'low',
    label: 'Low',
    meaning: 'Polish, copy, and low-risk checks',
    credits: BETA_CREDIT_REWARDS.low,
  },
];

export type BetaCreditRule = {
  id: string;
  title: string;
  detail: string;
};

export const BETA_CREDIT_EARN_RULES: readonly BetaCreditRule[] = [
  {
    id: 'pass',
    title: 'Mark a test as Passed',
    detail:
      'Run every step, confirm the expected result, then set Passed in Testing Portal. Base credits post by case priority.',
  },
  {
    id: 'fail',
    title: 'File a documented Failed',
    detail:
      'Set Failed with notes another adult can follow (steps, expected vs actual, a screenshot when it helps). You still earn the base priority credits.',
  },
  {
    id: 'fail-bonus',
    title: 'First reproducible Fail bonus',
    detail: `The first reproducible Failed on a given test id earns an extra +${BETA_REPRO_FAIL_BONUS} ${BETA_CREDIT_NAME} (reviewed at sprint retro).`,
  },
  {
    id: 'retest',
    title: 'Re-test bonus',
    detail: `When a case comes back as Fixed/Retest or Failed/Retest after a development fix, completing that second pass earns +${BETA_RETEST_BONUS} ${BETA_CREDIT_NAME} on top of the priority amount.`,
  },
];

export const BETA_CREDIT_ZERO_STATUSES = ['Untested', 'In Progress', 'Blocked'] as const;

export const BETA_CREDIT_SPEND_RULES: readonly BetaCreditRule[] = [
  {
    id: 'recognition',
    title: 'Brand, gift & recognition',
    detail:
      'Angela owns the public thank-you: shout-outs, tester recognition, and any gift package announced for that testing round.',
  },
  {
    id: 'fulfillment',
    title: 'Credits, fulfillment & tracking',
    detail:
      'Evelyn maps earned Plan Credits to fulfillment and keeps the running total so testers can see what they have earned.',
  },
  {
    id: 'gear',
    title: 'Gear and early access',
    detail:
      'Rounds may include shop credit toward Accountability Gear or first look at a drop. Checkout still happens on SnatchVault when a physical gift is involved.',
  },
  {
    id: 'membership',
    title: 'Memberships (Coming Soon)',
    detail:
      'Join / Memberships is not open in Phase 1. Plan Credits do not buy a membership today. When member tools open, a later round may apply unused credits — we will say so on this page.',
  },
];

export type BetaRewardLevelDef = {
  id: string;
  label: string;
  minTests: number;
  blurb: string;
};

export const BETA_REWARD_LEVELS: readonly BetaRewardLevelDef[] = [
  {
    id: 'not_qualified',
    label: 'Not yet qualified',
    minTests: 0,
    blurb: 'Apply as a Beta Tester, wait for admin activation, and complete your first eligible test.',
  },
  {
    id: 'contributor',
    label: 'Contributor',
    minTests: 5,
    blurb: 'At least 5 eligible tests with useful notes or evidence.',
  },
  {
    id: 'regular',
    label: 'Regular',
    minTests: 15,
    blurb: 'Steady coverage across assigned cases this testing round.',
  },
  {
    id: 'champion',
    label: 'Champion',
    minTests: 40,
    blurb: 'High volume plus quality findings that move the brand site forward.',
  },
];

export const BETA_REWARDS_HOW_TO_JOIN = [
  'Create a site account and check Apply as a Beta Tester (or turn it on from your profile after you are a Free Member).',
  'An admin still activates your account before you can sign in. Beta Tester is not Admin access.',
  'Assigned work lives in Testing Portal. Run the steps, leave notes, and set Passed or Failed.',
];

export const BETA_REWARDS_FAIR_PLAY =
  'Meeting a test-count or time threshold does not excuse empty checkboxes, copy-paste notes, duplicates, automation, or bad-faith runs. The house reviews activity and decides final credit and reward eligibility.';

export const BETA_REWARDS_CONTACT = `Questions about this program: ${PUBLIC_CONTACT_EMAIL}.`;

export function betaCreditForPriority(priority: string | null | undefined): number {
  const key = String(priority || '').trim().toLowerCase() as WorkPriority;
  return BETA_CREDIT_REWARDS[key] ?? 0;
}

export function betaRewardLevelLabelFor(testsCompleted: number): string {
  const tests = Math.max(0, Math.floor(Number(testsCompleted) || 0));
  if (tests <= 0) return BETA_REWARD_LEVELS[0]!.label;
  let label = BETA_REWARD_LEVELS[0]!.label;
  for (const level of BETA_REWARD_LEVELS) {
    if (tests >= level.minTests) label = level.label;
  }
  return label;
}

export function isBetaRewardsPath(pathname: string): boolean {
  const path = (pathname || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  if (path === BETA_REWARDS_PATH) return true;
  return (BETA_REWARDS_PATH_ALIASES as readonly string[]).includes(path);
}
