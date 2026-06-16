/** Assignee labels that are not QA testers — skip for assignment/unassign emails. */
export const NON_QA_ASSIGNEE_LABELS = new Set(["", "Unassigned", "Eng"]);

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
  emailConfirmed: boolean;
  banned: boolean;
}): boolean {
  return opts.hasQaRole && !opts.banned;
}
