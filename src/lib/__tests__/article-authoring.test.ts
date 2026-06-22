import { describe, expect, it } from "vitest";
import {
  buildFeaturedImagePrompt,
  featuredImagePublicPath,
  serializeArticleMarkdown,
  slugifyArticleTitle,
} from "@/lib/article-authoring";

describe("article-authoring", () => {
  it("slugifies titles", () => {
    expect(slugifyArticleTitle("Hello World!")).toBe("hello-world");
  });

  it("serializes markdown with quoted frontmatter", () => {
    const md = serializeArticleMarkdown({
      title: "Medicare: A Guide",
      slug: "medicare-guide",
      excerpt: "A long enough excerpt for cards and previews in the Learning Center.",
      category: "plan-types",
      metaDescription:
        "Educational Medicare overview with at least forty characters for SEO metadata fields.",
      featuredImage: "/learning-center/medicare-guide.webp",
      featured: true,
      published: true,
      sortOrder: 10,
      publishedAt: "2026-06-16",
      bodyMd: "## Intro\n\nEducational body copy here with enough length for validation in tests.",
    });
    expect(md).toContain('title: "Medicare: A Guide"');
    expect(md).toContain("slug: medicare-guide");
    expect(md).toContain("## Intro");
    expect(md).toContain("## Frequently asked questions");
  });

  it("builds TPMO-safe featured image prompts", () => {
    const prompt = buildFeaturedImagePrompt({
      title: "Understanding Part B",
      excerpt: "Plain-language overview of Part B premiums without sales pressure.",
      category: "costs",
      slug: "understanding-medicare-part-b-premiums",
    });
    expect(prompt).toContain("Multicultural");
    expect(prompt.toLowerCase()).toContain("photorealistic");
    expect(prompt).toContain("CMS VISUAL RULES");
    expect(prompt.toLowerCase()).not.toContain("enroll now");
  });

  it("builds public featured image paths", () => {
    expect(featuredImagePublicPath("my-slug", "jpg")).toBe("/learning-center/my-slug.jpg");
  });
});
