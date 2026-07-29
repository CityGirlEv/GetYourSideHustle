/** Shared view / download helpers for task, plan, and test attachments. */

export type AttachmentOpenMode = "view" | "download";

/** Images, PDFs, and plain text can open in a browser tab; Office files download. */
export function canViewAttachmentInline(
  mimeType: string | null | undefined,
  fileName: string | null | undefined,
): boolean {
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)) return true;
  if (mime === "application/pdf" || name.endsWith(".pdf")) return true;
  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    /\.(txt|csv|md|json|log)$/i.test(name)
  ) {
    return true;
  }
  return false;
}

/**
 * Open a blob in a new tab (view) or force a download.
 * Prefer an `<a>` click — `window.open(blob:…, "noopener")` often yields a blank tab.
 */
export function openAttachmentBlob(
  blob: Blob,
  opts: {
    name: string;
    mimeType?: string;
    mode?: AttachmentOpenMode;
  },
): void {
  if (blob.size < 1) {
    throw new Error("Attachment decoded empty — re-upload the file.");
  }
  const fileName = opts.name?.trim() || "attachment";
  const mime = opts.mimeType || blob.type || "application/octet-stream";
  const mode =
    opts.mode ??
    (canViewAttachmentInline(mime, fileName) ? "view" : "download");

  const url = URL.createObjectURL(
    blob.type ? blob : new Blob([blob], { type: mime }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  if (mode === "view") {
    a.target = "_blank";
  } else {
    a.download = fileName;
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

/** Use IndexedDB cache only when the blob size looks complete. */
export function localAttachmentLooksComplete(
  local: { blob: Blob; size?: number } | null | undefined,
  expectedSize?: number | null,
): boolean {
  if (!local?.blob || local.blob.size < 1) return false;
  if (typeof expectedSize === "number" && expectedSize > 0) {
    // Allow small encoding rounding; reject clearly truncated cache entries.
    if (local.blob.size < Math.floor(expectedSize * 0.9)) return false;
  }
  return true;
}
