import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, RotateCcw, Trash2, Pencil, Search, Download, ExternalLink, Save, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  loadTaskRows, saveTaskRows, resetTaskRows, nextTaskId, todayMMDDYY,
  TASK_STATUS_VALUES, TASK_STATUS_LABELS,
  type TaskRow, type TaskRowStatus,
} from "@/lib/tasks-sheet";
import { SPRINTS, ACTIVE_SPRINT_ID, PRIORITY_LABELS, PRIORITY_SHORT, type Priority } from "@/lib/test-plan";
import { MultiSelect, multiSelectMatches } from "@/components/ui/multi-select";
import { DateField } from "@/components/DateField";

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];

const STATUS_TONE: Record<TaskRowStatus, string> = {
  not_started: "border-muted-foreground/30 text-muted-foreground",
  in_progress: "border-blue-500/40 text-blue-500",
  blocked: "border-destructive/50 text-destructive",
  done: "border-emerald-500/40 text-emerald-600",
};
const ROW_STATUS_BG: Record<TaskRowStatus, string> = {
  not_started: "",
  in_progress: "bg-blue-500/5 hover:bg-blue-500/10",
  blocked: "bg-destructive/10 hover:bg-destructive/15",
  done: "bg-emerald-500/10 hover:bg-emerald-500/15",
};
const PRIORITY_TONE: Record<Priority, string> = {
  P0: "border-destructive/60 text-destructive",
  P1: "border-amber-500/50 text-amber-600",
  P2: "border-blue-500/40 text-blue-500",
  P3: "border-muted-foreground/40 text-muted-foreground",
};

function emptyDraft(): TaskRow {
  return {
    id: "",
    description: "",
    sprintId: ACTIVE_SPRINT_ID,
    category: "general",
    priority: "P2",
    status: "not_started",
    assignBy: "Evelyn",
    assignedTo: "Catria",
    dateAssigned: todayMMDDYY(),
    dueDate: "",
    dateCompleted: "",
    cost: 0,
    notes: "",
    path: "",
  };
}

function TaskTargetLink({ path }: { path?: string }) {
  if (!path) return null;
  const isExternal = /^https?:\/\//.test(path);
  const label = path.length > 28 ? path.slice(0, 27) + "…" : path;
  const className =
    "inline-flex items-center gap-1 text-[11px] font-mono rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-primary hover:bg-primary/10 transition-colors";
  if (isExternal) {
    return (
      <a href={path} target="_blank" rel="noreferrer" className={className} title={`Open ${path}`} onClick={(e) => e.stopPropagation()}>
        <ExternalLink className="h-3 w-3" />
        {label}
      </a>
    );
  }
  return (
    <Link to={path as never} target="_blank" className={className} title={`Open ${path}`} onClick={(e) => e.stopPropagation()}>
      <ExternalLink className="h-3 w-3" />
      {label}
    </Link>
  );
}

