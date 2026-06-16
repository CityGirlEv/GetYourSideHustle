export const LEADS_ADMIN_ROLE = "leads_admin" as const;
export const LEADS_ADMIN_OWNER_EMAIL = "evelyn3@cox.net";

export function isLeadsAdminOwnerEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === LEADS_ADMIN_OWNER_EMAIL;
}

/** Only the platform owner may add/remove Leads Admin on their own account. */
export function canManageLeadsAdminRole(
  actorEmail: string | null | undefined,
  targetUserId: string,
  actorUserId: string,
): boolean {
  return isLeadsAdminOwnerEmail(actorEmail) && targetUserId === actorUserId;
}
