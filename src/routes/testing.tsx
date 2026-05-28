import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, MinusCircle, AlertOctagon, Search, RotateCcw,
  FlaskConical, CalendarDays, ListChecks, GitBranch, Sparkles, ExternalLink,
  Wrench, RefreshCw, Paperclip, Upload, Trash2, FileText, Loader2, Save, Pencil, ChevronRight, ChevronDown, Copy, Play,
} from "lucide-react";
import {
  TEST_CASES, IMPLEMENTATION_PLAN, SPRINTS, TASKS,
  loadAllStatuses, saveStatus,
  type TestStatus, type TestCase, type Priority,
  PRIORITY_LABELS, PRIORITY_SHORT,
  getTestAssignee, getTestSprintId, ACTIVE_SPRINT_ID,
  getTestCreditReward, totalCreditBudget, creditBudgetByOwner, REPRO_FAIL_BONUS,
  loadAllQaNotes, loadAllDevNotes, saveQaNote, saveDevNote,
  loadAllSeverities, saveSeverity, FAIL_SEVERITY_LABELS, type FailSeverity,
  loadAllAssigneeOverrides, saveAssigneeOverride,
  loadAllSprintOverrides, saveSprintOverride,
  applyDescriptionOverride, loadDescriptionOverride, saveDescriptionOverride,
  clearDescriptionOverride, type TestDescriptionOverride,
} from "@/lib/test-plan";
import { AppShell } from "@/components/AppShell";

import { useApp } from "@/lib/app-store";
import { useAssigneeOptions } from "@/lib/use-assignee-options";
import { hydrateTestResultsToLocal } from "@/lib/cloud-sync";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  listCustomTests, createCustomTest, duplicateCustomTest, customRowToTestCase, type CustomTestRow,
} from "@/lib/custom-tests";
import { AUTOMATED_TEST_CASES, AUTOMATED_TEST_IDS, AUTOMATED_TEST_RESULTS } from "@/lib/automated-tests";
import { expandAllWithPlatforms, TEST_PLATFORMS } from "@/lib/platform-variants";
import {
  listTestEvidence, uploadTestEvidence, deleteTestEvidence, getTestEvidenceUrl,
  type EvidenceFile,
} from "@/lib/test-evidence";
import { toast } from "sonner";
import { MultiSelect, multiSelectMatches } from "@/components/ui/multi-select";
import { useConfirm } from "@/components/ConfirmDialog";

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

/**
 * Copy a test-runner command to the clipboard. Tests can't actually execute
 * from the deployed app (Workers runtime can't spawn vitest / playwright), so
 * the Run buttons hand admins the exact command to paste into a terminal.
 */
async function copyRunCommand(cmd: string, label: string) {
  try {
    await navigator.clipboard.writeText(cmd);
    toast.success(`Copied: ${label}`, {
      description: cmd,
      duration: 6000,
    });
  } catch {
    toast.error("Could not copy to clipboard", { description: cmd });
  }
}

/** Extract the shell command stored in an automated test's first step
 *  ("Run: bunx vitest run …" → "bunx vitest run …"). */
function commandForAutomatedTest(t: TestCase): string | null {
  const step = t.steps[0] ?? "";
  const m = step.match(/^Run:\s*(.+)$/);
  return m ? m[1].trim() : null;
}

