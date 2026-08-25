import { describe, expect, it, beforeEach } from "vitest";
import {
  clearPendingMembershipCheckout,
  pendingShouldResumeCheckout,
  readPendingMembershipCheckout,
  savePendingMembershipCheckout,
} from "../pending-membership-checkout";

describe("pending membership checkout", () => {
  beforeEach(() => {
    clearPendingMembershipCheckout();
  });

  it("saves and reads tier + audience for post-login resume", () => {
    savePendingMembershipCheckout({
      tierId: "pro",
      audience: "adult",
      resumeCheckout: true,
    });
    expect(readPendingMembershipCheckout()).toEqual({
      tierId: "pro",
      audience: "adult",
      resumeCheckout: true,
    });
    clearPendingMembershipCheckout();
    expect(readPendingMembershipCheckout()).toBeNull();
  });

  it("resumes checkout only for paid adult/senior plans", () => {
    expect(pendingShouldResumeCheckout("starter", "adult")).toBe(true);
    expect(pendingShouldResumeCheckout("elite", "senior")).toBe(true);
    expect(pendingShouldResumeCheckout("free", "adult")).toBe(false);
    expect(pendingShouldResumeCheckout("starter", "kids")).toBe(false);
  });
});
