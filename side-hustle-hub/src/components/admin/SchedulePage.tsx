import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  RotateCcw,
  Save,
  Square,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { ApiError } from "../../lib/api";
import { fetchAgilePlan, persistAgilePlan } from "../../lib/gysh-agile-plan";
import {
  commitPlanSprintPlan,
  commitTaskSprintPlan,
  commitTestSprintPlan,
  planToBoardCard,
  taskToBoardCard,
  testToBoardCard,
  type BoardCard,
} from "../../lib/gysh-sprint-board";
import { SprintStatusBars } from "./SprintStatusBars";
import {
  ACCEPT_ATTACHMENTS,
  applyPartnerDone,
  fetchTasks,
  formatFileSize,
  isAcceptedAttachment,
  persistTasks,
  TASK_STATUS_LABELS,
  todayMMDDYY,
  type GyshTask,
  type TaskStatus,
} from "../../lib/gysh-tasks";
import {
  TEST_CASES,
  fetchTestStatuses,
  saveTestStatus,
  saveTestStatusesBatch,
  withDefaultSuite,
  STATUS_LABELS as TEST_STATUS_LABELS,
  statusRequiresNote,
  noteMeetsRequirement,
  type TestStatus,
} from "../../lib/gysh-test-plan";
import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
  isAutomatedTestId,
} from "../../lib/gysh-automated-tests";
import {
  AUTOMATED_SUITE_OWNERS,
  QA_TESTERS,
  type QaTesterId,
} from "../../lib/gysh-roles";
import {
  BACKLOG_SPRINT,
  CEREMONY_LABELS,
  RETRO_COLUMNS,
  STATUS_LABELS,
  applyPlanPartnerDone,
  buildDefaultPlanItems,
  ceremoniesForSprint,
  getSprintWindow,
  listUpcomingSprints,
  newPlanItemId,
  newRetroCardId,
  sprintLabel,
  themeForSprint,
  type PlanItem,
  type PlanItemAttachment,
  type PlanItemStatus,
  type PlanOwner,
  type RetroCard,
  type RetroColumn,
  type SprintCeremony,
} from "../../lib/gysh-sprints";
import {
  deleteTaskFile,
  getTaskFile,
  newFileId,
  putTaskFile,
} from "../../lib/gysh-task-files";

type ScheduleTab = "board" | "ceremonies" | "retro";

const ALL_TESTS = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
];

const TEST_DEFAULT_ASSIGNEES = Object.fromEntries(
  ALL_TESTS.map((test) => [test.id, test.assignees[0] ?? ""]),
) as Record<string, QaTesterId | "">;

const STATUS_COLORS: Record<string, string> = {
  todo: "#947D64",
  in_progress: "#c9a227",
  done: "#5f7a45",
  carried: "#9B2F28",
  blocked: "#9B2F28",
};

const CEREMONY_COLORS: Record<SprintCeremony["type"], string> = {
  standup: "#3b6ea5",
  planning: "#8a7348",
  retrospective: "#9B2F28",
};

type BoardOwnerFilter = "all" | "Tina" | "Evelyn" | "Lyriq" | "Both" | "Unassigned";

type CardDraft = {
  assignee?: string;
  status?: string;
  sprint?: number;
  note?: string;
};

const BULK_STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "todo", label: "To do / Not run" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done / Pass" },
  { id: "blocked", label: "Blocked" },
  { id: "fail", label: "Fail (tests)" },
  { id: "carried", label: "Carry over (plan)" },
];

function mapBulkStatusToSource(
  source: BoardCard["source"],
  bulkStatus: string,
): string | null {
  if (source === "test") {
    if (bulkStatus === "todo") return "not_run";
    if (bulkStatus === "done") return "pass";
    if (bulkStatus === "carried") return null;
    return bulkStatus;
  }
  if (source === "task") {
    if (bulkStatus === "todo") return "not_started";
    if (bulkStatus === "done" || bulkStatus === "pass") return "done";
    if (bulkStatus === "fail" || bulkStatus === "carried" || bulkStatus === "not_run") return null;
    return bulkStatus;
  }
  if (bulkStatus === "todo" || bulkStatus === "not_started" || bulkStatus === "not_run") return "todo";
  if (bulkStatus === "done" || bulkStatus === "pass") return "done";
  if (bulkStatus === "fail" || bulkStatus === "blocked") return null;
  return bulkStatus;
}

function bulkAssigneeForSource(source: BoardCard["source"], value: string): string | null {
  if (!value) return null;
  if (source === "test") {
    const id = QA_TESTERS.find((t) => t.id === value || t.shortName === value)?.id;
    return id ?? null;
  }
  if (value === "tina" || value === "evelyn" || value === "lyriq") {
    const name = QA_TESTERS.find((t) => t.id === value)?.shortName;
    return name ?? null;
  }
  return value;
}

const OWNER_BUBBLES: { id: BoardOwnerFilter; label: string; accent?: string }[] = [
  { id: "all", label: "All owners" },
  { id: "Tina", label: "Tina", accent: "#9B2F28" },
  { id: "Evelyn", label: "Evelyn", accent: "#947D64" },
  { id: "Lyriq", label: "Lyriq", accent: "#2e7d32" },
  { id: "Both", label: "Both", accent: "#181718" },
  { id: "Unassigned", label: "Unassigned", accent: "#7a7064" },
];

/** T/E also match "Both" cards; Lyriq and Both match exactly. */
function cardMatchesOwner(card: BoardCard, owner: BoardOwnerFilter): boolean {
  if (owner === "all") return true;
  if (owner === "Both" || owner === "Lyriq" || owner === "Unassigned") {
    return card.owner === owner;
  }
  return card.owner === owner || card.owner === "Both";
}

const PLAN_ASSIGNEES: PlanOwner[] = ["Unassigned", "Tina", "Evelyn", "Lyriq", "Both"];
const TASK_ASSIGNEES: GyshTask["assignedTo"][] = ["Tina", "Evelyn", "Lyriq", "Both"];

function isDone(card: BoardCard): boolean {
  return card.status === "done";
}

function percent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function ProgressMeter({
  label,
  done,
  total,
  accent,
}: {
  label: string;
  done: number;
  total: number;
  accent: string;
}) {
  const value = percent(done, total);
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 5,
          fontSize: "0.78rem",
        }}
      >
        <strong style={{ color: "var(--charcoal)" }}>{label}</strong>
        <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
          {done}/{total} · {value}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} sprint progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(148,125,100,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 999,
            background: accent,
            transition: "width 180ms ease",
          }}
        />
      </div>
    </div>
  );
}

const BOARD_STATUS_BUBBLES: { id: string; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "blocked", label: "Blocked" },
  { id: "carried", label: "Carry over" },
  { id: "done", label: "Done" },
];

/** Task IDs referenced in plan notes (e.g. T-003, T-LG-airbnb). */
function taskIdsInText(text: string): string[] {
  const matches = text.match(/\bT-(?:LG-[\w-]+|SENIOR-PAGE|\d{3})\b/g) ?? [];
  return [...new Set(matches)];
}

