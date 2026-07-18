import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { FacebookPostSchedule } from "@/lib/content-factory/facebook-post-calendar";
import { CalendarClock, Copy, Facebook, Loader2, RefreshCw, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";
import { WorkbookSocialTeaserPreview } from "@/components/content-factory/WorkbookSocialTeaserPreview";
import { getDraftFromMap } from "@/lib/content-factory/editorial-calendar-links";
import { syncWorkbookFacebookPostsAdmin } from "@/lib/content-factory.functions";
import {
  formatFacebookPasteText,
  formatFacebookPostPreviewText,
  facebookWorkbookPostsAdminSearch,
} from "@/lib/content-factory/facebook-post-copy";
import { facebookPostHeading } from "@/lib/content-factory/facebook-post-display";
import { draftHasWorkbookFacebookCopy } from "@/lib/content-factory/workbook-facebook-post-templates";
import {
  WORKBOOK_FB_POST_LABELS,
  WORKBOOK_PAGE_FB_SLOT,
  WORKBOOK_PERSONAL_FB_SLOT,
  workbookFacebookDrafts,
} from "@/lib/content-factory/workbook-facebook-posts";

function WorkbookPostBlock({
  label,
  draft,
  icon: Icon,
  compact,
  postTotal,
  whereToPost,
  schedule,
}: {
  label: string;
  draft?: CalendarDraftRef;
  icon: typeof Facebook;
  compact?: boolean;
  postTotal: number;
  whereToPost: string;
  schedule?: FacebookPostSchedule;
}) {
  if (!draft) {
    return (
      <div
        className={`rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-2 py-2 ${compact ? "text-[10px]" : "text-xs"}`}
      >
        <p className="font-semibold text-amber-950 dark:text-amber-100">{label}</p>
        <p className="text-muted-foreground mt-1">
          Post draft missing for this batch — click <strong>Load workbook posts</strong> below.
        </p>
      </div>
    );
  }

  if (!draftHasWorkbookFacebookCopy(draft)) {
    return (
      <div
        className={`rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-2 py-2 space-y-1 ${compact ? "text-[10px]" : "text-xs"}`}
      >
        <p className="font-semibold text-amber-950 dark:text-amber-100">{label}</p>
        <p className="text-muted-foreground">
          This slot still has old copy ({draft.title}) — not the workbook post. Click{" "}
          <strong>Load workbook posts</strong> below.
        </p>
      </div>
    );
  }

  const preview = formatFacebookPostPreviewText(draft);
  const paste = formatFacebookPasteText(draft);
  const textSize = compact ? "text-[10px]" : "text-xs";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(paste);
      toast.success("Post copied");
    } catch {
      toast.error("Could not copy — select the text manually.");
    }
  };

  return (
    <div className={`rounded-md border border-sky-500/25 bg-sky-500/5 space-y-2 ${compact ? "p-2" : "p-3"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Icon className={`shrink-0 text-sky-700 dark:text-sky-300 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        <span className={`font-semibold ${textSize}`}>{label}</span>
        <Badge variant="outline" className="text-[10px] tabular-nums">
          {facebookPostHeading(draft.slotIndex, postTotal)}
        </Badge>
      </div>
      <p className={`text-muted-foreground ${textSize}`}>
        <strong className="text-foreground">Where:</strong> {whereToPost}
      </p>
      {schedule ? (
        <p
          className={`inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-950 dark:text-sky-50 ${textSize}`}
        >
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Post on:</strong> {schedule.postDateLabel} · {schedule.postTime}
          </span>
        </p>
      ) : null}
      <p className={`font-medium ${compact ? "text-[11px]" : "text-sm"}`}>{draft.title}</p>
      <pre
        className={`whitespace-pre-wrap rounded border border-border/60 bg-background/60 p-2 leading-relaxed max-h-48 overflow-y-auto ${textSize}`}
      >
        {preview}
      </pre>
      <Button type="button" size="sm" variant="outline" className={`h-7 ${textSize}`} onClick={() => void copy()}>
        <Copy className="h-3.5 w-3.5 mr-1" />
        Copy post
      </Button>
    </div>
  );
}