function RunAutomatedButton({ t }: { t: TestCase }) {
  const cmd = commandForAutomatedTest(t);
  if (!cmd) return null;
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 px-2 text-xs border-emerald-500/60 text-emerald-700 hover:bg-emerald-500/10"
      onClick={() => copyRunCommand(cmd, `Run ${t.id}`)}
      title={`Copy command: ${cmd}`}
    >
      <Play className="h-3.5 w-3.5 mr-1" /> Run
    </Button>
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
  const { user } = useApp();
  const isAdmin = user?.role === "admin";
  const isQa = user?.role === "qa";
  return (
    <AppShell title="Testing Portal" subtitle="Use-case tests, implementation phases, sprint schedule, and the cross-sprint task backlog.">
      {(isQa || isAdmin) && (
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <div>
            <b>New here?</b> Read the QA Manual — filters, statuses, bulk edits, and the bug pipeline in one short page.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href="/qa-credits" className="inline-flex items-center rounded-md bg-emerald/80 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
              Credits →
            </a>
            <a href="/qa-manual" className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
              QA Manual →
            </a>
          </div>
        </div>
      )}
      <Tabs defaultValue="tests" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList className={`grid w-full md:w-auto ${isAdmin ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}>
            <TabsTrigger value="tests"><ListChecks className="h-3.5 w-3.5 mr-1.5" />Test Plan</TabsTrigger>
            {isAdmin && <TabsTrigger value="impl"><GitBranch className="h-3.5 w-3.5 mr-1.5" />Implementation</TabsTrigger>}
            <TabsTrigger value="sprints"><CalendarDays className="h-3.5 w-3.5 mr-1.5" />Sprints</TabsTrigger>
            {isAdmin && (
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />Tasks
              </Link>
            )}
          </TabsList>
          
        </div>

        <TabsContent value="tests"><TestPlanTab /></TabsContent>
        {isAdmin && <TabsContent value="impl"><ImplementationTab /></TabsContent>}
        <TabsContent value="sprints"><SprintsTab /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

/* ============================== TEST PLAN TAB ============================== */
export function TestPlanTab() {
  const { user } = useApp();
  const isAdmin = user?.role === "admin";
  const confirm = useConfirm();
  // Persisted/saved state, hydrated from local storage
  // Seed local statuses with the last recorded vitest/playwright run so
  // automated tests show pass/fail without requiring the user to mark them.
  // A user-set status (anything other than the default "not_run") still wins.
  const [savedStatuses, setSavedStatuses] = useState<Record<string, TestStatus>>(() => {
    const local = loadAllStatuses();
    for (const [id, st] of Object.entries(AUTOMATED_TEST_RESULTS)) {
      if (!local[id] || local[id] === "not_run") local[id] = st;
    }
    return local;
  });
  const [savedQaNotes, setSavedQaNotes] = useState<Record<string, string>>(() => loadAllQaNotes());
  const [savedDevNotes, setSavedDevNotes] = useState<Record<string, string>>(() => loadAllDevNotes());
  const [savedSeverities, setSavedSeverities] = useState<Record<string, FailSeverity | "">>(() => loadAllSeverities());
  const [savedAssignees, setSavedAssignees] = useState<Record<string, string>>(() => loadAllAssigneeOverrides());
  const [savedSprints, setSavedSprints] = useState<Record<string, string>>(() => loadAllSprintOverrides());
  // On mount, pull the authoritative test_results from the cloud into
  // localStorage so this browser shows whatever was last saved to the DB
  // (covers the case where local state was cleared and needs to be restored).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const n = await hydrateTestResultsToLocal();
        if (cancelled || !n) return;
        setSavedStatuses(loadAllStatuses());
        setSavedQaNotes(loadAllQaNotes());
        setSavedDevNotes(loadAllDevNotes());
        setSavedSeverities(loadAllSeverities());
        setSavedAssignees(loadAllAssigneeOverrides());
        setSavedSprints(loadAllSprintOverrides());
      } catch (e) {
        console.warn("[testing] hydrate failed", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  // Bump this to re-read description overrides from storage after edits.
  const [descVersion, setDescVersion] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  // User-created custom tests (loaded from custom_tests table). These merge
  // into the standard TEST_CASES list and default to Unassigned.
  const [customTests, setCustomTests] = useState<CustomTestRow[]>([]);
  const [newTestOpen, setNewTestOpen] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await listCustomTests();
        if (!cancelled) setCustomTests(rows);
      } catch (e) {
        console.warn("[testing] load custom tests failed", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Effective test cases with description overrides applied (admin edits).
  const effectiveCases = useMemo(
    () => {
      const base = TEST_CASES.map((t) => applyDescriptionOverride(t));
      const custom = customTests.map(customRowToTestCase);
      // Fan every manual scenario + custom test out into one variant per
      // supported platform (iPhone / Android / iPad / macOS / Windows). The
      // original un-suffixed entries are dropped — only the platform variants
      // are surfaced so QA always tests on every device. Automated test runs
      // map 1:1 to source files and stay un-expanded.
      const baseExpanded = expandAllWithPlatforms(base);
      const customExpanded = expandAllWithPlatforms(custom);
      return [...baseExpanded, ...AUTOMATED_TEST_CASES, ...customExpanded];
    },
    [descVersion, customTests],
  );
  // Set of test ids that are user-created (no auto-derived assignee/sprint).
  // Includes both the source CUS-### id and every platform-variant id
  // (CUS-###-IOS, …-AND, …) so the custom-test branches still apply after
  // expandAllWithPlatforms() fans each row out.
  const customIds = useMemo(() => {
    const s = new Set<string>();
    for (const c of customTests) {
      s.add(c.id);
      for (const p of TEST_PLATFORMS) s.add(`${c.id}-${p.suffix}`);
    }
    return s;
  }, [customTests]);
  const effectiveById = useMemo(() => {
    const m = new Map<string, TestCase>();
    for (const t of effectiveCases) m.set(t.id, t);
    return m;
  }, [effectiveCases]);
  // Draft (unsaved) overlays — only changed entries
  const [dStatuses, setDStatuses] = useState<Record<string, TestStatus>>({});
  const [dQaNotes, setDQaNotes] = useState<Record<string, string>>({});
  const [dDevNotes, setDDevNotes] = useState<Record<string, string>>({});
  const [dSeverities, setDSeverities] = useState<Record<string, FailSeverity | "">>({});
  const [dAssignees, setDAssignees] = useState<Record<string, string>>({});
  const [dSprints, setDSprints] = useState<Record<string, string>>({});
  const [saveOpen, setSaveOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [sprintFilter, setSprintFilter] = useState<string[]>([]);
  // For QA users, default the owner filter to themselves on first load so
  // they only see the tests assigned to them. Admins see everything.
  const ownerFilterInitialized = useRef(false);
  useEffect(() => {
    if (ownerFilterInitialized.current) return;
    if (!user) return;
    ownerFilterInitialized.current = true;
    if (user.role === "qa") {
      const first = (user.full_name || user.email || "").trim().split(/\s+/)[0];
      if (first) setOwnerFilter([first]);
    }
  }, [user]);
  const [bannerCollapsed, setBannerCollapsed] = useState(true);
  const [summaryCollapsed, setSummaryCollapsed] = useState(true);

  // Effective (saved + draft) views used for rendering and filtering
  const statuses = useMemo(() => ({ ...savedStatuses, ...dStatuses }), [savedStatuses, dStatuses]);
  const qaNotes = useMemo(() => ({ ...savedQaNotes, ...dQaNotes }), [savedQaNotes, dQaNotes]);
  const devNotes = useMemo(() => ({ ...savedDevNotes, ...dDevNotes }), [savedDevNotes, dDevNotes]);
  const severities = useMemo(() => ({ ...savedSeverities, ...dSeverities }), [savedSeverities, dSeverities]);
  const assigneeOverrides = useMemo(() => ({ ...savedAssignees, ...dAssignees }), [savedAssignees, dAssignees]);
  const sprintOverrides = useMemo(() => ({ ...savedSprints, ...dSprints }), [savedSprints, dSprints]);

  // Helper: write to draft, removing the entry if it equals the saved value
  function updateDraft<T>(
    setter: React.Dispatch<React.SetStateAction<Record<string, T>>>,
    saved: Record<string, T>,
    id: string,
    value: T,
    defaultSaved: T,
  ) {
    setter((p) => {
      const next = { ...p };
      const baseline = saved[id] ?? defaultSaved;
      if (Object.is(value, baseline)) delete next[id];
      else next[id] = value;
      return next;
    });
  }

  const setStatus = (id: string, s: TestStatus) => {
    updateDraft(setDStatuses, savedStatuses, id, s, "not_run" as TestStatus);
    if (s !== "fail" && s !== "failed_retest") {
      updateDraft(setDSeverities, savedSeverities, id, "" as FailSeverity | "", "" as FailSeverity | "");
    }
  };
  const setQaNote = (id: string, note: string) =>
    updateDraft(setDQaNotes, savedQaNotes, id, note, "");
  const setDevNote = (id: string, note: string) =>
    updateDraft(setDDevNotes, savedDevNotes, id, note, "");
  const setSeverityFor = (id: string, s: FailSeverity | "") =>
    updateDraft(setDSeverities, savedSeverities, id, s, "");
  const setAssigneeFor = (id: string, owner: string) =>
    updateDraft(setDAssignees, savedAssignees, id, owner, "");
  const setSprintFor = (id: string, sprintId: string) =>
    updateDraft(setDSprints, savedSprints, id, sprintId, "");

  const toggleSelect = (id: string) => {
    setSelected((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  // Build a list of pending changes for the save dialog
  type Change = {
    key: string; // unique id "<testId>:<field>"
    testId: string;
    field: "status" | "qaNote" | "devNote" | "severity" | "assignee" | "sprint";
    label: string;
    before: string;
    after: string;
  };
  const pendingChanges = useMemo<Change[]>(() => {
    const list: Change[] = [];
    const fmt = (v: unknown) => (v === "" || v == null ? "—" : String(v));
    for (const [id, v] of Object.entries(dStatuses))
      list.push({ key: `${id}:status`, testId: id, field: "status", label: "Status",
        before: fmt(savedStatuses[id] ?? "not_run"), after: fmt(v) });
    for (const [id, v] of Object.entries(dQaNotes))
      list.push({ key: `${id}:qaNote`, testId: id, field: "qaNote", label: "QA note",
        before: fmt(savedQaNotes[id] ?? ""), after: fmt(v) });
    for (const [id, v] of Object.entries(dDevNotes))
      list.push({ key: `${id}:devNote`, testId: id, field: "devNote", label: "Dev note",
        before: fmt(savedDevNotes[id] ?? ""), after: fmt(v) });
    for (const [id, v] of Object.entries(dSeverities))
      list.push({ key: `${id}:severity`, testId: id, field: "severity", label: "Severity",
        before: fmt(savedSeverities[id] ?? ""), after: fmt(v) });
    for (const [id, v] of Object.entries(dAssignees))
      list.push({ key: `${id}:assignee`, testId: id, field: "assignee", label: "Owner",
        before: fmt(savedAssignees[id] ?? ""), after: fmt(v) });
    for (const [id, v] of Object.entries(dSprints))
      list.push({ key: `${id}:sprint`, testId: id, field: "sprint", label: "Sprint",
        before: fmt(savedSprints[id] ?? ""), after: fmt(v) });
    return list.sort((a, b) => a.testId.localeCompare(b.testId));
  }, [dStatuses, dQaNotes, dDevNotes, dSeverities, dAssignees, dSprints,
      savedStatuses, savedQaNotes, savedDevNotes, savedSeverities, savedAssignees, savedSprints]);

  const pendingCount = pendingChanges.length;

  const discardAllDrafts = async () => {
    if (pendingCount === 0) return;
    if (!(await confirm({
      title: "Discard changes?",
      description: `Discard all ${pendingCount} unsaved change(s)?`,
      confirmLabel: "Discard",
      destructive: true,
    }))) return;
    setDStatuses({}); setDQaNotes({}); setDDevNotes({});
    setDSeverities({}); setDAssignees({}); setDSprints({});
  };

  const hasTestChanges = (id: string) =>
    id in dStatuses || id in dQaNotes || id in dDevNotes || id in dSeverities || id in dAssignees || id in dSprints;

  const saveSingleTest = (id: string) => {
    const keys = new Set(pendingChanges.filter((c) => c.testId === id).map((c) => c.key));
    if (keys.size === 0) return;
    commitChanges(keys);
  };

  // Persist a subset of pending changes; remaining ones stay in draft.
  const commitChanges = async (selectedKeys: Set<string>) => {
    const stillDraft = {
      status: { ...dStatuses }, qaNote: { ...dQaNotes }, devNote: { ...dDevNotes },
      severity: { ...dSeverities }, assignee: { ...dAssignees }, sprint: { ...dSprints },
    };
    const newSaved = {
      status: { ...savedStatuses }, qaNote: { ...savedQaNotes }, devNote: { ...savedDevNotes },
      severity: { ...savedSeverities }, assignee: { ...savedAssignees }, sprint: { ...savedSprints },
    };
    const cloudPromises: Promise<boolean>[] = [];
    const { cloudPushTest, cloudAppendNote } = await import("@/lib/cloud-sync");
    for (const c of pendingChanges) {
      if (!selectedKeys.has(c.key)) continue;
      const id = c.testId;
      switch (c.field) {
        case "status": {
          const v = dStatuses[id]!; saveStatus(id, v); cloudPromises.push(cloudPushTest(id, { status: v })); newSaved.status[id] = v; delete stillDraft.status[id]; break;
        }
        case "qaNote": {
          const v = dQaNotes[id]!; saveQaNote(id, v); if (v.trim()) cloudPromises.push((async () => { cloudAppendNote(id, "qa", v); return true; })()); newSaved.qaNote[id] = v; delete stillDraft.qaNote[id]; break;
        }
        case "devNote": {
          const v = dDevNotes[id]!; saveDevNote(id, v); if (v.trim()) cloudPromises.push((async () => { cloudAppendNote(id, "dev", v); return true; })()); newSaved.devNote[id] = v; delete stillDraft.devNote[id]; break;
        }
        case "severity": {
          const v = dSeverities[id]!; saveSeverity(id, v); cloudPromises.push(cloudPushTest(id, { severity: v || null })); newSaved.severity[id] = v; delete stillDraft.severity[id]; break;
        }
        case "assignee": {
          const v = dAssignees[id]!; saveAssigneeOverride(id, v); cloudPromises.push(cloudPushTest(id, { assignee: v || null })); newSaved.assignee[id] = v; delete stillDraft.assignee[id]; break;
        }
        case "sprint": {
          const v = dSprints[id]!; saveSprintOverride(id, v); cloudPromises.push(cloudPushTest(id, { sprint_id: v || null })); newSaved.sprint[id] = v; delete stillDraft.sprint[id]; break;
        }
      }
    }
    setSavedStatuses(newSaved.status); setSavedQaNotes(newSaved.qaNote); setSavedDevNotes(newSaved.devNote);
    setSavedSeverities(newSaved.severity); setSavedAssignees(newSaved.assignee); setSavedSprints(newSaved.sprint);
    setDStatuses(stillDraft.status); setDQaNotes(stillDraft.qaNote); setDDevNotes(stillDraft.devNote);
    setDSeverities(stillDraft.severity); setDAssignees(stillDraft.assignee); setDSprints(stillDraft.sprint);
    setSaveOpen(false);
    const results = await Promise.all(cloudPromises);
    const okCount = results.filter(Boolean).length;
    const failCount = results.length - okCount;
    if (failCount === 0) {
      toast.success(`Saved ${selectedKeys.size} change${selectedKeys.size === 1 ? "" : "s"} to cloud.`);
    } else {
      toast.error(`Saved locally, but ${failCount} of ${results.length} cloud write${results.length === 1 ? "" : "s"} failed — see console.`);
    }
  };

  const areas = useMemo(() => Array.from(new Set(effectiveCases.map((t) => t.area))), [effectiveCases]);
  // Effective assignee/sprint that respects unsaved drafts (the lib helpers read storage)
  const effAssignee = (t: TestCase): string => {
    const ov = assigneeOverrides[t.id];
    let raw: string;
    if (customIds.has(t.id)) {
      raw = ov || (t.assignee && t.assignee !== "Unassigned" ? t.assignee : "Unassigned");
    } else if (AUTOMATED_TEST_IDS.has(t.id)) {
      // Automated tests stay owned by their runner — they're not human-
      // assignable, so the fail-→Dev rule in getTestAssignee doesn't apply.
      raw = t.assignee || "Unassigned";
    } else if (t.assignee) {
      // Canonical hardcoded assignee on the test case wins over stale local
      // overrides (older builds auto-saved owners via a 70/30 split that
      // pre-dated explicit ownership). Failed tests still route to Dev.
      const status = statuses[t.id];
      raw = (status === "fail" || status === "failed_retest") ? "Dev" : t.assignee;
    } else {
      raw = ov || getTestAssignee(t, statuses[t.id]);
    }
    if (raw === "Me") return "Evelyn";
    if (raw === "Design" || raw === "Dev") return "Eng";
    return raw;
  };
  const effSprint = (t: TestCase): string => {
    const ov = sprintOverrides[t.id];
    if (ov) return ov;
    // Custom tests with no explicit sprint live in the "Unassigned" group.
    if (customIds.has(t.id)) return t.sprintId || "";
    return getTestSprintId(t);
  };
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(
    () => new Set(SPRINTS.filter((s) => s.id !== ACTIVE_SPRINT_ID).map((s) => s.id))
  );
  const toggleCollapsedSprint = (id: string) =>
    setCollapsedSprints((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  const ownerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of effectiveCases) {
      const a = effAssignee(t);
      counts[a] = (counts[a] || 0) + 1;
    }
    return counts;
  }, [statuses, assigneeOverrides, effectiveCases]);
  const owners = useMemo(() => Object.keys(ownerCounts), [ownerCounts]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return effectiveCases.filter((t) => {
      if (!multiSelectMatches(areaFilter, t.area)) return false;
      if (!multiSelectMatches(statusFilter, statuses[t.id] ?? "not_run")) return false;
      if (!multiSelectMatches(ownerFilter, effAssignee(t))) return false;
      if (!multiSelectMatches(sprintFilter, effSprint(t))) return false;
      if (!q) return true;
      return [t.id, t.title, t.area, ...t.steps, t.expected].some((f) => f.toLowerCase().includes(q));
    });
  }, [query, areaFilter, statusFilter, ownerFilter, sprintFilter, statuses, assigneeOverrides, sprintOverrides, effectiveCases]);

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

  // When a single status filter is active, the progress bars reflect THAT status.
  // Otherwise we default to "pass" (pass-rate behaviour).
  const focusStatus: TestStatus =
    statusFilter.length === 1 ? (statusFilter[0] as TestStatus) : "pass";
  const focusStatusLabel: Record<TestStatus, string> = {
    pass: "Pass",
    fail: "Fail",
    fixed_retest: "Fixed/Retest",
    failed_retest: "Failed/Retest",
    blocked: "Blocked",
    not_run: "Not run",
  };
  const overallFocusCount = counts[focusStatus];
  const overallFocusPct = counts.total
    ? Math.round((overallFocusCount / counts.total) * 100)
    : 0;

  // Per-QA-person status breakdown. Only owners with at least one test appear.
  const ownerStatusCounts = useMemo(() => {
    const out: Record<string, Record<TestStatus | "total", number>> = {};
    for (const t of effectiveCases) {
      const owner = effAssignee(t);
      if (!out[owner]) out[owner] = { total: 0, pass: 0, fail: 0, blocked: 0, not_run: 0, fixed_retest: 0, failed_retest: 0 };
      const s = (statuses[t.id] ?? "not_run") as TestStatus;
      out[owner].total++;
      out[owner][s]++;
    }
    return out;
  }, [statuses, assigneeOverrides, effectiveCases]);

  return (
    <div className="space-y-4">
      {/* Sprint + ownership banner */}
      <Card className="bg-primary/5 border-primary/30 p-4">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Active sprint</div>
            <div className="font-bold text-base">Sprint 1 · Beta go-live ({ACTIVE_SPRINT_ID})</div>
          </div>
          <div className="text-xs text-muted-foreground">5/25 → 5/31 · {TEST_CASES.filter((t) => (t.sprintId ?? ACTIVE_SPRINT_ID) === ACTIVE_SPRINT_ID).length} of {TEST_CASES.length} test cases on this sprint (older sprints listed below)</div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
              Beta tester reward pool: <span className="font-semibold text-foreground">{totalCreditBudget()} credit tokens</span>
              {" "}· Severe=15 · High=10 · Medium=5 · Low=3 · +{REPRO_FAIL_BONUS} bonus per first repro-fail
            </div>
            <div className="flex flex-wrap gap-2 text-xs mt-3">
              {Object.entries(ownerCounts).map(([owner, n]) => {
                const active = ownerFilter.length === 1 && ownerFilter[0] === owner;
                return (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => setOwnerFilter(active ? [] : [owner])}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold bg-background cursor-pointer hover:bg-accent transition-colors ${active ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                  >
                    {owner} <span className="font-normal opacity-70">· {n} tests · {creditBudgetByOwner()[owner] ?? 0} cr</span>
                  </button>
                );
              })}
            </div>
      </Card>

      {/* Summary */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {focusStatusLabel[focusStatus]} rate
              </div>
            </div>
            <div className="text-2xl font-bold">{overallFocusPct}%</div>
            <div className="text-[11px] text-muted-foreground">
              {overallFocusCount}/{counts.total}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatBadge n={counts.pass}     label="Pass"    color="bg-emerald-500/10 text-emerald-700 border-emerald-500/30" active={statusFilter.length === 1 && statusFilter[0] === "pass"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "pass" ? [] : ["pass"])} />
            <StatBadge n={counts.fail}     label="Fail"    color="bg-destructive/10 text-destructive border-destructive/30" active={statusFilter.length === 1 && statusFilter[0] === "fail"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "fail" ? [] : ["fail"])} />
            <StatBadge n={counts.fixed_retest}  label="Fixed/Retest"   color="bg-sky-500/10 text-sky-700 border-sky-500/30" active={statusFilter.length === 1 && statusFilter[0] === "fixed_retest"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "fixed_retest" ? [] : ["fixed_retest"])} />
            <StatBadge n={counts.failed_retest} label="Failed/Retest"  color="bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/30" active={statusFilter.length === 1 && statusFilter[0] === "failed_retest"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "failed_retest" ? [] : ["failed_retest"])} />
            <StatBadge n={counts.blocked}  label="Blocked" color="bg-amber-500/10 text-amber-700 border-amber-500/30" active={statusFilter.length === 1 && statusFilter[0] === "blocked"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "blocked" ? [] : ["blocked"])} />
            <StatBadge n={counts.not_run}  label="Not run" color="bg-muted text-muted-foreground border-border" active={statusFilter.length === 1 && statusFilter[0] === "not_run"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "not_run" ? [] : ["not_run"])} />
            <StatBadge n={counts.total}    label="Total"   color="bg-primary/10 text-primary border-primary/30" active={statusFilter.length === 0} onClick={() => setStatusFilter([])} />
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-500/60 text-emerald-700 hover:bg-emerald-500/10"
                  onClick={() => copyRunCommand("bun run test", "Run all Vitest tests")}
                  title="Copy: bun run test (runs the full Vitest suite locally)"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Run Vitest
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sky-500/60 text-sky-700 hover:bg-sky-500/10"
                  onClick={() => copyRunCommand("bun run e2e", "Run all Playwright tests")}
                  title="Copy: bun run e2e (runs the full Playwright suite locally)"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Run Playwright
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="default"
              onClick={() => setSaveOpen(true)}
              disabled={pendingCount === 0}
              className="relative"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
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
          </div>
        </div>
        <>
            <Progress value={overallFocusPct} className="h-2" />
            {Object.keys(ownerStatusCounts).length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  By QA owner
                </div>
                <div className="space-y-1.5">
                  {Object.entries(ownerStatusCounts)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([owner, c]) => {
                      const ownerActive = ownerFilter.length === 1 && ownerFilter[0] === owner;
                      const toggleOwnerStatus = (s: TestStatus) => {
                        setOwnerFilter([owner]);
                        setStatusFilter(
                          statusFilter.length === 1 && statusFilter[0] === s && ownerActive ? [] : [s],
                        );
                      };
                      const clearOwner = () => {
                        setOwnerFilter(ownerActive && statusFilter.length === 0 ? [] : [owner]);
                        if (!(ownerActive && statusFilter.length === 0)) setStatusFilter([]);
                      };
                      const ownerFocusCount = c[focusStatus];
                      const ownerFocusPct = c.total
                        ? Math.round((ownerFocusCount / c.total) * 100)
                        : 0;
                      const cell = (n: number, label: string, klass: string, s: TestStatus) => {
                        const isActive = ownerActive && statusFilter.length === 1 && statusFilter[0] === s;
                        return (
                          <button
                            type="button"
                            onClick={() => toggleOwnerStatus(s)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors hover:opacity-80 ${klass} ${isActive ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                            title={`Filter to ${owner} · ${label}`}
                          >
                            {n} <span className="font-normal opacity-70">{label}</span>
                          </button>
                        );
                      };
                      return (
                        <div key={owner} className="space-y-1 py-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={clearOwner}
                              className={`min-w-[88px] text-left text-xs font-semibold hover:underline ${ownerActive ? "text-primary" : ""}`}
                              title={`Filter all tests for ${owner}`}
                            >
                              {owner}
                            </button>
                            <span className="text-[11px] text-muted-foreground">
                              {ownerFocusCount}/{c.total} · {ownerFocusPct}%{" "}
                              {focusStatusLabel[focusStatus]}
                            </span>
                          </div>
                          <Progress value={ownerFocusPct} className="h-1.5" />
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {cell(c.pass, "Pass", "bg-emerald-500/10 text-emerald-700 border-emerald-500/30", "pass")}
                            {cell(c.fail, "Fail", "bg-destructive/10 text-destructive border-destructive/30", "fail")}
                            {cell(c.fixed_retest, "Fixed/Retest", "bg-sky-500/10 text-sky-700 border-sky-500/30", "fixed_retest")}
                            {cell(c.failed_retest, "Failed/Retest", "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/30", "failed_retest")}
                            {cell(c.blocked, "Blocked", "bg-amber-500/10 text-amber-700 border-amber-500/30", "blocked")}
                            {cell(c.not_run, "Not run", "bg-muted text-muted-foreground border-border", "not_run")}
                            <span className="text-[11px] text-muted-foreground">· {c.total} total</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search by id, title, area, step…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <MultiSelect
          placeholder="Area" triggerClassName="w-[180px]"
          options={areas.map((a) => ({ value: a, label: a }))}
          value={areaFilter} onChange={setAreaFilter}
        />
        <MultiSelect
          placeholder="Owner" triggerClassName="w-[180px]"
          options={owners.map((o) => ({ value: o, label: o }))}
          value={ownerFilter} onChange={setOwnerFilter}
        />
        <MultiSelect
          placeholder="Sprint" triggerClassName="w-[200px]"
          options={SPRINTS.map((s) => ({ value: s.id, label: `Sprint ${s.number} · ${s.name}` }))}
          value={sprintFilter} onChange={setSprintFilter}
        />
        <MultiSelect
          placeholder="Status" triggerClassName="w-[180px]"
          options={[
            { value: "not_run", label: "Not run" },
            { value: "pass", label: "Pass" },
            { value: "fail", label: "Fail" },
            { value: "fixed_retest", label: "Fixed / Retest" },
            { value: "failed_retest", label: "Failed / Retest" },
            { value: "blocked", label: "Blocked" },
          ]}
          value={statusFilter} onChange={setStatusFilter}
        />
        {(isAdmin || user?.role === "qa") && (
          <Button size="sm" onClick={() => setNewTestOpen(true)} className="ml-auto">
            + New Test
          </Button>
        )}
      </div>

      <NewTestDialog
        open={newTestOpen}
        onOpenChange={setNewTestOpen}
        existingIds={effectiveCases.map((t) => t.id)}
        onCreated={(row: CustomTestRow) => {
          setCustomTests((prev) => [row, ...prev]);
          toast.success(`Created ${row.id}`);
        }}
      />

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
        {(() => {
          const groups = new Map<string, TestCase[]>();
          for (const t of filtered) {
            const k = effSprint(t) || "_none";
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k)!.push(t);
          }
          const ordered: { sprintId: string; tests: TestCase[] }[] = [];
          // Surface user-created / unassigned tests at the very top so admins
          // see fresh work that still needs an owner before anything else.
          if (groups.has("_none")) ordered.push({ sprintId: "_none", tests: groups.get("_none")! });
          // Always render every sprint header (even empty ones) so the full
          // schedule is visible and tests can be re-assigned across sprints.
          ordered.push({ sprintId: ACTIVE_SPRINT_ID, tests: groups.get(ACTIVE_SPRINT_ID) ?? [] });
          for (const s of SPRINTS) {
            if (s.id !== ACTIVE_SPRINT_ID) ordered.push({ sprintId: s.id, tests: groups.get(s.id) ?? [] });
          }
          return ordered.map(({ sprintId, tests }) => {
            const sprintMeta = SPRINTS.find((s) => s.id === sprintId);
            const isCollapsed = collapsedSprints.has(sprintId);
            const label = sprintMeta ? `Sprint ${sprintMeta.number} · ${sprintMeta.name}` : "Unassigned";
            const isActive = sprintId === ACTIVE_SPRINT_ID;
            return (
              <Fragment key={sprintId}>
                <Card
                  className="p-3 bg-muted/60 hover:bg-muted/70 cursor-pointer border-2"
                  onClick={() => toggleCollapsedSprint(sprintId)}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <ChevronRight className={`h-4 w-4 transition-transform ${!isCollapsed ? "rotate-90" : ""}`} />
                    <span>{label}</span>
                    {isActive && <Badge variant="outline" className="border-primary/60 text-primary">Current</Badge>}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      {tests.length} test{tests.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </Card>
                {!isCollapsed && tests.map((t) => (
                  <TestCaseCard
                    key={t.id}
                    t={t}
                    status={statuses[t.id] ?? "not_run"}
                    qaNote={qaNotes[t.id] ?? ""}
                    devNote={devNotes[t.id] ?? ""}
                    severity={severities[t.id] ?? ""}
                    assignee={effAssignee(t)}
                    sprintId={effSprint(t)}
                    selected={selected.has(t.id)}
                    onSelectChange={() => toggleSelect(t.id)}
                    onChange={(s) => setStatus(t.id, s)}
                    onQaNoteChange={(n) => setQaNote(t.id, n)}
                    onDevNoteChange={(n) => setDevNote(t.id, n)}
                    onSeverityChange={(s) => setSeverityFor(t.id, s)}
                    onAssigneeChange={(o) => setAssigneeFor(t.id, o)}
                    onSprintChange={(s) => setSprintFor(t.id, s)}
                    isAdmin={isAdmin}
                    assigneeLocked={AUTOMATED_TEST_IDS.has(t.id)}
                    onEdit={() => setEditingId(t.id)}
                    onDuplicate={async () => {
                      try {
                        const row = await duplicateCustomTest(
                          t,
                          effectiveCases.map((x) => x.id),
                        );
                        setCustomTests((prev) => [row, ...prev]);
                        toast.success(`Duplicated ${t.id} → ${row.id}`);
                      } catch (e) {
                        toast.error(`Could not duplicate: ${(e as Error).message}`);
                      }
                    }}
                    hasChanges={hasTestChanges(t.id)}
                    onSave={() => saveSingleTest(t.id)}
                  />
                ))}
              </Fragment>
            );
          });
        })()}
      </div>
      <SaveChangesDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        changes={pendingChanges}
        onConfirm={commitChanges}
      />
      <EditDescriptionDialog
        test={editingId ? effectiveById.get(editingId) ?? null : null}
        open={!!editingId}
        onOpenChange={(v: boolean) => { if (!v) setEditingId(null); }}
        onSaved={() => { setDescVersion((v) => v + 1); setEditingId(null); }}
      />
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
  const { user } = useApp();
  const isQA = user?.role === "qa";
  const [qaDraft, setQaDraft] = useState("");
  const [devDraft, setDevDraft] = useState("");
  const disabled = selectedCount === 0;
  const assigneeOptions = useAssigneeOptions();
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
          {isQA ? (
            <>
              <option value="not_run">Not started</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="blocked">In progress</option>
            </>
          ) : (
            <>
              <option value="not_run">Not run</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="fixed_retest">Fixed / Retest</option>
              <option value="failed_retest">Failed / Retest</option>
              <option value="blocked">Blocked</option>
            </>
          )}
        </select>
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => { if (e.target.value) { onSetAssignee(e.target.value); e.target.value = ""; } }}
          title="Set owner for selected"
        >
          <option value="">Set owner…</option>
          {assigneeOptions.map((o: string) => <option key={o} value={o}>{o}</option>)}
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
          <option value="severe">Severe (Show Stopper)</option>
          <option value="high">High (Must Haves)</option>
          <option value="medium">Medium (Nice Haves)</option>
          <option value="low">Low (Can Wait)</option>
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

function StatBadge({ n, label, color, active, onClick }: { n: number; label: string; color: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ${color} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${active ? "ring-2 ring-offset-1 ring-primary" : ""}`}
    >
      {n} <span className="font-normal opacity-80">{label}</span>
    </button>
  );
}

