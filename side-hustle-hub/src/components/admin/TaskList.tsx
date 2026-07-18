import { useEffect, useRef, useState } from "react";
import {
  ListChecks,
  Plus,
  RotateCcw,
  Paperclip,
  Trash2,
  FileText,
  FileImage,
  FileVideo,
  File,
  Download,
  ChevronDown,
  ChevronRight,
  Upload,
} from "lucide-react";
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
  todayIsoDate,
  applyPartnerDone,
  partnerDoneSummary,
  type GyshTask,
  type GyshTaskAttachment,
  type TaskStatus,
  type TaskPriority,
  type TaskCategory,
} from "../../lib/gysh-tasks";
import {
  deleteTaskFile,
  getTaskFile,
  newFileId,
  putTaskFile,
} from "../../lib/gysh-task-files";
import { ApiError } from "../../lib/api";
import { listUpcomingSprints, sprintLabel, BACKLOG_SPRINT } from "../../lib/gysh-sprints";

type OwnerFilter = "all" | GyshTask["assignedTo"];
type CategoryFilter = "all" | TaskCategory;

type MultiSelectOption = { value: string; label: string };

/** Compact dropdown that supports checking multiple options. */
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  allLabel = "All",
  width = 180,
}: {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  allLabel?: string;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? "1 selected"
        : `${selected.length} selected`;

  const toggle = (value: string) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };

  return (
    <div className="form-group" style={{ margin: 0, width, position: "relative" }} ref={rootRef}>
      <label className="form-label">{label}</label>
      <button
        type="button"
        className="select-input"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          background: "#fff",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: selected.length ? "var(--charcoal)" : "var(--text-muted)",
          }}
        >
          {summary}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: "absolute",
            zIndex: 40,
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            minWidth: width,
            maxHeight: 240,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(24,23,24,0.12)",
            padding: 6,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            <input
              type="checkbox"
              checked={selected.length === 0}
              onChange={() => onChange([])}
            />
            {allLabel}
          </label>
          <div style={{ height: 1, background: "var(--border-color)", margin: "4px 0" }} />
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                role="option"
                aria-selected={checked}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "var(--charcoal)",
                  background: checked ? "rgba(215,198,151,0.35)" : "transparent",
                }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(opt.value)} />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

const OWNER_ACCENT: Record<GyshTask["assignedTo"], string> = {
  Tina: "var(--crimson)",
  Evelyn: "var(--bronze)",
  Lyriq: "var(--accent-emerald)",
  Both: "var(--charcoal)",
};

/** Solid hex for legend swatches / select accents (CSS vars don't paint well as inline swatches). */
const OWNER_SWATCH: Record<GyshTask["assignedTo"], string> = {
  Tina: "#9B2F28",
  Evelyn: "#947D64",
  Lyriq: "#2e7d32",
  Both: "#181718",
};

const OWNER_LABEL_CLASS: Record<GyshTask["assignedTo"], string> = {
  Tina: "flat-label flat-label--assignee-tina",
  Evelyn: "flat-label flat-label--assignee-evelyn",
  Lyriq: "flat-label flat-label--assignee-lyriq",
  Both: "flat-label flat-label--assignee-both",
};

const STATUS_ACCENT: Record<TaskStatus, string> = {
  not_started: "#947D64",
  in_progress: "#c9a227",
  blocked: "#9B2F28",
  done: "#5f7a45",
};

const OWNER_BUBBLES: { id: OwnerFilter; label: string; accent?: string }[] = [
  { id: "all", label: "All" },
  { id: "Tina", label: "Tina", accent: OWNER_ACCENT.Tina },
  { id: "Evelyn", label: "Evelyn", accent: OWNER_ACCENT.Evelyn },
  { id: "Lyriq", label: "Lyriq", accent: OWNER_ACCENT.Lyriq },
  { id: "Both", label: "Both", accent: OWNER_ACCENT.Both },
];

