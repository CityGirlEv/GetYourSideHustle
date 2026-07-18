import { describe, expect, it } from "vitest";
import { getPublishedArticleBySlug, listPublishedArticles, parseArticleMarkdown } from "@/lib/articles";
import {
  extractHeadings,
  normalizeNewsletterMarkdown,
  renderLearningMarkdown,
  splitArticleBody,
} from "@/lib/learning-center";

const SAMPLE = `---
title: Sample Article Title Here
slug: sample-article-slug
excerpt: A long enough excerpt for the article card preview text.
category: plan-types
metaDescription: A meta description that is at least forty characters long for SEO purposes.
featuredImage: /hero.png
featured: true
published: true
sortOrder: 5
publishedAt: 2026-06-16
---

## Heading

Body paragraph with **bold** text.
`;

describe("articles", () => {
  it("parses markdown frontmatter into article fields", () => {
    const article = parseArticleMarkdown(SAMPLE);
    expect(article.slug).toBe("sample-article-slug");
    expect(article.title).toBe("Sample Article Title Here");
    expect(article.featured).toBe(true);
    expect(article.featuredImage).toBe("/hero.png");
    expect(article.bodyMd).toContain("## Heading");
  });

  it("loads published articles from the articles folder", () => {
    const articles = listPublishedArticles();
    expect(articles.length).toBeGreaterThanOrEqual(16);
    expect(articles.some((a) => a.slug === "parts-of-medicare")).toBe(true);
    expect(articles.some((a) => a.slug === "when-to-sign-up-for-medicare")).toBe(true);
    expect(articles.some((a) => a.slug === "original-medicare-vs-medicare-advantage")).toBe(true);
    expect(articles.some((a) => a.slug === "medicare-advantage-zero-premium-explained")).toBe(true);
    expect(articles.some((a) => a.slug === "medigap-open-enrollment-window-explained")).toBe(true);
    expect(articles.some((a) => a.slug === "is-your-doctor-in-network-next-year")).toBe(true);
  });

  it("finds a published article by slug", () => {
    const article = getPublishedArticleBySlug("medicare-enrollment-periods-overview");
    expect(article?.title).toContain("Enrollment Periods");
  });

  it("loads the parts of Medicare foundational article", () => {
    const article = getPublishedArticleBySlug("parts-of-medicare");
    expect(article?.title).toContain("Parts of Medicare");
    expect(article?.bodyMd).toContain("Part A");
    expect(article?.bodyMd).toContain("medicare.gov/basics/get-started-with-medicare/medicare-basics/parts-of-medicare");
  });

  it("loads the when to sign up for Medicare article", () => {
    const article = getPublishedArticleBySlug("when-to-sign-up-for-medicare");
    expect(article?.title).toContain("Sign Up");
    expect(article?.category).toBe("enrollment");
    expect(article?.bodyMd).toContain("Initial Enrollment Period");
    expect(article?.bodyMd).toContain("General Enrollment Period");
    expect(article?.bodyMd).toContain("medicare.gov/basics/get-started-with-medicare/sign-up");
  });

  it("renders markdown without raw HTML injection", () => {
    const html = renderLearningMarkdown(
      "## Safe heading\n\n**Bold** and [CMS](https://www.medicare.gov)\n\n<script>alert(1)</script>",
      { withHeadingIds: true },
    );
    expect(html).toContain("<h2");
    expect(html).toContain('id="safe-heading"');
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain('href="https://www.medicare.gov"');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders internal learning center links and autolinks bare URLs", () => {
    const html = renderLearningMarkdown(
      "See [3 months before 65](/learning-center/medicare-at-65-action-plan). Visit https://www.mypartb.com today.",
    );
    expect(html).toContain('href="/learning-center/medicare-at-65-action-plan"');
    expect(html).not.toMatch(/href="\/learning-center[^"]*"[^>]*target="_blank"/);
    expect(html).toContain('href="https://www.mypartb.com"');
    expect(html).toContain(">https://www.mypartb.com</a>");
  });

  it("merges soft-wrapped newsletter lines before email rendering", () => {
    const normalized = normalizeNewsletterMarkdown(
      "Line one that was wrapped in the editor\nand should read as one sentence.\n\n## Section\n\n- Bullet item",
    );
    expect(normalized).toContain(
      "Line one that was wrapped in the editor and should read as one sentence.",
    );
    expect(normalized).toContain("## Section");
    expect(normalized).toContain("- Bullet item");
  });

  it("splits FAQ sections from article bodies", () => {
    const { mainBody, faq } = splitArticleBody(`## Intro

Body copy.

## Frequently asked questions

### First question?
Answer one.

### Second question?
Answer two.`);
    expect(mainBody).toContain("## Intro");
    expect(mainBody).not.toContain("Frequently asked questions");
    expect(faq).toHaveLength(2);
    expect(faq[0].question).toBe("First question?");
  });

  it("extracts heading anchors for table of contents", () => {
    const headings = extractHeadings(`## Main topic

Text

## Frequently asked questions

### Hidden from TOC?
No.`);
    expect(headings.map((h) => h.id)).toEqual(["main-topic"]);
  });
});
