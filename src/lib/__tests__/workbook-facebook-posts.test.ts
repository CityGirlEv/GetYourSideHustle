import { describe, expect, it } from "vitest";
import {
  buildWorkbookFacebookPostTemplates,
  draftHasWorkbookFacebookCopy,
} from "@/lib/content-factory/workbook-facebook-post-templates";
import {
  hideStandaloneWorkbookPersonalPost,
  shouldShowWorkbookFacebookPostsPanel,
  WORKBOOK_PAGE_FB_SLOT,
  WORKBOOK_PERSONAL_FB_SLOT,
} from "@/lib/content-factory/workbook-facebook-posts";

describe("workbook-facebook-posts", () => {
  it("shows panel on lead magnet produce at 10 AM", () => {
    expect(
      shouldShowWorkbookFacebookPostsPanel({
        id: "lm:produce",
        type: "lead_magnet",
        slotIndex: 0,
        milestone: "produce",
        title: "Workbook",
        date: "2026-06-20",
        detail: "",
      }),
    ).toBe(true);
  });

  it("hides personal share as standalone calendar row", () => {
    const event = {
      id: "fb:7:launch",
      type: "facebook_post" as const,
      slotIndex: WORKBOOK_PERSONAL_FB_SLOT,
      milestone: "launch" as const,
      title: "Personal share",
      date: "2026-06-20",
      detail: "",
    };
    expect(hideStandaloneWorkbookPersonalPost(event)).toBe(true);
    expect(shouldShowWorkbookFacebookPostsPanel(event)).toBe(false);
  });

  it("uses expected slot indices for page vs personal", () => {
    expect(WORKBOOK_PAGE_FB_SLOT).toBe(3);
    expect(WORKBOOK_PERSONAL_FB_SLOT).toBe(7);
  });
});

describe("workbook-facebook-post-templates", () => {
  it("ships page and personal workbook templates with production URLs", () => {
    const templates = buildWorkbookFacebookPostTemplates();
    expect(templates).toHaveLength(2);
    expect(templates[0]?.body).toMatch(/PBO Turning 65 Workbook/i);
    expect(templates[0]?.body).toMatch(/https:\/\/www\.mypartb\.com\/downloads\//);
    expect(templates[0]?.body).toMatch(/https:\/\/www\.mypartb\.com\/learning-center\//);
    expect(templates[0]?.body).not.toMatch(/localhost/i);
    expect(templates[1]?.body).toMatch(/turning 65 soon|𝗧𝘂𝗿𝗻𝗶𝗻𝗴 𝟲𝟱/i);
    expect(templates[1]?.body).toMatch(/already on Medicare/i);
    expect(templates[1]?.body).toMatch(/Provider Tracker/i);
    expect(templates[1]?.body).toMatch(/free reviews/i);
    expect(templates[1]?.body).toMatch(/open enrollment/i);
    expect(templates[1]?.body).toMatch(/Part B Optimizer Benchmark Tool/i);
    expect(templates[1]?.body).toMatch(/@followers/);
    expect(templates[1]?.body).toMatch(/https:\/\/www\.mypartb\.com\/?/);
    expect(templates[1]?.body).not.toMatch(/turning-65-and-still-working/i);
    expect(templates[1]?.body).toMatch(/https:\/\/www\.mypartb\.com\/downloads\//);
    expect(templates[1]?.body).not.toMatch(/localhost/i);
  });

  it("detects workbook copy vs unrelated tip posts", () => {
    expect(
      draftHasWorkbookFacebookCopy({
        title: "Still working at 65? Free Medicare planning workbook (PDF)",
        body: "PBO Turning 65 Workbook download https://www.mypartb.com/downloads/PBO_Turning_65_Workbook.pdf",
      }),
    ).toBe(true);
    expect(
      draftHasWorkbookFacebookCopy({
        title: "TV ads make Medicare sound simple",
        body: "Compare the documents",
      }),
    ).toBe(false);
    expect(
      draftHasWorkbookFacebookCopy({
        title: "Still working at 65? Free Medicare planning workbook (PDF)",
        body: "Download http://localhost:8081/downloads/PBO_Turning_65_Workbook.pdf",
      }),
    ).toBe(false);
  });
});
