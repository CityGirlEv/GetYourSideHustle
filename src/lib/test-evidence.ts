import { supabase } from "@/integrations/supabase/client";

export const TEST_EVIDENCE_BUCKET = "test-evidence";

// ----------------------------------------------------------------------------
// Allowed evidence types. Screenshots are the primary artifact, so we accept
// the common image formats plus PDF and plain-text logs. Everything else is
// rejected up-front to keep the bucket free of executables, scripts, HTML,
// SVG (which can carry script payloads), Office macros, archives, etc.
// ----------------------------------------------------------------------------
export const EVIDENCE_ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "text/plain",
] as const;
export const EVIDENCE_ALLOWED_EXT = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "heic",
  "heif",
  "pdf",
  "log",
  "txt",
] as const;
export const EVIDENCE_ACCEPT_ATTR =
  "image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif,application/pdf,.log,.txt";
export const EVIDENCE_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Verify the file's leading bytes match a known-safe signature. Prevents
 * uploads where the extension/MIME is spoofed but the actual content is an
 * executable, HTML payload, script, or archive.
 */
async function sniffMagicBytes(
  file: File,
): Promise<"png" | "jpeg" | "gif" | "webp" | "pdf" | "heic" | "text" | "unknown"> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const b = (i: number) => head[i];
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47) return "png";
  // JPEG: FF D8 FF
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return "jpeg";
  // GIF: "GIF8"
  if (b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x38) return "gif";
  // WEBP: "RIFF????WEBP"
  if (
    b(0) === 0x52 &&
    b(1) === 0x49 &&
    b(2) === 0x46 &&
    b(3) === 0x46 &&
    b(8) === 0x57 &&
    b(9) === 0x45 &&
    b(10) === 0x42 &&
    b(11) === 0x50
  )
    return "webp";
  // PDF: "%PDF-"
  if (b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46 && b(4) === 0x2d)
    return "pdf";
  // HEIC/HEIF: bytes 4-7 = "ftyp", brand at 8-11 in {heic, heix, hevc, mif1, msf1, heif}
  if (b(4) === 0x66 && b(5) === 0x74 && b(6) === 0x79 && b(7) === 0x70) {
    const brand = String.fromCharCode(b(8), b(9), b(10), b(11));
    if (["heic", "heix", "hevc", "mif1", "msf1", "heif"].includes(brand)) return "heic";
  }
  // Plain text: every byte printable ASCII or common whitespace
  if (head.every((c) => c === 0x09 || c === 0x0a || c === 0x0d || (c >= 0x20 && c <= 0x7e)))
    return "text";
  return "unknown";
}

/**
 * Throws a user-facing Error if the file is not a safe screenshot/log/PDF.
 * Checks extension, MIME, size, and magic bytes — and explicitly rejects
 * SVG, HTML, scripts, archives, and executables even if the extension was
 * renamed.
 */
export async function validateEvidenceFile(file: File): Promise<void> {
  if (file.size === 0) throw new Error("File is empty.");
  if (file.size > EVIDENCE_MAX_BYTES) throw new Error("File too large — 20 MB max.");

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!EVIDENCE_ALLOWED_EXT.includes(ext as (typeof EVIDENCE_ALLOWED_EXT)[number])) {
    throw new Error(
      `.${ext || "?"} files are not allowed. Upload a screenshot (PNG/JPG/HEIC), PDF, or .log/.txt file.`,
    );
  }
  // Reject obviously dangerous extensions even if somehow in allowlist.
  const banned = [
    "exe",
    "js",
    "mjs",
    "ts",
    "sh",
    "bat",
    "cmd",
    "ps1",
    "jar",
    "apk",
    "dmg",
    "msi",
    "html",
    "htm",
    "svg",
    "xml",
    "zip",
    "rar",
    "7z",
    "tar",
    "gz",
    "docm",
    "xlsm",
    "pptm",
  ];
  if (banned.includes(ext)) throw new Error("File type is not allowed for security reasons.");

  if (
    file.type &&
    !EVIDENCE_ALLOWED_MIME.includes(file.type as (typeof EVIDENCE_ALLOWED_MIME)[number])
  ) {
    throw new Error(`MIME type "${file.type}" is not allowed.`);
  }

  const kind = await sniffMagicBytes(file);
  if (kind === "unknown") {
    throw new Error("File contents do not match a screenshot, PDF, or text log. Upload rejected.");
  }
  // Cross-check magic bytes against extension to catch spoofed files
  const okMap: Record<string, string[]> = {
    png: ["png"],
    jpg: ["jpeg"],
    jpeg: ["jpeg"],
    gif: ["gif"],
    webp: ["webp"],
    heic: ["heic"],
    heif: ["heic"],
    pdf: ["pdf"],
    log: ["text"],
    txt: ["text"],
  };
  if (!okMap[ext]?.includes(kind)) {
    throw new Error("File contents do not match its extension. Upload rejected.");
  }
}

export interface EvidenceFile {
  name: string; // file name only
  path: string; // full object path: <uid>/<testId>/<filename>
  size: number;
  updated_at: string;
}

function folder(userId: string, testId: string) {
  return `${userId}/${testId}`;
}

export async function listTestEvidence(userId: string, testId: string): Promise<EvidenceFile[]> {
  const { data, error } = await supabase.storage
    .from(TEST_EVIDENCE_BUCKET)
    .list(folder(userId, testId), { limit: 100, sortBy: { column: "updated_at", order: "desc" } });
  if (error || !data) return [];
  return data
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => ({
      name: f.name,
      path: `${folder(userId, testId)}/${f.name}`,
      size: (f.metadata as { size?: number } | null)?.size ?? 0,
      updated_at: f.updated_at ?? f.created_at ?? "",
    }));
}

export async function uploadTestEvidence(
  userId: string,
  testId: string,
  file: File,
): Promise<EvidenceFile> {
  await validateEvidenceFile(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder(userId, testId)}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from(TEST_EVIDENCE_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" });
  if (error) throw new Error(error.message);
  return { name: safeName, path, size: file.size, updated_at: new Date().toISOString() };
}

export async function deleteTestEvidence(path: string): Promise<void> {
  const { error } = await supabase.storage.from(TEST_EVIDENCE_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

export async function getTestEvidenceUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(TEST_EVIDENCE_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}
