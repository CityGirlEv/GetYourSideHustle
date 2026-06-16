// Pure helpers for role-based data scoping in the testing/tasks views.
//
// QA users see ONLY their own tests/tasks and cannot widen the assignee
// filter. Admins (and other roles) see everyone. Agents see scenarios they
// created or were assigned to (handled in src/routes/agent.tsx via the
// query directly).
//
// These helpers are extracted so the predicate is unit-testable without
// rendering the full route.

export type ScopingUser =
  | {
      role?: string | null;
      roles?: string[] | null;
      full_name?: string | null;
      email?: string | null;
    }
  | null
  | undefined;

function toDisplayFirstName(value: string): string {
  const first = value.trim().split(/\s+/)[0] || "";
  if (!first) return "";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/** First name used to match a QA user against a test's assignee label. */
export function getQaFirstName(user: ScopingUser): string {
  if (!user || user.role !== "qa") return "";
  const fullName = (user.full_name || "").trim();
  if (fullName) return toDisplayFirstName(fullName);
  const emailLocal = (user.email || "").trim().split("@")[0] || "";
  const nameish = emailLocal.split(/[._-]+/)[0] || emailLocal;
  return toDisplayFirstName(nameish);
}

/** True when the current user must only see their own rows. */
export function shouldRestrictToSelf(user: ScopingUser): boolean {
  if (!user || user.role !== "qa") return false;
  if (user.roles?.includes("admin") || user.roles?.includes("leads_admin")) return false;
  return true;
}

/** Owners a non-admin QA can see or assign: themselves plus Unassigned. */
export function getQaVisibleOwners(user: ScopingUser): string[] {
  if (!shouldRestrictToSelf(user)) return [];
  return Array.from(new Set([getQaFirstName(user), "Unassigned"].filter(Boolean)));
}

export function canQaSeeOwner(user: ScopingUser, owner: string): boolean {
  if (!shouldRestrictToSelf(user)) return true;
  return getQaVisibleOwners(user).includes(owner);
}

/**
 * Filter a list of items down to the current user's own rows when scoping
 * applies. `getAssignee` returns the assignee label (typically a first name)
 * for an item. Non-restricted users get the full list back unchanged.
 */
export function filterToOwnAssignments<T>(
  items: readonly T[],
  user: ScopingUser,
  getAssignee: (item: T) => string,
): T[] {
  if (!shouldRestrictToSelf(user)) return [...items];
  return items.filter((it) => canQaSeeOwner(user, getAssignee(it)));
}
