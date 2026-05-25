import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, MinusCircle, AlertOctagon, Search, RotateCcw,
  FlaskConical, CalendarDays, ListChecks, GitBranch, Sparkles,
} from "lucide-react";
import {
  TEST_CASES, IMPLEMENTATION_PLAN, SPRINTS, TASKS,
  loadAllStatuses, saveStatus,
  type TestStatus, type TestCase, type Priority,
  getTestAssignee, getTestSprintId, testAssignmentCounts, ACTIVE_SPRINT_ID,
} from "@/lib/test-plan";
import { SecurityBanner } from "@/components/SecurityBanner";
import { CMSFooter } from "@/components/CMSFooter";

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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <SecurityBanner />
      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-primary" /> Testing Portal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Use-case tests, implementation phases, sprint schedule, and the cross-sprint task backlog.
            </p>
          </div>
          <Link to="/" className="text-xs text-muted-foreground underline hover:text-foreground">← Back to app</Link>
        </header>

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
      </main>
      <CMSFooter />
    </div>
  );
}

/* ============================== TEST PLAN TAB ============================== */
export function TestPlanTab() {
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>(() => loadAllStatuses());
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | TestStatus>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");

  const setStatus = (id: string, s: TestStatus) => {
    saveStatus(id, s);
    setStatuses((p) => ({ ...p, [id]: s }));
  };
  const resetAll = () => {
    TEST_CASES.forEach((t) => saveStatus(t.id, "not_run"));
    setStatuses(loadAllStatuses());
  };

  const areas = useMemo(() => ["All", ...Array.from(new Set(TEST_CASES.map((t) => t.area)))], []);
  const owners = useMemo(() => ["All", ...Object.keys(testAssignmentCounts())], []);
  const ownerCounts = useMemo(() => testAssignmentCounts(), []);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TEST_CASES.filter((t) => {
      if (areaFilter !== "All" && t.area !== areaFilter) return false;
      if (statusFilter !== "all" && statuses[t.id] !== statusFilter) return false;
      if (ownerFilter !== "All" && getTestAssignee(t) !== ownerFilter) return false;
      if (!q) return true;
      return [t.id, t.title, t.area, ...t.steps, t.expected].some((f) => f.toLowerCase().includes(q));
    });
  }, [query, areaFilter, statusFilter, ownerFilter, statuses]);

  const counts = useMemo(() => {
    const c = { total: TEST_CASES.length, pass: 0, fail: 0, blocked: 0, not_run: 0 };
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
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(ownerCounts).map(([owner, n]) => (
              <span key={owner} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold bg-background">
                {owner} <span className="font-normal opacity-70">· {n} ({Math.round((n / TEST_CASES.length) * 100)}%)</span>
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
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Cases */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">No test cases match your filters.</Card>
        )}
        {filtered.map((t) => (
          <TestCaseCard key={t.id} t={t} status={statuses[t.id] ?? "not_run"} onChange={(s) => setStatus(t.id, s)} />
        ))}
      </div>
    </div>
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

function TestCaseCard({ t, status, onChange }: { t: TestCase; status: TestStatus; onChange: (s: TestStatus) => void }) {
  const ring =
    status === "pass"    ? "ring-2 ring-emerald-500/40" :
    status === "fail"    ? "ring-2 ring-destructive/50" :
    status === "blocked" ? "ring-2 ring-amber-500/50"  : "";
  return (
    <Card className={`p-4 ${ring}`}>
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{t.id}</span>
        <span className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 ${priorityVariant(t.priority)}`}>{t.priority}</span>
        <Badge variant="secondary" className="text-[11px]">{t.area}</Badge>
        <Badge variant="outline" className="text-[11px]">Sprint {getTestSprintId(t).replace("S-2026-0", "")}</Badge>
        <Badge variant="outline" className="text-[11px] border-primary/40 text-primary">Owner: {getTestAssignee(t)}</Badge>
        <h3 className="flex-1 font-semibold text-sm md:text-base">{t.title}</h3>
        <StatusButtons status={status} onChange={onChange} />
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
    </Card>
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