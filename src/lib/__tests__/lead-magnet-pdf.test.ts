import { describe, expect, it, vi } from "vitest";
import {
  leadMagnetPdfHrefIfSaved,
  leadMagnetPdfPreviewHref,
  leadMagnetPdfPublicPath,
  leadMagnetSlugFromDraft,
  workbookDownloadUrl,
  workbookSocialTeaserPreviewHref,
} from "@/lib/content-factory/lead-magnet-paths";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";
import { LEARNING_ARTICLE_DISCLAIMER } from "@/lib/learning-center";
import { formatSiteCopyright } from "@/lib/medicare-disclaimers";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import { SITE_TAGLINE } from "@/lib/site-brand";
import {
  buildLeadMagnetWorkbookPdf,
  estimateWorkbookListSectionHeight,
  estimateWorkbookQuestionsSectionHeight,
  isWorkbookQuestionsSectionHeading,
  itemNeedsPrescriptionRows,
  leadMagnetPdfDataUrl,
} from "@/lib/lead-magnet-pdf";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("lead-magnet-paths", () => {
  it("derives slug and saved PDF href", () => {
    const draft = {
      title: "Medicare at 65 Planning Workbook",
      payload: {
        suggestedSlug: "PBO_Turning_65_Workbook",
        pdfSavedAt: "2026-06-20T12:00:00.000Z",
      },
    };
    expect(leadMagnetSlugFromDraft(draft)).toBe("PBO_Turning_65_Workbook");
    expect(leadMagnetPdfPublicPath("PBO_Turning_65_Workbook")).toBe(
      "/downloads/PBO_Turning_65_Workbook.pdf",
    );
    expect(leadMagnetPdfHrefIfSaved(draft)).toBe(
      "/downloads/PBO_Turning_65_Workbook.pdf?v=2026-06-20T12%3A00%3A00.000Z",
    );
  });

  it("builds public workbook download URL", () => {
    expect(workbookDownloadUrl()).toBe(
      "https://www.mypartb.com/downloads/PBO_Turning_65_Workbook.pdf",
    );
  });

  it("uses production URL even when PUBLIC_SITE_URL is localhost", () => {
    vi.stubEnv("PUBLIC_SITE_URL", "http://localhost:8081");
    expect(workbookDownloadUrl()).toBe(
      "https://www.mypartb.com/downloads/PBO_Turning_65_Workbook.pdf",
    );
    vi.unstubAllEnvs();
  });

  it("falls back to public path for preview when not saved in draft payload", () => {
    const draft = {
      title: "Part B Optimizer (PBO) Turning 65 Workbook",
      payload: { suggestedSlug: "PBO_Turning_65_Workbook" },
    };
    expect(leadMagnetPdfPreviewHref(draft)).toBe(
      "/downloads/PBO_Turning_65_Workbook.pdf",
    );
    expect(workbookSocialTeaserPreviewHref(draft)).toBe(
      "/downloads/PBO_Turning_65_Workbook-facebook-teaser.jpg",
    );
  });
});

