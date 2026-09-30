import { describe, expect, it } from "vitest";
import {
  MEMBER_PROFILE_NAME_MAX,
  PROFILE_EMAIL_TAKEN_ERROR,
  PROFILE_SAVE_SIGN_IN_ERROR,
  isProfileDashboardHash,
  parseMemberProfileUpdate,
  parseRequiredPhone,
  profileEmailConflictError,
  profileSaveAuthError,
  REGISTER_PHONE_INVALID_ERROR,
  REGISTER_PHONE_REQUIRED_ERROR,
} from "../member-profile";

describe("member profile basics", () => {
  it("opens the Profile tab from the dashboard hash", () => {
    expect(isProfileDashboardHash("#profile")).toBe(true);
    expect(isProfileDashboardHash("account")).toBe(true);
    expect(isProfileDashboardHash("#billing")).toBe(false);
  });

  it("saves trimmed name, canonical email, and optional phone", () => {
    expect(
      parseMemberProfileUpdate({
        name: "  Jane  Q  ",
        email: "  Jane.Q@Example.COM ",
        phone: " (555) 123-4567 ",
      }),
    ).toEqual({
      ok: true,
      profile: {
        name: "Jane Q",
        email: "jane.q@example.com",
        phone: "(555) 123-4567",
      },
    });
  });

  it("allows a blank phone", () => {
    const parsed = parseMemberProfileUpdate({
      name: "Sam",
      email: "sam@example.com",
      phone: "  ",
    });
    expect(parsed).toEqual({
      ok: true,
      profile: { name: "Sam", email: "sam@example.com", phone: "" },
    });
  });

  it("rejects missing name, invalid email, and too-short phone", () => {
    expect(parseMemberProfileUpdate({ name: " ", email: "sam@example.com" }).ok).toBe(false);
    expect(parseMemberProfileUpdate({ name: "Sam", email: "not-an-email" }).ok).toBe(false);
    expect(parseMemberProfileUpdate({ name: "Sam", email: "gone@users.deleted.local" }).ok).toBe(
      false,
    );
    expect(
      parseMemberProfileUpdate({ name: "Sam", email: "sam@example.com", phone: "123" }).ok,
    ).toBe(false);
    expect(
      parseMemberProfileUpdate({
        name: "x".repeat(MEMBER_PROFILE_NAME_MAX + 1),
        email: "sam@example.com",
      }).ok,
    ).toBe(false);
  });

  it("requires a phone number with 7–15 digits on registration", () => {
    expect(parseRequiredPhone("")).toEqual({ ok: false, error: REGISTER_PHONE_REQUIRED_ERROR });
    expect(parseRequiredPhone("   ")).toEqual({ ok: false, error: REGISTER_PHONE_REQUIRED_ERROR });
    expect(parseRequiredPhone("123")).toEqual({ ok: false, error: REGISTER_PHONE_INVALID_ERROR });
    expect(parseRequiredPhone("1".repeat(16))).toEqual({
      ok: false,
      error: REGISTER_PHONE_INVALID_ERROR,
    });
    expect(parseRequiredPhone("  (555) 123-4567  ")).toEqual({
      ok: true,
      phone: "(555) 123-4567",
    });
  });

  it("flags an email already used by a different user", () => {
    expect(
      profileEmailConflictError({
        actorId: "u-1",
        existingUser: { id: "u-2" },
      }),
    ).toBe(PROFILE_EMAIL_TAKEN_ERROR);
  });

  it("allows the same member to keep or recase their own email", () => {
    expect(
      profileEmailConflictError({
        actorId: "u-1",
        existingUser: { id: "u-1" },
      }),
    ).toBeNull();
    expect(profileEmailConflictError({ actorId: "u-1", existingUser: null })).toBeNull();
  });

  it("asks the member to sign in instead of showing Not authenticated", () => {
    expect(profileSaveAuthError("Not authenticated.")).toBe(PROFILE_SAVE_SIGN_IN_ERROR);
    expect(profileSaveAuthError("Session expired.")).toBe(PROFILE_SAVE_SIGN_IN_ERROR);
    expect(profileSaveAuthError(PROFILE_EMAIL_TAKEN_ERROR)).toBe(PROFILE_EMAIL_TAKEN_ERROR);
  });
});
