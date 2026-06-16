import { describe, expect, it } from "vitest";
import { hasAgentDashboardAccess, isActiveSubscriptionStatus } from "@/lib/subscription-access";

describe("subscription-access", () => {
  it("treats active and trialing as active subscription statuses", () => {
    expect(isActiveSubscriptionStatus("active")).toBe(true);
    expect(isActiveSubscriptionStatus("trialing")).toBe(true);
    expect(isActiveSubscriptionStatus("past_due")).toBe(false);
    expect(isActiveSubscriptionStatus(null)).toBe(false);
  });

  it("allows admins regardless of subscription", () => {
    expect(
      hasAgentDashboardAccess({
        roles: ["admin"],
        subscription: null,
      }),
    ).toBe(true);
  });

  it("allows customer with active subscription", () => {
    expect(
      hasAgentDashboardAccess({
        roles: ["customer"],
        subscription: { status: "active", planKey: "subscription_intro", currentPeriodEnd: null, cancelAtPeriodEnd: false },
      }),
    ).toBe(true);
  });

  it("blocks customer without active subscription", () => {
    expect(
      hasAgentDashboardAccess({
        roles: ["customer"],
        subscription: { status: "canceled", planKey: "subscription_intro", currentPeriodEnd: null, cancelAtPeriodEnd: false },
      }),
    ).toBe(false);
  });

  it("blocks agent without active subscription", () => {
    expect(
      hasAgentDashboardAccess({
        roles: ["agent"],
        subscription: null,
      }),
    ).toBe(false);
  });
});
