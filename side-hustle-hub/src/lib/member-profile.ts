/**
 * Member profile basics (name, email, phone) — once per account, editable from My Dashboard.
 */
import { canonicalizeEmail } from "./auth";

export const PROFILE_DASHBOARD_HREF = "/my-dashboard#profile";

export function isProfileDashboardHash(hash: string): boolean {
  const h = String(hash || "")
    .replace(/^#/, "")
    .toLowerCase();
  return h === "profile" || h === "account";
}

export const MEMBER_PROFILE_NAME_MAX = 80;
export const MEMBER_PROFILE_PHONE_MIN_DIGITS = 7;
export const MEMBER_PROFILE_PHONE_MAX_DIGITS = 15;

export type MemberProfileFields = {
  name: string;
  email: string;
  phone: string;
};

export type MemberProfileParseResult =
  | { ok: true; profile: MemberProfileFields }
  | { ok: false; error: string };

/** Shown when the member tries to take an email already on a different account. */
export const PROFILE_EMAIL_TAKEN_ERROR =
  "That email is already on another account. Use a different email.";

export const PROFILE_SAVE_SIGN_IN_ERROR =
  "Sign in with this account’s email and password to save your profile. The dashboard was still open, but the login session is missing.";

type ProfileIdentity = {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  roles?: string[];
};

/** Keep admin/QA roles when a profile save comes back without them, and apply them when it includes them. */
export function applySavedMemberProfile<T extends ProfileIdentity>(
  current: T,
  saved: Partial<ProfileIdentity>,
): T {
  const roles =
    Array.isArray(saved.roles) && saved.roles.length > 0 ? saved.roles : current.roles;
  return {
    ...current,
    name: saved.name != null && String(saved.name).trim() ? String(saved.name) : current.name,
    email: saved.email != null && String(saved.email).trim() ? String(saved.email) : current.email,
    phone: saved.phone !== undefined ? String(saved.phone) : (current.phone ?? ""),
    role: saved.role ? String(saved.role) : current.role,
    roles,
  };
}

/** Map API auth failures to a save-profile message (avoid raw "Not authenticated."). */
export function profileSaveAuthError(message: string): string {
  if (/not authenticated|session invalid|session expired/i.test(String(message || ""))) {
    return PROFILE_SAVE_SIGN_IN_ERROR;
  }
  return String(message || "Could not save your profile.");
}

/** True when another user (not the signed-in member) already owns this email. */
export function profileEmailConflictError(input: {
  actorId: string;
  existingUser?: { id: string } | null;
}): string | null {
  const otherId = String(input.existingUser?.id || "").trim();
  const actorId = String(input.actorId || "").trim();
  if (!otherId || !actorId) return null;
  if (otherId === actorId) return null;
  return PROFILE_EMAIL_TAKEN_ERROR;
}

export function digitsOnly(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

/** Keep a readable phone string; empty is allowed. */
export function normalizePhone(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 32);
}

export const REGISTER_PHONE_REQUIRED_ERROR = "A phone number is required.";
export const REGISTER_PHONE_INVALID_ERROR = "Enter a 10-digit phone number.";
export const REGISTER_PHONE_DIGITS = 10;

/** Join, account registration, and workshop registration require a 10-digit phone number. */
export function parseRequiredPhone(
  value: unknown,
): { ok: true; phone: string } | { ok: false; error: string } {
  const phone = normalizePhone(value);
  if (!phone) return { ok: false, error: REGISTER_PHONE_REQUIRED_ERROR };
  const digits = digitsOnly(phone);
  if (digits.length !== REGISTER_PHONE_DIGITS) {
    return { ok: false, error: REGISTER_PHONE_INVALID_ERROR };
  }
  return { ok: true, phone };
}

export function parseMemberProfileUpdate(input: {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
}): MemberProfileParseResult {
  const name = String(input.name ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (name.length > MEMBER_PROFILE_NAME_MAX) {
    return { ok: false, error: `Name must be ${MEMBER_PROFILE_NAME_MAX} characters or fewer.` };
  }

  const email = canonicalizeEmail(String(input.email ?? ""));
  if (!email || !email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    return { ok: false, error: "A valid email is required." };
  }
  if (email.endsWith("@users.deleted.local")) {
    return { ok: false, error: "That email cannot be used." };
  }

  const phone = normalizePhone(input.phone);
  if (phone) {
    const digits = digitsOnly(phone);
    if (
      digits.length < MEMBER_PROFILE_PHONE_MIN_DIGITS ||
      digits.length > MEMBER_PROFILE_PHONE_MAX_DIGITS
    ) {
      return { ok: false, error: "Enter a valid phone number, or leave it blank." };
    }
  }

  return { ok: true, profile: { name, email, phone } };
}
