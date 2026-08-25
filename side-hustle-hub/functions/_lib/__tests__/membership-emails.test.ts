import { describe, expect, it } from "vitest";
import {
  defersMembershipEmailUntilStripe,
  membershipEmailKind,
} from "../email";
import { defaultContentForSlug } from "../email-template-content";

describe("membership subscription emails", () => {
  it("classifies Free → paid and tier changes as upgrades", () => {
    expect(membershipEmailKind("free", "starter")).toBe("upgrade");
    expect(membershipEmailKind("starter", "pro")).toBe("upgrade");
    expect(membershipEmailKind("starter", "starter")).toBe("subscribe");
  });

  it("defers Adult/Senior paid plan emails until Stripe", () => {
    expect(defersMembershipEmailUntilStripe("starter", "adult")).toBe(true);
    expect(defersMembershipEmailUntilStripe("pro", "senior")).toBe(true);
    expect(defersMembershipEmailUntilStripe("starter", "kids")).toBe(false);
    expect(defersMembershipEmailUntilStripe("free", "adult")).toBe(false);
  });

  it("has editable defaults for subscribe and upgrade templates", () => {
    const sub = defaultContentForSlug("membership_subscribed");
    const up = defaultContentForSlug("membership_upgraded");
    expect(sub?.subject).toMatch(/subscribed/i);
    expect(up?.subject).toMatch(/upgraded/i);
    expect(sub?.bodyHtml).toContain("{{perksHtml}}");
    expect(up?.subhead).toContain("{{previousTier}}");
  });
});
