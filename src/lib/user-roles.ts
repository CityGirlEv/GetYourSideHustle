import { LEADS_ADMIN_ROLE } from "./leads-admin";

/** Minimal user shape for role checks (matches useApp().user). */
export type UserRoleCheck = {
  role?: string | null;
  roles?: string[] | null;
};

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

function hasRole(user: UserRoleCheck, role: string): boolean {
  const target = normalizeRole(role);
  if (user.role && normalizeRole(user.role) === target) return true;
  return user.roles?.some((entry) => normalizeRole(entry) === target) ?? false;
}

/** True when the user has the primary admin role (Admin nav menu only — not editor/qa/leads_admin). */
export function userCanSeeAdminMenu(user: UserRoleCheck | null | undefined): boolean {
  if (!user) return false;
  return hasRole(user, "admin");
}

/** True when the user has the agent role (primary or in roles list). */
export function userHasAgentRole(user: UserRoleCheck | null | undefined): boolean {
  if (!user) return false;
  return hasRole(user, "agent");
}

/** True when the user has the QA role (primary or in roles list). */
export function userHasQaRole(user: UserRoleCheck | null | undefined): boolean {
  if (!user) return false;
  return hasRole(user, "qa");
}

/** True when the user has the Leads Admin role (primary or in roles list). */
export function userHasLeadsAdminRole(user: UserRoleCheck | null | undefined): boolean {
  if (!user) return false;
  return hasRole(user, LEADS_ADMIN_ROLE);
}

/** True when the user has admin or Leads Admin (staff admin portal access). */
export function userHasAdminRole(user: UserRoleCheck | null | undefined): boolean {
  if (!user) return false;
  return hasRole(user, "admin") || userHasLeadsAdminRole(user);
}

/** Agent or admin — upsell features (All Plans row, ZIP/county report, agent pricing tab). */
export function userCanAccessAgentUpsellFeatures(
  user: UserRoleCheck | null | undefined,
): boolean {
  if (!user) return false;
  return userHasAgentRole(user) || userCanSeeAdminMenu(user);
}

/** QA, agent, or admin — full national plan catalog (All Plans row, I-SNP filter). */
export function userCanAccessFullPlanCatalog(user: UserRoleCheck | null | undefined): boolean {
  if (!user) return false;
  return userHasQaRole(user) || userCanAccessAgentUpsellFeatures(user);
}

/** ZIP/county plans report tab — agent/admin only (individual modes gated separately). */
export function userCanAccessZipCountyReport(user: UserRoleCheck | null | undefined): boolean {
  return userCanAccessAgentUpsellFeatures(user);
}

/** Only Leads Admin can browse every scenario in the admin portal. */
export function userCanViewAllScenarios(user: UserRoleCheck | null | undefined): boolean {
  return userHasLeadsAdminRole(user);
}

/** Admin-only total on All Plans (row 2) header "All" pill; My Available row 1 always shows its count. */
export function userCanSeeAllPlanFilterCount(user: UserRoleCheck | null | undefined): boolean {
  return userCanSeeAdminMenu(user);
}

/** National All Plans filter row — logged-in QA, agent, or admin. */
export function userCanSeeAllPlansRow(user: UserRoleCheck | null | undefined): boolean {
  return userCanAccessFullPlanCatalog(user);
}

/**
 * I-SNP institutional SNP filter on All Plans and county reports.
 * Display-only upsell for MVP — all agents/admins see the filter; wire to
 * `i-snp-catalog` add-on ({@link packageIncludesFeature}) when tier billing ships.
 */
export function userCanAccessISnpCatalog(user: UserRoleCheck | null | undefined): boolean {
  return userCanAccessFullPlanCatalog(user);
}

/** @deprecated Use {@link userCanSeeAllPlanFilterCount}. */
export const userCanSeePlanFilterCounts = userCanSeeAllPlanFilterCount;
