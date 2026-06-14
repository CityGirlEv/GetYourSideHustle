import { describe, it, expect } from "vitest";
import * as React from "react";
import { render } from "@react-email/components";
import { TEMPLATES } from "../registry";
import { EMAIL_LOGO_PATH } from "../email-header";
import { DEFAULT_CONTACT_EMAIL } from "../email-footer";

describe("email template registry", () => {
  it("registers the new-registration-admin template", () => {
    const t = TEMPLATES["new-registration-admin"];
    expect(t).toBeDefined();
    expect(typeof t.component).toBe("function");
    expect(t.previewData).toBeTruthy();
  });

  it("resolves a dynamic subject including the registrant name", () => {
    const t = TEMPLATES["new-registration-admin"];
    const subjectFn = t.subject as (data: Record<string, unknown>) => string;
    expect(typeof subjectFn).toBe("function");
    expect(subjectFn({ firstName: "Jane", lastName: "Doe" })).toMatch(/Jane Doe/);
    expect(subjectFn({})).toMatch(/new beta registration/i);
  });

  it("renders the logo in the new-registration-admin email header", async () => {
    const t = TEMPLATES["new-registration-admin"];
    const html = await render(
      React.createElement(t.component, t.previewData ?? {}),
    );
    expect(html).toContain(EMAIL_LOGO_PATH);
    expect(html).toContain('alt="The Medicare Optimizer"');
    expect(html).toContain('email-brand-logo');
    expect(html).toContain('email-header-copyright');
    expect(html).toMatch(/© \d{4} The Medicare Optimizer\. All rights reserved\./);
  });

  it("renders the Medicare footer disclaimers in welcome emails", async () => {
    const t = TEMPLATES["welcome"];
    const html = await render(
      React.createElement(t.component, t.previewData ?? {}),
    );
    expect(html).toContain(DEFAULT_CONTACT_EMAIL);
    expect(html).toContain("https://mypartb.pages.dev/email-footer-logo.png");
    expect(html).toContain('class="email-footer-brand-logo"');
    expect(html).toContain("De-identification:");
    expect(html).toContain("Medicare notice:");
    expect(html).toContain("not affiliated with the U.S. government");
  });

  it("registers beta-test-assignment with greeting and login link", async () => {
    const t = TEMPLATES["beta-test-assignment"];
    expect(t).toBeDefined();
    const html = await render(
      React.createElement(t.component, t.previewData ?? {}),
    );
    expect(html).toContain("Hope this email finds you well.");
    expect(html).toContain("Log in to");
    expect(html).toContain("The Medicare Optimizer");
    expect(html).toContain("/auth?tab=sign-in");
    expect(html).toContain("/testing");
    expect(html).toContain("AUTH-QA-001");
  });

  it("registers qa-daily-summary-admin with stats and completed tests", async () => {
    const t = TEMPLATES["qa-daily-summary-admin"];
    expect(t).toBeDefined();
    const html = await render(
      React.createElement(t.component, t.previewData ?? {}),
    );
    expect(html).toContain("QA daily summary");
    expect(html).toContain("Tests completed");
    expect(html).toContain("AUTH-001-IOS");
    expect(html).toContain("Open Testing Portal");
    expect(html).toContain("email-brand-logo");
  });

  it("registers qa-registration-confirmation with next steps from signup popup", async () => {
    const t = TEMPLATES["qa-registration-confirmation"];
    expect(t).toBeDefined();
    expect(t.subject).toBe("Your QA registration is submitted — next steps");
    const html = await render(
      React.createElement(t.component, t.previewData ?? {}),
    );
    expect(html).toContain("Registration submitted — next steps");
    expect(html).toContain("Your account is under review");
    expect(html).toContain("What happens next");
    expect(html).toContain("An admin reviews your request");
    expect(html).toContain("jane@example.com");
    expect(html).toContain("Return to the sign-in tab");
    expect(html).toContain("QA Manual");
    expect(html).toContain("/auth?tab=sign-in");
    expect(html).toContain("iPhone");
    expect(html).toContain("Go to sign-in");
  });

  it("registers agent-registration-confirmation with next steps from signup popup", async () => {
    const t = TEMPLATES["agent-registration-confirmation"];
    expect(t).toBeDefined();
    expect(t.subject).toBe("Your agent registration is submitted — next steps");
    const html = await render(
      React.createElement(t.component, t.previewData ?? {}),
    );
    expect(html).toContain("Registration submitted — next steps");
    expect(html).toContain("Your account is under review");
    expect(html).toContain("What happens next");
    expect(html).toContain("An admin reviews your request");
    expect(html).toContain("jane@example.com");
    expect(html).toContain("Return to the sign-in tab");
    expect(html).not.toContain("QA Manual");
    expect(html).toContain("licensed advisor");
    expect(html).toContain("Go to sign-in");
  });
});
