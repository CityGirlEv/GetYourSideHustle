import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarRange, Mic2, Rocket, Sparkles, Wand2 } from "lucide-react";
import { BusyOverlay } from "../WaitFeedback";
import { ShowHideChevron, ShowHideToggle } from "../ShowHideToggle";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  draftsMarkedPublishedForDoneItems,
  fetchContentState,
  persistContentState,
  seedSoftLaunchDrafts,
  type ContentBatch,
  type ContentDraft,
  type ContentDraftStatus,
} from "../../lib/gysh-content-factory";
import {
  CONTENT_FACTORY_HOWTO,
  MARKETING_PLAN_DEFINITIONS,
  ROLLOUT_CHANNEL_LABELS,
  ROLLOUT_CHANNELS,
  ROLLOUT_OWNERS,
  SOFT_LAUNCH_PROJECTIONS,
  filterSoftLaunchByDueDay,
  filterSoftLaunchByOwner,
  groupSoftLaunchByDay,
  rolloutOwnerCounts,
  softLaunchDueDates,
  softLaunchFactoryDefaultSprints,
  softLaunchItemById,
  softLaunchItemCompletion,
  softLaunchItemRef,
  softLaunchProjectionForItem,
  softLaunchRolloutItems,
  SOFT_LAUNCH_FACTORY_SPRINTS,
  SOFT_LAUNCH_ITEM_STATUSES,
  SOFT_LAUNCH_ITEM_STATUS_LABELS,
  contentFactoryItemStatusClass,
  type SoftLaunchDueSort,
  type SoftLaunchItem,
  type SoftLaunchItemCompletion,
  type SoftLaunchItemStatus,
  type RolloutChannel,
  type RolloutOwner,
} from "../../lib/gysh-soft-launch-rollout";
import { currentSprintIndex, getSprintWindow } from "../../lib/gysh-sprints";
import { fetchTasks, isoToMmddyy, TASK_STATUS_LABELS, type TaskStatus } from "../../lib/gysh-tasks";
import {
  DEFAULT_TEST_STATUS,
  STATUS_LABELS as TEST_STATUS_LABELS,
  TEST_CASES,
  fetchTestStatuses,
  type TestStatus,
} from "../../lib/gysh-test-plan";
import { ApiError } from "../../lib/api";
import {
  adminStudioPath,
  marketingLaunchPlanUrl,
  navigateAdminDeepLink,
  readAdminDeepLink,
  type AdminDeepLinkOpts,
} from "../../lib/admin-deep-links";
import { scrollAdminFocusIntoView } from "../../lib/admin-focus-scroll";
import {
  buildAdminEntityTitleMap,
  buildAdminLinkCandidates,
} from "../../lib/admin-link-candidates";
import {
  activateSoftLaunchOverrides,
  fetchSoftLaunchOverrides,
  resetSoftLaunchItemOverride,
  saveSoftLaunchItemOverride,
  type SoftLaunchItemPatch,
  type SoftLaunchOverrideEntry,
} from "../../lib/soft-launch-item-overrides";
import { useAdminEntityLinks } from "../../hooks/useAdminEntityLinks";
import { WorkshopsAdmin } from "./WorkshopsAdmin";
import { MarkdownLinkText } from "./MarkdownLinkText";
import { AdminCrossLinks, crossLinksForSoftLaunchItem } from "./AdminCrossLinks";
import { SoftLaunchItemEditor } from "./SoftLaunchItemEditor";
import { SoftLaunchItemAttachments } from "./SoftLaunchItemAttachments";
import {
  fetchSoftLaunchAttachments,
  groupSoftLaunchAttachmentsByItem,
  type SoftLaunchItemAttachment,
} from "../../lib/soft-launch-attachments";

type StatusTone = "done" | "fail" | "active" | "neutral";

function taskStatusLabel(status: string): string {
  return TASK_STATUS_LABELS[status as TaskStatus] ?? status.replace(/_/g, " ");
}

function testStatusLabel(status: string): string {
  return TEST_STATUS_LABELS[status as TestStatus] ?? status.replace(/_/g, " ");
}

function taskStatusTone(status: string): StatusTone {
  if (status === "done") return "done";
  if (status === "blocked") return "fail";
  if (status === "in_progress") return "active";
  return "neutral";
}

function testStatusTone(status: string): StatusTone {
  if (status === "pass" || status === "conditional_approval") return "done";
  if (status === "fail" || status === "blocked" || status === "failed_retest") return "fail";
  if (
    status === "in_progress" ||
    status === "fixed_retest" ||
    status === "fixed_cursor" ||
    status === "fixed_lighthouse" ||
    status === "fixed_foresight" ||
    status === "rolled_over"
  ) {
    return "active";
  }
  return "neutral";
}

const STATUS_TONE_STYLE: Record<
  StatusTone,
  { background: string; color: string; border: string; mark: string }
> = {
  done: {
    background: "rgba(22,163,74,0.15)",
    color: "#15803d",
    border: "rgba(22,163,74,0.45)",
    mark: "✓",
  },
  fail: {
    background: "rgba(155,47,40,0.12)",
    color: "#9B2F28",
    border: "rgba(155,47,40,0.45)",
    mark: "!",
  },
  active: {
    background: "rgba(148,125,100,0.18)",
    color: "var(--bronze, #947D64)",
    border: "rgba(148,125,100,0.5)",
    mark: "●",
  },
  neutral: {
    background: "rgba(156,163,175,0.2)",
    color: "var(--text-primary)",
    border: "var(--border-color)",
    mark: "○",
  },
};

function statusBadge(
  tone: StatusTone,
  label: string,
  testId?: string,
  link?: AdminDeepLinkOpts,
): ReactNode {
  const s = STATUS_TONE_STYLE[tone];
  const style = {
    display: "inline-flex" as const,
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: "0.8rem",
    fontWeight: 700,
    background: s.background,
    color: s.color,
    border: `1px solid ${s.border}`,
    textDecoration: "none" as const,
    cursor: link ? ("pointer" as const) : undefined,
  };
  if (link) {
    const href = adminStudioPath(link);
    return (
      <a
        href={href}
        data-testid={testId}
        className="admin-cross-link"
        title="Open linked item"
        style={style}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigateAdminDeepLink(link);
        }}
      >
        {s.mark} {label}
      </a>
    );
  }
  return (
    <span data-testid={testId} style={style}>
      {s.mark} {label}
    </span>
  );
}

