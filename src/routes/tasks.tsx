import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, RotateCcw, Trash2, Pencil, Search, Download, ExternalLink } from "lucide-react";
import {
  loadTaskRows, saveTaskRows, resetTaskRows, nextTaskId, todayMMDDYY,
  TASK_STATUS_VALUES, TASK_STATUS_LABELS, TASK_CATEGORY_VALUES, TASK_CATEGORY_LABELS,
  type TaskRow, type TaskRowStatus, type TaskRowCategory,
} from "@/lib/tasks-sheet";
import { SPRINTS, ACTIVE_SPRINT_ID, type Priority } from "@/lib/test-plan";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Sheet — The Medicare Optimizer" },
      { name: "description", content: "Spreadsheet-style task tracker for The Medicare Optimizer team." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TaskSheetPage,
});

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];

const STATUS_TONE: Record<TaskRowStatus, string> = {
  not_started: "border-muted-foreground/30 text-muted-foreground",
  in_progress: "border-blue-500/40 text-blue-500",
  blocked: "border-destructive/50 text-destructive",
  done: "border-emerald-500/40 text-emerald-600",
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
    assignBy: "Me",
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

function TaskSheetPage() {
  const [rows, setRows] = useState<TaskRow[]>(() => loadTaskRows());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskRowStatus>("all");
  const [sprintFilter, setSprintFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<TaskRowStatus | "">("");
  const [bulkSprint, setBulkSprint] = useState<string>("");
  const [bulkAssignee, setBulkAssignee] = useState<string>("");

  const persist = (next: TaskRow[]) => {
    setRows(next);
    saveTaskRows(next);
  };

  const owners = useMemo(() => {
    const set = new Set<string>(rows.map((r) => r.assignedTo).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (sprintFilter !== "all" && r.sprintId !== sprintFilter) return false;
      if (ownerFilter !== "All" && r.assignedTo !== ownerFilter) return false;
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
      return u;
    });
    persist(next);
    setBulkStatus(""); setBulkSprint(""); setBulkAssignee("");
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
    setRows(resetTaskRows());
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

  return (
    <AppShell title="Task Sheet" subtitle="Spreadsheet-style task tracker — inline edits autosave to this browser.">
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
          <Select value={sprintFilter} onValueChange={setSprintFilter}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Sprint" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sprints</SelectItem>
              {SPRINTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>Sprint {s.number} · {s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {TASK_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Owner" /></SelectTrigger>
            <SelectContent>
              {owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2 ml-auto">
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
            <Button size="sm" onClick={applyBulk} disabled={!bulkStatus && !bulkSprint && !bulkAssignee.trim()}>
              Apply to selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button size="sm" variant="outline" className="ml-auto text-destructive" onClick={bulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />Delete selected
            </Button>
          </Card>
        )}

        {/* Sheet */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0">
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
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
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
                {filtered.map((r) => {
                  const sprint = SPRINTS.find((s) => s.id === r.sprintId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(r.id)}
                          onCheckedChange={(c) => toggleSelected(r.id, Boolean(c))}
                          aria-label={`Select ${r.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm leading-snug">{r.description}</div>
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
                        <Select value={r.category} onValueChange={(v) => inlineUpdate(r.id, "category", v as TaskRowCategory)}>
                          <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TASK_CATEGORY_VALUES.map((c) => (
                              <SelectItem key={c} value={c}>{TASK_CATEGORY_LABELS[c]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={r.priority} onValueChange={(v) => inlineUpdate(r.id, "priority", v as Priority)}>
                          <SelectTrigger className="h-7 w-[70px] text-xs">
                            <Badge variant="outline" className={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                        <Input value={r.assignedTo} onChange={(e) => inlineUpdate(r.id, "assignedTo", e.target.value)} className="h-7 w-[110px] text-xs" />
                      </TableCell>
                      <TableCell>
                        <Input value={r.assignBy} onChange={(e) => inlineUpdate(r.id, "assignBy", e.target.value)} className="h-7 w-[80px] text-xs" />
                      </TableCell>
                      <TableCell><Input value={r.dateAssigned} onChange={(e) => inlineUpdate(r.id, "dateAssigned", e.target.value)} placeholder="MM/DD/YY" className="h-7 w-[90px] text-xs" /></TableCell>
                      <TableCell><Input value={r.dueDate} onChange={(e) => inlineUpdate(r.id, "dueDate", e.target.value)} placeholder="MM/DD/YY" className="h-7 w-[90px] text-xs" /></TableCell>
                      <TableCell><Input value={r.dateCompleted} onChange={(e) => inlineUpdate(r.id, "dateCompleted", e.target.value)} placeholder="MM/DD/YY" className="h-7 w-[90px] text-xs" /></TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={r.cost}
                          onChange={(e) => inlineUpdate(r.id, "cost", Number(e.target.value) || 0)}
                          className="h-7 w-[80px] text-xs text-right ml-auto"
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
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

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
                <Label>Category</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as TaskRowCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORY_VALUES.map((c) => <SelectItem key={c} value={c}>{TASK_CATEGORY_LABELS[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={editing.priority} onValueChange={(v) => setEditing({ ...editing, priority: v as Priority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                <Input value={editing.assignedTo} onChange={(e) => setEditing({ ...editing, assignedTo: e.target.value })} />
              </div>
              <div>
                <Label>Assigned by</Label>
                <Input value={editing.assignBy} onChange={(e) => setEditing({ ...editing, assignBy: e.target.value })} />
              </div>
              <div>
                <Label>Date assigned (MM/DD/YY)</Label>
                <Input value={editing.dateAssigned} onChange={(e) => setEditing({ ...editing, dateAssigned: e.target.value })} />
              </div>
              <div>
                <Label>Due date (MM/DD/YY)</Label>
                <Input value={editing.dueDate} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} />
              </div>
              <div>
                <Label>Date completed (MM/DD/YY)</Label>
                <Input value={editing.dateCompleted} onChange={(e) => setEditing({ ...editing, dateCompleted: e.target.value })} />
              </div>
              <div>
                <Label>Cost ($)</Label>
                <Input type="number" value={editing.cost} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) || 0 })} />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDraft}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card className={`p-3 ${tone ?? ""}`}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Card>
  );
}