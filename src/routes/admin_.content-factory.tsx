import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  generateWeeklyContentBatchAdmin,
  listContentFactoryBatchesAdmin,
  listContentFactoryDraftsAdmin,
  publishContentFactoryDraftAdmin,
  sendContentFactoryNewsletterTestAdmin,
  updateContentFactoryDraftAdmin,
  updateContentFactoryDraftStatusAdmin,
} from "@/lib/content-factory.functions";
import {
  CONTENT_ASSET_TYPES,
  CONTENT_DRAFT_STATUSES,
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  weeklyBatchAssetTotal,
  type ContentAssetType,
  type ContentDraft,
  type ContentDraftStatus,
} from "@/lib/content-factory/types";
import {
  ContentStatusBadge,
  ContentTypeBadge,
  formatContentTimestamp,
} from "@/components/content-factory/content-factory-ui";
import { ContentFactoryDraftDialog } from "@/components/content-factory/ContentFactoryDraftDialog";
import { ContentDispatchLogPanel } from "@/components/content-factory/ContentDispatchLogPanel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Edit2,
  Eye,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin_/content-factory")({
  validateSearch: (search: Record<string, unknown>) => ({
    batchId: typeof search.batchId === "string" ? search.batchId : undefined,
    type:
      typeof search.type === "string" &&
      [
        "article",
        "facebook_post",
        "newsletter",
        "faq",
        "lead_magnet",
        "image_prompt",
      ].includes(search.type)
        ? (search.type as ContentAssetType)
        : undefined,
    slot:
      typeof search.slot === "number"
        ? search.slot
        : typeof search.slot === "string" && search.slot !== ""
          ? Number(search.slot)
          : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI Content Factory — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ContentFactoryPage,
});

function ContentFactoryPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    batchId: searchBatchId,
    type: searchType,
    slot: searchSlot,
  } = Route.useSearch();

  const listBatches = useServerFn(listContentFactoryBatchesAdmin);
  const listDrafts = useServerFn(listContentFactoryDraftsAdmin);
  const generateBatch = useServerFn(generateWeeklyContentBatchAdmin);
  const updateDraft = useServerFn(updateContentFactoryDraftAdmin);
  const updateStatus = useServerFn(updateContentFactoryDraftStatusAdmin);
  const publishDraft = useServerFn(publishContentFactoryDraftAdmin);
  const sendNewsletterTest = useServerFn(sendContentFactoryNewsletterTestAdmin);

  const [topic, setTopic] = useState("Medicare education weekly themes");
  const [typeFilter, setTypeFilter] = useState<ContentAssetType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentDraftStatus | "all">("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [dialogDraft, setDialogDraft] = useState<ContentDraft | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [newsletterTestDraft, setNewsletterTestDraft] = useState<ContentDraft | null>(null);
  const [newsletterTestEmail, setNewsletterTestEmail] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth", search: { tab: "sign-in" } });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (searchBatchId) setBatchFilter(searchBatchId);
    if (searchType) setTypeFilter(searchType);
  }, [searchBatchId, searchType]);

  const batchesQuery = useQuery({
    queryKey: ["content-factory-batches"],
    queryFn: () => listBatches({ data: { limit: 20 } }),
    enabled: Boolean(user && userHasAdminRole(user)),
  });

  const draftsQuery = useQuery({
    queryKey: ["content-factory-drafts", typeFilter, statusFilter, batchFilter],
    queryFn: () =>
      listDrafts({
        data: {
          type: typeFilter,
          status: statusFilter,
          batchId: batchFilter === "all" ? undefined : batchFilter,
        },
      }),
    enabled: Boolean(user && userHasAdminRole(user)),
  });

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["content-factory-batches"] });
    void queryClient.invalidateQueries({ queryKey: ["content-factory-drafts"] });
  };

  const generateMutation = useMutation({
    mutationFn: () => generateBatch({ data: { topic: topic.trim() || undefined } }),
    onSuccess: (result) => {
      invalidateAll();
      setBatchFilter(result.batch.id);
      toast.success(`Created batch with ${result.drafts.length} drafts in the queue.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: (input: { draftId: string; title: string; excerpt: string; body: string }) =>
      updateDraft({ data: input }),
    onSuccess: () => {
      invalidateAll();
      setDialogDraft(null);
      toast.success("Draft saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: (input: {
      draftId: string;
      status: ContentDraftStatus;
      rejectionReason?: string;
    }) => updateStatus({ data: input }),
    onSuccess: (draft) => {
      invalidateAll();
      toast.success(`Status updated to ${CONTENT_STATUS_LABELS[draft.status]}.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishMutation = useMutation({
    mutationFn: (draftId: string) => publishDraft({ data: { draftId } }),
    onSuccess: (draft) => {
      invalidateAll();
      toast.success(`Published ${CONTENT_TYPE_LABELS[draft.type].toLowerCase()}.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const newsletterTestMutation = useMutation({
    mutationFn: (input: { draftId: string; recipient: string }) =>
      sendNewsletterTest({ data: input }),
    onSuccess: () => {
      invalidateAll();
      setNewsletterTestDraft(null);
      setNewsletterTestEmail("");
      toast.success("Newsletter test queued. Check dispatch log for delivery status.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const drafts = draftsQuery.data ?? [];
  const batches = batchesQuery.data ?? [];

  const activeBatch = useMemo(
    () => batches.find((batch) => batch.id === batchFilter) ?? null,
    [batches, batchFilter],
  );

  useEffect(() => {
    if (searchSlot == null || Number.isNaN(searchSlot)) return;
    if (draftsQuery.isLoading) return;
    const match = drafts.find(
      (draft) =>
        draft.slotIndex === searchSlot && (searchType ? draft.type === searchType : true),
    );
    if (match) {
      setDialogDraft(match);
      setDialogMode("view");
    }
  }, [searchSlot, searchType, drafts, draftsQuery.isLoading]);

  if (authLoading || !user) return null;

  const openDraft = (draft: ContentDraft, mode: "view" | "edit") => {
    setDialogDraft(draft);
    setDialogMode(mode);
  };

  return (
    <AdminAccessGate>
      <AppShell
        title="AI Content Factory"
        subtitle="Generate weekly Medicare education assets, review them, and publish through the draft queue."
      >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
            <span className="truncate">
              Weekly batch workflow · {weeklyBatchAssetTotal()} assets per run
            </span>
          </div>
          <Link to="/admin" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        <Card className="glass p-5 space-y-4 border-primary/20">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold">Generate Weekly Content</h2>
            <p className="text-xs text-muted-foreground">
              Creates one batch with 3 articles, 7 Facebook posts, 1 newsletter, 1 lead magnet, 1
              FAQ collection, and 5 image prompts — all seeded from curated Medicare education
              content.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Batch topic theme"
              className="sm:flex-1"
            />
            <Button
              className="grad-indigo shrink-0"
              disabled={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Weekly Content
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
          <div className="space-y-4">
            <Card className="glass p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as ContentAssetType | "all")}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {CONTENT_ASSET_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {CONTENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ContentDraftStatus | "all")}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {CONTENT_DRAFT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {CONTENT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {batchFilter !== "all" ? (
                  <Button size="sm" variant="ghost" onClick={() => setBatchFilter("all")}>
                    Clear batch filter
                  </Button>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">Draft Queue ({drafts.length})</h2>
                {draftsQuery.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              </div>

              {drafts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No drafts match these filters. Generate a weekly batch to populate the queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {drafts.map((draft) => (
                    <Card key={draft.id} className="p-4 space-y-3 border-border/80">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <ContentTypeBadge type={draft.type} />
                            <ContentStatusBadge status={draft.status} />
                          </div>
                          <h3 className="text-sm font-semibold leading-snug">{draft.title}</h3>
                          <p className="text-xs text-muted-foreground">{draft.excerpt}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Updated {formatContentTimestamp(draft.updatedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => openDraft(draft, "view")}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          disabled={draft.status === "published"}
                          onClick={() => openDraft(draft, "edit")}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        {draft.status === "draft" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs"
                            onClick={() =>
                              statusMutation.mutate({
                                draftId: draft.id,
                                status: "pending_review",
                              })
                            }
                          >
                            Send to review
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-emerald-400"
                          disabled={draft.status === "approved" || draft.status === "published"}
                          onClick={() =>
                            statusMutation.mutate({ draftId: draft.id, status: "approved" })
                          }
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        {draft.type === "newsletter" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs"
                            onClick={() => setNewsletterTestDraft(draft)}
                          >
                            <Send className="h-3.5 w-3.5 mr-1" /> Send Test
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          disabled={draft.status === "scheduled" || draft.status === "published"}
                          onClick={() =>
                            statusMutation.mutate({ draftId: draft.id, status: "scheduled" })
                          }
                        >
                          <CalendarClock className="h-3.5 w-3.5 mr-1" /> Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-rose-400"
                          disabled={draft.status === "published" || draft.status === "rejected"}
                          onClick={() =>
                            statusMutation.mutate({
                              draftId: draft.id,
                              status: "rejected",
                              rejectionReason: "Rejected during editorial review",
                            })
                          }
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs grad-indigo ml-auto"
                          disabled={
                            draft.status === "published" ||
                            (draft.status !== "approved" && draft.status !== "scheduled") ||
                            publishMutation.isPending
                          }
                          onClick={() => publishMutation.mutate(draft.id)}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          {draft.status === "published" ? "Published" : "Publish"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="glass p-4 space-y-3 h-fit">
            <h2 className="font-display text-base font-bold">Batch History</h2>
            {batchesQuery.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : batches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No batches yet.</p>
            ) : (
              <div className="space-y-2">
                {batches.map((batch) => (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => setBatchFilter(batch.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                      batchFilter === batch.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{batch.name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {batch.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{batch.topic}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {batch.assetCounts.total} assets · {formatContentTimestamp(batch.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {activeBatch ? (
              <div className="rounded-md border border-border bg-muted/20 p-3 text-xs space-y-1">
                <p className="font-semibold">Filtered batch</p>
                <p>{activeBatch.name}</p>
                <p className="text-muted-foreground">
                  {activeBatch.assetCounts.article} articles · {activeBatch.assetCounts.facebook_post}{" "}
                  posts · {activeBatch.assetCounts.newsletter} newsletter ·{" "}
                  {activeBatch.assetCounts.lead_magnet} lead magnet · {activeBatch.assetCounts.faq} FAQ ·{" "}
                  {activeBatch.assetCounts.image_prompt} image prompts
                </p>
              </div>
            ) : null}
          </Card>
        </div>

        <ContentDispatchLogPanel
          batchId={batchFilter === "all" ? undefined : batchFilter}
          title="Content dispatch log"
          description="Tracks newsletter tests, scheduled social posts, and published assets for the filtered batch."
        />
      </div>

      <Dialog open={Boolean(newsletterTestDraft)} onOpenChange={(open) => !open && setNewsletterTestDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send newsletter test</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Sends the current draft body through Resend as <strong>[TEST]</strong> mail.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Recipient address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={newsletterTestEmail}
                onChange={(event) => setNewsletterTestEmail(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewsletterTestDraft(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="grad-indigo"
              disabled={newsletterTestMutation.isPending || !newsletterTestDraft}
              onClick={() => {
                if (!newsletterTestDraft || !newsletterTestEmail.trim()) {
                  toast.error("Enter a recipient email address.");
                  return;
                }
                newsletterTestMutation.mutate({
                  draftId: newsletterTestDraft.id,
                  recipient: newsletterTestEmail.trim(),
                });
              }}
            >
              {newsletterTestMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1" />
              )}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContentFactoryDraftDialog
        draft={dialogDraft}
        mode={dialogMode}
        open={Boolean(dialogDraft)}
        onOpenChange={(open) => {
          if (!open) setDialogDraft(null);
        }}
        busy={saveMutation.isPending}
        onSave={(values) => {
          if (!dialogDraft) return;
          saveMutation.mutate({ draftId: dialogDraft.id, ...values });
        }}
      />
    </AppShell>
    </AdminAccessGate>
  );
}
