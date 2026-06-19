import { describe, expect, it } from "vitest";
import {
  buildCalendarEventLinks,
  facebookPostImageGuidance,
  facebookPostPairedArticleSlot,
  slugFromDraft,
} from "@/lib/content-factory/editorial-calendar-links";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";

describe("editorial-calendar-links", () => {
  const articleDraft: CalendarDraftRef = {
    id: "a1",
    type: "article",
    slotIndex: 0,
    status: "approved",
    title: "Prior auth",
    payload: { suggestedSlug: "what-is-medicare-prior-authorization" },
    publishedRef: null,
  };

  it("pairs facebook slots 0-2 with articles", () => {
    expect(facebookPostPairedArticleSlot(0)).toBe(0);
    expect(facebookPostPairedArticleSlot(2)).toBe(2);
    expect(facebookPostPairedArticleSlot(3)).toBeNull();
  });

  it("reads slug from draft payload", () => {
    expect(slugFromDraft(articleDraft)).toBe("what-is-medicare-prior-authorization");
  });

  it("builds article links with learning center and hero image", () => {
    const draftBySlot = new Map<string, CalendarDraftRef>([
      ["article:0", articleDraft],
      ["image_prompt:0", { ...articleDraft, type: "image_prompt", slotIndex: 0 }],
    ]);
    const links = buildCalendarEventLinks({
      event: {
        id: "article:0:launch",
        type: "article",
        slotIndex: 0,
        milestone: "launch",
        title: "Article 1",
        date: "2026-06-18",
        detail: "Publish",
      },
      draft: articleDraft,
      batchId: "batch-1",
      draftBySlot,
    });
    expect(links.some((l) => l.label === "Learning Center article")).toBe(true);
    expect(links.some((l) => l.label === "Hero image")).toBe(true);
    expect(links.some((l) => l.label === "Image Prompt 1")).toBe(true);
  });

  it("guides article-promo facebook posts to use article hero", () => {
    const draftBySlot = new Map<string, CalendarDraftRef>([["article:0", articleDraft]]);
    const guidance = facebookPostImageGuidance(0, draftBySlot);
    expect(guidance.source).toBe("article-hero");
    expect(guidance.imageUrl).toContain("what-is-medicare-prior-authorization.jpg");
    expect(guidance.steps.length).toBeGreaterThan(2);
  });

  it("guides standalone facebook posts to brand image", () => {
    const guidance = facebookPostImageGuidance(4, new Map());
    expect(guidance.source).toBe("brand");
    expect(guidance.imageUrl).toContain("email-header-logo.png");
  });
});