function planFileKey(planItemId: string): string {
  return `plan:${planItemId}`;
}

function PlanItemAttachments({
  item,
  onChange,
}: {
  item: PlanItem;
  onChange: (attachments: PlanItemAttachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    try {
      const next = [...(item.attachments ?? [])];
      for (const file of Array.from(files)) {
        if (!isAcceptedAttachment(file)) {
          setError(`Skipped unsupported file: ${file.name}`);
          continue;
        }
        const id = newFileId();
        const addedAt = todayMMDDYY();
        await putTaskFile({
          taskId: planFileKey(item.id),
          fileId: id,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          blob: file,
          addedAt,
        });
        next.push({
          id,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          storedId: id,
          addedAt,
        });
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openOrDownload = async (att: PlanItemAttachment) => {
    const rec = await getTaskFile(planFileKey(item.id), att.storedId);
    if (!rec) {
      alert("File not found in this browser. File metadata is saved, but the blob is local until R2 is wired.");
      return;
    }
    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.name;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const remove = async (att: PlanItemAttachment) => {
    await deleteTaskFile(planFileKey(item.id), att.storedId);
    onChange((item.attachments ?? []).filter((a) => a.id !== att.id));
  };

  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "5px 10px", fontSize: "0.78rem" }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Upload size={13} /> : <Paperclip size={13} />}
          {uploading ? "Uploading..." : "Attach document"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTACHMENTS}
          style={{ display: "none" }}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          PDF, Word, images, video, txt, csv
        </span>
      </div>
      {error && <div style={{ fontSize: "0.75rem", color: "#9B2F28" }}>{error}</div>}
      {(item.attachments ?? []).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(item.attachments ?? []).map((att) => (
            <div
              key={att.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 9px",
                borderRadius: 8,
                background: "rgba(148,125,100,0.08)",
                border: "1px solid rgba(148,125,100,0.2)",
              }}
            >
              <FileText size={18} style={{ color: "var(--bronze)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  title={att.name}
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--charcoal)",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {att.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {formatFileSize(att.size)} · {att.mimeType || "file"} · {att.addedAt}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                onClick={() => void openOrDownload(att)}
                title="Download / open"
              >
                <Download size={13} />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#9B2F28" }}
                onClick={() => void remove(att)}
                title="Remove"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type SchedulePageProps = {
  onOpenTask?: (taskId: string) => void;
  onOpenTest?: (testId: string) => void;
};

export function SchedulePage({ onOpenTask, onOpenTest }: SchedulePageProps = {}) {
  const [tab, setTab] = useState<ScheduleTab>("board");
  const [activeSprint, setActiveSprint] = useState<number | "backlog">(0);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [tasks, setTasks] = useState<GyshTask[]>([]);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [testNotes, setTestNotes] = useState<Record<string, string>>({});
  const [testAssignees, setTestAssignees] = useState<Record<string, string>>({});
  const [testSprints, setTestSprints] = useState<Record<string, number>>({});
  const [retro, setRetro] = useState<RetroCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newOwner, setNewOwner] = useState<PlanOwner>("Unassigned");
  const [sourceFilter, setSourceFilter] = useState<"all" | "plan" | "task" | "test">("all");
  const [ownerFilter, setOwnerFilter] = useState<BoardOwnerFilter>("all");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(() => new Set());
  const [drafts, setDrafts] = useState<Record<string, CardDraft>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkSprint, setBulkSprint] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [saveFlash, setSaveFlash] = useState("");
  const [retroDraft, setRetroDraft] = useState<Record<RetroColumn, string>>({
    went_well: "",
    improve: "",
    action: "",
  });

  const sprints = useMemo(() => listUpcomingSprints(), []);
  const sprint0 = useMemo(() => getSprintWindow(0), []);
  const selectedSprintIndex = activeSprint === "backlog" ? 0 : activeSprint;
  const ceremonies = useMemo(
    () => ceremoniesForSprint(getSprintWindow(selectedSprintIndex)),
    [selectedSprintIndex],
  );

  const boardCards = useMemo(() => {
    const planCards = items.map(planToBoardCard);
    const taskCards = tasks.map(taskToBoardCard);
    const testCards = ALL_TESTS.map((t) =>
      testToBoardCard(t, testStatuses[t.id], testSprints[t.id], testAssignees[t.id]),
    );
    return [...planCards, ...taskCards, ...testCards];
  }, [items, tasks, testStatuses, testSprints, testAssignees]);

  const cardsInSprint = (sprint: number) =>
    boardCards.filter((c) => c.sprint === sprint);

  const sprintScopedCards = boardCards.filter((c) => {
    if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
    if (activeSprint === "backlog") return c.sprint === BACKLOG_SPRINT;
    return c.sprint === activeSprint;
  });

  const visibleCards = sprintScopedCards.filter(
    (c) =>
      cardMatchesOwner(c, ownerFilter) &&
      (statusFilters.size === 0 || statusFilters.has(c.status)),
  );

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [planData, taskList, testData] = await Promise.all([
        fetchAgilePlan(),
        fetchTasks(),
        fetchTestStatuses(),
      ]);

      let planItems = planData.items;
      if (planItems.length === 0) {
        planItems = buildDefaultPlanItems();
        try {
          const saved = await persistAgilePlan(planItems, planData.retro);
          planItems = saved.items;
          setRetro(saved.retro);
        } catch {
          setRetro(planData.retro);
        }
      } else {
        setRetro(planData.retro);
      }
      // Read-only load — do not rewrite task/plan sprints on open (that wiped concurrent edits).
      // Use "Apply suggested sprint schedule" for intentional bulk placement.
      setItems(planItems);
      setTasks(taskList);

      setTestStatuses(testData.statuses);
      setTestNotes(testData.notes);
      setTestAssignees(testData.assignees);
      // Prefer schedule suggestions for any test not yet persisted
      const nextSprints: Record<string, number> = { ...testData.sprints };
      for (const t of ALL_TESTS) {
        if (nextSprints[t.id] === undefined) {
          nextSprints[t.id] = testToBoardCard(t, testData.statuses[t.id], undefined).sprint;
        }
      }
      setTestSprints(nextSprints);
    } catch (e) {
      setItems(buildDefaultPlanItems());
      setTasks([]);
      setRetro([]);
      setError(
        e instanceof ApiError
          ? e.message
          : "Failed to load sprint board. Showing local seed where possible.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const persistPlan = async (nextItems: PlanItem[], nextRetro: RetroCard[]) => {
    setBusy(true);
    setError("");
    try {
      const saved = await persistAgilePlan(nextItems, nextRetro);
      setItems(saved.items);
      setRetro(saved.retro);
    } catch (e) {
      // Keep prior D1-backed state — do not pretend a failed save succeeded.
      setError(e instanceof ApiError ? e.message : "Could not save plan items.");
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const patchPlanAttachments = async (
    id: string,
    attachments: PlanItemAttachment[],
  ) => {
    const next = items.map((i) => (i.id === id ? { ...i, attachments } : i));
    await persistPlan(next, retro);
  };

  const togglePartnerDone = async (
    card: BoardCard,
    partner: "tina" | "evelyn",
  ) => {
    setBusy(true);
    setError("");
    try {
      if (card.source === "plan") {
        const item = items.find((i) => i.id === card.sourceId);
        if (!item) return;
        const patch =
          partner === "tina"
            ? { tinaDone: !item.tinaDone }
            : { evelynDone: !item.evelynDone };
        const next = items.map((i) =>
          i.id === card.sourceId ? applyPlanPartnerDone(i, patch) : i,
        );
        await persistPlan(next, retro);
      } else if (card.source === "task") {
        const task = tasks.find((t) => t.id === card.sourceId);
        if (!task) return;
        const patch =
          partner === "tina"
            ? { tinaDone: !task.tinaDone }
            : { evelynDone: !task.evelynDone };
        const next = tasks.map((t) =>
          t.id === card.sourceId ? applyPartnerDone(t, patch) : t,
        );
        setTasks(await persistTasks(next));
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update partner done.");
    } finally {
      setBusy(false);
    }
  };

  const cardAssigneeValue = (card: BoardCard): string => {
    const draft = drafts[card.key]?.assignee;
    if (draft !== undefined) return draft;
    if (card.source === "test") {
      return testAssignees[card.sourceId] || TEST_DEFAULT_ASSIGNEES[card.sourceId] || "";
    }
    return card.owner;
  };

  const cardStatusValue = (card: BoardCard): string => {
    const draft = drafts[card.key]?.status;
    if (draft !== undefined) return draft;
    if (card.source === "test") return testStatuses[card.sourceId] ?? "not_run";
    if (card.source === "task") {
      if (card.status === "todo") return "not_started";
      if (card.status === "blocked") return "blocked";
      if (card.status === "done") return "done";
      return "in_progress";
    }
    return card.status;
  };

  const cardSprintValue = (card: BoardCard): number => {
    const draft = drafts[card.key]?.sprint;
    if (draft !== undefined) return draft;
    return card.sprint;
  };

  const cardNoteValue = (card: BoardCard): string => {
    if (card.source !== "test") return "";
    return drafts[card.key]?.note ?? testNotes[card.sourceId] ?? "";
  };

  const isCardDirty = (key: string) => {
    const d = drafts[key];
    if (!d) return false;
    return (
      d.assignee !== undefined ||
      d.status !== undefined ||
      d.sprint !== undefined ||
      d.note !== undefined
    );
  };

  const patchDraft = (key: string, patch: CardDraft) => {
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  /** Stage a field change and persist to D1 immediately so everyone's edits stick. */
  const patchDraftAndSave = (card: BoardCard, patch: CardDraft) => {
    setDrafts((prev) => ({
      ...prev,
      [card.key]: { ...prev[card.key], ...patch },
    }));
    void saveCard(card, patch);
  };

  const clearDraft = (key: string) => {
    setDrafts((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const dirtyCount = Object.keys(drafts).length;

  const toggleSelectCard = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedKeys((prev) => {
      const allSelected =
        visibleCards.length > 0 && visibleCards.every((c) => prev.has(c.key));
      if (allSelected) return new Set();
      return new Set(visibleCards.map((c) => c.key));
    });
  };

  const saveCard = async (card: BoardCard, draftOverride?: CardDraft): Promise<boolean> => {
    const draft = { ...(drafts[card.key] ?? {}), ...(draftOverride ?? {}) };
    const status = draft.status !== undefined ? draft.status : cardStatusValue(card);
    const sprint = draft.sprint !== undefined ? draft.sprint : cardSprintValue(card);
    const note = draft.note !== undefined ? draft.note : cardNoteValue(card);
    const requestedAssignee =
      draft.assignee !== undefined ? draft.assignee : cardAssigneeValue(card);
    // Automated suite owners stay locked — never overwrite with a human tester.
    const assignee =
      card.source === "test" && isAutomatedTestId(card.sourceId)
        ? TEST_DEFAULT_ASSIGNEES[card.sourceId] ||
          (card.sourceId.startsWith("PW-") ? "playwright" : "vitest")
        : requestedAssignee;

    setBusy(true);
    setError("");
    try {
      if (card.source === "plan") {
        const item = items.find((i) => i.id === card.sourceId);
        if (!item) return false;
        if (item.owner === "Both" || assignee === "Both") {
          const tinaDone = item.tinaDone;
          const evelynDone = item.evelynDone;
          if (status === "done" && !(tinaDone && evelynDone) && item.owner === "Both") {
            setError("Both T + E must mark Done before this plan item can be Done.");
            return false;
          }
        }
        const sw = sprint === BACKLOG_SPRINT ? null : getSprintWindow(sprint);
        const next = items.map((i) =>
          i.id === card.sourceId
            ? applyPlanPartnerDone(
                {
                  ...i,
                  owner: assignee as PlanOwner,
                  sprint,
                  dateLabel: sw ? sw.label : "Backlog",
                  date: sw ? sw.start.toISOString().slice(0, 10) : "",
                },
                { status: status as PlanItemStatus },
              )
            : i,
        );
        await persistPlan(next, retro);
      } else if (card.source === "task") {
        const task = tasks.find((t) => t.id === card.sourceId);
        if (!task) return false;
        if (
          (assignee === "Both" || task.assignedTo === "Both") &&
          status === "done" &&
          !(task.tinaDone && task.evelynDone) &&
          (assignee === "Both" || task.assignedTo === "Both")
        ) {
          setError("Both T + E must mark Done before this task can be Done.");
          return false;
        }
        const next = tasks.map((t) =>
          t.id === card.sourceId
            ? applyPartnerDone(
                { ...t, assignedTo: assignee as GyshTask["assignedTo"], sprint },
                { status: status as TaskStatus },
              )
            : t,
        );
        setTasks(await persistTasks(next));
      } else {
        const st = status as TestStatus;
        if (statusRequiresNote(st) && !noteMeetsRequirement(note)) {
          setError(
            `Add a short note on the card (or in Testing Portal) before marking ${TEST_STATUS_LABELS[st]}.`,
          );
          return false;
        }
        const data = await saveTestStatus(card.sourceId, st, note.trim(), assignee, sprint);
        setTestStatuses(data.statuses);
        setTestNotes(data.notes);
        setTestAssignees({ ...testAssignees, ...data.assignees, [card.sourceId]: assignee });
        setTestSprints({ ...testSprints, ...data.sprints, [card.sourceId]: sprint });
      }
      clearDraft(card.key);
      setSaveFlash(`Saved ${card.sourceId}`);
      window.setTimeout(() => setSaveFlash(""), 2000);
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save card.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const persistDraftMap = async (draftMap: Record<string, CardDraft>) => {
    const dirtyCards = boardCards.filter((c) => {
      const d = draftMap[c.key];
      return (
        !!d &&
        (d.assignee !== undefined ||
          d.status !== undefined ||
          d.sprint !== undefined ||
          d.note !== undefined)
      );
    });
    if (dirtyCards.length === 0) {
      setSaveFlash("Nothing to save");
      window.setTimeout(() => setSaveFlash(""), 2000);
      return;
    }

    setBusy(true);
    setError("");
    try {
      let nextItems = items;
      let nextTasks = tasks;
      let planChanged = false;
      let tasksChanged = false;
      let nextAssignees = { ...testAssignees };
      let nextSprints = { ...testSprints };
      const testBatch: Array<{
        caseId: string;
        status: TestStatus;
        note?: string;
        assignee?: string;
        sprint?: number;
      }> = [];

      for (const card of dirtyCards) {
        const draft = draftMap[card.key] ?? {};
        const assignee =
          draft.assignee !== undefined
            ? draft.assignee
            : card.source === "test"
              ? testAssignees[card.sourceId] || TEST_DEFAULT_ASSIGNEES[card.sourceId] || ""
              : card.owner;
        const status =
          draft.status !== undefined
            ? draft.status
            : card.source === "test"
              ? (testStatuses[card.sourceId] ?? "not_run")
              : card.source === "task"
                ? card.status === "todo"
                  ? "not_started"
                  : card.status === "blocked"
                    ? "blocked"
                    : card.status === "done"
                      ? "done"
                      : "in_progress"
                : card.status;
        const sprint = draft.sprint !== undefined ? draft.sprint : card.sprint;
        const note =
          draft.note !== undefined ? draft.note : (testNotes[card.sourceId] ?? "");

        if (card.source === "plan") {
          const sw = sprint === BACKLOG_SPRINT ? null : getSprintWindow(sprint);
          nextItems = nextItems.map((i) =>
            i.id === card.sourceId
              ? applyPlanPartnerDone(
                  {
                    ...i,
                    owner: assignee as PlanOwner,
                    sprint,
                    dateLabel: sw ? sw.label : "Backlog",
                    date: sw ? sw.start.toISOString().slice(0, 10) : "",
                  },
                  { status: status as PlanItemStatus },
                )
              : i,
          );
          planChanged = true;
        } else if (card.source === "task") {
          nextTasks = nextTasks.map((t) =>
            t.id === card.sourceId
              ? applyPartnerDone(
                  { ...t, assignedTo: assignee as GyshTask["assignedTo"], sprint },
                  { status: status as TaskStatus },
                )
              : t,
          );
          tasksChanged = true;
        } else {
          const st = status as TestStatus;
          if (statusRequiresNote(st) && !noteMeetsRequirement(note)) {
            setError(
              `${card.sourceId}: add a note before marking ${TEST_STATUS_LABELS[st]}.`,
            );
            setBusy(false);
            return;
          }
          testBatch.push({
            caseId: card.sourceId,
            status: st,
            note: note.trim(),
            assignee,
            sprint,
          });
          nextAssignees[card.sourceId] = assignee;
          nextSprints[card.sourceId] = sprint;
        }
      }

      if (planChanged) await persistPlan(nextItems, retro);
      if (tasksChanged) setTasks(await persistTasks(nextTasks));
      if (testBatch.length > 0) {
        const data = await saveTestStatusesBatch(testBatch);
        setTestStatuses(data.statuses);
        setTestNotes(data.notes);
        setTestAssignees({ ...nextAssignees, ...data.assignees });
        setTestSprints({ ...nextSprints, ...data.sprints });
      }

      setDrafts((prev) => {
        const next = { ...prev };
        for (const card of dirtyCards) delete next[card.key];
        return next;
      });
      setSaveFlash(`Saved ${dirtyCards.length} card${dirtyCards.length === 1 ? "" : "s"}`);
      window.setTimeout(() => setSaveFlash(""), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save all changes.");
    } finally {
      setBusy(false);
    }
  };

  const saveAllDirty = async () => {
    await persistDraftMap(drafts);
  };

  const applyBulkToSelected = (andSave: boolean) => {
    if (selectedKeys.size === 0) {
      setError("Select one or more cards first.");
      return;
    }
    if (!bulkAssignee && bulkSprint === "" && !bulkStatus) {
      setError("Choose a bulk Assignee, Sprint, and/or Status.");
      return;
    }

    const nextDrafts: Record<string, CardDraft> = { ...drafts };
    let changed = 0;
    for (const card of boardCards) {
      if (!selectedKeys.has(card.key)) continue;
      const mapped: CardDraft = { ...nextDrafts[card.key] };
      if (bulkSprint !== "") mapped.sprint = Number(bulkSprint);
      if (bulkAssignee) {
        const a = bulkAssigneeForSource(card.source, bulkAssignee);
        if (a) mapped.assignee = a;
      }
      if (bulkStatus) {
        const s = mapBulkStatusToSource(card.source, bulkStatus);
        if (s) mapped.status = s;
      }
      nextDrafts[card.key] = mapped;
      changed += 1;
    }
    setDrafts(nextDrafts);
    setError("");

    if (andSave) {
      void persistDraftMap(nextDrafts);
    } else {
      setSaveFlash(`Bulk edits staged on ${changed} card(s) — click Save or Save all`);
      window.setTimeout(() => setSaveFlash(""), 2500);
    }
  };

  const addBacklogItem = async () => {
    if (!newTitle.trim()) return;
    const item: PlanItem = {
      id: newPlanItemId(),
      title: newTitle.trim(),
      notes: "",
      owner: newOwner,
      kind: "rollout",
      sprint: activeSprint === "backlog" ? BACKLOG_SPRINT : activeSprint,
      status: "todo",
      date: "",
      dateLabel: activeSprint === "backlog" ? "Backlog" : sprintLabel(activeSprint),
    };
    setNewTitle("");
    await persistPlan([item, ...items], retro);
  };

  const carryIncomplete = async () => {
    if (activeSprint === "backlog") return;
    const nextSprint = activeSprint + 1;
    const nextPlan = items.map((i) => {
      if (i.sprint !== activeSprint || i.status === "done") return i;
      return { ...i, sprint: nextSprint, status: "carried" as PlanItemStatus, dateLabel: sprintLabel(nextSprint) };
    });
    const nextTasks = tasks.map((t) => {
      if (t.sprint !== activeSprint || t.status === "done") return t;
      return { ...t, sprint: nextSprint, status: t.status === "not_started" ? "in_progress" : t.status };
    });
    setBusy(true);
    try {
      await persistPlan(nextPlan, retro);
      setTasks(await persistTasks(nextTasks));
      // Move incomplete tests in this sprint forward (best-effort for rows we can write)
      for (const t of ALL_TESTS) {
        const sprint = testSprints[t.id] ?? testToBoardCard(t, testStatuses[t.id], undefined).sprint;
        const st = testStatuses[t.id] ?? "not_run";
        if (sprint !== activeSprint || st === "pass") continue;
        try {
          const data = await saveTestStatus(
            t.id,
            st === "not_run" ? "in_progress" : st,
            testNotes[t.id] ?? "",
            testAssignees[t.id] || TEST_DEFAULT_ASSIGNEES[t.id] || "",
            nextSprint,
          );
          setTestSprints((prev) => ({ ...prev, ...data.sprints, [t.id]: nextSprint }));
          setTestStatuses(data.statuses);
        } catch {
          setTestSprints((prev) => ({ ...prev, [t.id]: nextSprint }));
        }
      }
      setActiveSprint(nextSprint);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Carry-over failed.");
    } finally {
      setBusy(false);
    }
  };

  /** Commit the full implementation schedule: backlog → themed sprints. */
  const applySprintSchedule = async () => {
    setBusy(true);
    setError("");
    try {
      const planNext = commitPlanSprintPlan(items);
      const taskNext = commitTaskSprintPlan(tasks);
      const testNext = commitTestSprintPlan(ALL_TESTS, testSprints);

      if (planNext.changed) {
        await persistPlan(planNext.items, retro);
      }
      if (taskNext.changed) {
        setTasks(await persistTasks(taskNext.tasks));
      }
      setTestSprints(testNext.sprints);

      // Persist sprint for every changed test — including not_run (Lyriq owns hundreds of wizard cases).
      // Batch write so the board stays usable (sequential PUTs used to lock status selects for minutes).
      if (testNext.changedIds.length > 0) {
        const data = await saveTestStatusesBatch(
          testNext.changedIds.map((id) => {
            const st = testStatuses[id] ?? "not_run";
            return {
              caseId: id,
              status: st,
              note: testNotes[id] ?? "",
              assignee: testAssignees[id] || TEST_DEFAULT_ASSIGNEES[id] || "",
              sprint: testNext.sprints[id]!,
            };
          }),
        );
        setTestStatuses(data.statuses);
        setTestNotes(data.notes);
        setTestAssignees((prev) => ({ ...prev, ...data.assignees }));
        setTestSprints((prev) => ({ ...prev, ...data.sprints }));
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not apply sprint schedule.");
    } finally {
      setBusy(false);
    }
  };

  const addRetroCard = async (column: RetroColumn) => {
    const text = retroDraft[column].trim();
    if (!text || activeSprint === "backlog") return;
    const card: RetroCard = {
      id: newRetroCardId(),
      sprint: activeSprint,
      column,
      text,
      owner: "Both",
    };
    setRetroDraft((d) => ({ ...d, [column]: "" }));
    await persistPlan(items, [...retro, card]);
  };

  const removeRetroCard = async (id: string) => {
    await persistPlan(
      items,
      retro.filter((c) => c.id !== id),
    );
  };

  const retroForSprint =
    activeSprint === "backlog" ? [] : retro.filter((c) => c.sprint === activeSprint);

  const backlogCount = cardsInSprint(BACKLOG_SPRINT).length;
  const activeTheme =
    activeSprint === "backlog" ? undefined : themeForSprint(activeSprint);
  const activeSprintCards =
    activeSprint === "backlog" ? [] : cardsInSprint(activeSprint);
  const overallDone = activeSprintCards.filter(isDone).length;
  const assigneeProgress = [
    { label: "Tina", accent: "#9B2F28" },
    { label: "Evelyn", accent: "#947D64" },
    { label: "Lyriq", accent: "#2e7d32" },
    { label: "Unassigned", accent: "#7a7064" },
  ].map(({ label, accent }) => {
    const cards = activeSprintCards.filter((card) => {
      if (label === "Unassigned") return card.owner === "Unassigned";
      if (label === "Tina" || label === "Evelyn") {
        return card.owner === label || card.owner === "Both";
      }
      return card.owner === label;
    });
    return {
      label,
      accent,
      done: cards.filter(isDone).length,
      total: cards.length,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        className="glass"
        style={{
          padding: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(215,198,151,0.55), #fff)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                color: "var(--charcoal)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CalendarDays size={22} style={{ color: "var(--bronze)" }} /> Schedule &amp;
              Implementation Plan
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 6 }}>
              Sprint board includes <strong>every task</strong> and <strong>every test</strong> plus
              plan milestones. Backlog is scheduled into themed sprints (Tue–Mon) via the
              implementation plan.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
              {sprint0.label}: {sprint0.rangeLabel} · Board cards: {boardCards.length} (plan{" "}
              {items.length} · tasks {tasks.length} · tests {ALL_TESTS.length})
            </p>
            {activeTheme && (
              <p style={{ color: "var(--charcoal)", fontSize: "0.9rem", marginTop: 10, fontWeight: 600 }}>
                {sprintLabel(activeTheme.index)} · {activeTheme.theme}
                <span style={{ display: "block", fontWeight: 400, color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: 2 }}>
                  {activeTheme.goal}
                </span>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "start" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void applySprintSchedule()}
              disabled={loading || busy}
              title="Assign items into themed sprints (soft launch by end of Sprint 2)"
            >
              Apply sprint schedule
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void reload()}
              disabled={loading || busy}
            >
              <RotateCcw size={14} /> Reload
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(155,47,40,0.1)",
              border: "1px solid rgba(155,47,40,0.35)",
              color: "#9B2F28",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {(
            [
              ["board", "Sprint board", <ClipboardList key="b" size={14} />],
              ["ceremonies", "Ceremonies", <Users key="c" size={14} />],
              ["retro", "Retrospective board", <MessageSquare key="r" size={14} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              className={`nav-link-btn ${tab === id ? "active" : ""}`}
              style={{ borderRadius: 10 }}
              onClick={() => setTab(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      <SprintStatusBars boardCards={boardCards} />

      <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          Sprints &amp; backlog
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            className="qa-tester-bubble"
            data-active={activeSprint === "backlog" ? "true" : "false"}
            onClick={() => setActiveSprint("backlog")}
          >
            Backlog
            <span className="qa-tester-meta">· {backlogCount}</span>
          </button>
          {sprints.map((s) => {
            const cards = cardsInSprint(s.index);
            const done = cards.filter((c) => c.status === "done").length;
            const theme = themeForSprint(s.index);
            return (
              <button
                key={s.index}
                type="button"
                className="qa-tester-bubble"
                data-active={activeSprint === s.index ? "true" : "false"}
                onClick={() => setActiveSprint(s.index)}
                title={theme ? `${s.rangeLabel} — ${theme.theme}` : s.rangeLabel}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  padding: "8px 12px",
                  minWidth: 140,
                }}
              >
                <span style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong>{s.label}</strong>
                  <span className="qa-tester-meta">
                    · {done}/{cards.length}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    lineHeight: 1.25,
                  }}
                >
                  {s.rangeLabel}
                </span>
              </button>
            );
          })}
        </div>
        {activeSprint !== "backlog" && activeTheme && (
          <p style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--charcoal)" }}>
              {sprintLabel(activeSprint)} · {getSprintWindow(activeSprint).rangeLabel}
            </strong>
            {" — "}
            {activeTheme.theme}. {activeTheme.goal}
          </p>
        )}
      </div>

      {activeSprint !== "backlog" && (
        <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "baseline",
              marginBottom: 14,
            }}
          >
            <div>
              <strong style={{ color: "var(--charcoal)" }}>
                {sprintLabel(activeSprint)} progress
              </strong>
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginLeft: 8 }}>
                Shared “Both” items count toward T + E
              </span>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              {getSprintWindow(activeSprint).rangeLabel}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            <ProgressMeter
              label="Overall sprint"
              done={overallDone}
              total={activeSprintCards.length}
              accent="#5f7a45"
            />
            {assigneeProgress.map((row) => (
              <ProgressMeter key={row.label} {...row} />
            ))}
          </div>
        </div>
      )}

      {tab === "board" && (
        <>
          <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px", minWidth: 220 }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 8,
                  }}
                >
                  Owners — click to filter
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {OWNER_BUBBLES.map((b) => {
                    const active = ownerFilter === b.id;
                    const matched = sprintScopedCards.filter((c) => cardMatchesOwner(c, b.id));
                    const done = matched.filter((c) => c.status === "done").length;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className="qa-tester-bubble"
                        data-active={active ? "true" : "false"}
                        onClick={() => setOwnerFilter(b.id)}
                        title={
                          b.id === "all"
                            ? `${matched.length} items · ${done} done`
                            : `${matched.length} owned by ${b.label} · ${done} done`
                        }
                        style={{
                          borderColor: active && b.accent ? b.accent : undefined,
                          boxShadow: active && b.accent ? `0 0 0 1px ${b.accent}` : undefined,
                        }}
                      >
                        {b.accent && <span className="qa-tester-dot" style={{ background: b.accent }} />}
                        {b.label}
                        <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {done}✓ / {matched.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: "1 1 280px", minWidth: 220 }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 8,
                  }}
                >
                  Status — click to filter (multi)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    className="qa-tester-bubble"
                    data-active={statusFilters.size === 0 ? "true" : "false"}
                    onClick={() => setStatusFilters(new Set())}
                  >
                    All statuses
                  </button>
                  {BOARD_STATUS_BUBBLES.map((s) => {
                    const active = statusFilters.has(s.id);
                    const count = sprintScopedCards.filter((c) => c.status === s.id).length;
                    const accent = STATUS_COLORS[s.id] || "#947D64";
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className="qa-tester-bubble"
                        data-active={active ? "true" : "false"}
                        onClick={() => toggleStatusFilter(s.id)}
                        style={{
                          borderColor: active ? accent : undefined,
                          boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                        }}
                      >
                        <span className="qa-tester-dot" style={{ background: accent }} />
                        {s.label}
                        <span className="qa-tester-meta">· {count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0, flex: "1 1 240px" }}>
                <label className="form-label">
                  Add plan item to {activeSprint === "backlog" ? "Backlog" : sprintLabel(activeSprint)}
                </label>
                <input
                  className="text-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Implementation milestone…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void addBacklogItem();
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0, width: 130 }}>
                <label className="form-label">Assignee</label>
                <select
                  className="select-input"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value as PlanOwner)}
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Tina">Tina</option>
                  <option value="Evelyn">Evelyn</option>
                  <option value="Lyriq">Lyriq</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, width: 140 }}>
                <label className="form-label">Show</label>
                <select
                  className="select-input"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
                >
                  <option value="all">All types</option>
                  <option value="plan">Plan only</option>
                  <option value="task">Tasks only</option>
                  <option value="test">Tests only</option>
                </select>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void addBacklogItem()}
                disabled={busy || !newTitle.trim()}
              >
                <Plus size={14} /> Add
              </button>
              {activeSprint !== "backlog" && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void carryIncomplete()}
                  disabled={busy}
                  title="Move incomplete plan/tasks/tests to the next sprint"
                >
                  Carry incomplete → Sprint {activeSprint + 1}
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void saveAllDirty()}
                disabled={busy || dirtyCount === 0}
                data-testid="sprint-board-save-all"
                title="Save all unsaved card edits"
              >
                <Save size={14} /> Save all{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
              </button>
            </div>
            {saveFlash && (
              <p style={{ marginTop: 10, color: "#2e7d32", fontSize: "0.85rem", fontWeight: 600 }}>
                {saveFlash}
              </p>
            )}
            {loading && (
              <p style={{ marginTop: 10, color: "var(--text-muted)" }}>Loading sprint board…</p>
            )}
          </div>

          <div
            className="glass sprint-board-bulk"
            data-testid="sprint-board-bulk"
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(155,47,40,0.2)",
              background: "linear-gradient(135deg, rgba(215,198,151,0.35), #fff)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "end",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "8px 12px" }}
                onClick={toggleSelectAllVisible}
                disabled={busy || visibleCards.length === 0}
              >
                {visibleCards.length > 0 && visibleCards.every((c) => selectedKeys.has(c.key)) ? (
                  <>
                    <CheckSquare size={14} /> Clear selection
                  </>
                ) : (
                  <>
                    <Square size={14} /> Select visible
                  </>
                )}
              </button>
              <span style={{ fontSize: "0.82rem", color: "var(--charcoal)", fontWeight: 700 }}>
                Bulk edit · {selectedKeys.size} selected
              </span>
              <div className="form-group" style={{ margin: 0, minWidth: 140 }}>
                <label className="form-label">Assignee</label>
                <select
                  className="select-input"
                  value={bulkAssignee}
                  onChange={(e) => setBulkAssignee(e.target.value)}
                  disabled={busy}
                >
                  <option value="">— keep —</option>
                  <option value="Tina">Tina</option>
                  <option value="Evelyn">Evelyn</option>
                  <option value="Lyriq">Lyriq</option>
                  <option value="Both">Both (plan/task)</option>
                  <option value="Unassigned">Unassigned (plan)</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: 150 }}>
                <label className="form-label">Sprint</label>
                <select
                  className="select-input"
                  value={bulkSprint}
                  onChange={(e) => setBulkSprint(e.target.value)}
                  disabled={busy}
                >
                  <option value="">— keep —</option>
                  <option value={BACKLOG_SPRINT}>Backlog</option>
                  {sprints.map((s) => (
                    <option key={s.index} value={s.index}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: 160 }}>
                <label className="form-label">Status</label>
                <select
                  className="select-input"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  disabled={busy}
                >
                  <option value="">— keep —</option>
                  {BULK_STATUS_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                disabled={busy || selectedKeys.size === 0}
                onClick={() => applyBulkToSelected(false)}
              >
                Apply to selected
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || selectedKeys.size === 0}
                onClick={() => applyBulkToSelected(true)}
              >
                <Save size={14} /> Apply &amp; save selected
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleCards.map((card) => {
              const linkedTaskIds =
                card.source === "task"
                  ? [card.sourceId]
                  : card.source === "plan"
                    ? taskIdsInText(`${card.title} ${card.notes}`)
                    : [];
              const linkedTestId = card.source === "test" ? card.sourceId : null;
              const dirty = isCardDirty(card.key);
              const selected = selectedKeys.has(card.key);
              const statusVal = cardStatusValue(card);
              const sprintVal = cardSprintValue(card);
              const assigneeVal = cardAssigneeValue(card);
              const noteVal = cardNoteValue(card);

              return (
              <div
                key={card.key}
                className="glass"
                data-dirty={dirty ? "true" : "false"}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  borderLeft: `4px solid ${STATUS_COLORS[card.status] || "#947D64"}`,
                  background: dirty ? "rgba(215,198,151,0.18)" : "#fff",
                  outline: selected ? "2px solid var(--bronze)" : undefined,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <label
                    style={{ display: "flex", alignItems: "center", paddingTop: 4, cursor: "pointer" }}
                    title="Select for bulk edit"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelectCard(card.key)}
                      aria-label={`Select ${card.title}`}
                    />
                  </label>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "#fff",
                          background: card.kindColor,
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {card.kindLabel}
                      </span>
                      {dirty && (
                        <span
                          className="glow-badge amber"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Unsaved
                        </span>
                      )}
                      <strong style={{ color: "var(--charcoal)" }}>{card.title}</strong>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: card.owner === "Unassigned" ? "#9B2F28" : "var(--text-muted)",
                          fontWeight: card.owner === "Unassigned" ? 700 : 500,
                        }}
                      >
                        Assignee: {card.owner}
                      </span>
                    </div>
                    {card.notes && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.45,
                        }}
                      >
                        {card.notes}
                      </p>
                    )}
                    {(linkedTaskIds.length > 0 || linkedTestId) && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginTop: 8,
                          alignItems: "center",
                        }}
                      >
                        {linkedTaskIds.map((tid) => (
                          <button
                            key={tid}
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                            onClick={() => onOpenTask?.(tid)}
                            disabled={!onOpenTask}
                            title={`Open ${tid} in Task List`}
                          >
                            <ExternalLink size={12} /> Task {tid}
                          </button>
                        ))}
                        {linkedTestId && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                            onClick={() => onOpenTest?.(linkedTestId)}
                            disabled={!onOpenTest}
                            title={`Open ${linkedTestId} in Testing Portal`}
                          >
                            <ExternalLink size={12} /> Test {linkedTestId}
                          </button>
                        )}
                      </div>
                    )}

                    <div
                      className="sprint-card-controls"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr)",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "88px minmax(0, 1fr)",
                          gap: 10,
                          alignItems: "center",
                          fontSize: "0.78rem",
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        Assignee
                        {card.source === "plan" && (
                          <select
                            className="select-input"
                            aria-label={`Assignee for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={assigneeVal}
                            onChange={(e) =>
                              patchDraftAndSave(card, { assignee: e.target.value })
                            }
                            disabled={busy}
                          >
                            {PLAN_ASSIGNEES.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        )}
                        {card.source === "task" && (
                          <select
                            className="select-input"
                            aria-label={`Assignee for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={assigneeVal}
                            onChange={(e) =>
                              patchDraftAndSave(card, { assignee: e.target.value })
                            }
                            disabled={busy}
                          >
                            {TASK_ASSIGNEES.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        )}
                        {card.source === "test" &&
                          (isAutomatedTestId(card.sourceId) ? (
                            <select
                              className="select-input"
                              aria-label={`Assignee for ${card.title}`}
                              style={{ width: "100%", minWidth: 0 }}
                              value={assigneeVal || TEST_DEFAULT_ASSIGNEES[card.sourceId] || "vitest"}
                              disabled
                              title="Automated suite owner — locked"
                            >
                              {AUTOMATED_SUITE_OWNERS.map((owner) => (
                                <option key={owner.id} value={owner.id}>
                                  {owner.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              className="select-input"
                              aria-label={`Assignee for ${card.title}`}
                              style={{ width: "100%", minWidth: 0 }}
                              value={assigneeVal}
                              onChange={(e) =>
                                patchDraftAndSave(card, { assignee: e.target.value })
                              }
                              disabled={busy}
                            >
                              {QA_TESTERS.map((tester) => (
                                <option key={tester.id} value={tester.id}>
                                  {tester.shortName}
                                </option>
                              ))}
                            </select>
                          ))}
                      </label>

                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "88px minmax(0, 1fr)",
                          gap: 10,
                          alignItems: "center",
                          fontSize: "0.78rem",
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        Status
                        {card.source === "plan" && (
                          <select
                            className="select-input"
                            aria-label={`Status for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={statusVal}
                            onChange={(e) =>
                              patchDraftAndSave(card, { status: e.target.value })
                            }
                            disabled={busy}
                          >
                            {(Object.keys(STATUS_LABELS) as PlanItemStatus[]).map((s) => {
                              const plan = items.find((i) => i.id === card.sourceId);
                              const bothBlocked =
                                plan?.owner === "Both" &&
                                s === "done" &&
                                !(plan.tinaDone && plan.evelynDone);
                              return (
                                <option key={s} value={s} disabled={bothBlocked}>
                                  {STATUS_LABELS[s]}
                                </option>
                              );
                            })}
                          </select>
                        )}
                        {card.source === "task" && (
                          <select
                            className="select-input"
                            aria-label={`Status for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={statusVal}
                            onChange={(e) =>
                              patchDraftAndSave(card, { status: e.target.value })
                            }
                            disabled={busy}
                          >
                            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => {
                              const task = tasks.find((t) => t.id === card.sourceId);
                              const bothBlocked =
                                task?.assignedTo === "Both" &&
                                s === "done" &&
                                !(task.tinaDone && task.evelynDone);
                              return (
                                <option key={s} value={s} disabled={bothBlocked}>
                                  {TASK_STATUS_LABELS[s]}
                                </option>
                              );
                            })}
                          </select>
                        )}
                        {card.source === "test" && (
                          <select
                            className="select-input"
                            aria-label={`Status for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={statusVal}
                            onChange={(e) =>
                              patchDraftAndSave(card, { status: e.target.value })
                            }
                            disabled={busy}
                          >
                            {(Object.keys(TEST_STATUS_LABELS) as TestStatus[]).map((s) => (
                              <option key={s} value={s}>
                                {TEST_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        )}
                      </label>

                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "88px minmax(0, 1fr) auto",
                          gap: 10,
                          alignItems: "center",
                          fontSize: "0.78rem",
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        Sprint
                        <select
                          className="select-input"
                          style={{ width: "100%", minWidth: 0 }}
                          value={sprintVal}
                          onChange={(e) =>
                            patchDraftAndSave(card, { sprint: Number(e.target.value) })
                          }
                          disabled={busy}
                          aria-label={`Sprint for ${card.title}`}
                        >
                          <option value={BACKLOG_SPRINT}>Backlog</option>
                          {sprints.map((s) => (
                            <option key={s.index} value={s.index}>
                              {s.label} ({s.startLabel}–{s.endLabel.replace(/, \d{4}$/, "")})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: "8px 14px", whiteSpace: "nowrap" }}
                          disabled={busy || !dirty}
                          onClick={() => void saveCard(card)}
                          data-testid={`sprint-card-save-${card.sourceId}`}
                          title={dirty ? "Save this card" : "No unsaved changes"}
                        >
                          <Save size={14} /> Save
                        </button>
                      </label>
                    </div>
                  </div>
                </div>
                {card.source === "test" &&
                  statusRequiresNote(statusVal as TestStatus) && (
                    <div style={{ marginTop: 10 }}>
                      <label className="form-label" htmlFor={`note-${card.sourceId}`}>
                        Note (required for Fail / Blocked)
                      </label>
                      <textarea
                        id={`note-${card.sourceId}`}
                        className="text-input"
                        rows={2}
                        value={noteVal}
                        onChange={(e) => patchDraft(card.key, { note: e.target.value })}
                        placeholder="What failed or what is blocking…"
                        disabled={busy}
                      />
                    </div>
                  )}
                {card.source === "plan" &&
                  (() => {
                    const item = items.find((i) => i.id === card.sourceId);
                    if (!item) return null;
                    return (
                      <PlanItemAttachments
                        item={item}
                        onChange={(attachments) =>
                          void patchPlanAttachments(item.id, attachments)
                        }
                      />
                    );
                  })()}
                {((card.source === "plan" &&
                  items.find((i) => i.id === card.sourceId)?.owner === "Both") ||
                  (card.source === "task" &&
                    tasks.find((t) => t.id === card.sourceId)?.assignedTo === "Both")) && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Partner done (both required):
                    </span>
                    {(() => {
                      const plan = items.find((i) => i.id === card.sourceId);
                      const task = tasks.find((t) => t.id === card.sourceId);
                      const tinaDone =
                        card.source === "plan" ? !!plan?.tinaDone : !!task?.tinaDone;
                      const evelynDone =
                        card.source === "plan" ? !!plan?.evelynDone : !!task?.evelynDone;
                      return (
                        <>
                          <button
                            type="button"
                            className={`btn ${tinaDone ? "btn-primary" : "btn-outline"}`}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.78rem",
                              borderColor: "#9B2F28",
                              background: tinaDone ? "#9B2F28" : undefined,
                              color: tinaDone ? "#fff" : "#9B2F28",
                            }}
                            onClick={() => void togglePartnerDone(card, "tina")}
                            disabled={busy}
                          >
                            Tina {tinaDone ? "✓ Done" : "○ Mark done"}
                          </button>
                          <button
                            type="button"
                            className={`btn ${evelynDone ? "btn-primary" : "btn-outline"}`}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.78rem",
                              borderColor: "#947D64",
                              background: evelynDone ? "#947D64" : undefined,
                              color: evelynDone ? "#fff" : "#947D64",
                            }}
                            onClick={() => void togglePartnerDone(card, "evelyn")}
                            disabled={busy}
                          >
                            Evelyn {evelynDone ? "✓ Done" : "○ Mark done"}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              );
            })}
            {!loading && visibleCards.length === 0 && (
              <div
                className="glass"
                style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}
              >
                {activeSprint === "backlog"
                  ? "Backlog is empty for this filter."
                  : "No items in this sprint for this filter — pull from the Backlog."}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "ceremonies" && (
        <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
          <h3 style={{ fontSize: "1.15rem", color: "var(--charcoal)", marginBottom: 6 }}>
            Ceremonies —{" "}
            {activeSprint === "backlog"
              ? "pick a sprint"
              : `${sprintLabel(activeSprint)} (${getSprintWindow(activeSprint).rangeLabel})`}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 14 }}>
            Standup 3× per week (Tue / Thu / Sat). Planning/Review on Sunday (day before the
            sprint ends) to close Done work and carry incomplete items. Retrospective on Monday
            sprint-end — capture notes on the Retrospective board.
          </p>
          {activeSprint === "backlog" ? (
            <p style={{ color: "var(--text-muted)" }}>Select a sprint above to see its ceremonies.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ceremonies.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                    background: "#fff",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--charcoal)" }}>
                      {c.dateLabel}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.time}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "#fff",
                          background: CEREMONY_COLORS[c.type],
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {CEREMONY_LABELS[c.type]}
                      </span>
                      <strong style={{ color: "var(--charcoal)" }}>{c.title}</strong>
                    </div>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.45,
                      }}
                    >
                      {c.agenda}
                    </p>
                    {c.type === "planning" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ marginTop: 10, padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => setTab("board")}
                      >
                        Open sprint board to review / carry over
                      </button>
                    )}
                    {c.type === "retrospective" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ marginTop: 10, padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => setTab("retro")}
                      >
                        Open Retrospective board
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "retro" && (
        <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
          <h3
            style={{
              fontSize: "1.15rem",
              color: "var(--charcoal)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MessageSquare size={18} style={{ color: "var(--bronze)" }} /> Retrospective board
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 14 }}>
            {activeSprint === "backlog"
              ? "Select a sprint to run its retrospective."
              : `${sprintLabel(activeSprint)} — Went well · Needs improvement · Action items`}
          </p>
          {activeSprint === "backlog" ? (
            <p style={{ color: "var(--text-muted)" }}>Pick a sprint first.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {RETRO_COLUMNS.map((col) => {
                const cards = retroForSprint.filter((c) => c.column === col.id);
                return (
                  <div
                    key={col.id}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid var(--border-color)",
                      background: "rgba(215,198,151,0.15)",
                      minHeight: 220,
                    }}
                  >
                    <strong style={{ color: "var(--charcoal)", fontSize: "0.95rem" }}>
                      {col.label}
                    </strong>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "4px 0 10px" }}>
                      {col.hint}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: "#fff",
                            border: "1px solid var(--border-color)",
                            fontSize: "0.85rem",
                            color: "var(--charcoal)",
                          }}
                        >
                          <div>{card.text}</div>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              marginTop: 6,
                              padding: "2px 8px",
                              fontSize: "0.72rem",
                              color: "#9B2F28",
                            }}
                            onClick={() => void removeRetroCard(card.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {cards.length === 0 && (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No cards yet</p>
                      )}
                    </div>
                    <textarea
                      className="text-input"
                      rows={2}
                      value={retroDraft[col.id]}
                      onChange={(e) =>
                        setRetroDraft((d) => ({ ...d, [col.id]: e.target.value }))
                      }
                      placeholder={`Add to ${col.label}…`}
                      style={{ resize: "vertical", width: "100%", fontSize: "0.85rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: 8, padding: "6px 12px", fontSize: "0.8rem" }}
                      disabled={busy || !retroDraft[col.id].trim()}
                      onClick={() => void addRetroCard(col.id)}
                    >
                      <Plus size={14} /> Add card
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
