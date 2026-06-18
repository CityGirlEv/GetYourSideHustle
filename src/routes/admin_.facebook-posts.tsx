import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
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
  buildEditorialCalendar,
  editorialActionTime,
  formatEditorialTimeLabel,
  isCatchUpWeek,
  startOfWeekMonday,
} from "@/lib/content-factory/weekly-editorial-schedule";
import {
  extractHashtags,
  facebookPageUrl,
  facebookPostBodyWithoutHashtags,
  formatFacebookPasteText,
} from "@/lib/content-factory/facebook-post-copy";
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
} from "lucide-react";

export const Route = createFileRoute("/admin_/facebook-posts")({
  validateSearch: (search: Record<string, unknown>) => ({
    batchId: typeof search.batchId === "string" ? search.batchId : undefined,
    slot:
      typeof search.slot === "number"
        ? search.slot
        : typeof search.slot === "string" && search.slot !== ""
          ? Number(search.slot)
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
  const { batchId: searchBatchId, slot: highlightSlot } = Route.useSearch();
  const listBatches = useServerFn(listContentFactoryBatchesAdmin);
  const listDrafts = useServerFn(listContentFactoryDraftsAdmin);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }
    if (!userHasAdminRole(user)) {
      router.navigate({ to: "/" });
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
    queryFn: () =>
      listDrafts({ data: { batchId: activeBatchId ?? undefined, type: "facebook_post" } }),
    enabled: Boolean(user && userHasAdminRole(user) && activeBatchId),
  });

  const fbDrafts = useMemo(
    () => [...(draftsQuery.data ?? [])].sort((a, b) => a.slotIndex - b.slotIndex),
    [draftsQuery.data],
  );

  const weekStart = startOfWeekMonday(new Date());
  const scheduleBySlot = useMemo(() => {
    const events = buildEditorialCalendar({ weekStart });
    const map = new Map<
      number,
      { produceDate: string; launchDate: string; produceTime: string; launchTime: string }
    >();
    for (const draft of fbDrafts) {
      const produce = events.find(
        (e) =>
          e.type === "facebook_post" &&
          e.slotIndex === draft.slotIndex &&
          e.milestone === "produce",
      );
      const launch = events.find(
        (e) =>
          e.type === "facebook_post" &&
          e.slotIndex === draft.slotIndex &&
          e.milestone === "launch",
      );
      if (produce && launch) {
        map.set(draft.slotIndex, {
          produceDate: produce.date,
          launchDate: launch.date,
          produceTime: formatEditorialTimeLabel(
            editorialActionTime("facebook_post", "produce"),
          ),
          launchTime: formatEditorialTimeLabel(
            editorialActionTime("facebook_post", "launch"),
          ),
        });
      }
    }
    return map;
  }, [fbDrafts, weekStart]);

  const pageUrl = facebookPageUrl();
  const catchUp = isCatchUpWeek(weekStart);

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  return (
    <AppShell
      title="Facebook Posts"
      subtitle="Copy-ready post text, hashtags, and scheduled times from your Content Factory batch."
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
            {catchUp && (
              <Badge variant="outline" className="text-[10px]">
                Catch-up week schedule
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Copy the post body below into Facebook Business Suite or your page composer. Hashtags
            are split out so you can paste them at the end. Launch times match the Content Calendar
            daily checklist.
          </p>
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
            {fbDrafts.map((draft) => (
              <FacebookPostCard
                key={draft.id}
                draft={draft}
                schedule={scheduleBySlot.get(draft.slotIndex)}
                highlighted={highlightSlot === draft.slotIndex}
                pageUrl={pageUrl}
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
  );
}

function FacebookPostCard({
  draft,
  schedule,
  highlighted,
  pageUrl,
}: {
  draft: ContentDraft;
  schedule?: {
    produceDate: string;
    launchDate: string;
    produceTime: string;
    launchTime: string;
  };
  highlighted?: boolean;
  pageUrl: string | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hashtags = extractHashtags(draft.body);
  const bodyWithoutTags = facebookPostBodyWithoutHashtags(draft.body);
  const fullPaste = formatFacebookPasteText(draft);

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
            <Badge variant="secondary" className="text-[10px]">
              Post {draft.slotIndex + 1}
            </Badge>
            <ContentStatusBadge status={draft.status} />
          </div>
          <h2 className="font-display text-base font-bold">{draft.title}</h2>
          {draft.excerpt ? (
            <p className="text-xs text-muted-foreground">{draft.excerpt}</p>
          ) : null}
        </div>
        {schedule && (
          <div className="text-[11px] text-muted-foreground text-right shrink-0 space-y-0.5">
            <div>
              <span className="text-foreground/80 font-semibold">Write:</span>{" "}
              {schedule.produceDate} · {schedule.produceTime}
            </div>
            <div>
              <span className="text-foreground/80 font-semibold">Post:</span>{" "}
              {schedule.launchDate} · {schedule.launchTime}
            </div>
          </div>
        )}
      </div>

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
          {bodyWithoutTags || draft.body}
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
            className="text-sky-300 hover:underline"
          >
            {draft.publishedRef}
          </a>
          {draft.publishedAt ? ` · ${formatContentTimestamp(draft.publishedAt)}` : ""}
        </p>
      ) : null}
    </Card>
  );
}
