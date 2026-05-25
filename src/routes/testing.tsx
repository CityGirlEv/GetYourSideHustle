import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, MinusCircle, AlertOctagon, Search, RotateCcw,
  FlaskConical, CalendarDays, ListChecks, GitBranch, Sparkles, ExternalLink,
  Wrench, RefreshCw, Paperclip, Upload, Trash2, FileText, Loader2,
} from "lucide-react";
import {
  TEST_CASES, IMPLEMENTATION_PLAN, SPRINTS, TASKS,
  loadAllStatuses, saveStatus,
  type TestStatus, type TestCase, type Priority,
  getTestAssignee, getTestSprintId, ACTIVE_SPRINT_ID,
  getTestCreditReward, totalCreditBudget, creditBudgetByOwner, REPRO_FAIL_BONUS,
  loadAllQaNotes, loadAllDevNotes, saveQaNote, saveDevNote,
  loadAllSeverities, saveSeverity, FAIL_SEVERITY_LABELS, type FailSeverity,
  TEST_OWNERS, loadAllAssigneeOverrides, saveAssigneeOverride,
  loadAllSprintOverrides, saveSprintOverride,
} from "@/lib/test-plan";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-store";
import {
  listTestEvidence, uploadTestEvidence, deleteTestEvidence, getTestEvidenceUrl,
  type EvidenceFile,
} from "@/lib/test-evidence";
import { toast } from "sonner";

// Derive a link target for a test case: explicit `path` wins, otherwise scan
// preconditions + steps for the first "/route" token (e.g. "Open /advisor").
function deriveTestPath(t: TestCase): string | null {
  if (t.path) return t.path;
  const haystack = [t.preconditions ?? "", ...t.steps].join(" ");
  const m = haystack.match(/(?:^|\s)(\/[a-zA-Z0-9._\-/$:]+)/);
  return m ? m[1] : null;
}

function TestTargetLink({ test }: { test: TestCase }) {
  const path = deriveTestPath(test);
  if (!path) return null;
  const isExternal = /^https?:\/\//.test(path);
  const label = path.length > 28 ? path.slice(0, 27) + "…" : path;
  const className =
    "inline-flex items-center gap-1 text-[11px] font-mono rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-primary hover:bg-primary/10 transition-colors";
  if (isExternal) {
    return (
      <a href={path} target="_blank" rel="noreferrer" className={className} title={`Open ${path}`}>
        <ExternalLink className="h-3 w-3" />
        {label}
      </a>
    );
  }
  return (
    <Link to={path as never} target="_blank" className={className} title={`Open ${path}`}>
      <ExternalLink className="h-3 w-3" />
      {label}
    </Link>
  );
}

function TestTitleLink({ test, children }: { test: TestCase; children: React.ReactNode }) {
  const path = deriveTestPath(test);
  if (!path) return <>{children}</>;
  const isExternal = /^https?:\/\//.test(path);
  const className = "hover:underline hover:text-primary transition-colors";
  if (isExternal) {
    return (
      <a href={path} target="_blank" rel="noreferrer" className={className} title={`Open ${path}`}>
        {children}
      </a>
    );
  }
  return (
    <Link to={path as never} target="_blank" className={className} title={`Open ${path}`}>
      {children}
    </Link>
  );
}

