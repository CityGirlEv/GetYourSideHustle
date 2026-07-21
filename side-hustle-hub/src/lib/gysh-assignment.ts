/** Assigned By / Assigned Date helpers for Task List + Testing Portal. */

/** Catalog / seed default until a human reassigns. */
export const SYSTEM_ASSIGNED_BY = "System";

/** Common Assigned By values stored in D1 (tasks.assign_by / test_case_status.assigned_by). */
export const ASSIGNED_BY_PRESETS = [
  SYSTEM_ASSIGNED_BY,
  "Tina",
  "Evelyn",
  "Lyriq",
] as const;

/** Options for an Assigned By select, keeping any custom current value selectable. */
export function assignedBySelectOptions(...currentValues: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (raw: string) => {
    const v = raw.trim();
    if (!v || seen.has(v)) return;
    seen.add(v);
    out.push(v);
  };
  for (const p of ASSIGNED_BY_PRESETS) push(p);
  for (const c of currentValues) {
    if (c != null) push(String(c));
  }
  return out;
}

/** True when the user has the admin role (not merely QA/dev portal access). */
export function userHasAdminRole(
  user: { role?: string; roles?: string[] } | null | undefined,
): boolean {
  if (!user) return false;
  const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
  return roles.includes("admin");
}

/**
 * Testing Portal status changes (Pass / Fail / etc.) — any Admin Studio user:
 * admin, QA, or Dev. Blocked is gated separately via canSetTestBlocked.
 */
export function userCanChangeTestStatus(
  user: { role?: string; roles?: string[] } | null | undefined,
): boolean {
  if (!user) return false;
  const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
  return roles.includes("admin") || roles.includes("qa") || roles.includes("dev");
}

/** Canonical + known typo emails for Evelyn (Blocked status allowlist). */
const EVELYN_BLOCKED_EMAILS = new Set(["evelyn3@cox.net", "evvelyn3@cox.net"]);

/**
 * Only Evelyn may set a test case to Blocked (Testing Portal / Schedule board).
 * Identified by seeded email and/or display name ("Evelyn" / "Evelyn Irving").
 */
export function canSetTestBlocked(
  user: { email?: string; name?: string } | null | undefined,
): boolean {
  if (!user) return false;
  const email = String(user.email || "").trim().toLowerCase();
  if (EVELYN_BLOCKED_EMAILS.has(email)) return true;
  const name = String(user.name || "").trim().toLowerCase();
  return name === "evelyn" || name.startsWith("evelyn ");
}

/** Display label matching server `actorLabel` / audit trail (name, else email). */
export function auditActorLabel(
  user: { name?: string; email?: string } | null | undefined,
): string {
  const name = (user?.name || "").trim();
  if (name) return name;
  const email = (user?.email || "").trim();
  if (email) return email;
  return SYSTEM_ASSIGNED_BY;
}

export function todayMMDDYY(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export type ResolveTestAssignedMetaInput = {
  /** Prior row assignee (empty if no row). */
  prevAssignee: string;
  /** Final assignee after fail/overrides. */
  nextAssignee: string;
  /** True when this upsert created a new status row. */
  isNewRow: boolean;
  prevAssignedBy: string;
  prevDateAssigned: string;
  /** Logged-in actor (name or email). */
  actorLabel: string;
  /** MM/DD/YY for new assignment timestamps. */
  today: string;
  /** Optional client overrides (API accept). */
  explicitAssignedBy?: string;
  explicitDateAssigned?: string;
};

/**
 * Merge Assigned By / Assigned Date for test_case_status.
 * - New rows default to System + today (first status persist often includes catalog assignee).
 * - Reassign on existing rows → acting user + today.
 * - Client may send explicitAssignedBy on bulk/reassign (including first-row assign).
 * - Unrelated updates preserve prior values.
 */
export function resolveTestAssignedMeta(
  input: ResolveTestAssignedMetaInput,
): { assignedBy: string; dateAssigned: string } {
  if (input.explicitAssignedBy !== undefined || input.explicitDateAssigned !== undefined) {
    const assignedBy =
      input.explicitAssignedBy !== undefined
        ? String(input.explicitAssignedBy || "").trim() || SYSTEM_ASSIGNED_BY
        : String(input.prevAssignedBy || "").trim() || SYSTEM_ASSIGNED_BY;
    const dateAssigned =
      input.explicitDateAssigned !== undefined
        ? String(input.explicitDateAssigned || "").trim()
        : String(input.prevDateAssigned || "").trim() ||
          (input.isNewRow ? input.today : "");
    return { assignedBy, dateAssigned };
  }

  const prevAssignee = String(input.prevAssignee || "").trim();
  const nextAssignee = String(input.nextAssignee || "").trim();
  const assigneeChanged = nextAssignee !== prevAssignee;

  // Existing row reassigned (incl. fail auto-owner) → acting user.
  if (assigneeChanged && !input.isNewRow) {
    return {
      assignedBy: String(input.actorLabel || "").trim() || SYSTEM_ASSIGNED_BY,
      dateAssigned: input.today,
    };
  }

  if (input.isNewRow) {
    return {
      assignedBy: SYSTEM_ASSIGNED_BY,
      dateAssigned: input.today,
    };
  }

  return {
    assignedBy: String(input.prevAssignedBy || "").trim() || SYSTEM_ASSIGNED_BY,
    dateAssigned: String(input.prevDateAssigned || "").trim(),
  };
}

/** Task create / reassign: set Assigned By from actor; keep creation dateAssigned. */
export function taskAssignByForActor(
  user: { name?: string; email?: string } | null | undefined,
): string {
  return auditActorLabel(user);
}
