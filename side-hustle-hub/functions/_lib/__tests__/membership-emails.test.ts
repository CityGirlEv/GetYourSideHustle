import { describe, expect, it } from "vitest";
import {
  defersMembershipEmailUntilStripe,
  membershipEmailKind,
} from "../email";
import { adminFormNotifyCtaUrl, SITE_URL } from "../email-brand";
import { defaultContentForSlug, renderContent } from "../email-template-content";

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

  it("admin form notify CTA opens Users Area, not mailto", () => {
    expect(adminFormNotifyCtaUrl()).toBe(`${SITE_URL}/admin?tab=users`);
    expect(adminFormNotifyCtaUrl("mailto:member@example.com")).toBe(
      `${SITE_URL}/admin?tab=users`,
    );
    expect(adminFormNotifyCtaUrl(`${SITE_URL}/admin?tab=memberships`)).toBe(
      `${SITE_URL}/admin?tab=memberships`,
    );

    const content = defaultContentForSlug("admin_form_notify");
    expect(content?.ctaLabel).toMatch(/admin/i);
    expect(content?.ctaUrl).toContain("/admin?tab=users");
    expect(content?.ctaUrl).not.toMatch(/^mailto:/i);

    const rendered = renderContent(content!, {
      name: "New member signup",
      message: "<p>Details</p>",
      email: "member@example.com",
      ctaUrl: adminFormNotifyCtaUrl("mailto:member@example.com"),
    });
    expect(rendered.html).toContain("/admin?tab=users");
    expect(rendered.html).not.toMatch(/href="mailto:member@example.com"/);
  });
});
