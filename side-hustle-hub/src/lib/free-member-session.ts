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

/** Synthetic user for the local Free-signup marker — not an API session. */
export const PENDING_FREE_AUTH_USER_ID = "free-pending";

/** True when the dashboard was hydrated from localStorage with no login token. */
export function isPendingFreePlaceholderUser(
  user: { id?: string | null } | null | undefined,
): boolean {
  return String(user?.id || "").trim() === PENDING_FREE_AUTH_USER_ID;
}

/** Keep pending Free signups usable until admin activation issues a real login token. */
export function pendingFreeAuthUser(session: FreeMemberSession | null): {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  status: string;
  joinedAt: string;
  notes: string;
  canLogin: boolean;
  membershipTier: "free";
  audience: string;
} | null {
  if (!session?.email) return null;
  const audience =
    session.ageGroup === "kids" || session.isParentAccount ? "parent" : session.ageGroup;
  return {
    id: PENDING_FREE_AUTH_USER_ID,
    name: "Free member",
    email: session.email,
    role: "member",
    roles: ["member"],
    status: "pending",
    joinedAt: session.createdAt.slice(0, 10),
    notes: "",
    canLogin: false,
    membershipTier: "free",
    audience,
  };
}

/**
 * Ranked wizard matches require a signed-in GYSH account (Free or higher).
 * Guests, localStorage “free session” markers, and Kids/Teens team join do not unlock results.
 * Admin / QA accounts count as logged in — do not exclude staff from their own Blueprint.
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

/**
 * Kids / Teens / Senior hubs + Match Wizard ranking follow the portal session.
 * Any signed-in GYSH account (Free+) is a member, including Admin and QA.
 * Use Profile Switcher → Unlogged in User to preview the guest Unlock Blueprint gate.
 */
export function portalSessionUnlocksBlueprint(options: {
  isLoggedIn: boolean;
  previewAsGuest?: boolean;
}): boolean {
  return hasBlueprintAccess({
    isLoggedIn: options.isLoggedIn,
    previewAsGuest: options.previewAsGuest,
    ageGroup: "adult",
  });
}

/** Guests see only their one lifetime extra (if claimed). Members see the full ranked list. */
export function visibleBlueprintMatches<T extends { id?: string }>(
  matches: T[],
  unlocked: boolean,
  extraGuideId?: string | null,
): T[] {
  if (unlocked) return matches;
  const extra = extraGuideId?.trim();
  if (!extra) return [];
  return matches.filter((row) => row.id === extra);
}
