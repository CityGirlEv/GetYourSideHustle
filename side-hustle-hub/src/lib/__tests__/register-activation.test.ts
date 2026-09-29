import { describe, expect, it } from "vitest";
import { pendingFreeAccountMaySignIn, registerUserStatus } from "../register-activation";

describe("register activation", () => {
  it("activates Free signups immediately and keeps paid plans pending", () => {
    expect(registerUserStatus("free")).toBe("active");
    expect(registerUserStatus("FREE")).toBe("active");
    expect(registerUserStatus("")).toBe("active");
    expect(registerUserStatus("starter")).toBe("pending");
    expect(registerUserStatus("pro")).toBe("pending");
    expect(registerUserStatus("elite")).toBe("pending");
  });

  it("lets a pending Free account sign in so Dashboard APIs work", () => {
    expect(
      pendingFreeAccountMaySignIn({ status: "pending", membershipTier: "free" }),
    ).toBe(true);
    expect(pendingFreeAccountMaySignIn({ status: "pending" })).toBe(true);
    expect(
      pendingFreeAccountMaySignIn({ status: "pending", membershipTier: "starter" }),
    ).toBe(false);
    expect(
      pendingFreeAccountMaySignIn({ status: "active", membershipTier: "free" }),
    ).toBe(false);
    expect(
      pendingFreeAccountMaySignIn({ status: "disabled", membershipTier: "free" }),
    ).toBe(false);
  });
});
