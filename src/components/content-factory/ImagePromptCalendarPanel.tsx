import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImagePromptHeroAdmin } from "@/lib/content-factory.functions";
import {
  isHeroImageMime,
  prepareHeroImageForUpload,
} from "@/lib/hero-image-upload";
import {
  contentFactoryDraftHref,
  heroUploadedAtFromPayload,
  heroUploadPathFromPayload,
  imagePromptTextFromDraft,
  resolveHeroSlugForImagePrompt,
  type CalendarDraftRef,
} from "@/lib/content-factory/editorial-calendar-links";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";

const HERO_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function formatKb(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}

export function ImagePromptCalendarPanel({
  event,
  draft,
  draftBySlot,
  batchId,
  compact = false,
  onHeroUploaded,
}: {
  event: EditorialCalendarEvent;
  draft?: CalendarDraftRef;
  draftBySlot: Map<string, CalendarDraftRef>;
  batchId: string | null;
  compact?: boolean;
  onHeroUploaded?: () => void;
}) {
  const uploadHero = useServerFn(uploadImagePromptHeroAdmin);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const promptText = imagePromptTextFromDraft(draft);
  const slug = resolveHeroSlugForImagePrompt(draft, draftBySlot, event.slotIndex);
  const heroPath = heroUploadPathFromPayload(draft?.payload);
  const uploadedAt = heroUploadedAtFromPayload(draft?.payload);
  const factoryHref = contentFactoryDraftHref(batchId, "image_prompt", event.slotIndex);

  const heroPublicUrl = useMemo(() => {
    if (!heroPath || !uploadedAt) return null;
    return `${heroPath}?v=${encodeURIComponent(uploadedAt)}`;
  }, [heroPath, uploadedAt]);

  const copyPrompt = async () => {
    if (!promptText) {
      toast.error("No prompt text on this draft yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("Image prompt copied");
    } catch {
      toast.error("Could not copy prompt");
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file || !draft?.id) return;
    if (!slug) {
      toast.error("No article slug linked to this image prompt yet");
      return;
    }
    if (!isHeroImageMime(file)) {
      toast.error("Use JPG, PNG, or WEBP");
      return;
    }

    setUploading(true);
    try {
      const prepared = await prepareHeroImageForUpload(file);
      const result = await uploadHero({
        data: {
          draftId: draft.id,
          slug,
          imageBase64: prepared.base64,
          mimeType: prepared.mimeType,
        },
      });
      setPreviewUrl(URL.createObjectURL(file));
      const compressedNote =
        prepared.outputSize < prepared.originalSize
          ? ` (compressed ${formatKb(prepared.originalSize)} → ${formatKb(prepared.outputSize)})`
          : "";
      toast.success(`Hero saved to ${result.diskPath}${compressedNote}`);
      onHeroUploaded?.();
    } catch (err) {
      toast.error((err as Error).message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const textSize = compact ? "text-[10px]" : "text-xs";
  const displayUrl = previewUrl ?? heroPublicUrl;

  return (
    <div
      className={`rounded-md border border-amber-500/30 bg-amber-500/5 space-y-2 ${
        compact ? "p-2 mt-1" : "p-2.5 mt-1.5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={factoryHref}
          className={`inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${textSize}`}
        >
          Open image prompt
        </a>
        {promptText && (
          <button
            type="button"
            onClick={() => void copyPrompt()}
            className={`inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${textSize}`}
          >
            <Copy className="h-3 w-3" />
            Copy prompt
          </button>
        )}
      </div>

      <p className={`${textSize} text-muted-foreground italic`}>
        CMS visual rules: no Medicare card, government logos, plan/carrier names, readable text,
        premiums, or enrollment cues in the image.
      </p>

      {promptText ? (
        <details className={textSize}>
          <summary className="cursor-pointer font-medium text-foreground select-none">
            Prompt text
          </summary>
          <p className="mt-1.5 whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
            {promptText}
          </p>
        </details>
      ) : (
        <p className={`${textSize} text-muted-foreground`}>
          Generate the prompt in Content Factory first, then copy it into your image tool.
        </p>
      )}

      <div className={`${textSize} text-muted-foreground space-y-1`}>
        {slug ? (
          <p>
            Save as{" "}
            <code className="text-[10px] bg-background/80 px-1 py-0.5 rounded">
              public/learning-center/{slug}.jpg
            </code>
          </p>
        ) : (
          <p>Link an article slug before uploading the hero image.</p>
        )}
        {uploadedAt && (
          <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Uploaded {new Date(uploadedAt).toLocaleString()}
          </p>
        )}
      </div>

      {displayUrl && (
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={displayUrl}
            alt=""
            className={`rounded-md border border-border/60 object-cover ${
              compact ? "max-h-24 w-full" : "max-h-32 w-full"
            }`}
          />
        </a>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={HERO_ACCEPT}
          className="hidden"
          onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className={`h-7 ${compact ? "text-[10px]" : "text-xs"}`}
          disabled={uploading || !draft?.id || !slug}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5 mr-1" />
          )}
          Upload hero image
        </Button>
        <span className={`${textSize} text-muted-foreground`}>
          Large AI PNGs are auto-resized to ~1600px and saved as JPG.
        </span>
      </div>
    </div>
  );
}
