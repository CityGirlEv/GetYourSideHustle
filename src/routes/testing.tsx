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
  Wrench, RefreshCw, Paperclip, Upload, Trash2, FileText, Loader2, Save, Pencil, ChevronRight, ChevronDown, Copy, Play, Hourglass,
} from "lucide-react";
import {
  TEST_CASES, IMPLEMENTATION_PLAN, SPRINTS, TASKS,
  loadAllStatuses, saveStatus,
  type TestStatus, type TestCase, type Priority,
  PRIORITY_LABELS, PRIORITY_SHORT,
  getTestAssignee, getTestSprintId, ACTIVE_SPRINT_ID, BACKLOG_SPRINT_ID,
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
import { hydrateTestResultsToLocal, cloudPushCheckedSteps, cloudFetchCheckedSteps } from "@/lib/cloud-sync";
import { supabase } from "@/integrations/supabase/client";
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
import { getQaVisibleOwners, getQaFirstName } from "@/lib/role-scoping";
import { computeTestOwners } from "@/lib/test-owners";
import {
  listTestEvidence, uploadTestEvidence, deleteTestEvidence, getTestEvidenceUrl,
  EVIDENCE_ACCEPT_ATTR, type EvidenceFile,
} from "@/lib/test-evidence";
import { validateFailDetails, formatFailNote } from "@/lib/fail-details";
import { toast } from "sonner";
import { MultiSelect, multiSelectMatches } from "@/components/ui/multi-select";
import { useConfirm } from "@/components/ConfirmDialog";
import { buildCloudOps, type DraftValues } from "@/lib/save-batch";
import { canSaveTestResults, getTestResultSaveBlockReason } from "@/lib/qa-save-permissions";

// Derive a link target for a test case: explicit `path` wins, otherwise scan
// preconditions + steps for the first "/route" token (e.g. "Open /advisor").
function deriveTestPath(t: TestCase): string | null {
  if (t.path) return t.path;
  const haystack = [t.preconditions ?? "", ...t.steps].join(" ");
  const m = haystack.match(/(?:^|\s)(\/[a-zA-Z0-9._\-/$:]+)/);
  return m ? m[1] : null;
}

/**
 * Open a test target. Desktop & phones get a separate popup window so the
 * Testing Portal stays visible alongside the app under test. iPads can't
 * meaningfully manage multiple browser windows, so they open in a new tab.
 */
function isIpad(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad/.test(ua)) return true;
  // iPadOS 13+ reports as MacIntel with touch support
  return navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1;
}

function openTestTarget(path: string) {
  if (typeof window === "undefined") return;
  if (isIpad()) {
    window.open(path, "_blank", "noopener");
    return;
  }
  const w = Math.min(1100, Math.round(window.screen.availWidth * 0.8));
  const h = Math.min(900, Math.round(window.screen.availHeight * 0.85));
  const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
  const features = `popup=yes,width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,noopener`;
  const win = window.open(path, "test-target", features);
  // Some mobile browsers ignore popup features and fall back to a new tab — that's acceptable.
  if (!win) {
    // Popup blocked — fall back to a new tab so the tester still gets there.
    window.open(path, "_blank", "noopener");
  }
}

function TestTargetLink({ test }: { test: TestCase }) {
  const path = deriveTestPath(test);
  if (!path) return null;
  const isExternal = /^https?:\/\//.test(path);
  const label = path.length > 28 ? path.slice(0, 27) + "…" : path;
  const className =
    "inline-flex items-center gap-1 text-[11px] font-mono rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-primary hover:bg-primary/10 transition-colors";
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openTestTarget(path);
  };
  if (isExternal) {
    return (
      <a href={path} target="_blank" rel="noreferrer" onClick={onClick} className={className} title={`Open ${path}`}>
        <ExternalLink className="h-3 w-3" />
        {label}
      </a>
    );
  }
  return (
    <a href={path} target="_blank" rel="noreferrer" onClick={onClick} className={className} title={`Open ${path}`}>
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  );
}

