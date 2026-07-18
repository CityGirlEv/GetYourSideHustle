import { Link } from "@tanstack/react-router";
import { Image as ImageIcon } from "lucide-react";
import { ImagePromptCalendarPanel } from "@/components/content-factory/ImagePromptCalendarPanel";
import {
  facebookPostImageGuidance,
  getDraftFromMap,
  type CalendarDraftRef,
} from "@/lib/content-factory/editorial-calendar-links";
import { facebookPostImagePromptSlot } from "@/lib/content-factory/facebook-post-calendar";
import { facebookPostAdminSearch } from "@/lib/content-factory/facebook-post-copy";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";

export function FacebookPostCalendarPanel({
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
  const guidance = facebookPostImageGuidance(event.slotIndex, draftBySlot);
  const imagePromptSlot = facebookPostImagePromptSlot(event.slotIndex);
  const imagePromptDraft =
    imagePromptSlot !== null
      ? getDraftFromMap(draftBySlot, "image_prompt", imagePromptSlot)
      : undefined;
  const imagePromptEvent: EditorialCalendarEvent =
    imagePromptSlot !== null
      ? { ...event, type: "image_prompt", slotIndex: imagePromptSlot }
      : event;

  return (
    <div className={`space-y-2 ${compact ? "mt-1" : "mt-2"}`}>
      <div className="rounded-md border border-sky-500/25 bg-sky-500/5 px-2 py-2 space-y-2">
        <p className={`font-semibold text-sky-900 dark:text-sky-100 ${compact ? "text-[10px]" : "text-xs"}`}>
          Post in one step — image, copy, publish
        </p>
        <Link
          to="/admin/facebook-posts"
          search={facebookPostAdminSearch(batchId, event.slotIndex)}
          className={`inline-flex font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Open post text &amp; copy buttons →
        </Link>
        <div className={`space-y-1 ${compact ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
          <p className="flex items-start gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-200" />
            <span>{guidance.headline}</span>
          </p>
          <p>
            <span className="font-semibold text-foreground/80">Image file:</span> {guidance.imageLabel}
          </p>
        </div>
      </div>

      {imagePromptDraft ? (
        <ImagePromptCalendarPanel
          event={imagePromptEvent}
          draft={imagePromptDraft}
          draftBySlot={draftBySlot}
          batchId={batchId}
          compact={compact}
          onHeroUploaded={onHeroUploaded}
        />
      ) : null}
    </div>
  );
}
