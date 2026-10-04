import { describe, expect, it } from "vitest";
import { pendingFreeAccountMaySignIn, registerUserStatus } from "../register-activation";

describe("register activation", () => {
  it("keeps every new membership pending until the verification email is clicked", () => {
    expect(registerUserStatus("free")).toBe("pending");
    expect(registerUserStatus("FREE")).toBe("pending");
    expect(registerUserStatus("")).toBe("pending");
    expect(registerUserStatus("starter")).toBe("pending");
    expect(registerUserStatus("pro")).toBe("pending");
    expect(registerUserStatus("elite")).toBe("pending");
  });

  it("does not activate a pending membership just because they try to sign in", () => {
    expect(
      pendingFreeAccountMaySignIn({ status: "pending", membershipTier: "free" }),
    ).toBe(false);
    expect(pendingFreeAccountMaySignIn({ status: "pending" })).toBe(false);
    expect(
      pendingFreeAccountMaySignIn({ status: "pending", membershipTier: "starter" }),
    ).toBe(false);
    expect(
      pendingFreeAccountMaySignIn({ status: "active", membershipTier: "free" }),
    ).toBe(false);
  });
});
