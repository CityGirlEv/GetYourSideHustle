import { describe, expect, it } from "vitest";
import {
  isSoftLaunchMediaAttachment,
  validateSoftLaunchMediaAttachment,
} from "../soft-launch-attachments";

describe("soft-launch attachment validation", () => {
  it("accepts image and video names/mime types", () => {
    expect(isSoftLaunchMediaAttachment("banner.png", "image/png")).toBe(true);
    expect(isSoftLaunchMediaAttachment("shot.JPEG", "")).toBe(true);
    expect(isSoftLaunchMediaAttachment("clip.mp4", "video/mp4")).toBe(true);
    expect(isSoftLaunchMediaAttachment("clip.webm", "")).toBe(true);
    expect(isSoftLaunchMediaAttachment("doc.pdf", "application/pdf")).toBe(true);
  });

  it("rejects non-media and empty payloads", () => {
    const badType = validateSoftLaunchMediaAttachment({
      name: "notes.exe",
      mimeType: "application/octet-stream",
      contentBase64: "aaaa",
    });
    expect(badType.ok).toBe(false);

    const empty = validateSoftLaunchMediaAttachment({
      name: "a.png",
      mimeType: "image/png",
      contentBase64: "",
    });
    expect(empty.ok).toBe(false);
  });

  it("accepts a tiny valid PDF payload", () => {
    const pdf = btoa("%PDF-1.4\n%EOF\n");
    const ok = validateSoftLaunchMediaAttachment({
      name: "brief.pdf",
      mimeType: "application/pdf",
      contentBase64: pdf,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.mime).toBe("application/pdf");
  });

  it("rejects a PDF whose bytes are not a real PDF", () => {
    const bad = validateSoftLaunchMediaAttachment({
      name: "brief.pdf",
      mimeType: "application/pdf",
      contentBase64: btoa("not a pdf"),
    });
    expect(bad.ok).toBe(false);
  });

  it("accepts a tiny valid base64 png payload", () => {
    const png =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const ok = validateSoftLaunchMediaAttachment({
      name: "pixel.png",
      mimeType: "image/png",
      contentBase64: png,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.mime).toBe("image/png");
      expect(ok.size).toBeGreaterThan(0);
    }
  });

  it("accepts a minimal ftyp MP4 header payload", () => {
    // Minimal ISO BMFF: size + 'ftyp'
    const bytes = new Uint8Array([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x00,
      0x01, 0x69, 0x73, 0x6f, 0x6d, 0x61, 0x76, 0x63, 0x31,
    ]);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    const b64 = btoa(bin);
    const ok = validateSoftLaunchMediaAttachment({
      name: "clip.mp4",
      mimeType: "video/mp4",
      contentBase64: b64,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.mime).toBe("video/mp4");
  });
});
