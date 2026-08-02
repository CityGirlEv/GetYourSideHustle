/** GYSH login / register — production D1. */

import { api, ApiError, setSessionToken } from "./api";
import type { BlueprintAgeGroup } from "./gysh-analytics";

/** Marks this browser tab as an active signed-in session (dies when the tab closes). */
const TAB_ALIVE_KEY = "gysh_tab_alive";

function markTabAlive(): void {
  try {
    sessionStorage.setItem(TAB_ALIVE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function clearTabAlive(): void {
  try {
    sessionStorage.removeItem(TAB_ALIVE_KEY);
  } catch {
    /* ignore */
  }
}

function tabIsAlive(): boolean {
  try {
    return sessionStorage.getItem(TAB_ALIVE_KEY) === "1";
  } catch {
    return false;
  }
}

export type LoginOutcome = "admin" | "member" | "invalid" | "unavailable";

export type AuthAuditEntry = {
  at: string;
  action: string;
  email: string;
  detail: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  status: string;
  joinedAt: string;
  notes: string;
  canLogin: boolean;
  membershipTier?: string;
  /** adult | parent | kids | junior | senior */
  audience?: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function canonicalizeEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (normalized === "evvelyn3@cox.net") return "evelyn3@cox.net";
  return normalized;
}

export async function login(email: string, password: string): Promise<{
  outcome: LoginOutcome;
  user?: AuthUser;
  error?: string;
}> {
  if (!email.trim() || !password) {
    return { outcome: "invalid", error: "Email and password are required." };
  }
  try {
    const data = await api<{
      ok: boolean;
      user: AuthUser;
      token?: string;
      isAdmin?: boolean;
    }>("auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    setSessionToken(data.token ?? null);
    markTabAlive();
    const isAdmin =
      data.isAdmin === true ||
      data.user.role === "admin" ||
      data.user.role === "qa" ||
      data.user.role === "dev" ||
      (data.user.roles ?? []).some((r) => r === "admin" || r === "qa" || r === "dev");
    return { outcome: isAdmin ? "admin" : "member", user: data.user };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 0 || e.status === 503) {
        return { outcome: "unavailable", error: e.message };
      }
      return { outcome: "invalid", error: e.message || "Invalid email or password." };
    }
    return { outcome: "unavailable", error: "Database unavailable." };
  }
}

export async function registerFreeMember(input: {
  email: string;
  password: string;
  name?: string;
  ageGroup: BlueprintAgeGroup;
  childDisplayName?: string;
  claimToken?: string;
  /** Requested membership plan (free / starter / pro / elite). Paid plans still need activation. */
  membershipTier?: "free" | "starter" | "pro" | "elite";
}): Promise<{
  ok: boolean;
  user?: AuthUser;
  childProfileId?: string | null;
  kidUserId?: string | null;
  kidLoginEmail?: string | null;
  claimedBlueprintId?: string | null;
  error?: string;
}> {
  if (!input.email.trim() || !input.password) {
    return { ok: false, error: "Email and password are required." };
  }
  try {
    const data = await api<{
      ok: boolean;
      user: AuthUser;
      token?: string;
      childProfileId?: string | null;
      kidUserId?: string | null;
      kidLoginEmail?: string | null;
      claimedBlueprintId?: string | null;
    }>("auth/register", {
      method: "POST",
      auth: false,
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        ageGroup: input.ageGroup,
        childDisplayName: input.childDisplayName,
        claimToken: input.claimToken,
        membershipTier: input.membershipTier ?? "free",
      },
    });
    setSessionToken(data.token ?? null);
    markTabAlive();
    return {
      ok: true,
      user: data.user,
      childProfileId: data.childProfileId,
      kidUserId: data.kidUserId,
      kidLoginEmail: data.kidLoginEmail,
      claimedBlueprintId: data.claimedBlueprintId,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: "Registration unavailable. Try again later." };
  }
}

export async function logout(): Promise<void> {
  try {
    await api("auth/logout", { method: "POST" });
  } catch {
    /* still clear local session marker */
  }
  setSessionToken(null);
  clearTabAlive();
}

/**
 * Restore auth for this tab. Refresh keeps you signed in (sessionStorage survives).
 * A brand-new tab without a local marker must sign in again — but we do NOT call
 * logout() here, because that would wipe the server session used by other open tabs
 * and cause "Session invalid or expired" on Register My Kid / Dashboard actions.
 */
export async function restoreSession(): Promise<AuthUser | null> {
  if (!tabIsAlive()) {
    setSessionToken(null);
    clearTabAlive();
    return null;
  }
  markTabAlive();
  const user = await fetchMe();
  if (!user) {
    setSessionToken(null);
    clearTabAlive();
  }
  return user;
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const data = await api<{ user: AuthUser }>("auth/me");
    if (data.user) markTabAlive();
    return data.user;
  } catch {
    return null;
  }
}

export type ResetPasswordResult = { ok: true; message: string; email?: string } | { ok: false; error: string };

/** Request a one-time password reset email (checks account exists). */
export async function requestPasswordReset(email: string): Promise<ResetPasswordResult> {
  try {
    const data = await api<{ ok: boolean; message?: string }>("auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
    return {
      ok: true,
      message: data.message || "If that account exists, we emailed a reset link.",
    };
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : "Could not send password reset email.";
    return { ok: false, error: msg };
  }
}

/** Set a new password using the emailed reset token. */
export async function confirmPasswordReset(input: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ResetPasswordResult> {
  try {
    const data = await api<{ ok: boolean; message?: string; email?: string }>(
      "auth/confirm-password-reset",
      {
        method: "POST",
        body: input,
        auth: false,
      },
    );
    return {
      ok: true,
      message: data.message || "Password updated. Sign in with your new password.",
      email: data.email,
    };
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : "Password reset failed.";
    return { ok: false, error: msg };
  }
}

/** Change password when you know the current password. */
export async function resetPassword(input: {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ResetPasswordResult> {
  try {
    const data = await api<{ ok: boolean; message?: string }>("auth/reset-password", {
      method: "POST",
      body: input,
      auth: false,
    });
    return {
      ok: true,
      message: data.message || "Password updated. Sign in with your new password.",
    };
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : "Password reset failed.";
    return { ok: false, error: msg };
  }
}

export async function loadAuthAudit(): Promise<AuthAuditEntry[]> {
  const data = await api<{ events: AuthAuditEntry[] }>("audit");
  return data.events;
}

/** True when user has portal login capability (from DB). */
export function userCanLogin(u: { canLogin?: boolean }): boolean {
  return Boolean(u.canLogin);
}
