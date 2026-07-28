/** GYSH user roles — age-banded audiences + admin + QA + Dev (types + labels only). DB is source of truth. */

import { api } from "./api";

export type GyshRole = "admin" | "qa" | "dev" | "kid" | "junior" | "adult" | "senior";

export const GYSH_ROLES: GyshRole[] = ["admin", "qa", "dev", "kid", "junior", "adult", "senior"];

export const GYSH_ROLE_LABELS: Record<GyshRole, string> = {
  admin: "Admin",
  qa: "QA",
  dev: "Dev",
  kid: "Kid (3–12)",
  junior: "Teens (13–17)",
  adult: "Adult (18+)",
  senior: "Senior (55+)",
};

export const GYSH_ROLE_SHORT: Record<GyshRole, string> = {
  admin: "Admin",
  qa: "QA",
  dev: "Dev",
  kid: "Kids",
  junior: "Teens",
  adult: "Adult",
  senior: "Senior",
};

export const GYSH_ROLE_DESCRIPTIONS: Record<GyshRole, string> = {
  admin: "Full GYSH Admin Studio access",
  qa: "Testing Portal / QA verification (can combine with Admin)",
  dev: "Engineering / bug fixes — owns failed tests routed from QA",
  kid: "Kids Side Hustle Corner — Kevina Starr Stories & Glow Getter content",
  junior: "Teens Side Hustle Corner — safe earning projects & piggy bank tools",
  adult: "Adult Side Hustle Hub — Get Your Side Hustle, calculators, launch guides",
  senior: "Seniors Corner — flexible GYSH Match Wizard, second careers, and lower-intensity paths",
};

export const GYSH_ROLE_HOME: Record<GyshRole, string> = {
  admin: "admin",
  qa: "admin",
  dev: "admin",
  kid: "kids",
  junior: "kids",
  adult: "dashboard",
  senior: "seniors",
};

/** Solid hex only — used for fills and contrast math (no CSS variables). */
export const GYSH_ROLE_ACCENT: Record<GyshRole, string> = {
  admin: "#9B2F28",
  qa: "#6B5344",
  dev: "#1F4E79",
  kid: "#3D6F88",
  junior: "#4A6B52",
  adult: "#5C4A1F",
  senior: "#7A4F6A",
};

/** Pick readable text for a hex background (#RRGGBB). */
export function contrastTextForBg(hex: string): "#FFFFFF" | "#181718" {
  const raw = hex.replace("#", "").trim();
  if (raw.length !== 6) return "#181718";
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? "#181718" : "#FFFFFF";
}

/** Normalize API user roles (multi-role JSON or legacy single role). */
export function userRoles(u: Pick<GyshUser, "role" | "roles">): GyshRole[] {
  if (Array.isArray(u.roles) && u.roles.length > 0) {
    return u.roles.filter((r): r is GyshRole => GYSH_ROLES.includes(r));
  }
  return GYSH_ROLES.includes(u.role) ? [u.role] : ["adult"];
}

export function formatRoles(u: Pick<GyshUser, "role" | "roles">): string {
  return userRoles(u)
    .map((r) => GYSH_ROLE_LABELS[r])
    .join(" · ");
}

export function userHasRole(u: Pick<GyshUser, "role" | "roles">, role: GyshRole): boolean {
  return userRoles(u).includes(role);
}

/** Admin Studio / partner tooling — admin, QA, or Dev (matches functions/_lib/roles.ts). */
export function canAccessAdminPortal(
  u: Pick<GyshUser, "role" | "roles"> | { role?: string; roles?: string[] } | null | undefined,
): boolean {
  if (!u) return false;
  const roles = Array.isArray(u.roles) && u.roles.length > 0
    ? u.roles
    : u.role
      ? [u.role]
      : [];
  return roles.includes("admin") || roles.includes("qa") || roles.includes("dev");
}

/** Human QA testers — Manual suite only (clickable bubbles). */
export type QaTesterId = "tina" | "evelyn" | "lyriq";

/** Default Dev when a test is Failed (Lead Developer). */
export const FAILED_TEST_ASSIGNEE: QaTesterId = "evelyn";

/** Lead Developer — owns failed tests until Fixed/Re-Test or Failed/Re-Test. */
export const LEAD_DEVELOPER_ASSIGNEE: QaTesterId = FAILED_TEST_ASSIGNEE;
export const LEAD_DEVELOPER_LABEL = "Evelyn (Lead Developer)";

/** Default human owner when a new test case is created. */
export const NEW_TEST_ASSIGNEE: QaTesterId = "evelyn";

/** Automated suite owners — Vitest / Playwright runners (not D1 users). */
export type AutomatedSuiteOwnerId = "vitest" | "playwright";

/** Any Testing Portal case owner (human QA or automated suite runner). */
export type TestOwnerId = QaTesterId | AutomatedSuiteOwnerId;

export type QaTester = {
  id: QaTesterId;
  name: string;
  shortName: string;
  accent: string;
};

export type AutomatedSuiteOwner = {
  id: AutomatedSuiteOwnerId;
  name: string;
  shortName: string;
  accent: string;
};

