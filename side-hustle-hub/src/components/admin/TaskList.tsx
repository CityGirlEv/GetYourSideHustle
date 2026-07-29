import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ListChecks,
  Lock,
  Plus,
  RotateCcw,
  Paperclip,
  Trash2,
  FileText,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  File,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Upload,
  Search,
} from "lucide-react";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import { MarkdownLinkText } from "./MarkdownLinkText";
import { taskOpenPageStep } from "../../lib/qa-page-links";
import {
  TASK_STATUS_LABELS,
  TASK_CATEGORIES,
  ACCEPT_ATTACHMENTS,
  fetchTasks,
  persistTasks,
  syncGuideReviewTasks,
  nextTaskId,
  todayMMDDYY,
  isAcceptedAttachment,
  formatFileSize,
  categoryLabel,
  isTaskOverdue,
  isTaskDueToday,
  mmddyyToIso,
  isoToMmddyy,
  applyPartnerDone,
  partnerDoneSummary,
  fileToBase64,
  base64ToBlob,
  uploadTaskAttachment,
  fetchTaskAttachmentContent,
  deleteTaskAttachmentRemote,
  type GyshTask,
  type GyshTaskAttachment,
  type TaskStatus,
  type TaskPriority,
  type TaskCategory,
} from "../../lib/gysh-tasks";
import type { AuthUser } from "../../lib/auth";
import {
  assignedBySelectOptions,
  taskAssignByForActor,
  userHasAdminRole,
} from "../../lib/gysh-assignment";
import { WorkTimer } from "./WorkTimer";
import { useActiveTimers } from "../../lib/use-active-timers";
import { ensureWorkTimerStarted, stopTimerOnStatusChange } from "../../lib/gysh-time-entries";
import {
  deleteTaskFile,
  getTaskFile,
  newFileId,
  putTaskFile,
} from "../../lib/gysh-task-files";
import {
  canViewAttachmentInline,
  localAttachmentLooksComplete,
  openAttachmentBlob,
  type AttachmentOpenMode,
} from "../../lib/gysh-attachments";
import { ApiError } from "../../lib/api";
import {
  listUpcomingSprints,
  sprintLabel,
  BACKLOG_SPRINT,
  UNASSIGNED_OWNER,
  isBacklogSprint,
  sanitizeBacklogTaskAssignees,
  withBacklogTaskUnassigned,
  dueDateForSprint,
  dueDateIsoForSprint,
  withSprintDueDate,
  currentSprintIndex,
} from "../../lib/gysh-sprints";
import {
  fetchClosedSprints,
  isSprintLocked,
  sprintLockedMessage,
} from "../../lib/gysh-closed-sprints";
import {
  countTasksRolledIntoSprint,
  healIncompleteTaskDueDates,
  noteIndicatesRollover,
} from "../../lib/gysh-sprint-board";
import { formatAuditTrail } from "../../lib/gysh-audit";
import {
  appendActorNote,
  applyNoteDrafts,
  notesHaveUnsavedDraft,
} from "../../lib/gysh-note-entries";
import { NotesThread } from "./NotesThread";
import {
  queryLooksLikeTaskId,
  taskMatchesIdQuery,
  taskMatchesSearch,
} from "../../lib/gysh-task-search";

type OwnerFilter = GyshTask["assignedTo"];
type CategoryFilter = TaskCategory;

