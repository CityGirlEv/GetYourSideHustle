import { describe, expect, it } from "vitest";
import {
  buildNewsletterEmailHtml,
  hashContentBody,
  newsletterBodyToHtml,
  parseNewsletterSubject,
  personalizeNewsletterBody,
  resolveNewsletterThumbPath,
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
      "https://www.mypartb.com",
    );
    expect(html).toContain('width="168"');
    expect(html).toContain('height="112"');
    expect(html).toContain(resolveNewsletterThumbPath("/learning-center/turning-65-medicare-guide.jpg"));
    expect(html).not.toContain("height:auto");
    expect(html).not.toContain("object-fit:cover");
    expect(html).toContain("Turning 65 Guide");
    expect(html).toContain("Quick reminders");
    expect(html).not.toContain("old markdown link");
    expect(html).toContain("line-height:1.7");
    expect(html).toContain("max-width:600px");
  });

  it("merges soft-wrapped newsletter lines into full paragraphs", () => {
    const html = newsletterBodyToHtml(
      "Hello {{fullName}},\n\nWelcome to this week's roundup from The Part B Optimizer Benchmark Tool.\nWe publish plain-language Medicare education.",
    );
    expect(html.match(/<p /g)?.length).toBe(2);
    expect(html).toContain(
      "Welcome to this week&#39;s roundup from The Part B Optimizer Benchmark Tool. We publish plain-language Medicare education.",
    );
  });

  it("rewrites blocked lead-gen URLs before send", () => {
    const html = newsletterBodyToHtml(
      "Verify doctors at https://www.medicaresolutions.com/compare before you enroll.",
    );
    expect(html).toContain("https://www.medicare.gov/plan-compare");
    expect(html).not.toContain("medicaresolutions.com");
  });
});
