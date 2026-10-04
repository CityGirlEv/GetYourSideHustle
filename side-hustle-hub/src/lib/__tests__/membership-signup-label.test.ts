import { describe, expect, it } from "vitest";
import {
  browseGuidesButtonLabel,
  freeMemberSignupNextStepsCopy,
  isFreeMemberSignupNextStepsVisible,
  memberGuidesButtonLabel,
  membershipAlaCarteCheckoutNote,
  membershipPlanBubbles,
  membershipPlanChooseLabel,
  membershipSignupDropdownAudience,
  membershipSignupDropdownTier,
  membershipSignupSubmitLabel,
  membershipStripeCheckoutHint,
  membershipUpgradeActionBubbles,
} from "../membership-signup-labels";

describe("membershipSignupDropdownTier", () => {
  it("keeps the chosen plan for guests", () => {
    expect(
      membershipSignupDropdownTier({
        initialTier: "starter",
        currentTier: null,
        isLoggedIn: false,
      }),
    ).toBe("starter");
  });

  it("follows the profile after upgrade when the form was opened on Free", () => {
    expect(
      membershipSignupDropdownTier({
        initialTier: "free",
        currentTier: "starter",
        isLoggedIn: true,
      }),
    ).toBe("starter");
    expect(
      membershipSignupDropdownTier({
        initialTier: "free",
        currentTier: "pro",
        isLoggedIn: true,
      }),
    ).toBe("pro");
  });

  it("keeps an explicit upgrade target from Join when it is not Free", () => {
    expect(
      membershipSignupDropdownTier({
        initialTier: "pro",
        currentTier: "starter",
        isLoggedIn: true,
      }),
    ).toBe("pro");
  });
});

describe("membershipSignupDropdownAudience", () => {
  it("keeps a guest on the lane they opened", () => {
    expect(
      membershipSignupDropdownAudience({
        initialAudience: "adult",
        memberAudience: "senior",
        isLoggedIn: false,
      }),
    ).toBe("adult");
  });

  it("keeps a signed-in Senior on Seniors when Join was last opened on Adults", () => {
    expect(
      membershipSignupDropdownAudience({
        initialAudience: "adult",
        memberAudience: "senior",
        isLoggedIn: true,
      }),
    ).toBe("senior");
  });

  it("maps a parent account onto the Kids lane", () => {
    expect(
      membershipSignupDropdownAudience({
        initialAudience: "adult",
        memberAudience: "parent",
        isLoggedIn: true,
      }),
    ).toBe("kids");
  });
});

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

describe("free member signup next steps", () => {
  it("shows after a logged-in Free member lands on signup", () => {
    expect(
      isFreeMemberSignupNextStepsVisible({
        isLoggedIn: true,
        currentTier: "free",
        initialTier: "free",
      }),
    ).toBe(true);
    expect(
      isFreeMemberSignupNextStepsVisible({
        isLoggedIn: true,
        currentTier: "free",
        initialTier: null,
      }),
    ).toBe(true);
  });

  it("hides for guests, paid members, and Free members opening a paid plan", () => {
    expect(
      isFreeMemberSignupNextStepsVisible({
        isLoggedIn: false,
        currentTier: "free",
        initialTier: "free",
      }),
    ).toBe(false);
    expect(
      isFreeMemberSignupNextStepsVisible({
        isLoggedIn: true,
        currentTier: "starter",
        initialTier: "free",
      }),
    ).toBe(false);
    expect(
      isFreeMemberSignupNextStepsVisible({
        isLoggedIn: true,
        currentTier: "free",
        initialTier: "pro",
      }),
    ).toBe(false);
  });

  it("points new Free members to Dashboard, guides, and Match Wizard", () => {
    const copy = freeMemberSignupNextStepsCopy();
    expect(copy.heading).toMatch(/next steps/i);
    expect(copy.dashboardLabel).toMatch(/Open Dashboard/i);
    expect(copy.guidesLabel).toMatch(/guides/i);
    expect(copy.wizardLabel).toMatch(/Match Wizard/i);
    expect(copy.upgradeHint).toMatch(/Upgrade/i);
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
