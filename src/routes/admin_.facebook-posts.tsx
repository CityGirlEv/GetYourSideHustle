import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  listContentFactoryBatchesAdmin,
  listContentFactoryDraftsAdmin,
} from "@/lib/content-factory.functions";
import {
  formatEarliestLaunchLabel,
  formatLaunchWeekLabel,
  isPreLaunchWeek,
  editorialWeekStart,
} from "@/lib/content-factory/weekly-editorial-schedule";
import {
  extractHashtags,
  facebookPageUrl,
  formatFacebookPasteText,
  formatFacebookPostPreviewText,
} from "@/lib/content-factory/facebook-post-copy";
import {
  facebookPostHeading,
  facebookPostRoleLabel,
  isWorkbookLaunchPostGroup,
} from "@/lib/content-factory/facebook-post-display";
import { WORKBOOK_PAGE_FB_SLOT, WORKBOOK_PERSONAL_FB_SLOT } from "@/lib/content-factory/workbook-facebook-posts";
import { WorkbookPdfPreview } from "@/components/content-factory/WorkbookPdfPreview";
import { WorkbookFacebookPostsPanel } from "@/components/content-factory/WorkbookFacebookPostsPanel";
import {
  facebookPostImageGuidance,
  getDraftFromMap,
  imagePromptTextFromDraft,
  type CalendarDraftRef,
} from "@/lib/content-factory/editorial-calendar-links";
import {
  buildFacebookPostScheduleBySlot,
  facebookPostImagePromptSlot,
  type FacebookPostSchedule,
} from "@/lib/content-factory/facebook-post-calendar";
import {
  ContentStatusBadge,
  formatContentTimestamp,
} from "@/components/content-factory/content-factory-ui";
import type { ContentDraft } from "@/lib/content-factory/types";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Facebook,
  Image as ImageIcon,
} from "lucide-react";

