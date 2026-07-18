import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";
import { leadMagnetPdfHrefIfSaved } from "@/lib/content-factory/lead-magnet-paths";
import { PdfEmbedPreview } from "@/components/content-factory/PdfEmbedPreview";
import {
  buildLeadMagnetWorkbookPdf,
  LEAD_MAGNET_PDF_LAYOUT_VERSION,
  leadMagnetPdfPreviewBlobUrl,
  leadMagnetSourceFromDraft,
  loadLeadMagnetPdfLogo,
  type LeadMagnetPdfSource,
} from "@/lib/lead-magnet-pdf";

export function WorkbookPdfPreview({
  leadDraft,
  liveSource,
  compact = false,
  refreshKey = 0,
  className = "",
}: {
  leadDraft?: CalendarDraftRef;
  liveSource?: LeadMagnetPdfSource;
  compact?: boolean;
  refreshKey?: number;
  className?: string;
}) {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const source = liveSource ?? (leadDraft ? leadMagnetSourceFromDraft(leadDraft) : null);
  const savedHref = leadMagnetPdfHrefIfSaved(leadDraft);

  const sourceFingerprint = useMemo(
    () => (source ? `${source.title}\0${source.excerpt}\0${source.body}` : ""),
    [source],
  );

  useEffect(() => {
    let cancelled = false;
    void loadLeadMagnetPdfLogo().then((url) => {
      if (!cancelled) setLogoDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!source) {
      setPreviewUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const doc = buildLeadMagnetWorkbookPdf(source, { logoDataUrl });
      const cacheKey = `${LEAD_MAGNET_PDF_LAYOUT_VERSION}\0${sourceFingerprint}\0${refreshKey}\0${logoDataUrl ?? ""}`;
      const blobUrl = leadMagnetPdfPreviewBlobUrl(doc, cacheKey);
      setPreviewUrl(blobUrl);
    } catch (err) {
      setPreviewUrl(null);
      setError((err as Error).message ?? "Could not build PDF preview");
    } finally {
      setLoading(false);
    }
  }, [sourceFingerprint, refreshKey, logoDataUrl]);

  if (!source) {
    return (
      <p className={`text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}>
        Open a lead magnet draft to preview the workbook PDF.
      </p>
    );
  }

  if (loading || !previewUrl) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div
          className={`flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/20 text-muted-foreground ${
            compact ? "h-52 text-[10px]" : "h-72 text-xs"
          }`}
        >
          {error ? (
            <p className="px-4 text-center text-rose-600 dark:text-rose-400">{error}</p>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Building live PDF preview…
            </>
          )}
        </div>
        {savedHref ? (
          <p className={`text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}>
            The saved copy in public/downloads/ may be older — this preview always reflects current
            workbook text and layout.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <PdfEmbedPreview url={previewUrl} title="Workbook PDF preview" compact={compact} />
      <p className={`text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}>
        Live preview from current workbook text. Use <strong>Save to public/</strong> when this
        matches what you want on the site.
      </p>
    </div>
  );
}
