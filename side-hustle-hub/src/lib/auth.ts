/** GYSH login / register — production D1. */

import { api, ApiError, setSessionToken } from "./api";
import { clearAlaCarteCart } from "./alacarte-cart";
import { isLocalDevHost, isRetryableD1ApiError, loginUnavailableMessage } from "./d1-errors";
import {
  SESSION_RESTORE_TIMEOUT_MS,
  shouldClearSessionOnMeFailure,
} from "./first-load";
import type { BlueprintAgeGroup } from "./gysh-analytics";
import {
  readTabAlive,
  shouldPersistSessionLocally,
  writeTabAlive,
} from "./session-storage";

/** Button label whenever GYSH requires an existing member to authenticate. */
export const LOGIN_BUTTON_LABEL = "Log in";

function markTabAlive(): void {
  writeTabAlive(true);
}

function clearTabAlive(): void {
  writeTabAlive(false);
}

function tabIsAlive(): boolean {
  return readTabAlive();
}

/** True when this tab already restored a session (refresh). Used so a slow /auth/me doesn't kick Admin to Login. */
export function hasActiveTabSession(): boolean {
  return tabIsAlive();
}

export type LoginOutcome = "admin" | "member" | "invalid" | "unavailable";

export function loginFailureFromApiError(
  e: ApiError,
  opts?: { localDev?: boolean },
): { outcome: LoginOutcome; error: string } {
  if (
    e.status === 0 ||
    e.status === 503 ||
    (e.status >= 500 && isRetryableD1ApiError(e.message))
  ) {
    return { outcome: "unavailable", error: loginUnavailableMessage(opts) };
  }
  return { outcome: "invalid", error: e.message || "Invalid email or password." };
}

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
  // Common misspelling of Candace's login
  if (normalized === "candicejackson1@icloud.com") return "candacejackson1@icloud.com";
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
      (data.user.roles ?? []).includes("admin");
    return { outcome: isAdmin ? "admin" : "member", user: data.user };
  } catch (e) {
    if (e instanceof ApiError) {
      const localDev =
        typeof window !== "undefined" && isLocalDevHost(window.location.hostname);
      return loginFailureFromApiError(e, { localDev });
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
  pendingBlueprint?: {
    ageGroup: BlueprintAgeGroup;
    answers: Record<string, unknown>;
    resultIds: string[];
    resultPcts?: Record<string, number>;
  };
  /** Requested membership plan (free / starter / pro / elite). Paid plans still need activation. */
  membershipTier?: "free" | "starter" | "pro" | "elite";
  /** Complimentary GYSH merch (hat / T-shirt) chosen at signup. */
  merchChoices?: Array<"tshirt" | "hat">;
  /** Applicant selected the Beta Tester role at signup. */
  applyBetaTester?: boolean;
  betaNda?: {
    agreed: boolean;
    legalName: string;
    email: string;
    signature: string;
    ndaVersion?: string;
  };
}): Promise<{
  ok: boolean;
  user?: AuthUser;
  betaNda?: {
    version: string;
    acceptedAt: string;
    legalName: string;
    userId: string;
  } | null;
  testingUnlocked?: boolean;
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
      betaNda?: {
        version: string;
        acceptedAt: string;
        legalName: string;
        userId: string;
      } | null;
      testingUnlocked?: boolean;
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
        pendingBlueprint: input.pendingBlueprint,
        membershipTier: input.membershipTier ?? "free",
        merchChoices: input.merchChoices,
        applyBetaTester: input.applyBetaTester === true,
        betaNda: input.applyBetaTester === true ? input.betaNda : undefined,
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
      betaNda: data.betaNda ?? null,
      testingUnlocked: data.testingUnlocked === true,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: "Registration unavailable. Try again later." };
  }
}

export async function logout(): Promise<void> {
  setSessionToken(null);
  clearTabAlive();
  clearAlaCarteCart();
  try {
    await api("auth/logout", { method: "POST" });
  } catch {
    /* cookie clear is best-effort — local session is already gone */
  }
}

/**
 * Restore auth after refresh / new tab.
 * Production: same-tab refresh only (sessionStorage). Closing the tab requires sign-in.
 * Localhost: localStorage + durable cookie so Dev stays signed in across tabs/restarts.
 * We do NOT call logout() when the marker is missing — that would wipe other open tabs.
 */
export async function restoreSession(): Promise<AuthUser | null> {
  const localPersist =
    typeof window !== "undefined" && shouldPersistSessionLocally(window.location.hostname);

  if (!tabIsAlive()) {
    if (!localPersist) {
      setSessionToken(null);
      clearTabAlive();
      return null;
    }
    // Localhost: try cookie / persisted bearer even after a cold start.
  } else {
    markTabAlive();
  }
  try {
    const data = await api<{ user: AuthUser }>("auth/me", {
      timeoutMs: SESSION_RESTORE_TIMEOUT_MS,
    });
    if (data.user) {
      markTabAlive();
      return data.user;
    }
    setSessionToken(null);
    clearTabAlive();
    return null;
  } catch (e) {
    if (e instanceof ApiError && shouldClearSessionOnMeFailure(e.status)) {
      setSessionToken(null);
      clearTabAlive();
    }
    return null;
  }
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

/** Add / change membership plan on the logged-in member's profile. */
export async function updateMembershipPlan(input: {
  membershipTier: "free" | "starter" | "pro" | "elite";
  audience: "kids" | "junior" | "adult" | "senior";
  merchChoices?: Array<"tshirt" | "hat">;
  /** Admin-only: apply paid tier without Stripe / Kid Credit checkout. */
  adminSimulatePayment?: boolean;
}): Promise<{ ok: boolean; user?: AuthUser; error?: string; message?: string }> {
  try {
    const data = await api<{ ok: boolean; user: AuthUser; message?: string }>(
      "auth/membership-plan",
      {
        method: "POST",
        body: {
          membershipTier: input.membershipTier,
          audience: input.audience,
          merchChoices: input.merchChoices,
          adminSimulatePayment: input.adminSimulatePayment === true,
        },
      },
    );
    return { ok: true, user: data.user, message: data.message };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not update membership plan." };
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
