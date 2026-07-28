/**
 * Testing Portal evidence: MIME/magic-byte allowlist + light malware heuristics.
 * Allowed: images, PDF, Word (.doc/.docx), Excel (.xls/.xlsx).
 * Max ~1.5MB decoded so base64 fits D1’s ~2MB string limit (avoids SQLITE_TOOBIG).
 */

export const TEST_EVIDENCE_MAX_BYTES = 1_500_000;

const ALLOWED_EXT = /\.(png|jpe?g|gif|webp|pdf|doc|docx|xls|xlsx)$/i;

export type EvidenceScanResult =
  | { ok: true; mime: string; scanStatus: "clean"; scanDetail: string }
  | { ok: false; error: string; scanStatus: "rejected"; scanDetail: string };

function bytesStartWith(bytes: Uint8Array, sig: number[]): boolean {
  if (bytes.length < sig.length) return false;
  return sig.every((b, i) => bytes[i] === b);
}

function looksLikeZip(bytes: Uint8Array): boolean {
  return bytesStartWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || bytesStartWith(bytes, [0x50, 0x4b, 0x05, 0x06]);
}

/** Reject common active-content paths inside DOCX/XLSX (ZIP). */
function officeZipHasMacros(bytes: Uint8Array): boolean {
  // Cheap ASCII scan for vbaProject / macros without full unzip.
  const sample = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 512_000)));
  return /vbaProject\.bin/i.test(sample) || /word\/macros/i.test(sample) || /xl\/macros/i.test(sample);
}

function pdfLooksHostile(bytes: Uint8Array): boolean {
  const sample = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 256_000)));
  // Block obvious embedded JS / launch actions (not a full AV — defense in depth).
  return /\/JavaScript\b/i.test(sample) || /\/JS\b/.test(sample) || /\/Launch\b/.test(sample);
}

export function decodeBase64ToBytes(b64: string): Uint8Array | null {
  try {
    const cleaned = b64.replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
    const bin = atob(cleaned);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function scanTestEvidence(input: {
  name: string;
  mimeType: string;
  contentBase64: string;
}): EvidenceScanResult {
  const name = String(input.name || "").trim();
  const declared = String(input.mimeType || "").trim().toLowerCase();
  if (!name || !ALLOWED_EXT.test(name)) {
    return {
      ok: false,
      error: "Only image, PDF, Word (.doc/.docx), or Excel (.xls/.xlsx) files are allowed.",
      scanStatus: "rejected",
      scanDetail: "extension_blocked",
    };
  }

  const bytes = decodeBase64ToBytes(input.contentBase64);
  if (!bytes || bytes.length === 0) {
    return {
      ok: false,
      error: "Could not read file contents.",
      scanStatus: "rejected",
      scanDetail: "decode_failed",
    };
  }
  if (bytes.length > TEST_EVIDENCE_MAX_BYTES) {
    return {
      ok: false,
      error: `File too large (max ${Math.round(TEST_EVIDENCE_MAX_BYTES / 1_000_000)}MB decoded). Compress the image or attach a smaller PDF — D1 cannot store bigger blobs.`,
      scanStatus: "rejected",
      scanDetail: "too_large",
    };
  }
  // Base64 expands ~4/3; keep encoded payload under D1’s ~2MB string ceiling.
  const encodedLen = String(input.contentBase64 || "")
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s+/g, "").length;
  if (encodedLen > 1_900_000) {
    return {
      ok: false,
      error:
        "Attachment is too large for the database after encoding. Compress the file under ~1.5MB and try again.",
      scanStatus: "rejected",
      scanDetail: "too_large_encoded",
    };
  }

  const lower = name.toLowerCase();
  let mime = declared;

  if (/\.(png)$/i.test(lower)) {
    if (!bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47])) {
      return { ok: false, error: "PNG signature mismatch.", scanStatus: "rejected", scanDetail: "bad_png" };
    }
    mime = "image/png";
  } else if (/\.jpe?g$/i.test(lower)) {
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) {
      return { ok: false, error: "JPEG signature mismatch.", scanStatus: "rejected", scanDetail: "bad_jpeg" };
    }
    mime = "image/jpeg";
  } else if (/\.gif$/i.test(lower)) {
    if (!bytesStartWith(bytes, [0x47, 0x49, 0x46, 0x38])) {
      return { ok: false, error: "GIF signature mismatch.", scanStatus: "rejected", scanDetail: "bad_gif" };
    }
    mime = "image/gif";
  } else if (/\.webp$/i.test(lower)) {
    if (!(bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46]) && bytes[8] === 0x57 && bytes[9] === 0x45)) {
      return { ok: false, error: "WEBP signature mismatch.", scanStatus: "rejected", scanDetail: "bad_webp" };
    }
    mime = "image/webp";
  } else if (/\.pdf$/i.test(lower)) {
    if (!bytesStartWith(bytes, [0x25, 0x50, 0x44, 0x46])) {
      return { ok: false, error: "PDF signature mismatch.", scanStatus: "rejected", scanDetail: "bad_pdf" };
    }
    if (pdfLooksHostile(bytes)) {
      return {
        ok: false,
        error: "PDF rejected: embedded scripts or launch actions are not allowed.",
        scanStatus: "rejected",
        scanDetail: "pdf_active_content",
      };
    }
    mime = "application/pdf";
  } else if (/\.docx$/i.test(lower)) {
    if (!looksLikeZip(bytes)) {
      return { ok: false, error: "DOCX must be a valid Office Open XML package.", scanStatus: "rejected", scanDetail: "bad_docx" };
    }
    if (officeZipHasMacros(bytes)) {
      return {
        ok: false,
        error: "Word file rejected: macros / VBA are not allowed.",
        scanStatus: "rejected",
        scanDetail: "docx_macros",
      };
    }
    mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  } else if (/\.xlsx$/i.test(lower)) {
    if (!looksLikeZip(bytes)) {
      return { ok: false, error: "XLSX must be a valid Office Open XML package.", scanStatus: "rejected", scanDetail: "bad_xlsx" };
    }
    if (officeZipHasMacros(bytes)) {
      return {
        ok: false,
        error: "Excel file rejected: macros / VBA are not allowed.",
        scanStatus: "rejected",
        scanDetail: "xlsx_macros",
      };
    }
    mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else if (/\.doc$/i.test(lower)) {
    // Legacy OLE Compound Document
    if (!bytesStartWith(bytes, [0xd0, 0xcf, 0x11, 0xe0])) {
      return { ok: false, error: "DOC signature mismatch.", scanStatus: "rejected", scanDetail: "bad_doc" };
    }
    mime = "application/msword";
  } else if (/\.xls$/i.test(lower)) {
    // Legacy OLE Compound Document (same container as .doc)
    if (!bytesStartWith(bytes, [0xd0, 0xcf, 0x11, 0xe0])) {
      return { ok: false, error: "XLS signature mismatch.", scanStatus: "rejected", scanDetail: "bad_xls" };
    }
    mime = "application/vnd.ms-excel";
  } else {
    return {
      ok: false,
      error: "Unsupported file type.",
      scanStatus: "rejected",
      scanDetail: "unsupported",
    };
  }

  return { ok: true, mime, scanStatus: "clean", scanDetail: "allowlisted_magic_ok" };
}
