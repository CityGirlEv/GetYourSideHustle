import { compareStaffByDisplayName } from "@/lib/staff-name-sort";

/** Whether a QA-role user can be assigned work (confirmed email or admin). */

export function qaRosterEligible(
  userId: string,
  confirmedIds: Set<string>,
  adminIds: Set<string>,
): boolean {
  return confirmedIds.has(userId) || adminIds.has(userId);
}

export type QaAssigneeRosterUser = {
  id: string;
  fullName: string;
  banned: boolean;
};

type AuthUserLike = {
  user_metadata?: Record<string, unknown> | null;
  email?: string | null;
  banned_until?: string | null;
};

type ProfileLike = {
  full_name?: string | null;
};

/**
 * Resolve every user_roles QA id to a roster row. Profile names are used even
 * when the auth user is missing from a paginated listUsers response.
 */
export function buildQaRosterUsers(
  ids: readonly string[],
  profiles: ReadonlyMap<string, ProfileLike>,
  authById: ReadonlyMap<string, AuthUserLike>,
): QaAssigneeRosterUser[] {
  return ids.map((id) => {
    const u = authById.get(id);
    const profile = profiles.get(id);
    const bannedUntil = u?.banned_until ?? null;
    const banned = !!(bannedUntil && new Date(bannedUntil).getTime() > Date.now());
    const fullName =
      profile?.full_name || (u?.user_metadata?.full_name as string) || u?.email || "";
    return { id, fullName, banned };
  });
}

/**
 * Build QA owner dropdown entries from every QA-role user. All names appear
 * and are assignable regardless of enabled or email-confirmed status.
 */
export function buildQaAssigneeEntries(
  qaUsers: readonly QaAssigneeRosterUser[],
): { name: string; active: boolean }[] {
  const byFirst = new Map<string, { name: string; active: boolean; sortName: string }>();
  for (const u of qaUsers) {
    const full = u.fullName.trim();
    if (!full) continue;
    const first = full.split(/\s+/)[0];
    if (!first) continue;
    if (!byFirst.has(first)) {
      byFirst.set(first, { name: first, active: true, sortName: full });
    }
  }
  return Array.from(byFirst.values())
    .sort((a, b) => compareStaffByDisplayName(a.sortName, b.sortName))
    .map(({ name, active }) => ({ name, active }));
}
