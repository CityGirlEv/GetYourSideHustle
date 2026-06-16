import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES, renderDefaultHtmlWithMergeFields } from "../all-templates.server";
import { AUTH_SAMPLE_PROPS } from "../template-sample-props.server";
import { resolveTemplateContent } from "../template-merge.server";

const AUTH_NAMES = ALL_TEMPLATES.filter((t) => t.kind === "auth").map((t) => t.name);

const SAMPLE_LITERALS = Object.values(AUTH_SAMPLE_PROPS).filter(
  (v): v is string => typeof v === "string" && v.length >= 4,
);

describe("auth template merge fields in admin defaults", () => {
  it.each(AUTH_NAMES)("%s replaces sample literals with {{mergeField}} tokens", async (name) => {
    const html = await renderDefaultHtmlWithMergeFields(name);

    for (const literal of SAMPLE_LITERALS) {
      if (name === "reauthentication" && literal === AUTH_SAMPLE_PROPS.confirmationUrl) continue;
      if (name === "reauthentication" && literal === AUTH_SAMPLE_PROPS.recipient) continue;
      if (name === "reauthentication" && literal === AUTH_SAMPLE_PROPS.email) continue;
      if (name === "reauthentication" && literal === AUTH_SAMPLE_PROPS.oldEmail) continue;
      if (name === "reauthentication" && literal === AUTH_SAMPLE_PROPS.newEmail) continue;
      expect(html, `still contains sample literal: ${literal}`).not.toContain(literal);
    }

    expect(html).toMatch(/\{\{[a-zA-Z0-9_.]+\}\}/);

    if (name === "reauthentication") {
      expect(html).toContain("{{token}}");
    } else {
      expect(html).toContain("{{confirmationUrl}}");
    }

    if (name === "email_change") {
      expect(html).toContain("{{oldEmail}}");
      expect(html).toContain("{{newEmail}}");
    }
  });
});

describe("auth template merge at send time", () => {
  it("merges signup override tokens with webhook payload data", () => {
    const result = resolveTemplateContent({
      templateName: "signup",
      templateData: {
        siteName: "themedicareoptimizer",
        siteUrl: "https://getpartb.com",
        recipient: "real.user@example.com",
        confirmationUrl: "https://getpartb.com/auth/confirm?token=abc",
        token: "999888",
        email: "real.user@example.com",
      },
      renderedHtml: "<p>fallback</p>",
      renderedText: "fallback",
      renderedSubject: "Confirm your email",
      override: {
        subject: "Confirm your email",
        html: "<p>Hi {{email}} — confirm at {{confirmationUrl}} via {{siteName}}</p>",
        text: "Hi {{email}}",
      },
    });

    expect(result.html).toContain("real.user@example.com");
    expect(result.html).toContain("https://getpartb.com/auth/confirm?token=abc");
    expect(result.html).toContain("themedicareoptimizer");
    expect(result.html).not.toContain("{{");
  });

  it("upgrades legacy auth override literals then merges on send", () => {
    const result = resolveTemplateContent({
      templateName: "recovery",
      templateData: {
        siteName: "themedicareoptimizer",
        siteUrl: "https://getpartb.com",
        confirmationUrl: "https://getpartb.com/auth/reset?token=xyz",
        email: "evelyn3@cox.net",
      },
      renderedHtml: "<p>fallback</p>",
      renderedText: "fallback",
      renderedSubject: "Reset your password",
      override: {
        subject: "Reset your password",
        html: '<a href="https://example.com/confirm?token=sample">Reset</a>',
        text: "Reset",
      },
    });

    expect(result.html).toContain("https://getpartb.com/auth/reset?token=xyz");
    expect(result.html).not.toContain("example.com/confirm");
  });
});
