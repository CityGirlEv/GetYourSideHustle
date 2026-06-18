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
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
] as const;
export const EVIDENCE_ALLOWED_EXT = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "heic",
  "heif",
  "jfif",
  "pdf",
  "log",
  "txt",
  "doc",
  "docx",
  "xls",
  "xlsx",
] as const;
export const EVIDENCE_ACCEPT_ATTR =
  "image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif,application/pdf,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.doc,.docx,.xls,.xlsx,.log,.txt,.jpg,.jpeg,.jfif";
export const EVIDENCE_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
export const EVIDENCE_HELP_TEXT =
  "PNG, JPG, HEIC, GIF, WEBP, PDF, Word (.doc/.docx), Excel (.xls/.xlsx), .log, .txt (20 MB max). Executables, HTML, SVG, scripts, and archives are blocked.";

export type EvidenceKind =
  | "png"
  | "jpeg"
  | "gif"
  | "webp"
  | "pdf"
  | "heic"
  | "text"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx";

const GENERIC_MIMES = new Set(["", "application/octet-stream", "binary/octet-stream"]);

const MIME_ALIASES: Record<string, (typeof EVIDENCE_ALLOWED_MIME)[number]> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

const KIND_TO_EXT: Record<EvidenceKind, string> = {
  png: "png",
  jpeg: "jpg",
  gif: "gif",
  webp: "webp",
  pdf: "pdf",
  heic: "heic",
  text: "txt",
  doc: "doc",
  docx: "docx",
  xls: "xls",
  xlsx: "xlsx",
};

const KIND_TO_MIME: Record<EvidenceKind, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  heic: "image/heic",
  text: "text/plain",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const EXT_TO_KIND: Record<string, EvidenceKind[]> = {
  png: ["png"],
  jpg: ["jpeg"],
  jpeg: ["jpeg"],
  jfif: ["jpeg"],
  gif: ["gif"],
  webp: ["webp"],
  heic: ["heic"],
  heif: ["heic"],
  pdf: ["pdf"],
  log: ["text"],
  txt: ["text"],
  doc: ["doc"],
  docx: ["docx"],
  xls: ["xls"],
  xlsx: ["xlsx"],
};

/**
 * Verify the file's leading bytes match a known-safe signature. Prevents
 * uploads where the extension/MIME is spoofed but the actual content is an
 * executable, HTML payload, script, or archive.
 */
async function sniffMagicBytes(file: File): Promise<EvidenceKind | "unknown"> {
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
  // OOXML (docx/xlsx) — ZIP container; extension disambiguates below.
  if (b(0) === 0x50 && b(1) === 0x4b && (b(2) === 0x03 || b(2) === 0x05 || b(2) === 0x07)) {
    const ext = fileExtension(file);
    if (ext === "docx") return "docx";
    if (ext === "xlsx") return "xlsx";
    return "unknown";
  }
  // Legacy OLE compound document (.doc / .xls)
  if (
    b(0) === 0xd0 &&
    b(1) === 0xcf &&
    b(2) === 0x11 &&
    b(3) === 0xe0 &&
    b(4) === 0xa1 &&
    b(5) === 0xb1 &&
    b(6) === 0x1a &&
    b(7) === 0xe1
  ) {
    const ext = fileExtension(file);
    if (ext === "doc") return "doc";
    if (ext === "xls") return "xls";
    return "unknown";
  }
  return "unknown";
}

function fileExtension(file: File): string {
  const parts = file.name.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() || "").toLowerCase();
}

function normalizeMime(file: File): string {
  if (GENERIC_MIMES.has(file.type)) return "";
  return MIME_ALIASES[file.type] ?? file.type;
}

function resolveExtension(file: File, kind: EvidenceKind): string {
  const ext = fileExtension(file);
  if (ext && EXT_TO_KIND[ext]?.includes(kind)) return ext;
  return KIND_TO_EXT[kind];
}

function mimeMatchesKind(mime: string, kind: EvidenceKind): boolean {
  if (!mime) return true;
  const expected = KIND_TO_MIME[kind];
  if (mime === expected) return true;
  if (kind === "jpeg" && (mime === "image/jpeg" || mime === "image/jpg" || mime === "image/pjpeg"))
    return true;
  if (kind === "heic" && (mime === "image/heic" || mime === "image/heif")) return true;
  if (kind === "text" && mime === "text/plain") return true;
  if ((kind === "docx" || kind === "xlsx") && mime === "application/zip") return true;
  if (
    (kind === "doc" || kind === "xls") &&
    (mime === "application/octet-stream" || mime === "application/x-ole-storage")
  )
    return true;
  return false;
}

export interface PreparedEvidenceFile {
  kind: EvidenceKind;
  ext: string;
  contentType: string;
  safeName: string;
}

/**
 * Validates and normalizes an evidence upload. Many browsers (especially on
 * Windows) send generic MIME types like application/octet-stream even for
 * real PNG/JPEG screenshots — we trust magic bytes in that case.
 */
export async function prepareEvidenceFile(file: File): Promise<PreparedEvidenceFile> {
  if (file.size === 0) throw new Error("File is empty.");
  if (file.size > EVIDENCE_MAX_BYTES) throw new Error("File too large — 20 MB max.");

  const ext = fileExtension(file);
  if (ext && !EVIDENCE_ALLOWED_EXT.includes(ext as (typeof EVIDENCE_ALLOWED_EXT)[number])) {
    throw new Error(
      `.${ext} files are not allowed. Upload an image, PDF, Word, Excel, or .log/.txt file.`,
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

  const kind = await sniffMagicBytes(file);
  if (kind === "unknown") {
    throw new Error(
      "File contents do not match an allowed type (image, PDF, Word, Excel, or text log). Upload rejected.",
    );
  }

  const resolvedExt = resolveExtension(file, kind);
  const mime = normalizeMime(file);
  if (mime && !EVIDENCE_ALLOWED_MIME.includes(mime as (typeof EVIDENCE_ALLOWED_MIME)[number])) {
    throw new Error(`MIME type "${file.type}" is not allowed.`);
  }
  if (!mimeMatchesKind(mime, kind)) {
    throw new Error("File contents do not match its type. Upload rejected.");
  }

  const baseName = file.name.includes(".")
    ? file.name.slice(0, file.name.lastIndexOf("."))
    : file.name || "evidence";
  const safeName = `${baseName.replace(/[^a-zA-Z0-9._-]/g, "_")}.${resolvedExt}`;

  return {
    kind,
    ext: resolvedExt,
    contentType: KIND_TO_MIME[kind],
    safeName,
  };
}

/** @deprecated use prepareEvidenceFile — kept for tests and callers expecting throw-only API */
export async function validateEvidenceFile(file: File): Promise<void> {
  await prepareEvidenceFile(file);
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

function friendlyStorageError(message: string): string {
  if (/row-level security|permission denied|not authorized/i.test(message)) {
    return "Upload blocked — sign out and sign back in. If it still fails, ask an admin to confirm your QA account is active.";
  }
  if (/bucket not found|Bucket not found/i.test(message)) {
    return "File storage is not configured on the server. Ask an admin to run the Supabase storage setup.";
  }
  return message;
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
  const prepared = await prepareEvidenceFile(file);
  const path = `${folder(userId, testId)}/${Date.now()}-${prepared.safeName}`;
  const { error } = await supabase.storage.from(TEST_EVIDENCE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: prepared.contentType,
  });
  if (error) throw new Error(friendlyStorageError(error.message));
  return {
    name: prepared.safeName,
    path,
    size: file.size,
    updated_at: new Date().toISOString(),
  };
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