function toggleInSet<T>(prev: Set<T>, value: T): Set<T> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function FilterChip({
  active,
  onToggle,
  children,
  title,
  testId,
}: {
  active: boolean;
  onToggle: () => void;
  children: ReactNode;
  title?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      className="qa-tester-bubble qa-filter-chip"
      data-active={active ? "true" : "false"}
      data-testid={testId}
      title={title}
      onClick={onToggle}
    >
      <input
        type="checkbox"
        className="qa-filter-chip__check"
        checked={active}
        readOnly
        tabIndex={-1}
        aria-hidden
      />
      {children}
    </button>
  );
}

const NEXT_STATUS: Partial<Record<ContentDraftStatus, ContentDraftStatus>> = {
  draft: "pending_review",
  pending_review: "approved",
  approved: "scheduled",
  scheduled: "published",
};

type FactoryTab = "soft_launch" | "workshops";

function factoryTabFromDeepLink(): FactoryTab {
  const panel = readAdminDeepLink().panel;
  if (panel === "workshops") return "workshops";
  return "soft_launch";
}

export function ContentFactory({
  focusItemId = null,
  onFocusConsumed,
}: {
  focusItemId?: string | null;
  onFocusConsumed?: () => void;
} = {}) {
  const [tab, setTab] = useState<FactoryTab>(factoryTabFromDeepLink);
  /** Empty set = all sprints (same multi-select pattern as Task List / Testing Portal). */
  const [sprintFilters, setSprintFilters] = useState<Set<number>>(
    () => new Set(softLaunchFactoryDefaultSprints()),
  );
  const [channelFilter, setChannelFilter] = useState<RolloutChannel | "all">("all");
  /** Empty set = all assignees (multi-select like Sprint). */
  const [assigneeFilters, setAssigneeFilters] = useState<Set<RolloutOwner>>(() => new Set());
  const [dueFilter, setDueFilter] = useState<string | "all">("all");
  const [dueSort, setDueSort] = useState<SoftLaunchDueSort>("asc");
  /** Sprint + Channels expanded on land; Assignee + Due date collapsed (Assignee defaults to All). */
  const [sprintOpen, setSprintOpen] = useState(true);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(true);
  /** Empty set = all statuses. */
  const [statusFilters, setStatusFilters] = useState<Set<SoftLaunchItemStatus>>(
    () => new Set(),
  );
  const [batches, setBatches] = useState<ContentBatch[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seedMsg, setSeedMsg] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSeeded, setShowSeeded] = useState(false);
  const [howtoOpen, setHowtoOpen] = useState(false);
  const [definitionsOpen, setDefinitionsOpen] = useState(false);
  const liveSprintIndex = currentSprintIndex();
  const [taskStatusById, setTaskStatusById] = useState<Record<string, string>>({});
  const [testStatusById, setTestStatusById] = useState<Record<string, string>>({});
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);
  /** Expanded calendar items — collapsed by default; deep-link focus opens the target. */
  const [openItemIds, setOpenItemIds] = useState<Set<string>>(() => new Set());
  const [itemOverrides, setItemOverrides] = useState<
    Record<string, SoftLaunchOverrideEntry>
  >({});
  const [linkTasks, setLinkTasks] = useState<
    { id: string; title?: string; description?: string }[]
  >([]);
  const [itemSaveBusy, setItemSaveBusy] = useState(false);
  const [attachmentsByItem, setAttachmentsByItem] = useState<
    Record<string, SoftLaunchItemAttachment[]>
  >({});
  const {
    edges: entityEdges,
    link: linkEntities,
    unlink: unlinkEntities,
  } = useAdminEntityLinks();

  const rolloutItems = useMemo(() => softLaunchRolloutItems(), [itemOverrides]);

  const entityTitles = buildAdminEntityTitleMap({
    tasks: linkTasks,
    tests: TEST_CASES.map((t) => ({ id: t.id, title: t.title })),
    cfItems: rolloutItems,
  });

  const linkCandidates = useMemo(
    () =>
      buildAdminLinkCandidates({
        tasks: linkTasks,
        tests: TEST_CASES.map((t) => ({ id: t.id, title: t.title })),
        cfItems: rolloutItems,
      }),
    [linkTasks, rolloutItems],
  );

  const toggleItemOpen = (itemId: string) => {
    const wasOpen = openItemIds.has(itemId);
    setOpenItemIds((prev) => {
      const next = new Set(prev);
      if (wasOpen) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    if (wasOpen) setHighlightItemId((hid) => (hid === itemId ? null : hid));
  };

  useEffect(() => {
    if (!focusItemId) return;
    const item = softLaunchItemById(focusItemId);
    if (!item) {
      onFocusConsumed?.();
      return;
    }
    setTab("soft_launch");
    setSprintFilters(new Set([item.sprint]));
    setChannelFilter("all");
    setAssigneeFilters(new Set());
    setStatusFilters(new Set());
    setDueFilter("all");
    setHighlightItemId(item.id);
    setOpenItemIds((prev) => new Set(prev).add(item.id));
    onFocusConsumed?.();
    scrollAdminFocusIntoView(`factory-item-${item.id}`);
  }, [focusItemId, onFocusConsumed]);

  const persist = async (b: ContentBatch[], d: ContentDraft[]) => {
    setError("");
    try {
      const saved = await persistContentState(b, d);
      setBatches(saved.batches);
      setDrafts(saved.drafts);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save content.");
      throw e;
    }
  };

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [data, tasks, testPayload, overrides, attachments] = await Promise.all([
        fetchContentState(),
        fetchTasks().catch(() => [] as Awaited<ReturnType<typeof fetchTasks>>),
        fetchTestStatuses().catch(() => ({ statuses: {} as Record<string, string> })),
        fetchSoftLaunchOverrides().catch(() => ({} as Record<string, SoftLaunchOverrideEntry>)),
        fetchSoftLaunchAttachments().catch(() => [] as SoftLaunchItemAttachment[]),
      ]);
      setItemOverrides(overrides);
      activateSoftLaunchOverrides(overrides);
      setAttachmentsByItem(groupSoftLaunchAttachmentsByItem(attachments));
      setLinkTasks(tasks.map((t) => ({ id: t.id, description: t.description })));
      const taskMap: Record<string, string> = {};
      for (const t of tasks) taskMap[t.id] = t.status;
      const testMap: Record<string, string> = { ...(testPayload.statuses ?? {}) };
      setTaskStatusById(taskMap);
      setTestStatusById(testMap);

      const items = softLaunchRolloutItems();
      const completionByItemId = new Map(
        items.map((item) => [
          item.id,
          softLaunchItemCompletion(item, {
            taskStatusById: taskMap,
            testStatusById: testMap,
          }),
        ]),
      );
      const synced = draftsMarkedPublishedForDoneItems(data.drafts, completionByItemId);
      if (synced.changed) {
        const saved = await persistContentState(data.batches, synced.drafts);
        setBatches(saved.batches);
        setDrafts(saved.drafts);
        setSelectedId((prev) => prev ?? saved.drafts[0]?.id ?? null);
      } else {
        setBatches(data.batches);
        setDrafts(data.drafts);
        setSelectedId((prev) => prev ?? data.drafts[0]?.id ?? null);
      }
    } catch (e) {
      setBatches([]);
      setDrafts([]);
      setError(e instanceof ApiError ? e.message : "Failed to load content from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const completionFor = (item: SoftLaunchItem): SoftLaunchItemCompletion =>
    softLaunchItemCompletion(item, { taskStatusById, testStatusById });

  const applySavedOverride = (itemId: string, saved: SoftLaunchOverrideEntry) => {
    const next = { ...itemOverrides, [itemId]: saved };
    setItemOverrides(next);
    activateSoftLaunchOverrides(next);
  };

  const saveItemPatch = async (
    item: SoftLaunchItem,
    patch: SoftLaunchItemPatch,
    failMessage: string,
  ) => {
    setItemSaveBusy(true);
    setError("");
    try {
      const saved = await saveSoftLaunchItemOverride(item.id, patch);
      applySavedOverride(item.id, saved);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : failMessage);
      throw e;
    } finally {
      setItemSaveBusy(false);
    }
  };

  const setItemStatus = async (item: SoftLaunchItem, status: SoftLaunchItemStatus) => {
    try {
      await saveItemPatch(item, { status }, "Failed to update item status.");
    } catch {
      /* error already surfaced */
    }
  };

  const setItemOwner = async (item: SoftLaunchItem, owner: RolloutOwner) => {
    try {
      await saveItemPatch(item, { owner }, "Failed to update item owner.");
    } catch {
      /* error already surfaced */
    }
  };

  const seededDrafts = useMemo(
    () => drafts.filter((d) => d.title.startsWith("[S") || d.batchId.startsWith("BATCH-SL-")),
    [drafts],
  );

  const selected = seededDrafts.find((d) => d.id === selectedId) ?? seededDrafts[0] ?? null;

  const toggleStatusFilter = (status: SoftLaunchItemStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const sprintScopedItems = useMemo(() => {
    if (sprintFilters.size === 0) return rolloutItems;
    return rolloutItems.filter((i) => sprintFilters.has(i.sprint));
  }, [sprintFilters, rolloutItems]);

  const sprintCounts = useMemo(() => {
    const counts: Record<number, number> = { 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of rolloutItems) {
      counts[item.sprint] = (counts[item.sprint] ?? 0) + 1;
    }
    return counts;
  }, [rolloutItems]);

  const assigneeScopedItems = useMemo(
    () => filterSoftLaunchByOwner(sprintScopedItems, assigneeFilters),
    [sprintScopedItems, assigneeFilters],
  );

  const channelScopedItems = useMemo(() => {
    if (channelFilter === "all") return assigneeScopedItems;
    return assigneeScopedItems.filter((i) => i.channel === channelFilter);
  }, [assigneeScopedItems, channelFilter]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      SOFT_LAUNCH_ITEM_STATUSES.map((st) => [st, 0]),
    ) as Record<SoftLaunchItemStatus, number>;
    for (const item of channelScopedItems) {
      const st = completionFor(item).itemStatus;
      counts[st] = (counts[st] ?? 0) + 1;
    }
    return counts;
  }, [channelScopedItems, taskStatusById, testStatusById, itemOverrides]);

  const statusScopedItems = useMemo(() => {
    if (statusFilters.size === 0) return channelScopedItems;
    return channelScopedItems.filter((i) =>
      statusFilters.has(completionFor(i).itemStatus),
    );
  }, [channelScopedItems, statusFilters, taskStatusById, testStatusById, itemOverrides]);

  const dueDateOptions = useMemo(
    () => softLaunchDueDates(statusScopedItems),
    [statusScopedItems],
  );

  const rolloutDays = useMemo(() => {
    const filtered = filterSoftLaunchByDueDay(statusScopedItems, dueFilter);
    return groupSoftLaunchByDay(filtered, dueSort);
  }, [statusScopedItems, dueFilter, dueSort]);

  const assigneeCounts = useMemo(
    () => rolloutOwnerCounts(sprintScopedItems),
    [sprintScopedItems],
  );

  const channelCounts = useMemo(() => {
    const counts = Object.fromEntries(ROLLOUT_CHANNELS.map((c) => [c, 0])) as Record<
      RolloutChannel | "all",
      number
    >;
    counts.all = assigneeScopedItems.length;
    for (const item of assigneeScopedItems) {
      counts[item.channel] = (counts[item.channel] ?? 0) + 1;
    }
    return counts;
  }, [assigneeScopedItems]);

  const sprintFilterLabel =
    sprintFilters.size === 0
      ? "All sprints"
      : sprintFilters.size === 1
        ? `Sprint ${[...sprintFilters][0]}`
        : `${sprintFilters.size} sprints`;

  const channelFilterLabel =
    channelFilter === "all" ? "All channels" : ROLLOUT_CHANNEL_LABELS[channelFilter];

  const assigneeFilterLabel =
    assigneeFilters.size === 0
      ? ROLLOUT_OWNERS.join(" · ")
      : ROLLOUT_OWNERS.filter((o) => assigneeFilters.has(o)).join(" · ");

  const dueFilterLabel =
    dueFilter === "all"
      ? "All due dates"
      : `Due ${isoToMmddyy(dueFilter) || dueFilter}`;

  // Drop stale due filter when sprint/channel/assignee no longer includes that day.
  useEffect(() => {
    if (dueFilter !== "all" && !dueDateOptions.includes(dueFilter)) {
      setDueFilter("all");
    }
  }, [dueFilter, dueDateOptions]);

  const toggleSprintFilter = (sprint: number) => {
    setSprintFilters((prev) => toggleInSet(prev, sprint));
  };

  const toggleAssigneeFilter = (owner: RolloutOwner) => {
    setAssigneeFilters((prev) => toggleInSet(prev, owner));
  };

  const setFactoryTab = (id: FactoryTab) => {
    setTab(id);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "factory");
    url.searchParams.set("panel", id === "workshops" ? "workshops" : "launch-plan");
    window.history.replaceState(window.history.state, "", url.toString());
  };

  const seedRollout = async (mode: "visible" | "all") => {
    setSeedMsg("");
    const next = seedSoftLaunchDrafts(
      { batches, drafts },
      mode === "all"
        ? {}
        : sprintFilters.size === 0
          ? {}
          : { items: channelScopedItems },
    );
    if (next.added === 0) {
      setSeedMsg("No new drafts — those calendar items are already seeded.");
      setShowSeeded(true);
      return;
    }
    try {
      await persist(next.batches, next.drafts);
      setSelectedId(next.drafts[0]?.id ?? null);
      setSeedMsg(`Seeded ${next.added} draft(s). Open Seeded drafts below to edit copy/status.`);
      setShowSeeded(true);
    } catch {
      /* error set */
    }
  };

  const advance = async (draft: ContentDraft) => {
    const nextStatus = NEXT_STATUS[draft.status];
    if (!nextStatus) return;
    try {
      await persist(
        batches,
        drafts.map((d) => (d.id === draft.id ? { ...d, status: nextStatus } : d)),
      );
    } catch {
      /* error set */
    }
  };

  const updateSelected = async (patch: Partial<ContentDraft>) => {
    if (!selected) return;
    try {
      await persist(
        batches,
        drafts.map((d) => (d.id === selected.id ? { ...d, ...patch } : d)),
      );
    } catch {
      /* error set */
    }
  };

  return (
    <div className="content-factory" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <BusyOverlay active={loading} message="Loading content…" />
      <div
        className="glass content-factory__hero"
        style={{
          padding: "14px 16px",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(215,198,151,0.55), #fff)",
        }}
      >
        <h2 style={{ fontSize: "1.35rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <Sparkles size={20} style={{ color: "var(--bronze)" }} /> Content Factory
        </h2>
        <p style={{ color: "var(--text-primary)", marginTop: 4, marginBottom: 0, fontSize: "0.95rem" }}>
          GYSH Marketing/Launch Plan (Sprints 3–5): Facebook, Kevina Starr, website/newsletter, ads, and new channels. Admin only.
        </p>
        {error && (
          <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {(
            [
              ["soft_launch", "GYSH Marketing/Launch Plan", <Rocket key="s" size={14} />],
              ["workshops", "Workshops", <Mic2 key="w" size={14} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              className={`nav-link-btn ${tab === id ? "active" : ""}`}
              style={{ borderRadius: 10 }}
              onClick={() => setFactoryTab(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "workshops" && <WorkshopsAdmin />}

      {tab === "soft_launch" && (
        <>
          <div className="glass content-factory__help-stack" data-testid="factory-help-stack">
            <div className="content-factory__help-row qa-categories-panel" data-testid="factory-howto-panel">
              <div className="qa-section-heading qa-categories-panel__header" aria-expanded={howtoOpen}>
                <ShowHideChevron
                  open={howtoOpen}
                  onOpenChange={setHowtoOpen}
                  label="How"
                  testId="factory-howto-chevron"
                  size={18}
                />
                <button
                  type="button"
                  className="qa-categories-panel__heading-btn"
                  onClick={() => setHowtoOpen((v) => !v)}
                  aria-expanded={howtoOpen}
                  title={CONTENT_FACTORY_HOWTO.title}
                >
                  <span className="qa-categories-panel__title">How</span>
                </button>
                <ShowHideToggle
                  open={howtoOpen}
                  onOpenChange={setHowtoOpen}
                  label="How"
                  testId="factory-howto-toggle"
                />
              </div>
              {howtoOpen && (
                <div className="content-factory__help-body">
                  <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    {CONTENT_FACTORY_HOWTO.summary}
                  </p>
                  <ol style={{ margin: "8px 0 0", paddingLeft: 18, color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.45 }}>
                    {CONTENT_FACTORY_HOWTO.steps.map((step) => (
                      <li key={step} style={{ marginBottom: 2 }}>{step}</li>
                    ))}
                  </ol>
                  <p style={{ marginTop: 8, marginBottom: 0, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    Share this report:{" "}
                    <a href={marketingLaunchPlanUrl()} style={{ color: "var(--bronze)", wordBreak: "break-all" }}>
                      {marketingLaunchPlanUrl()}
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="content-factory__help-row qa-categories-panel" data-testid="factory-definitions-panel">
              <div className="qa-section-heading qa-categories-panel__header" aria-expanded={definitionsOpen}>
                <ShowHideChevron
                  open={definitionsOpen}
                  onOpenChange={setDefinitionsOpen}
                  label="Definitions"
                  testId="factory-definitions-chevron"
                  size={18}
                />
                <button
                  type="button"
                  className="qa-categories-panel__heading-btn"
                  onClick={() => setDefinitionsOpen((v) => !v)}
                  aria-expanded={definitionsOpen}
                >
                  <span className="qa-categories-panel__title">Definitions</span>
                </button>
                <ShowHideToggle
                  open={definitionsOpen}
                  onOpenChange={setDefinitionsOpen}
                  label="Definitions"
                  testId="factory-definitions-toggle"
                />
              </div>
              {definitionsOpen && (
                <dl className="content-factory__help-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {MARKETING_PLAN_DEFINITIONS.map((d) => (
                    <div key={d.term}>
                      <dt style={{ fontWeight: 700, color: "var(--charcoal)", fontSize: "0.925rem" }}>{d.term}</dt>
                      <dd style={{ margin: "2px 0 0", color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.45 }}>
                        {d.definition}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>

          <div className="glass" style={{ padding: "12px 14px", borderRadius: 14 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button type="button" className="btn btn-primary" onClick={() => void seedRollout("visible")} disabled={loading}>
                  <Wand2 size={14} /> Seed visible → drafts
                </button>
                <button type="button" className="btn btn-outline" onClick={() => void seedRollout("all")} disabled={loading}>
                  Seed all S2–S5
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowSeeded((v) => !v)} disabled={loading}>
                  Seeded drafts ({seededDrafts.length})
                </button>
              </div>

              <div
                className="qa-categories-panel"
                data-testid="factory-due-filters"
                style={{ margin: 0, flex: "1 1 220px", minWidth: 200 }}
              >
                <div
                  className="qa-section-heading qa-categories-panel__header"
                  aria-expanded={dueOpen}
                  style={{ marginBottom: 0 }}
                >
                  <ShowHideChevron
                    open={dueOpen}
                    onOpenChange={setDueOpen}
                    label="Due date"
                    testId="factory-due-chevron"
                    size={18}
                  />
                  <button
                    type="button"
                    className="qa-categories-panel__heading-btn"
                    onClick={() => setDueOpen((v) => !v)}
                    aria-expanded={dueOpen}
                    data-testid="factory-due-heading"
                  >
                    <span className="qa-categories-panel__title">Due date</span>
                    <span className="qa-categories-panel__active">
                      — {dueFilterLabel}
                      {!dueOpen ? " · collapsed" : ""}
                    </span>
                  </button>
                  <ShowHideToggle
                    open={dueOpen}
                    onOpenChange={setDueOpen}
                    label="Due date"
                    testId="factory-due-toggle"
                  />
                </div>
              </div>
            </div>

            {dueOpen && (
              <div style={{ marginTop: 10 }} data-testid="factory-due-body">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0, fontSize: "0.875rem" }} htmlFor="factory-due-sort">
                    Sort
                  </label>
                  <select
                    id="factory-due-sort"
                    className="select-input"
                    data-testid="factory-due-sort"
                    style={{ width: 180 }}
                    value={dueSort}
                    onChange={(e) => setDueSort(e.target.value as SoftLaunchDueSort)}
                  >
                    <option value="asc">Due date ↑ earliest</option>
                    <option value="desc">Due date ↓ latest</option>
                  </select>
                </div>
                <div className="qa-categories-panel__bubbles" role="group" aria-label="Filter by due date">
                  <FilterChip
                    active={dueFilter === "all"}
                    onToggle={() => setDueFilter("all")}
                    title="Show all due dates"
                    testId="factory-due-all"
                  >
                    All dates
                    <span className="qa-tester-meta">· {statusScopedItems.length}</span>
                  </FilterChip>
                  {dueDateOptions.map((day) => {
                    const label = isoToMmddyy(day) || day;
                    const count = statusScopedItems.filter((i) => i.day === day).length;
                    return (
                      <FilterChip
                        key={day}
                        active={dueFilter === day}
                        onToggle={() => setDueFilter((prev) => (prev === day ? "all" : day))}
                        title={`Due ${label} · ${count} items`}
                        testId={`factory-due-${day}`}
                      >
                        {label}
                        <span className="qa-tester-meta">· {count}</span>
                      </FilterChip>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="qa-categories-panel" style={{ marginTop: 16 }} data-testid="factory-status-filters">
              <div className="qa-section-heading qa-categories-panel__header" aria-expanded={statusOpen}>
                <ShowHideChevron
                  open={statusOpen}
                  onOpenChange={setStatusOpen}
                  label="Status"
                  testId="factory-status-chevron"
                  size={18}
                />
                <button
                  type="button"
                  className="qa-categories-panel__heading-btn"
                  onClick={() => setStatusOpen((v) => !v)}
                  aria-expanded={statusOpen}
                >
                  <span className="qa-categories-panel__title">Status</span>
                  <span className="qa-categories-panel__active">
                    —{" "}
                    {statusFilters.size === 0
                      ? "All statuses"
                      : [...statusFilters]
                          .map((st) => SOFT_LAUNCH_ITEM_STATUS_LABELS[st])
                          .join(", ")}
                  </span>
                </button>
                <ShowHideToggle
                  open={statusOpen}
                  onOpenChange={setStatusOpen}
                  label="Status"
                  testId="factory-status-toggle"
                />
              </div>
              {statusOpen && (
                <div className="qa-categories-panel__bubbles" role="group" aria-label="Filter by status">
                  <FilterChip
                    active={statusFilters.size === 0}
                    onToggle={() => setStatusFilters(new Set())}
                    title="Show all statuses"
                    testId="factory-status-all"
                  >
                    All statuses
                    <span className="qa-tester-meta">· {channelScopedItems.length}</span>
                  </FilterChip>
                  {SOFT_LAUNCH_ITEM_STATUSES.map((st) => {
                    const count = statusCounts[st] ?? 0;
                    const accent =
                      st === "done"
                        ? "#16a34a"
                        : st === "blocked"
                          ? "#dc2626"
                          : st === "in_progress"
                            ? "#ca8a04"
                            : "#9ca3af";
                    return (
                      <FilterChip
                        key={st}
                        active={statusFilters.has(st)}
                        onToggle={() => toggleStatusFilter(st)}
                        title={`Filter: ${SOFT_LAUNCH_ITEM_STATUS_LABELS[st]} (${count})`}
                        testId={`factory-status-${st}`}
                      >
                        <span className="qa-tester-dot" style={{ background: accent }} />
                        {SOFT_LAUNCH_ITEM_STATUS_LABELS[st]}
                        <span className="qa-tester-meta">· {count}</span>
                      </FilterChip>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="qa-categories-panel" style={{ marginTop: 16 }} data-testid="factory-assignee-filters">
              <div className="qa-section-heading qa-categories-panel__header" aria-expanded={assigneeOpen}>
                <ShowHideChevron
                  open={assigneeOpen}
                  onOpenChange={setAssigneeOpen}
                  label="Assignee"
                  testId="factory-assignee-chevron"
                  size={18}
                />
                <button
                  type="button"
                  className="qa-categories-panel__heading-btn"
                  onClick={() => setAssigneeOpen((v) => !v)}
                  aria-expanded={assigneeOpen}
                >
                  <span className="qa-categories-panel__title">Assignee</span>
                  <span className="qa-categories-panel__active">— {assigneeFilterLabel}</span>
                </button>
                <ShowHideToggle
                  open={assigneeOpen}
                  onOpenChange={setAssigneeOpen}
                  label="Assignee"
                  testId="factory-assignee-toggle"
                />
              </div>
              {assigneeOpen && (
                <div className="qa-categories-panel__bubbles" role="group" aria-label="Filter by assignee">
                  <FilterChip
                    active={assigneeFilters.size === 0}
                    onToggle={() => setAssigneeFilters(new Set())}
                    title="Show all assignees"
                    testId="factory-assignee-all"
                  >
                    All
                    <span className="qa-tester-meta">· {assigneeCounts.all}</span>
                  </FilterChip>
                  {ROLLOUT_OWNERS.map((owner) => {
                    const count = assigneeCounts[owner] ?? 0;
                    return (
                      <FilterChip
                        key={owner}
                        active={assigneeFilters.has(owner)}
                        onToggle={() => toggleAssigneeFilter(owner)}
                        title={`Filter to ${owner} · ${count} items`}
                        testId={`factory-assignee-${owner.toLowerCase()}`}
                      >
                        <span
                          className="qa-tester-dot"
                          style={{
                            background:
                              owner === "Tina"
                                ? "var(--crimson)"
                                : owner === "Evelyn"
                                  ? "var(--bronze)"
                                  : "var(--charcoal)",
                          }}
                        />
                        {owner}
                        <span className="qa-tester-meta">· {count}</span>
                      </FilterChip>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="qa-categories-panel" style={{ marginTop: 16 }} data-testid="factory-sprint-filters">
              <div className="qa-section-heading qa-categories-panel__header" aria-expanded={sprintOpen}>
                <ShowHideChevron
                  open={sprintOpen}
                  onOpenChange={setSprintOpen}
                  label="Sprint"
                  testId="factory-sprint-chevron"
                  size={18}
                />
                <button
                  type="button"
                  className="qa-categories-panel__heading-btn"
                  onClick={() => setSprintOpen((v) => !v)}
                  aria-expanded={sprintOpen}
                >
                  <span className="qa-categories-panel__title">Sprint</span>
                  <span className="qa-categories-panel__active">
                    — {sprintFilterLabel}
                    {sprintFilters.size === 1 && sprintFilters.has(liveSprintIndex)
                      ? " · current"
                      : ""}
                  </span>
                </button>
                <ShowHideToggle
                  open={sprintOpen}
                  onOpenChange={setSprintOpen}
                  label="Sprint"
                  testId="factory-sprint-toggle"
                />
              </div>
              {sprintOpen && (
                <div className="qa-categories-panel__bubbles" role="group" aria-label="Filter by sprint">
                  <FilterChip
                    active={sprintFilters.size === 0}
                    onToggle={() => setSprintFilters(new Set())}
                    title="Show all soft-launch sprints"
                    testId="factory-sprint-all"
                  >
                    All sprints
                    <span className="qa-tester-meta">· {rolloutItems.length}</span>
                  </FilterChip>
                  {SOFT_LAUNCH_FACTORY_SPRINTS.map((sprint) => {
                    const count = sprintCounts[sprint] ?? 0;
                    const active = sprintFilters.has(sprint);
                    const isCurrent = sprint === liveSprintIndex;
                    const window = getSprintWindow(sprint);
                    return (
                      <FilterChip
                        key={sprint}
                        active={active}
                        onToggle={() => toggleSprintFilter(sprint)}
                        title={
                          sprint === 2
                            ? `Sprint 2 kickoff · ${window.rangeLabel} · ${count} items`
                            : `Sprint ${sprint} · ${window.rangeLabel} · ${count} items${isCurrent ? " · current" : ""}`
                        }
                        testId={`factory-sprint-${sprint}`}
                      >
                        <span className="qa-tester-dot" style={{ background: "var(--bronze)" }} />
                        Sprint {sprint}
                        {sprint === 2 ? " · kickoff" : ""}
                        {isCurrent ? " · current" : ""}
                        <span className="qa-tester-meta task-list-sprint__dates">
                          · {window.numericRangeLabel}
                        </span>
                        <span className="qa-tester-meta">· {count}</span>
                      </FilterChip>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="qa-categories-panel" style={{ marginTop: 16 }} data-testid="factory-channel-filters">
              <div className="qa-section-heading qa-categories-panel__header" aria-expanded={channelsOpen}>
                <ShowHideChevron
                  open={channelsOpen}
                  onOpenChange={setChannelsOpen}
                  label="Channels"
                  testId="factory-channel-chevron"
                  size={18}
                />
                <button
                  type="button"
                  className="qa-categories-panel__heading-btn"
                  onClick={() => setChannelsOpen((v) => !v)}
                  aria-expanded={channelsOpen}
                >
                  <span className="qa-categories-panel__title">Channels</span>
                  <span className="qa-categories-panel__active">— {channelFilterLabel}</span>
                </button>
                <ShowHideToggle
                  open={channelsOpen}
                  onOpenChange={setChannelsOpen}
                  label="Channels"
                  testId="factory-channel-toggle"
                />
              </div>
              {channelsOpen && (
                <div className="qa-categories-panel__bubbles">
                  <FilterChip
                    active={channelFilter === "all"}
                    onToggle={() => setChannelFilter("all")}
                    title="Show all channels"
                    testId="factory-channel-all"
                  >
                    All
                    <span className="qa-tester-meta">· {channelCounts.all}</span>
                  </FilterChip>
                  {ROLLOUT_CHANNELS.map((channel) => {
                    const count = channelCounts[channel] ?? 0;
                    if (count === 0) return null;
                    return (
                      <FilterChip
                        key={channel}
                        active={channelFilter === channel}
                        onToggle={() =>
                          setChannelFilter((prev) => (prev === channel ? "all" : channel))
                        }
                        title={`Filter to ${ROLLOUT_CHANNEL_LABELS[channel]}`}
                        testId={`factory-channel-${channel}`}
                      >
                        {ROLLOUT_CHANNEL_LABELS[channel]}
                        <span className="qa-tester-meta">· {count}</span>
                      </FilterChip>
                    );
                  })}
                </div>
              )}
            </div>

            {seedMsg && (
              <p style={{ marginTop: 12, color: "var(--text-primary)", fontSize: "0.95rem" }}>{seedMsg}</p>
            )}
            <p style={{ marginTop: 12, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              <CalendarRange size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
              {rolloutItems.length} calendar items · Edit items below or seed drafts (does not post live).
              Tina owns Kevina Starr FB; Evelyn owns TikTok / YouTube / IG / ads / tech website.
            </p>
          </div>

          {showSeeded && (
            <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
              <h3 style={{ margin: 0, color: "var(--charcoal)", fontSize: "1.1rem" }}>Seeded drafts</h3>
              <p style={{ marginTop: 6, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                Editable working copies of plan items. Advance status as you publish.
              </p>
              {seededDrafts.length === 0 ? (
                <p style={{ marginTop: 12, color: "var(--text-primary)" }}>None yet — use Seed visible sprint or Seed all S2–S5.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(280px, 1.2fr)", gap: 16, marginTop: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {seededDrafts.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className="glass"
                        onClick={() => setSelectedId(d.id)}
                        style={{
                          textAlign: "left",
                          padding: 12,
                          borderRadius: 12,
                          border: selected?.id === d.id ? "1px solid var(--bronze)" : "1px solid var(--border-color)",
                          cursor: "pointer",
                          background: selected?.id === d.id ? "rgba(215,198,151,0.35)" : "#fff",
                        }}
                      >
                        <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                          {CONTENT_TYPE_LABELS[d.type]} · {CONTENT_STATUS_LABELS[d.status]}
                        </div>
                        <strong style={{ color: "var(--charcoal)", fontSize: "0.95rem" }}>{d.title}</strong>
                      </button>
                    ))}
                  </div>
                  {selected && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Title</label>
                        <input className="text-input" value={selected.title} onChange={(e) => void updateSelected({ title: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Body</label>
                        <textarea
                          className="text-input"
                          rows={12}
                          value={selected.body}
                          onChange={(e) => void updateSelected({ body: e.target.value })}
                          style={{ resize: "vertical" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <button type="button" className="btn btn-primary" onClick={() => void advance(selected)}>
                          Advance status
                        </button>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                          Owner: {selected.owner} · {CONTENT_STATUS_LABELS[selected.status]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {SOFT_LAUNCH_PROJECTIONS.filter(
            (p) =>
              !p.opsItemId &&
              (sprintFilters.size === 0 || sprintFilters.has(p.sprint)),
          ).length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {SOFT_LAUNCH_PROJECTIONS.filter(
                (p) =>
                  !p.opsItemId &&
                  (sprintFilters.size === 0 || sprintFilters.has(p.sprint)),
              ).map((p) => (
                <div key={p.sprint} className="glass" style={{ padding: 16, borderRadius: 14 }}>
                  <strong style={{ color: "var(--charcoal)" }}>{p.label}</strong>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", marginTop: 4 }}>{p.rangeLabel}</div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginTop: 8 }}>{p.theme}</p>
                  <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {p.metrics.slice(0, 3).map((m) => (
                      <li key={m.label}>{m.label}: {m.low}–{m.high}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 10, fontSize: "0.875rem", color: "var(--charcoal)" }}>
                    {p.revenue.map((r) => (
                      <div key={r.label}>
                        {r.label}: ${r.lowUsd}–${r.highUsd}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {rolloutDays.map(({ day, items }) => (
            <div key={day} className="glass" style={{ padding: 18, borderRadius: 14 }}>
              <h3 style={{ margin: 0, color: "var(--charcoal)", fontSize: "1.1rem" }}>{day}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {items.map((item) => {
                  const completion = completionFor(item);
                  const focused = highlightItemId === item.id;
                  const open = openItemIds.has(item.id);
                  const projection = softLaunchProjectionForItem(item.id);
                  const dueLabel = isoToMmddyy(item.day) || item.day;
                  const ref = softLaunchItemRef(item.id);
                  return (
                  <div
                    key={item.id}
                    id={`factory-item-${item.id}`}
                    data-testid={`factory-item-${item.id}`}
                    data-item-done={completion.itemDone ? "true" : "false"}
                    data-open={open ? "true" : "false"}
                    data-status={completion.itemStatus}
                    className={`content-factory__item ${contentFactoryItemStatusClass(completion.itemStatus)}${focused ? " is-focused" : ""}`}
                    style={{
                      opacity: completion.itemDone ? 0.92 : 1,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="content-factory__item-header"
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                        padding: "12px 14px",
                      }}
                    >
                      <button
                        type="button"
                        className="content-factory__item-toggle"
                        data-testid={`factory-item-toggle-${item.id}`}
                        aria-expanded={open}
                        aria-controls={`factory-item-body-${item.id}`}
                        onClick={() => toggleItemOpen(item.id)}
                        style={{
                          display: "flex",
                          flex: "1 1 220px",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                          padding: 0,
                          margin: 0,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "inherit",
                          minWidth: 0,
                        }}
                      >
                        <ShowHideChevron open={open} />
                        <span
                          className="flat-label flat-label--id"
                          data-testid={`factory-item-ref-${item.id}`}
                          title={`Content Factory ${ref}`}
                          style={{ fontWeight: 800 }}
                        >
                          {ref}
                        </span>
                        <strong
                          className={`content-factory__item-title${completion.itemDone ? " is-done" : ""}`}
                          style={{
                            flex: "1 1 160px",
                            minWidth: 0,
                            color: "var(--charcoal)",
                            fontSize: "1.05rem",
                            fontWeight: 800,
                            lineHeight: 1.3,
                            display: "inline-flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            data-testid={`factory-item-name-${item.id}`}
                            style={{
                              textDecoration: completion.itemDone ? "line-through" : undefined,
                              textDecorationColor: completion.itemDone
                                ? "rgba(24, 23, 24, 0.55)"
                                : undefined,
                            }}
                          >
                            {item.title}
                          </span>
                          <span
                            className="content-factory__item-due"
                            data-testid={`factory-item-due-${item.id}`}
                            title={`Due: ${dueLabel}${item.postTime ? ` · ${item.postTime}` : ""}`}
                            style={{
                              color: "#9B2F28",
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                              textDecoration: completion.itemDone ? "line-through" : undefined,
                              textDecorationColor: completion.itemDone
                                ? "rgba(155, 47, 40, 0.55)"
                                : undefined,
                            }}
                          >
                            Due: {dueLabel}
                          </span>
                          {(attachmentsByItem[item.id]?.length ?? 0) > 0 ? (
                            <span
                              data-testid={`factory-item-image-count-${item.id}`}
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: "var(--bronze)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {attachmentsByItem[item.id]!.length} file
                              {attachmentsByItem[item.id]!.length === 1 ? "" : "s"}
                            </span>
                          ) : null}
                          <span
                            className="content-factory__item-assignee"
                            data-testid={`factory-item-assignee-${item.id}`}
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color:
                                item.owner === "Tina"
                                  ? "var(--crimson)"
                                  : item.owner === "Evelyn"
                                    ? "var(--bronze)"
                                    : "var(--charcoal)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.owner}
                          </span>
                        </strong>
                        <span style={{ fontSize: "0.8rem", color: "var(--bronze)", fontWeight: 700 }}>
                          {ROLLOUT_CHANNEL_LABELS[item.channel]}
                        </span>
                      </button>
                      <div
                        className="content-factory__item-status-cluster"
                        data-testid={`factory-crosslinks-${item.id}`}
                        style={{
                          display: "inline-flex",
                          flexWrap: "wrap",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <label
                          className="content-factory__item-status-label"
                          title="Content Factory owner (saves immediately)"
                        >
                          <span>Owner</span>
                          <select
                            className="content-factory__item-status"
                            data-testid={`factory-item-owner-quick-${item.id}`}
                            value={item.owner}
                            disabled={itemSaveBusy}
                            aria-label={`Owner for ${item.title}`}
                            onChange={(e) => {
                              void setItemOwner(
                                item,
                                e.target.value as RolloutOwner,
                              );
                            }}
                          >
                            {ROLLOUT_OWNERS.map((owner) => (
                              <option key={owner} value={owner}>
                                {owner}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label
                          className="content-factory__item-status-label"
                          title={
                            completion.statusIsExplicit
                              ? "Content Factory status (saved)"
                              : "Content Factory status (auto from task/tests until you change it)"
                          }
                        >
                          <span>Status</span>
                          <select
                            className="content-factory__item-status"
                            data-testid={`factory-item-status-${item.id}`}
                            value={completion.itemStatus}
                            disabled={itemSaveBusy}
                            aria-label={`Status for ${item.title}`}
                            onChange={(e) => {
                              void setItemStatus(
                                item,
                                e.target.value as SoftLaunchItemStatus,
                              );
                            }}
                          >
                            {SOFT_LAUNCH_ITEM_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {SOFT_LAUNCH_ITEM_STATUS_LABELS[st]}
                              </option>
                            ))}
                          </select>
                        </label>
                        {statusBadge(
                          taskStatusTone(completion.taskStatus),
                          `${completion.taskId}: ${taskStatusLabel(completion.taskStatus)}`,
                          `factory-task-status-${item.id}`,
                          { tab: "tasks", taskId: completion.taskId },
                        )}
                        {completion.testIds.length === 0 ? (
                          statusBadge("done", "No QA test", `factory-no-test-${item.id}`)
                        ) : (
                          completion.testIds.map((testId) => {
                            const st = completion.testStatusById[testId] ?? DEFAULT_TEST_STATUS;
                            return statusBadge(
                              testStatusTone(st),
                              `${testId}: ${testStatusLabel(st)}`,
                              `factory-test-status-${item.id}-${testId}`,
                              { tab: "testing", testId },
                            );
                          })
                        )}
                      </div>
                    </div>
                    {open && (
                    <div
                      id={`factory-item-body-${item.id}`}
                      data-testid={`factory-item-body-${item.id}`}
                      style={{ padding: "4px 14px 14px" }}
                    >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 4,
                        fontSize: "0.875rem",
                        alignItems: "center",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span>{item.postTime ?? "Anytime"} · {item.owner}</span>
                    </div>
                    <AdminCrossLinks
                      entity={{ kind: "cf", id: item.id }}
                      links={crossLinksForSoftLaunchItem(item)}
                      edges={entityEdges}
                      titles={entityTitles}
                      editable
                      candidates={linkCandidates}
                      busy={itemSaveBusy}
                      onLink={(target) =>
                        linkEntities({ kind: "cf", id: item.id }, target)
                      }
                      onUnlink={(target) =>
                        unlinkEntities({ kind: "cf", id: item.id }, target)
                      }
                      testId={`factory-crosslinks-edit-${item.id}`}
                      style={{ marginTop: 8 }}
                    />
                    {projection && (
                      <div
                        data-testid={`factory-projection-${item.id}`}
                        style={{
                          marginTop: 10,
                          padding: 12,
                          borderRadius: 10,
                          background: "rgba(247,241,227,0.75)",
                          fontSize: "0.875rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "var(--charcoal)" }}>
                          {projection.rangeLabel}
                        </div>
                        <p style={{ margin: "6px 0 0" }}>{projection.theme}</p>
                        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                          {projection.metrics.slice(0, 3).map((m) => (
                            <li key={m.label}>
                              {m.label}: {m.low}–{m.high}
                            </li>
                          ))}
                        </ul>
                        <div style={{ marginTop: 8, color: "var(--charcoal)" }}>
                          {projection.revenue.map((r) => (
                            <div key={r.label}>
                              {r.label}: ${r.lowUsd}–${r.highUsd}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.notes?.trim() ? (
                      <div
                        className="content-factory__item-notes-preview"
                        data-testid={`factory-item-notes-preview-${item.id}`}
                      >
                        <strong style={{ display: "block", marginBottom: 4 }}>Working notes</strong>
                        {item.notes}
                      </div>
                    ) : null}
                    <SoftLaunchItemAttachments
                      itemId={item.id}
                      attachments={attachmentsByItem[item.id] ?? []}
                      onChange={(next) =>
                        setAttachmentsByItem((prev) => ({ ...prev, [item.id]: next }))
                      }
                    />
                    <SoftLaunchItemEditor
                      item={item}
                      itemStatus={completion.itemStatus}
                      hasOverride={Boolean(itemOverrides[item.id])}
                      busy={itemSaveBusy}
                      onSave={async (patch) => {
                        await saveItemPatch(item, patch, "Failed to save calendar item.");
                      }}
                      onReset={async () => {
                        setItemSaveBusy(true);
                        setError("");
                        try {
                          await resetSoftLaunchItemOverride(item.id);
                          const next = { ...itemOverrides };
                          delete next[item.id];
                          setItemOverrides(next);
                          activateSoftLaunchOverrides(next);
                        } catch (e) {
                          setError(
                            e instanceof ApiError ? e.message : "Failed to reset calendar item.",
                          );
                          throw e;
                        } finally {
                          setItemSaveBusy(false);
                        }
                      }}
                    />
                    {item.artifacts.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong style={{ fontSize: "0.875rem" }}>Artifacts preview</strong>
                        <ol style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                          {item.artifacts.map((a) => (
                            <li key={a}>
                              <MarkdownLinkText text={a} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