function priorityVariant(p: Priority): string {
  switch (p) {
    case "P0": return "bg-destructive/10 text-destructive border-destructive/30";
    case "P1": return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    case "P2": return "bg-primary/10 text-primary border-primary/30";
    case "P3": return "bg-muted text-muted-foreground border-border";
  }
}

/** Renders scenario data steps (demographics, conditions, meds) as a sub-list. */
function StepWithSublist({ step, className }: { step: string; className?: string }) {
  // "Enter birth year..., ZIP3=..., gender..." → split by comma after the intro
  if (step.startsWith("Enter ") && step.includes(", ZIP3=")) {
    const parts = step.split(", ");
    return (
      <span className={className}>
        {parts[0]},
        <ul className="ml-5 mt-0.5 space-y-0.5 list-disc list-outside">
          {parts.slice(1).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </span>
    );
  }

  // "Add these X exactly: A, B" or "Add these X exactly: A; B"
  const exactlyMatch = step.match(/^(Add these .+? exactly:\s*)(.+)$/);
  if (exactlyMatch) {
    const prefix = exactlyMatch[1];
    const rest = exactlyMatch[2];
    const separator = rest.includes("; ") ? "; " : ", ";
    const items = rest.split(separator).map((s) => s.trim()).filter(Boolean);
    if (items.length >= 2) {
      return (
        <span className={className}>
          {prefix}
          <ul className="ml-5 mt-0.5 space-y-0.5 list-disc list-outside">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </span>
      );
    }
  }

  return <span className={className}>{step}</span>;
}

function TestCaseCard({
  t, status, qaNote, devNote, severity, assignee, sprintId, selected, onSelectChange,
  onChange, onQaNoteChange, onDevNoteChange, onSeverityChange, onAssigneeChange, onSprintChange,
  isAdmin, onEdit, hasChanges, onSave, assigneeLocked,
  onDuplicate,
}: {
  t: TestCase;
  status: TestStatus;
  qaNote: string;
  devNote: string;
  severity: FailSeverity | "";
  assignee: string;
  sprintId: string;
  selected: boolean;
  onSelectChange: () => void;
  onChange: (s: TestStatus) => void;
  onQaNoteChange: (n: string) => void;
  onDevNoteChange: (n: string) => void;
  onSeverityChange: (s: FailSeverity | "") => void;
  onAssigneeChange: (owner: string) => void;
  onSprintChange: (sprintId: string) => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDuplicate?: () => void;
  hasChanges?: boolean;
  onSave?: () => void;
  /** When true, the Owner select is rendered read-only (used for
   *  auto-discovered Vitest / Playwright tests owned by their runner). */
  assigneeLocked?: boolean;
}) {
  // Shade the whole row based on status (background + left border accent)
  const shade =
    status === "pass"          ? "border-l-4 border-l-emerald-500 bg-emerald-500/15" :
    status === "fail"          ? "border-l-4 border-l-destructive bg-destructive/15" :
    status === "blocked"       ? "border-l-4 border-l-amber-500 bg-amber-500/15"     :
    status === "fixed_retest"  ? "border-l-4 border-l-sky-500 bg-sky-500/15"         :
    status === "failed_retest" ? "border-l-4 border-l-fuchsia-500 bg-fuchsia-500/15" :
                                 "border-l-4 border-l-muted-foreground/30 bg-background";
  const showQaNote = status === "fail" || status === "failed_retest";
  const showDevNote = status === "fixed_retest" || status === "failed_retest";
  const assigneeOptions = useAssigneeOptions();
  // Per-step execution checkboxes — persisted locally so the tester can
  // resume where they left off. Marking "Pass" requires every step checked.
  const stepsKey = `qa-step-checks:${t.id}`;
  const confirm = useConfirm();
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(stepsKey);
      return raw ? new Set<number>(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  const persistSteps = (next: Set<number>) => {
    setCheckedSteps(next);
    try { window.localStorage.setItem(stepsKey, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
  };
  const toggleStep = (i: number) => {
    const next = new Set(checkedSteps);
    if (next.has(i)) next.delete(i); else next.add(i);
    persistSteps(next);
  };
  const allStepsChecked = t.steps.length === 0 || t.steps.every((_, i) => checkedSteps.has(i));
  // Which step failed — required whenever the tester records a Fail.
  const failedStepKey = `qa-failed-step:${t.id}`;
  const [failedStep, setFailedStep] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try { return window.localStorage.getItem(failedStepKey) ?? ""; } catch { return ""; }
  });
  const persistFailedStep = (v: string) => {
    setFailedStep(v);
    try {
      if (v) window.localStorage.setItem(failedStepKey, v);
      else window.localStorage.removeItem(failedStepKey);
    } catch { /* ignore */ }
  };
  const handleStatusChange = async (s: TestStatus) => {
    if (s === "pass" && !allStepsChecked) {
      const missing = t.steps.length - checkedSteps.size;
      await confirm({
        title: `Steps not complete for ${t.id}`,
        description:
          `${missing} step(s) remain unchecked. A passing result should only be recorded once every step has been executed.\n\n` +
          `Pass is blocked until every step is checked.`,
        confirmLabel: "OK",
        cancelLabel: "Back",
      });
      return;
    }
    onChange(s);
  };
  return (
    <Card className={`p-4 ${shade} ${selected ? "ring-2 ring-primary/60" : ""}`}>
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelectChange}
          className="h-4 w-4 mt-0.5"
          title="Select for bulk edit"
        />
        <span className="text-[11px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{t.id}</span>
        <span className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 ${priorityVariant(t.priority)}`} title={PRIORITY_LABELS[t.priority]}>{PRIORITY_SHORT[t.priority]}</span>
        <Badge variant="secondary" className="text-[11px]">{t.area}</Badge>
        <label className="inline-flex items-center gap-1 text-[11px] rounded-full border border-border px-2 py-0.5 bg-background">
          <span className="font-semibold">Sprint:</span>
          <select
            className="bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer"
            value={sprintId}
            onChange={(e) => onSprintChange(e.target.value)}
            title="Re-assign sprint"
          >
            {SPRINTS.map((s) => (
              <option key={s.id} value={s.id}>S{s.number}</option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1 text-[11px] rounded-full border border-primary/40 text-primary px-2 py-0.5 bg-background">
          <span className="font-semibold">Owner:</span>
          <select
            className="bg-transparent text-[11px] font-semibold text-primary focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-90"
            value={assignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            disabled={assigneeLocked}
            title={assigneeLocked ? "Owned by the automated test runner" : "Re-assign this test"}
          >
            {(assigneeLocked ? [assignee] : assigneeOptions).map((o: string) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <Badge variant="outline" className="text-[11px] border-emerald-500/40 text-emerald-700 bg-emerald-500/5">+{getTestCreditReward(t)} cr</Badge>
        <h3 className="flex-1 font-semibold text-sm md:text-base">
          <TestTitleLink test={t}>{t.title}</TestTitleLink>
        </h3>
        {isAdmin && onEdit && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-primary/60 text-primary hover:bg-primary/10"
            onClick={onEdit}
            title="Edit test description"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit test
          </Button>
        )}
        {isAdmin && assigneeLocked && <RunAutomatedButton t={t} />}
        {onDuplicate && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={onDuplicate}
            title="Duplicate this test for additional coverage"
          >
            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
          </Button>
        )}
        <StatusButtons status={status} onChange={handleStatusChange} />
        {hasChanges && onSave && (
          <Button
            size="sm"
            variant="default"
            className="h-7 px-2 text-xs animate-pulse"
            onClick={onSave}
            title="Save changes for this test"
          >
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
        )}
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
          <ol className="space-y-1 text-muted-foreground">
            {t.steps.map((s, i) => {
              const isChecked = checkedSteps.has(i);
              return (
                <li key={i} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStep(i)}
                    className="h-3.5 w-3.5 mt-0.5 shrink-0 cursor-pointer accent-emerald-600"
                    title="Check when this step is complete"
                  />
                  <span className={isChecked ? "line-through opacity-70" : ""}>
                    <span className="font-mono text-[10px] mr-1 opacity-70">{i + 1}.</span>{s}
                  </span>
                </li>
              );
            })}
          </ol>
          {t.steps.length > 0 && (
            <p className={`mt-1.5 text-[10px] font-semibold ${allStepsChecked ? "text-emerald-700" : "text-amber-700"}`}>
              {checkedSteps.size}/{t.steps.length} steps checked
              {!allStepsChecked && " — required before Pass"}
            </p>
          )}
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
                        s === "severe" ? (active ? "bg-red-950 text-white border-red-950" : "border-red-700/60 text-red-800 hover:bg-red-950/10") :
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
              {showQaNote && (
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="text-[10px] font-semibold text-destructive shrink-0">
                    Which step failed?
                  </label>
                  <select
                    value={failedStep}
                    onChange={(e) => persistFailedStep(e.target.value)}
                    className="text-[11px] rounded-md border border-destructive/40 bg-destructive/5 px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-destructive/30"
                  >
                    <option value="">Select step…</option>
                    {t.steps.map((_, i) => (
                      <option key={i} value={String(i + 1)}>Step {i + 1}</option>
                    ))}
                  </select>
                  {!failedStep && (
                    <span className="text-[10px] text-destructive">Required — indicate the step that failed.</span>
                  )}
                </div>
              )}
              <textarea
                value={qaNote}
                onChange={(e) => onQaNoteChange(e.target.value)}
                placeholder="Describe what went wrong at the selected step — browser/device, what you saw vs. expected, screenshot link…"
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
  const confirm = useConfirm();
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
    if (!(await confirm({
      title: "Delete file?",
      description: `Delete ${f.name}?`,
      confirmLabel: "Delete",
      destructive: true,
    }))) return;
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
  const { user } = useApp();
  const isQA = user?.role === "qa";

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

  if (isQA) {
    return (
      <div className="flex flex-wrap gap-1">
        {btn("pass",    "Pass",         CheckCircle2, "bg-emerald-500/15 border-emerald-500/50 text-emerald-700")}
        {btn("fail",    "Fail",         XCircle,      "bg-destructive/15 border-destructive/50 text-destructive")}
        {btn("blocked", "In progress",  AlertOctagon, "bg-amber-500/15 border-amber-500/50 text-amber-700")}
        {btn("not_run", "Not started",  MinusCircle,  "bg-muted border-border text-foreground")}
      </div>
    );
  }

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

/* ============================ SAVE CHANGES DIALOG ========================== */
type PendingChange = {
  key: string;
  testId: string;
  field: "status" | "qaNote" | "devNote" | "severity" | "assignee" | "sprint";
  label: string;
  before: string;
  after: string;
};

function SaveChangesDialog({
  open, onOpenChange, changes, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  changes: PendingChange[];
  onConfirm: (selectedKeys: Set<string>) => void;
}) {
  // Default: every pending change is selected. Users can deselect any row.
  const [picked, setPicked] = useState<Set<string>>(() => new Set(changes.map((c) => c.key)));

  // Reset selection whenever the dialog opens with a new change set.
  useEffect(() => {
    if (open) setPicked(new Set(changes.map((c) => c.key)));
  }, [open, changes]);

  const toggle = (k: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });

  // Group changes by test id for a tidy diff view
  const grouped = useMemo(() => {
    const g: Record<string, PendingChange[]> = {};
    for (const c of changes) (g[c.testId] ||= []).push(c);
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
          <DialogDescription>
            {changes.length} pending change{changes.length === 1 ? "" : "s"} across {grouped.length} test
            {grouped.length === 1 ? "" : "s"}. Uncheck any row you don't want to save — only the checked
            changes will be written. Unchecked changes stay in your draft.
          </DialogDescription>
        </DialogHeader>

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
          {grouped.map(([testId, list]) => (
            <div key={testId} className="rounded-md border border-border">
              <div className="px-3 py-1.5 bg-muted/50 text-xs font-mono font-bold border-b border-border">
                {testId}
              </div>
              <ul className="divide-y divide-border">
                {list.map((c) => {
                  const checked = picked.has(c.key);
                  return (
                    <li key={c.key} className="px-3 py-2 flex items-start gap-3 text-xs">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(c.key)}
                        className="h-4 w-4 mt-0.5"
                      />
                      <div className="w-20 shrink-0 font-semibold text-foreground">{c.label}</div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="rounded border border-border bg-muted/30 px-2 py-1">
                          <div className="text-[10px] uppercase text-muted-foreground mb-0.5">Before</div>
                          <div className="whitespace-pre-wrap break-words text-muted-foreground">{c.before}</div>
                        </div>
                        <div className="rounded border border-primary/30 bg-primary/5 px-2 py-1">
                          <div className="text-[10px] uppercase text-primary mb-0.5">After</div>
                          <div className="whitespace-pre-wrap break-words text-foreground">{c.after}</div>
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

/* ========================= EDIT DESCRIPTION DIALOG ========================= */
function EditDescriptionDialog({
  test, open, onOpenChange, onSaved,
}: {
  test: TestCase | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [preconditions, setPreconditions] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [expected, setExpected] = useState("");
  const [notes, setNotes] = useState("");
  const [initial, setInitial] = useState({ title: "", preconditions: "", stepsText: "", expected: "", notes: "" });
  const confirm = useConfirm();

  useEffect(() => {
    if (open && test) {
      const init = {
        title: test.title,
        preconditions: test.preconditions ?? "",
        stepsText: (test.steps ?? []).join("\n"),
        expected: test.expected,
        notes: test.notes ?? "",
      };
      setTitle(init.title);
      setPreconditions(init.preconditions);
      setStepsText(init.stepsText);
      setExpected(init.expected);
      setNotes(init.notes);
      setInitial(init);
    }
  }, [open, test]);

  if (!test) return null;

  const isDirty =
    title !== initial.title ||
    preconditions !== initial.preconditions ||
    stepsText !== initial.stepsText ||
    expected !== initial.expected ||
    notes !== initial.notes;

  const onSave = () => {
    const ov: TestDescriptionOverride = {
      title,
      preconditions,
      steps: stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
      expected,
      notes,
    };
    saveDescriptionOverride(test.id, ov);
    toast.success("Test description saved.");
    onSaved();
  };

  const onResetToDefault = async () => {
    if (!(await confirm({
      title: "Restore defaults?",
      description: "Clear all admin edits for this test and restore defaults?",
      confirmLabel: "Restore",
      destructive: true,
    }))) return;
    clearDescriptionOverride(test.id);
    toast.success("Restored default description.");
    onSaved();
  };

  const hasOverride = Object.keys(loadDescriptionOverride(test.id)).length > 0;

  const handleOpenChange = async (v: boolean) => {
    if (!v && isDirty) {
      if (!(await confirm({
        title: "Discard changes?",
        description: "You have unsaved changes. Discard them?",
        confirmLabel: "Discard",
        destructive: true,
      }))) return;
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit test description · <span className="font-mono text-sm">{test.id}</span>
            {isDirty && (
              <span className="text-[10px] font-semibold rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700 px-2 py-0.5">
                Unsaved changes
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Admin-only. Edits are saved locally and override the static test plan for everyone using this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 text-sm">
          <div>
            <label className="text-xs font-semibold">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold">Preconditions</label>
            <textarea
              value={preconditions}
              onChange={(e) => setPreconditions(e.target.value)}
              rows={2}
              className="w-full text-sm rounded-md border border-input bg-background px-2 py-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Steps (one per line)</label>
            <textarea
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              rows={6}
              className="w-full text-sm rounded-md border border-input bg-background px-2 py-1 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Expected result</label>
            <textarea
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              rows={3}
              className="w-full text-sm rounded-md border border-input bg-background px-2 py-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full text-sm rounded-md border border-input bg-background px-2 py-1"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-border pt-3 flex-wrap gap-2">
          {hasOverride && (
            <Button variant="outline" onClick={onResetToDefault} className="mr-auto">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset to default
            </Button>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button
            onClick={onSave}
            disabled={!isDirty}
            className={isDirty ? "ring-2 ring-primary/40 animate-pulse" : ""}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isDirty ? "Save changes" : "No changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================= TASKS TAB =============================== */
function TasksTab() {
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "in_progress" | "todo" | "blocked">("all");
  const filtered = TASKS.filter((t) => statusFilter === "all" || t.status === statusFilter);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {(["all", "todo", "in_progress", "done", "blocked"] as const).map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize">
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
        <Link to="/tasks" className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
          <ListChecks className="h-3.5 w-3.5" />
          Open Task Sheet →
        </Link>
      </div>
      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-3 text-sm">
              <StatusPill status={t.status} />
              <span className="text-[10px] font-mono text-muted-foreground w-14">{t.id}</span>
              <span className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 ${priorityVariant(t.priority)}`} title={PRIORITY_LABELS[t.priority]}>{PRIORITY_SHORT[t.priority]}</span>
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
/* ============================== NEW TEST DIALOG ============================== */
function NewTestDialog({
  open, onOpenChange, existingIds, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingIds: string[];
  onCreated: (row: CustomTestRow) => void;
}) {
  const [area, setArea] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("P2");
  const [preconditions, setPreconditions] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [expected, setExpected] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setArea(""); setTitle(""); setPriority("P2");
    setPreconditions(""); setStepsText(""); setExpected(""); setNotes("");
  };

  const submit = async () => {
    if (!title.trim() || !expected.trim()) {
      toast.error("Title and expected result are required");
      return;
    }
    const steps = stepsText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (steps.length === 0) {
      toast.error("Add at least one step");
      return;
    }
    setSaving(true);
    try {
      const row = await createCustomTest(
        { area, title, priority, preconditions, steps, expected, notes },
        existingIds,
      );
      onCreated(row);
      reset();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to create test");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New test case</DialogTitle>
          <DialogDescription>
            New tests start as <b>Unassigned</b> until an admin assigns an owner and sprint.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Area</Label>
              <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Auth, Intake, Voice…" />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="P0">P0 — Severe</SelectItem>
                  <SelectItem value="P1">P1 — High</SelectItem>
                  <SelectItem value="P2">P2 — Medium</SelectItem>
                  <SelectItem value="P3">P3 — Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is being tested?" />
          </div>
          <div className="space-y-1">
            <Label>Preconditions</Label>
            <Textarea rows={2} value={preconditions} onChange={(e) => setPreconditions(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Steps * (one per line)</Label>
            <Textarea rows={4} value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder={"Open /auth\nClick Sign in\n…"} />
          </div>
          <div className="space-y-1">
            <Label>Expected result *</Label>
            <Textarea rows={2} value={expected} onChange={(e) => setExpected(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create test"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