/** Same assignee matching as the owner filter (T/E include Both). */
function tasksForOwner(tasks: GyshTask[], owner: OwnerFilter): GyshTask[] {
  if (owner === "all") return tasks;
  if (owner === "Both") return tasks.filter((t) => t.assignedTo === "Both");
  if (owner === "Lyriq") return tasks.filter((t) => t.assignedTo === "Lyriq");
  return tasks.filter((t) => t.assignedTo === owner || t.assignedTo === "Both");
}

function ownerBubbleCounts(tasks: GyshTask[], owner: OwnerFilter) {
  const matched = tasksForOwner(tasks, owner);
  return {
    assigned: matched.length,
    done: matched.filter((t) => t.status === "done").length,
  };
}

const STATUS_LEGEND: { id: TaskStatus; label: string }[] = [
  { id: "not_started", label: "Not started" },
  { id: "in_progress", label: "In progress" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

const CATEGORY_BUBBLES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  ...TASK_CATEGORIES.map((c) => ({ id: c.id as CategoryFilter, label: c.label })),
];

function attachmentIcon(mimeType: string, name: string) {
  const t = mimeType.toLowerCase();
  const n = name.toLowerCase();
  if (t.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(n)) return FileImage;
  if (t.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(n)) return FileVideo;
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

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    if (!isImage) return;
    (async () => {
      const rec = await getTaskFile(taskId, att.storedId);
      if (cancelled || !rec) return;
      const url = URL.createObjectURL(rec.blob);
      revoked = url;
      setPreviewUrl(url);
    })();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [taskId, att.storedId, isImage]);

  const openOrDownload = async () => {
    setBusy(true);
    try {
      const rec = await getTaskFile(taskId, att.storedId);
      if (!rec) {
        alert("File not found in local storage.");
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
            fontSize: "0.85rem",
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
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          {formatFileSize(att.size)} · {att.mimeType || "file"} · {att.addedAt}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
        onClick={openOrDownload}
        disabled={busy}
        title="Download / open"
      >
        <Download size={14} />
      </button>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#9B2F28" }}
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
}: {
  task: GyshTask;
  onChange: (attachments: GyshTaskAttachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    try {
      const next = [...(task.attachments ?? [])];
      for (const file of Array.from(files)) {
        if (!isAcceptedAttachment(file)) {
          setError(`Skipped unsupported file: ${file.name}`);
          continue;
        }
        const id = newFileId();
        const addedAt = todayMMDDYY();
        await putTaskFile({
          taskId: task.id,
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

  const remove = async (att: GyshTaskAttachment) => {
    await deleteTaskFile(task.id, att.storedId);
    onChange((task.attachments ?? []).filter((a) => a.id !== att.id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "6px 10px", fontSize: "0.8rem" }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} /> {uploading ? "Uploading…" : "Attach files"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTACHMENTS}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Images, PDF, Word, video (mp4/webm/mov), txt, csv
        </span>
      </div>
      {error && <div style={{ fontSize: "0.75rem", color: "#9B2F28" }}>{error}</div>}
      {(task.attachments ?? []).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(task.attachments ?? []).map((att) => (
            <AttachmentRow key={att.id} taskId={task.id} att={att} onRemove={() => remove(att)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskList({
  focusTaskId = null,
  onFocusConsumed,
}: {
  focusTaskId?: string | null;
  onFocusConsumed?: () => void;
} = {}) {
  const [tasks, setTasks] = useState<GyshTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState<GyshTask["assignedTo"]>("Evelyn");
  const [newCategory, setNewCategory] = useState<TaskCategory>("admin_ops");
  const [newDueDate, setNewDueDate] = useState(todayIsoDate());
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(() => new Set());
  const [sprintFilters, setSprintFilters] = useState<Set<number>>(() => new Set());
  const [newSprint, setNewSprint] = useState(BACKLOG_SPRINT);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const sprints = listUpcomingSprints();

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      // Ensure a review task exists for every launch guide (idempotent; persists to D1).
      const synced = await syncGuideReviewTasks();
      setTasks(synced.tasks);
    } catch (e) {
      try {
        setTasks(await fetchTasks());
      } catch {
        setTasks([]);
      }
      setError(e instanceof ApiError ? e.message : "Failed to load tasks from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!focusTaskId || loading) return;
    const exists = tasks.some((t) => t.id === focusTaskId);
    if (!exists) {
      onFocusConsumed?.();
      return;
    }
    // Clear filters so the focused task is visible
    setOwnerFilter("all");
    setCategoryFilter("all");
    setStatusFilters(new Set());
    setSprintFilters(new Set());
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

  const persist = async (next: GyshTask[]) => {
    tasksRef.current = next;
    setTasks(next);
    setBusy(true);
    setError("");
    const run = async () => {
      try {
        const saved = await persistTasks(tasksRef.current);
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

  const filtered = tasks.filter((t) => {
    if (ownerFilter === "Both") {
      if (t.assignedTo !== "Both") return false;
    } else if (ownerFilter === "Lyriq") {
      if (t.assignedTo !== "Lyriq") return false;
    } else if (ownerFilter !== "all") {
      if (t.assignedTo !== ownerFilter && t.assignedTo !== "Both") return false;
    }
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (statusFilters.size > 0 && !statusFilters.has(t.status)) return false;
    if (sprintFilters.size > 0 && !sprintFilters.has(t.sprint ?? 0)) return false;
    return true;
  });

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const filteredIds = filtered.map((t) => t.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const addTask = async () => {
    if (!desc.trim()) return;
    const t: GyshTask = {
      id: nextTaskId(tasks),
      description: desc.trim(),
      category: newCategory,
      priority: "P2",
      status: "not_started",
      assignBy: "Evelyn",
      assignedTo: assignee,
      dateAssigned: todayMMDDYY(),
      dueDate: isoToMmddyy(newDueDate) || todayMMDDYY(),
      dateCompleted: "",
      notes: "",
      sprint: newSprint,
      tinaDone: false,
      evelynDone: false,
      attachments: [],
    };
    try {
      await persist([t, ...tasksRef.current]);
      setDesc("");
      setNewDueDate(todayIsoDate());
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

  const commitNotes = async (id: string, raw: string) => {
    const next = raw.trim();
    const current = tasks.find((t) => t.id === id);
    if (!current || current.notes === next) return;
    await patch(id, { notes: next });
  };

  const patch = async (id: string, updates: Partial<GyshTask>) => {
    const next = tasksRef.current.map((t) => {
      if (t.id !== id) return t;
      return applyPartnerDone(t, updates);
    });
    try {
      await persist(next);
    } catch {
      /* error already set */
    }
  };

  const patchSelected = async (updates: Partial<GyshTask>) => {
    if (selectedIds.size === 0) return;
    const next = tasksRef.current.map((t) => {
      if (!selectedIds.has(t.id)) return t;
      return applyPartnerDone(t, updates);
    });
    try {
      await persist(next);
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
      await persist(tasks.filter((t) => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    } catch {
      /* error already set */
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
      <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8 }}>
              <ListChecks size={22} style={{ color: "var(--bronze)" }} /> Task List
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: "0.9rem" }}>
              T + E operational tracker — saved in production D1.
            </p>
            <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.78rem" }}>
              Attachment files stay in this browser (IndexedDB) until R2 phase 2; metadata is in the database.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void reload()}
            disabled={loading || busy}
          >
            <RotateCcw size={14} /> Reload
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, alignItems: "end" }}>
          <div className="form-group" style={{ margin: 0, flex: "1 1 280px" }}>
            <label className="form-label">New task</label>
            <input className="text-input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What needs doing?" disabled={Boolean(error) && tasks.length === 0} />
          </div>
          <div className="form-group" style={{ margin: 0, width: 180 }}>
            <label className="form-label">Category</label>
            <select className="select-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value as TaskCategory)}>
              {TASK_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, width: 140 }}>
            <label className="form-label">Assign to</label>
            <select className="select-input" value={assignee} onChange={(e) => setAssignee(e.target.value as GyshTask["assignedTo"])}>
              <option value="Tina">Tina</option>
              <option value="Evelyn">Evelyn</option>
              <option value="Lyriq">Lyriq</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, width: 150 }}>
            <label className="form-label">Due date</label>
            <input
              className="text-input"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              aria-label="Due date for new task"
            />
          </div>
          <div className="form-group" style={{ margin: 0, width: 130 }}>
            <label className="form-label">Sprint</label>
            <select className="select-input" value={newSprint} onChange={(e) => setNewSprint(Number(e.target.value))}>
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

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 220px", minWidth: 200 }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                Assignees
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {OWNER_BUBBLES.map((b) => {
                  const active = ownerFilter === b.id;
                  const { assigned, done } = ownerBubbleCounts(tasks, b.id);
                  const countTitle =
                    b.id === "all"
                      ? `${assigned} total · ${done} done`
                      : b.id === "Both"
                        ? `${assigned} assigned to Both · ${done} done`
                        : b.id === "Lyriq"
                          ? `${assigned} assigned to Lyriq · ${done} done`
                          : `${assigned} assigned to ${b.label} (incl. Both) · ${done} done`;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className="qa-tester-bubble"
                      data-active={active ? "true" : "false"}
                      onClick={() => setOwnerFilter(b.id)}
                      title={countTitle}
                      style={{
                        borderColor: active && b.accent ? b.accent : undefined,
                        boxShadow: active && b.accent ? `0 0 0 1px ${b.accent}` : undefined,
                      }}
                    >
                      {b.accent && <span className="qa-tester-dot" style={{ background: b.accent }} />}
                      {b.label}
                      <span className="qa-tester-meta" style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                        {done}✓ / {assigned}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ flex: "1 1 240px", minWidth: 200 }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
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
                {STATUS_LEGEND.map((s) => {
                  const active = statusFilters.has(s.id);
                  const count = tasks.filter((t) => t.status === s.id).length;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className="qa-tester-bubble"
                      data-active={active ? "true" : "false"}
                      onClick={() => toggleStatusFilter(s.id)}
                      style={{
                        borderColor: active ? STATUS_ACCENT[s.id] : undefined,
                        boxShadow: active ? `0 0 0 1px ${STATUS_ACCENT[s.id]}` : undefined,
                      }}
                    >
                      <span className="qa-tester-dot" style={{ background: STATUS_ACCENT[s.id] }} />
                      {s.label}
                      <span className="qa-tester-meta">· {count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <MultiSelectDropdown
              label="Sprints"
              allLabel="All sprints"
              width={180}
              selected={Array.from(sprintFilters).map(String)}
              onChange={(next) => setSprintFilters(new Set(next.map(Number)))}
              options={[
                {
                  value: String(BACKLOG_SPRINT),
                  label: `Backlog (${tasks.filter((t) => (t.sprint ?? 0) === BACKLOG_SPRINT).length})`,
                },
                ...sprints.map((s) => ({
                  value: String(s.index),
                  label: `${s.label} (${tasks.filter((t) => (t.sprint ?? 0) === s.index).length})`,
                })),
              ]}
            />
          </div>
          <p style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Select tasks with checkboxes, then bulk-assign (including Lyriq). Status buttons toggle filters.
          </p>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Categories — click to filter
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {CATEGORY_BUBBLES.map((b) => {
              const active = categoryFilter === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  className="qa-tester-bubble"
                  data-active={active ? "true" : "false"}
                  onClick={() => setCategoryFilter(b.id)}
                  title={b.id === "all" ? "Show all categories" : `Filter: ${b.label}`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="task-legend" aria-label="Color legend">
          <span style={{ fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.65rem" }}>
            Status
          </span>
          {STATUS_LEGEND.map((s) => (
            <span key={s.id} className="task-legend-item">
              <span className="task-legend-swatch" style={{ background: STATUS_ACCENT[s.id] }} />
              {s.label}
            </span>
          ))}
          <span style={{ fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.65rem", marginLeft: 8 }}>
            Assignee
          </span>
          {(Object.keys(OWNER_SWATCH) as GyshTask["assignedTo"][]).map((name) => (
            <span key={name} className="task-legend-item">
              <span className="task-legend-swatch" style={{ background: OWNER_SWATCH[name] }} />
              {name}
            </span>
          ))}
          <span style={{ fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.65rem", marginLeft: 8 }}>
            Due
          </span>
          <span className="task-legend-item">
            <span className="task-legend-swatch" style={{ background: "#9B2F28" }} />
            Overdue
          </span>
          <span className="task-legend-item">
            <span className="task-legend-swatch" style={{ background: "#947D64" }} />
            Today
          </span>
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
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--charcoal)" }}>
            {selectedIds.size} selected
          </span>
          <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Category</label>
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
          <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Assignee</label>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "6px 12px", fontSize: "0.8rem", background: OWNER_SWATCH.Lyriq, borderColor: OWNER_SWATCH.Lyriq }}
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
            <option value="Tina">Tina</option>
            <option value="Evelyn">Evelyn</option>
            <option value="Lyriq">Lyriq</option>
            <option value="Both">Both</option>
          </select>
          <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Sprint</label>
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
          <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Status</label>
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
          <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Priority</label>
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
          <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Due</label>
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
          <button type="button" className="btn btn-outline" style={{ color: "#9B2F28" }} onClick={deleteSelected}>
            <Trash2 size={14} /> Delete
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem", color: "var(--charcoal)" }}>
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleSelectAllFiltered}
            disabled={filteredIds.length === 0}
            aria-label="Select all visible tasks"
          />
          Select all{filteredIds.length ? ` (${filteredIds.length})` : ""}
        </label>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <p style={{ color: "var(--text-muted)" }}>Loading tasks from database…</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="glass" style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}>
            No tasks yet.
          </div>
        )}
        {filtered.map((t) => {
          const open = !!expanded[t.id];
          const count = t.attachments?.length ?? 0;
          const checked = selectedIds.has(t.id);
          const overdue = isTaskOverdue(t);
          const dueToday = isTaskDueToday(t);
          const dueColor = overdue ? "#9B2F28" : dueToday ? "var(--bronze)" : "var(--text-muted)";
          return (
            <div
              key={t.id}
              id={`task-row-${t.id}`}
              className={`glass task-card task-card--${t.status}`}
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
                borderLeft: overdue ? "3px solid #9B2F28" : undefined,
              }}
            >
              <div
                className="task-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 28px 70px minmax(0, 1fr) 44px",
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
                    <span className={OWNER_LABEL_CLASS[t.assignedTo]}>{t.assignedTo}</span>
                    <span className="flat-label flat-label--id">
                      {(t.sprint ?? 0) === BACKLOG_SPRINT ? "Backlog" : sprintLabel(t.sprint ?? 0)}
                    </span>
                    {t.assignedTo === "Both" && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        {partnerDoneSummary(t)}
                      </span>
                    )}
                    <span className={`task-status-chip task-status-chip--${t.status}`}>
                      <span className={`task-status-dot task-status-dot--${t.status}`} />
                      {TASK_STATUS_LABELS[t.status]}
                    </span>
                    {overdue && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9B2F28", textTransform: "uppercase" }}>
                        Overdue
                      </span>
                    )}
                    {dueToday && !overdue && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--bronze)", textTransform: "uppercase" }}>
                        Due today
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                    <span style={{ color: "var(--charcoal)", fontWeight: 600 }}>{categoryLabel(t.category)}</span>
                    {" · by "}
                    {t.assignBy}
                    {count > 0 ? ` · ${count} file${count === 1 ? "" : "s"}` : ""}
                    {t.dateCompleted ? ` · Completed ${t.dateCompleted}` : ""}
                  </div>

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
                        value={t.assignedTo}
                        onChange={(e) => void patch(t.id, { assignedTo: e.target.value as GyshTask["assignedTo"] })}
                        style={{ borderLeft: `3px solid ${OWNER_ACCENT[t.assignedTo]}` }}
                        aria-label={`Assignee for ${t.id}`}
                      >
                        <option value="Tina">Tina</option>
                        <option value="Evelyn">Evelyn</option>
                        <option value="Lyriq">Lyriq</option>
                        <option value="Both">Both</option>
                      </select>
                    </label>
                    <label className="task-card-control">
                      <span>Sprint</span>
                      <select
                        className="select-input"
                        value={t.sprint ?? 0}
                        onChange={(e) => void patch(t.id, { sprint: Number(e.target.value) })}
                        aria-label={`Sprint for ${t.id}`}
                      >
                        <option value={BACKLOG_SPRINT}>Backlog</option>
                        {sprints.map((s) => (
                          <option key={s.index} value={s.index}>{s.label}</option>
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
                          void patch(t.id, { status });
                        }}
                        style={{ borderLeft: `3px solid ${STATUS_ACCENT[t.status]}` }}
                        aria-label={`Status for ${t.id}`}
                      >
                        {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
                          <option key={s} value={s} disabled={t.assignedTo === "Both" && s === "done" && !(t.tinaDone && t.evelynDone)}>
                            {TASK_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: "6px 8px", marginTop: 4 }}
                  onClick={() => toggleExpand(t.id)}
                  title="Attachments"
                >
                  <Paperclip size={14} />
                </button>
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
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Partner done (both required):
                  </span>
                  <button
                    type="button"
                    className={`btn ${t.tinaDone ? "btn-primary" : "btn-outline"}`}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.78rem",
                      borderColor: OWNER_SWATCH.Tina,
                      background: t.tinaDone ? OWNER_SWATCH.Tina : undefined,
                      color: t.tinaDone ? "#fff" : OWNER_SWATCH.Tina,
                    }}
                    onClick={() => void patch(t.id, { tinaDone: !t.tinaDone })}
                  >
                    Tina {t.tinaDone ? "✓ Done" : "○ Mark done"}
                  </button>
                  <button
                    type="button"
                    className={`btn ${t.evelynDone ? "btn-primary" : "btn-outline"}`}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.78rem",
                      borderColor: OWNER_SWATCH.Evelyn,
                      background: t.evelynDone ? OWNER_SWATCH.Evelyn : undefined,
                      color: t.evelynDone ? "#fff" : undefined,
                    }}
                    onClick={() => void patch(t.id, { evelynDone: !t.evelynDone })}
                  >
                    Evelyn {t.evelynDone ? "✓ Done" : "○ Mark done"}
                  </button>
                </div>
              )}

              <label
                style={{
                  display: "grid",
                  gap: 6,
                  marginTop: 10,
                  paddingLeft: 66,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                Notes
                <textarea
                  className="text-input"
                  rows={2}
                  defaultValue={t.notes}
                  key={`${t.id}-notes-${t.notes}`}
                  aria-label={`Notes for ${t.id}`}
                  placeholder="Add notes for this task…"
                  style={{ resize: "vertical", width: "100%", maxWidth: 720 }}
                  onBlur={(e) => void commitNotes(t.id, e.target.value)}
                />
              </label>

              {open && (
                <div style={{ marginTop: 12, paddingLeft: 38 }}>
                  <TaskAttachments
                    task={t}
                    onChange={(attachments) => void patch(t.id, { attachments })}
                  />
                </div>
              )}
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
