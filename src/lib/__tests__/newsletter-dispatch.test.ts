import { describe, expect, it } from "vitest";
import {
  buildNewsletterEmailHtml,
  hashContentBody,
  parseNewsletterSubject,
  personalizeNewsletterBody,
} from "@/lib/content-factory/newsletter-dispatch";

describe("newsletter-dispatch", () => {
  it("parses Subject: line from newsletter body", () => {
    const parsed = parseNewsletterSubject(
      "Subject: Weekly roundup\n\nHello {{fullName}},",
      "Fallback title",
    );
    expect(parsed.subject).toBe("Weekly roundup");
    expect(parsed.body).toBe("Hello {{fullName}},");
  });

  it("personalizes fullName merge field", () => {
    expect(personalizeNewsletterBody("Hello {{fullName}}", "Evelyn")).toBe("Hello Evelyn");
  });

  it("hashes body content for dispatch tracking", () => {
    const a = hashContentBody("Same text");
    const b = hashContentBody("Same text");
    const c = hashContentBody("Different text");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toHaveLength(16);
  });

  it("renders featured guides with inline images beside titles", () => {
    const html = buildNewsletterEmailHtml(
      "Hello there,\n\n## Featured guides\n\n- old markdown link\n\n## Quick reminders\n\n- One",
      [
        {
          slug: "turning-65-medicare-guide",
          title: "Turning 65 Guide",
          excerpt: "Educational overview.",
          featuredImage: "/learning-center/turning-65-medicare-guide.jpg",
        },
      ],
      "https://getpartb.com",
    );
    expect(html).toContain('width="168"');
    expect(html).toContain("Turning 65 Guide");
    expect(html).toContain("Quick reminders");
    expect(html).not.toContain("old markdown link");
  });
});