export const QA_TESTERS: QaTester[] = [
  {
    id: "tina",
    name: "Tina Marie Barham",
    shortName: "Tina",
    accent: "var(--crimson)",
  },
  {
    id: "evelyn",
    name: "Evelyn Irving",
    shortName: "Evelyn",
    accent: "var(--bronze)",
  },
  {
    id: "lyriq",
    name: "Lyriq Gaulden",
    shortName: "Lyriq",
    accent: "var(--accent-emerald)",
  },
];

/** Map a Users Area person to a Testing Portal assignee id (tina / evelyn / lyriq). */
export function qaTesterIdForUser(u: {
  name?: string;
  email?: string;
}): QaTesterId | null {
  const name = String(u.name || "")
    .trim()
    .toLowerCase();
  const email = String(u.email || "")
    .trim()
    .toLowerCase();
  for (const t of QA_TESTERS) {
    const short = t.shortName.toLowerCase();
    if (name === short || name.startsWith(`${short} `) || name === t.name.toLowerCase()) {
      return t.id;
    }
  }
  if (email.includes("evelyn") || email.includes("evvelyn")) return "evelyn";
  if (email.includes("tina")) return "tina";
  if (email.includes("lyriq") || email.includes("gaulden") || email.includes("leegaulden")) {
    return "lyriq";
  }
  return null;
}

/**
 * Active Users Area accounts with the Dev role, mapped to Testing Portal assignee ids.
 * Used for the Fail → Dev Assignee dropdown (Dev-only).
 */
export function devAssigneesFromUsers(users: readonly GyshUser[]): QaTester[] {
  const seen = new Set<QaTesterId>();
  const out: QaTester[] = [];
  for (const u of users) {
    if (u.status !== "active") continue;
    if (!userHasRole(u, "dev")) continue;
    const id = qaTesterIdForUser(u);
    if (!id || seen.has(id)) continue;
    const base = QA_TESTERS.find((t) => t.id === id);
    if (!base) continue;
    seen.add(id);
    out.push(base);
  }
  if (out.length === 0) {
    const lead = QA_TESTERS.find((t) => t.id === FAILED_TEST_ASSIGNEE);
    if (lead) out.push(lead);
  }
  return out;
}

/** System owners for automated suites — status tracked under these, not human testers. */
export const AUTOMATED_SUITE_OWNERS: AutomatedSuiteOwner[] = [
  {
    id: "vitest",
    name: "Vitest QA Runner",
    shortName: "Vitest",
    accent: "#2563eb",
  },
  {
    id: "playwright",
    name: "Playwright QA Runner",
    shortName: "Playwright",
    accent: "#7c3aed",
  },
];

export const HUMAN_QA_TESTER_IDS: readonly QaTesterId[] = QA_TESTERS.map((t) => t.id);

export function isHumanQaTesterId(raw: string | null | undefined): raw is QaTesterId {
  return HUMAN_QA_TESTER_IDS.includes(String(raw || "").trim().toLowerCase() as QaTesterId);
}

export function isHumanQaTester(id: string): id is QaTesterId {
  return HUMAN_QA_TESTER_IDS.includes(String(id || "").trim().toLowerCase() as QaTesterId);
}

/** Normalize a stored Testing Portal assignee to a canonical lowercase id (or ""). */
export function normalizeQaAssigneeId(raw: string | null | undefined): string {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

export function isAutomatedSuiteOwner(id: string): id is AutomatedSuiteOwnerId {
  return id === "vitest" || id === "playwright";
}

export function testOwnerLabel(id: TestOwnerId | string): string {
  const human = QA_TESTERS.find((t) => t.id === id);
  if (human) return human.shortName;
  const auto = AUTOMATED_SUITE_OWNERS.find((t) => t.id === id);
  if (auto) return auto.shortName;
  return id;
}

export type GyshUser = {
  id: string;
  name: string;
  email: string;
  /** Primary role (highest privilege). */
  role: GyshRole;
  /** All assigned roles (admin + QA + Dev allowed together). */
  roles?: GyshRole[];
  status: "active" | "pending" | "disabled";
  joinedAt: string;
  notes: string;
  canLogin?: boolean;
  /** Membership level: free | starter | pro | elite */
  membershipTier?: string;
  /** Audience lane: kids | junior | adult | senior */
  audience?: string;
};

export async function fetchUsers(): Promise<GyshUser[]> {
  const data = await api<{ users: GyshUser[] }>("users");
  return data.users ?? [];
}

export async function saveUser(
  user: Partial<GyshUser> & {
    name: string;
    email: string;
    status: GyshUser["status"];
    role?: GyshRole;
    roles?: GyshRole[];
  },
  password?: string,
): Promise<GyshUser> {
  const roles = user.roles?.length ? user.roles : user.role ? [user.role] : ["adult"];
  const data = await api<{ user: GyshUser }>("users", {
    method: "PUT",
    body: { ...user, roles, role: roles[0], password: password || undefined },
  });
  return data.user;
}
