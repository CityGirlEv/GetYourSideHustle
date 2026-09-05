/**
 * Shared Tina/Evelyn/Lyriq/Candace ownership for Testing Portal + Sprint Board progress.
 * Keep these surfaces in lockstep so passed/total matches.
 */

import { isAutomatedTestId, suiteOwnerForAutomatedCase } from "./gysh-automated-tests";
import { statusAssignsToLeadDev } from "./gysh-fail-assignee";
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
  if (fromCatalog) return fromCatalog as QaTesterId;
  // Generated suite failures default to Lead Dev until someone claims them.
  if (isFailureGeneratedId(t.id)) return "evelyn";
  return "";
}

/**
 * Who should match a QA Testors chip / filter for this case.
 * Current assignee always counts. On Fail/Blocked, also credit original_assignee
 * (the QA who filed it) so Fail→Dev does not hide their results under their name.
 */
export function testerFilterOwnersForCase(
  t: OwnerStatsCase,
  dbAssignee: string | null | undefined,
  originalAssignee: string | null | undefined,
  status: string | null | undefined,
): QaTesterId[] {
  const owners: QaTesterId[] = [];
  const current = manualQaOwnerForStats(t, dbAssignee);
  if (current) owners.push(current);
  const st = String(status || "").trim().toLowerCase();
  if (statusAssignsToLeadDev(st) || st === "blocked") {
    const orig = normalizeQaAssigneeId(originalAssignee);
    if (isHumanQaTester(orig) && orig !== current) owners.push(orig);
  }
  return owners;
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
