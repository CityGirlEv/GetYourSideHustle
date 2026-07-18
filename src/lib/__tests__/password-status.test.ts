import { describe, it, expect } from "vitest";
import { userNeedsPasswordSetup } from "@/lib/password-status.server";

describe("userNeedsPasswordSetup", () => {
  it("returns true when password_confirmed_at is null", () => {
    expect(userNeedsPasswordSetup(null)).toBe(true);
    expect(userNeedsPasswordSetup(undefined)).toBe(true);
  });

  it("returns false when password_confirmed_at is set", () => {
    expect(userNeedsPasswordSetup("2026-06-15T12:00:00.000Z")).toBe(false);
  });
});

describe("welcome email no-password copy", () => {
  it("documents needsPasswordSetup merge field for enabled legacy users", async () => {
    const { render } = await import("@react-email/components");
    const { template } = await import("@/lib/email-templates/welcome");
    const html = await render(
      template.component({
        recipientName: "Jane",
        signInUrl: "https://www.mypartb.com/auth?tab=sign-in",
        forgotPasswordUrl: "https://www.mypartb.com/auth?tab=sign-in",
        resetPasswordUrl: "https://www.mypartb.com/auth/verify?token=abc&type=recovery",
        needsPasswordSetup: true,
      }),
    );
    expect(html).toContain("never set one");
    expect(html).toContain("Set your password");
    expect(html).toContain("Forgot / Reset Password");
    expect(html).toContain("phone and computer");
  });

  it("uses standard sign-in copy when password was already confirmed", async () => {
    const { render } = await import("@react-email/components");
    const { template } = await import("@/lib/email-templates/welcome");
    const html = await render(
      template.component({
        recipientName: "Jane",
        signInUrl: "https://www.mypartb.com/auth?tab=sign-in",
        forgotPasswordUrl: "https://www.mypartb.com/auth?tab=sign-in",
        needsPasswordSetup: false,
      }),
    );
    expect(html).not.toContain("never set one");
    expect(html).toContain("Sign in");
  });
});
