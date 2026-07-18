import { describe, it, expect } from "vitest";
import * as React from "react";
import { render } from "@react-email/components";
import {
  hasCurrentEmailHeader,
  hasEmailFooter,
  ensureEmailBranding,
  stripEmailEditorArtifacts,
  resolveOutboundEmailSiteUrl,
  countEmailHeaderLogos,
  stripDuplicateEmailHeaders,
  stripEmailHeaderCopyright,
} from "../email-branding.server";
import { DEFAULT_EMAIL_SITE_URL } from "../email-header";
import { PRODUCTION_SITE_ORIGIN } from "@/lib/site-url";
import { TEMPLATES } from "../registry";

describe("email branding helpers", () => {
  it("detects the current header markers", () => {
    expect(hasCurrentEmailHeader('<img class="email-brand-logo" src="/email-logo.png">')).toBe(
      true,
    );
    expect(
      hasCurrentEmailHeader(
        '<img class="email-brand-logo" src="https://mypartb.com/email-logo.png">',
      ),
    ).toBe(true);
    expect(hasCurrentEmailHeader('<p class="email-header-copyright">© 2026</p>')).toBe(false);
    expect(hasCurrentEmailHeader('<img src="/email-header-logo.png">')).toBe(false);
  });

  it("strips legacy header copyright under the logo", () => {
    const html =
      '<body><img class="email-brand-logo" src="/email-logo.png"><p class="email-header-copyright">© 2026 The Medicare Optimizer. All rights reserved.</p><p>Hi</p></body>';
    const cleaned = stripEmailHeaderCopyright(html);
    expect(cleaned).not.toContain("email-header-copyright");
    expect(cleaned).not.toContain("All rights reserved");
    expect(cleaned).toContain("Hi");
  });

  it("injects header and footer when missing", async () => {
    const html = "<!doctype html><html><body><p>Hello</p></body></html>";
    const branded = await ensureEmailBranding(html, { unsubscribeToken: "abc123" });
    expect(hasCurrentEmailHeader(branded)).toBe(true);
    expect(hasEmailFooter(branded)).toBe(true);
    expect(branded).toContain("Hello");
    expect(branded).toContain("email-logo.png");
  });

  it("replaces a broken logo hosted on the marketing domain", async () => {
    const html =
      '<body><img class="email-brand-logo" src="https://www.mypartb.com/email-logo.png"><p>Hi</p></body>';
    const branded = await ensureEmailBranding(html, { siteUrl: "https://www.mypartb.com" });
    expect(branded).not.toMatch(/src="https:\/\/www\.mypartb\.com\/email-logo\.png"/);
    expect(branded).toContain(`${DEFAULT_EMAIL_SITE_URL}/email-logo.png?v=`);
    expect(branded).toContain("Hi");
  });

  it("leaves already-branded html unchanged", async () => {
    const html =
      '<body><img class="email-brand-logo" src="https://mypartb.pages.dev/email-logo.png"><p>Hi</p>De-identification: text</body>';
    const branded = await ensureEmailBranding(html);
    expect(branded).toContain(`${DEFAULT_EMAIL_SITE_URL}/email-logo.png?v=`);
    expect(branded).toContain("Hi");
  });

  it("strips admin editor scripts and localhost URLs before send", () => {
    const dirty =
      '<body><a href="http://localhost:8080">x</a><script>var TPL="tpl-edit";document.designMode="on";</script><p>Hi</p></body>';
    const clean = stripEmailEditorArtifacts(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("localhost:8080");
    expect(clean).toContain("Hi");
  });

  it("maps localhost site URL to production for outbound email", () => {
    expect(resolveOutboundEmailSiteUrl("http://localhost:8080")).toBe(PRODUCTION_SITE_ORIGIN);
  });

  it("does not double-inject header on built-in templates", async () => {
    const t = TEMPLATES["welcome"];
    const rendered = await render(React.createElement(t.component, t.previewData ?? {}));
    expect(countEmailHeaderLogos(rendered)).toBe(1);

    const brandedOnce = await ensureEmailBranding(rendered, { siteUrl: "http://localhost:8080" });
    expect(countEmailHeaderLogos(brandedOnce)).toBe(1);

    const brandedTwice = await ensureEmailBranding(brandedOnce, {
      siteUrl: "http://localhost:8080",
    });
    expect(countEmailHeaderLogos(brandedTwice)).toBe(1);
  });

  it("dedupes duplicate header blocks saved from the admin editor", async () => {
    const duplicate =
      '<body><table role="presentation"><tr><td><img class="email-brand-logo" src="https://mypartb.com/email-logo.png"></td></tr></table><div><table role="presentation"><tr><td><img class="email-brand-logo" src="https://mypartb.com/email-logo.png"></td></tr></table><p>Hi</p></div></body>';
    const deduped = stripDuplicateEmailHeaders(duplicate);
    expect(countEmailHeaderLogos(deduped)).toBe(1);
    expect(deduped).toContain("Hi");

    const branded = await ensureEmailBranding(duplicate);
    expect(countEmailHeaderLogos(branded)).toBe(1);
    expect(branded).toContain("Hi");
  });
});
