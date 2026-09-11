import { describe, expect, it } from "vitest";
import {
  CERT_BG_MAX_BYTES,
  parseJpegDimensions,
  validateCertificateBackgroundUpload,
} from "../certificate-background";

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

/** Minimal SOF0 JPEG with the given pixel size. */
function jpegWithSize(width: number, height: number, pad = 0): Uint8Array {
  const head = [
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xff, 0xd9,
  ];
  const out = new Uint8Array(head.length + pad);
  out.set(head);
  return out;
}

describe("validateCertificateBackgroundUpload", () => {
  const happy = () => {
    const bytes = jpegWithSize(1024, 682);
    return validateCertificateBackgroundUpload({
      name: "family-cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(bytes),
    });
  };

  it("accepts a landscape JPEG of the certificate", () => {
    const result = happy();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.background.mime).toBe("image/jpeg");
    expect(result.background.width).toBe(1024);
    expect(result.background.height).toBe(682);
    expect(result.background.fileName).toBe("family-cert.jpg");
  });

  it("rejects a missing file name", () => {
    const result = validateCertificateBackgroundUpload({
      name: "",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(jpegWithSize(1024, 682)),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("missing_name");
  });

  it("rejects non-JPEG extensions", () => {
    const png = validateCertificateBackgroundUpload({
      name: "cert.png",
      mimeType: "image/png",
      contentBase64: bytesToBase64(jpegWithSize(1024, 682)),
    });
    expect(png.ok).toBe(false);
    if (!png.ok) expect(png.reason).toBe("extension_blocked");

    const svg = validateCertificateBackgroundUpload({
      name: "cert.svg",
      mimeType: "image/svg+xml",
      contentBase64: btoa("<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
    });
    expect(svg.ok).toBe(false);
    if (!svg.ok) expect(svg.reason).toBe("extension_blocked");
  });

  it("rejects a declared MIME that is not JPEG", () => {
    const result = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/png",
      contentBase64: bytesToBase64(jpegWithSize(1024, 682)),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("mime_blocked");
  });

  it("rejects invalid base64", () => {
    const result = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: "%%%%not-base64%%%%",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("decode_failed");
  });

  it("rejects files over the size cap", () => {
    const result = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(jpegWithSize(1024, 682, CERT_BG_MAX_BYTES + 20)),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("too_large");
  });

  it("rejects PNG or ZIP bytes named as JPEG", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const pngResult = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(png),
    });
    expect(pngResult.ok).toBe(false);
    if (!pngResult.ok) expect(pngResult.reason).toBe("bad_magic");

    const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
    const zipResult = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(zip),
    });
    expect(zipResult.ok).toBe(false);
    if (!zipResult.ok) expect(zipResult.reason).toBe("bad_magic");
  });

  it("rejects HTML/SVG payloads", () => {
    const html = new TextEncoder().encode("<!doctype html><script>alert(1)</script>");
    const result = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(html),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("hostile_payload");
  });

  it("rejects a JPEG that is too small or too large in pixels", () => {
    const tiny = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(jpegWithSize(200, 200)),
    });
    expect(tiny.ok).toBe(false);
    if (!tiny.ok) expect(tiny.reason).toBe("too_small");

    const huge = validateCertificateBackgroundUpload({
      name: "cert.jpg",
      mimeType: "image/jpeg",
      contentBase64: bytesToBase64(jpegWithSize(5000, 800)),
    });
    expect(huge.ok).toBe(false);
    if (!huge.ok) expect(huge.reason).toBe("too_many_pixels");
  });
});

describe("parseJpegDimensions", () => {
  it("reads SOF0 width and height", () => {
    expect(parseJpegDimensions(jpegWithSize(1920, 1080))).toEqual({ width: 1920, height: 1080 });
    expect(parseJpegDimensions(new Uint8Array([0x00, 0x01]))).toBeNull();
  });
});
