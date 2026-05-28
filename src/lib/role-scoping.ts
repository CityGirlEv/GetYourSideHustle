// Pure helpers for role-based data scoping in the testing/tasks views.
//
// QA users see ONLY their own tests/tasks and cannot widen the assignee
// filter. Admins (and other roles) see everyone. Agents see scenarios they
// created or were assigned to (handled in src/routes/agent.tsx via the
// query directly).
//
// These helpers are extracted so the predicate is unit-testable without
// rendering the full route.

export type ScopingUser = {
  role?: string | null;
  full_name?: string | null;
  email?: string | null;
} | null | undefined;

/** First name used to match a QA user against a test's assignee label. */
export function getQaFirstName(user: ScopingUser): string {
  if (!user || user.role !== "qa") return "";
  const source = (user.full_name || user.email || "").trim();
  if (!source) return "";
  return source.split(/\s+/)[0] || "";
}

/** True when the current user must only see their own rows. */
export function shouldRestrictToSelf(user: ScopingUser): boolean {
  return !!user && user.role === "qa";
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
  const me = getQaFirstName(user);
  if (!me) return [];
  return items.filter((it) => getAssignee(it) === me);
}