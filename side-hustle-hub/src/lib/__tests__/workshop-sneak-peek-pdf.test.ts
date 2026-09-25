import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AI_SCENE_PACKS_PREREQ_PDF_PATH,
  AI_SCENE_PACKS_WORKSHOP_ID,
  workshopSneakPeek,
} from "../workshop-playbooks";
import {
  buildWorkshopSneakPeekPdf,
  pdfSafeWorkshopText,
  workshopGuidePdfAttachment,
  workshopGuidePdfBase64,
  workshopSneakPeekPdfFilename,
  workshopSneakPeekPdfPublicPath,
  workshopSneakPeekPdfPublicUrl,
  workshopSneakPeekPdfTitle,
} from "../workshop-sneak-peek-pdf";

function pdfLatin1(doc: { output: (type: "arraybuffer") => ArrayBuffer }): string {
  return Buffer.from(doc.output("arraybuffer")).toString("latin1");
}

describe("workshop sneak peek PDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("converts Unicode dashes and ballot boxes to Helvetica-safe text", () => {
    expect(pdfSafeWorkshopText("Before Class — Ready Check")).toBe("Before Class - Ready Check");
    expect(pdfSafeWorkshopText("• ChatGPT + Hedra + CapCut •")).toBe("ChatGPT + Hedra + CapCut");
    expect(pdfSafeWorkshopText("0.1  ☐  Arrive ready.")).toBe("0.1 Arrive ready.");
  });

  it("names the MAKE IT POP guide PDF and paints copyright, TOC, rules, and Before Class", async () => {
    const peek = workshopSneakPeek(AI_SCENE_PACKS_WORKSHOP_ID)!;
    expect(workshopSneakPeekPdfFilename(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      "GYSH-MAKE-IT-POP-Workshop-Guide.pdf",
    );
    expect(workshopSneakPeekPdfFilename("glow-getter-launch")).toBeNull();
    expect(workshopSneakPeekPdfPublicPath(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      AI_SCENE_PACKS_PREREQ_PDF_PATH,
    );
    expect(workshopSneakPeekPdfPublicPath("glow-getter-launch")).toBeNull();
    expect(workshopSneakPeekPdfPublicUrl(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      `https://getyoursidehustle.com${AI_SCENE_PACKS_PREREQ_PDF_PATH}`,
    );
    expect(workshopSneakPeekPdfTitle(peek)).toBe("MAKE IT POP Workshop Guide");

    const doc = await buildWorkshopSneakPeekPdf(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(doc).toBeTruthy();
    expect(doc!.getNumberOfPages()).toBeGreaterThanOrEqual(2);

    const raw = pdfLatin1(doc!);
    expect(raw).not.toMatch(/â€/);
    expect(raw).toContain("MAKE IT POP");
    expect(raw).toContain("TABLE OF CONTENTS");
    expect(raw).toContain("COPYRIGHT & USE NOTICE");
    expect(raw).toContain("All Rights Reserved");
    expect(raw).toContain("proprietary educational materials");
    expect(raw).toContain("prior written consent");
    expect(raw).toContain("Credits & Plans");
    expect(raw).toContain("1,500 credits");
    expect(raw).toContain("GYSH TIP");
    expect(raw).toContain("Pricing & Credit Disclaimer");
    expect(raw).toContain("BEFORE CLASS");
    expect(raw).toContain("Arrive ready");
    expect(raw).toContain("ChatGPT");
    expect(raw).not.toContain("☐");
    expect(raw).not.toContain("—");
    expect(raw).not.toContain("Last updated");
    expect(await buildWorkshopSneakPeekPdf("glow-getter-launch")).toBeNull();

    const b64 = workshopGuidePdfBase64(doc!);
    expect(b64.length).toBeGreaterThan(100);
    expect(b64).toMatch(/^[A-Za-z0-9+/]+=*$/);

    const attachment = await workshopGuidePdfAttachment(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(attachment?.filename).toBe("GYSH-MAKE-IT-POP-Workshop-Guide.pdf");
    expect(attachment?.contentType).toBe("application/pdf");
    expect(attachment?.content.length).toBeGreaterThan(100);
    expect(await workshopGuidePdfAttachment("glow-getter-launch")).toBeNull();
  });
});
