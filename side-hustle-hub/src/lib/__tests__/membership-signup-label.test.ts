import { describe, expect, it } from "vitest";
import {
  browseGuidesButtonLabel,
  memberGuidesButtonLabel,
  membershipAlaCarteCheckoutNote,
  membershipPlanBubbles,
  membershipPlanChooseLabel,
  membershipSignupSubmitLabel,
  membershipStripeCheckoutHint,
  membershipUpgradeActionBubbles,
} from "../membership-signup-labels";

describe("membershipSignupSubmitLabel", () => {
  it("labels Free plans Create Free account", () => {
    expect(
      membershipSignupSubmitLabel("Free", {
        tierId: "free",
        isPaid: false,
        stripeReady: false,
      }),
    ).toBe("Create Free account");
  });

  it("labels paid credit plans with the tier name", () => {
    expect(
      membershipSignupSubmitLabel("Starter", {
        tierId: "starter",
        isPaid: true,
        stripeReady: false,
      }),
    ).toBe("Create Starter account");
  });

  it("labels Stripe-ready paid plans as Continue to {tier} checkout", () => {
    expect(
      membershipSignupSubmitLabel("Starter", {
        tierId: "starter",
        isPaid: true,
        stripeReady: true,
      }),
    ).toBe("Continue to Starter checkout");
  });

  it("labels logged-in upgrades with Upgrade to {tier}", () => {
    expect(
      membershipSignupSubmitLabel("Pro", {
        tierId: "pro",
        isPaid: true,
        stripeReady: false,
        mode: "upgrade",
      }),
    ).toBe("Upgrade to Pro");
    expect(
      membershipSignupSubmitLabel("Free", {
        tierId: "free",
        isPaid: false,
        stripeReady: false,
        mode: "upgrade",
      }),
    ).toBe("Switch to Free");
  });
});

describe("membershipPlanChooseLabel", () => {
  it("uses Choose / Start Free for guests", () => {
    expect(membershipPlanChooseLabel("Free", { tierId: "free" })).toBe("Start Free");
    expect(membershipPlanChooseLabel("Starter", { tierId: "starter" })).toBe("Choose Starter");
  });

  it("uses Upgrade / Current plan when logged in", () => {
    expect(
      membershipPlanChooseLabel("Starter", {
        tierId: "starter",
        isLoggedIn: true,
        currentTier: "free",
      }),
    ).toBe("Upgrade to Starter");
    expect(
      membershipPlanChooseLabel("Starter", {
        tierId: "starter",
        isLoggedIn: true,
        currentTier: "starter",
      }),
    ).toBe("Current plan · Starter");
    expect(
      membershipPlanChooseLabel("Pro", {
        tierId: "pro",
        isLoggedIn: true,
        currentTier: "elite",
      }),
    ).toBe("Switch to Pro");
  });

  it("includes Upgrade next to Switch to Starter for logged-in members", () => {
    const bubbles = membershipPlanBubbles("pro");
    expect(bubbles.map((b) => b.label)).toEqual([
      "Switch to Free",
      "Switch to Starter",
      "Current plan · Pro",
      "Upgrade to Elite",
    ]);
    expect(bubbles.find((b) => b.tierId === "starter")?.kind).toBe("switch");
    expect(bubbles.find((b) => b.tierId === "elite")?.kind).toBe("upgrade");
  });

  it("offers Switch to Free plus Upgrade to Pro and Elite from Starter", () => {
    expect(membershipUpgradeActionBubbles("starter").map((b) => b.label)).toEqual([
      "Switch to Free",
      "Upgrade to Pro",
      "Upgrade to Elite",
    ]);
  });
});

describe("browseGuidesButtonLabel", () => {
  it("keeps Browse free guides for guests and Free members", () => {
    expect(browseGuidesButtonLabel(false)).toBe("Browse free guides");
  });

  it("uses Browse Member Guides for subscribers", () => {
    expect(browseGuidesButtonLabel(true)).toBe("Browse Member Guides");
  });

  it("rewrites Free Guides button copy for subscribers only", () => {
    expect(memberGuidesButtonLabel("Free Guides", false)).toBe("Free Guides");
    expect(memberGuidesButtonLabel("Free Guides", true)).toBe("Member Guides");
    expect(memberGuidesButtonLabel("Browse free guides", true)).toBe("Browse Member Guides");
  });
});

describe("membership Stripe checkout copy", () => {
  it("does not list test card numbers on the public membership pages", () => {
    expect(membershipStripeCheckoutHint()).toBe("You'll finish on Stripe's secure checkout page.");
    expect(membershipAlaCarteCheckoutNote()).toBe("Secure Stripe Checkout.");
    expect(membershipStripeCheckoutHint()).not.toMatch(/4242/);
    expect(membershipAlaCarteCheckoutNote()).not.toMatch(/4242/);
  });
});