export const Route = createFileRoute("/testing")({
  head: () => ({
    meta: [
      { title: "Testing Portal — The Medicare Optimizer" },
      { name: "description", content: "Internal test plan, implementation plan, sprint schedule, and tasks for The Medicare Optimizer." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TestingPortal,
});

function TestingPortal() {
  return (
    <AppShell title="Testing Portal" subtitle="Use-case tests, implementation phases, sprint schedule, and the cross-sprint task backlog.">
      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="tests"><ListChecks className="h-3.5 w-3.5 mr-1.5" />Test Plan</TabsTrigger>
          <TabsTrigger value="impl"><GitBranch className="h-3.5 w-3.5 mr-1.5" />Implementation</TabsTrigger>
          <TabsTrigger value="sprints"><CalendarDays className="h-3.5 w-3.5 mr-1.5" />Sprints</TabsTrigger>
          <TabsTrigger value="tasks"><Sparkles className="h-3.5 w-3.5 mr-1.5" />Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="tests"><TestPlanTab /></TabsContent>
        <TabsContent value="impl"><ImplementationTab /></TabsContent>
        <TabsContent value="sprints"><SprintsTab /></TabsContent>
        <TabsContent value="tasks"><TasksTab /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

/* ============================== TEST PLAN TAB ============================== */
export function TestPlanTab() {
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>(() => loadAllStatuses());
  const [qaNotes, setQaNotes] = useState<Record<string, string>>(() => loadAllQaNotes());
  const [devNotes, setDevNotes] = useState<Record<string, string>>(() => loadAllDevNotes());
  const [severities, setSeverities] = useState<Record<string, FailSeverity | "">>(() => loadAllSeverities());
  const [assigneeOverrides, setAssigneeOverrides] = useState<Record<string, string>>(() => loadAllAssigneeOverrides());
  const [sprintOverrides, setSprintOverrides] = useState<Record<string, string>>(() => loadAllSprintOverrides());
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | TestStatus>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");

  const setStatus = (id: string, s: TestStatus) => {
    saveStatus(id, s);
    setStatuses((p) => ({ ...p, [id]: s }));
    // Clear severity when leaving a failing state
    if (s !== "fail" && s !== "failed_retest") {
      saveSeverity(id, "");
      setSeverities((p) => ({ ...p, [id]: "" }));
    }
  };
  const setQaNote = (id: string, note: string) => {
    saveQaNote(id, note);
    setQaNotes((p) => ({ ...p, [id]: note }));
  };
  const setDevNote = (id: string, note: string) => {
    saveDevNote(id, note);
    setDevNotes((p) => ({ ...p, [id]: note }));
  };
  const setSeverityFor = (id: string, s: FailSeverity | "") => {
    saveSeverity(id, s);
    setSeverities((p) => ({ ...p, [id]: s }));
  };
  const setAssigneeFor = (id: string, owner: string) => {
    saveAssigneeOverride(id, owner);
    setAssigneeOverrides((p) => ({ ...p, [id]: owner }));
  };
  const setSprintFor = (id: string, sprintId: string) => {
    saveSprintOverride(id, sprintId);
    setSprintOverrides((p) => ({ ...p, [id]: sprintId }));
  };
  const toggleSelect = (id: string) => {
    setSelected((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const resetAll = () => {
    TEST_CASES.forEach((t) => saveStatus(t.id, "not_run"));
    setStatuses(loadAllStatuses());
  };

  const areas = useMemo(() => ["All", ...Array.from(new Set(TEST_CASES.map((t) => t.area)))], []);
  const ownerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of TEST_CASES) {
      const a = getTestAssignee(t, statuses[t.id]);
      counts[a] = (counts[a] || 0) + 1;
    }
    return counts;
  }, [statuses, assigneeOverrides]);
  const owners = useMemo(() => ["All", ...Object.keys(ownerCounts)], [ownerCounts]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TEST_CASES.filter((t) => {
      if (areaFilter !== "All" && t.area !== areaFilter) return false;
      if (statusFilter !== "all" && statuses[t.id] !== statusFilter) return false;
      if (ownerFilter !== "All" && getTestAssignee(t, statuses[t.id]) !== ownerFilter) return false;
      if (!q) return true;
      return [t.id, t.title, t.area, ...t.steps, t.expected].some((f) => f.toLowerCase().includes(q));
    });
  }, [query, areaFilter, statusFilter, ownerFilter, statuses, assigneeOverrides, sprintOverrides]);

  const filteredIds = useMemo(() => filtered.map((t) => t.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const toggleSelectAll = () => {
    setSelected((p) => {
      const next = new Set(p);
      if (allFilteredSelected) filteredIds.forEach((id) => next.delete(id));
      else filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const applyBulk = (fn: (id: string) => void) => {
    selected.forEach((id) => fn(id));
  };

  const counts = useMemo(() => {
    const c: Record<TestStatus | "total", number> = {
      total: TEST_CASES.length,
      pass: 0, fail: 0, blocked: 0, not_run: 0,
      fixed_retest: 0, failed_retest: 0,
    };
    for (const t of TEST_CASES) c[statuses[t.id] ?? "not_run"]++;
    return c;
  }, [statuses]);
  const passRate = counts.total ? Math.round((counts.pass / counts.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Sprint + ownership banner */}
      <Card className="p-4 bg-primary/5 border-primary/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Active sprint</div>
            <div className="font-bold text-base">Sprint 1 · Beta go-live ({ACTIVE_SPRINT_ID})</div>
            <div className="text-xs text-muted-foreground">5/25 → 5/31 · all {TEST_CASES.length} test cases aligned to this sprint</div>
            <div className="text-xs text-muted-foreground mt-1">
              Beta tester reward pool: <span className="font-semibold text-foreground">{totalCreditBudget()} credit tokens</span>
              {" "}· P0=15 · P1=10 · P2=5 · P3=3 · +{REPRO_FAIL_BONUS} bonus per first repro-fail
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(ownerCounts).map(([owner, n]) => (
              <span key={owner} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold bg-background">
                {owner} <span className="font-normal opacity-70">· {n} tests · {creditBudgetByOwner()[owner] ?? 0} cr</span>
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Pass rate</div>
            <div className="text-2xl font-bold">{passRate}%</div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatBadge n={counts.pass}     label="Pass"    color="bg-emerald-500/10 text-emerald-700 border-emerald-500/30" />
            <StatBadge n={counts.fail}     label="Fail"    color="bg-destructive/10 text-destructive border-destructive/30" />
            <StatBadge n={counts.fixed_retest}  label="Fixed/Retest"   color="bg-sky-500/10 text-sky-700 border-sky-500/30" />
            <StatBadge n={counts.failed_retest} label="Failed/Retest"  color="bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/30" />
            <StatBadge n={counts.blocked}  label="Blocked" color="bg-amber-500/10 text-amber-700 border-amber-500/30" />
            <StatBadge n={counts.not_run}  label="Not run" color="bg-muted text-muted-foreground border-border" />
            <StatBadge n={counts.total}    label="Total"   color="bg-primary/10 text-primary border-primary/30" />
          </div>
          <Button size="sm" variant="outline" onClick={resetAll}><RotateCcw className="h-3.5 w-3.5 mr-1.5"/>Reset all</Button>
        </div>
        <Progress value={passRate} className="h-2" />
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search by id, title, area, step…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="h-9 border border-input rounded-md bg-background px-2 text-sm"
          value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          {areas.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select className="h-9 border border-input rounded-md bg-background px-2 text-sm"
          value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
          {owners.map((o) => <option key={o}>{o === "All" ? "All owners" : o}</option>)}
        </select>
        <select className="h-9 border border-input rounded-md bg-background px-2 text-sm"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | TestStatus)}>
          <option value="all">All statuses</option>
          <option value="not_run">Not run</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="fixed_retest">Fixed / Retest</option>
          <option value="failed_retest">Failed / Retest</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Cases */}
      <div className="space-y-3">
        <BulkEditBar
          selectedCount={selected.size}
          totalFiltered={filteredIds.length}
          allSelected={allFilteredSelected}
          onToggleAll={toggleSelectAll}
          onClear={() => setSelected(new Set())}
          onSetStatus={(s) => applyBulk((id) => setStatus(id, s))}
          onSetAssignee={(o) => applyBulk((id) => setAssigneeFor(id, o))}
          onSetSprint={(s) => applyBulk((id) => setSprintFor(id, s))}
          onSetSeverity={(s) => applyBulk((id) => setSeverityFor(id, s))}
          onSetQaNote={(n) => applyBulk((id) => setQaNote(id, n))}
          onSetDevNote={(n) => applyBulk((id) => setDevNote(id, n))}
        />
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">No test cases match your filters.</Card>
        )}
        {filtered.map((t) => (
          <TestCaseCard
            key={t.id}
            t={t}
            status={statuses[t.id] ?? "not_run"}
            qaNote={qaNotes[t.id] ?? ""}
            devNote={devNotes[t.id] ?? ""}
            severity={severities[t.id] ?? ""}
            selected={selected.has(t.id)}
            onSelectChange={() => toggleSelect(t.id)}
            onChange={(s) => setStatus(t.id, s)}
            onQaNoteChange={(n) => setQaNote(t.id, n)}
            onDevNoteChange={(n) => setDevNote(t.id, n)}
            onSeverityChange={(s) => setSeverityFor(t.id, s)}
            onAssigneeChange={(o) => setAssigneeFor(t.id, o)}
            onSprintChange={(s) => setSprintFor(t.id, s)}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================== BULK EDIT BAR ============================== */
function BulkEditBar({
  selectedCount, totalFiltered, allSelected, onToggleAll, onClear,
  onSetStatus, onSetAssignee, onSetSprint, onSetSeverity, onSetQaNote, onSetDevNote,
}: {
  selectedCount: number;
  totalFiltered: number;
  allSelected: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  onSetStatus: (s: TestStatus) => void;
  onSetAssignee: (o: string) => void;
  onSetSprint: (s: string) => void;
  onSetSeverity: (s: FailSeverity | "") => void;
  onSetQaNote: (n: string) => void;
  onSetDevNote: (n: string) => void;
}) {
  const [qaDraft, setQaDraft] = useState("");
  const [devDraft, setDevDraft] = useState("");
  const disabled = selectedCount === 0;
  return (
    <Card className="p-3 sticky top-[64px] z-20 bg-background/95 backdrop-blur border-primary/30">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="inline-flex items-center gap-2 font-semibold">
          <input type="checkbox" checked={allSelected} onChange={onToggleAll} className="h-4 w-4" />
          {allSelected ? "Deselect all" : "Select all"} <span className="opacity-60">({totalFiltered} filtered)</span>
        </label>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          {selectedCount} selected
        </span>
        {selectedCount > 0 && (
          <Button size="sm" variant="ghost" onClick={onClear} className="h-7 px-2 text-xs">Clear</Button>
        )}
        <div className="flex-1" />
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => { if (e.target.value) { onSetStatus(e.target.value as TestStatus); e.target.value = ""; } }}
          title="Set status for selected"
        >
          <option value="">Set status…</option>
          <option value="not_run">Not run</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="fixed_retest">Fixed / Retest</option>
          <option value="failed_retest">Failed / Retest</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => { if (e.target.value) { onSetAssignee(e.target.value); e.target.value = ""; } }}
          title="Set owner for selected"
        >
          <option value="">Set owner…</option>
          {TEST_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => { if (e.target.value) { onSetSprint(e.target.value); e.target.value = ""; } }}
          title="Set sprint for selected"
        >
          <option value="">Set sprint…</option>
          {SPRINTS.map((s) => <option key={s.id} value={s.id}>Sprint {s.number} · {s.name}</option>)}
        </select>
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => { if (e.target.value !== "__noop") { onSetSeverity(e.target.value as FailSeverity | ""); e.target.value = "__noop"; } }}
          title="Set severity for selected"
        >
          <option value="__noop">Set severity…</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="">Clear severity</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-2 mt-2">
        <div className="flex gap-1">
          <textarea
            value={qaDraft}
            onChange={(e) => setQaDraft(e.target.value)}
            placeholder="Bulk QA note…"
            rows={1}
            disabled={disabled}
            className="flex-1 text-xs rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1 disabled:opacity-50"
          />
          <Button size="sm" variant="outline" disabled={disabled || !qaDraft}
            onClick={() => { onSetQaNote(qaDraft); setQaDraft(""); }}>Apply</Button>
        </div>
        <div className="flex gap-1">
          <textarea
            value={devDraft}
            onChange={(e) => setDevDraft(e.target.value)}
            placeholder="Bulk dev note…"
            rows={1}
            disabled={disabled}
            className="flex-1 text-xs rounded-md border border-sky-500/40 bg-sky-500/5 px-2 py-1 disabled:opacity-50"
          />
          <Button size="sm" variant="outline" disabled={disabled || !devDraft}
            onClick={() => { onSetDevNote(devDraft); setDevDraft(""); }}>Apply</Button>
        </div>
      </div>
    </Card>
  );
}

function StatBadge({ n, label, color }: { n: number; label: string; color: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ${color}`}>{n} <span className="font-normal opacity-80">{label}</span></span>;
}

function priorityVariant(p: Priority): string {
  switch (p) {
    case "P0": return "bg-destructive/10 text-destructive border-destructive/30";
    case "P1": return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    case "P2": return "bg-primary/10 text-primary border-primary/30";
    case "P3": return "bg-muted text-muted-foreground border-border";
  }
}

function TestCaseCard({
  t, status, qaNote, devNote, severity, onChange, onQaNoteChange, onDevNoteChange, onSeverityChange, onAssigneeChange,
}: {
  t: TestCase;
  status: TestStatus;
  qaNote: string;
  devNote: string;
  severity: FailSeverity | "";
  onChange: (s: TestStatus) => void;
  onQaNoteChange: (n: string) => void;
  onDevNoteChange: (n: string) => void;
  onSeverityChange: (s: FailSeverity | "") => void;
  onAssigneeChange: (owner: string) => void;
}) {
  const ring =
    status === "pass"    ? "ring-2 ring-emerald-500/40" :
    status === "fail"    ? "ring-2 ring-destructive/50" :
    status === "blocked" ? "ring-2 ring-amber-500/50"  :
    status === "fixed_retest"  ? "ring-2 ring-sky-500/50" :
    status === "failed_retest" ? "ring-2 ring-fuchsia-500/50" : "";
  const showQaNote = status === "fail" || status === "failed_retest";
  const showDevNote = status === "fixed_retest" || status === "failed_retest";
  return (
    <Card className={`p-4 ${ring}`}>
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{t.id}</span>
        <span className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 ${priorityVariant(t.priority)}`}>{t.priority}</span>
        <Badge variant="secondary" className="text-[11px]">{t.area}</Badge>
        <Badge variant="outline" className="text-[11px]">Sprint {getTestSprintId(t).replace("S-2026-0", "")}</Badge>
        <label className="inline-flex items-center gap-1 text-[11px] rounded-full border border-primary/40 text-primary px-2 py-0.5 bg-background">
          <span className="font-semibold">Owner:</span>
          <select
            className="bg-transparent text-[11px] font-semibold text-primary focus:outline-none cursor-pointer"
            value={getTestAssignee(t, status)}
            onChange={(e) => onAssigneeChange(e.target.value)}
            title="Re-assign this test"
          >
            {TEST_OWNERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <Badge variant="outline" className="text-[11px] border-emerald-500/40 text-emerald-700 bg-emerald-500/5">+{getTestCreditReward(t)} cr</Badge>
        <h3 className="flex-1 font-semibold text-sm md:text-base">
          <TestTitleLink test={t}>{t.title}</TestTitleLink>
        </h3>
        <StatusButtons status={status} onChange={onChange} />
      </div>
      <div className="mb-2 -mt-1">
        <TestTargetLink test={t} />
      </div>
      {t.preconditions && (
        <p className="text-xs text-muted-foreground mb-1.5"><span className="font-semibold">Preconditions:</span> {t.preconditions}</p>
      )}
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div>
          <div className="font-semibold text-foreground mb-1">Steps</div>
          <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
            {t.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
        <div>
          <div className="font-semibold text-foreground mb-1">Expected result</div>
          <p className="text-muted-foreground">{t.expected}</p>
          {t.notes && <p className="text-muted-foreground mt-2 italic">Note: {t.notes}</p>}
        </div>
      </div>
      {(showQaNote || showDevNote || qaNote || devNote) && (
        <div className="mt-3 space-y-2">
          {(showQaNote || qaNote) && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <label className="text-[11px] font-semibold text-destructive">
                  QA failure reason {showQaNote && <span className="opacity-70">(required when failing)</span>}
                </label>
                {showQaNote && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Severity</span>
                    {(Object.keys(FAIL_SEVERITY_LABELS) as FailSeverity[]).map((s) => {
                      const active = severity === s;
                      const tone =
                        s === "high"   ? (active ? "bg-destructive text-destructive-foreground border-destructive" : "border-destructive/40 text-destructive hover:bg-destructive/10") :
                        s === "medium" ? (active ? "bg-amber-500 text-white border-amber-500"           : "border-amber-500/40 text-amber-700 hover:bg-amber-500/10") :
                                         (active ? "bg-sky-500 text-white border-sky-500"               : "border-sky-500/40 text-sky-700 hover:bg-sky-500/10");
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => onSeverityChange(active ? "" : s)}
                          className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 transition ${tone}`}
                          title={FAIL_SEVERITY_LABELS[s]}
                        >
                          {FAIL_SEVERITY_LABELS[s]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {showQaNote && !severity && (
                <p className="text-[10px] text-destructive mb-1">Pick a severity before saving this failure.</p>
              )}
              <textarea
                value={qaNote}
                onChange={(e) => onQaNoteChange(e.target.value)}
                placeholder="Describe what went wrong, browser/device, reproduction steps, screenshot link…"
                rows={2}
                className="w-full text-xs rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-destructive/30"
              />
            </div>
          )}
          {(showDevNote || devNote) && (
            <div>
              <label className="block text-[11px] font-semibold text-sky-700 mb-1">
                Dev retest note
              </label>
              <textarea
                value={devNote}
                onChange={(e) => onDevNoteChange(e.target.value)}
                placeholder="What was changed, what to retest, commit / PR reference…"
                rows={2}
                className="w-full text-xs rounded-md border border-sky-500/40 bg-sky-500/5 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
          )}
        </div>
      )}
      <TestEvidence testId={t.id} />
    </Card>
  );
}

function TestEvidence({ testId }: { testId: string }) {
  const { user } = useApp();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    listTestEvidence(user.id, testId)
      .then((list) => { if (!cancelled) setFiles(list); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, testId]);

  if (!user) return null;

  const onPick = () => fileRef.current?.click();

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large — 20 MB max.");
      return;
    }
    setBusy(true);
    try {
      const uploaded = await uploadTestEvidence(user.id, testId, file);
      setFiles((p) => [uploaded, ...p]);
      toast.success(`Uploaded ${uploaded.name}`);
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const onOpen = async (f: EvidenceFile) => {
    const url = await getTestEvidenceUrl(f.path);
    if (!url) { toast.error("Could not open file"); return; }
    window.open(url, "_blank", "noopener");
  };

  const onDelete = async (f: EvidenceFile) => {
    if (!confirm(`Delete ${f.name}?`)) return;
    try {
      await deleteTestEvidence(f.path);
      setFiles((p) => p.filter((x) => x.path !== f.path));
    } catch (err) {
      toast.error(`Delete failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-semibold text-foreground flex items-center gap-1">
          <Paperclip className="h-3 w-3" />
          Evidence
          {files.length > 0 && <span className="text-muted-foreground font-normal">· {files.length}</span>}
        </div>
        <input ref={fileRef} type="file" className="hidden" onChange={onUpload} />
        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={onPick}>
          {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
          Upload
        </Button>
      </div>
      {loading ? (
        <div className="text-[11px] text-muted-foreground">Loading attachments…</div>
      ) : files.length === 0 ? (
        <div className="text-[11px] text-muted-foreground italic">
          No attachments yet. Add screenshots, logs, or recordings to support this test run.
        </div>
      ) : (
        <ul className="space-y-1">
          {files.map((f) => (
            <li key={f.path} className="flex items-center gap-2 text-[11px] rounded-md border border-border bg-muted/30 px-2 py-1">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <button
                type="button"
                onClick={() => onOpen(f)}
                className="flex-1 text-left truncate text-primary hover:underline"
                title={f.name}
              >
                {f.name.replace(/^\d+-/, "")}
              </button>
              <span className="text-muted-foreground tabular-nums">
                {f.size > 0 ? `${(f.size / 1024).toFixed(0)} KB` : ""}
              </span>
              <button
                type="button"
                onClick={() => onDelete(f)}
                className="text-muted-foreground hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusButtons({ status, onChange }: { status: TestStatus; onChange: (s: TestStatus) => void }) {
  const btn = (s: TestStatus, label: string, Icon: React.ElementType, on: string) =>
    <button
      key={s}
      type="button"
      onClick={() => onChange(s)}
      title={label}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold transition ${status === s ? on : "bg-background border-input text-muted-foreground hover:bg-muted"}`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>;
  return (
    <div className="flex flex-wrap gap-1">
      {btn("pass",    "Pass",    CheckCircle2, "bg-emerald-500/15 border-emerald-500/50 text-emerald-700")}
      {btn("fail",    "Fail",    XCircle,      "bg-destructive/15 border-destructive/50 text-destructive")}
      {btn("fixed_retest",  "Fixed/Retest",  Wrench,    "bg-sky-500/15 border-sky-500/50 text-sky-700")}
      {btn("failed_retest", "Failed/Retest", RefreshCw, "bg-fuchsia-500/15 border-fuchsia-500/50 text-fuchsia-700")}
      {btn("blocked", "Blocked", AlertOctagon, "bg-amber-500/15 border-amber-500/50 text-amber-700")}
      {btn("not_run", "Reset",   MinusCircle,  "bg-muted border-border text-foreground")}
    </div>
  );
}

/* ============================ IMPLEMENTATION TAB =========================== */
export function ImplementationTab() {
  return (
    <div className="space-y-3">
      {IMPLEMENTATION_PLAN.map((p, i) => {
        const color =
          p.status === "done" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" :
          p.status === "in_progress" ? "bg-amber-500/10 text-amber-700 border-amber-500/30" :
          "bg-muted text-muted-foreground border-border";
        return (
          <Card key={p.name} className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-xs font-mono font-bold text-muted-foreground w-6 pt-0.5">{String(i + 1).padStart(2, "0")}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 capitalize ${color}`}>
                    {p.status.replace("_", " ")}
                  </span>
                  {p.shippedOn && <span className="text-[11px] text-muted-foreground">Shipped {p.shippedOn}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ================================ SPRINTS TAB ============================== */
export function SprintsTab() {
  return (
    <div className="space-y-4">
      {SPRINTS.map((s) => {
        const done = s.items.filter((i) => i.status === "done").length;
        const pct = s.items.length ? Math.round((done / s.items.length) * 100) : 0;
        return (
          <Card key={s.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-xs font-mono text-muted-foreground">SPRINT {s.number} · {s.id}</div>
                <h3 className="font-semibold text-lg">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.start} → {s.end}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="font-bold">{done}/{s.items.length} ({pct}%)</div>
              </div>
            </div>
            <Progress value={pct} className="h-1.5 mb-3" />
            <p className="text-sm italic mb-3 text-muted-foreground">Goal: {s.goal}</p>
            <ul className="divide-y divide-border border border-border rounded-md">
              {s.items.map((i) => (
                <li key={i.id} className="flex items-center gap-2 p-2 text-sm">
                  <StatusPill status={i.status} />
                  <span className="text-[10px] font-mono text-muted-foreground w-12">{i.id}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{i.type}</Badge>
                  <span className="flex-1">{i.title}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: "done" | "in_progress" | "todo" | "blocked" }) {
  const map = {
    done:        { c: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30", l: "Done" },
    in_progress: { c: "bg-amber-500/10 text-amber-700 border-amber-500/30",       l: "WIP" },
    todo:        { c: "bg-muted text-muted-foreground border-border",             l: "Todo" },
    blocked:     { c: "bg-destructive/10 text-destructive border-destructive/30", l: "Blocked" },
  };
  const v = map[status];
  return <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 w-16 text-center ${v.c}`}>{v.l}</span>;
}

/* ================================= TASKS TAB =============================== */
function TasksTab() {
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "in_progress" | "todo" | "blocked">("all");
  const filtered = TASKS.filter((t) => statusFilter === "all" || t.status === statusFilter);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {(["all", "todo", "in_progress", "done", "blocked"] as const).map((s) => (
          <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize">
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-3 text-sm">
              <StatusPill status={t.status} />
              <span className="text-[10px] font-mono text-muted-foreground w-14">{t.id}</span>
              <span className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 ${priorityVariant(t.priority)}`}>{t.priority}</span>
              <Badge variant="secondary" className="text-[10px]">{t.area}</Badge>
              <span className="flex-1">{t.title}</span>
              {t.notes && <span className="text-xs text-muted-foreground italic">{t.notes}</span>}
            </li>
          ))}
          {filtered.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No tasks in this status.</li>}
        </ul>
      </Card>
    </div>
  );
}