function StatBadge({ n, label, color, active, onClick }: { n: number; label: string; color: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ${color} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${active ? "ring-2 ring-offset-1 ring-emerald-500" : ""}`}
    >
      {n} <span className="font-normal opacity-80">{label}</span>
    </button>
  );
}

const TASK_STATUS_STYLES: Record<TaskRowStatus, string> = {
  not_started: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  blocked: "bg-destructive/10 text-destructive border-destructive/30",
  done: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

export function TaskSheetContent() {
  // savedRows = last persisted snapshot; rows = working draft (unsaved edits)
  const [savedRows, setSavedRows] = useState<TaskRow[]>(() => loadTaskRows());
  const [rows, setRows] = useState<TaskRow[]>(() => loadTaskRows());
  // Pull task_rows from the cloud on mount so this browser shows whatever was
  // last saved by anyone (restores data wiped from local storage).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { hydrateTasksToLocal } = await import("@/lib/cloud-sync");
        const n = await hydrateTasksToLocal();
        if (cancelled || !n) return;
        const fresh = loadTaskRows();
        setSavedRows(fresh);
        setRows(fresh);
      } catch (e) {
        console.warn("[tasks] hydrate failed", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const [saveOpen, setSaveOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sprintFilter, setSprintFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<TaskRowStatus | "">("");
  const [bulkSprint, setBulkSprint] = useState<string>("");
  const [bulkAssignee, setBulkAssignee] = useState<string>("");
  const [bulkPriority, setBulkPriority] = useState<Priority | "">("");
  const [bulkNotesMode, setBulkNotesMode] = useState<"append" | "replace">("append");
  const [bulkNotes, setBulkNotes] = useState<string>("");
  const [bulkAssignBy, setBulkAssignBy] = useState<string>("");
  const [bulkDateAssigned, setBulkDateAssigned] = useState<string>("");
  const [bulkDueDate, setBulkDueDate] = useState<string>("");
  const [bulkDateCompleted, setBulkDateCompleted] = useState<string>("");
  const [bulkCost, setBulkCost] = useState<string>("");

  // Working state only — do NOT write to storage here. Call commitChanges() to persist.
  const persist = (next: TaskRow[]) => {
    setRows(next);
  };

  const owners = useMemo(() => {
    const set = new Set<string>(rows.map((r) => r.assignedTo).filter(Boolean));
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      if (!multiSelectMatches(statusFilter, r.status)) return false;
      if (!multiSelectMatches(sprintFilter, r.sprintId)) return false;
      if (!multiSelectMatches(ownerFilter, r.assignedTo)) return false;
      if (!q) return true;
      return [r.id, r.description, r.assignedTo, r.assignBy, r.notes]
        .some((f) => (f || "").toLowerCase().includes(q));
    });
  }, [rows, query, statusFilter, sprintFilter, ownerFilter]);

  const stats = useMemo(() => {
    const by = { not_started: 0, in_progress: 0, blocked: 0, done: 0 } as Record<TaskRowStatus, number>;
    for (const r of rows) by[r.status]++;
    return by;
  }, [rows]);

  const doneRate = rows.length ? Math.round((stats.done / rows.length) * 100) : 0;

  // Owner counts across all rows (for the sprint banner pills).
  const ownerCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of rows) {
      const a = r.assignedTo || "Unassigned";
      out[a] = (out[a] || 0) + 1;
    }
    return out;
  }, [rows]);

  // Per-owner status breakdown (only owners with at least one task).
  const ownerStatusCounts = useMemo(() => {
    const out: Record<string, Record<TaskRowStatus | "total", number>> = {};
    for (const r of rows) {
      const owner = r.assignedTo || "Unassigned";
      if (!out[owner]) out[owner] = { total: 0, not_started: 0, in_progress: 0, blocked: 0, done: 0 };
      out[owner].total++;
      out[owner][r.status]++;
    }
    return out;
  }, [rows]);

  // Group filtered rows by sprint. Current sprint first, then by SPRINTS order, then unassigned.
  const groupedBySprint = useMemo(() => {
    const map = new Map<string, TaskRow[]>();
    for (const r of filtered) {
      const k = r.sprintId || "_none";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    const ordered: { sprintId: string; rows: TaskRow[] }[] = [];
    if (map.has(ACTIVE_SPRINT_ID)) ordered.push({ sprintId: ACTIVE_SPRINT_ID, rows: map.get(ACTIVE_SPRINT_ID)! });
    for (const s of SPRINTS) {
      if (s.id !== ACTIVE_SPRINT_ID && map.has(s.id)) ordered.push({ sprintId: s.id, rows: map.get(s.id)! });
    }
    if (map.has("_none")) ordered.push({ sprintId: "_none", rows: map.get("_none")! });
    return ordered;
  }, [filtered]);

  // Collapse every non-active sprint by default.
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(
    () => new Set(SPRINTS.filter((s) => s.id !== ACTIVE_SPRINT_ID).map((s) => s.id))
  );
  const toggleSprint = (id: string) =>
    setCollapsedSprints((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const openNew = () => { setEditing(emptyDraft()); setDialogOpen(true); };
  const openEdit = (r: TaskRow) => { setEditing({ ...r }); setDialogOpen(true); };

  const saveDraft = () => {
    if (!editing) return;
    const draft = { ...editing, description: editing.description.trim() };
    if (!draft.description) return;
    if (!draft.id) {
      draft.id = nextTaskId(rows);
      persist([...rows, draft]);
    } else {
      persist(rows.map((r) => (r.id === draft.id ? draft : r)));
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const deleteRow = (id: string) => persist(rows.filter((r) => r.id !== id));

  const inlineUpdate = <K extends keyof TaskRow>(id: string, key: K, value: TaskRow[K]) => {
    persist(rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const toggleSelected = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };
  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(filtered.map((r) => r.id)));
    else setSelected(new Set());
  };
  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const applyBulk = () => {
    if (selected.size === 0) return;
    const next = rows.map((r) => {
      if (!selected.has(r.id)) return r;
      const u = { ...r };
      if (bulkStatus) {
        u.status = bulkStatus;
        if (bulkStatus === "done" && !u.dateCompleted) u.dateCompleted = todayMMDDYY();
      }
      if (bulkSprint) u.sprintId = bulkSprint;
      if (bulkAssignee.trim()) u.assignedTo = bulkAssignee.trim();
      if (bulkPriority) u.priority = bulkPriority;
      if (bulkNotes.trim()) {
        const stamp = todayMMDDYY();
        const line = `[${stamp}] ${bulkNotes.trim()}`;
        u.notes = bulkNotesMode === "replace" || !u.notes ? line : `${u.notes}\n${line}`;
      }
      if (bulkAssignBy.trim()) u.assignBy = bulkAssignBy.trim();
      if (bulkDateAssigned.trim()) u.dateAssigned = bulkDateAssigned.trim();
      if (bulkDueDate.trim()) u.dueDate = bulkDueDate.trim();
      if (bulkDateCompleted.trim()) u.dateCompleted = bulkDateCompleted.trim();
      if (bulkCost.trim() !== "") {
        const n = Number(bulkCost);
        if (!Number.isNaN(n)) u.cost = n;
      }
      return u;
    });
    persist(next);
    setBulkStatus(""); setBulkSprint(""); setBulkAssignee("");
    setBulkPriority(""); setBulkNotes("");
    setBulkAssignBy(""); setBulkDateAssigned(""); setBulkDueDate(""); setBulkDateCompleted(""); setBulkCost("");
    setSelected(new Set());
  };
  const bulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected task(s)?`)) return;
    persist(rows.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
  };

  const onReset = () => {
    if (!confirm("Reset task sheet to the seeded defaults? Your local edits will be lost.")) return;
    const fresh = resetTaskRows();
    setSavedRows(fresh);
    setRows(fresh);
  };

  const exportCsv = () => {
    const headers = [
      "id", "description", "sprintId", "category", "priority", "status",
      "assignBy", "assignedTo", "dateAssigned", "dueDate", "dateCompleted", "cost", "notes", "path",
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc((r as unknown as Record<string, unknown>)[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "task-sheet.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------------
  // Pending-change diff between savedRows (last persisted) and rows (draft)
  // ------------------------------------------------------------------
  type FieldKey = Exclude<keyof TaskRow, "id">;
  type Change =
    | { kind: "add"; key: string; id: string; row: TaskRow }
    | { kind: "delete"; key: string; id: string; row: TaskRow }
    | { kind: "update"; key: string; id: string; field: FieldKey; before: unknown; after: unknown };

  const FIELD_LABELS: Record<FieldKey, string> = {
    description: "Description", sprintId: "Sprint", category: "Category",
    priority: "Priority", status: "Status", assignBy: "Assigned by",
    assignedTo: "Assigned to", dateAssigned: "Date assigned", dueDate: "Due date",
    dateCompleted: "Date completed", cost: "Cost", notes: "Notes", path: "Link",
  };

  const pendingChanges = useMemo<Change[]>(() => {
    const out: Change[] = [];
    const savedById = new Map(savedRows.map((r) => [r.id, r]));
    const draftById = new Map(rows.map((r) => [r.id, r]));
    for (const r of rows) {
      const s = savedById.get(r.id);
      if (!s) { out.push({ kind: "add", key: `${r.id}:__add`, id: r.id, row: r }); continue; }
      for (const k of Object.keys(FIELD_LABELS) as FieldKey[]) {
        const a = s[k]; const b = r[k];
        if (JSON.stringify(a ?? "") !== JSON.stringify(b ?? "")) {
          out.push({ kind: "update", key: `${r.id}:${k}`, id: r.id, field: k, before: a, after: b });
        }
      }
    }
    for (const s of savedRows) {
      if (!draftById.has(s.id)) out.push({ kind: "delete", key: `${s.id}:__delete`, id: s.id, row: s });
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }, [rows, savedRows]);

  const pendingCount = pendingChanges.length;

  const discardAllDrafts = () => {
    if (pendingCount === 0) return;
    if (!confirm(`Discard all ${pendingCount} unsaved change(s)?`)) return;
    setRows(savedRows);
  };

  // Apply selected changes. Unselected changes stay in working draft.
  const commitChanges = (selectedKeys: Set<string>) => {
    const savedById = new Map(savedRows.map((r) => [r.id, { ...r }]));
    const draftById = new Map(rows.map((r) => [r.id, { ...r }]));
    const nextSavedMap = new Map(savedById);
    const nextDraftMap = new Map(draftById);

    for (const c of pendingChanges) {
      const isSel = selectedKeys.has(c.key);
      if (c.kind === "add") {
        if (isSel) nextSavedMap.set(c.id, { ...c.row });
        else nextDraftMap.delete(c.id); // discard the unsaved new row
      } else if (c.kind === "delete") {
        if (isSel) nextSavedMap.delete(c.id);
        else nextDraftMap.set(c.id, { ...c.row }); // restore — keep both in sync
      } else {
        // update
        if (isSel) {
          const cur = nextSavedMap.get(c.id) ?? { ...(savedById.get(c.id) as TaskRow) };
          (cur as Record<string, unknown>)[c.field] = c.after;
          nextSavedMap.set(c.id, cur);
        } else {
          // leave draft as-is so the field stays pending
        }
      }
    }

    // Preserve insertion order: prefer current draft order, then any leftover saved-only rows.
    const orderedDraft: TaskRow[] = [];
    const seen = new Set<string>();
    for (const r of rows) {
      const v = nextDraftMap.get(r.id);
      if (v) { orderedDraft.push(v); seen.add(r.id); }
    }
    for (const [id, v] of nextDraftMap) if (!seen.has(id)) orderedDraft.push(v);

    const orderedSaved: TaskRow[] = [];
    const seenSaved = new Set<string>();
    for (const r of savedRows) {
      const v = nextSavedMap.get(r.id);
      if (v) { orderedSaved.push(v); seenSaved.add(r.id); }
    }
    for (const [id, v] of nextSavedMap) if (!seenSaved.has(id)) orderedSaved.push(v);

    setSavedRows(orderedSaved);
    setRows(orderedDraft);
    saveTaskRows(orderedSaved);
    setSaveOpen(false);
    toast.success(`Saved ${selectedKeys.size} change${selectedKeys.size === 1 ? "" : "s"}.`);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <StatCard label="Total" value={rows.length} />
        <StatCard label="Not started" value={stats.not_started} />
        <StatCard label="In progress" value={stats.in_progress} />
        <StatCard label="Blocked" value={stats.blocked} tone="border-destructive/40" />
        <StatCard label="Done" value={stats.done} tone="border-emerald-500/40" />
      </div>

      {/* Toolbar */}
      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <MultiSelect
          placeholder="Sprint"
          triggerClassName="w-[200px]"
          options={SPRINTS.map((s) => ({ value: s.id, label: `Sprint ${s.number} · ${s.name}` }))}
          value={sprintFilter}
          onChange={setSprintFilter}
        />
        <MultiSelect
          placeholder="Status"
          triggerClassName="w-[180px]"
          options={TASK_STATUS_VALUES.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s] }))}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <MultiSelect
          placeholder="Owner"
          triggerClassName="w-[180px]"
          options={owners.map((o) => ({ value: o, label: o }))}
          value={ownerFilter}
          onChange={setOwnerFilter}
        />
        <div className="flex gap-2 ml-auto">
          <Button
            size="sm"
            onClick={() => setSaveOpen(true)}
            disabled={pendingCount === 0}
          >
            <Save className="h-4 w-4 mr-1" />
            Save changes
            {pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-background text-foreground text-[10px] font-bold px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={discardAllDrafts} disabled={pendingCount === 0}>
            Discard
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={onReset}><RotateCcw className="h-4 w-4 mr-1" />Reset</Button>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New task</Button>
        </div>
      </Card>

      {/* Bulk-edit bar */}
      {selected.size > 0 && (
        <Card className="p-3 flex flex-wrap items-center gap-2 border-primary/40">
          <span className="text-sm font-medium mr-2">{selected.size} selected</span>
          <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as TaskRowStatus)}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Set status…" /></SelectTrigger>
            <SelectContent>
              {TASK_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bulkSprint} onValueChange={setBulkSprint}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Set sprint…" /></SelectTrigger>
            <SelectContent>
              {SPRINTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>Sprint {s.number} · {s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Set assignee…" /></SelectTrigger>
            <SelectContent>
              {owners.filter((o) => o !== "All").map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bulkPriority} onValueChange={(v) => setBulkPriority(v as Priority)}>
            <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Set priority…" /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 w-full">
            <Textarea
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              placeholder="Notes to apply to selected (timestamped)…"
              rows={2}
              className="flex-1 min-w-[260px]"
            />
            <Select value={bulkNotesMode} onValueChange={(v) => setBulkNotesMode(v as "append" | "replace")}>
              <SelectTrigger className="h-9 w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="append">Append</SelectItem>
                <SelectItem value="replace">Replace</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full">
            <Input value={bulkAssignBy} onChange={(e) => setBulkAssignBy(e.target.value)} placeholder="Set assigned by…" className="h-9 w-[150px]" />
            <DateField value={bulkDateAssigned} onChange={setBulkDateAssigned} placeholder="Assigned…" buttonClassName="h-9 w-[150px]" />
            <DateField value={bulkDueDate} onChange={setBulkDueDate} placeholder="Due…" buttonClassName="h-9 w-[150px]" />
            <DateField value={bulkDateCompleted} onChange={setBulkDateCompleted} placeholder="Completed…" buttonClassName="h-9 w-[170px]" />
            <Input type="number" value={bulkCost} onChange={(e) => setBulkCost(e.target.value)} placeholder="Set cost ($)" className="h-9 w-[130px]" />
          </div>
          <Button size="sm" onClick={applyBulk} disabled={!bulkStatus && !bulkSprint && !bulkAssignee.trim() && !bulkPriority && !bulkNotes.trim() && !bulkAssignBy.trim() && !bulkDateAssigned.trim() && !bulkDueDate.trim() && !bulkDateCompleted.trim() && bulkCost.trim() === ""}>
            Apply to selected
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
          <Button size="sm" variant="outline" className="ml-auto text-destructive" onClick={bulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" />Delete selected
          </Button>
        </Card>
      )}

      {selected.size === 0 && (
        <p className="text-xs text-muted-foreground px-1">
          Tip: click <strong>New task</strong> to add · use the inline dropdowns in each row to re-assign sprint, status, priority, or person · click the pencil to edit notes & all fields · tick the row checkboxes to bulk-edit or delete.
        </p>
      )}

      {/* Sheet */}
      <Card className="overflow-hidden">
        <div className="overflow-auto max-w-full max-h-[70vh]">
          <Table className="min-w-max">
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[36px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(c) => toggleSelectAll(Boolean(c))}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[70px]">ID</TableHead>
                <TableHead className="min-w-[260px]">Description</TableHead>
                <TableHead>Sprint</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="min-w-[200px]">Notes</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                    No tasks match your filters.
                  </TableCell>
                </TableRow>
              )}
              {groupedBySprint.map(({ sprintId, rows: grows }) => {
                const sprintMeta = SPRINTS.find((s) => s.id === sprintId);
                const isCollapsed = collapsedSprints.has(sprintId);
                const label = sprintMeta ? `Sprint ${sprintMeta.number} · ${sprintMeta.name}` : "Unassigned";
                const isActive = sprintId === ACTIVE_SPRINT_ID;
                return (
                  <Fragment key={sprintId}>
                    <TableRow
                      className="bg-muted/60 hover:bg-muted/70 cursor-pointer border-t-2 border-border"
                      onClick={() => toggleSprint(sprintId)}
                    >
                      <TableCell colSpan={14} className="py-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <ChevronRight className={`h-4 w-4 transition-transform ${!isCollapsed ? "rotate-90" : ""}`} />
                          <span>{label}</span>
                          {isActive && (
                            <Badge variant="outline" className="border-primary/60 text-primary">Current</Badge>
                          )}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            {grows.length} task{grows.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {!isCollapsed && grows.map((r) => {
                      const sprint = SPRINTS.find((s) => s.id === r.sprintId);
                      const savedRow = savedRows.find((s) => s.id === r.id);
                      const isDirty = !savedRow || JSON.stringify(savedRow) !== JSON.stringify(r);
                      return (
                  <TableRow key={r.id} className={`${ROW_STATUS_BG[r.status]} ${isDirty ? "outline outline-1 outline-amber-500/60" : ""}`}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(r.id)}
                        onCheckedChange={(c) => toggleSelected(r.id, Boolean(c))}
                        aria-label={`Select ${r.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.id}
                      {isDirty && <span className="ml-1 text-amber-600" title="Unsaved changes">●</span>}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm leading-snug">{r.description}</div>
                      {r.path && <div className="mt-1"><TaskTargetLink path={r.path} /></div>}
                      {r.notes && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.notes}</div>}
                    </TableCell>
                    <TableCell>
                      <Select value={r.sprintId} onValueChange={(v) => inlineUpdate(r.id, "sprintId", v)}>
                        <SelectTrigger className="h-7 w-[110px] text-xs">
                          <span>{sprint ? `S${sprint.number}` : r.sprintId}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {SPRINTS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>Sprint {s.number} · {s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={r.priority} onValueChange={(v) => inlineUpdate(r.id, "priority", v as Priority)}>
                        <SelectTrigger className="h-7 w-[70px] text-xs">
                          <Badge variant="outline" className={PRIORITY_TONE[r.priority]} title={PRIORITY_LABELS[r.priority]}>{PRIORITY_SHORT[r.priority]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => {
                        const next = v as TaskRowStatus;
                        inlineUpdate(r.id, "status", next);
                        if (next === "done" && !r.dateCompleted) inlineUpdate(r.id, "dateCompleted", todayMMDDYY());
                      }}>
                        <SelectTrigger className="h-7 w-[140px] text-xs">
                          <Badge variant="outline" className={STATUS_TONE[r.status]}>{TASK_STATUS_LABELS[r.status]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUS_VALUES.map((s) => (
                            <SelectItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={r.assignedTo} onValueChange={(v) => inlineUpdate(r.id, "assignedTo", v)}>
                        <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {owners.filter((o) => o !== "All").map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input value={r.assignBy} onChange={(e) => inlineUpdate(r.id, "assignBy", e.target.value)} className="h-7 w-[80px] text-xs" />
                    </TableCell>
                    <TableCell><DateField value={r.dateAssigned} onChange={(v) => inlineUpdate(r.id, "dateAssigned", v)} placeholder="—" buttonClassName="h-7 w-[110px] text-xs" /></TableCell>
                    <TableCell><DateField value={r.dueDate} onChange={(v) => inlineUpdate(r.id, "dueDate", v)} placeholder="—" buttonClassName="h-7 w-[110px] text-xs" /></TableCell>
                    <TableCell><DateField value={r.dateCompleted} onChange={(v) => inlineUpdate(r.id, "dateCompleted", v)} placeholder="—" buttonClassName="h-7 w-[110px] text-xs" /></TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={r.cost}
                        onChange={(e) => inlineUpdate(r.id, "cost", Number(e.target.value) || 0)}
                        className="h-7 w-[80px] text-xs text-right ml-auto"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={r.notes}
                        onChange={(e) => inlineUpdate(r.id, "notes", e.target.value)}
                        placeholder="Add notes…"
                        rows={2}
                        className="text-xs min-h-[40px] w-[220px]"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteRow(r.id)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                      );
                    })}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? `Edit ${editing.id}` : "New task"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Sprint</Label>
                <Select value={editing.sprintId} onValueChange={(v) => setEditing({ ...editing, sprintId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPRINTS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>Sprint {s.number} · {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={editing.priority} onValueChange={(v) => setEditing({ ...editing, priority: v as Priority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as TaskRowStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_VALUES.map((s) => <SelectItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned to</Label>
                <Select value={editing.assignedTo} onValueChange={(v) => setEditing({ ...editing, assignedTo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {owners.filter((o) => o !== "All").map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned by</Label>
                <Input value={editing.assignBy} onChange={(e) => setEditing({ ...editing, assignBy: e.target.value })} />
              </div>
              <div>
                <Label>Date assigned</Label>
                <DateField value={editing.dateAssigned} onChange={(v) => setEditing({ ...editing, dateAssigned: v })} buttonClassName="w-full" />
              </div>
              <div>
                <Label>Due date</Label>
                <DateField value={editing.dueDate} onChange={(v) => setEditing({ ...editing, dueDate: v })} buttonClassName="w-full" />
              </div>
              <div>
                <Label>Date completed</Label>
                <DateField value={editing.dateCompleted} onChange={(v) => setEditing({ ...editing, dateCompleted: v })} buttonClassName="w-full" />
              </div>
              <div>
                <Label>Cost ($)</Label>
                <Input type="number" value={editing.cost} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) || 0 })} />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} />
              </div>
              <div className="md:col-span-2">
                <Label>Related page / link (optional)</Label>
                <Input
                  value={editing.path ?? ""}
                  onChange={(e) => setEditing({ ...editing, path: e.target.value })}
                  placeholder="/admin or https://example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Route path (starts with /) or full URL. Shown as a clickable chip in the task row.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDraft}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskSaveChangesDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        changes={pendingChanges}
        fieldLabels={FIELD_LABELS}
        onConfirm={commitChanges}
      />
    </div>
  );
}

/* ============================ SAVE CHANGES DIALOG ========================== */
function fmtVal(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return String(v);
  return String(v);
}

type TaskChange =
  | { kind: "add"; key: string; id: string; row: TaskRow }
  | { kind: "delete"; key: string; id: string; row: TaskRow }
  | { kind: "update"; key: string; id: string; field: keyof TaskRow; before: unknown; after: unknown };

function TaskSaveChangesDialog({
  open, onOpenChange, changes, fieldLabels, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  changes: TaskChange[];
  fieldLabels: Record<string, string>;
  onConfirm: (selectedKeys: Set<string>) => void;
}) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(changes.map((c) => c.key)));

  useEffect(() => {
    if (open) setPicked(new Set(changes.map((c) => c.key)));
  }, [open, changes]);

  const toggle = (k: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });

  const grouped = useMemo(() => {
    const g: Record<string, TaskChange[]> = {};
    for (const c of changes) (g[c.id] ||= []).push(c);
    return Object.entries(g);
  }, [changes]);

  const allSelected = changes.length > 0 && picked.size === changes.length;
  const toggleAll = () =>
    setPicked(allSelected ? new Set() : new Set(changes.map((c) => c.key)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review changes before saving</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          {changes.length} pending change{changes.length === 1 ? "" : "s"} across {grouped.length} task
          {grouped.length === 1 ? "" : "s"}. Uncheck any row you don't want to save — only the checked
          changes will be written. Unchecked changes stay in your draft.
        </p>

        <div className="flex items-center gap-2 text-xs border-b border-border pb-2">
          <label className="inline-flex items-center gap-2 font-semibold cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4" />
            {allSelected ? "Deselect all" : "Select all"}
          </label>
          <span className="text-muted-foreground">
            {picked.size} of {changes.length} will be saved
          </span>
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-3">
          {grouped.map(([taskId, list]) => (
            <div key={taskId} className="rounded-md border border-border">
              <div className="px-3 py-1.5 bg-muted/50 text-xs font-mono font-bold border-b border-border">
                {taskId}
              </div>
              <ul className="divide-y divide-border">
                {list.map((c) => {
                  const checked = picked.has(c.key);
                  if (c.kind === "add") {
                    return (
                      <li key={c.key} className="px-3 py-2 flex items-start gap-3 text-xs">
                        <input type="checkbox" checked={checked} onChange={() => toggle(c.key)} className="h-4 w-4 mt-0.5" />
                        <span className="text-emerald-700 font-semibold w-20 shrink-0">New task</span>
                        <div className="flex-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1">
                          <div className="font-semibold">{c.row.description || "(no description)"}</div>
                          <div className="text-muted-foreground">
                            {c.row.status} · {c.row.priority} · {c.row.assignedTo}
                          </div>
                        </div>
                      </li>
                    );
                  }
                  if (c.kind === "delete") {
                    return (
                      <li key={c.key} className="px-3 py-2 flex items-start gap-3 text-xs">
                        <input type="checkbox" checked={checked} onChange={() => toggle(c.key)} className="h-4 w-4 mt-0.5" />
                        <span className="text-destructive font-semibold w-20 shrink-0">Delete</span>
                        <div className="flex-1 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 line-through">
                          {c.row.description || "(no description)"}
                        </div>
                      </li>
                    );
                  }
                  return (
                    <li key={c.key} className="px-3 py-2 flex items-start gap-3 text-xs">
                      <input type="checkbox" checked={checked} onChange={() => toggle(c.key)} className="h-4 w-4 mt-0.5" />
                      <div className="w-20 shrink-0 font-semibold text-foreground">
                        {fieldLabels[c.field as string] ?? String(c.field)}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="rounded border border-border bg-muted/30 px-2 py-1">
                          <div className="text-[10px] uppercase text-muted-foreground mb-0.5">Before</div>
                          <div className="whitespace-pre-wrap break-words text-muted-foreground">{fmtVal(c.before)}</div>
                        </div>
                        <div className="rounded border border-primary/30 bg-primary/5 px-2 py-1">
                          <div className="text-[10px] uppercase text-primary mb-0.5">After</div>
                          <div className="whitespace-pre-wrap break-words text-foreground">{fmtVal(c.after)}</div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {changes.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No pending changes.</div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onConfirm(picked)} disabled={picked.size === 0}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save {picked.size} change{picked.size === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
