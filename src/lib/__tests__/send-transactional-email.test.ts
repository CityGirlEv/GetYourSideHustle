import { describe, it, expect } from "vitest";
import { formatResendDeliveryError, isResendSandboxRestriction } from "../send-transactional-email";

describe("isResendSandboxRestriction", () => {
  it("detects raw Resend domain errors", () => {
    expect(
      isResendSandboxRestriction(
        "The mypartb.com domain is not verified. Please, add and verify your domain",
      ),
    ).toBe(true);
  });

  it("detects our formatted domain verification delivery error", () => {
    const formatted = formatResendDeliveryError(
      403,
      "The mypartb.com domain is not verified. Please, add and verify your domain",
    );
    expect(formatted).toContain("[resend-domain-not-verified]");
    expect(formatted).toContain("upload-resend-secret.mjs");
    expect(isResendSandboxRestriction(formatted)).toBe(true);
  });
});