export function WorkbookFacebookPostsPanel({
  draftBySlot,
  batchId,
  compact = false,
  postTotal = 8,
  showAdminLink = true,
  scheduleBySlot,
  onPostsSynced,
}: {
  draftBySlot: Map<string, CalendarDraftRef>;
  batchId: string | null;
  compact?: boolean;
  postTotal?: number;
  showAdminLink?: boolean;
  scheduleBySlot?: Map<number, FacebookPostSchedule>;
  onPostsSynced?: () => void;
}) {
  const syncPosts = useServerFn(syncWorkbookFacebookPostsAdmin);
  const [syncing, setSyncing] = useState(false);
  const { page, personal } = workbookFacebookDrafts(draftBySlot);
  const leadDraft = getDraftFromMap(draftBySlot, "lead_magnet", 0);
  const textSize = compact ? "text-[10px]" : "text-xs";
  const needsSync =
    !draftHasWorkbookFacebookCopy(page) || !draftHasWorkbookFacebookCopy(personal);

  const handleSync = async () => {
    if (!batchId) {
      toast.error("Select a content batch first.");
      return;
    }
    setSyncing(true);
    try {
      const result = await syncPosts({ data: { batchId } });
      const parts: string[] = [];
      if (result.updatedSlots.length) parts.push(`updated slots ${result.updatedSlots.map((s) => s + 1).join(", ")}`);
      if (result.insertedSlots.length) parts.push(`added slot ${result.insertedSlots.map((s) => s + 1).join(", ")}`);
      toast.success(`Workbook posts loaded — ${parts.join("; ") || "done"}`);
      onPostsSynced?.();
    } catch (err) {
      toast.error((err as Error).message ?? "Could not load workbook posts");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className={`rounded-md border border-indigo-500/30 bg-indigo-500/5 space-y-3 ${
        compact ? "p-2 mt-1" : "p-3 mt-2"
      }`}
    >
      <div className="space-y-1">
        <p className={`font-semibold text-indigo-950 dark:text-indigo-100 ${textSize}`}>
          Workbook launch — 2 separate Facebook posts
        </p>
        <p className={`text-muted-foreground leading-relaxed ${textSize}`}>
          This is <strong className="text-foreground">not</strong> one post with two images. You publish{" "}
          <strong className="text-foreground">two different posts</strong> with{" "}
          <strong className="text-foreground">the same checklist teaser JPG</strong> attached to each:
        </p>
        <ol className={`list-decimal list-inside space-y-0.5 text-muted-foreground ${textSize}`}>
          <li>
            <strong className="text-foreground">Post {WORKBOOK_PAGE_FB_SLOT + 1}</strong> — new post on your{" "}
            <strong className="text-foreground">Facebook Page</strong> (10:30 AM) promoting the free PDF + Still
            Working article
          </li>
          <li>
            <strong className="text-foreground">Post {WORKBOOK_PERSONAL_FB_SLOT + 1}</strong> — separate post on your{" "}
            <strong className="text-foreground">personal profile</strong>; tag friends turning 65
          </li>
        </ol>
      </div>

      {needsSync ? (
        <div
          className={`rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 space-y-2 ${textSize}`}
        >
          <p className="text-amber-950 dark:text-amber-100">
            Workbook post copy is missing or outdated in this batch (common if the batch was created before Post 8 was
            added).
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className={`h-7 ${textSize}`}
            disabled={syncing || !batchId}
            onClick={() => void handleSync()}
          >
            {syncing ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
            )}
            Load workbook posts (4 + 8)
          </Button>
        </div>
      ) : null}

      <WorkbookPostBlock
        label={WORKBOOK_FB_POST_LABELS[WORKBOOK_PAGE_FB_SLOT]!}
        draft={page}
        icon={Facebook}
        compact={compact}
        postTotal={postTotal}
        whereToPost="Part B Optimizer Benchmark Tool Facebook Page — compose a new Page post"
        schedule={scheduleBySlot?.get(WORKBOOK_PAGE_FB_SLOT)}
      />
      <WorkbookPostBlock
        label={WORKBOOK_FB_POST_LABELS[WORKBOOK_PERSONAL_FB_SLOT]!}
        draft={personal}
        icon={UserRound}
        compact={compact}
        postTotal={postTotal}
        whereToPost="Your personal Facebook profile — new post or share (not a Page post)"
        schedule={scheduleBySlot?.get(WORKBOOK_PERSONAL_FB_SLOT)}
      />
      <WorkbookSocialTeaserPreview leadDraft={leadDraft} compact={compact} />
      <div className="flex flex-wrap gap-2">
        {!needsSync && batchId ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={`h-7 ${textSize}`}
            disabled={syncing}
            onClick={() => void handleSync()}
          >
            {syncing ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
            )}
            Refresh post copy
          </Button>
        ) : null}
        {showAdminLink ? (
          <Link
            to="/admin/facebook-posts"
            search={facebookWorkbookPostsAdminSearch(batchId)}
            className={`inline-flex items-center font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${textSize}`}
          >
            Open both posts on Facebook Posts admin →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
