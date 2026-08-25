/** GYSH user roles — age-banded audiences + admin + QA + Dev (types + labels only). DB is source of truth. */

import { api } from "./api";

export type GyshRole = "admin" | "qa" | "dev" | "kid" | "junior" | "adult" | "senior" | "beta";

export const GYSH_ROLES: GyshRole[] = [
  "admin",
  "qa",
  "dev",
  "kid",
  "junior",
  "adult",
  "senior",
  "beta",
];

export const GYSH_ROLE_LABELS: Record<GyshRole, string> = {
  admin: "Admin",
  qa: "QA",
  dev: "Dev",
  kid: "Kid (3–12)",
  junior: "Teens (13–17)",
  adult: "Adult (18+)",
  senior: "Senior (55+)",
  beta: "Beta Tester",
};

export const GYSH_ROLE_SHORT: Record<GyshRole, string> = {
  admin: "Admin",
  qa: "QA",
  dev: "Dev",
  kid: "Kids",
  junior: "Teens",
  adult: "Adult",
  senior: "Senior",
  beta: "Beta",
};

export const GYSH_ROLE_DESCRIPTIONS: Record<GyshRole, string> = {
  admin: "Full GYSH Admin Studio access",
  qa: "Testing Portal / QA verification (can combine with Admin)",
  dev: "Engineering / bug fixes — owns failed tests routed from QA",
  kid: "Kids Side Hustle Corner — Kevina Starr Stories & Glow Getter content",
  junior: "Teens Side Hustle Corner — safe earning projects & piggy bank tools",
  adult: "Adult Side Hustle Hub — Get Your Side Hustle, calculators, launch guides",
  senior: "Seniors Corner — flexible GYSH Match Wizard, second careers, and lower-intensity paths",
  beta: "Applied to beta-test GYSH before launch — pending admin review (no Admin Studio access)",
};

export const GYSH_ROLE_HOME: Record<GyshRole, string> = {
  admin: "admin",
  qa: "admin",
  dev: "admin",
  kid: "kids",
  junior: "kids",
  adult: "dashboard",
  senior: "seniors",
  beta: "beta_testing",
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
  beta: "#0E7490",
};

/**
 * Public signup roles: age-band (parent/kids → adult) plus optional Beta Tester.
 * Never includes admin / QA / Dev — those stay admin-assigned.
 */
export function rolesForPublicRegister(
  ageGroup: "kids" | "junior" | "adult" | "senior" | string,
  applyBetaTester: boolean,
): GyshRole[] {
  const primary: GyshRole =
    ageGroup === "junior" ? "junior" : ageGroup === "senior" ? "senior" : "adult";
  return applyBetaTester ? [primary, "beta"] : [primary];
}

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

/**
 * Human QA tester id (stable slug). Known partners keep tina/evelyn/lyriq/candace;
 * anyone else with the QA role gets a slug from their name/email.
 */
export type QaTesterId = string;

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

const QA_ACCENT_FALLBACKS = [
  "#3d6b8c",
  "#8b5a2b",
  "#5c6b4a",
  "#6b3d5c",
  "#2f5d62",
  "#7a4e3a",
] as const;

/**
 * Seed / fallback roster + preferred accents for known partners.
 * Live UI lists come from {@link qaTestersFromUsers} (active Users with the QA role).
 */
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
  {
    id: "candace",
    name: "Candace Jackson",
    shortName: "Candace",
    accent: "#3d6b8c",
  },
];

function firstNameLabel(name: string): string {
  const first = String(name || "")
    .trim()
    .split(/\s+/)[0];
  return first || "QA";
}

