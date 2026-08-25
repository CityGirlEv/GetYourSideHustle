import { describe, expect, it } from "vitest";
import { normalizeEmail, canonicalizeEmail, userCanLogin } from "../auth";

describe("auth", () => {
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
});