function TestTitleLink({ test, children }: { test: TestCase; children: React.ReactNode }) {
  const path = deriveTestPath(test);
  if (!path) return <>{children}</>;
  const isExternal = /^https?:\/\//.test(path);
  const className = "hover:underline hover:text-primary transition-colors";
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openTestTarget(path);
  };
  return (
    <a href={path} target="_blank" rel="noreferrer" onClick={onClick} className={className} title={`Open ${path}`}>
      {children}
    </a>
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
  const canSaveToCloud = canSaveTestResults(user);
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
  // Live sync — when any user changes a test_results row (status, notes,
  // assignee...), re-hydrate so every other open Testing tab updates
  // without a manual refresh. Without this, a tester who already loaded
  // the page keeps seeing the old value (e.g. "fail") even after another
  // tester flips it to "in progress".
  useEffect(() => {
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(async () => {
        try {
          await hydrateTestResultsToLocal();
          if (cancelled) return;
          setSavedStatuses(loadAllStatuses());
          setSavedQaNotes(loadAllQaNotes());
          setSavedDevNotes(loadAllDevNotes());
          setSavedSeverities(loadAllSeverities());
          setSavedAssignees(loadAllAssigneeOverrides());
          setSavedSprints(loadAllSprintOverrides());
        } catch (e) {
          console.warn("[testing] realtime refresh failed", e);
        }
      }, 250);
    };
    const channel = supabase
      .channel("test_results-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_results" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
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
  // When set, the SaveChangesDialog is scoped to a single test id (clicked
  // from the per-row "Save" button). null = bulk Save bar, shows all.
  const [saveScopeId, setSaveScopeId] = useState<string | null>(null);
  // Live save progress for the floating progress bar. null = no save in flight.
  const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null);
  // Indeterminate "busy" indicator shown while the user is waiting on
  // something that doesn't have a discrete progress count (e.g. preparing
  // the confirmation dialog or checking evidence before the bulk write).
  const [saveBusy, setSaveBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [sprintFilter, setSprintFilter] = useState<string[]>([]);
  const [passRateExpanded, setPassRateExpanded] = useState(() => user?.role === "qa");
  // Full assignee roster (TEST_OWNERS + every enabled QA user). Admins see
  // a bubble for each one even if they have no tests currently assigned.
  const allAssignees = useAssigneeOptions();
  // For QA users, role scoping below already limits data to themselves plus
  // Unassigned. Keep the owner filter open so Unassigned stays visible.
  const ownerFilterInitialized = useRef(false);
  useEffect(() => {
    if (ownerFilterInitialized.current) return;
    if (!user) return;
    ownerFilterInitialized.current = true;
    if (user.role === "qa") setOwnerFilter([]);
  }, [user]);
  // QA users are scoped to their own data only — they cannot widen the
  // owner filter, see other QAs' progress, or pick assignees for others.
  const restrictToSelf = !!user && user.role === "qa";

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
    // "Before" should reflect what the user currently sees on the row — i.e.
    // the effective saved value (test-case default + any previously saved
    // override), NOT just the raw override map (which is "" for rows the user
    // has never touched). Without this, the confirm dialog shows "—" for
    // owner/sprint even when the row visibly reads "Catria" / "Sprint 3".
    const savedAssigneeFor = (id: string): string => {
      const t = effectiveById.get(id);
      if (!t) return savedAssignees[id] ?? "";
      const platformSuffix = TEST_PLATFORMS.find((p) => id.endsWith(`-${p.suffix}`))?.suffix;
      const sourceId = platformSuffix ? id.slice(0, -platformSuffix.length - 1) : id;
      const ov = savedAssignees[id] || savedAssignees[sourceId];
      let raw: string;
      if (customIds.has(id)) {
        raw = ov || t.assignee || "Unassigned";
      } else if (AUTOMATED_TEST_IDS.has(id)) {
        raw = t.assignee || "Unassigned";
      } else if (t.assignee) {
        raw = ov || t.assignee;
      } else {
        raw = ov || getTestAssignee(t, savedStatuses[id]);
      }
      if (raw === "Me") return "Evelyn";
      if (raw === "Design" || raw === "Dev") return "Eng";
      return raw;
    };
    const savedSprintFor = (id: string): string => {
      const ov = savedSprints[id];
      if (ov) return ov;
      const t = effectiveById.get(id);
      if (!t) return "";
      if (customIds.has(id)) return t.sprintId || "";
      return getTestSprintId(t);
    };
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
        before: fmt(savedAssigneeFor(id)), after: fmt(v) });
    for (const [id, v] of Object.entries(dSprints))
      list.push({ key: `${id}:sprint`, testId: id, field: "sprint", label: "Sprint",
        before: fmt(savedSprintFor(id)), after: fmt(v) });
    return list.sort((a, b) => a.testId.localeCompare(b.testId));
  }, [dStatuses, dQaNotes, dDevNotes, dSeverities, dAssignees, dSprints,
      savedStatuses, savedQaNotes, savedDevNotes, savedSeverities, savedAssignees, savedSprints,
      effectiveById, customIds]);

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
    const blockReason = getTestResultSaveBlockReason(user);
    if (blockReason) {
      toast.error("Cannot save test result", { description: blockReason });
      return;
    }
    const keys = pendingChanges.filter((c) => c.testId === id);
    if (keys.length === 0) return;
    // Always route through the confirmation popup so the user can review
    // before/after and uncheck anything they don't want saved.
    setSaveScopeId(id);
    setSaveBusy("Preparing review…");
    // Defer dialog open so the hourglass paints before the (heavier) dialog mount.
    requestAnimationFrame(() => setSaveOpen(true));
  };

  // Persist a subset of pending changes; remaining ones stay in draft.
  const commitChanges = async (selectedKeys: Set<string>) => {
    const blockReason = getTestResultSaveBlockReason(user);
    if (blockReason) {
      toast.error("Cannot save test result", { description: blockReason });
      return;
    }
    setSaveBusy("Checking evidence…");
    // ----- Mandatory-evidence gate ------------------------------------------
    // Any status flip to "fail" / "failed_retest" requires at least one
    // attached screenshot/log. Block those rows up-front so QA can't claim a
    // bug without proof. Other field changes for the same test still go
    // through.
    if (user) {
      const failIds = pendingChanges
        .filter((c) => selectedKeys.has(c.key) && c.field === "status")
        .map((c) => ({ key: c.key, id: c.testId, v: dStatuses[c.testId] }))
        .filter((x) => x.v === "fail" || x.v === "failed_retest");
      if (failIds.length > 0) {
        const counts = await Promise.all(
          failIds.map((x) => listTestEvidence(user.id, x.id).then((l) => l.length).catch(() => 0)),
        );
        const missing = failIds.filter((_, i) => counts[i] === 0);
        if (missing.length > 0) {
          for (const m of missing) selectedKeys.delete(m.key);
          toast.error(
            missing.length === 1
              ? `Attach a screenshot before failing ${missing[0].id}.`
              : `Attach a screenshot before failing: ${missing.map((m) => m.id).join(", ")}.`,
          );
          if (selectedKeys.size === 0) { setSaveOpen(false); setSaveBusy(null); return; }
        }
      }
    }
    setSaveBusy("Writing locally…");
    const stillDraft = {
      status: { ...dStatuses }, qaNote: { ...dQaNotes }, devNote: { ...dDevNotes },
      severity: { ...dSeverities }, assignee: { ...dAssignees }, sprint: { ...dSprints },
    };
    const newSaved = {
      status: { ...savedStatuses }, qaNote: { ...savedQaNotes }, devNote: { ...savedDevNotes },
      severity: { ...savedSeverities }, assignee: { ...savedAssignees }, sprint: { ...savedSprints },
    };
    // ----- Local writes (synchronous, no implicit cloud push) ---------------
    // We pass syncCloud:false so the test-plan helpers DON'T each fire their
    // own cloudPushTest. We then coalesce everything into one merged push per
    // test id and run those through a concurrency-limited pool below.
    for (const c of pendingChanges) {
      if (!selectedKeys.has(c.key)) continue;
      const id = c.testId;
      switch (c.field) {
        case "status":   { const v = dStatuses[id]!;   saveStatus(id, v, { syncCloud: false });           newSaved.status[id]   = v; delete stillDraft.status[id];   break; }
        case "qaNote":   { const v = dQaNotes[id]!;    saveQaNote(id, v, { syncCloud: false });           newSaved.qaNote[id]   = v; delete stillDraft.qaNote[id];   break; }
        case "devNote":  { const v = dDevNotes[id]!;   saveDevNote(id, v, { syncCloud: false });          newSaved.devNote[id]  = v; delete stillDraft.devNote[id];  break; }
        case "severity": { const v = dSeverities[id]!; saveSeverity(id, v, { syncCloud: false });         newSaved.severity[id] = v; delete stillDraft.severity[id]; break; }
        case "assignee": { const v = dAssignees[id]!;  saveAssigneeOverride(id, v, { syncCloud: false }); newSaved.assignee[id] = v; delete stillDraft.assignee[id]; break; }
        case "sprint":   { const v = dSprints[id]!;    saveSprintOverride(id, v, { syncCloud: false });   newSaved.sprint[id]   = v; delete stillDraft.sprint[id];   break; }
      }
    }
    setSavedStatuses(newSaved.status); setSavedQaNotes(newSaved.qaNote); setSavedDevNotes(newSaved.devNote);
    setSavedSeverities(newSaved.severity); setSavedAssignees(newSaved.assignee); setSavedSprints(newSaved.sprint);
    setDStatuses(stillDraft.status); setDQaNotes(stillDraft.qaNote); setDDevNotes(stillDraft.devNote);
    setDSeverities(stillDraft.severity); setDAssignees(stillDraft.assignee); setDSprints(stillDraft.sprint);
    setSaveOpen(false);
    setSaveScopeId(null);

    // ----- Coalesced cloud writes with progress bar -------------------------
    const draftSnapshot: DraftValues = {
      status: dStatuses, qaNote: dQaNotes, devNote: dDevNotes,
      severity: dSeverities, assignee: dAssignees, sprint: dSprints,
    };
    const ops = buildCloudOps(
      pendingChanges.map((c) => ({ key: c.key, testId: c.testId, field: c.field })),
      selectedKeys,
      draftSnapshot,
    );
    if (ops.length === 0) { setSaveBusy(null); return; }
    const selectedCount = selectedKeys.size;
    setSaveBusy(null);
    const { cloudPushTestsBulk, cloudAppendNotesBulk } = await import("@/lib/cloud-sync");
    // Collapse N round-trips into at most 2: one bulk upsert for field
    // patches, one merged SELECT+UPSERT for notes.
    const pushPatches = ops
      .filter((o) => o.kind === "push")
      .map((o) => ({
        test_id: o.testId,
        patch: (o.patch ?? {}) as Parameters<typeof cloudPushTestsBulk>[0][number]["patch"],
      }));
    const noteEntries = ops
      .filter((o) => o.kind === "note")
      .map((o) => ({ test_id: o.testId, kind: o.note!.kind, text: o.note!.text }));
    const totalBatches = (pushPatches.length ? 1 : 0) + (noteEntries.length ? 1 : 0);
    setSaveProgress({ done: 0, total: totalBatches });
    let okBatches = 0;
    let failCount = 0;
    if (pushPatches.length) {
      const n = await cloudPushTestsBulk(pushPatches);
      if (n > 0) okBatches++; else failCount += pushPatches.length;
      setSaveProgress({ done: okBatches, total: totalBatches });
    }
    if (noteEntries.length) {
      const n = await cloudAppendNotesBulk(noteEntries);
      if (n > 0) okBatches++; else failCount += noteEntries.length;
      setSaveProgress({ done: okBatches, total: totalBatches });
    }
    setSaveProgress(null);
    if (failCount === 0) {
      toast.success(`Saved ${selectedCount} change${selectedCount === 1 ? "" : "s"} to cloud.`);
    } else {
      toast.error(`Saved locally, but ${failCount} of ${ops.length} cloud write${ops.length === 1 ? "" : "s"} failed — see console.`);
    }
    // Return focus / scroll to the test that was just saved (single-test scope)
    if (saveScopeId) {
      requestAnimationFrame(() => {
        const el = document.getElementById(`test-row-${saveScopeId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus({ preventScroll: true });
        }
      });
    }
  };

  const areas = useMemo(
    () =>
      Array.from(new Set(effectiveCases.map((t) => t.area))).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [effectiveCases],
  );
  // Effective assignee/sprint that respects unsaved drafts (the lib helpers read storage)
  const effAssignee = (t: TestCase): string => {
    const platformSuffix = TEST_PLATFORMS.find((p) => t.id.endsWith(`-${p.suffix}`))?.suffix;
    const sourceId = platformSuffix ? t.id.slice(0, -platformSuffix.length - 1) : t.id;
    const ov = assigneeOverrides[t.id] || assigneeOverrides[sourceId];
    let raw: string;
    if (customIds.has(t.id)) {
      raw = ov || t.assignee || "Unassigned";
    } else if (AUTOMATED_TEST_IDS.has(t.id)) {
      // Automated tests stay owned by their runner — they're not human-
      // assignable, so the fail-→Dev rule in getTestAssignee doesn't apply.
      raw = t.assignee || "Unassigned";
    } else if (t.assignee) {
      // Tests can have multiple owners. When a test fails the QA owner is
      // retained (see effOwners) and Eng is added as a co-owner — we no
      // longer overwrite the primary QA owner on fail.
      raw = ov || t.assignee;
    } else {
      raw = ov || getTestAssignee(t, statuses[t.id]);
    }
    if (raw === "Me") return "Evelyn";
    if (raw === "Design" || raw === "Dev") return "Eng";
    return raw;
  };
  // A test's full owner set. Failing/failed-retest tests are co-owned by the
  // original QA AND Eng so they show up in both owners' bubbles, filters,
  // and scoped views.
  const effOwners = (t: TestCase): string[] => {
    return computeTestOwners({
      primary: effAssignee(t),
      status: statuses[t.id],
      isAutomated: AUTOMATED_TEST_IDS.has(t.id),
    });
  };
  const qaVisibleOwners = useMemo(() => getQaVisibleOwners(user), [user]);
  // Original assignee BEFORE the fail-→Dev reroute. QA scoping uses this so
  // a QA still sees their own tests even after they mark them failed (the
  // displayed owner becomes "Eng", but the test stays in their list).
  const ownerForQaScope = (t: TestCase): string => {
    const platformSuffix = TEST_PLATFORMS.find((p) => t.id.endsWith(`-${p.suffix}`))?.suffix;
    const sourceId = platformSuffix ? t.id.slice(0, -platformSuffix.length - 1) : t.id;
    const ov = assigneeOverrides[t.id] || assigneeOverrides[sourceId];
    let raw: string;
    if (customIds.has(t.id)) raw = ov || t.assignee || "Unassigned";
    else if (AUTOMATED_TEST_IDS.has(t.id)) raw = t.assignee || "Unassigned";
    else if (t.assignee) raw = ov || t.assignee;
    else raw = ov || getTestAssignee(t, "not_run");
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
  // For QA: pre-scope the dataset so all counts, charts, and per-owner
  // breakdowns only ever reflect their own tests. Admins see everything.
  const scopedCases = useMemo(
    () => restrictToSelf
      ? effectiveCases.filter((t) =>
          effOwners(t).some((o) => qaVisibleOwners.includes(o)) ||
          qaVisibleOwners.includes(ownerForQaScope(t)),
        )
      : effectiveCases,
    [effectiveCases, restrictToSelf, qaVisibleOwners, statuses, assigneeOverrides, customIds],
  );
  const ownerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // For admins, seed every known QA assignee (incl. those without any test
    // currently assigned) so their bubble + per-owner row still render with 0.
    if (isAdmin) {
      for (const o of allAssignees) {
        if (o) counts[o] = 0;
      }
    }
    // Always surface an Unassigned bubble so users can spot newly created
    // tests that have not been routed to an owner yet.
    counts["Unassigned"] = counts["Unassigned"] ?? 0;
    for (const t of scopedCases) {
      for (const a of effOwners(t)) {
        counts[a] = (counts[a] || 0) + 1;
      }
    }
    return counts;
  }, [statuses, assigneeOverrides, scopedCases, isAdmin, allAssignees]);
  const owners = useMemo(() => Object.keys(ownerCounts), [ownerCounts]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return scopedCases.filter((t) => {
      if (!multiSelectMatches(areaFilter, t.area)) return false;
      if (!multiSelectMatches(statusFilter, statuses[t.id] ?? "not_run")) return false;
      if (ownerFilter.length > 0 && !effOwners(t).some((o) => multiSelectMatches(ownerFilter, o))) return false;
      if (!multiSelectMatches(sprintFilter, effSprint(t))) return false;
      if (!q) return true;
      return [t.id, t.title, t.area, ...t.steps, t.expected].some((f) => f.toLowerCase().includes(q));
    });
  }, [query, areaFilter, statusFilter, ownerFilter, sprintFilter, statuses, assigneeOverrides, sprintOverrides, scopedCases]);

  // Auto-expand sprint sections when filters are active so filtered results remain visible.
  // When filters are active (or whenever the visible result set changes, e.g.
  // after a realtime update from another user), expand ONLY the sprints that
  // contain matching tests and collapse every other sprint. When all filters
  // are cleared, restore the default (only the active sprint expanded).
  const filterSig = JSON.stringify([query, areaFilter, statusFilter, ownerFilter, sprintFilter]);
  const matchedSprintIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of filtered) {
      const ov = sprintOverrides[t.id];
      const sid = ov
        ? ov
        : customIds.has(t.id)
        ? (t.sprintId || "")
        : getTestSprintId(t);
      ids.add(sid || "_none");
    }
    return ids;
  }, [filtered, sprintOverrides, customIds]);
  const matchedSprintsKey = useMemo(
    () => Array.from(matchedSprintIds).sort().join("|"),
    [matchedSprintIds],
  );
  useEffect(() => {
    const hasFilters =
      query.trim() !== "" ||
      areaFilter.length > 0 ||
      statusFilter.length > 0 ||
      ownerFilter.length > 0 ||
      sprintFilter.length > 0;
    if (!hasFilters) {
      // Filters cleared → reset to default: collapse every sprint except the active one.
      setCollapsedSprints(new Set(SPRINTS.filter((s) => s.id !== ACTIVE_SPRINT_ID).map((s) => s.id)));
      return;
    }
    // Filters active → collapse every sprint that has no matches, expand the rest.
    const next = new Set<string>();
    for (const s of SPRINTS) {
      if (!matchedSprintIds.has(s.id)) next.add(s.id);
    }
    setCollapsedSprints(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSig, matchedSprintsKey]);

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
      total: scopedCases.length,
      pass: 0, fail: 0, blocked: 0, not_run: 0, in_progress: 0,
      fixed_retest: 0, failed_retest: 0,
    };
    for (const t of scopedCases) c[statuses[t.id] ?? "not_run"]++;
    return c;
  }, [statuses, scopedCases]);
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
    in_progress: "In progress",
    not_run: "Not run",
  };
  const overallFocusCount = counts[focusStatus];
  const overallFocusPct = counts.total
    ? Math.round((overallFocusCount / counts.total) * 100)
    : 0;

  // Per-QA-person status breakdown. Only owners with at least one test appear.
  const ownerStatusCounts = useMemo(() => {
    const out: Record<string, Record<TestStatus | "total", number>> = {};
    if (isAdmin) {
      for (const o of allAssignees) {
        if (o && o !== "Unassigned") out[o] = { total: 0, pass: 0, fail: 0, blocked: 0, not_run: 0, in_progress: 0, fixed_retest: 0, failed_retest: 0 };
      }
    }
    for (const t of scopedCases) {
      const s = (statuses[t.id] ?? "not_run") as TestStatus;
      for (const owner of effOwners(t)) {
        if (!out[owner]) out[owner] = { total: 0, pass: 0, fail: 0, blocked: 0, not_run: 0, in_progress: 0, fixed_retest: 0, failed_retest: 0 };
        out[owner].total++;
        out[owner][s]++;
      }
    }
    return out;
  }, [statuses, assigneeOverrides, scopedCases, isAdmin, allAssignees]);

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
                const oc = ownerStatusCounts[owner];
                const done = oc ? (oc.pass + oc.fail + oc.fixed_retest + oc.failed_retest + oc.blocked) : 0;
                const total = oc?.total ?? n;
                const pct = total ? Math.round((done / total) * 100) : 0;
                return (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => setOwnerFilter(active ? [] : [owner])}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold bg-background cursor-pointer hover:bg-accent transition-colors ${active ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                  >
                    {owner}{" "}
                    <span className="font-normal opacity-70">
                      · {done}/{total} · {pct}% · {creditBudgetByOwner()[owner] ?? 0} cr
                    </span>
                  </button>
                );
              })}
            </div>
      </Card>

      {/* Summary / Pass Rate */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {user?.role !== "qa" && (
              <button
                type="button"
                onClick={() => setPassRateExpanded((v) => !v)}
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-accent transition-colors"
                title={passRateExpanded ? "Collapse pass rate" : "Expand pass rate"}
              >
                {passRateExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {focusStatusLabel[focusStatus]} rate
              </div>
              <div className="text-2xl font-bold">{overallFocusPct}%</div>
              <div className="text-[11px] text-muted-foreground">
                {overallFocusCount}/{counts.total}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatBadge n={counts.pass}     label="Pass"    color="bg-emerald-500/10 text-emerald-700 border-emerald-500/30" active={statusFilter.length === 1 && statusFilter[0] === "pass"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "pass" ? [] : ["pass"])} />
            <StatBadge n={counts.fail}     label="Fail"    color="bg-destructive/10 text-destructive border-destructive/30" active={statusFilter.length === 1 && statusFilter[0] === "fail"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "fail" ? [] : ["fail"])} />
            <StatBadge n={counts.fixed_retest}  label="Fixed/Retest"   color="bg-sky-500/10 text-sky-700 border-sky-500/30" active={statusFilter.length === 1 && statusFilter[0] === "fixed_retest"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "fixed_retest" ? [] : ["fixed_retest"])} />
            <StatBadge n={counts.failed_retest} label="Failed/Retest"  color="bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/30" active={statusFilter.length === 1 && statusFilter[0] === "failed_retest"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "failed_retest" ? [] : ["failed_retest"])} />
            <StatBadge n={counts.in_progress} label="In progress" color="bg-amber-500/10 text-amber-700 border-amber-500/30" active={statusFilter.length === 1 && statusFilter[0] === "in_progress"} onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "in_progress" ? [] : ["in_progress"])} />
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
              onClick={() => {
                const blockReason = getTestResultSaveBlockReason(user);
                if (blockReason) {
                  toast.error("Cannot save test result", { description: blockReason });
                  return;
                }
                setSaveBusy("Preparing review…");
                requestAnimationFrame(() => setSaveOpen(true));
              }}
              disabled={pendingCount === 0 || !canSaveToCloud}
              className="relative"
              title={!canSaveToCloud ? getTestResultSaveBlockReason(user) ?? undefined : undefined}
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
        {passRateExpanded && (
          <>
            <Progress value={overallFocusPct} className="h-2" />
            {user?.role === "qa" && (
              (() => {
                const qaName = getQaFirstName(user);
                const c = ownerStatusCounts[qaName];
                if (!c) return null;
                const ownerFocusCount = c[focusStatus];
                const ownerFocusPct = c.total ? Math.round((ownerFocusCount / c.total) * 100) : 0;
                return (
                  <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      Your numbers
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="min-w-[88px] text-left text-xs font-semibold">{qaName}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {ownerFocusCount}/{c.total} · {ownerFocusPct}% {focusStatusLabel[focusStatus]}
                        </span>
                      </div>
                      <Progress value={ownerFocusPct} className="h-1.5" />
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border-emerald-500/30">{c.pass} <span className="font-normal opacity-70">Pass</span></span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-destructive/10 text-destructive border-destructive/30">{c.fail} <span className="font-normal opacity-70">Fail</span></span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-sky-500/10 text-sky-700 border-sky-500/30">{c.fixed_retest} <span className="font-normal opacity-70">Fixed/Retest</span></span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/30">{c.failed_retest} <span className="font-normal opacity-70">Failed/Retest</span></span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-700 border-amber-500/30">{c.in_progress} <span className="font-normal opacity-70">In progress</span></span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-700 border-amber-500/30">{c.blocked} <span className="font-normal opacity-70">Blocked</span></span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-muted text-muted-foreground border-border">{c.not_run} <span className="font-normal opacity-70">Not run</span></span>
                        <span className="text-[11px] text-muted-foreground">· {c.total} total</span>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
            {isAdmin && Object.keys(ownerStatusCounts).length > 0 && (
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
                            {cell(c.in_progress, "In progress", "bg-amber-500/10 text-amber-700 border-amber-500/30", "in_progress")}
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
        )}
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
          searchable searchPlaceholder="Search areas…"
        />
        {isAdmin && (
          <MultiSelect
            placeholder="Owner" triggerClassName="w-[180px]"
            options={owners.map((o) => ({ value: o, label: o }))}
            value={ownerFilter} onChange={setOwnerFilter}
          />
        )}
        <MultiSelect
          placeholder="Sprint" triggerClassName="w-[200px]"
          options={SPRINTS.map((s) => ({
            value: s.id,
            label: s.id === BACKLOG_SPRINT_ID ? "Backlog" : `Sprint ${s.number} · ${s.name}`,
          }))}
          value={sprintFilter} onChange={setSprintFilter}
        />
        <MultiSelect
          placeholder="Status" triggerClassName="w-[180px]"
          options={[
            { value: "not_run", label: "Not run" },
            { value: "in_progress", label: "In progress" },
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
            const label = sprintMeta
              ? sprintMeta.id === BACKLOG_SPRINT_ID
                ? "Backlog"
                : `Sprint ${sprintMeta.number} · ${sprintMeta.name}`
              : "Unassigned";
            const isActive = sprintId === ACTIVE_SPRINT_ID;
            return (
              <Fragment key={sprintId}>
                <Card
                  className="p-4 sm:p-3 bg-muted/60 hover:bg-muted/70 cursor-pointer border-2 select-none touch-manipulation active:scale-[0.98] transition-transform min-h-[48px]"
                  onClick={() => toggleCollapsedSprint(sprintId)}
                  role="button"
                  aria-expanded={!isCollapsed}
                  aria-label={`${label} — ${tests.length} test${tests.length === 1 ? "" : "s"}`}
                >
                  <div className="flex items-center gap-3 font-semibold text-sm">
                    <ChevronRight className={`h-5 w-5 sm:h-4 sm:w-4 transition-transform ${!isCollapsed ? "rotate-90" : ""}`} />
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
                    onAutoStart={() => {
                      // Persist "In progress" immediately (local + cloud) and
                      // promote it into the saved baseline so it survives a
                      // refresh without sitting in the unsaved-changes drawer.
                      saveStatus(t.id, "in_progress");
                      setSavedStatuses((p) => ({ ...p, [t.id]: "in_progress" }));
                      setDStatuses((p) => {
                        if (!(t.id in p)) return p;
                        const next = { ...p };
                        delete next[t.id];
                        return next;
                      });
                    }}
                    onQaNoteChange={(n) => setQaNote(t.id, n)}
                    onDevNoteChange={(n) => setDevNote(t.id, n)}
                    onSeverityChange={(s) => setSeverityFor(t.id, s)}
                    onAssigneeChange={(o) => setAssigneeFor(t.id, o)}
                    onSprintChange={(s) => setSprintFor(t.id, s)}
                    isAdmin={isAdmin}
                    assigneeLocked={AUTOMATED_TEST_IDS.has(t.id)}
                     restrictAssigneeTo={
                        !isAdmin && user?.role === "qa"
                          ? qaVisibleOwners
                         : undefined
                     }
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
        onOpenChange={(v: boolean) => {
          setSaveOpen(v);
          // Dialog is mounted/dismissed — preparing phase is over.
          setSaveBusy(null);
          if (!v && saveScopeId) {
            requestAnimationFrame(() => {
              const el = document.getElementById(`test-row-${saveScopeId}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.focus({ preventScroll: true });
              }
            });
          }
          if (!v) setSaveScopeId(null);
        }}
        changes={saveScopeId ? pendingChanges.filter((c) => c.testId === saveScopeId) : pendingChanges}
        onConfirm={commitChanges}
      />
      <SaveProgressBar progress={saveProgress} busyLabel={saveBusy} />
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
  const bulkAssigneeOptions = isQA ? getQaVisibleOwners(user) : assigneeOptions;
  return (
    <Card className="p-3 bg-background/95 backdrop-blur border-primary/30">
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
          {bulkAssigneeOptions.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => { if (e.target.value) { onSetSprint(e.target.value); e.target.value = ""; } }}
          title="Set sprint for selected"
        >
          <option value="">Set sprint…</option>
          {SPRINTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id === BACKLOG_SPRINT_ID ? "Backlog" : `Sprint ${s.number} · ${s.name}`}
            </option>
          ))}
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
function StepWithSublist({
  step,
  className,
  stepIndex,
  checkedSubsteps,
  onToggleSubstep,
}: {
  step: string;
  className?: string;
  stepIndex?: number;
  checkedSubsteps?: Set<string>;
  onToggleSubstep?: (key: string) => void;
}) {
  const letter = (i: number) => String.fromCharCode(97 + i); // 0 -> 'a'
  const renderSublist = (items: string[]) => (
    <ul className="ml-5 mt-0.5 space-y-0.5 list-none">
      {items.map((item, i) => {
        const key = stepIndex != null ? `${stepIndex}-${i}` : "";
        const checked = key ? !!checkedSubsteps?.has(key) : false;
        const interactive = stepIndex != null && !!onToggleSubstep;
        return (
          <li key={i} className="flex items-start gap-2">
            {interactive && (
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleSubstep!(key)}
                className="h-3.5 w-3.5 mt-0.5 shrink-0 cursor-pointer accent-emerald-600"
                title={`Check when sub-step ${(stepIndex ?? 0) + 1}${letter(i)} is complete`}
              />
            )}
            <span className={checked ? "line-through opacity-70" : ""}>
              <span className="font-mono text-[10px] mr-1 opacity-70">
                {(stepIndex ?? 0) + 1}{letter(i)}.
              </span>
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );

  // "Enter the following for the Scenario Information: birth year..., ZIP3=..., ..." → heading + sublist
  const introMatch = step.match(/^(Enter the following for the Scenario Information:)\s*(.+)$/);
  if (introMatch && introMatch[2].includes("ZIP3=")) {
    const items = introMatch[2].split(", ");
    return (
      <span className={className}>
        {introMatch[1]}
        {renderSublist(items)}
      </span>
    );
  }
  // "Enter the remaining for the Scenario Information: gender..., tobacco..., ..." → heading + sublist
  const remainingMatch = step.match(/^(Enter the remaining for the Scenario Information:)\s*(.+)$/);
  if (remainingMatch) {
    const items = remainingMatch[2].split(", ");
    return (
      <span className={className}>
        {remainingMatch[1]}
        {renderSublist(items)}
      </span>
    );
  }

  // Legacy: "Enter birth year..., ZIP3=..., gender..." → split by comma after the intro
  if (step.startsWith("Enter ") && step.includes(", ZIP3=")) {
    const parts = step.split(", ");
    return (
      <span className={className}>
        {parts[0]},
        {renderSublist(parts.slice(1))}
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
          {renderSublist(items)}
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
  restrictAssigneeTo,
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
  onAutoStart?: () => void;
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
  /** When set, restricts the Owner select to this list of names (used for
   *  non-admin QA users so they can only claim/release tests for themselves). */
  restrictAssigneeTo?: string[];
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
  const isFailStatus = status === "fail" || status === "failed_retest";
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
  // Per-substep execution checkboxes (e.g. "2a", "2b"). Stored as `${stepIdx}-${subIdx}` keys.
  const substepsKey = `qa-substep-checks:${t.id}`;
  const [checkedSubsteps, setCheckedSubsteps] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(substepsKey);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  // Hydrate checked-step state from the cloud so every viewer sees what QA ticked.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await cloudFetchCheckedSteps(t.id);
      if (cancelled) return;
      // If the cloud has nothing saved yet (new column default is empty
      // arrays), DO NOT wipe the tester's existing local checks. Instead
      // push the local state up so other viewers see them.
      const remoteEmpty =
        !remote || (remote.steps.length === 0 && remote.substeps.length === 0);
      if (remoteEmpty) {
        if (checkedSteps.size > 0 || checkedSubsteps.size > 0) {
          void cloudPushCheckedSteps(t.id, {
            steps: Array.from(checkedSteps),
            substeps: Array.from(checkedSubsteps),
          });
        }
        return;
      }
      const steps = new Set<number>(remote.steps);
      const subs = new Set<string>(remote.substeps);
      setCheckedSteps(steps);
      setCheckedSubsteps(subs);
      try {
        window.localStorage.setItem(stepsKey, JSON.stringify(Array.from(steps)));
        window.localStorage.setItem(substepsKey, JSON.stringify(Array.from(subs)));
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.id]);
  const pushChecks = (steps: Set<number>, subs: Set<string>) => {
    void cloudPushCheckedSteps(t.id, { steps: Array.from(steps), substeps: Array.from(subs) });
  };
  const persistSteps = (next: Set<number>) => {
    setCheckedSteps(next);
    try { window.localStorage.setItem(stepsKey, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
    pushChecks(next, checkedSubsteps);
  };
  const toggleStep = (i: number) => {
    const next = new Set(checkedSteps);
    const isChecking = !next.has(i);
    if (isChecking) next.add(i); else next.delete(i);
    // Auto-advance status to "In progress" when the tester checks their
    // first step on a test that hasn't been started yet.
    if (isChecking && (status === "not_run" || !status)) {
      onChange("in_progress");
    }
    persistSteps(next);
  };
  const toggleSubstep = (key: string) => {
    const next = new Set(checkedSubsteps);
    const isChecking = !next.has(key);
    if (isChecking) next.add(key); else next.delete(key);
    if (isChecking && (status === "not_run" || !status)) {
      onChange("in_progress");
    }
    setCheckedSubsteps(next);
    try { window.localStorage.setItem(substepsKey, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
    pushChecks(checkedSteps, next);
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
  // When the tester picks Fail / Failed-Retest we pop a modal that forces
  // a note + which step failed + a screenshot (or an explicit "no
  // screenshot available" acknowledgement). The status flip is only
  // applied after the modal is satisfied.
  const { user: cardUser } = useApp();
  const [pendingFail, setPendingFail] = useState<TestStatus | null>(null);
  const [pendingPass, setPendingPass] = useState(false);
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
    if ((s === "fail" || s === "failed_retest") && s !== status) {
      setPendingFail(s);
      return;
    }
    if (s === "pass" && s !== status) {
      setPendingPass(true);
      return;
    }
    onChange(s);
  };
  return (
    <Card id={`test-row-${t.id}`} tabIndex={-1} className={`p-4 ${shade} ${selected ? "ring-2 ring-primary/60" : ""}`}>
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
              <option key={s.id} value={s.id}>
                {s.id === BACKLOG_SPRINT_ID ? "Backlog" : `S${s.number}`}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1 text-[11px] rounded-full border border-primary/40 text-primary px-2 py-0.5 bg-background">
          <span className="font-semibold">Owner:</span>
          <select
            className="bg-transparent text-[11px] font-semibold text-primary focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-90"
            value={assignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            disabled={assigneeLocked || (restrictAssigneeTo && restrictAssigneeTo.length <= 1)}
            title={assigneeLocked ? "Owned by the automated test runner" : restrictAssigneeTo ? "QA users can only claim tests for themselves or release them as Unassigned" : "Re-assign this test"}
          >
            {(() => {
              const base = assigneeLocked
                ? [assignee]
                : restrictAssigneeTo ?? assigneeOptions;
              // Always include the currently-selected owner. Without this, a
              // controlled <select value="Catria"> with options ["Lyriq",
              // "Unassigned"] silently shows "Lyriq" as selected in the DOM,
              // so picking "Lyriq" fires no change event and the owner looks
              // stuck. Prepending `assignee` makes the displayed value real.
              const opts = assignee && !base.includes(assignee) ? [assignee, ...base] : base;
              return opts.map((o: string) => (
                <option key={o} value={o}>{o}</option>
              ));
            })()}
          </select>
        </label>
        {(status === "fail" || status === "failed_retest") &&
          !assigneeLocked &&
          assignee !== "Eng" &&
          assignee !== "Unassigned" && (
          <Badge
            variant="outline"
            className="text-[11px] border-destructive/50 text-destructive bg-destructive/5"
            title="Failing tests are co-owned by Eng for the fix"
          >
            + Eng
          </Badge>
        )}
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
          {deriveTestPath(t) && (
            <p className="text-[11px] text-primary mb-1.5">
              <span className="font-semibold">Step 1:</span> Click the link above to open the test page (opens in a separate window on desktop &amp; phone, or a new tab on iPad).
            </p>
          )}
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
                    <span className="font-mono text-[10px] mr-1 opacity-70">{i + 1}.</span>
                    <StepWithSublist
                      step={s}
                      stepIndex={i}
                      checkedSubsteps={checkedSubsteps}
                      onToggleSubstep={toggleSubstep}
                    />
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
                <label className={`text-[11px] font-semibold ${isFailStatus ? "text-destructive" : "text-foreground"}`}>
                  {isFailStatus ? "QA failure reason" : "QA note"} {isFailStatus && <span className="opacity-70">(required when failing)</span>}
                </label>
                {isFailStatus && (
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
              {isFailStatus && !severity && (
                <p className="text-[10px] text-destructive mb-1">Pick a severity before saving this failure.</p>
              )}
              {isFailStatus && (
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
                placeholder={isFailStatus ? "Describe what went wrong at the selected step — browser/device, what you saw vs. expected, screenshot link…" : "Add a note about this test pass — observations, caveats, device/browser used…"}
                rows={2}
                className={`w-full text-xs rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 ${isFailStatus ? "border-destructive/40 bg-destructive/5 focus:ring-destructive/30" : "border-border bg-muted/30 focus:ring-primary/20"}`}
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
      <FailDetailsDialog
        open={pendingFail != null}
        onOpenChange={(v) => { if (!v) setPendingFail(null); }}
        test={t}
        initialNote={qaNote}
        initialStep={failedStep}
        userId={cardUser?.id ?? null}
        onConfirm={async ({ note, stepLabel, stepIndex, file, noScreenshot }) => {
          const s = pendingFail;
          if (!s) return;
          if (file && cardUser) {
            try {
              await uploadTestEvidence(cardUser.id, t.id, file);
            } catch (e) {
              toast.error(`Screenshot upload failed: ${(e as Error).message}`);
              return;
            }
          }
          persistFailedStep(String(stepIndex + 1));
          onQaNoteChange(formatFailNote(qaNote, { note, stepLabel, noScreenshot }));
          onChange(s);
          setPendingFail(null);
        }}
      />
      <PassNoteDialog
        open={pendingPass}
        onOpenChange={(v) => { if (!v) setPendingPass(false); }}
        testId={t.id}
        initialNote={qaNote}
        onConfirm={(note) => {
          onQaNoteChange(note);
          onChange("pass");
          setPendingPass(false);
        }}
      />
    </Card>
  );
}

/* =========================== FAIL DETAILS DIALOG =========================== */
/**
 * Forces three pieces of context when a tester records a Fail:
 *   1. A note explaining what went wrong.
 *   2. The 1-based step where the failure was observed.
 *   3. A screenshot upload OR the explicit "no screenshot available" box.
 */
function FailDetailsDialog({
  open, onOpenChange, test, initialNote, initialStep, userId, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  test: TestCase;
  initialNote: string;
  initialStep: string;
  userId: string | null;
  onConfirm: (payload: {
    note: string;
    stepLabel: string;
    stepIndex: number;
    file: File | null;
    noScreenshot: boolean;
  }) => void | Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [noScreenshot, setNoScreenshot] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reset / hydrate every time the dialog opens for a new failure.
  useEffect(() => {
    if (!open) return;
    setNote(initialNote ?? "");
    const parsed = parseInt(initialStep, 10);
    setStepIndex(Number.isFinite(parsed) && parsed > 0 ? parsed - 1 : null);
    setFile(null);
    setNoScreenshot(false);
    setBusy(false);
  }, [open, initialStep, initialNote]);

  const error = validateFailDetails({
    note,
    stepIndex,
    hasEvidence: !!file,
    noScreenshot,
  });

  const submit = async () => {
    if (error || stepIndex == null) return;
    setBusy(true);
    try {
      await onConfirm({
        note,
        stepLabel: String(stepIndex + 1),
        stepIndex,
        file,
        noScreenshot,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record failure for {test.id}</DialogTitle>
          <DialogDescription>
            Capture what broke before flipping this test to Fail. All three fields are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <Label className="text-xs font-semibold text-destructive">Failure note (required)</Label>
            <Textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What did you see? What did you expect? Browser/device, error text…"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-destructive">Which step failed?</Label>
            <select
              value={stepIndex == null ? "" : String(stepIndex)}
              onChange={(e) => setStepIndex(e.target.value === "" ? null : Number(e.target.value))}
              className="mt-1 w-full text-xs rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-destructive/30"
            >
              <option value="">Select step…</option>
              {test.steps.map((s, i) => (
                <option key={i} value={String(i)}>
                  Step {i + 1} — {s.length > 60 ? s.slice(0, 57) + "…" : s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-destructive">Screenshot</Label>
            <input
              type="file"
              accept={EVIDENCE_ACCEPT_ATTR}
              disabled={noScreenshot || !userId}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
            />
            {file && (
              <p className="text-[11px] text-muted-foreground">
                Will upload: <span className="font-mono">{file.name}</span>
              </p>
            )}
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={noScreenshot}
                onChange={(e) => {
                  setNoScreenshot(e.target.checked);
                  if (e.target.checked) setFile(null);
                }}
                className="h-3.5 w-3.5 accent-destructive"
              />
              No screenshot available
            </label>
            {!userId && (
              <p className="text-[11px] text-amber-700">Sign in to attach a screenshot.</p>
            )}
          </div>
          {error && (
            <p className="text-[11px] text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={!!error || busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
            Record failure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================== PASS NOTE DIALOG =========================== */
/**
 * Optional QA note when marking a test as Pass. The confirm button label
 * adapts to whether the tester actually typed a note.
 */
function PassNoteDialog({
  open, onOpenChange, testId, initialNote, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: string;
  initialNote: string;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!open) return;
    setNote(initialNote ?? "");
  }, [open, initialNote]);
  const hasNote = note.trim().length > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pass {testId}</DialogTitle>
          <DialogDescription>
            Add an optional note about this pass — observations, caveats, device/browser used. Leave blank if there's nothing to record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <Label className="text-xs font-semibold text-foreground">QA note (optional)</Label>
            <Textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="e.g. Tested on iPhone 15 Safari — passed. Minor visual spacing nit noted but not a fail."
              className="mt-1 text-xs"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onConfirm(note)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {hasNote ? "Save Note" : "No Note for this Test - Just Save It"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestEvidence({ testId }: { testId: string }) {
  const { user } = useApp();
  const confirm = useConfirm();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const isMobile = typeof navigator !== "undefined"
    && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const canCaptureScreen = typeof navigator !== "undefined"
    && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getDisplayMedia === "function";

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
  const onTakePhoto = () => {
    // iOS Safari can't trigger a system screenshot from a web page (the OS
    // gesture is Side + Volume Up). Prompt QA to capture it, then offer the
    // photo library via the camera input (which on iOS surfaces "Photo
    // Library" alongside "Take Photo").
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      toast.info("Use Side + Volume Up to screenshot, then pick it from Photos.", { duration: 6000 });
    }
    cameraRef.current?.click();
  };

  /**
   * Browser-native screen capture. Uses the Screen Capture API
   * (getDisplayMedia) — the browser shows the OS picker for "Entire Screen /
   * Window / Tab", we grab a single frame, encode to PNG, and upload it as
   * evidence. Desktop Chrome/Edge/Safari/Firefox support this; iOS Safari
   * does not (we fall back to the screenshot instructions in onTakePhoto).
   */
  const onCaptureScreen = async () => {
    if (!user) return;
    if (!canCaptureScreen) {
      toast.error("Your browser can't capture the screen. Use the Take photo or Upload button instead.");
      return;
    }
    setBusy(true);
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 },
        audio: false,
      });
      const track = stream.getVideoTracks()[0];
      // Prefer ImageCapture when available — single frame, no <video> dance.
      let blob: Blob | null = null;
      const ImageCaptureCtor = (window as unknown as { ImageCapture?: new (t: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> } }).ImageCapture;
      if (ImageCaptureCtor) {
        const bitmap = await new ImageCaptureCtor(track).grabFrame();
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(bitmap, 0, 0);
        blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      } else {
        // Fallback for Firefox/Safari: pipe the track into a hidden <video>,
        // wait one frame, then paint it onto a canvas.
        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        await video.play();
        await new Promise((r) => requestAnimationFrame(r));
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(video, 0, 0);
        blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      }
      if (!blob) throw new Error("Could not encode screenshot");
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: "image/png" });
      const uploaded = await uploadTestEvidence(user.id, testId, file);
      setFiles((p) => [uploaded, ...p]);
      toast.success("Screenshot captured & uploaded.");
    } catch (err) {
      const msg = (err as Error).message || String(err);
      if (/Permission denied|NotAllowed/i.test(msg)) {
        toast.error("Screen capture was cancelled.");
      } else {
        toast.error(`Capture failed: ${msg}`);
      }
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
      setBusy(false);
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
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
        <input ref={fileRef} type="file" className="hidden" accept={EVIDENCE_ACCEPT_ATTR} onChange={onUpload} />
        <input ref={cameraRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={onUpload} />
        <div className="flex gap-1">
          {canCaptureScreen && !isMobile && (
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={onCaptureScreen}>
              {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Paperclip className="h-3 w-3 mr-1" />}
              Capture screen
            </Button>
          )}
          {isMobile && (
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={onTakePhoto}>
              <Upload className="h-3 w-3 mr-1" />
              Take photo
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={onPick}>
            {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
            Upload
          </Button>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mb-2 leading-snug">
        Required for Fail / Failed-Retest. Allowed: PNG, JPG, HEIC, GIF, WEBP, PDF, .log, .txt (20&nbsp;MB max).
        Executables, HTML, SVG, scripts, and archives are blocked.
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
        {btn("in_progress", "In progress", AlertOctagon, "bg-amber-500/15 border-amber-500/50 text-amber-700")}
        {btn("blocked", "Blocked",       AlertOctagon, "bg-amber-500/15 border-amber-500/50 text-amber-700")}
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
      {btn("in_progress", "In progress", AlertOctagon, "bg-amber-500/15 border-amber-500/50 text-amber-700")}
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

/* ============================ SAVE PROGRESS BAR ============================ */
function SaveProgressBar({
  progress,
  busyLabel,
}: {
  progress: { done: number; total: number } | null;
  busyLabel?: string | null;
}) {
  // Indeterminate "hourglass" mode — shown while the user is waiting on the
  // confirmation dialog to open or on the pre-write evidence check.
  if (!progress && busyLabel) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-border bg-background shadow-lg p-3">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <Hourglass className="h-3.5 w-3.5 text-primary animate-pulse" />
            {busyLabel}
          </span>
          <span className="font-mono text-muted-foreground">…</span>
        </div>
        {/* Indeterminate shimmer bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/3 rounded-full bg-primary animate-[slide-in-right_1.2s_ease-in-out_infinite]" />
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 text-right">Please wait…</div>
      </div>
    );
  }
  if (!progress) return null;
  const pct = progress.total === 0 ? 100 : Math.round((progress.done / progress.total) * 100);
  const finishing = progress.done >= progress.total;
  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-border bg-background shadow-lg p-3">
      <div className="flex items-center justify-between text-xs font-semibold mb-2">
        <span className="flex items-center gap-1.5">
          {finishing
            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            : <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          {finishing ? "Finishing up…" : "Saving to cloud…"}
        </span>
        <span className="font-mono">{progress.done} / {progress.total}</span>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</div>
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
        const isBacklog = s.id === BACKLOG_SPRINT_ID;
        const backlogTests = isBacklog
          ? TEST_CASES.filter((t) => getTestSprintId(t) === BACKLOG_SPRINT_ID)
          : [];
        return (
          <Card key={s.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-xs font-mono text-muted-foreground">
                  {isBacklog ? `BACKLOG · ${s.id}` : `SPRINT ${s.number} · ${s.id}`}
                </div>
                <h3 className="font-semibold text-lg">{s.name}</h3>
                {!isBacklog && (
                  <p className="text-xs text-muted-foreground">{s.start} → {s.end}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{isBacklog ? "Unassigned tests" : "Progress"}</div>
                <div className="font-bold">
                  {isBacklog ? backlogTests.length : `${done}/${s.items.length} (${pct}%)`}
                </div>
              </div>
            </div>
            {!isBacklog && <Progress value={pct} className="h-1.5 mb-3" />}
            <p className="text-sm italic mb-3 text-muted-foreground">Goal: {s.goal}</p>
            {isBacklog ? (
              <ul className="divide-y divide-border border border-border rounded-md">
                {backlogTests.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 p-2 text-sm">
                    <span className="text-[10px] font-mono text-muted-foreground w-20">{t.id}</span>
                    <Badge variant="secondary" className="text-[10px]">{t.area}</Badge>
                    <span className="flex-1">{t.title}</span>
                  </li>
                ))}
                {backlogTests.length === 0 && (
                  <li className="p-2 text-xs text-muted-foreground italic">Backlog is empty.</li>
                )}
              </ul>
            ) : (
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
            )}
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
