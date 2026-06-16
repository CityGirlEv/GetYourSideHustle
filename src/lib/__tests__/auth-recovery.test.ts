import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  RESET_PASSWORD_PATH,
  brandRecoveryConfirmationUrl,
  forgotPasswordEntryUrl,
  hasRecoveryTokensInUrl,
  passwordRecoveryRedirectUrl,
  rewriteRecoveryConfirmationUrl,
  supabaseAuthVerifyUrl,
} from "../auth-recovery";

describe("passwordRecoveryRedirectUrl", () => {
  it("points to /reset-password on the public site", () => {
    expect(passwordRecoveryRedirectUrl()).toMatch(/\/reset-password$/);
  });
});

describe("forgotPasswordEntryUrl", () => {
  it("points to the sign-in tab where users request a reset email", () => {
    expect(forgotPasswordEntryUrl()).toMatch(/\/auth\?tab=sign-in$/);
  });
});

describe("hasRecoveryTokensInUrl", () => {
  it("detects recovery hash fragments", () => {
    expect(
      hasRecoveryTokensInUrl({ hash: "#access_token=abc&type=recovery", search: "" }),
    ).toBe(true);
  });

  it("detects PKCE recovery query params", () => {
    expect(hasRecoveryTokensInUrl({ hash: "", search: "?code=abc&type=recovery" })).toBe(true);
  });

  it("returns false for ordinary URLs", () => {
    expect(hasRecoveryTokensInUrl({ hash: "", search: "?tab=sign-in" })).toBe(false);
  });
});

describe("brandRecoveryConfirmationUrl", () => {
  const target = "https://mypartb.com/reset-password";

  it("uses mypartb.com/auth/verify instead of supabase.co", () => {
    const input =
      "https://xiqknyrikpuysbkvpkju.supabase.co/auth/v1/verify?token=abc&type=recovery&redirect_to=https%3A%2F%2Fmypartb.com%2Fauth";
    const output = brandRecoveryConfirmationUrl(input, target);
    expect(output).toMatch(/^https:\/\/mypartb\.com\/auth\/verify\?/);
    expect(output).not.toContain("supabase.co");
    expect(decodeURIComponent(output)).toContain("token=abc");
    expect(decodeURIComponent(output)).toContain(target);
  });
});

describe("supabaseAuthVerifyUrl", () => {
  it("forwards query params to Supabase verify endpoint", () => {
    const params = new URLSearchParams("token=abc&type=recovery&redirect_to=https%3A%2F%2Fmypartb.com%2Freset-password");
    expect(supabaseAuthVerifyUrl(params, "https://project.supabase.co")).toBe(
      "https://project.supabase.co/auth/v1/verify?token=abc&type=recovery&redirect_to=https%3A%2F%2Fmypartb.com%2Freset-password",
    );
  });
});

describe("rewriteRecoveryConfirmationUrl", () => {
  const target = "https://mypartb.com/reset-password";

  it("rewrites redirect_to on Supabase verify links", () => {
    const input =
      "https://xiqknyrikpuysbkvpkju.supabase.co/auth/v1/verify?token=abc&type=recovery&redirect_to=https%3A%2F%2Fmypartb.com%2Fauth";
    const output = rewriteRecoveryConfirmationUrl(input, target);
    expect(output).toContain("redirect_to=");
    expect(decodeURIComponent(output)).toContain(target);
    expect(output).not.toContain("redirect_to=https%3A%2F%2Fmypartb.com%2Fauth");
  });

  it("leaves non-recovery URLs unchanged", () => {
    const input = "https://mypartb.com/auth?tab=sign-in";
    expect(rewriteRecoveryConfirmationUrl(input, target)).toBe(input);
  });
});

describe("RESET_PASSWORD_PATH", () => {
  it("is /reset-password", () => {
    expect(RESET_PASSWORD_PATH).toBe("/reset-password");
  });
});

describe("redirectToResetPasswordWithTokens", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.stubGlobal("location", {
      ...originalLocation,
      pathname: "/auth",
      search: "?code=abc&type=recovery",
      hash: "",
      replace: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preserves query and hash when redirecting", async () => {
    const { redirectToResetPasswordWithTokens } = await import("../auth-recovery");
    redirectToResetPasswordWithTokens();
    expect(window.location.replace).toHaveBeenCalledWith(
      "/reset-password?code=abc&type=recovery",
    );
  });
});
