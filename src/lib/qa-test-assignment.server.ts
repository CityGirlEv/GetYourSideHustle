import type { TestStatus } from "@/lib/test-plan";

/** Assignee labels that are not QA testers — skip for assignment/unassign emails. */
export const NON_QA_ASSIGNEE_LABELS = new Set(["", "Unassigned", "Eng"]);

/** Dev returned a test to QA for retest or re-review. */
export function isQaRetestStatus(status: TestStatus): boolean {
  return status === "fixed_retest" || status === "failed_retest";
}

export function isNewQaRetestTransition(previous: TestStatus, next: TestStatus): boolean {
  return isQaRetestStatus(next) && previous !== next;
}

export function isUnassignNotificationCandidate(
  previousAssignee: string,
  newAssignee: string,
): boolean {
  const prev = previousAssignee.trim();
  const next = newAssignee.trim();
  if (!prev || NON_QA_ASSIGNEE_LABELS.has(prev)) return false;
  return prev.toLowerCase() !== next.toLowerCase();
}

/** QA user eligible for transactional test emails (active, has qa role). */
export function isEnabledQaAccount(opts: {
  hasQaRole: boolean;
  banned: boolean;
}): boolean {
  return opts.hasQaRole && !opts.banned;
}
