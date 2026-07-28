/** Shared role helpers for GYSH D1 users (single primary + optional multi-role JSON). */

export const ALL_ROLES = ["admin", "qa", "dev", "kid", "junior", "adult", "senior"] as const;
export type GyshRole = (typeof ALL_ROLES)[number];

/** Privilege order — first match becomes the stored primary `role`. */
const ROLE_PRIORITY: GyshRole[] = ["admin", "qa", "dev", "adult", "senior", "junior", "kid"];

export function isGyshRole(value: unknown): value is GyshRole {
  return typeof value === "string" && (ALL_ROLES as readonly string[]).includes(value);
}

export function parseRoles(role: string, rolesJson?: string | null): GyshRole[] {
  if (rolesJson) {
    try {
      const parsed = JSON.parse(rolesJson);
      if (Array.isArray(parsed)) {
        const roles = [...new Set(parsed.filter(isGyshRole))];
        if (roles.length > 0) return sortRoles(roles);
      }
    } catch {
      /* fall through */
    }
  }
  return isGyshRole(role) ? [role] : ["adult"];
}

export function sortRoles(roles: GyshRole[]): GyshRole[] {
  return [...roles].sort(
    (a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b),
  );
}

export function primaryRole(roles: GyshRole[]): GyshRole {
  const sorted = sortRoles(roles);
  return sorted[0] ?? "adult";
}

export function serializeRoles(roles: GyshRole[]): string {
  return JSON.stringify(sortRoles([...new Set(roles)]));
}

/** Normalize body input: prefer `roles` array, else single `role`. */
export function normalizeRolesInput(
  role: unknown,
  roles: unknown,
): GyshRole[] | null {
  if (Array.isArray(roles)) {
    const list = [...new Set(roles.filter(isGyshRole))];
    if (list.length === 0) return null;
    return sortRoles(list);
  }
  if (isGyshRole(role)) return [role];
  return null;
}

/** Portal login / Admin Studio: admin, QA, or Dev. */
export function canAccessAdminPortal(roles: GyshRole[]): boolean {
  return roles.includes("admin") || roles.includes("qa") || roles.includes("dev");
}

/**
 * Testing Portal status updates (Pass / Fail / etc.).
 * Same gate as Admin Studio — QA / Dev / admin. Blocked is gated by canSetTestBlocked.
 */
export function canChangeTestStatus(roles: GyshRole[]): boolean {
  return canAccessAdminPortal(roles);
}

/** Canonical + known typo emails for Evelyn (Blocked status allowlist). */
const EVELYN_BLOCKED_EMAILS = new Set(["evelyn3@cox.net", "evvelyn3@cox.net"]);

/**
 * Only Evelyn may set a test case to Blocked.
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

/** Evelyn may edit items in a closed/locked sprint; everyone else is blocked. */
export function canBypassSprintLock(
  user: { email?: string; name?: string } | null | undefined,
): boolean {
  return canSetTestBlocked(user);
}

/**
 * Fixed/Re-Test or Failed/Re-Test — any Dev-role user, or Evelyn (Lead Developer) by identity.
 */
export function canSetDevFixStatus(
  user: { email?: string; name?: string; role?: string; roles?: string | null } | null | undefined,
): boolean {
  if (!user) return false;
  if (parseRoles(user.role || "adult", user.roles).includes("dev")) return true;
  return canSetTestBlocked(user);
}

/** Map display name / email to Testing Portal assignee id. */
export function qaTesterIdForIdentity(name: string, email: string): string | null {
  const n = String(name || "")
    .trim()
    .toLowerCase();
  const e = String(email || "")
    .trim()
    .toLowerCase();
  if (n === "evelyn" || n.startsWith("evelyn ") || e.includes("evelyn") || e.includes("evvelyn")) {
    return "evelyn";
  }
  if (n === "tina" || n.startsWith("tina ") || e.includes("tina")) return "tina";
  if (
    n === "lyriq" ||
    n.startsWith("lyriq ") ||
    e.includes("lyriq") ||
    e.includes("gaulden") ||
    e.includes("leegaulden")
  ) {
    return "lyriq";
  }
  return null;
}

export function hasRole(roles: GyshRole[], role: GyshRole): boolean {
  return roles.includes(role);
}

/** Default Dev when a test is Failed (Lead Developer). */
export const FAILED_TEST_ASSIGNEE = "evelyn";
export const LEAD_DEVELOPER_ASSIGNEE = FAILED_TEST_ASSIGNEE;

const HUMAN_QA_IDS = new Set(["tina", "evelyn", "lyriq"]);

export function isHumanQaTesterId(raw: string | null | undefined): boolean {
  return HUMAN_QA_IDS.has(String(raw || "").trim().toLowerCase());
}

/** Owner encoded in proofread case ids (PROOF-002-TINA → tina). */
export function qaOwnerFromCaseId(caseId: string): string {
  const id = String(caseId || "").trim();
  if (/-TINA$/i.test(id)) return "tina";
  if (/-LYRIQ$/i.test(id)) return "lyriq";
  return "";
}

/** Partner assignee ids that currently have the Dev role (plus Lead Dev fallback). */
export async function listDevAssigneeIds(
  env: { DB: { prepare: (sql: string) => { all: <T>() => Promise<{ results?: T[] }> } } },
): Promise<Set<string>> {
  const ids = new Set<string>([FAILED_TEST_ASSIGNEE]);
  try {
    const { results } = await env.DB.prepare(
      `SELECT name, email, role, roles FROM users WHERE status = 'active'`,
    ).all<{ name: string; email: string; role: string; roles: string | null }>();
    for (const row of results ?? []) {
      if (!parseRoles(row.role, row.roles).includes("dev")) continue;
      const id = qaTesterIdForIdentity(row.name, row.email);
      if (id) ids.add(id);
    }
  } catch {
    /* keep Lead Dev fallback */
  }
  return ids;
}
