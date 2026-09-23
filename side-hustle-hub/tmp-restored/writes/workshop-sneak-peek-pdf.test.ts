import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../pdf-branding", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../pdf-branding")>();
  return {
    ...actual,
    loadPdfLogoDataUrl: vi.fn(async () => undefined),
  };
});

import { AI_SCENE_PACKS_WORKSHOP_ID, workshopSneakPeek } from "../workshop-playbooks";
import {
  buildWorkshopSneakPeekPdf,
  pdfSafeWorkshopText,
  workshopSneakPeekPdfFilename,
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

  it("names the MAKE IT POP guide PDF and paints aligned TOC, rules, and Before Class", async () => {
    const peek = workshopSneakPeek(AI_SCENE_PACKS_WORKSHOP_ID)!;
    expect(workshopSneakPeekPdfFilename(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      "GYSH-MAKE-IT-POP-Workshop-Guide.pdf",
    );
    expect(workshopSneakPeekPdfFilename("glow-getter-launch")).toBeNull();
    expect(workshopSneakPeekPdfTitle(peek)).toBe("MAKE IT POP Workshop Guide");

    const doc = await buildWorkshopSneakPeekPdf(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(doc).toBeTruthy();
    expect(doc!.getNumberOfPages()).toBeGreaterThanOrEqual(1);

    const raw = pdfLatin1(doc!);
    expect(raw).not.toMatch(/â€/);
    expect(raw).toContain("MAKE IT POP");
    expect(raw).toContain("Before Class - Ready Check");
    expect(raw).toContain("Arrive ready");
    expect(raw).toContain("ChatGPT");
    expect(raw).not.toContain("☐");
    expect(raw).not.toContain("—");
    expect(await buildWorkshopSneakPeekPdf("glow-getter-launch")).toBeNull();
  });
});
