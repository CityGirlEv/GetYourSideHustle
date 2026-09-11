import { describe, expect, it } from "vitest";
import {
  applyTemplateVars,
  defaultContentForSlug,
  EMAIL_TEMPLATE_CATALOG,
  isLegacyHustleFamilyHeadline,
  isLegacyLowercaseGyshWelcomeHeadline,
  renderContent,
} from "./email-template-content";

describe("email-template-content", () => {
  it("lists every catalog slug with editable defaults", () => {
    expect(EMAIL_TEMPLATE_CATALOG.length).toBeGreaterThanOrEqual(15);
    for (const t of EMAIL_TEMPLATE_CATALOG) {
      const content = defaultContentForSlug(t.slug);
      expect(content, t.slug).toBeTruthy();
      expect(content!.subject.length).toBeGreaterThan(0);
      expect(content!.headline.length).toBeGreaterThan(0);
      expect(content!.bodyHtml.length).toBeGreaterThan(0);
    }
  });

  it("applies {{placeholders}} in subjects and bodies", () => {
    const out = applyTemplateVars("Hi {{name}} — {{tier}}", {
      name: "Evelyn",
      tier: "Pro",
    });
    expect(out).toBe("Hi Evelyn — Pro");
  });

  it("renders branded HTML from editable content", () => {
    const content = defaultContentForSlug("password_reset");
    expect(content).toBeTruthy();
    const rendered = renderContent(content!, {
      name: "Evelyn",
      resetUrl: "https://example.com/reset",
    });
    expect(rendered.subject).toMatch(/password/i);
    expect(rendered.html).toContain("Reset your password");
    expect(rendered.html).toContain("https://example.com/reset");
    expect(rendered.html).toMatch(/Your hustle, your results/i);
    expect(rendered.text).toMatch(/licensed professionals/i);
    expect(rendered.text.length).toBeGreaterThan(20);
  });

  it("keeps digestBodyHtml placeholder for dynamic templates", () => {
    const digest = defaultContentForSlug("daily_admin_digest");
    expect(digest?.dynamicBody).toBe(true);
    expect(digest?.bodyHtml).toContain("{{digestBodyHtml}}");
    const progress = defaultContentForSlug("parent_kid_progress_daily");
    expect(progress?.dynamicBody).toBe(true);
  });

  it("welcomes Free, Starter, Pro, and Elite with GYSH family copy", () => {
    for (const slug of ["welcome_free", "welcome_starter", "welcome_pro", "welcome_elite"] as const) {
      const content = defaultContentForSlug(slug);
      expect(content?.headline, slug).toBe("Welcome to the GYSH family!");
      expect(content?.headline, slug).not.toMatch(/hustle family/i);
    }
    expect(isLegacyHustleFamilyHeadline("Welcome to the hustle family!")).toBe(true);
    expect(isLegacyHustleFamilyHeadline("Welcome to the GYSH family!")).toBe(false);
  });

  it("capitalizes Welcome in the registration confirmation headline", () => {
    const content = defaultContentForSlug("registration_confirmation");
    expect(content?.headline).toBe("{{name}}, Welcome to the GYSH family!");
    expect(isLegacyLowercaseGyshWelcomeHeadline("{{name}}, welcome to the GYSH family!")).toBe(true);
    expect(isLegacyLowercaseGyshWelcomeHeadline(content!.headline)).toBe(false);
  });
});
