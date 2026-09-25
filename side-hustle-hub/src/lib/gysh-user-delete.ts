/** Co-founder rows that Users Area must not delete. */
export const PROTECTED_FOUNDER_USER_IDS = ["u-tina", "u-ev"] as const;

/** Tombstone domain so UNIQUE(email) frees the original address for re-signup. */
export const GYSH_DELETED_EMAIL_DOMAIN = "users.deleted.local";

export const GYSH_USER_DELETED_STATUS = "deleted" as const;

export function isProtectedFounderUserId(id: string | null | undefined): boolean {
  const key = String(id || "").trim();
  return (PROTECTED_FOUNDER_USER_IDS as readonly string[]).includes(key);
}

/** Unique placeholder email for a soft-deleted account (keeps the row). */
export function gyshUserDeletedEmailTombstone(userId: string): string {
  const id =
    String(userId || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "") || "unknown";
  return `deleted.${id}@${GYSH_DELETED_EMAIL_DOMAIN}`;
}

export function isGyshUserDeletedEmail(email: string | null | undefined): boolean {
  const key = String(email || "")
    .trim()
    .toLowerCase();
  return key.endsWith(`@${GYSH_DELETED_EMAIL_DOMAIN}`);
}

export function isGyshUserDeletedStatus(status: string | null | undefined): boolean {
  return String(status || "").trim().toLowerCase() === GYSH_USER_DELETED_STATUS;
}

export function isDeletedGyshUser(user: {
  status?: string | null;
  email?: string | null;
}): boolean {
  return isGyshUserDeletedStatus(user.status) || isGyshUserDeletedEmail(user.email);
}

/** Users Area list: hide deleted accounts unless the admin turns the control on. */
export function filterDirectoryUsers<T extends { status?: string | null; email?: string | null }>(
  users: readonly T[],
  showDeleted: boolean,
): T[] {
  if (showDeleted) return [...users];
  return users.filter((u) => !isDeletedGyshUser(u));
}

export function countDeletedDirectoryUsers<T extends { status?: string | null; email?: string | null }>(
  users: readonly T[],
): number {
  return users.filter(isDeletedGyshUser).length;
}

/**
 * Memberships (and similar dashboards): totals always exclude deleted accounts,
 * even when the admin turns on “show deleted” for the list.
 */
export function membershipDirectoryView<T extends { status?: string | null; email?: string | null }>(
  users: readonly T[],
  showDeleted: boolean,
): { forCounts: T[]; forList: T[]; deletedCount: number } {
  return {
    forCounts: filterDirectoryUsers(users, false),
    forList: filterDirectoryUsers(users, showDeleted),
    deletedCount: countDeletedDirectoryUsers(users),
  };
}

export function userMatchesDirectoryStatus(
  user: { status?: string | null; email?: string | null },
  statusFilter: string,
): boolean {
  const want = String(statusFilter || "all").trim().toLowerCase();
  if (!want || want === "all") return true;
  if (want === GYSH_USER_DELETED_STATUS) return isDeletedGyshUser(user);
  return String(user.status || "").trim().toLowerCase() === want;
}

/** `GET /api/users?includeDeleted=1` — other admin pages keep the default (hide). */
export function usersListIncludesDeleted(requestUrl: string | null | undefined): boolean {
  try {
    const url = new URL(String(requestUrl || ""), "https://getyoursidehustle.com");
    const raw = url.searchParams.get("includeDeleted") ?? url.searchParams.get("showDeleted") ?? "";
    return raw === "1" || raw.toLowerCase() === "true";
  } catch {
    return false;
  }
}

/** Copy for the in-app “Are you sure?” step before a user is soft-deleted. */
export function gyshUserDeleteConfirmMessage(opts: {
  name?: string | null;
  email?: string | null;
}): string {
  const name = String(opts.name || "").trim() || "this user";
  const email = String(opts.email || "").trim();
  const who = email ? `${name} (${email})` : name;
  return `Are you sure you want to delete ${who}? The account will be flagged deleted (kept on file). That email can sign up again as a new account.`;
}

/** Why a Users Area delete should be refused, or null when it is allowed. */
export function gyshUserDeleteBlockReason(opts: {
  targetId: string;
  actorId?: string | null;
}): string | null {
  const targetId = String(opts.targetId || "").trim();
  if (!targetId) return "User id is required.";
  if (isProtectedFounderUserId(targetId)) {
    return "Cannot delete co-founder admin accounts.";
  }
  const actorId = String(opts.actorId || "").trim();
  if (actorId && actorId === targetId) {
    return "You cannot delete your own account.";
  }
  return null;
}

/** Why clearing a paid membership back to Free should be refused. */
export function gyshMembershipClearBlockReason(opts: {
  targetId: string;
  currentTier?: string | null;
}): string | null {
  const targetId = String(opts.targetId || "").trim();
  if (!targetId) return "User id is required.";
  const tier = String(opts.currentTier || "free").toLowerCase();
  if (!tier || tier === "free") {
    return "This member is already on Free.";
  }
  return null;
}
