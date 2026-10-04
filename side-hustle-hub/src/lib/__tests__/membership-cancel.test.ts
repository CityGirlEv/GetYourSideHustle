import { describe, expect, it } from "vitest";
import {
  isPaidMembershipTier,
  membershipCancelActionForTier,
  membershipCancelButtonLabel,
  membershipCancelConfirmCopy,
  membershipDowngradeChargeLabel,
  membershipDowngradeNotice,
  membershipDowngradeOptions,
  membershipUpgradeOptions,
  purchaseRowShowsCancel,
} from "../membership-cancel";

describe("membership cancel / downgrade / deactivate", () => {
  it("maps paid tiers to cancel-to-free and free to deactivate", () => {
    expect(isPaidMembershipTier("starter")).toBe(true);
    expect(isPaidMembershipTier("free")).toBe(false);
    expect(membershipCancelActionForTier("pro")).toBe("cancel_to_free");
    expect(membershipCancelActionForTier("free")).toBe("deactivate_account");
    expect(membershipCancelButtonLabel("cancel_to_free")).toBe("Downgrade account");
    expect(membershipCancelButtonLabel("deactivate_account")).toBe("Deactivate account");
  });

  it("lists upgrade and downgrade options around the current plan", () => {
    expect(membershipDowngradeOptions("free")).toEqual([]);
    expect(membershipUpgradeOptions("elite")).toEqual([]);
    expect(membershipDowngradeOptions("starter").map((o) => o.id)).toEqual(["free"]);
    expect(membershipUpgradeOptions("free").map((o) => o.id)).toEqual([
      "starter",
      "pro",
      "elite",
    ]);
    expect(membershipDowngradeOptions("elite").map((o) => o.id)).toEqual([
      "pro",
      "starter",
      "free",
    ]);
    expect(membershipUpgradeOptions("starter").map((o) => o.id)).toEqual(["pro", "elite"]);
  });

  it("only shows Cancel on membership rows while still on a paid plan", () => {
    expect(purchaseRowShowsCancel("membership", "starter")).toBe(true);
    expect(purchaseRowShowsCancel("membership", "free")).toBe(false);
    expect(purchaseRowShowsCancel("alacarte", "elite")).toBe(false);
  });

  it("explains the next billing charge and soft-delete (including linked kids)", () => {
    expect(membershipCancelConfirmCopy("cancel_to_free")).toMatch(/upcoming billing cycle/i);
    expect(membershipCancelConfirmCopy("cancel_to_free")).toMatch(/not charge you again/i);
    expect(membershipCancelConfirmCopy("deactivate_account")).toMatch(/soft-deleted/i);
    expect(membershipCancelConfirmCopy("deactivate_account", { linkedKidCount: 2 })).toMatch(
      /2 linked kid accounts/i,
    );
  });

  it("names the new charge on the upcoming billing cycle", () => {
    const label = membershipDowngradeChargeLabel({
      nextTier: "starter",
      audience: "adult",
      interval: "month",
    });
    expect(label).toBe("$117 every 3 months");
    const notice = membershipDowngradeNotice({
      currentName: "Elite",
      nextName: "Starter",
      nextTier: "starter",
      chargeLabel: label,
      effectiveOn: "June 1, 2026",
    });
    expect(notice).toMatch(/keep Elite until June 1, 2026/i);
    expect(notice).toMatch(/charge \$117 every 3 months for Starter/i);
    expect(notice).toMatch(/Nothing is charged today/);
    expect(
      membershipDowngradeNotice({
        currentName: "Pro",
        nextName: "Free",
        nextTier: "free",
        chargeLabel: "no further charge",
      }),
    ).toMatch(/not charge you again/i);
  });
});
