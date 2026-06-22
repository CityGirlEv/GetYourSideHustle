import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Download, ExternalLink, FileText, Loader2, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveLeadMagnetPdfAdmin } from "@/lib/content-factory.functions";
import {
  contentFactoryDraftHref,
  type CalendarDraftRef,
} from "@/lib/content-factory/editorial-calendar-links";
import {
  leadMagnetPdfHrefIfSaved,
  leadMagnetPdfSavedAtFromPayload,
  leadMagnetSlugFromDraft,
} from "@/lib/content-factory/lead-magnet-paths";
import {
  buildLeadMagnetWorkbookPdf,
  downloadLeadMagnetPdf,
  leadMagnetPdfBlob,
  leadMagnetPdfToBase64,
  leadMagnetSourceFromDraft,
  loadLeadMagnetPdfLogo,
  type LeadMagnetPdfAssets,
  type LeadMagnetPdfSource,
} from "@/lib/lead-magnet-pdf";

export function LeadMagnetPdfPanel({
  draft,
  batchId,
  compact = false,
  liveSource,
  onSaved,
}: {
  draft?: CalendarDraftRef;
  batchId?: string | null;
  compact?: boolean;
  /** When editing in Content Factory, pass unsaved title/excerpt/body for live preview. */
  liveSource?: LeadMagnetPdfSource;
  onSaved?: () => void;
}) {
  const savePdf = useServerFn(saveLeadMagnetPdfAdmin);
  const [saving, setSaving] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoReady, setLogoReady] = useState(false);

  const pdfAssets: LeadMagnetPdfAssets = useMemo(
    () => ({ logoDataUrl }),
    [logoDataUrl],
  );

  const source = liveSource ?? (draft ? leadMagnetSourceFromDraft(draft) : null);
  const slug = draft ? leadMagnetSlugFromDraft(draft) : null;
  const savedAt = leadMagnetPdfSavedAtFromPayload(draft?.payload);
  const savedHref = leadMagnetPdfHrefIfSaved(draft);
  const factoryHref =
    draft && batchId !== undefined
      ? contentFactoryDraftHref(batchId ?? null, "lead_magnet", draft.slotIndex)
      : null;

  const sourceFingerprint = useMemo(
    () => (source ? `${source.title}\0${source.excerpt}\0${source.body}` : ""),
    [source],
  );

  useEffect(() => {
    let cancelled = false;
    void loadLeadMagnetPdfLogo().then((url) => {
      if (!cancelled) {
        setLogoDataUrl(url);
        setLogoReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!source || !logoReady) return;
    const doc = buildLeadMagnetWorkbookPdf(source, pdfAssets);
    const url = URL.createObjectURL(leadMagnetPdfBlob(doc));
    setPreviewBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [source, sourceFingerprint, previewKey, logoReady, pdfAssets]);

  const displayPreviewUrl = previewBlobUrl ?? savedHref;

  const regeneratePreview = () => {
    setPreviewKey((k) => k + 1);
    toast.success("PDF preview refreshed from current text");
  };

  const handleDownload = () => {
    if (!source || !slug) return;
    void downloadLeadMagnetPdf(source, `${slug}.pdf`, pdfAssets).then(() => {
      toast.success("PDF downloaded");
    });
  };

  const handleSave = async () => {
    if (!source || !draft?.id || !slug) return;
    setSaving(true);
    try {
      const doc = buildLeadMagnetWorkbookPdf(source, pdfAssets);
      const result = await savePdf({
        data: {
          draftId: draft.id,
          slug,
          pdfBase64: leadMagnetPdfToBase64(doc),
        },
      });
      toast.success(`Workbook saved to ${result.diskPath}`);
      onSaved?.();
    } catch (err) {
      toast.error((err as Error).message ?? "Could not save PDF");
    } finally {
      setSaving(false);
    }
  };

  if (!draft || !source) {
    return (
      <p className="text-xs text-muted-foreground">
        Open a lead magnet draft in Content Factory to generate the workbook PDF.
      </p>
    );
  }

  const textSize = compact ? "text-[10px]" : "text-xs";

  return (
    <div
      className={`rounded-md border border-pink-500/30 bg-pink-500/5 space-y-2 ${
        compact ? "p-2 mt-1" : "p-2.5 mt-1.5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {factoryHref ? (
          <a
            href={factoryHref}
            className={`inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${textSize}`}
          >
            <FileText className="h-3 w-3" />
            Edit workbook text
          </a>
        ) : null}
        <span className={`${textSize} text-muted-foreground`}>
          Edit markdown, refresh preview, then save the PDF.
        </span>
      </div>

      <p className={`${textSize} text-muted-foreground`}>
        Target file:{" "}
        <code className="text-[10px] bg-background/80 px-1 py-0.5 rounded">
          public/downloads/{slug}.pdf
        </code>
      </p>

      {savedAt ? (
        <p className={`flex items-center gap-1 text-emerald-700 dark:text-emerald-400 ${textSize}`}>
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Saved {new Date(savedAt).toLocaleString()}
        </p>
      ) : null}

      {displayPreviewUrl ? (
        <div className="space-y-1">
          <iframe
            title="Workbook PDF preview"
            src={displayPreviewUrl}
            className={`w-full rounded-md border border-border/60 bg-white ${
              compact ? "h-48" : "h-64"
            }`}
          />
          {savedHref ? (
            <a
              href={savedHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${textSize}`}
            >
              Open saved PDF
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={`h-7 ${compact ? "text-[10px]" : "text-xs"}`}
          onClick={regeneratePreview}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Refresh preview
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className={`h-7 ${compact ? "text-[10px]" : "text-xs"}`}
          onClick={handleDownload}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Download PDF
        </Button>
        <Button
          type="button"
          size="sm"
          className={`h-7 grad-indigo ${compact ? "text-[10px]" : "text-xs"}`}
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1" />
          )}
          Save to public/
        </Button>
      </div>
    </div>
  );
}
