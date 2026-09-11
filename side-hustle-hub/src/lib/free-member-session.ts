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

/**
 * Ranked wizard matches require a signed-in GYSH account (Free or higher).
 * Guests, localStorage “free session” markers, and Kids/Teens team join do not unlock results.
 */
export function hasBlueprintAccess(options: {
  isLoggedIn?: boolean;
  ageGroup: BlueprintAgeGroup;
  /** @deprecated Lightweight Kids/Teens team join does not unlock wizard results. */
  hasTeamMembership?: boolean;
  /** Profile Switcher → Unlogged in User: force locked Blueprint preview. */
  previewAsGuest?: boolean;
}): boolean {
  if (options.previewAsGuest) return false;
  return Boolean(options.isLoggedIn);
}

/** Guests see zero ranked cards. Free (or higher) members see the full ranked list. */
export function visibleBlueprintMatches<T>(matches: T[], unlocked: boolean): T[] {
  return unlocked ? matches : [];
}
