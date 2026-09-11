import { describe, expect, it } from "vitest";
import {
  LEGAL_DISCLAIMER_BODY,
  LEGAL_DISCLAIMER_HEADLINE,
  appendLegalDisclaimerToEmailHtml,
  appendLegalDisclaimerToEmailText,
  emailHasLegalDisclaimer,
  ensureEmailLegalDisclaimer,
  legalDisclaimerPlainText,
} from "../legal-disclaimer";
import { wrapBrandedEmail } from "../../../functions/_lib/email-brand";
import { defaultContentForSlug, renderContent } from "../../../functions/_lib/email-template-content";

describe("legal disclaimer", () => {
  it("covers income illustrations, no guarantees, and licensed-advice language", () => {
    const text = legalDisclaimerPlainText();
    expect(text).toContain(LEGAL_DISCLAIMER_HEADLINE);
    expect(LEGAL_DISCLAIMER_BODY).toMatch(/calculators/i);
    expect(text).toMatch(/not guarantees/i);
    expect(text).toMatch(/financial, legal, tax, or investment advice/i);
    expect(text).toMatch(/licensed professionals/i);
    expect(text).toMatch(/not responsible or liable/i);
    expect(text).toMatch(/business losses, damages, or legal issues/i);
  });

  it("does not duplicate when the branded footer already includes it", () => {
    const html = `<html><body><p>Your hustle, your results. Already here.</p></body></html>`;
    expect(appendLegalDisclaimerToEmailHtml(html)).toBe(html);
    expect(appendLegalDisclaimerToEmailText("Your hustle, your results. Already here.")).toBe(
      "Your hustle, your results. Already here.",
    );
  });

  it("appends the disclaimer to HTML and text that omitted it", () => {
    const html = "<html><body><p>Welcome aboard</p></body></html>";
    const out = ensureEmailLegalDisclaimer({ html, text: "Welcome aboard" });
    expect(emailHasLegalDisclaimer(out.html)).toBe(true);
    expect(emailHasLegalDisclaimer(out.text)).toBe(true);
    expect(out.html).toContain("</body>");
    expect(out.html).toMatch(/Welcome aboard/);
    expect((out.html.match(/Your hustle, your results/g) || []).length).toBe(1);
  });
});

describe("branded email footer", () => {
  it("puts the full legal disclaimer in HTML and plain-text footers", () => {
    const wrapped = wrapBrandedEmail({
      preheader: "Test",
      eyebrow: "Test",
      headline: "Hello",
      subhead: "Sub",
      bodyHtml: "<p>Body</p>",
    });
    expect(wrapped.html).toContain(LEGAL_DISCLAIMER_HEADLINE);
    expect(wrapped.html).toMatch(/licensed professionals/i);
    expect(wrapped.html).toMatch(/calculators/i);
    expect(wrapped.html).toMatch(/not responsible or liable/i);
    expect(wrapped.text).toContain(legalDisclaimerPlainText());
    expect(wrapped.text).toMatch(/business losses/i);
    expect(wrapped.html).toContain("©");
    expect(wrapped.html).not.toContain("Â©");
  });

  it("renders catalog emails with the shared footer disclaimer", () => {
    const content = defaultContentForSlug("registration_confirmation");
    expect(content).toBeTruthy();
    const rendered = renderContent(content!, { name: "Evelyn", tier: "Free" });
    expect(rendered.html).toContain(LEGAL_DISCLAIMER_HEADLINE);
    expect(rendered.html).toMatch(/not guarantees/i);
    expect(rendered.text).toMatch(/Your hustle, your results/i);
    expect(rendered.text).toMatch(/licensed professionals/i);
    expect(rendered.html).toMatch(/not responsible or liable/i);
    expect(rendered.text).toMatch(/business losses/i);
  });
});