describe("lead-magnet-pdf", () => {
  it("detects prescription checklist items for two-column drug rows", () => {
    expect(itemNeedsPrescriptionRows("List every prescription with exact dosage")).toBe(true);
    expect(itemNeedsPrescriptionRows("Write down preferred doctors, specialists, and hospitals")).toBe(
      false,
    );
  });

  it("detects the review-meeting questions section heading", () => {
    expect(isWorkbookQuestionsSectionHeading("Questions for your review meeting")).toBe(true);
    expect(isWorkbookQuestionsSectionHeading("Before you compare plans")).toBe(false);
  });

  it("estimates review-meeting questions with answer lines and extra lines", () => {
    const doc = buildLeadMagnetWorkbookPdf({
      title: "Medicare at 65 Planning Workbook",
      excerpt: "Printable checklist before comparing plans.",
      body: "## Questions for your review meeting\n\n- Question one?",
    });
    const questions = [
      "Do I need Part B now or can I delay without a penalty?",
      "Would Original Medicare plus Medigap or a Medicare Advantage plan fit my care patterns?",
      "How do my drugs appear on each plan formulary?",
    ];
    const height = estimateWorkbookQuestionsSectionHeight(doc, questions, 516);
    expect(height).toBeGreaterThan(300);
  });

  it("uses a separate page for review-meeting questions in the full workbook", () => {
    const doc = buildLeadMagnetWorkbookPdf({
      title: DEFAULT_WORKBOOK_LEAD_MAGNET.title,
      excerpt: DEFAULT_WORKBOOK_LEAD_MAGNET.excerpt,
      body: DEFAULT_WORKBOOK_LEAD_MAGNET.body,
    });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
  });

  it("estimates checklist section height including Notes lines", () => {
    const doc = buildLeadMagnetWorkbookPdf({
      title: "Medicare at 65 Planning Workbook",
      excerpt: "Printable checklist before comparing plans.",
      body: "- List every prescription\n- Write down preferred doctors",
    });
    const height = estimateWorkbookListSectionHeight(
      doc,
      ["List every prescription", "Write down preferred doctors"],
      516,
      "ul",
    );
    expect(height).toBeGreaterThan(200);
  });

  it("builds a workbook PDF document", () => {
    const doc = buildLeadMagnetWorkbookPdf({
      title: "Medicare at 65 Planning Workbook",
      excerpt: "Printable checklist before comparing plans.",
      body: [
        "# Medicare at 65 Planning Workbook",
        "",
        "## Before you compare plans",
        "",
        "- List every prescription with exact dosage",
        "- Write down preferred doctors",
      ].join("\n"),
    }, { miniLogoDataUrl: TINY_PNG });
    expect(doc.getNumberOfPages()).toBeGreaterThan(0);
    expect(doc.internal.pages.length).toBeGreaterThan(0);
  });

  it("includes supplement sections for drugs, providers, and questions", () => {
    const doc = buildLeadMagnetWorkbookPdf({
      title: "Medicare at 65 Planning Workbook",
      excerpt: "Printable checklist before comparing plans.",
      body: [
        "# Medicare at 65 Planning Workbook",
        "",
        "## Before you compare plans",
        "",
        "- List every prescription with exact dosage",
        "- Write down preferred doctors",
      ].join("\n"),
    });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
  });

  it("starts supplement section on a fresh page in the workbook PDF", () => {
    const shortBody = [
      "# Medicare at 65 Planning Workbook",
      "",
      "## Before you compare plans",
      "",
      "- List every prescription with exact dosage",
    ].join("\n");
    const doc = buildLeadMagnetWorkbookPdf({
      title: "Medicare at 65 Planning Workbook",
      excerpt: "Printable checklist.",
      body: shortBody,
    });
    // Short section 1 leaves room on page 1; supplement must start page 2, disclaimer page 3.
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
  });

  it("builds a data URL with application/pdf mime for inline preview", () => {
    const doc = buildLeadMagnetWorkbookPdf({
      title: "Medicare at 65 Planning Workbook",
      excerpt: "Printable checklist.",
      body: "# Workbook\n\n- Item one",
    });
    const dataUrl = leadMagnetPdfDataUrl(doc);
    expect(dataUrl.startsWith("data:application/pdf;base64,")).toBe(true);
    expect(dataUrl.includes("filename=")).toBe(false);
  });

  it("puts all disclaimers on a dedicated last page", () => {
    const doc = buildLeadMagnetWorkbookPdf(
      {
        title: DEFAULT_WORKBOOK_LEAD_MAGNET.title,
        excerpt: DEFAULT_WORKBOOK_LEAD_MAGNET.excerpt,
        body: DEFAULT_WORKBOOK_LEAD_MAGNET.body,
      },
      { miniLogoDataUrl: TINY_PNG },
    );

    const blobText = new TextDecoder("latin1").decode(
      new Uint8Array(doc.output("arraybuffer")),
    );
    expect(blobText).toContain(LEARNING_ARTICLE_DISCLAIMER.slice(0, 40));
    expect(blobText).toContain("Educational workbook only");
    expect(blobText).toContain(SITE_TAGLINE);
    expect(blobText).toContain(formatSiteCopyright());
    expect(blobText).toContain(PUBLIC_WEBSITE_HOST);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
  });
});
