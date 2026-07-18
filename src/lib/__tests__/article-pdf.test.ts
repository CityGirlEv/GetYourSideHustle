import { describe, expect, it } from "vitest";
import { buildArticleDownloadPdf, drawArticlePageHeader, loadArticlePdfLogo, loadPdfFooterMiniLogo, markdownToPdfBlocks } from "@/lib/article-pdf";
import { LEARNING_ARTICLE_DISCLAIMER } from "@/lib/learning-center";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

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
    }, {
      logoDataUrl: TINY_PNG,
      miniLogoDataUrl: TINY_PNG,
    });

    const text = doc.output("arraybuffer");
    expect(text.byteLength).toBeGreaterThan(1000);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);

    const blobText = new TextDecoder("latin1").decode(new Uint8Array(text));
    expect(blobText).toContain("Learning Center");
    expect(blobText).toContain("Educational Guide");
    expect(blobText).toContain(LEARNING_ARTICLE_DISCLAIMER.slice(0, 40));
    expect(blobText).toContain(PUBLIC_WEBSITE_HOST);
  });

  it("loads bundled footer mini logo as a data URL", async () => {
    const logo = await loadPdfFooterMiniLogo();
    expect(logo).toMatch(/^data:image\/png;base64,/);
  });

  it("loads bundled header logo as a data URL", async () => {
    const logo = await loadArticlePdfLogo();
    expect(logo).toMatch(/^data:image\/png;base64,/);
  });

  it("draws the brand header on every page", () => {
    const doc = buildArticleDownloadPdf(
      {
        title: "Long Guide",
        slug: "long-guide",
        excerpt: "Educational overview.",
        category: "enrollment",
        publishedAt: "2026-06-16",
        bodyMd: `## Section\n\n${"Line of educational copy. ".repeat(120)}`,
      },
      {
        logoDataUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      },
    );

    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    drawArticlePageHeader(doc, 612, 48, null);
  });
});
