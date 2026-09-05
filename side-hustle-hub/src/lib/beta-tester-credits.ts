/**
 * GYSH Beta Tester credit guide — how testers earn Kid Credits for QA work.
 * Tokens redeem 1:1 as Kid Credits on the member account (workshops, consulting, etc.).
 */

export const BETA_CREDITS_GUIDE_TITLE = "Beta Tester Credit Guide";
export const BETA_CREDITS_GUIDE_SUBTITLE =
  "How you earn Kid Credits for testing on Get Your Side Hustle, and how they’re spent.";

export type BetaTestPriority = "P0" | "P1" | "P2" | "P3";

/** Kid Credits awarded per eligible Pass or documented Fail, by case priority. */
export const BETA_CREDIT_REWARDS: Record<BetaTestPriority, number> = {
  P0: 15,
  P1: 10,
  P2: 5,
  P3: 3,
};

/** Extra Kid Credits for the first reproducible Fail filed on a given case id. */
export const BETA_REPRO_FAIL_BONUS = 5;

export const BETA_CREDIT_PRIORITY_ROWS: ReadonlyArray<{
  priority: BetaTestPriority;
  label: string;
  meaning: string;
  credits: number;
}> = [
  {
    priority: "P0",
    label: "Critical",
    meaning: "Show-stopper / high-complexity flows (auth, checkout, membership, core wizards)",
    credits: BETA_CREDIT_REWARDS.P0,
  },
  {
    priority: "P1",
    label: "High",
    meaning: "Core feature paths (guides, portals, email, schedule)",
    credits: BETA_CREDIT_REWARDS.P1,
  },
  {
    priority: "P2",
    label: "Medium",
    meaning: "Secondary paths, polish, edge UI",
    credits: BETA_CREDIT_REWARDS.P2,
  },
  {
    priority: "P3",
    label: "Low",
    meaning: "Nice-to-have / low-risk checks",
    credits: BETA_CREDIT_REWARDS.P3,
  },
];

export type BetaCreditEarnRule = {
  id: string;
  title: string;
  detail: string;
};

/** Eligible outcomes that earn base priority credits. */
export const BETA_CREDIT_EARN_RULES: readonly BetaCreditEarnRule[] = [
  {
    id: "pass",
    title: "Mark a test as Pass (or Conditional Pass)",
    detail:
      "Run every step, verify the expected result, then set Pass or Conditional Pass in Testing Portal. Base credits post by case priority.",
  },
  {
    id: "fail",
    title: "File a documented Fail",
    detail:
      "Set Fail with clear notes (steps, expected vs actual, screenshots when helpful). You still earn the base priority credits.",
  },
  {
    id: "fail-bonus",
    title: "First reproducible Fail bonus",
    detail: `The first reproducible Fail on a given case id earns an extra +${BETA_REPRO_FAIL_BONUS} Kid Credits (reviewed by admin during sprint retro).`,
  },
  {
    id: "retest",
    title: "Re-test bonus",
    detail:
      "If a case comes back after a fail or a development fix (Fixed/Re-Test or Failed/Re-Test), completing that second pass earns an extra +5 Kid Credits on top of the priority amount.",
  },
];

export const BETA_CREDIT_ZERO_STATUSES = ["Not Run", "Blocked"] as const;

export const BETA_CREDIT_SPEND_RULES: readonly BetaCreditEarnRule[] = [
  {
    id: "workshops",
    title: "Workshops & story time",
    detail: "Redeem Kid Credits toward age-band workshops and kids/teens activities on Join / My Dashboard.",
  },
  {
    id: "consulting",
    title: "1-on-1 consulting sessions",
    detail:
      "Plan consulting is included on Starter, Pro, and Elite. Spend extra credits only when you want more time than the plan includes. Adult redemptions use half value (2 Kid Credits = 1 adult credit).",
  },
  {
    id: "credit-packs",
    title: "Credit packs (when monthly isn’t enough)",
    detail:
      "Paid memberships include a monthly Kid Credit pool. Buy a pack only if workshops or extra consulting would exceed that month’s balance. Packs do not replace membership.",
  },
  {
    id: "membership",
    title: "Membership & program rewards",
    detail:
      "Under the Beta Tester NDA (§9), strong testing rounds may also qualify for complimentary membership, consulting, or other benefits announced for that round — separate from per-test credits.",
  },
];

export type BetaRewardLevelDef = {
  id: string;
  label: string;
  /** Minimum eligible tests completed (Pass / Cond / documented Fail). */
  minTests: number;
  blurb: string;
};

export const BETA_REWARD_LEVELS: readonly BetaRewardLevelDef[] = [
  {
    id: "not_qualified",
    label: "Not yet qualified",
    minTests: 0,
    blurb: "Accept the NDA and complete your first eligible test case.",
  },
  {
    id: "contributor",
    label: "Contributor",
    minTests: 5,
    blurb: "At least 5 eligible tests with useful notes or evidence.",
  },
  {
    id: "regular",
    label: "Regular",
    minTests: 15,
    blurb: "Steady coverage across assigned cases this testing round.",
  },
  {
    id: "champion",
    label: "Champion",
    minTests: 40,
    blurb: "High volume plus quality findings that move the product forward.",
  },
];

export function betaCreditForPriority(priority: string | null | undefined): number {
  const key = String(priority || "").trim().toUpperCase() as BetaTestPriority;
  return BETA_CREDIT_REWARDS[key] ?? 0;
}

/**
 * Reward level label from eligible tests completed.
 * Recorded time is reserved for future quality gates; today volume drives the label.
 */
export function betaRewardLevelLabelFor(testsCompleted: number, _recordedMs = 0): string {
  const tests = Math.max(0, Math.floor(Number(testsCompleted) || 0));
  if (tests <= 0) return BETA_REWARD_LEVELS[0]!.label;
  let label = BETA_REWARD_LEVELS[0]!.label;
  for (const level of BETA_REWARD_LEVELS) {
    if (tests >= level.minTests) label = level.label;
  }
  return label;
}
