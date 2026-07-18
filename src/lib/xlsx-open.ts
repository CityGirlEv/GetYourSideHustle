import { downloadBlobFile } from "@/lib/article-authoring";

const XLSX_LOADING_HTML =
  '<main style="font-family:system-ui,sans-serif;padding:2rem;color:#111827">' +
  "<h1 style=\"font-size:1.125rem;margin:0 0 .5rem\">Preparing Excel…</h1>" +
  "<p style=\"margin:0;color:#4b5563;font-size:.875rem\">This may take a few seconds.</p>" +
  "</main>";

/**
 * Reserve a preview tab during the user click (before async Excel work).
 * Do not pass `noopener` — modern browsers return null and block a later window.open.
 */
export function prepareXlsxPreviewTab(): Window | null {
  if (typeof window === "undefined") return null;
  const tab = window.open("about:blank", "_blank");
  if (!tab) return null;
  try {
    tab.document.title = "Preparing Excel…";
    tab.document.body.innerHTML = XLSX_LOADING_HTML;
  } catch {
    /* ignore — tab may still accept navigation */
  }
  return tab;
}

export type OpenXlsxBlobOptions = {
  /** When popups are blocked, download instead of failing silently. */
  fallbackFilename?: string;
};

/** Navigate a tab opened via {@link prepareXlsxPreviewTab} to an XLSX blob URL. */
export function openXlsxBlobInTab(
  tab: Window | null,
  blob: Blob,
  options?: OpenXlsxBlobOptions,
): void {
  const blobUrl = URL.createObjectURL(blob);
  const scheduleRevoke = () => window.setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);

  if (tab && !tab.closed) {
    try {
      tab.location.href = blobUrl;
      tab.focus?.();
      scheduleRevoke();
      return;
    } catch {
      try {
        tab.close();
      } catch {
        /* ignore */
      }
    }
  }

  if (typeof window !== "undefined") {
    const popup = window.open(blobUrl, "_blank");
    if (popup) {
      scheduleRevoke();
      return;
    }
  }

  if (options?.fallbackFilename) {
    downloadBlobFile(options.fallbackFilename, blob);
    scheduleRevoke();
    return;
  }

  URL.revokeObjectURL(blobUrl);
  throw new Error("Excel preview could not open — popup blocked.");
}
