/**
 * Shared Tina/Evelyn/Lyriq ownership for Testing Portal + Sprint Board progress.
 * Keep these surfaces in lockstep so passed/total matches.
 */

import { isAutomatedTestId, suiteOwnerForAutomatedCase } from "./gysh-automated-tests";
import { proofreadOwnerFromId } from "./gysh-proofread-cases";
import {
  isHumanQaTester,
  normalizeQaAssigneeId,
  type QaTesterId,
} from "./gysh-roles";

export type OwnerStatsCase = {
  id: string;
  suite?: string;
  assignees: readonly string[];
};

function isFailureGeneratedId(id: string): boolean {
  return /^(VT|PW)-FAIL-/i.test(id);
}

/**
 * Manual QA owner for tester progress bars / chips.
 * D1 assignee → PROOF-*-TINA/LYRIQ id → catalog human. Automated suites → "".
 */
export function manualQaOwnerForStats(
  t: OwnerStatsCase,
  dbAssignee: string | null | undefined,
): QaTesterId | "" {
  if (t.suite !== "manual" && !isFailureGeneratedId(t.id)) return "";
  const fromDb = normalizeQaAssigneeId(dbAssignee);
  if (isHumanQaTester(fromDb)) return fromDb;
  const fromProof = proofreadOwnerFromId(t.id);
  if (fromProof) return fromProof;
  const fromCatalog = t.assignees.find((a) => isHumanQaTester(String(a)));
  return (fromCatalog as QaTesterId | undefined) ?? "";
}

/** Primary assignee to persist / show on the board (suite owners for automated). */
export function effectiveTestAssignee(
  t: OwnerStatsCase,
  dbAssignee: string | null | undefined,
): string {
  const suiteOwner = suiteOwnerForAutomatedCase(t.id);
  if (suiteOwner) return suiteOwner;
  if (isFailureGeneratedId(t.id)) {
    const override = normalizeQaAssigneeId(dbAssignee);
    if (override && isHumanQaTester(override)) return override;
    return t.assignees[0] ?? "evelyn";
  }
  if (isAutomatedTestId(t.id) || t.suite === "vitest" || t.suite === "playwright") {
    return t.assignees[0] ?? "";
  }
  const override = normalizeQaAssigneeId(dbAssignee);
  if (override && isHumanQaTester(override)) return override;
  return t.assignees[0] ?? "";
}