/** Same chip chrome as Testing Portal FilterChip. */
function TaskFilterChip({
  active,
  onClick,
  children,
  title,
  accent,
  testId,
  current,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
  accent?: string;
  testId?: string;
  current?: boolean;
}) {
  return (
    <button
      type="button"
      className="qa-tester-bubble qa-filter-chip"
      data-active={active ? "true" : "false"}
      data-current={current ? "true" : undefined}
      data-testid={testId}
      title={title}
      onClick={onClick}
      style={
        active && accent
          ? { borderColor: accent, boxShadow: `0 0 0 1px ${accent}` }
          : undefined
      }
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

/** Collapsible filter facet — chevron by title; portal-style chips when open. */
function TaskFilterPanel({
  title,
  hint,
  summary,
  open,
  onOpenChange,
  testId,
  children,
}: {
  title: string;
  hint?: string;
  /** Shown when collapsed so active filters stay visible. */
  summary?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId?: string;
  children: ReactNode;
}) {
  const panelId = testId ? `${testId}-body` : undefined;
  return (
    <div
      className={`task-list-filters__panel${open ? " is-open" : " is-collapsed"}`}
      data-testid={testId}
    >
      <button
        type="button"
        className="task-list-filters__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        data-testid={testId ? `${testId}-toggle` : undefined}
        onClick={() => onOpenChange(!open)}
      >
        {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
        <span className="task-list-filters__toggle-label">{title}</span>
        {hint ? <span className="task-list-toolbar__label-hint">{hint}</span> : null}
        {!open && summary ? (
          <span className="task-list-filters__panel-summary">{summary}</span>
        ) : null}
      </button>
      {open ? (
        <div id={panelId} className="task-list-filters__panel-body">
          {children}
        </div>
      ) : null}
    </div>
  );
}

const OWNER_ACCENT: Record<GyshTask["assignedTo"], string> = {
  Tina: "var(--crimson)",
  Evelyn: "var(--bronze)",
  Lyriq: "var(--accent-emerald)",
  Both: "var(--charcoal)",
  Unassigned: "#7a7064",
};

/** Solid hex for legend swatches / select accents (CSS vars don't paint well as inline swatches). */
const OWNER_SWATCH: Record<GyshTask["assignedTo"], string> = {
  Tina: "#9B2F28",
  Evelyn: "#947D64",
  Lyriq: "#2e7d32",
  Both: "#181718",
  Unassigned: "#7a7064",
};

const OWNER_LABEL_CLASS: Record<GyshTask["assignedTo"], string> = {
  Tina: "flat-label flat-label--assignee-tina",
  Evelyn: "flat-label flat-label--assignee-evelyn",
  Lyriq: "flat-label flat-label--assignee-lyriq",
  Both: "flat-label flat-label--assignee-both",
  Unassigned: "flat-label",
};

const STATUS_ACCENT: Record<TaskStatus, string> = {
  not_started: "#9ca3af",
  in_progress: "#ca8a04",
  blocked: "#dc2626",
  done: "#16a34a",
};

const OWNER_DISPLAY: Record<GyshTask["assignedTo"], string> = {
  Tina: "Tina",
  Evelyn: "Evelyn",
  Lyriq: "Lyriq",
  Both: "Both",
  Unassigned: "UnAssgnd",
};

const OWNER_BUBBLES: { id: OwnerFilter; label: string; accent?: string }[] = [
  { id: "Tina", label: OWNER_DISPLAY.Tina, accent: OWNER_ACCENT.Tina },
  { id: "Evelyn", label: OWNER_DISPLAY.Evelyn, accent: OWNER_ACCENT.Evelyn },
  { id: "Lyriq", label: OWNER_DISPLAY.Lyriq, accent: OWNER_ACCENT.Lyriq },
  { id: "Both", label: OWNER_DISPLAY.Both, accent: OWNER_ACCENT.Both },
  { id: "Unassigned", label: OWNER_DISPLAY.Unassigned, accent: OWNER_ACCENT.Unassigned },
];

/** Same assignee matching as the owner filter (T/E include Both; backlog counts as Unassigned). */
function taskMatchesOwner(task: GyshTask, owner: OwnerFilter): boolean {
  const effective = isBacklogSprint(task.sprint) ? UNASSIGNED_OWNER : task.assignedTo;
  if (owner === "Unassigned") return effective === "Unassigned" || !String(effective || "").trim();
  if (owner === "Both") return effective === "Both";
  if (owner === "Lyriq") return effective === "Lyriq" || effective.includes("Lyriq");
  // Tina / Evelyn: exact, Both, or multi like Tina+Lyriq
  if (effective === owner || effective === "Both") return true;
  return effective.split(/[+,&|/]/).map((p) => p.trim()).includes(owner);
}

function tasksForOwner(tasks: GyshTask[], owner: OwnerFilter | "all"): GyshTask[] {
  if (owner === "all") return tasks;
  return tasks.filter((t) => taskMatchesOwner(t, owner));
}

function ownerBubbleCounts(tasks: GyshTask[], owner: OwnerFilter) {
  const matched = tasksForOwner(tasks, owner);
  return {
    assigned: matched.length,
    done: matched.filter((t) => t.status === "done").length,
    rolled: matched.filter((t) => noteIndicatesRollover(t.notes)).length,
  };
}

const STATUS_LEGEND: { id: TaskStatus; label: string }[] = [
  { id: "not_started", label: "Not started" },
  { id: "in_progress", label: "In progress" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

const CATEGORY_BUBBLES: { id: CategoryFilter; label: string }[] = TASK_CATEGORIES.map((c) => ({
  id: c.id as CategoryFilter,
  label: c.label,
}));

function attachmentIcon(mimeType: string, name: string) {
  const t = mimeType.toLowerCase();
  const n = name.toLowerCase();
  if (t.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(n)) return FileImage;
  if (t.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(n)) return FileVideo;
  if (
    t.includes("spreadsheet") ||
    t.includes("excel") ||
    t === "application/vnd.ms-excel" ||
    /\.(xls|xlsx)$/i.test(n)
  ) {
    return FileSpreadsheet;
  }
  if (t.includes("pdf") || t.includes("word") || t.includes("document") || /\.(pdf|doc|docx|txt|csv)$/i.test(n)) {
    return FileText;
  }
  return File;
}

function AttachmentRow({
  taskId,
  att,
  onRemove,
}: {
  taskId: string;
  att: GyshTaskAttachment;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const Icon = attachmentIcon(att.mimeType, att.name);
  const isImage = att.mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(att.name);

  const resolveBlob = async (): Promise<Blob> => {
    const rec = await getTaskFile(taskId, att.storedId);
    if (localAttachmentLooksComplete(rec, att.size)) return rec!.blob;
    if (att.hasContent === false) {
      throw new Error("File bytes were never stored on the server. Please re-upload the file.");
    }
    const remote = await fetchTaskAttachmentContent(att.id);
    if (!remote.contentBase64?.trim()) {
      throw new Error("Attachment file bytes are missing from the database.");
    }
    const blob = base64ToBlob(remote.contentBase64, remote.mimeType || att.mimeType);
    if (blob.size < 1) {
      throw new Error("Attachment decoded empty — re-upload the file.");
    }
    void putTaskFile({
      taskId,
      fileId: att.storedId,
      name: att.name,
      mimeType: att.mimeType,
      size: att.size || blob.size,
      blob,
      addedAt: att.addedAt,
    });
    return blob;
  };

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    if (!isImage) return;
    (async () => {
      try {
        const blob = await resolveBlob();
        if (cancelled || !blob) return;
        const url = URL.createObjectURL(blob);
        revoked = url;
        setPreviewUrl(url);
      } catch {
        /* preview optional */
      }
    })();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when attachment identity/size changes
  }, [taskId, att.storedId, att.id, att.hasContent, att.name, att.mimeType, att.size, att.addedAt, isImage]);

  const canView = canViewAttachmentInline(att.mimeType, att.name);

  const openAttachment = async (mode: AttachmentOpenMode) => {
    setBusy(true);
    try {
      const blob = await resolveBlob();
      openAttachmentBlob(blob, {
        name: att.name,
        mimeType: att.mimeType,
        mode: mode === "view" && !canView ? "download" : mode,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "File not found. If this was uploaded before server storage, please re-upload it.";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: "rgba(148,125,100,0.08)",
        border: "1px solid rgba(148,125,100,0.2)",
      }}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={att.name}
          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
        />
      ) : (
        <Icon size={20} style={{ color: "var(--bronze)", flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.95rem",
            color: "var(--charcoal)",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={att.name}
        >
          {att.name}
        </div>
        <div style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
          {formatFileSize(att.size)} · {att.mimeType || "file"} · {att.addedAt}
        </div>
      </div>
      {canView ? (
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "4px 8px", fontSize: "0.9375rem" }}
          onClick={() => void openAttachment("view")}
          disabled={busy}
          title="View in a new tab"
        >
          <ExternalLink size={14} />
        </button>
      ) : null}
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "4px 8px", fontSize: "0.9375rem" }}
        onClick={() => void openAttachment("download")}
        disabled={busy}
        title="Download file"
      >
        <Download size={14} />
      </button>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "4px 8px", fontSize: "0.9375rem", color: "#9B2F28" }}
        onClick={onRemove}
        title="Remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function TaskAttachments({
  task,
  onChange,
  onAfterUpload,
  showList = true,
  trigger = "button",
  mode = "both",
}: {
  task: GyshTask;
  onChange: (attachments: GyshTaskAttachment[]) => void;
  /** Called after one or more files are added successfully (parent can expand the section). */
  onAfterUpload?: () => void;
  showList?: boolean;
  /** `paperclip` = compact control for the notes row; `button` = labeled Attach files. */
  trigger?: "paperclip" | "button";
  /** `trigger` = upload control only; `list` = file rows only; `both` = all. */
  mode?: "trigger" | "list" | "both";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const count = task.attachments?.length ?? 0;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    let added = 0;
    try {
      const next = [...(task.attachments ?? [])];
      for (const file of Array.from(files)) {
        if (!isAcceptedAttachment(file)) {
          setError(`Skipped unsupported file: ${file.name}`);
          continue;
        }
        const id = newFileId();
        const addedAt = todayMMDDYY();
        const mimeType = file.type || "application/octet-stream";
        const contentBase64 = await fileToBase64(file);
        const saved = await uploadTaskAttachment({
          taskId: task.id,
          id,
          name: file.name,
          mimeType,
          contentBase64,
          addedAt,
        });
        await putTaskFile({
          taskId: task.id,
          fileId: saved.storedId || saved.id,
          name: saved.name,
          mimeType: saved.mimeType,
          size: saved.size,
          blob: file,
          addedAt: saved.addedAt,
        });
        next.push({
          id: saved.id,
          name: saved.name,
          mimeType: saved.mimeType,
          size: saved.size,
          storedId: saved.storedId || saved.id,
          addedAt: saved.addedAt,
          hasContent: true,
        });
        added += 1;
      }
      onChange(next);
      if (added > 0) onAfterUpload?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (att: GyshTaskAttachment) => {
    try {
      await deleteTaskAttachmentRemote(att.id);
    } catch {
      /* still remove from UI / task metadata */
    }
    await deleteTaskFile(task.id, att.storedId);
    onChange((task.attachments ?? []).filter((a) => a.id !== att.id));
  };

  const showTrigger = mode === "both" || mode === "trigger";
  const showRows = (mode === "both" || mode === "list") && showList && count > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {showTrigger && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 10px", fontSize: "0.9375rem" }}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Attach files"
            aria-label={count ? `Attach files (${count} attached)` : "Attach files"}
          >
            {uploading ? (
              <WaitLabel>Uploading…</WaitLabel>
            ) : trigger === "paperclip" ? (
              <>
                <Paperclip size={14} />
                {count > 0 ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span> : null}
              </>
            ) : (
              <>
                <Upload size={14} /> Attach files
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTACHMENTS}
            style={{ display: "none" }}
            onChange={(e) => void handleFiles(e.target.files)}
          />
          {trigger === "button" && (
            <span style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
              Images, PDF, Word, Excel, video (mp4/webm/mov), txt, csv
            </span>
          )}
        </div>
      )}
      {error && showTrigger && (
        <div style={{ fontSize: "0.9375rem", color: "#9B2F28" }}>{error}</div>
      )}
      {showRows && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(task.attachments ?? []).map((att) => (
            <AttachmentRow key={att.id} taskId={task.id} att={att} onRemove={() => void remove(att)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskList({
  focusTaskId = null,
  onFocusConsumed,
  authUser = null,
}: {
  focusTaskId?: string | null;
  onFocusConsumed?: () => void;
  authUser?: AuthUser | null;
} = {}) {
  const [tasks, setTasks] = useState<GyshTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const timers = useActiveTimers(Boolean(authUser));
  const actingAssignBy = taskAssignByForActor(authUser);
  const isAdmin = userHasAdminRole(authUser);
  const [desc, setDesc] = useState("");
  /** Empty = "Select" placeholder so Add form never looks pre-filled. */
  const [assignee, setAssignee] = useState<GyshTask["assignedTo"] | "">("");
  const [newCategory, setNewCategory] = useState<TaskCategory | "">("");
  const [newDueDate, setNewDueDate] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [bulkNotes, setBulkNotes] = useState("");
  const assignByOptions = assignedBySelectOptions(
    actingAssignBy,
    ...tasks.map((t) => t.assignBy),
  );
  const [ownerFilters, setOwnerFilters] = useState<Set<OwnerFilter>>(() => new Set());
  const [categoryFilters, setCategoryFilters] = useState<Set<CategoryFilter>>(() => new Set());
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(() => new Set());
  /** Orthogonal to work status — End Sprint “Rolled over from Sprint N” note. */
  const [rolledOverOnly, setRolledOverOnly] = useState(false);
  /** Open on the live sprint so the list matches what partners are working this week. */
  const [sprintFilters, setSprintFilters] = useState<Set<number>>(
    () => new Set([currentSprintIndex()]),
  );
  const [filterOpen, setFilterOpen] = useState({
    sprint: true,
    assignee: true,
    status: true,
    category: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [newSprint, setNewSprint] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  /** Local note drafts — Save persists; checkbox/select starts the work timer. */
  const [newNoteDrafts, setNewNoteDrafts] = useState<Record<string, string>>({});
  const [editNoteDrafts, setEditNoteDrafts] = useState<Record<string, Record<string, string>>>({});
  const [dirtyNoteIds, setDirtyNoteIds] = useState<Set<string>>(() => new Set());
  const [savingAll, setSavingAll] = useState(false);
  const [saveFlash, setSaveFlash] = useState("");
  const [closedSprints, setClosedSprints] = useState<Set<number>>(() => new Set());
  const startingTimersRef = useRef(new Set<string>());
  const sprints = listUpcomingSprints();
  const dirtySaveCount = dirtyNoteIds.size;

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const closedList = await fetchClosedSprints().catch(() => [] as number[]);
      setClosedSprints(new Set(closedList));
      // Ensure a review task exists for every launch guide (idempotent; persists to D1).
      const synced = await syncGuideReviewTasks();
      const backlogHealed = sanitizeBacklogTaskAssignees(synced.tasks);
      const dueHealed = healIncompleteTaskDueDates(backlogHealed.tasks);
      setTasks(dueHealed.tasks);
      setNewNoteDrafts({});
      setEditNoteDrafts({});
      setDirtyNoteIds(new Set());
      if (backlogHealed.changed || dueHealed.changed) {
        try {
          setTasks(await persistTasks(dueHealed.tasks));
        } catch {
          /* keep healed local state */
        }
      }
    } catch (e) {
      try {
        const list = await fetchTasks();
        const backlogHealed = sanitizeBacklogTaskAssignees(list);
        const dueHealed = healIncompleteTaskDueDates(backlogHealed.tasks);
        setTasks(dueHealed.tasks);
        if (backlogHealed.changed || dueHealed.changed) {
          try {
            setTasks(await persistTasks(dueHealed.tasks));
          } catch {
            /* keep healed local state */
          }
        }
      } catch {
        setTasks([]);
      }
      setError(e instanceof ApiError ? e.message : "Failed to load tasks from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const filtersAreAll =
    ownerFilters.size === 0 &&
    categoryFilters.size === 0 &&
    statusFilters.size === 0 &&
    !rolledOverOnly &&
    sprintFilters.size === 0 &&
    !searchQuery.trim();

  const resetNewTaskForm = () => {
    setDesc("");
    setAssignee("");
    setNewCategory("");
    setNewDueDate("");
    setNewSprint(null);
  };

  /** Discard unsaved note drafts / new-task form and set all filters to All — no server fetch. */
  const resetEdits = () => {
    const hadDrafts = dirtySaveCount > 0 || Boolean(desc.trim());
    if (!hadDrafts && filtersAreAll) return;
    if (hadDrafts) {
      setNewNoteDrafts({});
      setEditNoteDrafts({});
      setDirtyNoteIds(new Set());
      resetNewTaskForm();
    }
    setOwnerFilters(new Set());
    setCategoryFilters(new Set());
    setStatusFilters(new Set());
    setSprintFilters(new Set());
    setRolledOverOnly(false);
    setSearchQuery("");
    setSaveFlash(
      hadDrafts
        ? "Reset — unsaved note edits discarded; filters set to All"
        : "Reset — filters set to All",
    );
    window.setTimeout(() => setSaveFlash(""), 2000);
  };

  useEffect(() => {
    if (!focusTaskId || loading) return;
    const exists = tasks.some((t) => t.id === focusTaskId);
    if (!exists) {
      onFocusConsumed?.();
      return;
    }
    // Clear filters so the focused task is visible
    setOwnerFilters(new Set());
    setCategoryFilters(new Set());
    setStatusFilters(new Set());
    setRolledOverOnly(false);
    setSprintFilters(new Set());
    setSearchQuery("");
    setExpanded((prev) => ({ ...prev, [focusTaskId]: true }));
    setSelectedIds(new Set([focusTaskId]));
    setHighlightId(focusTaskId);
    onFocusConsumed?.();
    requestAnimationFrame(() => {
      document.getElementById(`task-row-${focusTaskId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [focusTaskId, loading, tasks, onFocusConsumed]);

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const persistQueue = useRef(Promise.resolve());

  const persist = async (next: GyshTask[], opts?: { removeIds?: string[] }) => {
    tasksRef.current = next;
    setTasks(next);
    setBusy(true);
    setError("");
    const removeIds = opts?.removeIds;
    const run = async () => {
      try {
        const saved = await persistTasks(tasksRef.current, { removeIds });
        tasksRef.current = saved;
        setTasks(saved);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to save tasks.");
        throw e;
      } finally {
        setBusy(false);
      }
    };
    // Serialize writes so rapid edits from T/E/Lyriq don't clobber each other mid-flight.
    const queued = persistQueue.current.then(run, run);
    persistQueue.current = queued.then(
      () => undefined,
      () => undefined,
    );
    await queued;
  };

  // No bulk due-date rewrite on load — that raced with live edits.

  type TaskFilterFacet = "owner" | "category" | "status" | "sprint" | "search" | "rolled";

  const taskMatchesFilters = (t: GyshTask, exclude?: TaskFilterFacet): boolean => {
    // Task-# search always wins — "T-029" should find the task even if Tina/Done/Sprint filters hide it.
    if (
      exclude !== "search" &&
      searchQuery.trim() &&
      queryLooksLikeTaskId(searchQuery) &&
      taskMatchesIdQuery(t, searchQuery)
    ) {
      return true;
    }
    if (
      exclude !== "owner" &&
      ownerFilters.size > 0 &&
      ![...ownerFilters].some((owner) => taskMatchesOwner(t, owner))
    ) {
      return false;
    }
    if (exclude !== "category" && categoryFilters.size > 0 && !categoryFilters.has(t.category)) {
      return false;
    }
    if (exclude !== "status" && statusFilters.size > 0 && !statusFilters.has(t.status)) {
      return false;
    }
    if (exclude !== "rolled" && rolledOverOnly && !noteIndicatesRollover(t.notes)) {
      return false;
    }
    if (exclude !== "sprint" && sprintFilters.size > 0 && !sprintFilters.has(t.sprint ?? 0)) {
      return false;
    }
    if (exclude !== "search" && !taskMatchesSearch(t, searchQuery)) return false;
    return true;
  };

  const filtered = tasks.filter((t) => taskMatchesFilters(t));
  const otherFiltersActive =
    ownerFilters.size > 0 ||
    categoryFilters.size > 0 ||
    statusFilters.size > 0 ||
    rolledOverOnly ||
    sprintFilters.size > 0;
  const idSearchBypassedFilters =
    Boolean(searchQuery.trim()) &&
    queryLooksLikeTaskId(searchQuery) &&
    otherFiltersActive &&
    filtered.some((t) => taskMatchesIdQuery(t, searchQuery));

  const statusFacetTasks = tasks.filter((t) => taskMatchesFilters(t, "status"));
  const categoryFacetTasks = tasks.filter((t) => taskMatchesFilters(t, "category"));
  const sprintFacetTasks = tasks.filter((t) => taskMatchesFilters(t, "sprint"));
  const ownerFacetTasks = tasks.filter((t) => taskMatchesFilters(t, "owner"));
  /** Rolled-over count for the Rolled Over chip (respects sprint/assignee/etc., not the rolled toggle). */
  const rolledFacetTasks = tasks.filter((t) => taskMatchesFilters(t, "rolled"));
  const rolledOverFacetCount = rolledFacetTasks.filter((t) =>
    noteIndicatesRollover(t.notes),
  ).length;
  const liveSprintIndex = currentSprintIndex();

  const toggleInSet = <T,>(prev: Set<T>, value: T): Set<T> => {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const toggleOwnerFilter = (owner: OwnerFilter) => {
    setOwnerFilters((prev) => toggleInSet(prev, owner));
  };

  const toggleCategoryFilter = (category: CategoryFilter) => {
    setCategoryFilters((prev) => toggleInSet(prev, category));
  };

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilters((prev) => toggleInSet(prev, status));
  };

  const toggleSprintFilter = (sprint: number) => {
    setSprintFilters((prev) => toggleInSet(prev, sprint));
  };

  const filteredIds = filtered.map((t) => t.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  /** Assigned Date stays creation date; Assigned By updates only when assignee changes. */
  const withAssignMeta = (prev: GyshTask | undefined, updates: Partial<GyshTask>): Partial<GyshTask> => {
    if (updates.assignedTo === undefined) return updates;
    if (prev && prev.assignedTo === updates.assignedTo) return updates;
    return { ...updates, assignBy: actingAssignBy };
  };

  const addTask = async () => {
    if (!desc.trim()) {
      setError("Enter a task description.");
      return;
    }
    if (!newCategory) {
      setError("Select a category.");
      return;
    }
    if (newSprint === null) {
      setError("Select a sprint.");
      return;
    }
    if (!isBacklogSprint(newSprint) && !assignee) {
      setError("Select an assignee.");
      return;
    }
    if (!isBacklogSprint(newSprint) && !newDueDate && !dueDateForSprint(newSprint)) {
      setError("Select a due date.");
      return;
    }
    if (isSprintLocked(closedSprints, newSprint)) {
      setError(sprintLockedMessage(newSprint));
      return;
    }
    const sprintDue = dueDateForSprint(newSprint);
    const assignedTo: GyshTask["assignedTo"] = isBacklogSprint(newSprint)
      ? UNASSIGNED_OWNER
      : assignee;
    const newId = nextTaskId(tasksRef.current);
    const t: GyshTask = {
      id: newId,
      description: desc.trim(),
      category: newCategory,
      priority: "P2",
      status: "not_started",
      assignBy: actingAssignBy,
      assignedTo,
      dateAssigned: todayMMDDYY(),
      // Backlog has no sprint due — keep blank so it doesn't look "scheduled".
      dueDate: isBacklogSprint(newSprint)
        ? ""
        : isoToMmddyy(newDueDate) || sprintDue || todayMMDDYY(),
      dateCompleted: "",
      notes: "",
      sprint: newSprint,
      tinaDone: false,
      evelynDone: false,
      attachments: [],
    };
    try {
      await persist([t, ...tasksRef.current]);
      resetNewTaskForm();
      // Show the new task: clear hidey filters, focus its sprint lane, scroll to it.
      setOwnerFilters(new Set());
      setCategoryFilters(new Set());
      setStatusFilters(new Set());
      setSearchQuery("");
      setSprintFilters(isBacklogSprint(newSprint) ? new Set([BACKLOG_SPRINT]) : new Set([newSprint]));
      setExpanded((prev) => ({ ...prev, [newId]: true }));
      setSelectedIds(new Set([newId]));
      setHighlightId(newId);
      setSaveFlash(
        isBacklogSprint(newSprint)
          ? `Added ${newId} to Backlog`
          : `Added ${newId} to ${sprintLabel(newSprint)}`,
      );
      window.setTimeout(() => setSaveFlash(""), 2500);
      requestAnimationFrame(() => {
        document.getElementById(`task-row-${newId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    } catch {
      /* error already set */
    }
  };

  const commitDueDate = async (id: string, iso: string) => {
    const normalized = isoToMmddyy(iso);
    if (normalized === null) {
      setError("Pick a valid date from the calendar.");
      return;
    }
    const current = tasks.find((t) => t.id === id);
    if (!current || current.dueDate === normalized) return;
    await patch(id, { dueDate: normalized });
  };

  const commitDescription = async (id: string, raw: string) => {
    const next = raw.trim();
    if (!next) {
      setError("Task description cannot be empty.");
      return;
    }
    const current = tasks.find((t) => t.id === id);
    if (!current || current.description === next) return;
    await patch(id, { description: next });
  };

  const maybeStartTaskTimer = async (id: string) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (!task || task.status === "done") return;
    if (!authUser) return;
    const existing = timers.entryFor("task", id);
    if (existing?.status === "running" || existing?.status === "paused") return;
    if (startingTimersRef.current.has(id)) return;
    startingTimersRef.current.add(id);
    try {
      await ensureWorkTimerStarted({
        source: "task",
        sourceId: id,
        sourceLabel: task.description,
      });
      void timers.refresh();
    } finally {
      startingTimersRef.current.delete(id);
    }
  };

  const markTaskNotesDirty = (id: string) => {
    setDirtyNoteIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const setNewNoteDraft = (id: string, value: string) => {
    setNewNoteDrafts((prev) => ({ ...prev, [id]: value }));
    markTaskNotesDirty(id);
  };

  const setEditNoteDraft = (taskId: string, noteId: string, value: string) => {
    setEditNoteDrafts((prev) => ({
      ...prev,
      [taskId]: { ...(prev[taskId] ?? {}), [noteId]: value },
    }));
    markTaskNotesDirty(taskId);
  };

  const clearNoteDirty = (id: string) => {
    setDirtyNoteIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setNewNoteDrafts((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setEditNoteDrafts((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const priorNoteAttribution = (task: GyshTask) => ({
    author: (task.updatedBy || task.assignBy || "").trim() || undefined,
    at: (task.updatedAt || "").trim() || undefined,
  });

  const composedNotesForTask = (task: GyshTask) =>
    applyNoteDrafts(
      task.notes,
      actingAssignBy,
      editNoteDrafts[task.id],
      newNoteDrafts[task.id],
      undefined,
      priorNoteAttribution(task),
    );

  const saveOneTask = async (id: string) => {
    const current = tasksRef.current.find((t) => t.id === id);
    if (!current) return;
    const nextNotes = composedNotesForTask(current);
    try {
      await patch(id, { notes: nextNotes });
      clearNoteDirty(id);
      setSaveFlash(`${id} saved`);
      window.setTimeout(() => setSaveFlash(""), 2500);
    } catch {
      /* error already set */
    }
  };

  const saveEverything = async () => {
    const ids = [...dirtyNoteIds].filter((id) => {
      const current = tasksRef.current.find((t) => t.id === id);
      if (!current) return false;
      return notesHaveUnsavedDraft(
        current.notes,
        actingAssignBy,
        editNoteDrafts[id],
        newNoteDrafts[id],
      );
    });
    if (ids.length === 0) {
      setSaveFlash("Nothing to save — no unsaved notes.");
      window.setTimeout(() => setSaveFlash(""), 2500);
      return;
    }
    setSavingAll(true);
    let saved = 0;
    try {
      for (const id of ids) {
        const current = tasksRef.current.find((t) => t.id === id);
        if (!current) {
          clearNoteDirty(id);
          continue;
        }
        await patch(id, { notes: composedNotesForTask(current) });
        clearNoteDirty(id);
        saved += 1;
      }
      setSaveFlash(`Saved ${saved} task${saved === 1 ? "" : "s"}`);
      window.setTimeout(() => setSaveFlash(""), 2500);
    } catch {
      /* error already set */
    } finally {
      setSavingAll(false);
    }
  };

  const patch = async (id: string, updates: Partial<GyshTask>) => {
    const prev = tasksRef.current.find((t) => t.id === id);
    if (prev && isSprintLocked(closedSprints, prev.sprint)) {
      setError(sprintLockedMessage(Number(prev.sprint)));
      return;
    }
    const nextSprint =
      updates.sprint !== undefined ? Number(updates.sprint) : Number(prev?.sprint ?? 0);
    if (isSprintLocked(closedSprints, nextSprint)) {
      setError(sprintLockedMessage(nextSprint));
      return;
    }
    const applied = withBacklogTaskUnassigned(
      withSprintDueDate(withAssignMeta(prev, updates)),
      prev?.sprint,
    );
    const next = tasksRef.current.map((t) => {
      if (t.id !== id) return t;
      return applyPartnerDone(t, applied);
    });
    try {
      await persist(next);
      if (updates.status != null && prev && updates.status !== prev.status) {
        await stopTimerOnStatusChange("task", id);
        void timers.refresh();
      }
    } catch {
      /* error already set */
    }
  };

  const patchSelected = async (updates: Partial<GyshTask>) => {
    if (selectedIds.size === 0) return;
    const targetSprint =
      updates.sprint !== undefined ? Number(updates.sprint) : undefined;
    if (targetSprint !== undefined && isSprintLocked(closedSprints, targetSprint)) {
      setError(sprintLockedMessage(targetSprint));
      return;
    }
    const lockedSelected = tasksRef.current.filter(
      (t) => selectedIds.has(t.id) && isSprintLocked(closedSprints, t.sprint),
    );
    if (lockedSelected.length > 0 && lockedSelected.length === selectedIds.size) {
      setError(sprintLockedMessage(Number(lockedSelected[0]!.sprint)));
      return;
    }
    const ids = [...selectedIds].filter((id) => {
      const t = tasksRef.current.find((x) => x.id === id);
      return t && !isSprintLocked(closedSprints, t.sprint);
    });
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const prevById = new Map(tasksRef.current.map((t) => [t.id, t.status]));
    const next = tasksRef.current.map((t) => {
      if (!idSet.has(t.id)) return t;
      const applied = withBacklogTaskUnassigned(
        withSprintDueDate(withAssignMeta(t, updates)),
        t.sprint,
      );
      return applyPartnerDone(t, applied);
    });
    try {
      await persist(next);
      if (updates.status != null) {
        for (const id of ids) {
          if (prevById.get(id) !== updates.status) {
            await stopTimerOnStatusChange("task", id);
          }
        }
        void timers.refresh();
      }
    } catch {
      /* error already set */
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected task${selectedIds.size === 1 ? "" : "s"}? Attachment metadata will be removed from the database. Local blobs stay until cleared in this browser.`)) {
      return;
    }
    for (const id of selectedIds) {
      const task = tasks.find((t) => t.id === id);
      for (const att of task?.attachments ?? []) {
        await deleteTaskFile(id, att.storedId);
      }
    }
    try {
      const removeIds = [...selectedIds];
      await persist(
        tasks.filter((t) => !selectedIds.has(t.id)),
        { removeIds },
      );
      setSelectedIds(new Set());
    } catch {
      /* error already set */
    }
  };

  const toggleSelect = (id: string) => {
    const selecting = !selectedIds.has(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selecting) next.add(id);
      else next.delete(id);
      return next;
    });
    if (selecting) void maybeStartTaskTimer(id);
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        for (const id of filteredIds) next.delete(id);
        return next;
      }
      const next = new Set(prev);
      for (const id of filteredIds) next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <BusyOverlay
        active={busy || savingAll || loading}
        message={
          loading ? "Loading tasks…" : savingAll ? "Saving tasks…" : "Updating tasks…"
        }
      />
      <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8 }}>
              <ListChecks size={22} style={{ color: "var(--bronze)" }} /> Task List
            </h2>
            <p style={{ color: "var(--text-primary)", marginTop: 6, fontSize: "1rem", lineHeight: 1.5 }}>
              T + E operational tracker — saved in production D1.
            </p>
            <p style={{ color: "var(--text-primary)", marginTop: 6, fontSize: "1rem", lineHeight: 1.5 }}>
              Attachments are saved to the database and can be downloaded from any browser. Max ~1.5MB per file.
              Older name-only attachments need a re-upload.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200, maxWidth: 360 }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-primary)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="text-input"
                style={{ paddingLeft: 34, height: 40, width: "100%" }}
                placeholder="Search Task #, description, notes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks by number, description, notes, and more"
                data-testid="task-list-search"
              />
            </div>
            <button
              type="button"
              className="btn btn-primary qa-save-btn--ready"
              onClick={() => void saveEverything()}
              disabled={savingAll || busy || dirtySaveCount === 0}
              title="Save all unsaved task notes"
            >
              {savingAll
                ? <WaitLabel>Saving…</WaitLabel>
                : dirtySaveCount > 0
                  ? `Save everything (${dirtySaveCount})`
                  : "Save everything"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetEdits}
              disabled={loading || busy || (dirtySaveCount === 0 && !desc.trim() && filtersAreAll)}
              title={
                dirtySaveCount > 0 || desc.trim() || !filtersAreAll
                  ? "Discard unsaved notes and set all filters to All"
                  : "Nothing to reset — filters already All, no unsaved changes"
              }
              aria-label={
                dirtySaveCount > 0 || desc.trim() || !filtersAreAll
                  ? "Reset unsaved task notes and set all filters to All"
                  : "Reset unavailable — nothing to clear"
              }
            >
              <RotateCcw size={14} /> Re-Set
            </button>
          </div>
        </div>

        {saveFlash && (
          <p style={{ marginTop: 10, color: "#2e7d32", fontSize: "0.95rem", fontWeight: 600 }}>{saveFlash}</p>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.95rem" }}>
            {error}
          </div>
        )}

        <div className="task-list-toolbar__section">
          <div className="task-list-toolbar__section-label">Add task</div>
          <div className="task-list-toolbar__fields">
            <div className="form-group" style={{ flex: "1 1 280px" }}>
              <label className="form-label">New task</label>
              <input className="text-input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What needs doing?" disabled={Boolean(error) && tasks.length === 0} />
            </div>
            <div className="form-group" style={{ width: 180 }}>
              <label className="form-label">Category</label>
              <select
                className="select-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskCategory | "")}
              >
                <option value="" disabled>
                  Select
                </option>
                {TASK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ width: 140 }}>
              <label className="form-label">Assign to</label>
              <select
                className="select-input"
                value={
                  newSprint !== null && isBacklogSprint(newSprint)
                    ? UNASSIGNED_OWNER
                    : assignee
                }
                onChange={(e) => setAssignee(e.target.value as GyshTask["assignedTo"] | "")}
                disabled={newSprint !== null && isBacklogSprint(newSprint)}
                title={
                  newSprint !== null && isBacklogSprint(newSprint)
                    ? "Backlog tasks stay Unassigned until moved into a sprint"
                    : undefined
                }
              >
                <option value="" disabled>
                  Select
                </option>
                <option value={UNASSIGNED_OWNER}>Unassigned</option>
                <option value="Tina">Tina</option>
                <option value="Evelyn">Evelyn</option>
                <option value="Lyriq">Lyriq</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="form-group" style={{ width: 150 }}>
              <label className="form-label">Due date</label>
              <input
                className="text-input"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                aria-label="Due date for new task"
              />
            </div>
            <div className="form-group" style={{ width: 130 }}>
              <label className="form-label">Sprint</label>
              <select
                className="select-input"
                value={newSprint === null ? "" : newSprint}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    setNewSprint(null);
                    setNewDueDate("");
                    return;
                  }
                  const sprint = Number(raw);
                  setNewSprint(sprint);
                  if (isBacklogSprint(sprint)) {
                    setAssignee(UNASSIGNED_OWNER);
                    setNewDueDate("");
                    return;
                  }
                  const iso = dueDateIsoForSprint(sprint);
                  setNewDueDate(iso || "");
                }}
              >
                <option value="" disabled>
                  Select
                </option>
                <option value={BACKLOG_SPRINT}>Backlog</option>
                {sprints.map((s) => (
                  <option key={s.index} value={s.index}>{s.label}</option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => void addTask()} disabled={busy || loading}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div className="task-list-toolbar__section task-list-filters" data-testid="task-list-filters">
          <div className="task-list-toolbar__section-label">
            Filters
            <span className="task-list-toolbar__label-hint">
              {filtered.length} shown · tap bubbles to multi-select
            </span>
          </div>

          <div className="task-list-filters__stack">
            <TaskFilterPanel
              title="Sprint"
              hint="primary · multi"
              testId="task-list-filter-sprint"
              open={filterOpen.sprint}
              onOpenChange={(open) => setFilterOpen((p) => ({ ...p, sprint: open }))}
              summary={
                [
                  sprintFilters.size === 0
                    ? "All sprints"
                    : sprintFilters.size === 1
                      ? sprintFilters.has(BACKLOG_SPRINT)
                        ? "Backlog"
                        : sprintLabel([...sprintFilters][0]!)
                      : `${sprintFilters.size} sprints`,
                  rolledOverOnly ? "Rolled over only" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              }
            >
              <div
                className="task-list-toolbar__chips task-list-toolbar__chips--sprint"
                role="group"
                aria-label="Filter by sprint"
              >
                <TaskFilterChip
                  active={sprintFilters.size === 0}
                  testId="task-list-sprint-all"
                  onClick={() => setSprintFilters(new Set())}
                  title={`${sprintFacetTasks.length} tasks match other filters`}
                >
                  All sprints
                  <span className="qa-tester-meta task-list-sprint__meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <span className="task-list-sprint__count">· {sprintFacetTasks.length}</span>
                  </span>
                </TaskFilterChip>
                <TaskFilterChip
                  active={sprintFilters.has(BACKLOG_SPRINT)}
                  testId="task-list-sprint-backlog"
                  onClick={() => toggleSprintFilter(BACKLOG_SPRINT)}
                  title="Backlog (unscheduled)"
                  accent="#6B5344"
                >
                  <span className="qa-tester-dot" style={{ background: "#6B5344" }} />
                  Backlog
                  <span className="qa-tester-meta task-list-sprint__meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <span className="task-list-sprint__count">
                      ·{" "}
                      {
                        sprintFacetTasks.filter((t) => (t.sprint ?? 0) === BACKLOG_SPRINT)
                          .length
                      }
                    </span>
                  </span>
                </TaskFilterChip>
                {sprints.map((s) => {
                  const active = sprintFilters.has(s.index);
                  const inSprint = sprintFacetTasks.filter((t) => (t.sprint ?? 0) === s.index);
                  const count = inSprint.length;
                  const doneCount = inSprint.filter((t) => t.status === "done").length;
                  // Global rolled-in count (not narrowed by other filters) — same as Testing Portal.
                  const rolledIn = countTasksRolledIntoSprint(
                    tasks.filter((t) => (t.sprint ?? 0) === s.index),
                    s.index,
                  );
                  const isCurrent = s.index === liveSprintIndex;
                  const accent = isCurrent ? "#5f7a45" : "#947D64";
                  return (
                    <TaskFilterChip
                      key={s.index}
                      active={active}
                      current={isCurrent}
                      testId={`task-list-sprint-${s.index}`}
                      onClick={() => toggleSprintFilter(s.index)}
                      title={
                        isCurrent
                          ? `${s.label} (current) · ${s.rangeLabel} · ${doneCount}/${count} done · ${rolledIn} rolled over`
                          : `${s.label} · ${s.rangeLabel} · ${doneCount}/${count} done · ${rolledIn} rolled over`
                      }
                      accent={accent}
                    >
                      <span className="qa-tester-dot" style={{ background: accent }} />
                      <span className="task-list-sprint__label-block">
                        <span className="task-list-sprint__name">
                          {s.label}
                          {isCurrent ? " · current" : ""}
                        </span>
                        <span className="task-list-sprint__dates">{s.numericRangeLabel}</span>
                      </span>
                      <span
                        className="qa-tester-meta task-list-sprint__meta"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        <span className="task-list-sprint__count">
                          · {doneCount}/{count}
                        </span>
                        {rolledIn > 0 ? (
                          <span
                            className="status-bubble__rolled"
                            data-testid={`task-list-sprint-${s.index}-rolled`}
                          >
                            Rolled over: {rolledIn}
                          </span>
                        ) : null}
                      </span>
                    </TaskFilterChip>
                  );
                })}
                <TaskFilterChip
                  active={rolledOverOnly}
                  testId="task-list-rolled-over"
                  onClick={() => setRolledOverOnly((v) => !v)}
                  title={
                    sprintFilters.size === 1 && !sprintFilters.has(BACKLOG_SPRINT)
                      ? `Show only tasks rolled into ${sprintLabel([...sprintFilters][0]!)} (${rolledOverFacetCount})`
                      : `Show only rolled-over tasks (${rolledOverFacetCount})`
                  }
                  accent="#0e7490"
                >
                  <span className="qa-tester-dot" style={{ background: "#0e7490" }} />
                  Rolled Over
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    · {rolledOverFacetCount}
                  </span>
                </TaskFilterChip>
              </div>
            </TaskFilterPanel>

            <TaskFilterPanel
              title="Assignee"
              hint="multi"
              testId="task-list-filter-assignee"
              open={filterOpen.assignee}
              onOpenChange={(open) => setFilterOpen((p) => ({ ...p, assignee: open }))}
              summary={
                ownerFilters.size === 0
                  ? "All assignees"
                  : [...ownerFilters].map((id) => OWNER_DISPLAY[id] ?? id).join(", ")
              }
            >
              <div
                className="task-list-toolbar__chips"
                role="group"
                aria-label="Filter by assignee"
              >
                <TaskFilterChip
                  active={ownerFilters.size === 0}
                  onClick={() => setOwnerFilters(new Set())}
                  title={`${ownerFacetTasks.length} match other filters · ${ownerFacetTasks.filter((t) => t.status === "done").length} done · ${ownerFacetTasks.filter((t) => noteIndicatesRollover(t.notes)).length} rolled over`}
                >
                  All
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    · {ownerFacetTasks.filter((t) => t.status === "done").length}✓ /{" "}
                    {ownerFacetTasks.length}
                    {ownerFacetTasks.filter((t) => noteIndicatesRollover(t.notes)).length > 0 ? (
                      <span className="status-bubble__rolled">
                        Rolled over:{" "}
                        {ownerFacetTasks.filter((t) => noteIndicatesRollover(t.notes)).length}
                      </span>
                    ) : null}
                  </span>
                </TaskFilterChip>
                {OWNER_BUBBLES.map((b) => {
                  const active = ownerFilters.has(b.id);
                  const { assigned, done, rolled } = ownerBubbleCounts(ownerFacetTasks, b.id);
                  const countTitle =
                    b.id === "Both"
                      ? `${assigned} assigned to Both · ${done} done · ${rolled} rolled over`
                      : b.id === "Lyriq" || b.id === "Unassigned"
                        ? `${assigned} assigned to ${b.label} · ${done} done · ${rolled} rolled over`
                        : `${assigned} assigned to ${b.label} (incl. Both) · ${done} done · ${rolled} rolled over`;
                  return (
                    <TaskFilterChip
                      key={b.id}
                      active={active}
                      onClick={() => toggleOwnerFilter(b.id)}
                      title={countTitle}
                      accent={b.accent}
                    >
                      {b.accent && <span className="qa-tester-dot" style={{ background: b.accent }} />}
                      {b.label}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {done}✓ / {assigned}
                        {rolled > 0 ? (
                          <span className="status-bubble__rolled">Rolled over: {rolled}</span>
                        ) : null}
                      </span>
                    </TaskFilterChip>
                  );
                })}
              </div>
            </TaskFilterPanel>

            <TaskFilterPanel
              title="Status"
              hint="multi"
              testId="task-list-filter-status"
              open={filterOpen.status}
              onOpenChange={(open) => setFilterOpen((p) => ({ ...p, status: open }))}
              summary={
                statusFilters.size === 0
                  ? "All statuses"
                  : [...statusFilters]
                      .map((id) => STATUS_LEGEND.find((s) => s.id === id)?.label ?? id)
                      .join(", ")
              }
            >
              <div
                className="task-list-toolbar__chips task-list-toolbar__chips--status"
                role="group"
                aria-label="Filter by status"
              >
                <TaskFilterChip
                  active={statusFilters.size === 0}
                  onClick={() => setStatusFilters(new Set())}
                  title={`${statusFacetTasks.length} tasks match other filters`}
                >
                  All statuses
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    · {statusFacetTasks.length}
                    {statusFacetTasks.filter((t) => noteIndicatesRollover(t.notes)).length > 0 ? (
                      <span className="status-bubble__rolled">
                        Rolled over:{" "}
                        {statusFacetTasks.filter((t) => noteIndicatesRollover(t.notes)).length}
                      </span>
                    ) : null}
                  </span>
                </TaskFilterChip>
                {STATUS_LEGEND.map((s) => {
                  const active = statusFilters.has(s.id);
                  const inStatus = statusFacetTasks.filter((t) => t.status === s.id);
                  const count = inStatus.length;
                  const rolled = inStatus.filter((t) => noteIndicatesRollover(t.notes)).length;
                  return (
                    <TaskFilterChip
                      key={s.id}
                      active={active}
                      onClick={() => toggleStatusFilter(s.id)}
                      title={`Filter: ${s.label} (${count}) · ${rolled} rolled over`}
                      accent={STATUS_ACCENT[s.id]}
                    >
                      <span className="qa-tester-dot" style={{ background: STATUS_ACCENT[s.id] }} />
                      {s.label}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {count}
                        {rolled > 0 ? (
                          <span className="status-bubble__rolled">Rolled over: {rolled}</span>
                        ) : null}
                      </span>
                    </TaskFilterChip>
                  );
                })}
              </div>
            </TaskFilterPanel>

            <TaskFilterPanel
              title="Category"
              hint="multi"
              testId="task-list-filter-category"
              open={filterOpen.category}
              onOpenChange={(open) => setFilterOpen((p) => ({ ...p, category: open }))}
              summary={
                categoryFilters.size === 0
                  ? "All categories"
                  : categoryFilters.size === 1
                    ? categoryLabel([...categoryFilters][0]!)
                    : `${categoryFilters.size} categories`
              }
            >
              <div
                className="task-list-toolbar__chips"
                role="group"
                aria-label="Filter by category"
              >
                <TaskFilterChip
                  active={categoryFilters.size === 0}
                  onClick={() => setCategoryFilters(new Set())}
                  title={`Show all categories (${categoryFacetTasks.length})`}
                >
                  All
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    · {categoryFacetTasks.length}
                  </span>
                </TaskFilterChip>
                {CATEGORY_BUBBLES.map((b) => {
                  const active = categoryFilters.has(b.id);
                  const count = categoryFacetTasks.filter((t) => t.category === b.id).length;
                  return (
                    <TaskFilterChip
                      key={b.id}
                      active={active}
                      onClick={() => toggleCategoryFilter(b.id)}
                      title={`Filter: ${b.label} (${count})`}
                    >
                      {b.label}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {count}
                      </span>
                    </TaskFilterChip>
                  );
                })}
              </div>
            </TaskFilterPanel>
          </div>

          <div className="task-list-filters__footer">
            <p className="task-list-toolbar__hint">
              Defaults to the current sprint. Each sprint bubble shows how many tasks rolled in.
              Use Rolled Over to list only those. Checkboxes below for bulk edits.
            </p>
            <div className="task-legend task-legend--compact" aria-label="Due date colors">
              <span className="task-legend-item">
                <span className="task-legend-swatch" style={{ background: "#9B2F28" }} />
                Overdue
              </span>
              <span className="task-legend-item">
                <span className="task-legend-swatch" style={{ background: "#947D64" }} />
                Due today
              </span>
            </div>
          </div>
        </div>
      </div>

      {someSelected && (
        <div
          className="glass"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            border: "1px solid var(--bronze)",
            background: "rgba(215,198,151,0.25)",
          }}
        >
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--charcoal)" }}>
            {selectedIds.size} selected
          </span>
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }}>Category</label>
          <select
            className="select-input"
            style={{ width: 180 }}
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value as TaskCategory | "";
              if (v) patchSelected({ category: v });
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Change…
            </option>
            {TASK_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }}>Assignee</label>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "6px 12px", fontSize: "0.9375rem", background: OWNER_SWATCH.Lyriq, borderColor: OWNER_SWATCH.Lyriq }}
            onClick={() => void patchSelected({ assignedTo: "Lyriq" })}
          >
            Assign Lyriq
          </button>
          <select
            className="select-input"
            style={{ width: 120 }}
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value as GyshTask["assignedTo"] | "";
              if (v) patchSelected({ assignedTo: v });
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Change…
            </option>
            <option value={UNASSIGNED_OWNER}>Unassigned</option>
            <option value="Tina">Tina</option>
            <option value="Evelyn">Evelyn</option>
            <option value="Lyriq">Lyriq</option>
            <option value="Both">Both</option>
          </select>
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }}>Sprint</label>
          <select
            className="select-input"
            style={{ width: 130 }}
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              if (v !== "") patchSelected({ sprint: Number(v) });
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Change…
            </option>
            <option value={BACKLOG_SPRINT}>Backlog</option>
            {sprints.map((s) => (
              <option key={s.index} value={s.index}>{s.label}</option>
            ))}
          </select>
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }}>Status</label>
          <select
            className="select-input"
            style={{ width: 140 }}
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value as TaskStatus | "";
              if (v) patchSelected({ status: v });
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Change…
            </option>
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }}>Priority</label>
          <select
            className="select-input"
            style={{ width: 130 }}
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value as TaskPriority | "";
              if (v) patchSelected({ priority: v });
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Change…
            </option>
            <option value="P0">P0 Severe</option>
            <option value="P1">P1 High</option>
            <option value="P2">P2 Medium</option>
            <option value="P3">P3 Low</option>
          </select>
          {isAdmin && (
            <>
              <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }}>
                Assigned By
              </label>
              <select
                className="select-input"
                style={{ width: 150 }}
                defaultValue=""
                aria-label="Bulk Assigned By for selected tasks"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) void patchSelected({ assignBy: v });
                  e.target.value = "";
                }}
              >
                <option value="" disabled>
                  Change…
                </option>
                {assignByOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          )}
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }}>Due</label>
          <input
            className="text-input"
            type="date"
            style={{ width: 150 }}
            value={bulkDueDate}
            onChange={(e) => setBulkDueDate(e.target.value)}
            aria-label="Bulk due date"
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              const normalized = isoToMmddyy(bulkDueDate);
              if (normalized === null || normalized === "") {
                setError("Pick a due date from the calendar.");
                return;
              }
              void patchSelected({ dueDate: normalized }).then(() => setBulkDueDate(""));
            }}
          >
            Apply due
          </button>
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }} htmlFor="task-bulk-desc">
            Description
          </label>
          <input
            id="task-bulk-desc"
            className="text-input"
            style={{ width: 220 }}
            value={bulkDescription}
            placeholder="Replace description…"
            onChange={(e) => setBulkDescription(e.target.value)}
            aria-label="Bulk description for selected tasks"
          />
          <button
            type="button"
            className="btn btn-outline"
            disabled={!bulkDescription.trim()}
            onClick={() => {
              const next = bulkDescription.trim();
              if (!next) {
                setError("Enter a description to apply.");
                return;
              }
              void patchSelected({ description: next }).then(() => setBulkDescription(""));
            }}
          >
            Apply description
          </button>
          <label className="form-label" style={{ margin: 0, fontSize: "0.9375rem" }} htmlFor="task-bulk-notes">
            Notes
          </label>
          <input
            id="task-bulk-notes"
            className="text-input"
            style={{ width: 200 }}
            value={bulkNotes}
            placeholder="Append your note…"
            onChange={(e) => setBulkNotes(e.target.value)}
            aria-label="Bulk append note for selected tasks"
          />
          <button
            type="button"
            className="btn btn-outline"
            disabled={!bulkNotes.trim()}
            onClick={() => {
              const next = bulkNotes.trim();
              if (!next) {
                setError("Enter a note to append.");
                return;
              }
              void (async () => {
                for (const id of selectedIds) {
                  const t = tasksRef.current.find((x) => x.id === id);
                  if (!t) continue;
                  await patch(id, {
                    notes: appendActorNote(t.notes, actingAssignBy, next),
                  });
                }
                setBulkNotes("");
              })();
            }}
          >
            Append notes
          </button>
          <button type="button" className="btn btn-outline" style={{ color: "#9B2F28" }} onClick={deleteSelected}>
            <Trash2 size={14} /> Delete
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px", flexWrap: "wrap" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.95rem", color: "var(--charcoal)" }}>
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleSelectAllFiltered}
            disabled={filteredIds.length === 0}
            aria-label="Select all visible tasks"
          />
          Select all{filteredIds.length ? ` (${filteredIds.length})` : ""}
        </label>
        {(searchQuery.trim() || !filtersAreAll) && (
          <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
            Showing {filtered.length} of {tasks.length}
            {searchQuery.trim() ? (
              <>
                {" "}· search: <strong style={{ color: "var(--charcoal)" }}>{searchQuery.trim()}</strong>
              </>
            ) : null}
            {idSearchBypassedFilters ? (
              <>
                {" "}· <span style={{ color: "var(--bronze)" }}>Task # match ignores other filters</span>
              </>
            ) : null}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <WaitIndicator message="Loading tasks from database…" style={{ marginTop: 0 }} />}
        {!loading && !error && filtered.length === 0 && (
          <div className="glass" style={{ padding: 24, textAlign: "center", color: "var(--text-primary)" }}>
            {tasks.length === 0
              ? "No tasks yet."
              : searchQuery.trim() || !filtersAreAll
                ? "No tasks match this search / filters. Click Re-Set (or All assignees / All statuses / All sprints) and try again."
                : "No tasks yet."}
          </div>
        )}
        {filtered.map((t) => {
          const open = !!expanded[t.id];
          const count = t.attachments?.length ?? 0;
          const checked = selectedIds.has(t.id);
          const overdue = isTaskOverdue(t);
          const dueToday = isTaskDueToday(t);
          const dueColor = overdue ? "#9B2F28" : dueToday ? "var(--bronze)" : "var(--text-muted)";
          const locked = isSprintLocked(closedSprints, t.sprint);
          const rolledIn = noteIndicatesRollover(t.notes);
          return (
            <div
              key={t.id}
              id={`task-row-${t.id}`}
              className={`glass task-card task-card--${t.status}${rolledIn ? " task-card--rolled" : ""}`}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                outline:
                  highlightId === t.id
                    ? "2px solid #9B2F28"
                    : checked
                      ? "2px solid var(--bronze)"
                      : undefined,
                boxShadow:
                  highlightId === t.id ? "0 0 0 3px rgba(155,47,40,0.2)" : undefined,
                borderLeft: overdue
                  ? "3px solid #9B2F28"
                  : rolledIn
                    ? "3px solid #0e7490"
                    : undefined,
              }}
            >
              <div
                className="task-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 28px 70px minmax(0, 1fr)",
                  gap: 10,
                  alignItems: "start",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelect(t.id)}
                  aria-label={`Select ${t.id}`}
                  style={{ marginTop: 8 }}
                />
                <button
                  type="button"
                  onClick={() => toggleExpand(t.id)}
                  aria-label={open ? "Collapse attachments" : "Expand attachments"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    marginTop: 4,
                    color: "var(--bronze)",
                    display: "flex",
                  }}
                >
                  {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <span className="flat-label flat-label--id" style={{ marginTop: 6 }}>{t.id}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {rolledIn ? (
                      <span
                        className="task-card__rolled-badge"
                        title="Rolled over from a prior sprint"
                      >
                        Rolled over
                      </span>
                    ) : null}
                    <textarea
                      className="text-input"
                      defaultValue={t.description}
                      key={`${t.id}-desc-${t.description}`}
                      aria-label={`Description for ${t.id}`}
                      rows={2}
                      style={{
                        flex: "1 1 220px",
                        minWidth: 160,
                        width: "100%",
                        color: "var(--charcoal)",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        lineHeight: 1.35,
                        resize: "vertical",
                        padding: "6px 8px",
                      }}
                      onBlur={(e) => void commitDescription(t.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          (e.target as HTMLTextAreaElement).blur();
                        }
                      }}
                    />
                    {(() => {
                      const openStep = taskOpenPageStep(t);
                      if (!openStep) return null;
                      return (
                        <p
                          style={{
                            flex: "1 1 100%",
                            margin: "4px 0 0",
                            fontSize: "0.9375rem",
                            color: "var(--text-primary)",
                            lineHeight: 1.4,
                          }}
                        >
                          <strong style={{ marginRight: 6 }}>1.</strong>
                          <MarkdownLinkText text={openStep} />
                        </p>
                      );
                    })()}
                    <span
                      className={
                        OWNER_LABEL_CLASS[
                          isBacklogSprint(t.sprint) ? UNASSIGNED_OWNER : t.assignedTo
                        ]
                      }
                    >
                      {isBacklogSprint(t.sprint) ? UNASSIGNED_OWNER : t.assignedTo}
                    </span>
                    <span className="flat-label flat-label--id">
                      {(t.sprint ?? 0) === BACKLOG_SPRINT ? "Backlog" : sprintLabel(t.sprint ?? 0)}
                    </span>
                    {t.assignedTo === "Both" && (
                      <span style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: 600 }}>
                        {partnerDoneSummary(t)}
                      </span>
                    )}
                    <span className={`task-status-chip task-status-chip--${t.status}`}>
                      <span className={`task-status-dot task-status-dot--${t.status}`} />
                      {TASK_STATUS_LABELS[t.status]}
                    </span>
                    {locked && (
                      <span
                        className="glow-badge"
                        style={{
                          fontSize: "0.8125rem",
                          background: "#475569",
                          color: "#fff",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title={sprintLockedMessage(Number(t.sprint))}
                      >
                        <Lock size={12} /> Locked
                      </span>
                    )}
                    {overdue && (
                      <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#9B2F28", textTransform: "uppercase" }}>
                        Overdue
                      </span>
                    )}
                    {dueToday && !overdue && (
                      <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--bronze)", textTransform: "uppercase" }}>
                        Due today
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)", marginTop: 4 }}>
                    <span style={{ color: "var(--charcoal)", fontWeight: 600 }}>{categoryLabel(t.category)}</span>
                    {count > 0 ? ` · ${count} file${count === 1 ? "" : "s"}` : ""}
                    {t.dateCompleted ? ` · Completed ${t.dateCompleted}` : ""}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginTop: 4,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px 14px",
                    }}
                    data-testid={`task-assigned-meta-${t.id}`}
                  >
                    <span>
                      Assigned By{" "}
                      <span style={{ color: "var(--charcoal)" }}>{t.assignBy || "—"}</span>
                    </span>
                    <span>
                      Assigned Date{" "}
                      <span style={{ color: "var(--charcoal)" }}>{t.dateAssigned || "—"}</span>
                    </span>
                  </div>
                  {formatAuditTrail(t.updatedAt, t.updatedBy) && (
                    <div
                      style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginTop: 4, opacity: 0.85 }}
                      data-testid={`task-audit-${t.id}`}
                    >
                      {formatAuditTrail(t.updatedAt, t.updatedBy)}
                    </div>
                  )}

                  <div
                    className="task-card-controls"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "8px 14px",
                      marginTop: 12,
                    }}
                  >
                    <label className="task-card-control">
                      <span>Category</span>
                      <select
                        className="select-input"
                        value={t.category}
                        onChange={(e) => void patch(t.id, { category: e.target.value as TaskCategory })}
                        aria-label={`Category for ${t.id}`}
                        disabled={locked}
                        title={locked ? sprintLockedMessage(Number(t.sprint)) : undefined}
                      >
                        {TASK_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="task-card-control">
                      <span>Assignee</span>
                      <select
                        className="select-input"
                        value={
                          isBacklogSprint(t.sprint) ? UNASSIGNED_OWNER : t.assignedTo
                        }
                        onChange={(e) =>
                          void patch(t.id, {
                            assignedTo: e.target.value as GyshTask["assignedTo"],
                          })
                        }
                        disabled={locked || isBacklogSprint(t.sprint)}
                        title={
                          locked
                            ? sprintLockedMessage(Number(t.sprint))
                            : isBacklogSprint(t.sprint)
                            ? "Backlog tasks stay Unassigned until moved into a sprint"
                            : undefined
                        }
                        style={{
                          borderLeft: `3px solid ${
                            OWNER_ACCENT[
                              isBacklogSprint(t.sprint) ? UNASSIGNED_OWNER : t.assignedTo
                            ]
                          }`,
                        }}
                        aria-label={`Assignee for ${t.id}`}
                      >
                        <option value={UNASSIGNED_OWNER}>Unassigned</option>
                        <option value="Tina">Tina</option>
                        <option value="Evelyn">Evelyn</option>
                        <option value="Lyriq">Lyriq</option>
                        <option value="Both">Both</option>
                      </select>
                    </label>
                    {isAdmin ? (
                      <label className="task-card-control">
                        <span>Assigned By</span>
                        <select
                          className="select-input"
                          value={t.assignBy || ""}
                          onChange={(e) => void patch(t.id, { assignBy: e.target.value })}
                          aria-label={`Assigned by for ${t.id}`}
                        >
                          {!t.assignBy && (
                            <option value="" disabled>
                              —
                            </option>
                          )}
                          {assignByOptions.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <div className="task-card-control">
                        <span>Assigned By</span>
                        <div
                          className="text-input"
                          style={{
                            padding: "8px 12px",
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            color: "var(--charcoal)",
                            background: "transparent",
                            border: "1px solid var(--border-color)",
                          }}
                          aria-label={`Assigned by for ${t.id}`}
                        >
                          {t.assignBy || "—"}
                        </div>
                      </div>
                    )}
                    <div className="task-card-control">
                      <span>Assigned Date</span>
                      <div
                        className="text-input"
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "var(--charcoal)",
                          background: "transparent",
                          border: "1px solid var(--border-color)",
                        }}
                        aria-label={`Assigned date for ${t.id}`}
                      >
                        {t.dateAssigned || "—"}
                      </div>
                    </div>
                    <label className="task-card-control">
                      <span>Sprint</span>
                      <select
                        className="select-input"
                        value={t.sprint ?? 0}
                        onChange={(e) => void patch(t.id, { sprint: Number(e.target.value) })}
                        aria-label={`Sprint for ${t.id}`}
                        disabled={locked}
                        title={locked ? sprintLockedMessage(Number(t.sprint)) : undefined}
                      >
                        <option value={BACKLOG_SPRINT}>Backlog</option>
                        {sprints.map((s) => (
                          <option
                            key={s.index}
                            value={s.index}
                            disabled={isSprintLocked(closedSprints, s.index)}
                          >
                            {s.label}
                            {isSprintLocked(closedSprints, s.index) ? " · Locked" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="task-card-control">
                      <span>Priority</span>
                      <select
                        className="select-input"
                        value={t.priority}
                        onChange={(e) => void patch(t.id, { priority: e.target.value as TaskPriority })}
                        aria-label={`Priority for ${t.id}`}
                        disabled={locked}
                        title={locked ? sprintLockedMessage(Number(t.sprint)) : undefined}
                      >
                        <option value="P0">P0 Severe</option>
                        <option value="P1">P1 High</option>
                        <option value="P2">P2 Medium</option>
                        <option value="P3">P3 Low</option>
                      </select>
                    </label>
                    <label className="task-card-control">
                      <span>Due date</span>
                      <input
                        className="text-input"
                        type="date"
                        value={mmddyyToIso(t.dueDate)}
                        key={`${t.id}-${t.dueDate}`}
                        aria-label={`Due date for ${t.id}`}
                        title={overdue ? "Overdue" : dueToday ? "Due today" : "Due date"}
                        style={{
                          color: dueColor,
                          fontWeight: overdue || dueToday ? 700 : 400,
                          borderColor: overdue ? "rgba(155,47,40,0.45)" : undefined,
                        }}
                        onChange={(e) => void commitDueDate(t.id, e.target.value)}
                        disabled={locked}
                      />
                    </label>
                    <label className="task-card-control">
                      <span>Status</span>
                      <select
                        className="select-input"
                        value={t.status}
                        onChange={(e) => {
                          const status = e.target.value as TaskStatus;
                          if (t.assignedTo === "Both" && status === "done" && !(t.tinaDone && t.evelynDone)) {
                            setError(
                              "Both T + E must mark their own Done before this task can be Done.",
                            );
                            return;
                          }
                          if (status === "in_progress" || status === "blocked") {
                            void maybeStartTaskTimer(t.id);
                          }
                          void patch(t.id, { status });
                        }}
                        style={{ borderLeft: `3px solid ${STATUS_ACCENT[t.status]}` }}
                        aria-label={`Status for ${t.id}`}
                        disabled={locked}
                        title={locked ? sprintLockedMessage(Number(t.sprint)) : undefined}
                      >
                        {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
                          <option key={s} value={s} disabled={t.assignedTo === "Both" && s === "done" && !(t.tinaDone && t.evelynDone)}>
                            {TASK_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="task-card-control task-card-control--timer">
                      <span>Time</span>
                      <WorkTimer
                        source="task"
                        sourceId={t.id}
                        sourceLabel={t.description}
                        entry={timers.entryFor("task", t.id)}
                        onChanged={timers.onChanged}
                        compact
                        disabled={t.status === "done"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {t.assignedTo === "Both" && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    paddingLeft: 66,
                  }}
                >
                  <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    Partner done (both required):
                  </span>
                  <button
                    type="button"
                    className={`btn ${t.tinaDone ? "btn-primary" : "btn-outline"}`}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.9375rem",
                      borderColor: OWNER_SWATCH.Tina,
                      background: t.tinaDone ? OWNER_SWATCH.Tina : undefined,
                      color: t.tinaDone ? "#fff" : OWNER_SWATCH.Tina,
                    }}
                    onClick={() => {
                      const next = !t.tinaDone;
                      if (next) void maybeStartTaskTimer(t.id);
                      void patch(t.id, { tinaDone: next });
                    }}
                  >
                    Tina {t.tinaDone ? "✓ Done" : "○ Mark done"}
                  </button>
                  <button
                    type="button"
                    className={`btn ${t.evelynDone ? "btn-primary" : "btn-outline"}`}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.9375rem",
                      borderColor: OWNER_SWATCH.Evelyn,
                      background: t.evelynDone ? OWNER_SWATCH.Evelyn : undefined,
                      color: t.evelynDone ? "#fff" : undefined,
                    }}
                    onClick={() => {
                      const next = !t.evelynDone;
                      if (next) void maybeStartTaskTimer(t.id);
                      void patch(t.id, { evelynDone: next });
                    }}
                  >
                    Evelyn {t.evelynDone ? "✓ Done" : "○ Mark done"}
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gap: 6,
                  marginTop: 10,
                  paddingLeft: 66,
                  fontSize: "0.9375rem",
                  color: "var(--text-primary)",
                  maxWidth: 720,
                }}
                onFocusCapture={() => void maybeStartTaskTimer(t.id)}
              >
                <NotesThread
                  rawNotes={t.notes}
                  actor={actingAssignBy}
                  priorAttribution={priorNoteAttribution(t)}
                  editDrafts={editNoteDrafts[t.id]}
                  newDraft={newNoteDrafts[t.id] ?? ""}
                  onEditDraft={(noteId, text) => setEditNoteDraft(t.id, noteId, text)}
                  onNewDraft={(text) => setNewNoteDraft(t.id, text)}
                  onDeleteNote={(noteId) => setEditNoteDraft(t.id, noteId, "")}
                  disabled={busy || locked}
                  label={
                    dirtyNoteIds.has(t.id)
                      ? "Notes (unsaved)"
                      : "Notes"
                  }
                  newPlaceholder="Add your note… (only you can edit or delete it later)"
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    maxWidth: 720,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary qa-save-btn--ready"
                    style={{ padding: "6px 14px", fontSize: "0.9375rem" }}
                    disabled={busy || locked || !dirtyNoteIds.has(t.id)}
                    onClick={() => {
                      if (locked) {
                        setError(sprintLockedMessage(Number(t.sprint)));
                        return;
                      }
                      void saveOneTask(t.id);
                    }}
                    title={
                      locked
                        ? sprintLockedMessage(Number(t.sprint))
                        : "Save notes for this task"
                    }
                  >
                    Save
                  </button>
                  <TaskAttachments
                    task={t}
                    mode="trigger"
                    trigger="paperclip"
                    onAfterUpload={() =>
                      setExpanded((prev) => ({ ...prev, [t.id]: true }))
                    }
                    onChange={(attachments) => void patch(t.id, { attachments })}
                  />
                  {count > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "6px 10px", fontSize: "0.9375rem" }}
                      onClick={() => toggleExpand(t.id)}
                      aria-expanded={open}
                      title={open ? "Hide attachments" : "Show attachments"}
                    >
                      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {open ? "Hide files" : `Show files (${count})`}
                    </button>
                  )}
                </div>
                {open && (
                  <TaskAttachments
                    task={t}
                    mode="list"
                    showList
                    onChange={(attachments) => void patch(t.id, { attachments })}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .task-card-controls {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
