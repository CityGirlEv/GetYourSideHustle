import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";
import {
  leadMagnetSlugFromDraft,
  workbookSocialTeaserHrefIfSaved,
} from "@/lib/content-factory/lead-magnet-paths";
import {
  buildWorkbookSocialTeaserBlob,
  buildWorkbookSocialTeaserObjectUrl,
} from "@/lib/workbook-social-teaser";
import {
  leadMagnetSourceFromDraft,
  loadLeadMagnetPdfLogo,
  type LeadMagnetPdfAssets,
  type LeadMagnetPdfSource,
} from "@/lib/lead-magnet-pdf";

export function WorkbookSocialTeaserPreview({
  leadDraft,
  liveSource,
  compact = false,
}: {
  leadDraft?: CalendarDraftRef;
  liveSource?: LeadMagnetPdfSource;
  compact?: boolean;
}) {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const source = liveSource ?? (leadDraft ? leadMagnetSourceFromDraft(leadDraft) : null);
  const pdfAssets: LeadMagnetPdfAssets = useMemo(() => ({ logoDataUrl }), [logoDataUrl]);
  const savedHref = workbookSocialTeaserHrefIfSaved(leadDraft);
  const slug = leadDraft ? leadMagnetSlugFromDraft(leadDraft) : null;

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
    if (!source) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    void buildWorkbookSocialTeaserObjectUrl(source, pdfAssets).then((url) => {
      if (cancelled) return;
      objectUrl = url;
      setPreviewBlobUrl(url);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source, sourceFingerprint, previewKey, pdfAssets]);

  const displayUrl = previewBlobUrl ?? savedHref;
  const textSize = compact ? "text-[10px]" : "text-xs";

  const downloadTeaser = async () => {
    if (!source || !slug) return;
    const blob = await buildWorkbookSocialTeaserBlob(source, pdfAssets);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-facebook-teaser.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!source) return null;

  return (
    <div
      className={`rounded-md border border-sky-500/30 bg-sky-500/5 space-y-2 ${
        compact ? "p-2" : "p-3"
      }`}
    >
      <div className="flex items-center gap-2">
        <ImageIcon className={`text-sky-700 dark:text-sky-300 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        <span className={`font-semibold ${textSize}`}>Facebook post image (checklist teaser JPG)</span>
      </div>
      <p className={`text-muted-foreground ${textSize}`}>
        Upload this JPG as the <strong className="text-foreground">photo</strong> on Facebook — it shows a
        preview of the printable checklist inside the PDF. The PDF download link stays in the post text
        (not as the image).
      </p>
      {displayUrl ? (
        <img
          src={displayUrl}
          alt="Medicare at 65 Planning Workbook checklist teaser for Facebook"
          className="w-full max-w-lg rounded-md border border-border/60 shadow-sm"
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={`h-7 ${textSize}`}
          onClick={() => setPreviewKey((k) => k + 1)}
        >
          Refresh teaser
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className={`h-7 ${textSize}`}
          onClick={() => void downloadTeaser()}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Download JPG
        </Button>
        {savedHref ? (
          <a
            href={savedHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${textSize}`}
          >
            Open saved teaser
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className={`text-muted-foreground ${textSize}`}>
            Save the workbook in the calendar to enable “Open saved teaser”.
          </span>
        )}
      </div>
    </div>
  );
}
