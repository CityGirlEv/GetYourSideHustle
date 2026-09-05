/**
 * Beta tester points: Kid Credits per eligible result, plus a re-test bonus.
 */

import { betaCreditForPriority, type BetaTestPriority } from "./beta-tester-credits";
import { isBetaCreditsReviewCaseId } from "./gysh-beta-credits-review-cases";
import { testOwnerLabel } from "./gysh-roles";

export const BETA_RETEST_BONUS = 5;

export const BETA_CREDIT_ELIGIBLE_STATUSES = [
  "pass",
  "conditional_approval",
  "fail",
] as const;

export type BetaCreditEligibleStatus = (typeof BETA_CREDIT_ELIGIBLE_STATUSES)[number];

export type BetaPointCaseInput = {
  caseId: string;
  status: string;
  assignee?: string | null;
  priority?: string | null;
  failedStepIndex?: number | null;
  hadPriorFail?: boolean;
};

export type BetaCasePointLine = {
  caseId: string;
  status: string;
  assignee: string;
  priority: string;
  base: number;
  retest: number;
  total: number;
  passed: boolean;
  retested: boolean;
};

export type BetaTesterScore = {
  testerId: string;
  displayName: string;
  testsPassed: number;
  testsDocumented: number;
  retests: number;
  basePoints: number;
  retestPoints: number;
  totalPoints: number;
  cases: BetaCasePointLine[];
};

export function isEligibleBetaCreditStatus(status: string): status is BetaCreditEligibleStatus {
  return (BETA_CREDIT_ELIGIBLE_STATUSES as readonly string[]).includes(status);
}

/** Re-test work (or a pass after a recorded fail) earns the extra bonus. */
export function earnsRetestBonus(input: {
  status: string;
  hadPriorFail?: boolean;
  failedStepIndex?: number | null;
}): boolean {
  const st = String(input.status || "").trim();
  if (st === "fixed_retest" || st === "failed_retest") return true;
  if (st !== "pass" && st !== "conditional_approval") return false;
  if (input.hadPriorFail === true) return true;
  return typeof input.failedStepIndex === "number" && Number.isInteger(input.failedStepIndex);
}

export function inferBetaCasePriority(caseId: string): BetaTestPriority {
  const id = String(caseId || "").trim().toUpperCase();
  if (isBetaCreditsReviewCaseId(id)) return "P1";
  if (/^(AUTH|LOGIN|STRIPE|BP-|PAY-|MEM-|CHECKOUT)/.test(id)) return "P0";
  if (/^(PROOF|EMAIL-TPL|VIDEO|WIZ-)/.test(id)) return "P2";
  return "P1";
}

export function pointsForBetaCase(input: BetaPointCaseInput): {
  base: number;
  retest: number;
  total: number;
} {
  const status = String(input.status || "").trim();
  const priority = String(input.priority || inferBetaCasePriority(input.caseId));
  const base = isEligibleBetaCreditStatus(status) ? betaCreditForPriority(priority) : 0;
  const retest = earnsRetestBonus(input) && base > 0 ? BETA_RETEST_BONUS : 0;
  // Re-test-in-progress (fixed/failed re-test) still counts the bonus once a base exists;
  // those statuses are not yet "passed" so base is 0 — award bonus only after an eligible result.
  const retestOnly =
    earnsRetestBonus(input) && base === 0 && (status === "fixed_retest" || status === "failed_retest")
      ? 0
      : retest;
  return { base, retest: retestOnly, total: base + retestOnly };
}

export function scoreBetaCase(input: BetaPointCaseInput): BetaCasePointLine {
  const assignee = String(input.assignee || "").trim().toLowerCase();
  const status = String(input.status || "").trim();
  const priority = String(input.priority || inferBetaCasePriority(input.caseId));
  const pts = pointsForBetaCase({ ...input, priority, status });
  return {
    caseId: String(input.caseId || "").trim(),
    status,
    assignee,
    priority,
    base: pts.base,
    retest: pts.retest,
    total: pts.total,
    passed: status === "pass" || status === "conditional_approval",
    retested: pts.retest > 0,
  };
}

export function tallyBetaTesterScores(
  rows: readonly BetaPointCaseInput[],
  displayNames?: Record<string, string>,
): BetaTesterScore[] {
  const byTester = new Map<string, BetaCasePointLine[]>();
  for (const row of rows) {
    const line = scoreBetaCase(row);
    if (!line.assignee || line.total <= 0) continue;
    const list = byTester.get(line.assignee) ?? [];
    list.push(line);
    byTester.set(line.assignee, list);
  }
  const scores: BetaTesterScore[] = [];
  for (const [testerId, cases] of byTester) {
    const displayName =
      displayNames?.[testerId] || testOwnerLabel(testerId) || testerId;
    scores.push({
      testerId,
      displayName,
      testsPassed: cases.filter((c) => c.passed).length,
      testsDocumented: cases.length,
      retests: cases.filter((c) => c.retested).length,
      basePoints: cases.reduce((n, c) => n + c.base, 0),
      retestPoints: cases.reduce((n, c) => n + c.retest, 0),
      totalPoints: cases.reduce((n, c) => n + c.total, 0),
      cases: cases.sort((a, b) => a.caseId.localeCompare(b.caseId)),
    });
  }
  scores.sort((a, b) => b.totalPoints - a.totalPoints || a.displayName.localeCompare(b.displayName));
  return scores;
}

export function scoreForTester(
  scores: readonly BetaTesterScore[],
  testerId: string,
): BetaTesterScore | null {
  const id = String(testerId || "").trim().toLowerCase();
  return scores.find((s) => s.testerId === id) ?? null;
}
