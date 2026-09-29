import { describe, expect, it } from "vitest";
import {
  canonicalizeEmail,
  LOGIN_BUTTON_LABEL,
  loginFailureFromApiError,
  normalizeEmail,
  userCanLogin,
} from "../auth";
import { ApiError } from "../api";
import { LOCAL_DEV_LOGIN_MESSAGE, TRANSIENT_DB_LOGIN_MESSAGE } from "../d1-errors";

describe("auth", () => {
  it("labels required-login buttons as Log in", () => {
    expect(LOGIN_BUTTON_LABEL).toBe("Log in");
  });

  it("normalizes email to lowercase trimmed", () => {
    expect(normalizeEmail("  TinaMarieBarham@Gmail.com ")).toBe("tinamariebarham@gmail.com");
  });

  it("canonicalizes Evelyn alias to primary email", () => {
    expect(canonicalizeEmail("evvelyn3@cox.net")).toBe("evelyn3@cox.net");
    expect(canonicalizeEmail("Evelyn3@Cox.net")).toBe("evelyn3@cox.net");
  });

  it("canonicalizes Candace misspelling to primary email", () => {
    expect(canonicalizeEmail("candicejackson1@icloud.com")).toBe("candacejackson1@icloud.com");
  });

  it("marks portal accounts with canLogin", () => {
    expect(userCanLogin({ canLogin: true })).toBe(true);
    expect(userCanLogin({})).toBe(false);
  });

  it("treats Cloudflare D1 internal errors as a retryable sign-in outage", () => {
    const result = loginFailureFromApiError(
      new ApiError("Server error: internal error; reference = rd67dvsars25cpaqmu1845a5", 500),
    );
    expect(result).toEqual({ outcome: "unavailable", error: TRANSIENT_DB_LOGIN_MESSAGE });
  });

  it("tells local Dev to wait for the D1 proxy restart instead of dumping a Cloudflare reference", () => {
    const result = loginFailureFromApiError(
      new ApiError("The database is busy. Wait a few seconds and try signing in again.", 503),
      { localDev: true },
    );
    expect(result).toEqual({ outcome: "unavailable", error: LOCAL_DEV_LOGIN_MESSAGE });
  });

  it("keeps wrong-password failures as invalid", () => {
    expect(loginFailureFromApiError(new ApiError("Invalid email or password.", 401))).toEqual({
      outcome: "invalid",
      error: "Invalid email or password.",
    });
  });
});
