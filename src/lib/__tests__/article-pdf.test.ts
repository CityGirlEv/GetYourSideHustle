import { describe, expect, it } from "vitest";
import { buildArticleDownloadPdf, markdownToPdfBlocks } from "@/lib/article-pdf";
import { LEARNING_ARTICLE_DISCLAIMER } from "@/lib/learning-center";
import { MEDICARE_DISCLAIMER_SECTIONS } from "@/lib/medicare-disclaimers";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

describe("article-pdf", () => {
  it("parses markdown blocks for PDF layout", () => {
    const blocks = markdownToPdfBlocks("## Intro\n\nHello **world**.\n\n- One\n- Two");
    expect(blocks.some((b) => b.type === "h2" && b.text === "Intro")).toBe(true);
    expect(blocks.some((b) => b.type === "p" && b.text.includes("Hello world"))).toBe(true);
    expect(blocks.some((b) => b.type === "ul" && b.items.length === 2)).toBe(true);
  });

  it("builds an executive PDF with disclaimers", () => {
    const doc = buildArticleDownloadPdf({
      title: "Turning 65 Guide",
      slug: "turning-65-medicare-guide",
      excerpt: "Educational overview of Medicare enrollment at 65.",
      category: "enrollment",
      publishedAt: "2026-06-16",
      bodyMd: `## Intro

Educational body copy here.

## Frequently asked questions

### Is this enrollment advice?
No. Learning Center articles are educational only.`,
    });

    const text = doc.output("arraybuffer");
    expect(text.byteLength).toBeGreaterThan(1000);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);

    const blobText = new TextDecoder("latin1").decode(new Uint8Array(text));
    expect(blobText).toContain(SITE_BRAND_NAME);
    expect(blobText).toContain("Executive Guide");
    expect(blobText).toContain(LEARNING_ARTICLE_DISCLAIMER.slice(0, 40));
    for (const section of MEDICARE_DISCLAIMER_SECTIONS) {
      expect(blobText).toContain(section.label);
    }
  });
});
