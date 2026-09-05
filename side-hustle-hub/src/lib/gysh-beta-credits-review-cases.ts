/**
 * Beta Tester Member Credits guide review — one Testing Portal row per reviewer.
 * Reviewers: Milford, Tina, Brenda, Lyriq, Evelyn.
 */

import type { QaTesterId } from "./gysh-roles";
import type { TestCase } from "./gysh-test-plan";
import { currentSprintIndex, dueDatePlusDays } from "./gysh-sprints";

export const BETA_CREDITS_REVIEW_LOGICAL_ID = "BETA-CRED-001";

export const BETA_CREDITS_REVIEW_TITLE = "Review Beta Tester Member Credits guide";

/** Order matches the request: Milford, Tina, Brenda, Lyriq, Evelyn (Myself). */
export const BETA_CREDITS_REVIEW_REVIEWERS = [
  "milford",
  "tina",
  "brenda",
  "lyriq",
  "evelyn",
] as const satisfies readonly QaTesterId[];

export function isBetaCreditsReviewCaseId(caseId: string): boolean {
  const id = String(caseId || "").toUpperCase();
  return id === BETA_CREDITS_REVIEW_LOGICAL_ID || id.startsWith(`${BETA_CREDITS_REVIEW_LOGICAL_ID}-`);
}

/** Current open sprint so reviewers see these in assigned-items / chips. */
export function betaCreditsReviewSprint(ref: Date = new Date()): number {
  return Math.max(1, currentSprintIndex(ref));
}

export function betaCreditsReviewDueDate(_caseId: string, ref: Date = new Date()): string {
  return dueDatePlusDays(0, ref);
}

/**
 * Place ungraded BETA-CRED-* rows on the live sprint / due / catalog owner.
 * Never rewrite Fail/Pass/Cond.
 */
export function needsBetaCreditsReviewPlacementHeal(input: {
  status: string | null | undefined;
  sprint: number | null | undefined;
  due: string | null | undefined;
  assignee: string | null | undefined;
  wantSprint: number;
  wantDue: string;
  wantAssignee: string;
}): boolean {
  const st = String(input.status || "not_run").trim() || "not_run";
  if (st !== "not_run") return false;
  const due = String(input.due ?? "").trim();
  const assignee = String(input.assignee ?? "").trim().toLowerCase();
  const want = String(input.wantAssignee || "").trim().toLowerCase();
  return (
    input.sprint !== input.wantSprint || due !== input.wantDue || (want !== "" && assignee !== want)
  );
}

const BETA_CREDITS_REVIEW_STEPS = [
  "Open [Beta Tester Credit Guide](/beta-credits) (footer → Beta Credits, or Beta Tester Dashboard → How to earn credits)",
  "Confirm the guide explains how Beta Testers earn Kid Credits (Pass / Conditional Pass / documented Fail) and that Not Run and Blocked earn 0",
  "Confirm the reward table shows P0=15, P1=10, P2=5, P3=3, the +5 first reproducible Fail bonus, and the +5 re-test bonus",
  "Confirm spend rules cover workshops, plan consulting vs extra sessions, credit packs (only when monthly credits are not enough), and NDA §9 round rewards; skim reward levels (Contributor / Regular / Champion)",
  "Confirm the guide’s membership explainer: four plans only (no Starter+ or Pro+), lock badges match unlock buttons (“Starter or higher” / “Pro or higher”), credits vs packs vs consulting, and Available now vs Coming soon",
  "Open [Join / Membership](/join) and skim the same four-plan comparison (what’s included vs locked), credit packs, and a-la-carte / consulting options",
  "In Testing Portal notes, give your overall opinion on the payment models (membership tiers, credit packs, consulting / credit spend). What feels fair, confusing, or missing?",
  "Set Pass if the credits guide is clear and usable; Conditional Pass if copy tweaks are needed; Fail if the guide is wrong or incomplete — attach notes either way",
];

/** One case per reviewer (BETA-CRED-001-MILFORD, …-TINA, …-BRENDA, …-LYRIQ, …-EVELYN). */
export const BETA_CREDITS_REVIEW_CASES: TestCase[] = BETA_CREDITS_REVIEW_REVIEWERS.map((owner) => ({
  id: `${BETA_CREDITS_REVIEW_LOGICAL_ID}-${owner.toUpperCase()}`,
  area: "Membership",
  title: BETA_CREDITS_REVIEW_TITLE,
  priority: "P1" as const,
  roles: ["qa", "admin"] as TestCase["roles"],
  assignees: [owner] as TestCase["assignees"],
  suite: "manual" as const,
  steps: [...BETA_CREDITS_REVIEW_STEPS],
  expected:
    "Credits guide is accurate and readable; each reviewer left an overall opinion on payment models (tiers, packs, consulting) in notes",
  path: "beta_credits",
}));
