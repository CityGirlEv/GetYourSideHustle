import { describe, expect, it } from "vitest";
import {
  leadMagnetPdfHrefIfSaved,
  leadMagnetPdfPublicPath,
  leadMagnetSlugFromDraft,
  workbookDownloadUrl,
} from "@/lib/content-factory/lead-magnet-paths";
import { buildLeadMagnetWorkbookPdf } from "@/lib/lead-magnet-pdf";

describe("lead-magnet-paths", () => {
  it("derives slug and saved PDF href", () => {
    const draft = {
      title: "Medicare at 65 Planning Workbook",
      payload: {
        suggestedSlug: "medicare-at-65-planning-workbook",
        pdfSavedAt: "2026-06-20T12:00:00.000Z",
      },
    };
    expect(leadMagnetSlugFromDraft(draft)).toBe("medicare-at-65-planning-workbook");
    expect(leadMagnetPdfPublicPath("medicare-at-65-planning-workbook")).toBe(
      "/downloads/medicare-at-65-planning-workbook.pdf",
    );
    expect(leadMagnetPdfHrefIfSaved(draft)).toBe(
      "/downloads/medicare-at-65-planning-workbook.pdf?v=2026-06-20T12%3A00%3A00.000Z",
    );
  });

  it("builds public workbook download URL", () => {
    expect(workbookDownloadUrl()).toBe(
      "https://mypartb.com/downloads/medicare-at-65-planning-workbook.pdf",
    );
  });
});

describe("lead-magnet-pdf", () => {
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
    });
    expect(doc.getNumberOfPages()).toBeGreaterThan(0);
    expect(doc.internal.pages.length).toBeGreaterThan(0);
  });
});
