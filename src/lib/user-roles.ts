import { LEADS_ADMIN_ROLE } from "./leads-admin";

/** Minimal user shape for role checks (matches useApp().user). */
export type UserRoleCheck = {
  role?: string | null;
  roles?: string[] | null;
};

function hasRole(user: UserRoleCheck, role: string): boolean {
  if (user.role === role) return true;
  return user.roles?.includes(role) ?? false;
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

/** Only Leads Admin can browse every scenario in the admin portal. */
export function userCanViewAllScenarios(user: UserRoleCheck | null | undefined): boolean {
  return userHasLeadsAdminRole(user);
}