/** Stable lowercase slug for a QA person (name first token, else email local-part). */
export function slugifyQaTesterId(name?: string, email?: string): string {
  const first = String(name || "")
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (first && first.length >= 2 && first !== "vitest" && first !== "playwright") return first;
  const local = String(email || "")
    .split("@")[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (local && local !== "vitest" && local !== "playwright") return local;
  return "";
}

/**
 * Map a Users Area person to a Testing Portal assignee id.
 * Prefers known partner ids; otherwise slugifies name/email.
 */
export function qaTesterIdForUser(u: {
  name?: string;
  email?: string;
  id?: string;
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
  if (email.includes("candace")) return "candace";
  const slug = slugifyQaTesterId(u.name, u.email);
  return slug || null;
}

function sortQaTesters(list: QaTester[]): QaTester[] {
  const order = new Map(QA_TESTERS.map((t, i) => [t.id, i]));
  return [...list].sort((a, b) => {
    const ai = order.has(a.id) ? order.get(a.id)! : 1000;
    const bi = order.has(b.id) ? order.get(b.id)! : 1000;
    if (ai !== bi) return ai - bi;
    return a.shortName.localeCompare(b.shortName, undefined, { sensitivity: "base" });
  });
}

/**
 * Active Users Area accounts with the QA role → Testing Portal chips / assignee dropdowns.
 * Falls back to {@link QA_TESTERS} when none are found (offline / empty Users).
 */
export function qaTestersFromUsers(users: readonly GyshUser[]): QaTester[] {
  const seen = new Set<string>();
  const out: QaTester[] = [];
  for (const u of users) {
    if (u.status !== "active") continue;
    if (!userHasRole(u, "qa")) continue;
    let id = qaTesterIdForUser(u);
    if (!id) continue;
    if (seen.has(id)) {
      const tail = String(u.id || "")
        .replace(/\W+/g, "")
        .slice(-4)
        .toLowerCase();
      id = tail ? `${id}-${tail}` : `${id}-${out.length + 1}`;
      if (seen.has(id)) continue;
    }
    seen.add(id);
    const catalog = QA_TESTERS.find((t) => t.id === id);
    out.push({
      id,
      name: String(u.name || "").trim() || catalog?.name || id,
      shortName: catalog?.shortName || firstNameLabel(u.name),
      accent: catalog?.accent || QA_ACCENT_FALLBACKS[out.length % QA_ACCENT_FALLBACKS.length]!,
    });
  }
  if (out.length === 0) return [...QA_TESTERS];
  return sortQaTesters(out);
}

/**
 * Active Users Area accounts with the Dev role, mapped to Testing Portal assignee ids.
 * Used for the Fail → Dev Assignee dropdown (Dev-only).
 */
export function devAssigneesFromUsers(users: readonly GyshUser[]): QaTester[] {
  const seen = new Set<string>();
  const out: QaTester[] = [];
  for (const u of users) {
    if (u.status !== "active") continue;
    if (!userHasRole(u, "dev")) continue;
    let id = qaTesterIdForUser(u);
    if (!id) continue;
    if (seen.has(id)) {
      const tail = String(u.id || "")
        .replace(/\W+/g, "")
        .slice(-4)
        .toLowerCase();
      id = tail ? `${id}-${tail}` : `${id}-${out.length + 1}`;
      if (seen.has(id)) continue;
    }
    seen.add(id);
    const catalog = QA_TESTERS.find((t) => t.id === id);
    out.push({
      id,
      name: String(u.name || "").trim() || catalog?.name || id,
      shortName: catalog?.shortName || firstNameLabel(u.name),
      accent: catalog?.accent || QA_ACCENT_FALLBACKS[out.length % QA_ACCENT_FALLBACKS.length]!,
    });
  }
  if (out.length === 0) {
    const lead = QA_TESTERS.find((t) => t.id === FAILED_TEST_ASSIGNEE);
    if (lead) out.push(lead);
  }
  return sortQaTesters(out);
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

/** @deprecated Prefer live {@link qaTestersFromUsers}; kept for catalog / offline fallback. */
export const HUMAN_QA_TESTER_IDS: readonly QaTesterId[] = QA_TESTERS.map((t) => t.id);

export function isAutomatedSuiteOwner(id: string): id is AutomatedSuiteOwnerId {
  return id === "vitest" || id === "playwright";
}

/** True for any non-empty assignee that is not an automated suite runner. */
export function isHumanQaTesterId(raw: string | null | undefined): raw is QaTesterId {
  const n = String(raw || "")
    .trim()
    .toLowerCase();
  if (!n || n === "unassigned") return false;
  return !isAutomatedSuiteOwner(n);
}

export function isHumanQaTester(id: string): id is QaTesterId {
  return isHumanQaTesterId(id);
}

/** Normalize a stored Testing Portal assignee to a canonical lowercase id (or ""). */
export function normalizeQaAssigneeId(raw: string | null | undefined): string {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

export function testOwnerLabel(
  id: TestOwnerId | string,
  qaTesters: readonly QaTester[] = QA_TESTERS,
): string {
  const human = qaTesters.find((t) => t.id === id) ?? QA_TESTERS.find((t) => t.id === id);
  if (human) return human.shortName;
  const auto = AUTOMATED_SUITE_OWNERS.find((t) => t.id === id);
  if (auto) return auto.shortName;
  if (!id) return "";
  return id.charAt(0).toUpperCase() + id.slice(1);
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
