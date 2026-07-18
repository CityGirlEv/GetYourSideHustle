import { describe, it, expect } from "vitest";
import { PRODUCTION_SITE_ORIGIN } from "@/lib/site-url";
import { SITE_BRAND_THE } from "@/lib/site-brand";
import {
  generateMarketingContent,
  checkMarketingCompliance,
  TRENDING_TOPICS,
  type MarketingContent,
} from "../agent-marketing-utils";

const SEO_FOOTER =
  `Ready to better understand your Medicare options? Visit ${PRODUCTION_SITE_ORIGIN} and compare your choices with ${SITE_BRAND_THE}.`;

describe("AI Marketing & Growth Agent content generator", () => {
  it("should contain standard trending topics", () => {
    expect(TRENDING_TOPICS).toContain("Medicare Advantage vs. Medigap");
    expect(TRENDING_TOPICS).toContain("What Happens When You Turn 65?");
    expect(TRENDING_TOPICS).toContain("Can I Keep My Doctor?");
  });

  it("should generate compliant content for Medicare Advantage vs. Medigap", () => {
    const content = generateMarketingContent("Medicare Advantage vs. Medigap");
    expect(content.topic).toBe("Medicare Advantage vs. Medigap");
    expect(content.seoArticle.title).toContain("Medicare Advantage vs. Medigap");
    expect(content.seoArticle.body).toContain("Medicare Advantage (Part C)");
    expect(content.seoArticle.body).toContain("Medicare Supplement Insurance (Medigap)");
    expect(content.seoArticle.body.trim().endsWith(SEO_FOOTER)).toBe(true);
    expect(content.facebookPost.text).toContain("Medicare Advantage and Medigap");
    expect(content.facebookPost.link).toBe(PRODUCTION_SITE_ORIGIN);
    expect(content.facebookPost.cta).toBe("Learn More");
  });

  it("should generate compliant content for custom topics", () => {
    const content = generateMarketingContent("my custom topic about deductibles");
    expect(content.topic).toBe("My custom topic about deductibles");
    expect(content.seoArticle.title).toContain("My custom topic about deductibles");
    expect(content.seoArticle.body.trim().endsWith(SEO_FOOTER)).toBe(true);
    expect(content.facebookPost.link).toBe(PRODUCTION_SITE_ORIGIN);
    expect(content.facebookPost.cta).toBe("Learn More");
  });

  it("should pass compliance checks for clean content", () => {
    const content = generateMarketingContent("Medicare Advantage vs. Medigap");
    const checks = checkMarketingCompliance(content);
    expect(checks.every((c) => c.status === "pass")).toBe(true);
  });

  it("should fail government affiliation compliance check if government claims are present", () => {
    const content = generateMarketingContent("Medicare Advantage vs. Medigap");
    // Inject a government claim
    content.seoArticle.body += " We represent the federal government and are an official medicare agency.";
    const checks = checkMarketingCompliance(content);
    const govCheck = checks.find((c) => c.id === "COMP-001");
    expect(govCheck?.status).toBe("fail");
  });

  it("should fail agency claim check if direct broker claims are present", () => {
    const content = generateMarketingContent("Medicare Advantage vs. Medigap");
    // Inject broker claim
    content.facebookPost.text += " We sell insurance directly, consult our insurance agents.";
    const checks = checkMarketingCompliance(content);
    const agencyCheck = checks.find((c) => c.id === "COMP-002");
    expect(agencyCheck?.status).toBe("fail");
  });

  it("should fail footer check if mandatory SEO article footer is missing", () => {
    const content: MarketingContent = {
      topic: "Test",
      seoArticle: {
        title: "Test Title",
        metaDescription: "Test Desc",
        body: "This is some article body without the standard footer at the end.",
      },
      facebookPost: { text: "Facebook copy", cta: "Learn More", link: PRODUCTION_SITE_ORIGIN },
      infographicConcept: { title: "Title", panels: [] },
      videoScript: { hook: "Hook", body: "Body", cta: "CTA" },
      newsletterDraft: { subject: "Sub", previewText: "Prev", body: "Body" },
      faqContent: [],
    };
    const checks = checkMarketingCompliance(content);
    const footerCheck = checks.find((c) => c.id === "COMP-004");
    expect(footerCheck?.status).toBe("fail");
  });
});
