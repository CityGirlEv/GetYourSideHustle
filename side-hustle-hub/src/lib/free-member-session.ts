import type { BlueprintAgeGroup } from "./gysh-analytics";
import { getLocalStore } from "./browser-storage";

/** Client-side free GYSH member marker for Blueprint unlock (no child PII). */
export const FREE_MEMBER_SESSION_KEY = "gysh_free_member_v1";

export type FreeMemberSession = {
  version: 1;
  /** Adult/Teens/Senior email, or parent email for Kids — never a child under 13. */
  email: string;
  ageGroup: BlueprintAgeGroup;
  /** When ageGroup is kids, marks parent-owned family account. */
  isParentAccount?: boolean;
  createdAt: string;
};

export function grantFreeMemberSession(input: {
  email: string;
  ageGroup: BlueprintAgeGroup;
  isParentAccount?: boolean;
}): FreeMemberSession {
  const email = input.email.trim().toLowerCase();
  const session: FreeMemberSession = {
    version: 1,
    email,
    ageGroup: input.ageGroup,
    isParentAccount: input.isParentAccount,
    createdAt: new Date().toISOString(),
  };
  getLocalStore().setItem(FREE_MEMBER_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function readFreeMemberSession(): FreeMemberSession | null {
  try {
    const raw = getLocalStore().getItem(FREE_MEMBER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FreeMemberSession;
    if (!parsed?.email || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasFreeMemberSession(): boolean {
  return readFreeMemberSession() != null;
}

export function clearFreeMemberSession(): void {
  getLocalStore().removeItem(FREE_MEMBER_SESSION_KEY);
}

/** Blueprint unlock = portal login OR free member session OR kids/junior team membership. */
export function hasBlueprintAccess(options: {
  isLoggedIn?: boolean;
  ageGroup: BlueprintAgeGroup;
  hasTeamMembership?: boolean;
  /** Profile Switcher → Unlogged in User: force locked Blueprint preview. */
  previewAsGuest?: boolean;
}): boolean {
  if (options.previewAsGuest) return false;
  if (options.isLoggedIn) return true;
  if (hasFreeMemberSession()) return true;
  if (
    (options.ageGroup === "kids" || options.ageGroup === "junior") &&
    options.hasTeamMembership
  ) {
    return true;
  }
  return false;
}