export const Route = createFileRoute("/admin_/facebook-posts")({
  validateSearch: (search: Record<string, unknown>): {
    batchId?: string;
    slot?: number;
    workbook?: boolean;
  } => ({
    batchId: typeof search.batchId === "string" ? search.batchId : undefined,
    slot:
      typeof search.slot === "number"
        ? search.slot
        : typeof search.slot === "string" && search.slot !== ""
          ? Number(search.slot)
          : undefined,
    workbook:
      search.workbook === true || search.workbook === "true" || search.workbook === "1"
        ? true
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Facebook Posts — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FacebookPostsPage,
});

function FacebookPostsPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const { batchId: searchBatchId, slot: highlightSlot, workbook: focusWorkbook } = Route.useSearch();
  const workbookGroupRef = useRef<HTMLDivElement>(null);
  const listBatches = useServerFn(listContentFactoryBatchesAdmin);
  const listDrafts = useServerFn(listContentFactoryDraftsAdmin);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth", search: { tab: "sign-in" } });
    }
  }, [user, authLoading, router]);

  const batchesQuery = useQuery({
    queryKey: ["content-factory-batches", "facebook-posts"],
    queryFn: () => listBatches({ data: { limit: 12 } }),
    enabled: Boolean(user && userHasAdminRole(user)),
  });

  const batches = batchesQuery.data ?? [];
  const activeBatchId = searchBatchId ?? batches[0]?.id ?? null;

  const draftsQuery = useQuery({
    queryKey: ["content-factory-drafts", "facebook-posts", activeBatchId],
    queryFn: () => listDrafts({ data: { batchId: activeBatchId ?? undefined } }),
    enabled: Boolean(user && userHasAdminRole(user) && activeBatchId),
  });

  const draftBySlot = useMemo(() => {
    const map = new Map<string, CalendarDraftRef>();
    for (const draft of (draftsQuery.data as any) ?? []) {
      map.set(`${draft.type}:${draft.slotIndex}`, draft);
    }
    return map;
  }, [draftsQuery.data]);

  const fbDrafts = useMemo(
    () =>
      [...((draftsQuery.data as any) ?? [])]
        .filter((draft) => draft.type === "facebook_post")
        .sort((a, b) => a.slotIndex - b.slotIndex),
    [draftsQuery.data],
  );

  const shouldScrollToWorkbook =
    focusWorkbook ||
    highlightSlot === WORKBOOK_PAGE_FB_SLOT ||
    highlightSlot === WORKBOOK_PERSONAL_FB_SLOT;

  useEffect(() => {
    if (!shouldScrollToWorkbook || draftsQuery.isLoading || fbDrafts.length === 0) return;
    const timer = window.setTimeout(() => {
      workbookGroupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [shouldScrollToWorkbook, draftsQuery.isLoading, fbDrafts.length, activeBatchId]);

  const titleOverrides = useMemo(() => {
    const titles: Record<string, string> = {};
    for (const [key, draft] of draftBySlot) {
      titles[key] = draft.title;
    }
    return titles;
  }, [draftBySlot]);

  const weekStart = editorialWeekStart(new Date());
  const preLaunch = isPreLaunchWeek(weekStart);
  const scheduleBySlot = useMemo(
    () => buildFacebookPostScheduleBySlot({ titles: titleOverrides }),
    [titleOverrides],
  );

  const pageUrl = facebookPageUrl();

  const leadDraft = useMemo(
    () => getDraftFromMap(draftBySlot, "lead_magnet", 0),
    [draftBySlot],
  );

  if (authLoading || !user) return null;

  return (
    <AdminAccessGate>
      <AppShell
      title="Facebook Posts"
      subtitle="Copy-ready post text, image prompts, hashtags, and scheduled post times — one step per post."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/calendar">
              <Button size="sm" variant="outline">
                <CalendarClock className="h-4 w-4 mr-1.5" />
                Content Calendar
              </Button>
            </Link>
            <Link to="/admin/content-factory">
              <Button size="sm" variant="outline">
                Content Factory
              </Button>
            </Link>
          </div>
          {pageUrl ? (
            <Button size="sm" variant="outline" asChild>
              <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4 mr-1.5" />
                Open Facebook Page
                <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </a>
            </Button>
          ) : (
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Set <code className="text-xs">PUBLIC_FACEBOOK_PAGE_URL</code> in env for a one-click
              link to your page.
            </p>
          )}
        </div>

        <Card className="glass p-4 border-primary/15 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="fb-batch" className="text-xs font-semibold text-muted-foreground">
              Batch
            </label>
            <select
              id="fb-batch"
              className="h-9 rounded-md border border-input bg-background px-3 text-xs min-w-[14rem]"
              value={activeBatchId ?? ""}
              onChange={(e) =>
                router.navigate({
                  to: "/admin/facebook-posts",
                  search: { batchId: e.target.value, slot: highlightSlot },
                })
              }
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
            {preLaunch && (
              <Badge variant="outline" className="text-[10px] border-amber-500/40">
                Posting starts Fri Jun 19
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {preLaunch ? (
              <>
                <strong className="text-foreground">Pre-launch.</strong> Legal pages and first post
                go live Friday, June 19 ({formatEarliestLaunchLabel()}). Scheduled post times below
                are for Week 1 ({formatLaunchWeekLabel()}).
              </>
            ) : (
              <>
                Posts are numbered <strong className="text-foreground">Facebook Post 1–{fbDrafts.length || 7}</strong>{" "}
                below — the same numbers used on the Content Calendar and in Content Factory (slot + 1).
                Copy the post body into Facebook Business Suite or your page composer. Hashtags are split
                out so you can paste them at the end. Posts 1–3 use the linked article hero image.{" "}
                <strong className="text-foreground">Posts 4 + 8</strong> are the workbook pair (Page post,
                then personal profile share).
              </>
            )}
          </p>
          {fbDrafts.length > 0 ? (
            <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside border-t border-border/40 pt-3">
              {fbDrafts.some((d) => isWorkbookLaunchPostGroup(d.slotIndex)) ? (
                <li>
                  <a
                    href="#fb-post-workbook-group"
                    className="text-primary font-medium hover:text-primary/80 underline-offset-2 hover:underline"
                  >
                    Workbook launch (Posts 4 + 8)
                  </a>
                  {" — page post + personal share"}
                  {scheduleBySlot.get(WORKBOOK_PAGE_FB_SLOT) && scheduleBySlot.get(WORKBOOK_PERSONAL_FB_SLOT) ? (
                    <>
                      {" · "}
                      <span className="text-foreground/80">
                        Post {WORKBOOK_PAGE_FB_SLOT + 1}:{" "}
                        {scheduleBySlot.get(WORKBOOK_PAGE_FB_SLOT)!.postDateLabel} ·{" "}
                        {scheduleBySlot.get(WORKBOOK_PAGE_FB_SLOT)!.postTime}
                        {" · "}
                        Post {WORKBOOK_PERSONAL_FB_SLOT + 1}:{" "}
                        {scheduleBySlot.get(WORKBOOK_PERSONAL_FB_SLOT)!.postDateLabel} ·{" "}
                        {scheduleBySlot.get(WORKBOOK_PERSONAL_FB_SLOT)!.postTime}
                      </span>
                    </>
                  ) : null}
                </li>
              ) : null}
              {fbDrafts
                .filter(
                  (draft) =>
                    !isWorkbookLaunchPostGroup(draft.slotIndex) &&
                    draft.slotIndex !== WORKBOOK_PERSONAL_FB_SLOT,
                )
                .map((draft) => (
                  <li key={draft.id}>
                    <a
                      href={`#fb-post-${draft.slotIndex}`}
                      className="text-primary font-medium hover:text-primary/80 underline-offset-2 hover:underline"
                    >
                      {facebookPostHeading(draft.slotIndex, fbDrafts.length)}
                    </a>
                    {" — "}
                    {facebookPostRoleLabel(draft.slotIndex)}
                    {scheduleBySlot.get(draft.slotIndex) ? (
                      <>
                        {" · "}
                        <span className="text-foreground/80">
                          {scheduleBySlot.get(draft.slotIndex)!.postDateLabel} ·{" "}
                          {scheduleBySlot.get(draft.slotIndex)!.postTime}
                        </span>
                      </>
                    ) : null}
                  </li>
                ))}
            </ol>
          ) : null}
        </Card>

        {draftsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading posts…</p>
        ) : fbDrafts.length === 0 ? (
          <Card className="glass p-6 border-border/40 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              No Facebook post drafts in this batch yet.
            </p>
            <Link to="/admin/content-factory">
              <Button size="sm" className="grad-indigo">
                Open Content Factory
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {fbDrafts.some((d) => isWorkbookLaunchPostGroup(d.slotIndex)) ? (
              <Card
                ref={workbookGroupRef}
                id="fb-post-workbook-group"
                className={`glass p-5 border-indigo-500/30 space-y-4 scroll-mt-24 ${
                  shouldScrollToWorkbook ? "ring-2 ring-indigo-500/40" : ""
                }`}
              >
                <div className="space-y-1">
                  <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-xs">
                    Workbook launch — 2 posts
                  </Badge>
                  <h2 className="font-display text-base font-bold">
                    Medicare at 65 Planning Workbook
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Two separate posts (same teaser JPG on each): Step 1 — publish Post 4 on your Facebook Page.
                    Step 2 — publish Post 8 on your personal profile and tag friends. Both live on the calendar at
                    the 10:00 AM workbook task.
                  </p>
                </div>
                <WorkbookFacebookPostsPanel
                  draftBySlot={draftBySlot}
                  batchId={activeBatchId}
                  postTotal={fbDrafts.length}
                  showAdminLink={false}
                  scheduleBySlot={scheduleBySlot}
                  onPostsSynced={() => {
                    void draftsQuery.refetch();
                  }}
                />
                {leadDraft ? (
                  <div className="space-y-2 rounded-md border border-pink-500/30 bg-pink-500/5 p-3">
                    <label className="text-xs font-semibold text-foreground">Workbook PDF preview</label>
                    <WorkbookPdfPreview leadDraft={leadDraft} />
                  </div>
                ) : null}
              </Card>
            ) : null}
            {fbDrafts
              .filter(
                (draft) =>
                  !isWorkbookLaunchPostGroup(draft.slotIndex) &&
                  draft.slotIndex !== WORKBOOK_PERSONAL_FB_SLOT,
              )
              .map((draft) => (
              <FacebookPostCard
                key={draft.id}
                draft={draft}
                postTotal={fbDrafts.length}
                schedule={scheduleBySlot.get(draft.slotIndex)}
                highlighted={highlightSlot === draft.slotIndex}
                pageUrl={pageUrl}
                draftBySlot={draftBySlot}
              />
            ))}
          </div>
        )}

        <Link to="/admin">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Admin dashboard
          </Button>
        </Link>
      </div>
    </AppShell>
    </AdminAccessGate>
  );
}

function FacebookPostCard({
  draft,
  postTotal,
  schedule,
  highlighted,
  pageUrl,
  draftBySlot,
}: {
  draft: ContentDraft;
  postTotal: number;
  schedule?: FacebookPostSchedule;
  highlighted?: boolean;
  pageUrl: string | null;
  draftBySlot: Map<string, CalendarDraftRef>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hashtags = extractHashtags(draft.body);
  const previewText = formatFacebookPostPreviewText(draft);
  const fullPaste = formatFacebookPasteText(draft);
  const imageGuidance = facebookPostImageGuidance(draft.slotIndex, draftBySlot);
  const imagePromptSlot = facebookPostImagePromptSlot(draft.slotIndex);
  const imagePromptDraft =
    imagePromptSlot !== null
      ? getDraftFromMap(draftBySlot, "image_prompt", imagePromptSlot)
      : undefined;
  const imagePromptText = imagePromptTextFromDraft(imagePromptDraft);

  useEffect(() => {
    if (!highlighted || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlighted]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard.`);
    } catch {
      toast.error("Could not copy — select the text manually.");
    }
  };

  return (
    <Card
      ref={cardRef}
      id={`fb-post-${draft.slotIndex}`}
      className={`glass p-5 border-border/40 space-y-4 scroll-mt-24 ${
        highlighted ? "ring-2 ring-sky-500/50 border-sky-500/30" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="text-xs font-bold tabular-nums bg-sky-600 hover:bg-sky-600 text-white">
              {facebookPostHeading(draft.slotIndex, postTotal)}
            </Badge>
            <ContentStatusBadge status={draft.status} />
          </div>
          {schedule ? (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-950 dark:text-sky-50">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-semibold">Post on:</span> {schedule.postDateLabel} ·{" "}
                {schedule.postTime}
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">No calendar date for this slot yet.</p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Content Factory slot {draft.slotIndex} · {facebookPostRoleLabel(draft.slotIndex)}
          </p>
          <h2 className="font-display text-base font-bold">{draft.title}</h2>
          {draft.excerpt ? (
            <p className="text-xs text-muted-foreground">{draft.excerpt}</p>
          ) : null}
        </div>
      </div>

      {imagePromptText ? (
        <div className="space-y-2 rounded-md border border-amber-400/40 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-950/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <ImageIcon className="h-4 w-4 text-amber-800 dark:text-amber-200 shrink-0" />
              <label className="text-xs font-semibold text-amber-950 dark:text-amber-50">
                Image prompt
              </label>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => void copy(imagePromptText, "Image prompt")}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy prompt
            </Button>
          </div>
          <pre className="text-xs whitespace-pre-wrap text-amber-950/90 dark:text-amber-100/90 leading-relaxed max-h-56 overflow-y-auto rounded border border-amber-500/20 bg-background/40 p-2">
            {imagePromptText}
          </pre>
        </div>
      ) : imagePromptSlot !== null ? (
        <p className="text-[11px] text-muted-foreground rounded-md border border-dashed border-amber-500/30 px-3 py-2">
          No image prompt yet — generate slot {imagePromptSlot} in Content Factory first.
        </p>
      ) : null}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Post text</label>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => copy(fullPaste, "Full post")}
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy full post
          </Button>
        </div>
        <pre className="text-xs whitespace-pre-wrap rounded-md border border-border bg-muted/20 p-3 leading-relaxed">
          {previewText || draft.body}
        </pre>
      </div>

      {hashtags.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-muted-foreground">Hashtags</label>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => copy(hashtags.join(" "), "Hashtags")}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy hashtags
            </Button>
          </div>
          <p className="text-xs rounded-md border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-foreground/90">
            {hashtags.join(" ")}
          </p>
        </div>
      )}

      <div className="space-y-2 rounded-md border border-amber-400/40 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-950/30">
        <div className="flex flex-wrap items-center gap-2">
          <ImageIcon className="h-4 w-4 text-amber-800 dark:text-amber-200 shrink-0" />
          <label className="text-xs font-semibold text-amber-950 dark:text-amber-50">
            Which image to post
          </label>
        </div>
        <p className="text-xs text-amber-950/90 dark:text-amber-100/90 leading-relaxed">{imageGuidance.headline}</p>
        <p className="text-[11px] text-amber-950 dark:text-amber-100">
          <span className="font-semibold">File:</span> {imageGuidance.imageLabel}
        </p>
        <ol className="text-[11px] text-amber-900/90 dark:text-amber-100/90 space-y-1 list-decimal list-inside">
          {imageGuidance.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {imageGuidance.imageUrl ? (
          <div className="space-y-2 pt-1">
            {imageGuidance.source === "workbook-teaser" ? (
              <img
                src={imageGuidance.imageUrl}
                alt="Workbook checklist teaser for Facebook"
                className="max-w-md rounded-md border border-border/60 shadow-sm"
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                <a href={imageGuidance.imageUrl} target="_blank" rel="noopener noreferrer">
                  Open image URL
                  <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                </a>
              </Button>
            </div>
          </div>
        ) : imageGuidance.source === "workbook-teaser" ? (
          <p className="text-[11px] text-amber-900/90 dark:text-amber-100/90">
            Save the workbook PDF in the calendar (10:00 AM task) to write the teaser JPG to{" "}
            <code className="text-[10px]">public/downloads/</code> — then this link will work.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {pageUrl ? (
          <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
            <a href={pageUrl} target="_blank" rel="noopener noreferrer">
              <Facebook className="h-3.5 w-3.5 mr-1" />
              Post on Facebook
              <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
            </a>
          </Button>
        ) : null}
        <Button
          size="sm"
          className="h-8 text-xs grad-indigo"
          onClick={() => copy(fullPaste, "Post")}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Copy &amp; paste ready
        </Button>
      </div>

      {draft.publishedRef ? (
        <p className="text-[10px] text-muted-foreground">
          Published ref:{" "}
          <a
            href={draft.publishedRef}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            {draft.publishedRef}
          </a>
          {draft.publishedAt ? ` · ${formatContentTimestamp(draft.publishedAt)}` : ""}
        </p>
      ) : null}
    </Card>
  );
}
