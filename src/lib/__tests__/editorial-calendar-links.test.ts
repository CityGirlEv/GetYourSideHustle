import { describe, expect, it } from "vitest";
import {
  buildCalendarEventLinks,
  facebookPostImageGuidance,
  facebookPostPairedArticleSlot,
  resolveHeroSlugForImagePrompt,
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

  it("builds article links with learning center and hero placeholder when not uploaded", () => {
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
    expect(links.some((l) => l.label === "Hero image (upload via Image Prompt)")).toBe(true);
    expect(links.some((l) => l.label === "View hero image")).toBe(false);
    expect(links.some((l) => l.label === "Image Prompt 1")).toBe(true);
  });

  it("guides article-promo facebook posts without hero URL until uploaded", () => {
    const draftBySlot = new Map<string, CalendarDraftRef>([["article:0", articleDraft]]);
    const guidance = facebookPostImageGuidance(0, draftBySlot);
    expect(guidance.source).toBe("article-hero");
    expect(guidance.imageUrl).toBeNull();
    expect(guidance.steps.length).toBeGreaterThan(2);
  });

  it("builds image prompt links with open prompt and hero placeholder", () => {
    const imageDraft: CalendarDraftRef = {
      ...articleDraft,
      type: "image_prompt",
      slotIndex: 0,
      body: "Photorealistic Medicare education scene...",
      payload: { suggestedSlug: "what-is-medicare-prior-authorization" },
    };
    const draftBySlot = new Map<string, CalendarDraftRef>([
      ["article:0", articleDraft],
      ["image_prompt:0", imageDraft],
    ]);
    const links = buildCalendarEventLinks({
      event: {
        id: "image_prompt:0:produce",
        type: "image_prompt",
        slotIndex: 0,
        milestone: "produce",
        title: "Image Prompt 1",
        date: "2026-06-19",
        detail: "Generate hero image prompt",
      },
      draft: imageDraft,
      batchId: "batch-1",
      draftBySlot,
    });
    expect(links.some((l) => l.label === "Open image prompt")).toBe(true);
    expect(links.some((l) => l.label === "Hero image (upload below)")).toBe(true);
    expect(links.some((l) => l.label === "View hero image")).toBe(false);
  });

  it("links hero image after calendar upload", () => {
    const uploadedAt = "2026-06-19T12:00:00.000Z";
    const imageDraft: CalendarDraftRef = {
      ...articleDraft,
      type: "image_prompt",
      slotIndex: 0,
      payload: {
        suggestedSlug: "what-is-medicare-prior-authorization",
        heroUploadedAt: uploadedAt,
        heroUploadPath: "/learning-center/what-is-medicare-prior-authorization.jpg",
      },
    };
    const draftBySlot = new Map<string, CalendarDraftRef>([
      ["article:0", articleDraft],
      ["image_prompt:0", imageDraft],
    ]);
    const links = buildCalendarEventLinks({
      event: {
        id: "image_prompt:0:produce",
        type: "image_prompt",
        slotIndex: 0,
        milestone: "produce",
        title: "Image Prompt 1",
        date: "2026-06-19",
        detail: "Generate hero image prompt",
      },
      draft: imageDraft,
      batchId: "batch-1",
      draftBySlot,
    });
    const heroLink = links.find((l) => l.label === "View hero image");
    expect(heroLink?.href).toBe(
      `/learning-center/what-is-medicare-prior-authorization.jpg?v=${encodeURIComponent(uploadedAt)}`,
    );
  });

  it("resolves hero slug from paired article", () => {
    const draftBySlot = new Map<string, CalendarDraftRef>([["article:0", articleDraft]]);
    expect(
      resolveHeroSlugForImagePrompt(undefined, draftBySlot, 0),
    ).toBe("what-is-medicare-prior-authorization");
  });

  it("guides workbook posts to the checklist teaser image", () => {
    const draftBySlot = new Map<string, CalendarDraftRef>([
      [
        "lead_magnet:0",
        {
          id: "lm1",
          type: "lead_magnet",
          slotIndex: 0,
          status: "draft",
          title: "Medicare at 65 Planning Workbook",
          excerpt: "",
          body: "",
          payload: {
            suggestedSlug: "PBO_Turning_65_Workbook",
            socialTeaserSavedAt: "2026-06-20T12:00:00.000Z",
          },
          publishedRef: null,
        },
      ],
    ]);
    const guidance = facebookPostImageGuidance(3, draftBySlot);
    expect(guidance.source).toBe("workbook-teaser");
    expect(guidance.headline).toMatch(/checklist teaser/i);
    expect(guidance.imageLabel).toContain("facebook-teaser.jpg");
    expect(guidance.imageUrl).toContain("/downloads/PBO_Turning_65_Workbook-facebook-teaser.jpg");
  });

  it("omits workbook teaser URL until the JPG is saved", () => {
    const draftBySlot = new Map<string, CalendarDraftRef>([
      [
        "lead_magnet:0",
        {
          id: "lm1",
          type: "lead_magnet",
          slotIndex: 0,
          status: "draft",
          title: "Medicare at 65 Planning Workbook",
          excerpt: "",
          body: "",
          payload: { suggestedSlug: "PBO_Turning_65_Workbook" },
          publishedRef: null,
        },
      ],
    ]);
    const guidance = facebookPostImageGuidance(3, draftBySlot);
    expect(guidance.imageUrl).toBeNull();
  });
});
