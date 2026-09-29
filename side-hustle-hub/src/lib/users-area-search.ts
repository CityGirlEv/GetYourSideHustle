/**
 * Users Area listing search — substring or * / ? wildcards (same rules as the Guide library).
 */
import { textMatchesWildcardQuery } from "./guide-library-search";

export type UsersAreaSearchable = {
  name?: string | null;
  email?: string | null;
  notes?: string | null;
  membershipTier?: string | null;
  audience?: string | null;
  heardAbout?: string | null;
  status?: string | null;
  role?: string | null;
  roles?: string[] | null;
};

export function userAdminSearchFields(user: UsersAreaSearchable): string[] {
  const roleBits = [user.role, ...(user.roles ?? [])].filter(Boolean);
  return [
    user.name,
    user.email,
    user.notes,
    user.membershipTier,
    user.audience,
    user.heardAbout,
    user.status,
    ...roleBits,
  ].map((p) => String(p || "").trim());
}

export function userAdminSearchHaystack(user: UsersAreaSearchable): string {
  return userAdminSearchFields(user).filter(Boolean).join(" ");
}

/** True when this member should appear for the Users Area search box. */
export function userMatchesAdminSearch(
  user: UsersAreaSearchable,
  rawQuery: string,
): boolean {
  const q = String(rawQuery || "").trim();
  if (!q) return true;
  const fields = userAdminSearchFields(user);
  if (!/[*?]/.test(q)) {
    return fields.some((field) => textMatchesWildcardQuery(field, q));
  }
  if (textMatchesWildcardQuery(userAdminSearchHaystack(user), q)) return true;
  return fields.some((field) => textMatchesWildcardQuery(field, q));
}

export function usersAreaSearchEmptyCopy(opts: {
  searchQuery: string;
  roleFiltered: boolean;
  statusFiltered: boolean;
}): string {
  const q = String(opts.searchQuery || "").trim();
  if (q) {
    return `No users match “${q}”. Try a different name or email, * or ? wildcards, or clear search.`;
  }
  if (opts.roleFiltered || opts.statusFiltered) {
    return "No users match the current filters. Choose All users (and All statuses) to see everyone.";
  }
  return "No users yet.";
}
