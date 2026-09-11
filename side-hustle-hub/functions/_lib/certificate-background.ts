/**
 * Certificate background image uploads — JPEG only, magic-byte checked, sized for D1.
 */

export const CERT_BG_MAX_BYTES = 700_000;
export const CERT_BG_MIN_WIDTH = 600;
export const CERT_BG_MIN_HEIGHT = 400;
export const CERT_BG_MAX_EDGE = 4500;

export type CertificateBackground = {
  mime: "image/jpeg";
  width: number;
  height: number;
  base64: string;
  fileName: string;
};

export type CertificateBackgroundScan =
  | { ok: true; background: CertificateBackground }
  | { ok: false; error: string; reason: string };

function bytesStartWith(bytes: Uint8Array, sig: number[]): boolean {
  if (bytes.length < sig.length) return false;
  return sig.every((b, i) => bytes[i] === b);
}

export function decodeBase64ToBytes(b64: string): Uint8Array | null {
  try {
    const cleaned = String(b64 || "")
      .replace(/^data:[^;]+;base64,/, "")
      .replace(/\s+/g, "");
    if (!cleaned) return null;
    const bin = atob(cleaned);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function parseJpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 10 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i < bytes.length - 8) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1]!;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0x00 || marker === 0xff) {
      i += 1;
      continue;
    }
    const len = (bytes[i + 2]! << 8) | bytes[i + 3]!;
    if (len < 2) return null;
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      const height = (bytes[i + 5]! << 8) | bytes[i + 6]!;
      const width = (bytes[i + 7]! << 8) | bytes[i + 8]!;
      if (!width || !height) return null;
      return { width, height };
    }
    i += 2 + len;
  }
  return null;
}

/** Validate an admin-uploaded certificate JPEG (happy path + each reject path are unit-tested). */
export function validateCertificateBackgroundUpload(input: {
  name: string;
  mimeType?: string;
  contentBase64: string;
}): CertificateBackgroundScan {
  const name = String(input.name || "").trim();
  const declared = String(input.mimeType || "").trim().toLowerCase();
  if (!name) {
    return { ok: false, error: "Choose a JPEG file to upload.", reason: "missing_name" };
  }
  if (!/\.jpe?g$/i.test(name)) {
    return {
      ok: false,
      error: "Upload a JPEG of the certificate (.jpg or .jpeg). If you have a PNG, save it as JPEG first.",
      reason: "extension_blocked",
    };
  }
  if (declared && declared !== "image/jpeg" && declared !== "image/jpg" && declared !== "application/octet-stream") {
    return { ok: false, error: "File type must be JPEG.", reason: "mime_blocked" };
  }

  const bytes = decodeBase64ToBytes(input.contentBase64);
  if (!bytes || bytes.length === 0) {
    return { ok: false, error: "Could not read the image.", reason: "decode_failed" };
  }
  if (bytes.length > CERT_BG_MAX_BYTES) {
    return {
      ok: false,
      error: "Image is too large (max 700KB). Compress the JPEG and try again.",
      reason: "too_large",
    };
  }
  if (bytesStartWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    return { ok: false, error: "That file is not a JPEG.", reason: "bad_magic" };
  }
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 256)));
  if (/<\s*(svg|html|script|iframe)\b/i.test(head) || /<!doctype/i.test(head)) {
    return { ok: false, error: "That file is not a JPEG image.", reason: "hostile_payload" };
  }
  if (!bytesStartWith(bytes, [0xff, 0xd8])) {
    return { ok: false, error: "JPEG signature mismatch. Export the certificate as a .jpg and retry.", reason: "bad_jpeg" };
  }

  const size = parseJpegDimensions(bytes);
  if (!size) {
    return { ok: false, error: "Could not read JPEG dimensions.", reason: "bad_dimensions" };
  }
  if (size.width < CERT_BG_MIN_WIDTH || size.height < CERT_BG_MIN_HEIGHT) {
    return {
      ok: false,
      error: `Image is too small (min ${CERT_BG_MIN_WIDTH}×${CERT_BG_MIN_HEIGHT}).`,
      reason: "too_small",
    };
  }
  if (size.width > CERT_BG_MAX_EDGE || size.height > CERT_BG_MAX_EDGE) {
    return {
      ok: false,
      error: `Image is too large in pixels (max ${CERT_BG_MAX_EDGE}px on a side).`,
      reason: "too_many_pixels",
    };
  }

  const cleaned = String(input.contentBase64 || "")
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s+/g, "");
  return {
    ok: true,
    background: {
      mime: "image/jpeg",
      width: size.width,
      height: size.height,
      base64: cleaned,
      fileName: name.slice(0, 180),
    },
  };
}
