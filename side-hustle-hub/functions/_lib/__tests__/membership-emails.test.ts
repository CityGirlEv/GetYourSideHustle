import { describe, expect, it } from "vitest";
import {
  defersMembershipEmailUntilStripe,
  formatJoinCartReceipt,
  joinCartPurchaseTemplateSlug,
  membershipEmailKind,
} from "../email";
import { formatPurchasePaymentDetail } from "../../../src/lib/purchase-payment";
import { adminFormNotifyCtaUrl, perkBulletsHtml, SITE_URL } from "../email-brand";
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

  it("lists a bi-weekly newsletter (2× per month) on Starter welcome perks", () => {
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      const html = perkBulletsHtml("starter", audience);
      expect(html).toMatch(/Bi-weekly newsletter \(2× per month\)/);
      expect(html).not.toMatch(/>Weekly Newsletter</);
    }
  });

  it("has editable defaults for subscribe and upgrade templates", () => {
    const sub = defaultContentForSlug("membership_subscribed");
    const up = defaultContentForSlug("membership_upgraded");
    expect(sub?.subject).toMatch(/subscribed/i);
    expect(up?.subject).toMatch(/upgraded/i);
    expect(sub?.bodyHtml).toContain("{{perksHtml}}");
    expect(up?.subhead).toContain("{{previousTier}}");
  });

  it("asks complimentary members to pick T-shirt or hat and size", () => {
    const merch = defaultContentForSlug("membership_merch_ready");
    expect(merch?.subject).toMatch(/T-shirt or hat/i);
    expect(merch?.bodyHtml).toMatch(/upgraded without choosing/i);
    expect(merch?.ctaUrl).toMatch(/my-dashboard#merch/);
    expect(merch?.ctaLabel).toMatch(/Choose my GYSH gear/i);
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
    expect(rendered.html).toMatch(/Your hustle, your results/i);
    expect(rendered.text).toMatch(/licensed professionals/i);
  });
});

describe("join cart purchase emails", () => {
  it("picks a-la-carte vs Kid Credit pack templates", () => {
    expect(joinCartPurchaseTemplateSlug("alacarte")).toBe("alacarte_purchased");
    expect(joinCartPurchaseTemplateSlug("credit_pack")).toBe("credit_pack_purchased");
    expect(joinCartPurchaseTemplateSlug("membership")).toBe("alacarte_purchased");
  });

  it("has branded defaults for a-la-carte and parent pack receipts", () => {
    const ala = defaultContentForSlug("alacarte_purchased");
    const pack = defaultContentForSlug("credit_pack_purchased");
    expect(ala?.subject).toMatch(/a-la-carte purchase is confirmed/i);
    expect(ala?.bodyHtml).toContain("{{itemsHtml}}");
    expect(pack?.subject).toMatch(/Kid Credit pack is confirmed/i);
    expect(pack?.bodyHtml).toContain("parent-funded Kid Credit pack");

    const rendered = renderContent(ala!, {
      name: "Evelyn",
      itemLabel: "30-minute consult",
      amountUsd: "$45",
      itemsHtml: "<ul><li>30-minute consult</li></ul>",
    });
    expect(rendered.subject).toMatch(/confirmed/i);
    expect(rendered.html).toContain("30-minute consult");
    expect(rendered.html).toMatch(/Your hustle, your results/i);
    expect(rendered.text).toMatch(/licensed professionals/i);
  });

  it("formats Stripe gysh_item metadata into receipt lines", () => {
    const consult = formatJoinCartReceipt("consult-30x2", 9000);
    expect(consult.itemLabel).toMatch(/1-on-1 consulting \(30 min\)/i);
    expect(consult.itemLabel).toContain("× 2");
    expect(consult.itemsHtml).toContain("1-on-1 consulting");
    expect(consult.amountUsd).toBe("$90");

    const pack = formatJoinCartReceipt("launcher", 2000);
    expect(pack.itemLabel).toMatch(/Launcher Pack/i);
    expect(pack.amountUsd).toBe("$20");

    const packs = formatJoinCartReceipt("boostx2,family", 5000);
    expect(packs.itemLabel).toMatch(/Kid Credit packs \(2\)/);
    expect(packs.itemsHtml).toContain("Boost Pack");
    expect(packs.itemsHtml).toContain("Family Pack");
  });

  it("admin purchase details show credits instead of Stripe when Stripe was not used", () => {
    const creditOnly = formatPurchasePaymentDetail({
      source: "credits",
      amountCents: 0,
      creditsApplied: 40,
      sessionId: "cred-user-1",
    });
    expect(creditOnly.html).toContain("Payment method:");
    expect(creditOnly.html).toContain("GYSH credits (Stripe was not used)");
    expect(creditOnly.html).toContain("Credits applied:");
    expect(creditOnly.html).toContain("Cash charged:");
    expect(creditOnly.html).not.toMatch(/Stripe Checkout confirmed/i);

    const stripe = formatPurchasePaymentDetail({
      source: "stripe",
      amountCents: 500,
      creditsApplied: 0,
      sessionId: "cs_test_abc",
    });
    expect(stripe.html).toContain("Stripe Checkout");
    expect(stripe.html).toContain("$5");
  });
});
