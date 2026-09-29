/**
 * Fail + Conditional Pass always go to the Lead Developer (Evelyn)
 * so she can fix or review. Original QA is remembered for Fixed/Re-Test hand-back.
 */
import { FAILED_TEST_ASSIGNEE, isAutomatedSuiteOwner, isHumanQaTesterId } from "./gysh-roles";

export function statusAssignsToLeadDev(status: string | null | undefined): boolean {
  const st = String(status || "")
    .trim()
    .toLowerCase();
  return st === "fail" || st === "conditional_approval";
}

export type LeadDevAssignmentInput = {
  status: string;
  prevStatus?: string | null;
  currentAssignee?: string | null;
  requestedAssignee?: string | null;
  originalAssignee?: string | null;
  lockedSuiteOwner?: string | null;
  encodedOwner?: string | null;
  devAssigneeIds?: ReadonlySet<string>;
};

function norm(raw: string | null | undefined): string {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

function isDevAssignee(id: string, devIds?: ReadonlySet<string>): boolean {
  if (!id || isAutomatedSuiteOwner(id)) return false;
  if (id === FAILED_TEST_ASSIGNEE) return true;
  return devIds?.has(id) ?? false;
}

function rememberOriginalQa(who: string, already: string): string {
  if (already) return already;
  if (!isHumanQaTesterId(who) || isDevAssignee(who)) return already;
  return who;
}

/**
 * Who should own a Fail / Conditional Pass row.
 * Transition → always Evelyn (unless the case is a locked automated suite).
 * Later saves stay on a Dev if one was chosen; everyone else snaps back to Evelyn.
 */
export function resolveLeadDevAssignment(input: LeadDevAssignmentInput): {
  assignee: string;
  originalAssignee: string;
} {
  const locked = norm(input.lockedSuiteOwner);
  let originalAssignee = norm(input.originalAssignee);
  if (locked) {
    return { assignee: locked, originalAssignee };
  }

  const current = norm(input.currentAssignee);
  const requested =
    input.requestedAssignee !== undefined && input.requestedAssignee !== null
      ? norm(input.requestedAssignee)
      : current;

  if (!statusAssignsToLeadDev(input.status)) {
    return { assignee: requested || current, originalAssignee };
  }

  originalAssignee = rememberOriginalQa(current, originalAssignee);
  originalAssignee = rememberOriginalQa(norm(input.encodedOwner), originalAssignee);

  const prev = norm(input.prevStatus);
  const next = norm(input.status);
  if (prev !== next) {
    return { assignee: FAILED_TEST_ASSIGNEE, originalAssignee };
  }

  if (isDevAssignee(requested, input.devAssigneeIds)) {
    return { assignee: requested, originalAssignee };
  }
  if (isDevAssignee(current, input.devAssigneeIds)) {
    return { assignee: current, originalAssignee };
  }
  return { assignee: FAILED_TEST_ASSIGNEE, originalAssignee };
}

/** Client optimistic assignee when QA marks Fail or Conditional Pass. */
export function leadDevAssigneeForStatusChange(
  status: string,
  currentAssignee: string | null | undefined,
  devAssigneeIds?: ReadonlySet<string>,
): string {
  if (!statusAssignsToLeadDev(status)) return String(currentAssignee || "").trim();
  const current = norm(currentAssignee);
  if (isDevAssignee(current, devAssigneeIds)) return current;
  return FAILED_TEST_ASSIGNEE;
}
