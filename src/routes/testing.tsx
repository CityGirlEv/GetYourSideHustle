import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TouchCheckbox, TouchCheckboxField } from "@/components/ui/touch-checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  AlertOctagon,
  Search,
  RotateCcw,
  FlaskConical,
  CalendarDays,
  ListChecks,
  GitBranch,
  Sparkles,
  ExternalLink,
  Wrench,
  RefreshCw,
  Paperclip,
  Upload,
  Trash2,
  FileText,
  Loader2,
  Save,
  Pencil,
  ChevronRight,
  ChevronDown,
  Copy,
  Play,
  Hourglass,
  Smartphone,
} from "lucide-react";
import {
  TEST_CASES,
  IMPLEMENTATION_PLAN,
  SPRINTS,
  TASKS,
  loadAllStatuses,
  saveStatus,
  type TestStatus,
  type TestCase,
  type Priority,
  PRIORITY_LABELS,
  PRIORITY_SHORT,
  getTestSprintId,
  ACTIVE_SPRINT_ID,
  BACKLOG_SPRINT_ID,
  getTestCreditReward,
  totalCreditBudget,
  creditBudgetByOwner,
  REPRO_FAIL_BONUS,
  getTestAssignee,
  DEV_OWNER,
  loadAllQaNotes,
  loadAllDevNotes,
  saveQaNote,
  saveDevNote,
  loadAllSeverities,
  saveSeverity,
  FAIL_SEVERITY_LABELS,
  type FailSeverity,
  loadAllAssigneeOverrides,
  saveAssigneeOverride,
  loadAllDevAssigneeOverrides,
  saveDevAssigneeOverride,
  loadAllSprintOverrides,
  saveSprintOverride,
  applyDescriptionOverride,
  loadDescriptionOverride,
  type TestDescriptionOverride,
  loadAllQaNoteAuthors,
  loadAllDevNoteAuthors,
  saveQaNoteMeta,
  saveDevNoteMeta,
  loadAllQaNoteMeta,
  loadAllDevNoteMeta,
  type NoteMeta,
} from "@/lib/test-plan";
import { saveTestPlanContent, clearTestPlanContent } from "@/lib/test-content-save";
import { AppShell } from "@/components/AppShell";

import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  useQaOwnerOptions,
  qaOwnerOptionNames,
  formatAssigneeOptionLabel,
  type AssigneeOption,
} from "@/lib/use-qa-owner-options";
import { useQaTesters } from "@/lib/use-qa-testers";
import { buildDeviceFilterOptions, testerMatchesDevices } from "@/lib/qa-device-match";
import {
  hydrateTestResultsToLocal,
  cloudPushCheckedSteps,
  cloudFetchCheckedSteps,
  type CheckedSteps,
} from "@/lib/cloud-sync";
import { resolveTestStatus } from "@/lib/test-result-resolve";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listCustomTests,
  createCustomTest,
  duplicateCustomTest,
  canDuplicateTests,
  canEditTestPlanContent,
  customRowToTestCase,
  type CustomTestRow,
} from "@/lib/custom-tests";
import {
  AUTOMATED_TEST_CASES,
  AUTOMATED_TEST_IDS,
  AUTOMATED_TEST_RESULTS,
} from "@/lib/automated-tests";
import { formatTestRatePercent, testRatePercentValue } from "@/lib/test-rate-percent";
import {
  expandAllWithPlatforms,
  TEST_PLATFORMS,
  resolveTestContentId,
  isCustomTestContentId,
} from "@/lib/platform-variants";
import { getQaVisibleOwners, getQaFirstName, shouldRestrictToSelf } from "@/lib/role-scoping";
import { computeTestOwners } from "@/lib/test-owners";
import {
  listTestEvidence,
  uploadTestEvidence,
  deleteTestEvidence,
  getTestEvidenceUrl,
  EVIDENCE_ACCEPT_ATTR,
  EVIDENCE_HELP_TEXT,
  type EvidenceFile,
} from "@/lib/test-evidence";
import { validateFailDetails, formatFailNote } from "@/lib/fail-details";
import { toast } from "sonner";
import { NoteThreadDialog } from "@/components/NoteThreadDialog";
import { NoteAttachmentField } from "@/components/NoteAttachmentField";
import { InlineTestNote } from "@/components/InlineTestNote";
import type { NoteKind } from "@/lib/cloud-sync";
import { MessageSquare } from "lucide-react";
import { MultiSelect, multiSelectMatches } from "@/components/ui/multi-select";
import { useConfirm } from "@/components/ConfirmDialog";
import { buildCloudOps, type DraftValues } from "@/lib/save-batch";
import { canSaveTestResults, getTestResultSaveBlockReason } from "@/lib/qa-save-permissions";
import {
  checkedStepsEqual,
  clearRecentLocalWrites,
  disengageTestIds,
  isMetadataOnlyPendingChanges,
  mergeStatusesRespectingRecentWrites,
  noteLocalTestWrites,
  omitMatchingCheckedStepDrafts,
  omitMatchingStatusDrafts,
  omitMatchingStringDrafts,
  resolveSavedStatusBaseline,
  shouldSkipCloudReload,
  statusFilterMatchesOrEngaged,
  testIdsFromPendingKeys,
  touchCloudReloadCooldown,
  unionDiscardTestIds,
} from "@/lib/testing-drafts";
import { useServerFn } from "@tanstack/react-start";
import { notifyBetaTestUnassignments, notifyBetaTestDevNotes, notifyBetaTestQaRetest } from "@/lib/qa-test-assignment.functions";
import { isNewQaRetestTransition, isUnassignNotificationCandidate } from "@/lib/qa-test-assignment.server";
import { cn } from "@/lib/utils";
import { registerDeploySaveHandler } from "@/lib/deploy-version";
import { noteTextForSave, saveNoteAttachment } from "@/lib/note-attachment";

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

/** QA owner label for notifications — ignores fail→Eng routing. */
function resolveQaOwnerLabel(
  testId: string,
  t: TestCase | undefined,
  status: TestStatus,
  savedAssignees: Record<string, string>,
): string {
  if (!t) return "Unassigned";
  const platformSuffix = TEST_PLATFORMS.find((p) => testId.endsWith(`-${p.suffix}`))?.suffix;
  const sourceId = platformSuffix ? testId.slice(0, -platformSuffix.length - 1) : testId;
  const ov = savedAssignees[testId] || savedAssignees[sourceId];
  if (AUTOMATED_TEST_IDS.has(testId)) return t.assignee || "Unassigned";
  if (ov) return ov;
  const routingStatus = status === "fail" || status === "failed_retest" ? undefined : status;
  return String(getTestAssignee(t, routingStatus));
}

/** Run work after first paint so route mount stays responsive. */
function scheduleIdleWork(fn: () => void, timeoutMs = 2000): () => void {
  if (typeof window === "undefined") {
    fn();
    return () => {};
  }
  if (typeof requestIdleCallback !== "undefined") {
    const id = requestIdleCallback(fn, { timeout: timeoutMs });
    return () => cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 50);
  return () => clearTimeout(id);
}

function noteMetaForUser(user: { id: string; full_name?: string; email?: string }): NoteMeta {
  return {
    author_id: user.id,
    author_name: user.full_name?.trim() || user.email || "Unknown",
    at: new Date().toISOString(),
  };
}

const QA_STEP_CHECKS_KEY = (id: string) => `qa-step-checks:${id}`;
const QA_SUBSTEP_CHECKS_KEY = (id: string) => `qa-substep-checks:${id}`;

function writeLocalStepChecks(id: string, checked: CheckedSteps) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QA_STEP_CHECKS_KEY(id), JSON.stringify(checked.steps));
    window.localStorage.setItem(QA_SUBSTEP_CHECKS_KEY(id), JSON.stringify(checked.substeps));
  } catch {
    /* ignore quota / private mode */
  }
}

function readLocalStepChecks(id: string): CheckedSteps {
  if (typeof window === "undefined") return { steps: [], substeps: [] };
  try {
    const stepsRaw = window.localStorage.getItem(QA_STEP_CHECKS_KEY(id));
    const subsRaw = window.localStorage.getItem(QA_SUBSTEP_CHECKS_KEY(id));
    return {
      steps: stepsRaw ? JSON.parse(stepsRaw) : [],
      substeps: subsRaw ? JSON.parse(subsRaw) : [],
    };
  } catch {
    return { steps: [], substeps: [] };
  }
}

function hasAnyStepChecks(checked: CheckedSteps | undefined): boolean {
  return !!checked && (checked.steps.length > 0 || checked.substeps.length > 0);
}

function TestTargetLink({ test, onOpen }: { test: TestCase; onOpen?: () => void }) {
  const path = deriveTestPath(test);
  if (!path) return null;
  const isExternal = /^https?:\/\//.test(path);
  const label = path.length > 28 ? path.slice(0, 27) + "…" : path;
  const className =
    "inline-flex items-center gap-1 text-[11px] font-mono rounded-full border border-primary/40 bg-primary/5 px-3 py-2 min-h-11 text-primary hover:bg-primary/10 transition-colors touch-manipulation";
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen?.();
    openTestTarget(path);
  };
  if (isExternal) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        className={className}
        title={`Open ${path}`}
      >
        <ExternalLink className="h-3 w-3" />
        {label}
      </a>
    );
  }
  return (
    <a
      href={path}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={className}
      title={`Open ${path}`}
    >
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  );
}

function TestTitleLink({
  test,
  children,
  onOpen,
}: {
  test: TestCase;
  children: React.ReactNode;
  onOpen?: () => void;
}) {
  const path = deriveTestPath(test);
  const className =
    "hover:underline hover:text-primary transition-colors touch-manipulation inline-block py-1 text-left";
  if (!path) {
    return (
      <button type="button" onClick={() => onOpen?.()} className={className} title="Open test">
        {children}
      </button>
    );
  }
  const isExternal = /^https?:\/\//.test(path);
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen?.();
    openTestTarget(path);
  };
  return (
    <a
      href={path}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={className}
      title={`Open ${path}`}
    >
      {children}
    </a>
  );
}

function isInteractiveTestClick(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest(
    "button, a, input, select, textarea, [role='checkbox'], [data-no-auto-start]",
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

type PendingNoteCloudEntry = {
  test_id: string;
  kind: NoteKind;
  text: string;
  attachment?: { attachment_path: string; attachment_name: string };
};

async function buildNoteCloudEntries(args: {
  userId: string;
  testId: string;
  qaNote: string;
  devNote: string;
  qaFile?: File;
  devFile?: File;
}): Promise<PendingNoteCloudEntry[]> {
  const entries: PendingNoteCloudEntry[] = [];
  if (args.qaNote.trim() || args.qaFile) {
    let attachment: PendingNoteCloudEntry["attachment"];
    if (args.qaFile) {
      attachment = await saveNoteAttachment(args.userId, args.testId, args.qaFile);
    }
    entries.push({
      test_id: args.testId,
      kind: "qa",
      text: noteTextForSave(args.qaNote, attachment?.attachment_name),
      attachment,
    });
  }
  if (args.devNote.trim() || args.devFile) {
    let attachment: PendingNoteCloudEntry["attachment"];
    if (args.devFile) {
      attachment = await saveNoteAttachment(args.userId, args.testId, args.devFile);
    }
    entries.push({
      test_id: args.testId,
      kind: "dev",
      text: noteTextForSave(args.devNote, attachment?.attachment_name),
      attachment,
    });
  }
  return entries;
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
  validateSearch: (search: Record<string, unknown>) => ({
    owner: typeof search.owner === "string" ? search.owner : undefined,
    device: typeof search.device === "string" ? search.device : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Testing Portal — Part B Optimizer" },
      {
        name: "description",
        content:
          "Internal test plan, implementation plan, sprint schedule, and tasks for The Part B Optimizer.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TestingPortal,
});

function TestingPortal() {
  const { user, authLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/testing" } });
    }
  }, [user, authLoading, navigate]);

  const isAdmin = userHasAdminRole(user);
  const isQa = user?.role === "qa";
  const [activeTab, setActiveTab] = useState("tests");

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <AppShell
      title="Testing Portal"
      subtitle="Use-case tests, implementation phases, sprint schedule, and the cross-sprint task backlog."
    >
      {(isQa || isAdmin) && (
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <div>
            <b>New here?</b> Read the QA Manual — filters, statuses, bulk edits, and the bug
            pipeline in one short page.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/qa-credits"
              className="inline-flex items-center rounded-md bg-emerald/80 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              Credits →
            </a>
            <a
              href="/qa-manual"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              QA Manual →
            </a>
          </div>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList
            className={`grid w-full md:w-auto ${isAdmin ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}
          >
            <TabsTrigger value="tests">
              <ListChecks className="h-3.5 w-3.5 mr-1.5" />
              Test Plan
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="impl">
                <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                Implementation
              </TabsTrigger>
            )}
            <TabsTrigger value="sprints">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Sprints
            </TabsTrigger>
            {isAdmin && (
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Tasks
              </Link>
            )}
          </TabsList>
        </div>

        {activeTab === "tests" && (
          <div className="mt-2 ring-offset-background">
            <TestPlanTab />
          </div>
        )}
        {activeTab === "impl" && isAdmin && (
          <div className="mt-2 ring-offset-background">
            <ImplementationTab />
          </div>
        )}
        {activeTab === "sprints" && (
          <div className="mt-2 ring-offset-background">
            <SprintsTab />
          </div>
        )}
      </Tabs>
    </AppShell>
  );
}

/* ============================== TEST PLAN TAB ============================== */

function collectAssigneeUnassignments(
  rows: Array<{ testId: string; field: string; key: string }>,
  selectedKeys: Set<string>,
  getPreviousAssignee: (testId: string) => string,
  getNewAssignee: (testId: string) => string,
): Array<{ testId: string; previousAssignee: string }> {
  const out: Array<{ testId: string; previousAssignee: string }> = [];
  for (const row of rows) {
    if (row.field !== "assignee" || !selectedKeys.has(row.key)) continue;
    const prev = getPreviousAssignee(row.testId);
    const next = getNewAssignee(row.testId);
    if (isUnassignNotificationCandidate(prev, next)) {
      out.push({ testId: row.testId, previousAssignee: prev });
    }
  }
  return out;
}

function loadAllStatusesWithAutomated(): Record<string, TestStatus> {
  const local = loadAllStatuses();
  for (const [id, st] of Object.entries(AUTOMATED_TEST_RESULTS)) {
    if (!local[id] || local[id] === "not_run") local[id] = st;
  }
  return local;
}

export function TestPlanTab() {
  const { user, authLoading } = useApp();
  const search = Route.useSearch();
  const isAdmin = userHasAdminRole(user);
  const canDuplicate = canDuplicateTests(user?.email);
  const canEditTests = canEditTestPlanContent(user?.email);
  const canSaveToCloud = canSaveTestResults(user);
  const confirm = useConfirm();
  const notifyUnassignments = useServerFn(notifyBetaTestUnassignments);
  const notifyDevNotes = useServerFn(notifyBetaTestDevNotes);
  const notifyQaRetest = useServerFn(notifyBetaTestQaRetest);
  const fireUnassignEmails = useCallback(
    (rows: Array<{ testId: string; previousAssignee: string }>) => {
      if (!rows.length) return;
      void notifyUnassignments({ data: { unassignments: rows } }).catch((e) =>
        console.warn("[testing] unassign email failed", e),
      );
    },
    [notifyUnassignments],
  );
  const fireDevNoteEmails = useCallback(
    (
      rows: Array<{
        testId: string;
        assigneeLabel: string;
        devNote: string;
        devAuthorName?: string;
        status?: string;
      }>,
    ) => {
      if (!rows.length) return;
      void notifyDevNotes({ data: { notifications: rows } }).catch((e) =>
        console.warn("[testing] dev note email failed", e),
      );
    },
    [notifyDevNotes],
  );
  const fireQaRetestEmails = useCallback(
    (
      rows: Array<{
        testId: string;
        assigneeLabel: string;
        status: "fixed_retest" | "failed_retest";
        devAuthorName?: string;
        devNote?: string;
      }>,
    ) => {
      if (!rows.length) return;
      void notifyQaRetest({ data: { notifications: rows } }).catch((e) =>
        console.warn("[testing] QA retest email failed", e),
      );
    },
    [notifyQaRetest],
  );
  // Persisted/saved state, hydrated from local storage
  // Seed local statuses with the last recorded vitest/playwright run so
  // automated tests show pass/fail without requiring the user to mark them.
  // A user-set status (anything other than the default "not_run") still wins.
  const [savedStatuses, setSavedStatuses] = useState<Record<string, TestStatus>>(() =>
    loadAllStatusesWithAutomated()
  );
  const [savedQaNotes, setSavedQaNotes] = useState<Record<string, string>>(() => loadAllQaNotes());
  const [savedDevNotes, setSavedDevNotes] = useState<Record<string, string>>(() =>
    loadAllDevNotes(),
  );
  const [savedQaAuthors, setSavedQaAuthors] = useState<Record<string, string>>(() =>
    loadAllQaNoteAuthors(),
  );
  const [savedDevAuthors, setSavedDevAuthors] = useState<Record<string, string>>(() =>
    loadAllDevNoteAuthors(),
  );
  const [savedQaNoteMeta, setSavedQaNoteMeta] = useState<Record<string, NoteMeta>>(() =>
    loadAllQaNoteMeta(),
  );
  const [savedDevNoteMeta, setSavedDevNoteMeta] = useState<Record<string, NoteMeta>>(() =>
    loadAllDevNoteMeta(),
  );
  const [savedSeverities, setSavedSeverities] = useState<Record<string, FailSeverity | "">>(() =>
    loadAllSeverities(),
  );
  const [savedAssignees, setSavedAssignees] = useState<Record<string, string>>(() =>
    loadAllAssigneeOverrides(),
  );
  const [savedDevAssignees, setSavedDevAssignees] = useState<Record<string, string>>(() =>
    loadAllDevAssigneeOverrides(),
  );
  const [savedSprints, setSavedSprints] = useState<Record<string, string>>(() =>
    loadAllSprintOverrides(),
  );

  const recentLocalWritesRef = useRef(new Map<string, number>());
  const cloudReloadCooldownUntilRef = useRef(0);
  const pendingCountRef = useRef(0);
  const pendingChangesRef = useRef<
    {
      key: string;
      testId: string;
      field: string;
    }[]
  >([]);
  const commitChangesRef = useRef<(selectedKeys: Set<string>) => Promise<void>>(async () => {});
  const dCheckedStepsRef = useRef<Record<string, CheckedSteps>>({});
  const saveInFlightRef = useRef(false);
  const pendingQaAttachmentsRef = useRef<Record<string, File>>({});
  const pendingDevAttachmentsRef = useRef<Record<string, File>>({});
  const savedCheckedStepsRef = useRef<Record<string, CheckedSteps>>({});
  /** Last cloud/local snapshot used to revert session-only writes on discard. */
  const persistedBaselineRef = useRef<{
    statuses: Record<string, TestStatus>;
    checkedSteps: Record<string, CheckedSteps>;
  }>({ statuses: {}, checkedSteps: {} });
  const [checksResetEpoch, setChecksResetEpoch] = useState(0);

  const refreshPersistedBaseline = useCallback((ids?: Iterable<string>) => {
    const loaded = loadAllStatusesWithAutomated();
    if (!ids) {
      persistedBaselineRef.current = {
        statuses: { ...loaded },
        checkedSteps: { ...savedCheckedStepsRef.current },
      };
      return;
    }
    for (const id of ids) {
      persistedBaselineRef.current.statuses[id] = resolveSavedStatusBaseline(loaded, id);
      const checks = savedCheckedStepsRef.current[id];
      if (checks) persistedBaselineRef.current.checkedSteps[id] = checks;
      else delete persistedBaselineRef.current.checkedSteps[id];
    }
  }, []);

  const reloadSavedFromLocal = useCallback(() => {
    const now = Date.now();
    setSavedStatuses((prev) =>
      mergeStatusesRespectingRecentWrites(
        loadAllStatusesWithAutomated(),
        prev,
        recentLocalWritesRef.current,
        now,
      ),
    );
    setSavedQaNotes(loadAllQaNotes());
    setSavedDevNotes(loadAllDevNotes());
    setSavedQaAuthors(loadAllQaNoteAuthors());
    setSavedDevAuthors(loadAllDevNoteAuthors());
    setSavedQaNoteMeta(loadAllQaNoteMeta());
    setSavedDevNoteMeta(loadAllDevNoteMeta());
    setSavedSeverities(loadAllSeverities());
    setSavedAssignees(loadAllAssigneeOverrides());
    setSavedDevAssignees(loadAllDevAssigneeOverrides());
    setSavedSprints(loadAllSprintOverrides());
  }, []);

  // After auth is ready, pull authoritative test_results from the cloud into
  // localStorage so this browser shows whatever was last saved to the DB.
  const [cloudSyncReady, setCloudSyncReady] = useState(false);
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    const run = async () => {
      try {
        await hydrateTestResultsToLocal();
        if (cancelled) return;
        reloadSavedFromLocal();
        refreshPersistedBaseline();
      } catch (e) {
        console.warn("[testing] hydrate failed", e);
      } finally {
        if (!cancelled) setCloudSyncReady(true);
      }
    };
    const cancelSchedule = scheduleIdleWork(() => {
      void run();
    }, 2000);
    return () => {
      cancelled = true;
      cancelSchedule();
    };
  }, [authLoading, user?.id, reloadSavedFromLocal, refreshPersistedBaseline]);

  // Live sync — when any user changes a test_results row (status, notes,
  // assignee...), re-hydrate so every other open Testing tab updates
  // without a manual refresh. Without this, a tester who already loaded
  // the page keeps seeing the old value (e.g. "fail") even after another
  // tester flips it to "in progress".
  useEffect(() => {
    if (!cloudSyncReady) return;
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(async () => {
        if (
          shouldSkipCloudReload({
            pendingCount: pendingCountRef.current,
            saveInFlight: saveInFlightRef.current,
            cooldownUntil: cloudReloadCooldownUntilRef.current,
          })
        ) {
          return;
        }
        try {
          await hydrateTestResultsToLocal();
          if (cancelled) return;
          reloadSavedFromLocal();
        } catch (e) {
          console.warn("[testing] realtime refresh failed", e);
        }
      }, 250);
    };
    const channel = supabase
      .channel("test_results-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "test_results" }, () =>
        refresh(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [cloudSyncReady, reloadSavedFromLocal]);
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
    return () => {
      cancelled = true;
    };
  }, []);

  // Effective test cases with description overrides applied (admin edits).
  const effectiveCases = useMemo(() => {
    const base = TEST_CASES.map((t) => applyDescriptionOverride(t));
    const custom = customTests.map((r) => applyDescriptionOverride(customRowToTestCase(r)));
    // Fan every manual scenario + custom test out into one variant per
    // supported platform (iPhone / Android / iPad / macOS / Windows). The
    // original un-suffixed entries are dropped — only the platform variants
    // are surfaced so QA always tests on every device. Automated test runs
    // map 1:1 to source files and stay un-expanded.
    const baseExpanded = expandAllWithPlatforms(base);
    const customExpanded = expandAllWithPlatforms(custom);
    return [...baseExpanded, ...AUTOMATED_TEST_CASES, ...customExpanded];
  }, [descVersion, customTests]);
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

  const resolveContentTest = useCallback(
    (viewId: string | null): TestCase | null => {
      if (!viewId) return null;
      const contentId = resolveTestContentId(viewId);
      const custom = customTests.find((c) => c.id === contentId);
      if (custom) return applyDescriptionOverride(customRowToTestCase(custom));
      const base = TEST_CASES.find((t) => t.id === contentId);
      if (base) return applyDescriptionOverride(base);
      return effectiveById.get(viewId) ?? null;
    },
    [customTests, effectiveById],
  );
  // Draft (unsaved) overlays — only changed entries
  const [dStatuses, setDStatuses] = useState<Record<string, TestStatus>>({});
  const [dQaNotes, setDQaNotes] = useState<Record<string, string>>({});
  const [dDevNotes, setDDevNotes] = useState<Record<string, string>>({});
  const [dSeverities, setDSeverities] = useState<Record<string, FailSeverity | "">>({});
  const [dAssignees, setDAssignees] = useState<Record<string, string>>({});
  const [dDevAssignees, setDDevAssignees] = useState<Record<string, string>>({});
  const [dSprints, setDSprints] = useState<Record<string, string>>({});
  const [savedCheckedSteps, setSavedCheckedSteps] = useState<Record<string, CheckedSteps>>({});
  const [dCheckedSteps, setDCheckedSteps] = useState<Record<string, CheckedSteps>>({});
  useEffect(() => {
    savedCheckedStepsRef.current = savedCheckedSteps;
  }, [savedCheckedSteps]);
  useEffect(() => {
    dCheckedStepsRef.current = dCheckedSteps;
  }, [dCheckedSteps]);
  const [saveOpen, setSaveOpen] = useState(false);
  // When set, the SaveChangesDialog is scoped to a single test id. null = bulk save.
  const [saveScopeId, setSaveScopeId] = useState<string | null>(null);
  const [scrollToTestId, setScrollToTestId] = useState<string | null>(null);
  // Live save progress for the floating progress bar. null = no save in flight.
  const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null);
  // Indeterminate "busy" indicator shown while the user is waiting on
  // something that doesn't have a discrete progress count (e.g. preparing
  // the confirmation dialog before the bulk write).
  const [saveBusy, setSaveBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  /** Tests the user has clicked or edited since the last row save — drives green Save highlight. */
  const [engagedTestIds, setEngagedTestIds] = useState<Set<string>>(() => new Set());
  /** Sync mirror of engagedTestIds for status-filter checks in the same tick as pin. */
  const engagedTestIdsRef = useRef<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [deviceFilter, setDeviceFilter] = useState<string[]>([]);
  const deepLinkApplied = useRef(false);
  useEffect(() => {
    if (deepLinkApplied.current || !isAdmin) return;
    if (search.owner || search.device) {
      deepLinkApplied.current = true;
      if (search.owner) setOwnerFilter([search.owner]);
      if (search.device) setDeviceFilter([search.device]);
    }
  }, [search.owner, search.device, isAdmin]);
  const [sprintFilter, setSprintFilter] = useState<string[]>([]);
  const [passRateExpanded, setPassRateExpanded] = useState(() => user?.role === "qa");
  // QA Owner roster — every QA-role user (all selectable for assignment).
  const qaOwnerOptionList = useQaOwnerOptions();
  const allQaOwners = qaOwnerOptionNames(qaOwnerOptionList);
  const qaTesters = useQaTesters(isAdmin);
  const deviceFilterOptions = useMemo(
    () => buildDeviceFilterOptions(qaTesters.flatMap((t) => t.qa_devices)),
    [qaTesters],
  );
  const matchingTesters = useMemo(() => {
    if (!isAdmin || deviceFilter.length === 0) return [];
    return qaTesters.filter((t) => testerMatchesDevices(t.qa_devices, deviceFilter));
  }, [isAdmin, qaTesters, deviceFilter]);
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

  // Effective (saved + draft) views used for rendering and filtering.
  // Notes pre-fill only when the last saved author is the current user;
  // otherwise a blank draft is shown so a different user enters a new note.
  const statuses = useMemo(() => ({ ...savedStatuses, ...dStatuses }), [savedStatuses, dStatuses]);
  const getStatus = useCallback((id: string) => resolveTestStatus(statuses, id), [statuses]);
  const qaNotes = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [id, note] of Object.entries(savedQaNotes)) {
      const author = savedQaAuthors[id];
      if (!author || author === user?.id) out[id] = note;
    }
    for (const [id, note] of Object.entries(dQaNotes)) out[id] = note;
    return out;
  }, [savedQaNotes, savedQaAuthors, dQaNotes, user?.id]);
  const devNotes = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [id, note] of Object.entries(savedDevNotes)) {
      const author = savedDevAuthors[id];
      if (!author || author === user?.id) out[id] = note;
    }
    for (const [id, note] of Object.entries(dDevNotes)) out[id] = note;
    return out;
  }, [savedDevNotes, savedDevAuthors, dDevNotes, user?.id]);
  const severities = useMemo(
    () => ({ ...savedSeverities, ...dSeverities }),
    [savedSeverities, dSeverities],
  );
  const assigneeOverrides = useMemo(
    () => ({ ...savedAssignees, ...dAssignees }),
    [savedAssignees, dAssignees],
  );
  const devAssigneeOverrides = useMemo(
    () => ({ ...savedDevAssignees, ...dDevAssignees }),
    [savedDevAssignees, dDevAssignees],
  );
  const sprintOverrides = useMemo(
    () => ({ ...savedSprints, ...dSprints }),
    [savedSprints, dSprints],
  );

  // Baselines for draft detection — match what the row visibly shows before edits.
  const readSavedQaOwner = useCallback(
    (id: string, saved: Record<string, string> = savedAssignees): string => {
      const t = effectiveById.get(id);
      const platformSuffix = TEST_PLATFORMS.find((p) => id.endsWith(`-${p.suffix}`))?.suffix;
      const sourceId = platformSuffix ? id.slice(0, -platformSuffix.length - 1) : id;
      const ov = saved[id] || saved[sourceId];
      if (AUTOMATED_TEST_IDS.has(id)) return t?.assignee || "Unassigned";
      if (ov) return ov;
      if (!t) return "Unassigned";
      return String(getTestAssignee(t));
    },
    [effectiveById, savedAssignees],
  );

  const resolveSavedDevAssignee = useCallback(
    (id: string, saved: Record<string, string> = savedDevAssignees): string => {
      const platformSuffix = TEST_PLATFORMS.find((p) => id.endsWith(`-${p.suffix}`))?.suffix;
      const sourceId = platformSuffix ? id.slice(0, -platformSuffix.length - 1) : id;
      return saved[id] || saved[sourceId] || "";
    },
    [savedDevAssignees],
  );

  const resolveSavedAssignee = useCallback(
    (id: string): string => {
      return readSavedQaOwner(id);
    },
    [readSavedQaOwner],
  );

  const resolveSavedSprint = useCallback(
    (id: string): string => {
      const ov = savedSprints[id];
      if (ov) return ov;
      const t = effectiveById.get(id);
      if (!t) return "";
      if (customIds.has(id)) return t.sprintId || "";
      return getTestSprintId(t);
    },
    [effectiveById, savedSprints, customIds],
  );

  const resolveSavedQaNote = useCallback(
    (id: string): string => {
      const author = savedQaAuthors[id];
      if (!author || author === user?.id) return savedQaNotes[id] ?? "";
      return "";
    },
    [savedQaNotes, savedQaAuthors, user?.id],
  );

  const resolveSavedDevNote = useCallback(
    (id: string): string => {
      const author = savedDevAuthors[id];
      if (!author || author === user?.id) return savedDevNotes[id] ?? "";
      return "";
    },
    [savedDevNotes, savedDevAuthors, user?.id],
  );

  function writeDraftField<T>(
    setter: React.Dispatch<React.SetStateAction<Record<string, T>>>,
    id: string,
    value: T,
    baseline: T,
  ) {
    setter((p) => {
      const next = { ...p };
      if (Object.is(value, baseline)) delete next[id];
      else next[id] = value;
      return next;
    });
  }

  const setStatus = (id: string, s: TestStatus) => {
    writeDraftField(setDStatuses, id, s, resolveSavedStatusBaseline(savedStatuses, id));
    if (s !== "fail" && s !== "failed_retest") {
      writeDraftField(
        setDSeverities,
        id,
        "" as FailSeverity | "",
        savedSeverities[id] ?? ("" as FailSeverity | ""),
      );
    }
    if (s === "fail" || s === "failed_retest") {
      writeDraftField(setDDevAssignees, id, DEV_OWNER, resolveSavedDevAssignee(id));
    }
  };
  const setQaNote = (id: string, note: string) => {
    writeDraftField(setDQaNotes, id, note, resolveSavedQaNote(id));
    saveQaNote(id, note, { syncCloud: false });
  };
  const setDevNote = (id: string, note: string) => {
    writeDraftField(setDDevNotes, id, note, resolveSavedDevNote(id));
    saveDevNote(id, note, { syncCloud: false });
  };
  const setSeverityFor = (id: string, s: FailSeverity | "") =>
    writeDraftField(setDSeverities, id, s, savedSeverities[id] ?? ("" as FailSeverity | ""));
  const setAssigneeFor = (id: string, owner: string) =>
    writeDraftField(setDAssignees, id, owner, resolveSavedAssignee(id));
  const setDevAssigneeFor = (id: string, owner: string) =>
    writeDraftField(setDDevAssignees, id, owner, resolveSavedDevAssignee(id));
  const setSprintFor = (id: string, sprintId: string) =>
    writeDraftField(setDSprints, id, sprintId, resolveSavedSprint(id));

  const fmtChecks = (c: CheckedSteps | undefined) => {
    if (!c || (c.steps.length === 0 && c.substeps.length === 0)) return "—";
    return `${c.steps.length} step(s), ${c.substeps.length} sub-step(s) checked`;
  };

  const setChecksBaseline = useCallback((id: string, checked: CheckedSteps) => {
    const saved = savedCheckedStepsRef.current[id] ?? { steps: [], substeps: [] };
    if (checkedStepsEqual(checked, saved)) {
      setDCheckedSteps((p) =>
        omitMatchingCheckedStepDrafts(p, { ...savedCheckedStepsRef.current, [id]: checked }),
      );
      return;
    }
    setSavedCheckedSteps((p) => ({ ...p, [id]: checked }));
    persistedBaselineRef.current.checkedSteps[id] = checked;
    setDCheckedSteps((p) =>
      omitMatchingCheckedStepDrafts(p, { ...savedCheckedStepsRef.current, [id]: checked }),
    );
  }, []);

  const checkedStepsSyncTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const setStepChecksDraft = useCallback((id: string, checked: CheckedSteps) => {
    setDCheckedSteps((p) => {
      const saved = savedCheckedStepsRef.current[id] ?? { steps: [], substeps: [] };
      if (checkedStepsEqual(checked, saved)) {
        if (!(id in p)) return p;
        const next = { ...p };
        delete next[id];
        return next;
      }
      return { ...p, [id]: checked };
    });

    const timers = checkedStepsSyncTimersRef.current;
    const existing = timers.get(id);
    if (existing) clearTimeout(existing);
    if (!hasAnyStepChecks(checked)) return;

    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        void (async () => {
          const ok = await cloudPushCheckedSteps(id, checked);
          if (!ok) return;
          setSavedCheckedSteps((p) => ({ ...p, [id]: checked }));
          persistedBaselineRef.current.checkedSteps[id] = checked;
          writeLocalStepChecks(id, checked);
          setDCheckedSteps((p) =>
            omitMatchingCheckedStepDrafts(p, { ...savedCheckedStepsRef.current, [id]: checked }),
          );
          touchCloudReloadCooldown(cloudReloadCooldownUntilRef);
        })();
      }, 800),
    );
  }, []);

  const flushPendingStepCheckSyncs = useCallback(async () => {
    const timers = checkedStepsSyncTimersRef.current;
    const pendingIds = [...timers.keys()];
    for (const id of pendingIds) {
      const timer = timers.get(id);
      if (timer) clearTimeout(timer);
      timers.delete(id);
    }
    for (const id of pendingIds) {
      const checked = dCheckedStepsRef.current[id];
      if (!checked || !hasAnyStepChecks(checked)) continue;
      const saved = savedCheckedStepsRef.current[id] ?? { steps: [], substeps: [] };
      if (checkedStepsEqual(checked, saved)) continue;
      const ok = await cloudPushCheckedSteps(id, checked);
      if (!ok) continue;
      setSavedCheckedSteps((p) => ({ ...p, [id]: checked }));
      persistedBaselineRef.current.checkedSteps[id] = checked;
      writeLocalStepChecks(id, checked);
      setDCheckedSteps((p) =>
        omitMatchingCheckedStepDrafts(p, { ...savedCheckedStepsRef.current, [id]: checked }),
      );
      touchCloudReloadCooldown(cloudReloadCooldownUntilRef);
    }
  }, []);

  const markTestStarted = useCallback(
    (id: string) => {
      const current = resolveTestStatus({ ...savedStatuses, ...dStatuses }, id);
      if (current !== "not_run") return;
      // Auto-persist locally so card engage / scroll doesn't pile up in_progress
      // drafts that re-open the bulk save/discard bar after a real save.
      const next = "in_progress" as TestStatus;
      saveStatus(id, next, { syncCloud: false });
      noteLocalTestWrites(recentLocalWritesRef.current, [id]);
      touchCloudReloadCooldown(cloudReloadCooldownUntilRef);
      setSavedStatuses((p) => ({ ...p, [id]: next }));
      setDStatuses((p) => {
        if (!(id in p)) return p;
        const n = { ...p };
        delete n[id];
        return n;
      });
    },
    [savedStatuses, dStatuses],
  );

  /** Pin a test in status filters before status changes can drop it from a filter. */
  const pinEngagedTest = useCallback((id: string) => {
    engagedTestIdsRef.current.add(id);
    setEngagedTestIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const autoStartTest = useCallback(
    (id: string) => {
      markTestStarted(id);
    },
    [markTestStarted],
  );

  const engageTest = useCallback(
    (id: string) => {
      pinEngagedTest(id);
      markTestStarted(id);
    },
    [pinEngagedTest, markTestStarted],
  );

  const toggleSelect = (id: string) => {
    setSelected((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // Build a list of pending changes for the save dialog
  type Change = {
    key: string; // unique id "<testId>:<field>"
    testId: string;
    field:
      | "status"
      | "qaNote"
      | "devNote"
      | "severity"
      | "assignee"
      | "devAssignee"
      | "sprint"
      | "checkedSteps";
    label: string;
    before: string;
    after: string;
  };
  const pendingChanges = useMemo<Change[]>(() => {
    const list: Change[] = [];
    const fmt = (v: unknown) => (v === "" || v == null ? "—" : String(v));
    for (const [id, v] of Object.entries(dStatuses))
      list.push({
        key: `${id}:status`,
        testId: id,
        field: "status",
        label: "Status",
        before: fmt(resolveSavedStatusBaseline(savedStatuses, id)),
        after: fmt(v),
      });
    for (const [id, v] of Object.entries(dQaNotes))
      list.push({
        key: `${id}:qaNote`,
        testId: id,
        field: "qaNote",
        label: "QA note",
        before: fmt(resolveSavedQaNote(id)),
        after: fmt(v),
      });
    for (const [id, v] of Object.entries(dDevNotes))
      list.push({
        key: `${id}:devNote`,
        testId: id,
        field: "devNote",
        label: "Dev note",
        before: fmt(resolveSavedDevNote(id)),
        after: fmt(v),
      });
    for (const [id, v] of Object.entries(dSeverities))
      list.push({
        key: `${id}:severity`,
        testId: id,
        field: "severity",
        label: "Severity",
        before: fmt(savedSeverities[id] ?? ""),
        after: fmt(v),
      });
    for (const [id, v] of Object.entries(dAssignees))
      list.push({
        key: `${id}:assignee`,
        testId: id,
        field: "assignee",
        label: "QA Owner",
        before: fmt(resolveSavedAssignee(id)),
        after: fmt(v),
      });
    for (const [id, v] of Object.entries(dDevAssignees))
      list.push({
        key: `${id}:devAssignee`,
        testId: id,
        field: "devAssignee",
        label: "Dev Owner",
        before: fmt(resolveSavedDevAssignee(id)),
        after: fmt(v),
      });
    for (const [id, v] of Object.entries(dSprints))
      list.push({
        key: `${id}:sprint`,
        testId: id,
        field: "sprint",
        label: "Sprint",
        before: fmt(resolveSavedSprint(id)),
        after: fmt(v),
      });
    for (const [id, v] of Object.entries(dCheckedSteps))
      list.push({
        key: `${id}:checkedSteps`,
        testId: id,
        field: "checkedSteps",
        label: "Step checks",
        before: fmtChecks(savedCheckedSteps[id]),
        after: fmtChecks(v),
      });
    return list.sort((a, b) => a.testId.localeCompare(b.testId));
  }, [
    dStatuses,
    dQaNotes,
    dDevNotes,
    dSeverities,
    dAssignees,
    dDevAssignees,
    dSprints,
    dCheckedSteps,
    savedStatuses,
    savedSeverities,
    savedCheckedSteps,
    resolveSavedAssignee,
    resolveSavedDevAssignee,
    resolveSavedSprint,
    resolveSavedQaNote,
    resolveSavedDevNote,
  ]);

  const pendingCount = pendingChanges.length;
  const pendingTestCount = useMemo(
    () => new Set(pendingChanges.map((c) => c.testId)).size,
    [pendingChanges],
  );
  const multiTestPending = pendingTestCount > 1;
  useEffect(() => {
    pendingCountRef.current = pendingCount;
  }, [pendingCount]);
  useEffect(() => {
    saveInFlightRef.current = !!saveProgress || !!saveBusy;
  }, [saveProgress, saveBusy]);
  // Row saves and bulk saves clear drafts asynchronously; close the review
  // dialog once nothing remains pending so it cannot linger empty on screen.
  useEffect(() => {
    if (pendingCount === 0 && saveOpen) {
      setSaveOpen(false);
      setSaveScopeId(null);
      setSaveBusy(null);
    }
  }, [pendingCount, saveOpen]);

  // Cloud reload / card remount can leave draft overlays that now match saved
  // baselines — prune them so the Save all changes bar stays hidden after save.
  useEffect(() => {
    setDStatuses((p) =>
      omitMatchingStatusDrafts(p, savedStatuses, (id) =>
        resolveSavedStatusBaseline(savedStatuses, id),
      ),
    );
    setDCheckedSteps((p) => omitMatchingCheckedStepDrafts(p, savedCheckedSteps));
    setDQaNotes((p) => omitMatchingStringDrafts(p, savedQaNotes, resolveSavedQaNote));
    setDDevNotes((p) => omitMatchingStringDrafts(p, savedDevNotes, resolveSavedDevNote));
    setDSeverities((p) => omitMatchingStringDrafts(p, savedSeverities));
    setDAssignees((p) => omitMatchingStringDrafts(p, savedAssignees, resolveSavedAssignee));
    setDDevAssignees((p) => omitMatchingStringDrafts(p, savedDevAssignees, resolveSavedDevAssignee));
    setDSprints((p) => omitMatchingStringDrafts(p, savedSprints, resolveSavedSprint));
  }, [
    savedStatuses,
    savedCheckedSteps,
    savedQaNotes,
    savedDevNotes,
    savedSeverities,
    savedAssignees,
    savedDevAssignees,
    savedSprints,
    resolveSavedQaNote,
    resolveSavedDevNote,
    resolveSavedAssignee,
    resolveSavedDevAssignee,
    resolveSavedSprint,
  ]);

  const openSaveDialog = useCallback(() => {
    const blockReason = getTestResultSaveBlockReason(user);
    if (blockReason) {
      toast.error("Cannot save test result", { description: blockReason });
      return;
    }
    if (pendingCount === 0) {
      toast.message("Nothing new to save", { description: "Make a change first, then save." });
      return;
    }
    const testIds = [...new Set(pendingChanges.map((c) => c.testId))];
    setSaveScopeId(testIds.length === 1 ? testIds[0]! : null);
    setSaveBusy("Preparing review…");
    requestAnimationFrame(() => setSaveOpen(true));
  }, [user, pendingCount, pendingChanges]);

  const openSaveAllDialog = openSaveDialog;

  const discardAllDrafts = async () => {
    const hasDrafts = pendingCount > 0;
    const hasEngaged = engagedTestIds.size > 0;
    if (!hasDrafts && !hasEngaged) return;
    const confirmDescription = hasDrafts
      ? `Discard all ${pendingCount} unsaved change(s)?`
      : `Discard in-progress work on ${engagedTestIds.size} test(s)?`;
    if (
      !(await confirm({
        title: "Discard changes?",
        description: confirmDescription,
        confirmLabel: "Discard",
        destructive: true,
      }))
    )
      return;

    const affectedIds = unionDiscardTestIds(pendingChanges, engagedTestIds);
    const emptyChecks: CheckedSteps = { steps: [], substeps: [] };

    for (const id of affectedIds) {
      const baselineStatus = resolveSavedStatusBaseline(persistedBaselineRef.current.statuses, id);
      saveStatus(id, baselineStatus, { syncCloud: false });
      const baselineChecks = persistedBaselineRef.current.checkedSteps[id] ?? emptyChecks;
      writeLocalStepChecks(id, baselineChecks);
    }

    clearRecentLocalWrites(recentLocalWritesRef.current, affectedIds);
    setDStatuses({});
    setDQaNotes({});
    setDDevNotes({});
    setDSeverities({});
    setDAssignees({});
    setDDevAssignees({});
    setDSprints({});
    setDCheckedSteps({});
    setSavedCheckedSteps((prev) => {
      const next = { ...prev };
      for (const id of affectedIds) {
        const baselineChecks = persistedBaselineRef.current.checkedSteps[id];
        if (baselineChecks) next[id] = baselineChecks;
        else delete next[id];
      }
      return next;
    });
    engagedTestIdsRef.current = new Set();
    setEngagedTestIds(new Set());
    setChecksResetEpoch((n) => n + 1);
    setSaveOpen(false);
    setSaveScopeId(null);
    setSaveBusy(null);
    // Brief guard so a concurrent cloud hydrate cannot overwrite localStorage
    // with stale rows right before we re-read saved snapshots.
    touchCloudReloadCooldown(cloudReloadCooldownUntilRef);
    // Re-read persisted snapshots so owner bubbles reflect saved data, not stale drafts.
    reloadSavedFromLocal();
  };

  const hasTestChanges = (id: string) => pendingChanges.some((c) => c.testId === id);
  const isTestEngaged = (id: string) => engagedTestIds.has(id);

  const commitSingleTestSnapshot = async (id: string) => {
    const blockReason = getTestResultSaveBlockReason(user);
    if (blockReason) {
      toast.error("Cannot save test result", { description: blockReason });
      return;
    }
    const t = effectiveById.get(id);
    if (!t) return;

    setSaveBusy("Saving…");
    try {
      const metadataOnlySave = isMetadataOnlyPendingChanges(id, pendingChanges);
      let status = getStatus(id);
      const previousStatus = (savedStatuses[id] ?? "not_run") as TestStatus;
      const previousAssignee = readSavedQaOwner(id);
      const previousDevNote = (savedDevNotes[id] ?? "").trim();
      const assignee = effPrimaryOwner(t);
      const devAssignee = effDevOwner(t);
      const sprintId = effSprint(t);
      const severity = severities[id] ?? "";
      const qaNote = qaNotes[id] ?? "";
      const devNote = devNotes[id] ?? "";
      const checkedDraft = dCheckedSteps[id];
      const checkedForStatus = checkedDraft ?? readLocalStepChecks(id);
      if (
        !metadataOnlySave &&
        status === "not_run" &&
        hasAnyStepChecks(checkedForStatus)
      ) {
        status = "in_progress";
      }

      const allStepsChecked =
        t.steps.length === 0 ||
        t.steps.every((_, idx) => checkedForStatus.steps.includes(idx));

      if (!metadataOnlySave && status === "pass" && !allStepsChecked) {
        toast.error("Cannot save test result", {
          description: `All test steps must be completed to pass this test. Please go back and check all the boxes for saving the passed test.`,
        });
        return;
      }

      saveStatus(id, status, { syncCloud: false });
      saveAssigneeOverride(id, assignee, { syncCloud: false });
      saveDevAssigneeOverride(id, devAssignee, { syncCloud: false });
      saveSprintOverride(id, sprintId, { syncCloud: false });
      saveSeverity(id, severity, { syncCloud: false });
      saveQaNote(id, qaNote, { syncCloud: false });
      saveDevNote(id, devNote, { syncCloud: false });
      let qaMeta: NoteMeta | undefined;
      let devMeta: NoteMeta | undefined;
      if (user?.id) {
        if (qaNote) {
          qaMeta = noteMetaForUser(user);
          saveQaNoteMeta(id, qaMeta);
        }
        if (devNote) {
          devMeta = noteMetaForUser(user);
          saveDevNoteMeta(id, devMeta);
        }
      }

      noteLocalTestWrites(recentLocalWritesRef.current, [id]);
      touchCloudReloadCooldown(cloudReloadCooldownUntilRef);

      setSavedStatuses((p) => ({ ...p, [id]: status }));
      setSavedAssignees((p) => ({ ...p, [id]: assignee }));
      setSavedDevAssignees((p) => ({ ...p, [id]: devAssignee }));
      setSavedSprints((p) => ({ ...p, [id]: sprintId }));
      setSavedSeverities((p) => ({ ...p, [id]: severity }));
      setSavedQaNotes((p) => ({ ...p, [id]: qaNote }));
      setSavedDevNotes((p) => ({ ...p, [id]: devNote }));
      if (qaMeta) setSavedQaNoteMeta((p) => ({ ...p, [id]: qaMeta! }));
      if (devMeta) setSavedDevNoteMeta((p) => ({ ...p, [id]: devMeta! }));
      if (user?.id && qaNote) setSavedQaAuthors((p) => ({ ...p, [id]: user.id }));
      if (user?.id && devNote) setSavedDevAuthors((p) => ({ ...p, [id]: user.id }));
      setDStatuses((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setDAssignees((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setDDevAssignees((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setDSprints((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setDSeverities((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setDQaNotes((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setDDevNotes((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setDCheckedSteps((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });

      refreshPersistedBaseline([id]);

      const { cloudPushTestsBulk, cloudAppendNotesBulk } = await import("@/lib/cloud-sync");
      const patch: Parameters<typeof cloudPushTestsBulk>[0][number]["patch"] = {
        status,
        assignee,
        dev_assignee: devAssignee || null,
        sprint_id: sprintId || null,
        severity: severity || null,
      };
      const pushed = await cloudPushTestsBulk([{ test_id: id, patch }]);

      if (checkedDraft && (checkedDraft.steps.length > 0 || checkedDraft.substeps.length > 0)) {
        const ok = await cloudPushCheckedSteps(id, checkedDraft);
        if (ok) {
          setSavedCheckedSteps((p) => ({ ...p, [id]: checkedDraft }));
          persistedBaselineRef.current.checkedSteps[id] = checkedDraft;
          writeLocalStepChecks(id, checkedDraft);
        } else {
          setDCheckedSteps((p) => ({ ...p, [id]: checkedDraft }));
        }
      } else {
        const localChecks = readLocalStepChecks(id);
        if (hasAnyStepChecks(localChecks)) {
          setSavedCheckedSteps((p) => ({ ...p, [id]: localChecks }));
          persistedBaselineRef.current.checkedSteps[id] = localChecks;
        }
      }

      const noteEntries: PendingNoteCloudEntry[] = [];
      if (user?.id && (qaNote.trim() || devNote.trim() || pendingQaAttachmentsRef.current[id] || pendingDevAttachmentsRef.current[id])) {
        noteEntries.push(
          ...(await buildNoteCloudEntries({
            userId: user.id,
            testId: id,
            qaNote,
            devNote,
            qaFile: pendingQaAttachmentsRef.current[id],
            devFile: pendingDevAttachmentsRef.current[id],
          })),
        );
        delete pendingQaAttachmentsRef.current[id];
        delete pendingDevAttachmentsRef.current[id];
      } else {
        if (qaNote.trim()) noteEntries.push({ test_id: id, kind: "qa", text: qaNote.trim() });
        if (devNote.trim()) noteEntries.push({ test_id: id, kind: "dev", text: devNote.trim() });
      }
      if (noteEntries.length) await cloudAppendNotesBulk(noteEntries);

      if (pushed > 0) {
        setEngagedTestIds((prev) => {
          const next = disengageTestIds(prev, [id]);
          engagedTestIdsRef.current = new Set(next);
          return next;
        });
        toast.success(`Saved ${id} to cloud.`);
        if (isUnassignNotificationCandidate(previousAssignee, assignee)) {
          fireUnassignEmails([{ testId: id, previousAssignee }]);
        }
        const trimmedDevNote = devNote.trim();
        if (trimmedDevNote && trimmedDevNote !== previousDevNote) {
          fireDevNoteEmails([
            {
              testId: id,
              assigneeLabel: resolveQaOwnerLabel(id, t, status, savedAssignees),
              devNote: trimmedDevNote,
              devAuthorName: user?.full_name?.trim() || user?.email || "Development",
              status,
            },
          ]);
        }
        if (isNewQaRetestTransition(previousStatus, status)) {
          fireQaRetestEmails([
            {
              testId: id,
              assigneeLabel: resolveQaOwnerLabel(id, t, status, {
                ...savedAssignees,
                [id]: assignee,
              }),
              status,
              devAuthorName: user?.full_name?.trim() || user?.email || "Development",
              devNote: trimmedDevNote || undefined,
            },
          ]);
        }
        requestScrollToTest(id);
      } else {
        toast.error(`Could not save ${id} to cloud — check your connection and try again.`);
      }
    } finally {
      setSaveBusy(null);
    }
  };

  const saveSingleTest = (id: string) => {
    const blockReason = getTestResultSaveBlockReason(user);
    if (blockReason) {
      toast.error("Cannot save test result", { description: blockReason });
      return Promise.resolve();
    }
    return commitSingleTestSnapshot(id);
  };

  const cardActionsRef = useRef({
    setStatus,
    setQaNote,
    setDevNote,
    setSeverityFor,
    setAssigneeFor,
    setDevAssigneeFor,
    setSprintFor,
    toggleSelect,
    engageTest,
    pinEngagedTest,
    autoStartTest,
    setChecksBaseline,
    setStepChecksDraft,
    setEditingId,
    saveSingleTest,
    hasTestChanges,
    duplicateCustomTestRow: null as ((id: string) => Promise<void>) | null,
  });
  cardActionsRef.current = {
    setStatus,
    setQaNote,
    setDevNote,
    setSeverityFor,
    setAssigneeFor,
    setDevAssigneeFor,
    setSprintFor,
    toggleSelect,
    engageTest,
    pinEngagedTest,
    autoStartTest,
    setChecksBaseline,
    setStepChecksDraft,
    setEditingId,
    saveSingleTest,
    hasTestChanges,
    duplicateCustomTestRow: canDuplicate
      ? async (id: string) => {
          const t = effectiveById.get(id);
          if (!t) return;
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
        }
      : null,
  };

  const onCardToggleSelect = useCallback(
    (id: string) => cardActionsRef.current.toggleSelect(id),
    [],
  );
  const onCardStatusChange = useCallback(
    (id: string, s: TestStatus) => cardActionsRef.current.setStatus(id, s),
    [],
  );
  const onCardEngage = useCallback((id: string) => cardActionsRef.current.engageTest(id), []);
  const onCardPinEngage = useCallback(
    (id: string) => cardActionsRef.current.pinEngagedTest(id),
    [],
  );
  const onCardChecksBaseline = useCallback(
    (id: string, checked: CheckedSteps) => cardActionsRef.current.setChecksBaseline(id, checked),
    [],
  );
  const onCardStepChecksChange = useCallback(
    (id: string, checked: CheckedSteps) => cardActionsRef.current.setStepChecksDraft(id, checked),
    [],
  );
  const onCardQaNoteChange = useCallback(
    (id: string, n: string) => cardActionsRef.current.setQaNote(id, n),
    [],
  );
  const onCardDevNoteChange = useCallback(
    (id: string, n: string) => cardActionsRef.current.setDevNote(id, n),
    [],
  );
  const onCardSeverityChange = useCallback(
    (id: string, s: FailSeverity | "") => cardActionsRef.current.setSeverityFor(id, s),
    [],
  );
  const onCardAssigneeChange = useCallback(
    (id: string, o: string) => cardActionsRef.current.setAssigneeFor(id, o),
    [],
  );
  const onCardDevAssigneeChange = useCallback(
    (id: string, o: string) => cardActionsRef.current.setDevAssigneeFor(id, o),
    [],
  );
  const onCardSprintChange = useCallback(
    (id: string, s: string) => cardActionsRef.current.setSprintFor(id, s),
    [],
  );
  const onCardEdit = useCallback((id: string) => cardActionsRef.current.setEditingId(id), []);
  const onCardSave = useCallback((id: string) => cardActionsRef.current.saveSingleTest(id), []);
  const onCardPendingQaAttachment = useCallback((id: string, file: File | null) => {
    if (file) pendingQaAttachmentsRef.current[id] = file;
    else delete pendingQaAttachmentsRef.current[id];
  }, []);
  const onCardPendingDevAttachment = useCallback((id: string, file: File | null) => {
    if (file) pendingDevAttachmentsRef.current[id] = file;
    else delete pendingDevAttachmentsRef.current[id];
  }, []);
  const onCardDuplicate = useCallback((id: string) => {
    void cardActionsRef.current.duplicateCustomTestRow?.(id);
  }, []);

  // Persist a subset of pending changes; remaining ones stay in draft.
  const commitChanges = async (selectedKeys: Set<string>) => {
    const blockReason = getTestResultSaveBlockReason(user);
    if (blockReason) {
      toast.error("Cannot save test result", { description: blockReason });
      return;
    }

    const testIdsToSave = testIdsFromPendingKeys(selectedKeys);
    const incompletePassedIds: string[] = [];
    for (const id of testIdsToSave) {
      const t = effectiveById.get(id);
      if (!t) continue;
      const targetStatus = dStatuses[id] !== undefined ? dStatuses[id] : savedStatuses[id];
      if (targetStatus === "pass") {
        const checkedDraft = dCheckedSteps[id];
        const checkedForStatus = checkedDraft ?? readLocalStepChecks(id);
        const allStepsChecked =
          t.steps.length === 0 ||
          t.steps.every((_, idx) => checkedForStatus.steps.includes(idx));
        if (!allStepsChecked) {
          incompletePassedIds.push(id);
        }
      }
    }

    if (incompletePassedIds.length > 0) {
      toast.error("Cannot save changes", {
        description: `All test steps must be completed to pass. Please go back and check all the boxes for saving the passed test(s): ${incompletePassedIds.join(", ")}.`,
      });
      return;
    }
    setSaveBusy("Writing locally…");
    const unassignRows = collectAssigneeUnassignments(
      pendingChanges,
      selectedKeys,
      (testId) => readSavedQaOwner(testId),
      (testId) => dAssignees[testId]!,
    );
    const assigneesSnapshot = { ...savedAssignees };
    const previousDevNotesSnapshot = { ...savedDevNotes };
    const previousStatusesSnapshot = { ...savedStatuses };
    const stillDraft = {
      status: { ...dStatuses },
      qaNote: { ...dQaNotes },
      devNote: { ...dDevNotes },
      severity: { ...dSeverities },
      assignee: { ...dAssignees },
      devAssignee: { ...dDevAssignees },
      sprint: { ...dSprints },
    };
    const newSaved = {
      status: { ...savedStatuses },
      qaNote: { ...savedQaNotes },
      devNote: { ...savedDevNotes },
      severity: { ...savedSeverities },
      assignee: { ...savedAssignees },
      devAssignee: { ...savedDevAssignees },
      sprint: { ...savedSprints },
    };
    // ----- Local writes (synchronous, no implicit cloud push) ---------------
    // We pass syncCloud:false so the test-plan helpers DON'T each fire their
    // own cloudPushTest. We then coalesce everything into one merged push per
    // test id and run those through a concurrency-limited pool below.
    for (const c of pendingChanges) {
      if (!selectedKeys.has(c.key)) continue;
      const id = c.testId;
      switch (c.field) {
        case "status": {
          const v = dStatuses[id]!;
          saveStatus(id, v, { syncCloud: false });
          newSaved.status[id] = v;
          delete stillDraft.status[id];
          break;
        }
        case "qaNote": {
          const v = dQaNotes[id]!;
          saveQaNote(id, v, { syncCloud: false });
          newSaved.qaNote[id] = v;
          delete stillDraft.qaNote[id];
          break;
        }
        case "devNote": {
          const v = dDevNotes[id]!;
          saveDevNote(id, v, { syncCloud: false });
          newSaved.devNote[id] = v;
          delete stillDraft.devNote[id];
          break;
        }
        case "severity": {
          const v = dSeverities[id]!;
          saveSeverity(id, v, { syncCloud: false });
          newSaved.severity[id] = v;
          delete stillDraft.severity[id];
          break;
        }
        case "assignee": {
          const v = dAssignees[id]!;
          saveAssigneeOverride(id, v, { syncCloud: false });
          newSaved.assignee[id] = v;
          assigneesSnapshot[id] = v;
          delete stillDraft.assignee[id];
          break;
        }
        case "devAssignee": {
          const v = dDevAssignees[id]!;
          saveDevAssigneeOverride(id, v, { syncCloud: false });
          newSaved.devAssignee[id] = v;
          delete stillDraft.devAssignee[id];
          break;
        }
        case "sprint": {
          const v = dSprints[id]!;
          saveSprintOverride(id, v, { syncCloud: false });
          newSaved.sprint[id] = v;
          delete stillDraft.sprint[id];
          break;
        }
      }
    }
    const devNoteNotifications: Array<{
      testId: string;
      assigneeLabel: string;
      devNote: string;
      devAuthorName?: string;
      status?: string;
    }> = [];
    for (const c of pendingChanges) {
      if (!selectedKeys.has(c.key) || c.field !== "devNote") continue;
      const id = c.testId;
      const note = (newSaved.devNote[id] ?? "").trim();
      const previous = (previousDevNotesSnapshot[id] ?? "").trim();
      if (!note || note === previous) continue;
      const t = effectiveById.get(id);
      const status = (newSaved.status[id] ?? savedStatuses[id] ?? "not_run") as TestStatus;
      devNoteNotifications.push({
        testId: id,
        assigneeLabel: resolveQaOwnerLabel(id, t, status, assigneesSnapshot),
        devNote: note,
        devAuthorName: user?.full_name?.trim() || user?.email || "Development",
        status,
      });
    }
    const retestNotifications: Array<{
      testId: string;
      assigneeLabel: string;
      status: "fixed_retest" | "failed_retest";
      devAuthorName?: string;
      devNote?: string;
    }> = [];
    for (const c of pendingChanges) {
      if (!selectedKeys.has(c.key) || c.field !== "status") continue;
      const id = c.testId;
      const newStatus = newSaved.status[id]! as TestStatus;
      const previousStatus = (previousStatusesSnapshot[id] ?? "not_run") as TestStatus;
      if (!isNewQaRetestTransition(previousStatus, newStatus)) continue;
      if (newStatus !== "fixed_retest" && newStatus !== "failed_retest") continue;
      const t = effectiveById.get(id);
      retestNotifications.push({
        testId: id,
        assigneeLabel: resolveQaOwnerLabel(id, t, newStatus, assigneesSnapshot),
        status: newStatus,
        devAuthorName: user?.full_name?.trim() || user?.email || "Development",
        devNote: (newSaved.devNote[id] ?? "").trim() || undefined,
      });
    }
    // Record the current user as the author of locally-saved notes so the
    // inline textarea pre-fill logic knows this note belongs to them.
    const newQaMeta: Record<string, NoteMeta> = {};
    const newDevMeta: Record<string, NoteMeta> = {};
    if (user?.id) {
      for (const id of Object.keys(newSaved.qaNote)) {
        const meta = noteMetaForUser(user);
        saveQaNoteMeta(id, meta);
        newQaMeta[id] = meta;
      }
      for (const id of Object.keys(newSaved.devNote)) {
        const meta = noteMetaForUser(user);
        saveDevNoteMeta(id, meta);
        newDevMeta[id] = meta;
      }
    }
    const savedTestIds = testIdsFromPendingKeys(selectedKeys);
    noteLocalTestWrites(recentLocalWritesRef.current, savedTestIds);
    touchCloudReloadCooldown(cloudReloadCooldownUntilRef);
    const scrollAfterSave = saveScopeId;
    setSavedStatuses(newSaved.status);
    setSavedQaNotes(newSaved.qaNote);
    setSavedDevNotes(newSaved.devNote);
    if (user?.id) {
      setSavedQaAuthors((p) => ({
        ...p,
        ...Object.fromEntries(Object.keys(newSaved.qaNote).map((id) => [id, user.id])),
      }));
      setSavedDevAuthors((p) => ({
        ...p,
        ...Object.fromEntries(Object.keys(newSaved.devNote).map((id) => [id, user.id])),
      }));
    }
    setSavedQaNoteMeta((p) => ({ ...p, ...newQaMeta }));
    setSavedDevNoteMeta((p) => ({ ...p, ...newDevMeta }));
    setSavedSeverities(newSaved.severity);
    setSavedAssignees(newSaved.assignee);
    setSavedDevAssignees(newSaved.devAssignee);
    setSavedSprints(newSaved.sprint);
    setDStatuses(stillDraft.status);
    setDQaNotes(stillDraft.qaNote);
    setDDevNotes(stillDraft.devNote);
    setDSeverities(stillDraft.severity);
    setDAssignees(stillDraft.assignee);
    setDDevAssignees(stillDraft.devAssignee);
    setDSprints(stillDraft.sprint);

    const checkedIds = pendingChanges
      .filter((c) => selectedKeys.has(c.key) && c.field === "checkedSteps")
      .map((c) => c.testId);
    const newSavedChecks = { ...savedCheckedSteps };
    const checkedDraftSnapshot = { ...dCheckedSteps };
    if (checkedIds.length > 0) {
      setDCheckedSteps((prev) => {
        const next = { ...prev };
        for (const id of checkedIds) delete next[id];
        return next;
      });
    }
    for (const id of checkedIds) {
      const v = checkedDraftSnapshot[id];
      if (!v) continue;
      const ok = await cloudPushCheckedSteps(id, v);
      if (ok) {
        newSavedChecks[id] = v;
        writeLocalStepChecks(id, v);
      } else {
        setDCheckedSteps((p) => ({ ...p, [id]: v }));
      }
    }
    setSavedCheckedSteps(newSavedChecks);

    setSaveOpen(false);
    setSaveScopeId(null);

    // ----- Coalesced cloud writes with progress bar -------------------------
    const draftSnapshot: DraftValues = {
      status: stillDraft.status,
      qaNote: stillDraft.qaNote,
      devNote: stillDraft.devNote,
      severity: stillDraft.severity,
      assignee: stillDraft.assignee,
      devAssignee: stillDraft.devAssignee,
      sprint: stillDraft.sprint,
    };
    for (const c of pendingChanges) {
      if (!selectedKeys.has(c.key)) continue;
      const id = c.testId;
      switch (c.field) {
        case "status":
          draftSnapshot.status[id] = newSaved.status[id]!;
          break;
        case "qaNote":
          draftSnapshot.qaNote[id] = newSaved.qaNote[id]!;
          break;
        case "devNote":
          draftSnapshot.devNote[id] = newSaved.devNote[id]!;
          break;
        case "severity":
          draftSnapshot.severity[id] = newSaved.severity[id]!;
          break;
        case "assignee":
          draftSnapshot.assignee[id] = newSaved.assignee[id]!;
          break;
        case "devAssignee":
          draftSnapshot.devAssignee[id] = newSaved.devAssignee[id]!;
          break;
        case "sprint":
          draftSnapshot.sprint[id] = newSaved.sprint[id]!;
          break;
      }
    }
    const ops = buildCloudOps(
      pendingChanges.map((c) => ({ key: c.key, testId: c.testId, field: c.field })),
      selectedKeys,
      draftSnapshot,
    );
    if (ops.length === 0) {
      setSaveBusy(null);
      return;
    }
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
    const noteEntries: PendingNoteCloudEntry[] = [];
    for (const o of ops.filter((op) => op.kind === "note")) {
      const testId = o.testId;
      const kind = o.note!.kind;
      const text = o.note!.text;
      const pendingFile =
        kind === "qa"
          ? pendingQaAttachmentsRef.current[testId]
          : pendingDevAttachmentsRef.current[testId];
      if (user?.id && pendingFile) {
        const attachment = await saveNoteAttachment(user.id, testId, pendingFile);
        if (kind === "qa") delete pendingQaAttachmentsRef.current[testId];
        else delete pendingDevAttachmentsRef.current[testId];
        noteEntries.push({
          test_id: testId,
          kind,
          text: noteTextForSave(text, attachment.attachment_name),
          attachment,
        });
      } else if (text.trim()) {
        noteEntries.push({ test_id: testId, kind, text: text.trim() });
      }
    }
    // Attachments picked without a note-field change still save with the card note on bulk save.
    if (user?.id) {
      const noteTestIds = new Set(noteEntries.map((e) => `${e.test_id}:${e.kind}`));
      for (const c of pendingChanges) {
        if (!selectedKeys.has(c.key)) continue;
        const testId = c.testId;
        for (const kind of ["qa", "dev"] as const) {
          const key = `${testId}:${kind}`;
          if (noteTestIds.has(key)) continue;
          const pendingFile =
            kind === "qa"
              ? pendingQaAttachmentsRef.current[testId]
              : pendingDevAttachmentsRef.current[testId];
          if (!pendingFile) continue;
          const text = (kind === "qa" ? newSaved.qaNote[testId] : newSaved.devNote[testId]) ?? "";
          const attachment = await saveNoteAttachment(user.id, testId, pendingFile);
          if (kind === "qa") delete pendingQaAttachmentsRef.current[testId];
          else delete pendingDevAttachmentsRef.current[testId];
          noteEntries.push({
            test_id: testId,
            kind,
            text: noteTextForSave(text, attachment.attachment_name),
            attachment,
          });
          noteTestIds.add(key);
        }
      }
    }
    const totalBatches = (pushPatches.length ? 1 : 0) + (noteEntries.length ? 1 : 0);
    setSaveProgress({ done: 0, total: totalBatches });
    let okBatches = 0;
    let failCount = 0;
    if (pushPatches.length) {
      const n = await cloudPushTestsBulk(pushPatches);
      if (n > 0) okBatches++;
      else failCount += pushPatches.length;
      setSaveProgress({ done: okBatches, total: totalBatches });
    }
    if (noteEntries.length) {
      const n = await cloudAppendNotesBulk(noteEntries);
      if (n > 0) okBatches++;
      else failCount += noteEntries.length;
      setSaveProgress({ done: okBatches, total: totalBatches });
    }
    setSaveProgress(null);
    refreshPersistedBaseline(savedTestIds);
    setEngagedTestIds((prev) => {
      const next = disengageTestIds(prev, savedTestIds);
      engagedTestIdsRef.current = new Set(next);
      return next;
    });
    if (failCount === 0) {
      toast.success(`Saved ${selectedCount} change${selectedCount === 1 ? "" : "s"} to cloud.`);
      if (unassignRows.length > 0) fireUnassignEmails(unassignRows);
      if (devNoteNotifications.length > 0) fireDevNoteEmails(devNoteNotifications);
      if (retestNotifications.length > 0) fireQaRetestEmails(retestNotifications);
      // Assignment emails are sent on user enable or manually from Staff — not on save.
    } else {
      toast.error(
        `Saved locally, but ${failCount} of ${ops.length} cloud write${ops.length === 1 ? "" : "s"} failed — see console.`,
      );
    }
    // Return focus / scroll to the test that was just saved (single-test scope)
    if (scrollAfterSave) requestScrollToTest(scrollAfterSave);
  };

  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  useEffect(() => {
    commitChangesRef.current = commitChanges;
  });

  useEffect(() => {
    return registerDeploySaveHandler(async () => {
      await flushPendingStepCheckSyncs();
      const changes = pendingChangesRef.current;
      if (changes.length === 0) return;
      await commitChangesRef.current(new Set(changes.map((c) => c.key)));
    });
  }, [flushPendingStepCheckSyncs]);

  const areas = useMemo(
    () =>
      Array.from(new Set(effectiveCases.map((t) => t.area))).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [effectiveCases],
  );
  const resolveOwnerOverride = (t: TestCase): string | undefined => {
    const platformSuffix = TEST_PLATFORMS.find((p) => t.id.endsWith(`-${p.suffix}`))?.suffix;
    const sourceId = platformSuffix ? t.id.slice(0, -platformSuffix.length - 1) : t.id;
    return assigneeOverrides[t.id] || assigneeOverrides[sourceId];
  };
  const resolveDevAssignOverride = (t: TestCase): string | undefined => {
    const platformSuffix = TEST_PLATFORMS.find((p) => t.id.endsWith(`-${p.suffix}`))?.suffix;
    const sourceId = platformSuffix ? t.id.slice(0, -platformSuffix.length - 1) : t.id;
    return devAssigneeOverrides[t.id] || devAssigneeOverrides[sourceId];
  };
  // QA owner shown on cards — never fail-routed to Eng (Dev Owner is separate).
  const effPrimaryOwner = (t: TestCase): string => {
    const ov = resolveOwnerOverride(t);
    if (AUTOMATED_TEST_IDS.has(t.id)) return t.assignee || "Unassigned";
    if (ov) return ov;
    return String(getTestAssignee(t));
  };
  const effDevOwner = (t: TestCase): string => {
    const ov = resolveDevAssignOverride(t);
    if (ov) return ov;
    return resolveSavedDevAssignee(t.id);
  };
  // A test's full owner set. Failing/failed-retest tests are co-owned by the
  // original QA AND the dev owner so they show up in both owners' bubbles,
  // filters, and scoped views.
  const effOwners = (t: TestCase): string[] => {
    return computeTestOwners({
      primary: effPrimaryOwner(t),
      devOwner: effDevOwner(t),
      status: getStatus(t.id),
      isAutomated: AUTOMATED_TEST_IDS.has(t.id),
    });
  };
  const qaVisibleOwners = useMemo(() => getQaVisibleOwners(user), [user]);
  // Original assignee BEFORE the fail-→Dev reroute. QA scoping uses this so
  // a QA still sees their own tests even after they mark them failed (the
  // displayed owner becomes "Eng", but the test stays in their list).
  const ownerForQaScope = (t: TestCase): string => effPrimaryOwner(t);
  const effSprint = (t: TestCase): string => {
    const ov = sprintOverrides[t.id];
    if (ov) return ov;
    // Custom tests with no explicit sprint live in the "Unassigned" group.
    if (customIds.has(t.id)) return t.sprintId || "";
    return getTestSprintId(t);
  };
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(
    () => new Set(SPRINTS.filter((s) => s.id !== ACTIVE_SPRINT_ID).map((s) => s.id)),
  );
  const toggleCollapsedSprint = (id: string) =>
    setCollapsedSprints((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const requestScrollToTest = useCallback(
    (id: string) => {
      const t = effectiveById.get(id);
      if (t) {
        const sid = effSprint(t) || "_none";
        setCollapsedSprints((p) => {
          if (!p.has(sid)) return p;
          const n = new Set(p);
          n.delete(sid);
          return n;
        });
      }
      setScrollToTestId(id);
    },
    [effectiveById, sprintOverrides, customIds],
  );
  // For QA: pre-scope the dataset so all counts, charts, and per-owner
  // breakdowns only ever reflect their own tests. Admins see everything.
  const scopedCases = useMemo(
    () =>
      restrictToSelf
        ? effectiveCases.filter(
            (t) =>
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
      for (const o of allQaOwners) {
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
  }, [statuses, assigneeOverrides, scopedCases, isAdmin, allQaOwners]);
  const owners = useMemo(() => Object.keys(ownerCounts), [ownerCounts]);
  const ownerFilterOptions = useMemo(() => {
    if (!isAdmin) return owners;
    const seen = new Set(allQaOwners);
    const extras = owners.filter((o) => !seen.has(o));
    return [...allQaOwners, ...extras];
  }, [isAdmin, allQaOwners, owners]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return scopedCases.filter((t) => {
      if (!multiSelectMatches(areaFilter, t.area)) return false;
      if (
        !statusFilterMatchesOrEngaged(
          statusFilter,
          getStatus(t.id),
          t.id,
          engagedTestIdsRef.current,
        )
      )
        return false;
      if (ownerFilter.length > 0 && !effOwners(t).some((o) => multiSelectMatches(ownerFilter, o)))
        return false;
      if (!multiSelectMatches(sprintFilter, effSprint(t))) return false;
      if (!q) return true;
      return [t.id, t.title, t.area, ...t.steps, t.expected].some((f) =>
        f.toLowerCase().includes(q),
      );
    });
  }, [
    query,
    areaFilter,
    statusFilter,
    ownerFilter,
    sprintFilter,
    statuses,
    assigneeOverrides,
    sprintOverrides,
    scopedCases,
    engagedTestIds,
  ]);

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
      const sid = ov ? ov : customIds.has(t.id) ? t.sprintId || "" : getTestSprintId(t);
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
      setCollapsedSprints(
        new Set(SPRINTS.filter((s) => s.id !== ACTIVE_SPRINT_ID).map((s) => s.id)),
      );
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

  const sprintGroups = useMemo(() => {
    const groups = new Map<string, TestCase[]>();
    for (const t of filtered) {
      const k = effSprint(t) || "_none";
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(t);
    }
    const ordered: { sprintId: string; tests: TestCase[] }[] = [];
    if (groups.has("_none")) ordered.push({ sprintId: "_none", tests: groups.get("_none")! });
    ordered.push({ sprintId: ACTIVE_SPRINT_ID, tests: groups.get(ACTIVE_SPRINT_ID) ?? [] });
    for (const s of SPRINTS) {
      if (s.id !== ACTIVE_SPRINT_ID)
        ordered.push({ sprintId: s.id, tests: groups.get(s.id) ?? [] });
    }
    return ordered;
  }, [filtered, sprintOverrides, customIds]);

  const counts = useMemo(() => {
    const c: Record<TestStatus | "total", number> = {
      total: scopedCases.length,
      pass: 0,
      fail: 0,
      blocked: 0,
      not_run: 0,
      in_progress: 0,
      fixed_retest: 0,
      failed_retest: 0,
    };
    for (const t of scopedCases) c[getStatus(t.id)]++;
    return c;
  }, [statuses, scopedCases]);
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
  const overallFocusPct = testRatePercentValue(overallFocusCount, counts.total);
  const overallFocusPctLabel = formatTestRatePercent(overallFocusCount, counts.total);

  // Per-QA-person status breakdown. Only owners with at least one test appear.
  const ownerStatusCounts = useMemo(() => {
    const out: Record<string, Record<TestStatus | "total", number>> = {};
    if (isAdmin) {
      for (const o of allQaOwners) {
        if (o && o !== "Unassigned")
          out[o] = {
            total: 0,
            pass: 0,
            fail: 0,
            blocked: 0,
            not_run: 0,
            in_progress: 0,
            fixed_retest: 0,
            failed_retest: 0,
          };
      }
    }
    for (const t of scopedCases) {
      const s = getStatus(t.id) as TestStatus;
      for (const owner of effOwners(t)) {
        if (!out[owner])
          out[owner] = {
            total: 0,
            pass: 0,
            fail: 0,
            blocked: 0,
            not_run: 0,
            in_progress: 0,
            fixed_retest: 0,
            failed_retest: 0,
          };
        out[owner].total++;
        out[owner][s]++;
      }
    }
    return out;
  }, [statuses, assigneeOverrides, scopedCases, isAdmin, allQaOwners]);

  return (
    <div className="space-y-4">
      {/* Sprint + ownership banner */}
      <Card className="bg-primary/5 border-primary/30 p-4">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Active sprint
            </div>
            <div className="font-bold text-base">Sprint 1 · Beta go-live ({ACTIVE_SPRINT_ID})</div>
          </div>
          <div className="text-xs text-muted-foreground">
            5/25 → 5/31 ·{" "}
            {TEST_CASES.filter((t) => (t.sprintId ?? ACTIVE_SPRINT_ID) === ACTIVE_SPRINT_ID).length}{" "}
            of {TEST_CASES.length} test cases on this sprint (older sprints listed below)
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Beta tester reward pool:{" "}
          <span className="font-semibold text-foreground">{totalCreditBudget()} credit tokens</span>{" "}
          · Severe=15 · High=10 · Medium=5 · Low=3 · +{REPRO_FAIL_BONUS} bonus per first repro-fail
        </div>
        <div className="flex flex-wrap gap-2 text-xs mt-3">
          {Object.entries(ownerCounts).map(([owner, n]) => {
            const active = ownerFilter.length === 1 && ownerFilter[0] === owner;
            const oc = ownerStatusCounts[owner];
            const done = oc
              ? oc.pass + oc.fail + oc.fixed_retest + oc.failed_retest + oc.blocked
              : 0;
            const total = oc?.total ?? n;
            const pctLabel = formatTestRatePercent(done, total);
            return (
              <button
                key={owner}
                type="button"
                onClick={() => {
                  if (active) {
                    setOwnerFilter([]);
                  } else {
                    setOwnerFilter([owner]);
                    setStatusFilter([]);
                  }
                }}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold bg-background cursor-pointer hover:bg-accent transition-colors ${active ? "ring-2 ring-offset-1 ring-primary" : ""}`}
              >
                {owner}{" "}
                <span className="font-normal opacity-70">
                  · {done}/{total} · {pctLabel} · {creditBudgetByOwner()[owner] ?? 0} cr
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
                {passRateExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {focusStatusLabel[focusStatus]} rate
              </div>
              <div className="text-2xl font-bold">{overallFocusPctLabel}</div>
              <div className="text-[11px] text-muted-foreground">
                {overallFocusCount}/{counts.total}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatBadge
              n={counts.pass}
              label="Pass"
              color="bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
              active={statusFilter.length === 1 && statusFilter[0] === "pass"}
              onClick={() =>
                setStatusFilter(
                  statusFilter.length === 1 && statusFilter[0] === "pass" ? [] : ["pass"],
                )
              }
            />
            <StatBadge
              n={counts.fail}
              label="Fail"
              color="bg-destructive/10 text-destructive border-destructive/30"
              active={statusFilter.length === 1 && statusFilter[0] === "fail"}
              onClick={() =>
                setStatusFilter(
                  statusFilter.length === 1 && statusFilter[0] === "fail" ? [] : ["fail"],
                )
              }
            />
            <StatBadge
              n={counts.fixed_retest}
              label="Fixed/Retest"
              color="bg-sky-500/10 text-sky-700 border-sky-500/30"
              active={statusFilter.length === 1 && statusFilter[0] === "fixed_retest"}
              onClick={() =>
                setStatusFilter(
                  statusFilter.length === 1 && statusFilter[0] === "fixed_retest"
                    ? []
                    : ["fixed_retest"],
                )
              }
            />
            <StatBadge
              n={counts.failed_retest}
              label="Failed/Retest"
              color="bg-orange-500/10 text-orange-700 border-orange-500/30"
              active={statusFilter.length === 1 && statusFilter[0] === "failed_retest"}
              onClick={() =>
                setStatusFilter(
                  statusFilter.length === 1 && statusFilter[0] === "failed_retest"
                    ? []
                    : ["failed_retest"],
                )
              }
            />
            <StatBadge
              n={counts.in_progress}
              label="In progress"
              color="bg-amber-500/10 text-amber-700 border-amber-500/30"
              active={statusFilter.length === 1 && statusFilter[0] === "in_progress"}
              onClick={() =>
                setStatusFilter(
                  statusFilter.length === 1 && statusFilter[0] === "in_progress"
                    ? []
                    : ["in_progress"],
                )
              }
            />
            <StatBadge
              n={counts.blocked}
              label="Blocked"
              color="bg-amber-500/10 text-amber-700 border-amber-500/30"
              active={statusFilter.length === 1 && statusFilter[0] === "blocked"}
              onClick={() =>
                setStatusFilter(
                  statusFilter.length === 1 && statusFilter[0] === "blocked" ? [] : ["blocked"],
                )
              }
            />
            <StatBadge
              n={counts.not_run}
              label="Not run"
              color="bg-muted text-muted-foreground border-border"
              active={statusFilter.length === 1 && statusFilter[0] === "not_run"}
              onClick={() =>
                setStatusFilter(
                  statusFilter.length === 1 && statusFilter[0] === "not_run" ? [] : ["not_run"],
                )
              }
            />
            <StatBadge
              n={counts.total}
              label="Total"
              color="bg-primary/10 text-primary border-primary/30"
              active={statusFilter.length === 0}
              onClick={() => setStatusFilter([])}
            />
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
            {pendingCount > 0 && (
              <Button
                size="sm"
                variant="default"
                onClick={openSaveAllDialog}
                disabled={!canSaveToCloud}
                className={cn(
                  "relative touch-manipulation min-h-11",
                  pendingCount > 0 &&
                    "animate-pulse ring-2 ring-primary ring-offset-2 shadow-lg font-semibold",
                  pendingCount > 0 &&
                    "bg-emerald-600 hover:bg-emerald-700 text-white ring-emerald-500",
                )}
                title={
                  !canSaveToCloud
                    ? (getTestResultSaveBlockReason(user) ?? undefined)
                    : multiTestPending
                      ? `Save all ${pendingCount} change(s) across ${pendingTestCount} tests at once`
                      : `Save ${pendingCount} change(s) for this test`
                }
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {multiTestPending ? "Save all changes" : "Save changes"}
                {pendingCount > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.5",
                      multiTestPending ? "bg-white/20 text-white" : "bg-background text-foreground",
                    )}
                  >
                    {multiTestPending
                      ? `${pendingTestCount} tests · ${pendingCount}`
                      : pendingCount}
                  </span>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={discardAllDrafts}
              disabled={pendingCount === 0 && engagedTestIds.size === 0}
            >
              Discard
            </Button>
          </div>
        </div>
        {passRateExpanded && (
          <>
            <Progress value={overallFocusPct} className="h-2" />
            {user?.role === "qa" &&
              (() => {
                const qaName = getQaFirstName(user);
                const c = ownerStatusCounts[qaName];
                if (!c) return null;
                const ownerFocusCount = c[focusStatus];
                const ownerFocusPct = testRatePercentValue(ownerFocusCount, c.total);
                const ownerFocusPctLabel = formatTestRatePercent(ownerFocusCount, c.total);
                return (
                  <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      Your numbers
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="min-w-[88px] text-left text-xs font-semibold">
                          {qaName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {ownerFocusCount}/{c.total} · {ownerFocusPctLabel}{" "}
                          {focusStatusLabel[focusStatus]}
                        </span>
                      </div>
                      <Progress value={ownerFocusPct} className="h-1.5" />
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                          {c.pass} <span className="font-normal opacity-70">Pass</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-destructive/10 text-destructive border-destructive/30">
                          {c.fail} <span className="font-normal opacity-70">Fail</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-sky-500/10 text-sky-700 border-sky-500/30">
                          {c.fixed_retest}{" "}
                          <span className="font-normal opacity-70">Fixed/Retest</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-orange-500/10 text-orange-700 border-orange-500/30">
                          {c.failed_retest}{" "}
                          <span className="font-normal opacity-70">Failed/Retest</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-700 border-amber-500/30">
                          {c.in_progress}{" "}
                          <span className="font-normal opacity-70">In progress</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-700 border-amber-500/30">
                          {c.blocked} <span className="font-normal opacity-70">Blocked</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-muted text-muted-foreground border-border">
                          {c.not_run} <span className="font-normal opacity-70">Not run</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">· {c.total} total</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
                          statusFilter.length === 1 && statusFilter[0] === s && ownerActive
                            ? []
                            : [s],
                        );
                      };
                      const clearOwner = () => {
                        setOwnerFilter(ownerActive && statusFilter.length === 0 ? [] : [owner]);
                        if (!(ownerActive && statusFilter.length === 0)) setStatusFilter([]);
                      };
                      const ownerFocusCount = c[focusStatus];
                      const ownerFocusPct = testRatePercentValue(ownerFocusCount, c.total);
                      const ownerFocusPctLabel = formatTestRatePercent(ownerFocusCount, c.total);
                      const cell = (n: number, label: string, klass: string, s: TestStatus) => {
                        const isActive =
                          ownerActive && statusFilter.length === 1 && statusFilter[0] === s;
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
                              {ownerFocusCount}/{c.total} · {ownerFocusPctLabel}{" "}
                              {focusStatusLabel[focusStatus]}
                            </span>
                          </div>
                          <Progress value={ownerFocusPct} className="h-1.5" />
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {cell(
                              c.pass,
                              "Pass",
                              "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
                              "pass",
                            )}
                            {cell(
                              c.fail,
                              "Fail",
                              "bg-destructive/10 text-destructive border-destructive/30",
                              "fail",
                            )}
                            {cell(
                              c.fixed_retest,
                              "Fixed/Retest",
                              "bg-sky-500/10 text-sky-700 border-sky-500/30",
                              "fixed_retest",
                            )}
                            {cell(
                              c.failed_retest,
                              "Failed/Retest",
                              "bg-orange-500/10 text-orange-700 border-orange-500/30",
                              "failed_retest",
                            )}
                            {cell(
                              c.in_progress,
                              "In progress",
                              "bg-amber-500/10 text-amber-700 border-amber-500/30",
                              "in_progress",
                            )}
                            {cell(
                              c.blocked,
                              "Blocked",
                              "bg-amber-500/10 text-amber-700 border-amber-500/30",
                              "blocked",
                            )}
                            {cell(
                              c.not_run,
                              "Not run",
                              "bg-muted text-muted-foreground border-border",
                              "not_run",
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              · {c.total} total
                            </span>
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
          <Input
            className="pl-8"
            placeholder="Search by id, title, area, step…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <MultiSelect
          placeholder="Area"
          triggerClassName="w-[180px]"
          options={areas.map((a) => ({ value: a, label: a }))}
          value={areaFilter}
          onChange={setAreaFilter}
          searchable
          searchPlaceholder="Search areas…"
        />
        {isAdmin && (
          <>
            <MultiSelect
              placeholder="Device"
              triggerClassName="w-[200px]"
              options={deviceFilterOptions.map((d) => ({ value: d, label: d }))}
              value={deviceFilter}
              onChange={setDeviceFilter}
              searchable
              searchPlaceholder="Search devices…"
            />
            <MultiSelect
              placeholder="QA Owner"
              triggerClassName="w-[180px]"
              options={ownerFilterOptions.map((o) => ({ value: o, label: o }))}
              value={ownerFilter}
              onChange={setOwnerFilter}
            />
          </>
        )}
        <MultiSelect
          placeholder="Sprint"
          triggerClassName="w-[200px]"
          options={SPRINTS.map((s) => ({
            value: s.id,
            label: s.id === BACKLOG_SPRINT_ID ? "Backlog" : `Sprint ${s.number} · ${s.name}`,
          }))}
          value={sprintFilter}
          onChange={setSprintFilter}
        />
        <MultiSelect
          placeholder="Status"
          triggerClassName="w-[180px]"
          options={[
            { value: "not_run", label: "Not run" },
            { value: "in_progress", label: "In progress" },
            { value: "pass", label: "Pass" },
            { value: "fail", label: "Fail" },
            { value: "fixed_retest", label: "Fixed / Retest" },
            { value: "failed_retest", label: "Failed / Retest" },
            { value: "blocked", label: "Blocked" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        {(isAdmin || user?.role === "qa") && (
          <Button size="sm" onClick={() => setNewTestOpen(true)} className="ml-auto">
            + New Test
          </Button>
        )}
      </div>

      {isAdmin && deviceFilter.length > 0 && (
        <Card className="p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" />
              Testers with selected device{deviceFilter.length === 1 ? "" : "s"}
              <span className="font-normal normal-case">({matchingTesters.length})</span>
            </div>
            {matchingTesters.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() =>
                  setOwnerFilter(Array.from(new Set(matchingTesters.map((t) => t.firstName))))
                }
              >
                Filter all matching tests
              </Button>
            )}
          </div>
          {matchingTesters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No QA testers registered those devices. Check{" "}
              <Link to="/staff/report" className="text-primary underline underline-offset-2">
                Staff device report
              </Link>{" "}
              to review or update tester hardware.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matchingTesters.map((t) => {
                const active = ownerFilter.length === 1 && ownerFilter[0] === t.firstName;
                const matchedDevices = t.qa_devices.filter((d) =>
                  deviceFilter.some((sel) => sel.trim().toLowerCase() === d.trim().toLowerCase()),
                );
                return (
                  <button
                    key={t.userId}
                    type="button"
                    onClick={() => {
                      if (active) {
                        setOwnerFilter([]);
                      } else {
                        setOwnerFilter([t.firstName]);
                        setStatusFilter([]);
                      }
                    }}
                    className={`inline-flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left text-sm bg-background hover:bg-accent transition-colors ${active ? "ring-2 ring-offset-1 ring-primary border-primary/40" : "border-border"}`}
                    title={t.email ? `${t.fullName} · ${t.email}` : t.fullName}
                  >
                    <span className="font-semibold">{t.firstName}</span>
                    <span className="flex flex-wrap gap-1">
                      {(matchedDevices.length > 0 ? matchedDevices : t.qa_devices).map((d) => (
                        <Badge
                          key={d}
                          variant="secondary"
                          className="text-[10px] font-normal px-1.5 py-0"
                        >
                          {d}
                        </Badge>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

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
          onSetStatus={async (s) => {
            if (s === "pass") {
              const incompleteTests = Array.from(selected).filter((id) => {
                const t = effectiveById.get(id);
                if (!t) return false;
                const saved = savedCheckedSteps[id] ?? { steps: [], substeps: [] };
                const currentChecks = dCheckedSteps[id] ?? saved;
                const allStepsChecked =
                  t.steps.length === 0 ||
                  t.steps.every((_, idx) => currentChecks.steps.includes(idx));
                return !allStepsChecked;
              });

              if (incompleteTests.length > 0) {
                await confirm({
                  title: "Incomplete Steps in Selection",
                  description:
                    `You have selected ${incompleteTests.length} test(s) with incomplete steps. ` +
                    `All test steps must be completed to pass these tests. Please go back and check all the boxes for saving the passed tests.`,
                  confirmLabel: "OK",
                  cancelLabel: "Go Back",
                });
                return;
              }
            }
            applyBulk((id) => setStatus(id, s));
          }}
          onSetAssignee={(o) => applyBulk((id) => setAssigneeFor(id, o))}
          onSetSprint={(s) => applyBulk((id) => setSprintFor(id, s))}
          onSetSeverity={(s) => applyBulk((id) => setSeverityFor(id, s))}
          onSetQaNote={(n) => applyBulk((id) => setQaNote(id, n))}
          onSetDevNote={(n) => applyBulk((id) => setDevNote(id, n))}
          qaOwnerOptions={qaOwnerOptionList}
        />
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No test cases match your filters.
          </Card>
        )}
        {filtered.length > 0 && (
          <VirtualizedTestList
            sprintGroups={sprintGroups}
            collapsedSprints={collapsedSprints}
            onToggleCollapsedSprint={toggleCollapsedSprint}
            scrollToTestId={scrollToTestId}
            onScrollToTestHandled={() => setScrollToTestId(null)}
            getStatus={getStatus}
            qaNotes={qaNotes}
            devNotes={devNotes}
            savedQaNotes={savedQaNotes}
            savedDevNotes={savedDevNotes}
            qaNoteMeta={savedQaNoteMeta}
            devNoteMeta={savedDevNoteMeta}
            severities={severities}
            effPrimaryOwner={effPrimaryOwner}
            effDevOwner={effDevOwner}
            effSprint={effSprint}
            selected={selected}
            qaOwnerOptionList={qaOwnerOptionList}
            onCardToggleSelect={onCardToggleSelect}
            onCardStatusChange={onCardStatusChange}
            onCardEngage={onCardEngage}
            onCardPinEngage={onCardPinEngage}
            onCardChecksBaseline={onCardChecksBaseline}
            onCardStepChecksChange={onCardStepChecksChange}
            onCardQaNoteChange={onCardQaNoteChange}
            onCardDevNoteChange={onCardDevNoteChange}
            onCardSeverityChange={onCardSeverityChange}
            onCardAssigneeChange={onCardAssigneeChange}
            onCardDevAssigneeChange={onCardDevAssigneeChange}
            onCardSprintChange={onCardSprintChange}
            isAdmin={isAdmin}
            restrictAssigneeTo={shouldRestrictToSelf(user) ? qaVisibleOwners : undefined}
            canEditTests={canEditTests}
            canDuplicate={canDuplicate}
            onCardEdit={onCardEdit}
            onCardDuplicate={onCardDuplicate}
            hasTestChanges={hasTestChanges}
            isTestEngaged={isTestEngaged}
            onCardSave={onCardSave}
            onCardPendingQaAttachment={onCardPendingQaAttachment}
            onCardPendingDevAttachment={onCardPendingDevAttachment}
            canSaveToCloud={canSaveToCloud}
            multiTestPending={multiTestPending}
            saveBlockReason={getTestResultSaveBlockReason(user) ?? undefined}
            checksResetEpoch={checksResetEpoch}
            savedCheckedSteps={savedCheckedSteps}
          />
        )}
      </div>
      <SaveChangesDialog
        open={saveOpen}
        onOpenChange={(v: boolean) => {
          setSaveOpen(v);
          // Dialog is mounted/dismissed — preparing phase is over.
          setSaveBusy(null);
          if (!v && saveScopeId) requestScrollToTest(saveScopeId);
          if (!v) setSaveScopeId(null);
        }}
        changes={
          saveScopeId ? pendingChanges.filter((c) => c.testId === saveScopeId) : pendingChanges
        }
        onConfirm={commitChanges}
        onDiscardAll={discardAllDrafts}
      />
      <SaveProgressBar progress={saveProgress} busyLabel={saveBusy} />
      {multiTestPending && pendingCount > 0 && canSaveToCloud && !saveProgress && !saveBusy && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(100%,28rem)] -translate-x-1/2 px-4">
          <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-500 bg-background/95 p-2 shadow-2xl backdrop-blur">
            <p className="hidden sm:block flex-1 text-xs text-muted-foreground pl-1">
              {pendingCount} unsaved change{pendingCount === 1 ? "" : "s"} across {pendingTestCount}{" "}
              tests
            </p>
            <Button
              size="sm"
              onClick={openSaveAllDialog}
              className="flex-1 sm:flex-none animate-pulse bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500 ring-offset-2 font-semibold min-h-11 touch-manipulation"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save all changes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={discardAllDrafts}
              className="min-h-11 touch-manipulation"
            >
              Discard
            </Button>
          </div>
        </div>
      )}
      <EditDescriptionDialog
        test={editingId ? resolveContentTest(editingId) : null}
        saveAsTestId={editingId}
        open={!!editingId}
        onOpenChange={(v: boolean) => {
          if (!v) setEditingId(null);
        }}
        onSaved={async () => {
          try {
            setCustomTests(await listCustomTests());
          } catch (e) {
            console.warn("[testing] reload custom tests failed", e);
          }
          setDescVersion((v) => v + 1);
          setEditingId(null);
        }}
      />
    </div>
  );
}

/* ============================== BULK EDIT BAR ============================== */
function BulkEditBar({
  selectedCount,
  totalFiltered,
  allSelected,
  onToggleAll,
  onClear,
  onSetStatus,
  onSetAssignee,
  onSetSprint,
  onSetSeverity,
  onSetQaNote,
  onSetDevNote,
  qaOwnerOptions,
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
  qaOwnerOptions: AssigneeOption[];
}) {
  const { user } = useApp();
  const restrictAssignee = shouldRestrictToSelf(user);
  const [qaDraft, setQaDraft] = useState("");
  const [devDraft, setDevDraft] = useState("");
  const disabled = selectedCount === 0;
  const bulkAssigneeOptions: AssigneeOption[] = restrictAssignee
    ? getQaVisibleOwners(user).map((name) => ({ name, selectable: true }))
    : qaOwnerOptions;
  return (
    <Card className="p-3 bg-background/95 backdrop-blur border-primary/30 sticky top-0 z-30 shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="inline-flex items-center gap-2 font-semibold touch-manipulation min-h-11">
          <TouchCheckbox
            checked={allSelected}
            onChange={onToggleAll}
            aria-label="Select all filtered tests"
          />
          {allSelected ? "Deselect all" : "Select all"}{" "}
          <span className="opacity-60">({totalFiltered} filtered)</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          {selectedCount} selected
        </span>
        {selectedCount > 0 && (
          <Button size="sm" variant="ghost" onClick={onClear} className="h-7 px-2 text-xs">
            Clear
          </Button>
        )}
        <div className="flex-1" />
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              onSetStatus(e.target.value as TestStatus);
              e.target.value = "";
            }
          }}
          title="Set status for selected"
        >
          <option value="">Set status…</option>
          {restrictAssignee ? (
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
          onChange={(e) => {
            if (e.target.value) {
              onSetAssignee(e.target.value);
              e.target.value = "";
            }
          }}
          title="Set QA owner for selected"
        >
          <option value="">Set QA owner…</option>
          {bulkAssigneeOptions.map((o) => (
            <option key={o.name} value={o.name} disabled={!o.selectable}>
              {formatAssigneeOptionLabel(o)}
            </option>
          ))}
        </select>
        <select
          disabled={disabled}
          className="h-8 border border-input rounded-md bg-background px-2 text-xs disabled:opacity-50"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              onSetSprint(e.target.value);
              e.target.value = "";
            }
          }}
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
          onChange={(e) => {
            if (e.target.value !== "__noop") {
              onSetSeverity(e.target.value as FailSeverity | "");
              e.target.value = "__noop";
            }
          }}
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
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || !qaDraft}
            onClick={() => {
              onSetQaNote(qaDraft);
              setQaDraft("");
            }}
          >
            Apply
          </Button>
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
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || !devDraft}
            onClick={() => {
              onSetDevNote(devDraft);
              setDevDraft("");
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StatBadge({
  n,
  label,
  color,
  active,
  onClick,
}: {
  n: number;
  label: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 min-h-11 font-semibold touch-manipulation ${color} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${active ? "ring-2 ring-offset-1 ring-primary" : ""}`}
    >
      {n} <span className="font-normal opacity-80">{label}</span>
    </button>
  );
}

function priorityVariant(p: Priority): string {
  switch (p) {
    case "P0":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "P1":
      return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    case "P2":
      return "bg-primary/10 text-primary border-primary/30";
    case "P3":
      return "bg-muted text-muted-foreground border-border";
  }
}

/** Sub-step checkbox keys for a step (mirrors StepWithSublist parsing). */
function getStepSubstepKeys(step: string, stepIndex: number): string[] {
  const keys: string[] = [];
  const add = (items: string[], startAt = 0) => {
    for (let i = 0; i < items.length; i++) keys.push(`${stepIndex}-${startAt + i}`);
  };

  const basicsSectionsMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information\.)\s*\|\|\|\s*(.+)$/,
  );
  if (basicsSectionsMatch) {
    const sections = basicsSectionsMatch[2]
      .split(" ||| ")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sections.length >= 3) {
      const basicsItems = sections[0]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean);
      const remainingItems = sections[2]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean);
      add(basicsItems, 0);
      add(remainingItems, basicsItems.length);
      return keys;
    }
  }

  const basicsPipeMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information\.)\s*(.+)$/,
  );
  if (
    basicsPipeMatch &&
    basicsPipeMatch[2].includes(" | ") &&
    !basicsPipeMatch[2].includes(" ||| ")
  ) {
    add(
      basicsPipeMatch[2]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (
    step.startsWith("Enter the remaining for the Scenario Information:") &&
    step.includes(" ||| ")
  ) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  const basicsMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information\.)\s*(.+?)\.\s*THEN CLICK NEXT\.$/,
  );
  if (basicsMatch && basicsMatch[2].includes("ZIP3 =")) {
    add([...basicsMatch[2].split(", ").map((s) => s.trim()), "THEN CLICK NEXT."]);
    return keys;
  }

  if (
    (step.startsWith("Step 2 — Cost Preference & Conditions:") ||
      step.startsWith("Step 2 — Preferences & Conditions:")) &&
    step.includes(" ||| ")
  ) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  const step2PipeMatch = step.match(
    /^(Step 2 — (?:Cost Preference|Preferences) & Conditions: On the Part 2 page, complete the following\.)\s*(.+)$/,
  );
  if (step2PipeMatch && step2PipeMatch[2].includes(" | ")) {
    add(
      step2PipeMatch[2]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  const costPrefMatch = step.match(/^(Cost preference:)\s*(.+?)\.\s*THEN CLICK NEXT\.$/);
  if (costPrefMatch) {
    add([costPrefMatch[2].trim(), "THEN CLICK NEXT."]);
    return keys;
  }

  const countyDemoMatch = step.match(
    /^(From the county dropdown.+?county\.)\s*(Enter the remaining for the Scenario Information:)\s*(.+?)\.\s*THEN CLICK NEXT\.$/,
  );
  if (countyDemoMatch) {
    add([...countyDemoMatch[3].split(", ").map((s) => s.trim()), "THEN CLICK NEXT."]);
    return keys;
  }

  const conditionsMatch = step.match(
    /^(Step 2 — Conditions: Add these medical conditions\. If the exact condition isn't listed, click the "Other" box and type in the condition\.)\s*(.+?)\.\s*THEN CLICK NEXT\.$/,
  );
  if (conditionsMatch) {
    add([...conditionsMatch[2].split(", ").map((s) => s.trim()), "THEN CLICK NEXT."]);
    return keys;
  }

  if (step.startsWith("||| ")) {
    add(
      step
        .slice(4)
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (step === "Verify that an email was sent to the address you provided in the previous step.") {
    add([
      "You should receive a confirmation email at the email you entered. Verify that you received the email.",
    ]);
    return keys;
  }

  if (
    step.startsWith("A pop-up screen will appear allowing the user to Opt In.") &&
    step.includes(" ||| ")
  ) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (
    step.match(
      /^A pop-up screen will appear allowing the user to Opt In\. Enter your email and phone number and click the "Contact Me" button\.$/,
    )
  ) {
    add(["Enter your email and phone number.", 'Click the "Contact Me" button.']);
    return keys;
  }

  if (
    step.startsWith(
      "On the confirmation page, verify the header echoes back each item character-for-character:",
    ) &&
    step.includes(" ||| ")
  ) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (
    step ===
    "On the confirmation page, verify the header echoes back every demographic, condition, and medication you entered character-for-character"
  ) {
    add([
      "Verify every demographic you entered.",
      "Verify every condition you entered.",
      "Verify every medication you entered.",
    ]);
    return keys;
  }

  if (step.startsWith("On the confirmation page :") && step.includes(" ||| ")) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (
    step.startsWith('On the confirmation page, click "Copy scenario link"') &&
    step.includes("/scenario/<SCN code>")
  ) {
    add([
      'Click "Copy scenario link".',
      "Verify the link uses the form /scenario/<SCN code>.",
      "Paste it into a new browser tab.",
      "Confirm the scenario detail page loads with the SCN ID, summary card, share button, and expert opt-in trigger all present.",
    ]);
    return keys;
  }

  if (step.startsWith("Step 3 — Medications:") && step.includes(" ||| ")) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  const medsMatch = step.match(
    /^(?:Step 3 — Medications: )?Under Common medications for your conditions: Select the medication \(if present\)\. Those medications will be added to the list below\. Click the plus sign to add additional medications\. Add these medications:\s*(.+?)\.\s*THEN CLICK CREATE SCENARIO\.$/,
  );
  if (medsMatch) {
    const items = medsMatch[1]
      .split("; ")
      .map((s) => s.trim())
      .filter(Boolean);
    add(["Add these medications.", ...items.map((med) => `${med}.`), "THEN CLICK CREATE SCENARIO."]);
    return keys;
  }

  const basicsLegacyMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information THEN CLICK NEXT\.)\s*(.+)$/,
  );
  if (basicsLegacyMatch && basicsLegacyMatch[2].includes("ZIP3 =")) {
    add([...basicsLegacyMatch[2].split(", ").map((s) => s.trim()), "THEN CLICK NEXT."]);
    return keys;
  }

  const introMatch = step.match(/^(Enter the following for the Scenario Information:)\s*(.+)$/);
  if (introMatch && introMatch[2].includes("ZIP3=")) {
    add(introMatch[2].split(", "));
    return keys;
  }

  const remainingMatch = step.match(/^(Enter the remaining for the Scenario Information:)\s*(.+)$/);
  if (remainingMatch) {
    add(remainingMatch[2].split(", "));
    return keys;
  }

  if (step.startsWith("Enter ") && step.includes(", ZIP3=")) {
    add(step.split(", ").slice(1));
    return keys;
  }

  const exactlyMatch = step.match(/^(Add these .+? exactly:\s*)(.+)$/);
  if (exactlyMatch) {
    const rest = exactlyMatch[2];
    const separator = rest.includes("; ") ? "; " : ", ";
    const items = rest
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length >= 2) {
      add(items);
      return keys;
    }
  }

  if (
    step.startsWith("Review the Medication Cost summary in each report:") &&
    step.includes(" ||| ")
  ) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (step.startsWith("Open each report and locate the Medication Cost summary.")) {
    add([
      "Open each report and locate the Medication Cost summary.",
      "If it does not, do not fail the test. Just add a note in the test putting the amounts you see vs. the test.",
    ]);
    return keys;
  }

  if (
    step.startsWith("On the confirmation page (or View scenario summary), download files:") &&
    step.includes(" ||| ")
  ) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (
    step.startsWith("On the confirmation page (or View scenario summary), click 'Download PDF'") ||
    step.startsWith("On the confirmation page (or View scenario summary), click 'Download Excel'")
  ) {
    add([
      "Click 'Download PDF' to generate the system output report.",
      "Click 'Download Excel' to generate the system output report.",
    ]);
    return keys;
  }

  if (step.startsWith("Cross-check that what you entered in steps") && step.includes(" ||| ")) {
    add(
      step
        .split(" ||| ", 2)[1]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return keys;
  }

  if (
    step ===
    "Cross-check that the conditions, demographics, and ZIP3 printed in the PDF and XLSX match what you entered in steps 2–4"
  ) {
    add([
      "Conditions printed in the PDF and XLSX match what you entered.",
      "Demographics printed in the PDF and XLSX match what you entered.",
      "ZIP3 printed in the PDF and XLSX matches what you entered.",
    ]);
  }

  return keys;
}

function syncParentStepCheck(
  stepIndex: number,
  substeps: Set<string>,
  steps: Set<number>,
  stepText: string,
): Set<number> {
  const subKeys = getStepSubstepKeys(stepText, stepIndex);
  if (subKeys.length === 0) return steps;
  const next = new Set(steps);
  if (subKeys.every((k) => substeps.has(k))) next.add(stepIndex);
  else next.delete(stepIndex);
  return next;
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
  const renderSublist = (items: string[], startAt = 0) => (
    <ul className="ml-5 mt-0.5 space-y-0.5 list-none">
      {items.map((item, i) => {
        const subIndex = startAt + i;
        const key = stepIndex != null ? `${stepIndex}-${subIndex}` : "";
        const checked = key ? !!checkedSubsteps?.has(key) : false;
        const interactive = stepIndex != null && !!onToggleSubstep;
        return (
          <li key={subIndex} className="relative z-10">
            {interactive ? (
              <TouchCheckboxField
                checked={checked}
                onChange={() => onToggleSubstep!(key)}
                title={`Check when sub-step ${(stepIndex ?? 0) + 1}${letter(subIndex)} is complete`}
                aria-label={`Mark sub-step ${(stepIndex ?? 0) + 1}${letter(subIndex)} complete`}
              >
                <span className={checked ? "line-through opacity-70" : ""}>
                  <span className="font-mono text-[10px] mr-1 opacity-70">
                    {(stepIndex ?? 0) + 1}
                    {letter(subIndex)}.
                  </span>
                  {item}
                </span>
              </TouchCheckboxField>
            ) : (
              <span className={checked ? "line-through opacity-70" : ""}>
                <span className="font-mono text-[10px] mr-1 opacity-70">
                  {(stepIndex ?? 0) + 1}
                  {letter(subIndex)}.
                </span>
                {item}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );

  // Step 1 · Demographics — birth (2a), ZIP3 (2b), county (2c), then gender/tobacco/income
  const basicsSectionsMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information\.)\s*\|\|\|\s*(.+)$/,
  );
  if (basicsSectionsMatch) {
    const sections = basicsSectionsMatch[2]
      .split(" ||| ")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sections.length >= 3) {
      const basicsItems = sections[0]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean);
      const remainingIntro = sections[1];
      const remainingItems = sections[2]
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean);
      return (
        <span className={className}>
          {basicsSectionsMatch[1]}
          {renderSublist(basicsItems, 0)}
          <span className="block mt-1">{remainingIntro}</span>
          {renderSublist(remainingItems, basicsItems.length)}
        </span>
      );
    }
  }

  // "Step 1 — Demographics: ..." with pipe-delimited substeps (legacy single-block)
  const basicsPipeMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information\.)\s*(.+)$/,
  );
  if (
    basicsPipeMatch &&
    basicsPipeMatch[2].includes(" | ") &&
    !basicsPipeMatch[2].includes(" ||| ")
  ) {
    const items = basicsPipeMatch[2]
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {basicsPipeMatch[1]}
        {renderSublist(items)}
      </span>
    );
  }

  // Remaining demographics on Step 1 (legacy separate audit step)
  if (
    step.startsWith("Enter the remaining for the Scenario Information:") &&
    step.includes(" ||| ")
  ) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  // "Step 1 — Demographics: ... birth year..., ZIP3 = ... THEN CLICK NEXT." (legacy)
  const basicsMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information\.)\s*(.+?)\.\s*THEN CLICK NEXT\.$/,
  );
  if (basicsMatch && basicsMatch[2].includes("ZIP3 =")) {
    const items = basicsMatch[2].split(", ").map((s) => s.trim());
    return (
      <span className={className}>
        {basicsMatch[1]}
        {renderSublist([...items, "THEN CLICK NEXT."])}
      </span>
    );
  }

  // Step 2 · Preferences & Conditions — cost preference first, then conditions
  if (
    (step.startsWith("Step 2 — Cost Preference & Conditions:") ||
      step.startsWith("Step 2 — Preferences & Conditions:")) &&
    step.includes(" ||| ")
  ) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  const step2PipeMatch = step.match(
    /^(Step 2 — (?:Cost Preference|Preferences) & Conditions: On the Part 2 page, complete the following\.)\s*(.+)$/,
  );
  if (step2PipeMatch && step2PipeMatch[2].includes(" | ")) {
    const items = step2PipeMatch[2]
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {step2PipeMatch[1]}
        {renderSublist(items)}
      </span>
    );
  }

  // Cost preference on Step 2 (legacy standalone step)
  const costPrefMatch = step.match(/^(Cost preference:)\s*(.+?)\.\s*THEN CLICK NEXT\.$/);
  if (costPrefMatch) {
    return (
      <span className={className}>
        {costPrefMatch[1]}
        {renderSublist([costPrefMatch[2].trim(), "THEN CLICK NEXT."])}
      </span>
    );
  }

  // County + remaining demographics on the same wizard page (legacy)
  const countyDemoMatch = step.match(
    /^(From the county dropdown.+?county\.)\s*(Enter the remaining for the Scenario Information:)\s*(.+?)\.\s*THEN CLICK NEXT\.$/,
  );
  if (countyDemoMatch) {
    const demoItems = countyDemoMatch[3].split(", ").map((s) => s.trim());
    return (
      <span className={className}>
        {countyDemoMatch[1]} {countyDemoMatch[2]}
        {renderSublist([...demoItems, "THEN CLICK NEXT."])}
      </span>
    );
  }

  // "Step 2 — Conditions: ... Hypertension, Type 2 Diabetes. THEN CLICK NEXT."
  const conditionsMatch = step.match(
    /^(Step 2 — Conditions: Add these medical conditions\. If the exact condition isn't listed, click the "Other" box and type in the condition\.)\s*(.+?)\.\s*THEN CLICK NEXT\.$/,
  );
  if (conditionsMatch) {
    const items = conditionsMatch[2].split(", ").map((s) => s.trim());
    return (
      <span className={className}>
        {conditionsMatch[1]}
        {renderSublist([...items, "THEN CLICK NEXT."])}
      </span>
    );
  }

  // Registration email confirmation (step 6 — checklist only, no intro line)
  if (step.startsWith("||| ")) {
    const items = step
      .slice(4)
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return <span className={className}>{renderSublist(items)}</span>;
  }

  // Legacy email confirmation step
  if (step === "Verify that an email was sent to the address you provided in the previous step.") {
    return (
      <span className={className}>
        {renderSublist([
          "You should receive a confirmation email at the email you entered. Verify that you received the email.",
        ])}
      </span>
    );
  }

  // Expert opt-in pop-up after Create Scenario
  if (step.startsWith("A pop-up screen will appear allowing the user to Opt In.") && step.includes(" ||| ")) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  // Legacy opt-in step (single line)
  const optInLegacyMatch = step.match(
    /^A pop-up screen will appear allowing the user to Opt In\. Enter your email and phone number and click the "Contact Me" button\.$/,
  );
  if (optInLegacyMatch) {
    return (
      <span className={className}>
        A pop-up screen will appear allowing the user to Opt In.
        {renderSublist(["Enter your email and phone number.", 'Click the "Contact Me" button.'])}
      </span>
    );
  }

  // Confirmation page header echo check — one checkbox per demographic, condition, and medication
  if (
    step.startsWith(
      "On the confirmation page, verify the header echoes back each item character-for-character:",
    ) &&
    step.includes(" ||| ")
  ) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  // Legacy header echo step (single line)
  if (
    step ===
    "On the confirmation page, verify the header echoes back every demographic, condition, and medication you entered character-for-character"
  ) {
    return (
      <span className={className}>
        On the confirmation page, verify the header echoes back each item character-for-character:
        {renderSublist([
          "Verify every demographic you entered.",
          "Verify every condition you entered.",
          "Verify every medication you entered.",
        ])}
      </span>
    );
  }

  // Copy scenario link on confirmation page
  if (step.startsWith("On the confirmation page :") && step.includes(" ||| ")) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  // Legacy copy scenario link step (single line)
  if (
    step.startsWith('On the confirmation page, click "Copy scenario link"') &&
    step.includes("/scenario/<SCN code>")
  ) {
    return (
      <span className={className}>
        On the confirmation page :
        {renderSublist([
          'Click "Copy scenario link".',
          "Verify the link uses the form /scenario/<SCN code>.",
          "Paste it into a new browser tab.",
          "Confirm the scenario detail page loads with the SCN ID, summary card, share button, and expert opt-in trigger all present.",
        ])}
      </span>
    );
  }

  // Step 3 · Medications — add-meds line(s) + create action as checkboxes
  if (step.startsWith("Step 3 — Medications:") && step.includes(" ||| ")) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  // Medications step with per-drug checkboxes + create action (legacy inline format)
  const medsIntro =
    "Under Common medications for your conditions: Select the medication (if present). Those medications will be added to the list below. Click the plus sign to add additional medications. Add these medications:";
  const medsMatch = step.match(
    /^(?:Step 3 — Medications: )?Under Common medications for your conditions: Select the medication \(if present\)\. Those medications will be added to the list below\. Click the plus sign to add additional medications\. Add these medications:\s*(.+?)\.\s*THEN CLICK CREATE SCENARIO\.$/,
  );
  if (medsMatch) {
    const items = medsMatch[1]
      .split("; ")
      .map((s) => s.trim())
      .filter(Boolean);
    const legacyItems = ["Add these medications.", ...items.map((med) => `${med}.`)];
    return (
      <span className={className}>
        Step 3 — Medications: {medsIntro}
        {renderSublist([...legacyItems, "THEN CLICK CREATE SCENARIO."])}
      </span>
    );
  }

  // Legacy basics heading (THEN CLICK embedded in intro sentence)
  const basicsLegacyMatch = step.match(
    /^(Step 1 — (?:Demographics|Basics): Enter the following for the Scenario Information THEN CLICK NEXT\.)\s*(.+)$/,
  );
  if (basicsLegacyMatch && basicsLegacyMatch[2].includes("ZIP3 =")) {
    const items = basicsLegacyMatch[2].split(", ").map((s) => s.trim());
    return (
      <span className={className}>
        Step 1 — Demographics: Enter the following for the Scenario Information.
        {renderSublist([...items, "THEN CLICK NEXT."])}
      </span>
    );
  }

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
        {parts[0]},{renderSublist(parts.slice(1))}
      </span>
    );
  }

  // "Add these X exactly: A, B" or "Add these X exactly: A; B"
  const exactlyMatch = step.match(/^(Add these .+? exactly:\s*)(.+)$/);
  if (exactlyMatch) {
    const prefix = exactlyMatch[1];
    const rest = exactlyMatch[2];
    const separator = rest.includes("; ") ? "; " : ", ";
    const items = rest
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length >= 2) {
      return (
        <span className={className}>
          {prefix}
          {renderSublist(items)}
        </span>
      );
    }
  }

  // Medication Cost summary review
  if (
    step.startsWith("Review the Medication Cost summary in each report:") &&
    step.includes(" ||| ")
  ) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  if (step.startsWith("Open each report and locate the Medication Cost summary.")) {
    return (
      <span className={className}>
        Review the Medication Cost summary in each report:
        {renderSublist([
          "Open each report and locate the Medication Cost summary.",
          "If it does not, do not fail the test. Just add a note in the test putting the amounts you see vs. the test.",
        ])}
      </span>
    );
  }

  // Download PDF + Excel on confirmation page
  if (
    step.startsWith("On the confirmation page (or View scenario summary), download files:") &&
    step.includes(" ||| ")
  ) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  if (
    step.startsWith("On the confirmation page (or View scenario summary), click 'Download PDF'") ||
    step.startsWith("On the confirmation page (or View scenario summary), click 'Download Excel'")
  ) {
    return (
      <span className={className}>
        On the confirmation page (or View scenario summary), download files:
        {renderSublist([
          "Click 'Download PDF' to generate the system output report.",
          "Click 'Download Excel' to generate the system output report.",
        ])}
      </span>
    );
  }

  // PDF/XLSX cross-check — conditions, demographics, ZIP3
  if (step.startsWith("Cross-check that what you entered in steps") && step.includes(" ||| ")) {
    const [intro, body] = step.split(" ||| ", 2);
    const items = body
      .split(" | ")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <span className={className}>
        {intro}
        {renderSublist(items)}
      </span>
    );
  }

  if (
    step ===
    "Cross-check that the conditions, demographics, and ZIP3 printed in the PDF and XLSX match what you entered in steps 2–4"
  ) {
    return (
      <span className={className}>
        Cross-check that what you entered in steps 2–4 matches the PDF and XLSX:
        {renderSublist([
          "Conditions printed in the PDF and XLSX match what you entered.",
          "Demographics printed in the PDF and XLSX match what you entered.",
          "ZIP3 printed in the PDF and XLSX matches what you entered.",
        ])}
      </span>
    );
  }

  return <span className={className}>{step}</span>;
}

const SPRINT_HEADER_ESTIMATE = 64;
const TEST_CARD_ESTIMATE_MIN = 520;
const VIRTUAL_LIST_GAP = 12;
/** Progress hint row shown once any step is checked or status is in progress. */
const TEST_CARD_INCOMPLETE_HINT = 24;

function estimateTestCardHeight(test: TestCase): number {
  let substeps = 0;
  for (let i = 0; i < test.steps.length; i++) {
    substeps += getStepSubstepKeys(test.steps[i] ?? "", i).length;
  }
  // Header badges/buttons, touch-sized rows, expected column, and status hints.
  return Math.max(
    TEST_CARD_ESTIMATE_MIN,
    300 +
      test.steps.length * 40 +
      substeps * 34 +
      (test.preconditions ? 24 : 0) +
      (test.steps.length > 0 ? TEST_CARD_INCOMPLETE_HINT : 0),
  );
}

type VirtualListRow =
  | { kind: "header"; sprintId: string; label: string; testCount: number; isActive: boolean }
  | { kind: "card"; test: TestCase };

function VirtualizedTestList({
  sprintGroups,
  collapsedSprints,
  onToggleCollapsedSprint,
  scrollToTestId,
  onScrollToTestHandled,
  getStatus,
  qaNotes,
  devNotes,
  savedQaNotes,
  savedDevNotes,
  qaNoteMeta,
  devNoteMeta,
  severities,
  effPrimaryOwner,
  effDevOwner,
  effSprint,
  selected,
  qaOwnerOptionList,
  onCardToggleSelect,
  onCardStatusChange,
  onCardEngage,
  onCardPinEngage,
  onCardChecksBaseline,
  onCardStepChecksChange,
  onCardQaNoteChange,
  onCardDevNoteChange,
  onCardSeverityChange,
  onCardAssigneeChange,
  onCardDevAssigneeChange,
  onCardSprintChange,
  isAdmin,
  restrictAssigneeTo,
  canEditTests,
  canDuplicate,
  onCardEdit,
  onCardDuplicate,
  hasTestChanges,
  isTestEngaged,
  onCardSave,
  onCardPendingQaAttachment,
  onCardPendingDevAttachment,
  canSaveToCloud,
  multiTestPending,
  saveBlockReason,
  checksResetEpoch,
  savedCheckedSteps,
}: {
  sprintGroups: { sprintId: string; tests: TestCase[] }[];
  collapsedSprints: Set<string>;
  onToggleCollapsedSprint: (id: string) => void;
  scrollToTestId: string | null;
  onScrollToTestHandled: () => void;
  getStatus: (id: string) => TestStatus;
  qaNotes: Record<string, string>;
  devNotes: Record<string, string>;
  savedQaNotes: Record<string, string>;
  savedDevNotes: Record<string, string>;
  qaNoteMeta: Record<string, NoteMeta>;
  devNoteMeta: Record<string, NoteMeta>;
  severities: Record<string, FailSeverity | "">;
  effPrimaryOwner: (t: TestCase) => string;
  effDevOwner: (t: TestCase) => string;
  effSprint: (t: TestCase) => string;
  selected: Set<string>;
  qaOwnerOptionList: AssigneeOption[];
  onCardToggleSelect: (id: string) => void;
  onCardStatusChange: (id: string, s: TestStatus) => void;
  onCardEngage: (id: string) => void;
  onCardPinEngage: (id: string) => void;
  onCardChecksBaseline: (id: string, checked: CheckedSteps) => void;
  onCardStepChecksChange: (id: string, checked: CheckedSteps) => void;
  onCardQaNoteChange: (id: string, n: string) => void;
  onCardDevNoteChange: (id: string, n: string) => void;
  onCardSeverityChange: (id: string, s: FailSeverity | "") => void;
  onCardAssigneeChange: (id: string, o: string) => void;
  onCardDevAssigneeChange: (id: string, o: string) => void;
  onCardSprintChange: (id: string, s: string) => void;
  isAdmin: boolean;
  restrictAssigneeTo?: string[];
  canEditTests: boolean;
  canDuplicate: boolean;
  onCardEdit: (id: string) => void;
  onCardDuplicate: (id: string) => void;
  hasTestChanges: (id: string) => boolean;
  isTestEngaged: (id: string) => boolean;
  onCardSave: (id: string) => void | Promise<void>;
  onCardPendingQaAttachment: (id: string, file: File | null) => void;
  onCardPendingDevAttachment: (id: string, file: File | null) => void;
  canSaveToCloud: boolean;
  multiTestPending: boolean;
  saveBlockReason?: string;
  checksResetEpoch: number;
  savedCheckedSteps: Record<string, CheckedSteps>;
}) {
  const devOwnerOptions: AssigneeOption[] = [
    { name: "Unassigned", selectable: true },
    { name: "Eng", selectable: true },
  ];
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const rows = useMemo(() => {
    const out: VirtualListRow[] = [];
    for (const { sprintId, tests } of sprintGroups) {
      const sprintMeta = SPRINTS.find((s) => s.id === sprintId);
      const label = sprintMeta
        ? sprintMeta.id === BACKLOG_SPRINT_ID
          ? "Backlog"
          : `Sprint ${sprintMeta.number} · ${sprintMeta.name}`
        : "Unassigned";
      out.push({
        kind: "header",
        sprintId,
        label,
        testCount: tests.length,
        isActive: sprintId === ACTIVE_SPRINT_ID,
      });
      if (!collapsedSprints.has(sprintId)) {
        for (const t of tests) {
          out.push({ kind: "card", test: t });
        }
      }
    }
    return out;
  }, [sprintGroups, collapsedSprints]);

  const testIdToIndex = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((row, i) => {
      if (row.kind === "card") m.set(row.test.id, i);
    });
    return m;
  }, [rows]);

  useLayoutEffect(() => {
    const update = () => setScrollMargin(listRef.current?.offsetTop ?? 0);
    update();
    window.addEventListener("resize", update);
    const parent = listRef.current?.parentElement;
    const ro = typeof ResizeObserver !== "undefined" && parent ? new ResizeObserver(update) : null;
    if (ro && parent) ro.observe(parent);
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [rows.length, collapsedSprints]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (index) => {
      const row = rows[index];
      if (!row || row.kind === "header") return SPRINT_HEADER_ESTIMATE;
      return estimateTestCardHeight(row.test);
    },
    getItemKey: (index) => {
      const row = rows[index];
      if (!row) return String(index);
      return row.kind === "header" ? `h-${row.sprintId}` : row.test.id;
    },
    gap: VIRTUAL_LIST_GAP,
    overscan: 4,
    scrollMargin,
  });

  useLayoutEffect(() => {
    // Only remeasure when the row list structure changes — not on every step
    // check or engagement, which was shifting rows and hiding step content.
    virtualizer.measure();
  }, [virtualizer, rows.length, collapsedSprints]);

  useEffect(() => {
    if (!scrollToTestId) return;
    const idx = testIdToIndex.get(scrollToTestId);
    if (idx == null) {
      onScrollToTestHandled();
      return;
    }
    virtualizer.scrollToIndex(idx, { align: "center", behavior: "smooth" });
    const focusTimer = window.setTimeout(() => {
      document.getElementById(`test-row-${scrollToTestId}`)?.focus({ preventScroll: true });
      onScrollToTestHandled();
    }, 350);
    return () => window.clearTimeout(focusTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToTestId, testIdToIndex, rows.length]);

  return (
    <div ref={listRef}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;
          const engaged = row.kind === "card" && isTestEngaged(row.test.id);
          const rowZIndex =
            row.kind === "header" ? 10 : engaged ? 8 : 1;
          return (
            <div
              key={row.kind === "header" ? `h-${row.sprintId}` : row.test.id}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className="bg-background isolate [backface-visibility:hidden]"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                zIndex: rowZIndex,
                // Opaque fill for the virtualizer gap so recycled rows don't bleed through.
                paddingBottom: VIRTUAL_LIST_GAP,
              }}
            >
              {row.kind === "header" ? (
                <Card
                  className="p-4 sm:p-3 bg-muted hover:bg-muted cursor-pointer border-2 select-none touch-manipulation active:scale-[0.98] transition-transform min-h-[48px] shadow-sm relative"
                  onClick={() => onToggleCollapsedSprint(row.sprintId)}
                  role="button"
                  aria-expanded={!collapsedSprints.has(row.sprintId)}
                  aria-label={`${row.label} — ${row.testCount} test${row.testCount === 1 ? "" : "s"}`}
                >
                  <div className="flex items-center gap-3 font-semibold text-sm">
                    <ChevronRight
                      className={`h-5 w-5 sm:h-4 sm:w-4 transition-transform ${!collapsedSprints.has(row.sprintId) ? "rotate-90" : ""}`}
                    />
                    <span>{row.label}</span>
                    {row.isActive && (
                      <Badge variant="outline" className="border-primary/60 text-primary">
                        Current
                      </Badge>
                    )}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      {row.testCount} test{row.testCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </Card>
              ) : (
                <TestCaseCard
                  t={row.test}
                  status={getStatus(row.test.id)}
                  qaNote={qaNotes[row.test.id] ?? ""}
                  devNote={devNotes[row.test.id] ?? ""}
                  savedQaNote={savedQaNotes[row.test.id] ?? ""}
                  savedDevNote={savedDevNotes[row.test.id] ?? ""}
                  qaNoteMeta={qaNoteMeta[row.test.id]}
                  devNoteMeta={devNoteMeta[row.test.id]}
                  severity={severities[row.test.id] ?? ""}
                  assignee={effPrimaryOwner(row.test)}
                  devAssignee={effDevOwner(row.test)}
                  sprintId={effSprint(row.test)}
                  selected={selected.has(row.test.id)}
                  qaOwnerOptions={qaOwnerOptionList}
                  devOwnerOptions={devOwnerOptions}
                  onToggleSelect={onCardToggleSelect}
                  onStatusChange={onCardStatusChange}
                  onEngage={onCardEngage}
                  onPinEngage={onCardPinEngage}
                  savedCheckedBaseline={savedCheckedSteps[row.test.id]}
                  onChecksBaseline={onCardChecksBaseline}
                  onStepChecksChange={onCardStepChecksChange}
                  onQaNoteChange={onCardQaNoteChange}
                  onDevNoteChange={onCardDevNoteChange}
                  onSeverityChange={onCardSeverityChange}
                  onAssigneeChange={onCardAssigneeChange}
                  onDevAssigneeChange={onCardDevAssigneeChange}
                  onSprintChange={onCardSprintChange}
                  isAdmin={isAdmin}
                  assigneeLocked={AUTOMATED_TEST_IDS.has(row.test.id)}
                  restrictAssigneeTo={restrictAssigneeTo}
                  onEdit={canEditTests ? onCardEdit : undefined}
                  onDuplicate={canDuplicate ? onCardDuplicate : undefined}
                  hasChanges={hasTestChanges(row.test.id)}
                  engaged={isTestEngaged(row.test.id)}
                  onSave={onCardSave}
                  onPendingQaAttachment={onCardPendingQaAttachment}
                  onPendingDevAttachment={onCardPendingDevAttachment}
                  canSave={canSaveToCloud}
                  saveBlockReason={saveBlockReason}
                  preferBulkSave={multiTestPending}
                  checksResetEpoch={checksResetEpoch}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Full-card background + border tint — matches StatBadge / status button palette. */
const TEST_STATUS_SURFACE: Record<TestStatus, string> = {
  not_run: "border-border bg-muted/40",
  pass: "border-emerald-500/30 bg-emerald-500/10",
  fail: "border-destructive/30 bg-destructive/10",
  in_progress: "border-amber-500/30 bg-amber-500/10",
  blocked: "border-amber-600/30 bg-amber-500/10",
  fixed_retest: "border-sky-500/30 bg-sky-500/10",
  failed_retest: "border-orange-500/30 bg-orange-500/10",
};

function testCardStatusShade(status: TestStatus): string {
  return TEST_STATUS_SURFACE[status] ?? TEST_STATUS_SURFACE.not_run;
}

const TestCaseCard = memo(function TestCaseCard({
  t,
  status,
  qaNote,
  devNote,
  savedQaNote,
  savedDevNote,
  qaNoteMeta,
  devNoteMeta,
  severity,
  assignee,
  devAssignee,
  sprintId,
  selected,
  qaOwnerOptions,
  devOwnerOptions,
  onToggleSelect,
  onStatusChange,
  onEngage,
  onPinEngage,
  onChecksBaseline,
  onStepChecksChange,
  onQaNoteChange,
  onDevNoteChange,
  onSeverityChange,
  onAssigneeChange,
  onDevAssigneeChange,
  onSprintChange,
  isAdmin,
  onEdit,
  hasChanges,
  engaged,
  onSave,
  onPendingQaAttachment,
  onPendingDevAttachment,
  assigneeLocked,
  preferBulkSave,
  canSave,
  saveBlockReason,
  restrictAssigneeTo,
  onDuplicate,
  checksResetEpoch = 0,
  savedCheckedBaseline,
}: {
  t: TestCase;
  status: TestStatus;
  qaNote: string;
  devNote: string;
  savedQaNote: string;
  savedDevNote: string;
  qaNoteMeta?: NoteMeta;
  devNoteMeta?: NoteMeta;
  severity: FailSeverity | "";
  assignee: string;
  devAssignee: string;
  sprintId: string;
  selected: boolean;
  qaOwnerOptions: AssigneeOption[];
  devOwnerOptions: AssigneeOption[];
  onToggleSelect: (id: string) => void;
  onStatusChange: (id: string, s: TestStatus) => void;
  onEngage?: (id: string) => void;
  /** Pin the test in status filters before status changes can drop it from a filter. */
  onPinEngage?: (id: string) => void;
  onChecksBaseline?: (id: string, checked: CheckedSteps) => void;
  onStepChecksChange?: (id: string, checked: CheckedSteps) => void;
  onQaNoteChange: (id: string, n: string) => void;
  onDevNoteChange: (id: string, n: string) => void;
  onSeverityChange: (id: string, s: FailSeverity | "") => void;
  onAssigneeChange: (id: string, owner: string) => void;
  onDevAssigneeChange: (id: string, owner: string) => void;
  onSprintChange: (id: string, sprintId: string) => void;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  hasChanges?: boolean;
  /** True when the user has interacted with this card since the last row save. */
  engaged?: boolean;
  onSave?: (id: string) => void | Promise<void>;
  onPendingQaAttachment?: (id: string, file: File | null) => void;
  onPendingDevAttachment?: (id: string, file: File | null) => void;
  /** When true, nudge users toward the top-level Save all changes button. */
  preferBulkSave?: boolean;
  /** Whether the current user may persist results to the cloud. */
  canSave?: boolean;
  saveBlockReason?: string;
  /** When true, the Owner select is rendered read-only (used for
   *  auto-discovered Vitest / Playwright tests owned by their runner). */
  assigneeLocked?: boolean;
  /** When set, restricts the Owner select to this list of names (used for
   *  non-admin QA users so they can only claim/release tests for themselves). */
  restrictAssigneeTo?: string[];
  /** Bumped by the parent when drafts are discarded — re-syncs step check UI. */
  checksResetEpoch?: number;
  /** Saved step-check baseline from the parent — skip remount sync when already aligned. */
  savedCheckedBaseline?: CheckedSteps;
}) {
  // Shade the whole card based on status (full background + border tint)
  const shade = testCardStatusShade(status);
  const showQaNote =
    status === "fail" || status === "failed_retest" || status === "in_progress" || !!engaged;
  const isFailStatus = status === "fail" || status === "failed_retest";
  const showDevNote = status === "fixed_retest" || status === "failed_retest";
  const confirm = useConfirm();
  // Per-step execution checkboxes — persisted locally so the tester can
  // resume where they left off. Marking "Pass" requires every step checked.
  const stepsKey = `qa-step-checks:${t.id}`;
  const userEditedChecks = useRef(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(stepsKey);
      return raw ? new Set<number>(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  // Per-substep execution checkboxes (e.g. "2a", "2b"). Stored as `${stepIdx}-${subIdx}` keys.
  const substepsKey = `qa-substep-checks:${t.id}`;
  const [checkedSubsteps, setCheckedSubsteps] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(substepsKey);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  // Hydrate checked-step state from the cloud so every viewer sees what QA ticked.
  const toCheckedPayload = (steps: Set<number>, subs: Set<string>): CheckedSteps => ({
    steps: Array.from(steps).sort((a, b) => a - b),
    substeps: Array.from(subs).sort(),
  });

  const publishChecksBaseline = (steps: Set<number>, subs: Set<string>) => {
    const payload = toCheckedPayload(steps, subs);
    const saved = savedCheckedBaseline ?? { steps: [], substeps: [] };
    if (checkedStepsEqual(payload, saved)) return;
    onChecksBaseline?.(t.id, payload);
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stepsRaw = window.localStorage.getItem(stepsKey);
      const subsRaw = window.localStorage.getItem(substepsKey);
      const steps = stepsRaw ? new Set<number>(JSON.parse(stepsRaw)) : new Set<number>();
      const subs = subsRaw ? new Set<string>(JSON.parse(subsRaw)) : new Set<string>();
      if (steps.size === 0 && subs.size === 0) return;
      setCheckedSteps(steps);
      setCheckedSubsteps(subs);
      publishChecksBaseline(steps, subs);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.id, savedCheckedBaseline]);

  useEffect(() => {
    let cancelled = false;
    // Preserve local step edits across Strict Mode remounts and virtual-list recycle.
    try {
      const rawSteps = window.localStorage.getItem(stepsKey);
      const rawSubs = window.localStorage.getItem(substepsKey);
      const localSteps: number[] = rawSteps ? JSON.parse(rawSteps) : [];
      const localSubs: string[] = rawSubs ? JSON.parse(rawSubs) : [];
      if (localSteps.length > 0 || localSubs.length > 0) {
        userEditedChecks.current = true;
      }
    } catch {
      /* ignore */
    }
    const run = async () => {
      const remote = await cloudFetchCheckedSteps(t.id);
      if (cancelled || userEditedChecks.current) return;
      const remoteEmpty = !remote || (remote.steps.length === 0 && remote.substeps.length === 0);
      if (remoteEmpty) {
        return;
      }
      const steps = new Set<number>(remote.steps);
      const subs = new Set<string>(remote.substeps);
      setCheckedSteps(steps);
      setCheckedSubsteps(subs);
      try {
        window.localStorage.setItem(stepsKey, JSON.stringify(Array.from(steps)));
        window.localStorage.setItem(substepsKey, JSON.stringify(Array.from(subs)));
      } catch {
        /* ignore */
      }
      publishChecksBaseline(steps, subs);
    };
    const cancelSchedule = scheduleIdleWork(() => {
      void run();
    }, 4000);
    return () => {
      cancelled = true;
      cancelSchedule();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.id]);

  useEffect(() => {
    if (checksResetEpoch === 0) return;
    userEditedChecks.current = false;
    try {
      const rawSteps = window.localStorage.getItem(stepsKey);
      const rawSubs = window.localStorage.getItem(substepsKey);
      setCheckedSteps(rawSteps ? new Set<number>(JSON.parse(rawSteps)) : new Set());
      setCheckedSubsteps(rawSubs ? new Set<string>(JSON.parse(rawSubs)) : new Set());
    } catch {
      setCheckedSteps(new Set());
      setCheckedSubsteps(new Set());
    }
  }, [checksResetEpoch, stepsKey, substepsKey]);

  const persistChecks = (steps: Set<number>, subs: Set<string>) => {
    userEditedChecks.current = true;
    setCheckedSteps(steps);
    setCheckedSubsteps(subs);
    try {
      window.localStorage.setItem(stepsKey, JSON.stringify(Array.from(steps)));
      window.localStorage.setItem(substepsKey, JSON.stringify(Array.from(subs)));
    } catch {
      /* ignore */
    }
    onStepChecksChange?.(t.id, toCheckedPayload(steps, subs));

    const hasAnyCheck = steps.size > 0 || subs.size > 0;
    if (!hasAnyCheck) return;

    // Pin in status filters so a later status change cannot drop the card
    // while the tester is still checking steps (notably with a "Not run" filter).
    onPinEngage?.(t.id);
  };

  const touchTest = () => {
    onEngage?.(t.id);
  };

  const handleCardEngage = (e: React.MouseEvent) => {
    if (isInteractiveTestClick(e.target)) return;
    touchTest();
  };

  const toggleStep = (i: number) => {
    const stepText = t.steps[i] ?? "";
    const subKeys = getStepSubstepKeys(stepText, i);
    const nextSteps = new Set(checkedSteps);
    const nextSubs = new Set(checkedSubsteps);

    if (nextSteps.has(i)) {
      nextSteps.delete(i);
      for (const k of subKeys) nextSubs.delete(k);
      if (status === "pass") {
        onStatusChange(t.id, "in_progress");
      }
    } else {
      nextSteps.add(i);
      for (const k of subKeys) nextSubs.add(k);
    }
    persistChecks(nextSteps, nextSubs);
  };

  const toggleSubstep = (key: string) => {
    const stepIndex = Number(key.split("-")[0]);
    const nextSubs = new Set(checkedSubsteps);
    const nextSubsHadKey = nextSubs.has(key);
    if (nextSubsHadKey) nextSubs.delete(key);
    else nextSubs.add(key);

    const nextSteps = syncParentStepCheck(
      stepIndex,
      nextSubs,
      checkedSteps,
      t.steps[stepIndex] ?? "",
    );
    if (nextSubsHadKey && status === "pass") {
      onStatusChange(t.id, "in_progress");
    }
    persistChecks(nextSteps, nextSubs);
  };
  const allStepsChecked = t.steps.length === 0 || t.steps.every((_, i) => checkedSteps.has(i));
  const showIncompleteStepsHint =
    !allStepsChecked &&
    (status === "in_progress" ||
      status === "pass" ||
      checkedSteps.size > 0 ||
      checkedSubsteps.size > 0);

  const saveEmphasized = hasChanges || engaged;
  const bulkSaveNudge = preferBulkSave && hasChanges;
  const showGreenSave = hasChanges || (saveEmphasized && !bulkSaveNudge);

  // Which step failed — required whenever the tester records a Fail.
  const failedStepKey = `qa-failed-step:${t.id}`;
  const [failedStep, setFailedStep] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(failedStepKey) ?? "";
    } catch {
      return "";
    }
  });
  const persistFailedStep = (v: string) => {
    touchTest();
    setFailedStep(v);
    try {
      if (v) window.localStorage.setItem(failedStepKey, v);
      else window.localStorage.removeItem(failedStepKey);
    } catch {
      /* ignore */
    }
  };
  // When the tester picks Fail / Failed-Retest we pop a modal that forces
  // a note + which step failed. Screenshot is optional. The status flip
  // is only applied after the modal is satisfied.
  const { user: cardUser } = useApp();
  const [pendingFail, setPendingFail] = useState<TestStatus | null>(null);
  const [pendingPass, setPendingPass] = useState(false);
  const [evidenceRefresh, setEvidenceRefresh] = useState(0);
  const bumpEvidence = () => setEvidenceRefresh((n) => n + 1);
  const [qaPendingAttachmentName, setQaPendingAttachmentName] = useState<string | null>(null);
  const [devPendingAttachmentName, setDevPendingAttachmentName] = useState<string | null>(null);
  const handleQaAttachment = (file: File | null) => {
    setQaPendingAttachmentName(file?.name ?? null);
    onPendingQaAttachment?.(t.id, file);
    if (file) touchTest();
  };
  const handleDevAttachment = (file: File | null) => {
    setDevPendingAttachmentName(file?.name ?? null);
    onPendingDevAttachment?.(t.id, file);
    if (file) touchTest();
  };
  const clearPendingAttachmentLabels = () => {
    setQaPendingAttachmentName(null);
    setDevPendingAttachmentName(null);
  };
  const [pendingStatus, setPendingStatus] = useState<TestStatus | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesInitialKind, setNotesInitialKind] = useState<NoteKind>("qa");
  const openNotes = (k: NoteKind = "qa") => {
    touchTest();
    setNotesInitialKind(k);
    setNotesOpen(true);
  };
  const handleStatusChange = async (s: TestStatus) => {
    touchTest();
    if (s === "pass" && !allStepsChecked) {
      await confirm({
        title: `Steps not complete for ${t.id}`,
        description:
          `All test steps must be completed to pass this test. Please go back and check all the boxes for saving the passed test.`,
        confirmLabel: "OK",
        cancelLabel: "Go Back",
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
    if (s !== status) {
      setPendingStatus(s);
      return;
    }
    onStatusChange(t.id, s);
  };
  return (
    <div
      id={`test-row-${t.id}`}
      tabIndex={-1}
      onClick={handleCardEngage}
      className={cn(
        "rounded-xl border shadow p-4 cursor-pointer text-card-foreground",
        shade,
        selected && "ring-2 ring-primary/60",
      )}
    >
      <div className="flex flex-wrap items-start gap-2 mb-2 relative z-10">
        <div data-no-auto-start>
          <TouchCheckbox
            checked={selected}
            onChange={() => onToggleSelect(t.id)}
            title="Select for bulk edit"
            aria-label={`Select ${t.id} for bulk edit`}
          />
        </div>
        <span className="text-[11px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{t.id}</span>
        <span
          className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 ${priorityVariant(t.priority)}`}
          title={PRIORITY_LABELS[t.priority]}
        >
          {PRIORITY_SHORT[t.priority]}
        </span>
        <Badge variant="secondary" className="text-[11px]">
          {t.area}
        </Badge>
        <label className="inline-flex items-center gap-1 text-[11px] rounded-full border border-border px-2 py-0.5 bg-background">
          <span className="font-semibold">Sprint:</span>
          <select
            className="bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer"
            value={sprintId}
            onChange={(e) => {
              touchTest();
              onSprintChange(t.id, e.target.value);
            }}
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
          <span className="font-semibold">QA Owner:</span>
          <select
            className="bg-transparent text-[11px] font-semibold text-primary focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-90"
            value={assignee}
            onChange={(e) => {
              onAssigneeChange(t.id, e.target.value);
            }}
            disabled={assigneeLocked || (restrictAssigneeTo && restrictAssigneeTo.length <= 1)}
            title={
              assigneeLocked
                ? "Owned by the automated test runner"
                : restrictAssigneeTo
                  ? "QA users can only claim tests for themselves or release them as Unassigned"
                  : "Assign a QA owner for this test"
            }
          >
            {(() => {
              const base: AssigneeOption[] = assigneeLocked
                ? [{ name: assignee, selectable: true }]
                : restrictAssigneeTo
                  ? restrictAssigneeTo.map((name) => ({ name, selectable: true }))
                  : qaOwnerOptions;
              const opts =
                assignee && !base.some((o) => o.name === assignee)
                  ? [{ name: assignee, selectable: true }, ...base]
                  : base;
              return opts.map((o) => (
                <option key={o.name} value={o.name} disabled={!o.selectable}>
                  {formatAssigneeOptionLabel(o)}
                </option>
              ));
            })()}
          </select>
        </label>
        <label className="inline-flex items-center gap-1 text-[11px] rounded-full border border-sky-500/40 text-sky-700 px-2 py-0.5 bg-background">
          <span className="font-semibold">Dev Owner:</span>
          <select
            className="bg-transparent text-[11px] font-semibold text-sky-700 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-90"
            value={devAssignee || "Unassigned"}
            onChange={(e) => {
              onDevAssigneeChange(t.id, e.target.value === "Unassigned" ? "" : e.target.value);
            }}
            disabled={!isAdmin || assigneeLocked}
            title={
              !isAdmin
                ? "Only admins can change the dev owner"
                : assigneeLocked
                  ? "Owned by the automated test runner"
                  : "Assign a dev owner for this test"
            }
          >
            {(() => {
              const base = devOwnerOptions;
              const current = devAssignee || "Unassigned";
              const opts =
                current && !base.some((o) => o.name === current)
                  ? [{ name: current, selectable: true }, ...base]
                  : base;
              return opts.map((o) => (
                <option key={o.name} value={o.name} disabled={!o.selectable}>
                  {formatAssigneeOptionLabel(o)}
                </option>
              ));
            })()}
          </select>
        </label>
        <Badge
          variant="outline"
          className="text-[11px] border-emerald-500/40 text-emerald-700 bg-emerald-500/5"
        >
          +{getTestCreditReward(t)} cr
        </Badge>
        <h3 className="flex-1 font-semibold text-sm md:text-base">
          <TestTitleLink test={t} onOpen={touchTest}>
            {t.title}
          </TestTitleLink>
        </h3>
        {onEdit && (
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 px-3 text-xs border-primary/60 text-primary hover:bg-primary/10 touch-manipulation"
            onClick={() => {
              touchTest();
              onEdit(t.id);
            }}
            title="Edit test description and steps"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit test
          </Button>
        )}
        {isAdmin && assigneeLocked && <RunAutomatedButton t={t} />}
        {onDuplicate && (
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 px-3 text-xs touch-manipulation"
            onClick={() => {
              touchTest();
              onDuplicate(t.id);
            }}
            title="Duplicate this test for additional coverage"
          >
            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
          </Button>
        )}
        <StatusButtons status={status} onChange={handleStatusChange} />
        <Button
          size="sm"
          variant="outline"
          className="min-h-11 px-3 text-xs touch-manipulation"
          onClick={() => openNotes("qa")}
          title="View / add notes for this test"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Notes
        </Button>
        <Button
          size="sm"
          variant={showGreenSave ? "default" : "outline"}
          className={cn(
            "min-h-11 px-3 text-xs touch-manipulation",
            showGreenSave && hasChanges && "animate-pulse",
            showGreenSave && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
          )}
          onClick={async () => {
            await onSave?.(t.id);
            clearPendingAttachmentLabels();
            bumpEvidence();
          }}
          disabled={canSave === false || !onSave}
          title={
            canSave === false
              ? (saveBlockReason ?? "Sign in to save")
              : bulkSaveNudge
                ? "Save this test only — or use Save all changes at the top"
                : status === "pass" && !hasChanges
                  ? "Save this pass result to the cloud"
                  : engaged && !hasChanges
                    ? "You've started this test — save when ready"
                    : "Save this test to the cloud"
          }
        >
          <Save className="h-3.5 w-3.5 mr-1" /> Save
        </Button>
      </div>
      <div className="mb-2 -mt-1">
        <TestTargetLink test={t} onOpen={touchTest} />
      </div>
      {t.preconditions && (
        <p className="text-xs text-muted-foreground mb-1.5">
          <span className="font-semibold">Preconditions:</span> {t.preconditions}
        </p>
      )}
      <div
        className="grid md:grid-cols-2 gap-3 text-xs"
        data-no-auto-start
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div>
          <div className="font-semibold text-foreground mb-1">Steps</div>
          <ol className="space-y-1 text-muted-foreground relative isolate">
            {t.steps.map((s, i) => {
              const isChecked = checkedSteps.has(i);
              const hasSubsteps = getStepSubstepKeys(s, i).length > 0;
              const checkedClass = isChecked ? "line-through opacity-70" : "";
              const stepNumber = (
                <span className="font-mono text-[10px] mr-1 opacity-70">{i + 1}.</span>
              );

              if (!hasSubsteps) {
                return (
                  <li key={i} className="touch-manipulation relative z-10">
                    <TouchCheckboxField
                      checked={isChecked}
                      onChange={() => toggleStep(i)}
                      title="Check when this step is complete"
                      aria-label={`Mark step ${i + 1} complete`}
                      className="-mx-1"
                    >
                      <span className={checkedClass}>
                        {stepNumber}
                        {s}
                      </span>
                    </TouchCheckboxField>
                  </li>
                );
              }

              return (
                <li
                  key={i}
                  className="grid grid-cols-[2.75rem_1fr] gap-x-1 gap-y-0 items-start touch-manipulation relative z-10"
                >
                  <div className="pt-0.5">
                    <TouchCheckbox
                      checked={isChecked}
                      onChange={() => toggleStep(i)}
                      title="Check when all sub-steps for this step are complete"
                      aria-label={`Mark step ${i + 1} complete`}
                      className="-ml-1"
                    />
                  </div>
                  <div className={`min-w-0 pt-2 ${checkedClass}`}>
                    {stepNumber}
                    <StepWithSublist
                      step={s}
                      stepIndex={i}
                      checkedSubsteps={checkedSubsteps}
                      onToggleSubstep={toggleSubstep}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
          {t.steps.length > 0 && (
            <p
              className={`mt-1.5 text-[10px] font-semibold ${
                allStepsChecked
                  ? "text-emerald-700"
                  : showIncompleteStepsHint
                    ? "text-amber-700"
                    : "text-muted-foreground"
              }`}
            >
              {checkedSteps.size}/{t.steps.length} steps checked
              {showIncompleteStepsHint && " — required before Pass"}
            </p>
          )}
        </div>
        <div>
          <div className="font-semibold text-foreground mb-1">Expected result</div>
          <p className="text-muted-foreground">{t.expected}</p>
          {t.notes && <p className="text-muted-foreground mt-2 italic">Note: {t.notes}</p>}
        </div>
      </div>
      {(showQaNote || showDevNote || qaNote || devNote || savedQaNote || savedDevNote) && (
        <div className="mt-3 space-y-2">
          {(showQaNote || qaNote || savedQaNote) && (
            <div>
              <InlineTestNote
                label={
                  <>
                    {isFailStatus ? "QA failure reason" : "QA note"}
                    {isFailStatus && <span className="opacity-70"> (required when failing)</span>}
                    {!isFailStatus && status === "in_progress" && (
                      <span className="opacity-70"> (optional — observations while testing)</span>
                    )}
                  </>
                }
                labelClassName={`text-[11px] font-semibold ${isFailStatus ? "text-destructive" : "text-foreground"}`}
                headerExtra={
                  isFailStatus ? (
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Severity
                      </span>
                      {(Object.keys(FAIL_SEVERITY_LABELS) as FailSeverity[]).map((s) => {
                        const active = severity === s;
                        const tone =
                          s === "severe"
                            ? active
                              ? "bg-red-950 text-white border-red-950"
                              : "border-red-700/60 text-red-800 hover:bg-red-950/10"
                            : s === "high"
                              ? active
                                ? "bg-destructive text-destructive-foreground border-destructive"
                                : "border-destructive/40 text-destructive hover:bg-destructive/10"
                              : s === "medium"
                                ? active
                                  ? "bg-amber-500 text-white border-amber-500"
                                  : "border-amber-500/40 text-amber-700 hover:bg-amber-500/10"
                                : active
                                  ? "bg-sky-500 text-white border-sky-500"
                                  : "border-sky-500/40 text-sky-700 hover:bg-sky-500/10";
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              touchTest();
                              onSeverityChange(t.id, active ? "" : s);
                            }}
                            className={`text-[11px] font-semibold rounded-full border px-3 py-2 min-h-11 touch-manipulation transition ${tone}`}
                            title={FAIL_SEVERITY_LABELS[s]}
                          >
                            {FAIL_SEVERITY_LABELS[s]}
                          </button>
                        );
                      })}
                    </div>
                  ) : undefined
                }
                middle={
                  isFailStatus ? (
                    <>
                      {!severity && (
                        <p className="text-[10px] text-destructive mb-1">
                          Pick a severity before saving this failure.
                        </p>
                      )}
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
                            <option key={i} value={String(i + 1)}>
                              Step {i + 1}
                            </option>
                          ))}
                        </select>
                        {!failedStep && (
                          <span className="text-[10px] text-destructive">
                            Required — indicate the step that failed.
                          </span>
                        )}
                      </div>
                    </>
                  ) : undefined
                }
                savedText={savedQaNote}
                draftText={qaNote}
                meta={qaNoteMeta}
                currentUserId={cardUser?.id ?? null}
                testId={t.id}
                userId={cardUser?.id ?? null}
                pendingAttachmentName={qaPendingAttachmentName}
                onAttachmentChange={handleQaAttachment}
                onOpenHistory={() => openNotes("qa")}
                onChange={(v) => {
                  touchTest();
                  onQaNoteChange(t.id, v);
                }}
                placeholder={
                  isFailStatus
                    ? "Describe what went wrong at the selected step — browser/device, what you saw vs. expected, screenshot link…"
                    : status === "in_progress"
                      ? "Observations while testing — device/browser, partial results, questions…"
                      : "Add a note about this test pass — observations, caveats, device/browser used…"
                }
                rows={5}
                textareaClassName={`w-full text-xs rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 ${isFailStatus ? "border-destructive/40 bg-destructive/5 focus:ring-destructive/30" : "border-border bg-muted/30 focus:ring-primary/20"}`}
              />
            </div>
          )}
          {(showDevNote || devNote || savedDevNote) && (
            <InlineTestNote
              label="Dev retest note"
              labelClassName="text-[11px] font-semibold text-sky-700"
              savedText={savedDevNote}
              draftText={devNote}
              meta={devNoteMeta}
              currentUserId={cardUser?.id ?? null}
              testId={t.id}
              userId={cardUser?.id ?? null}
              pendingAttachmentName={devPendingAttachmentName}
              onAttachmentChange={handleDevAttachment}
              onOpenHistory={() => openNotes("dev")}
              onChange={(v) => {
                touchTest();
                onDevNoteChange(t.id, v);
              }}
              placeholder="What was changed, what to retest, commit / PR reference…"
              textareaClassName="w-full text-xs rounded-md border border-sky-500/40 bg-sky-500/5 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              historyKind="dev"
            />
          )}
        </div>
      )}
      <TestEvidence testId={t.id} refreshToken={evidenceRefresh} />
      <FailDetailsDialog
        open={pendingFail != null}
        onOpenChange={(v) => {
          if (!v) setPendingFail(null);
        }}
        test={t}
        initialNote={qaNote}
        initialStep={failedStep}
        userId={cardUser?.id ?? null}
        onConfirm={async ({ note, stepLabel, stepIndex, file }) => {
          const s = pendingFail;
          if (!s) return;
          touchTest();
          if (file) handleQaAttachment(file);
          persistFailedStep(String(stepIndex + 1));
          onQaNoteChange(t.id, formatFailNote(qaNote, { note, stepLabel, noScreenshot: !file }));
          onStatusChange(t.id, s);
          setPendingFail(null);
        }}
      />
      <PassNoteDialog
        open={pendingPass}
        onOpenChange={(v) => {
          if (!v) setPendingPass(false);
        }}
        testId={t.id}
        userId={cardUser?.id ?? null}
        initialNote={qaNote}
        onConfirm={async (note, file) => {
          if (file) handleQaAttachment(file);
          touchTest();
          const finalNote =
            note.trim() ||
            (file ? `Attachment: ${file.name}` : note);
          onQaNoteChange(t.id, finalNote);
          onStatusChange(t.id, "pass");
          setPendingPass(false);
        }}
      />
      <StatusNoteDialog
        open={pendingStatus != null}
        onOpenChange={(v) => {
          if (!v) setPendingStatus(null);
        }}
        testId={t.id}
        userId={cardUser?.id ?? null}
        status={pendingStatus ?? "not_run"}
        initialNote={qaNote}
        onConfirm={async (note, file) => {
          const s = pendingStatus;
          if (!s) return;
          if (file) handleQaAttachment(file);
          touchTest();
          const finalNote = file && !note.trim() ? `Attachment: ${file.name}` : note;
          if (finalNote && finalNote !== qaNote) onQaNoteChange(t.id, finalNote);
          onStatusChange(t.id, s);
          setPendingStatus(null);
        }}
      />
      <NoteThreadDialog
        open={notesOpen}
        onOpenChange={setNotesOpen}
        testId={t.id}
        testTitle={t.title}
        currentUserId={cardUser?.id ?? null}
        initialKind={notesInitialKind}
        onEvidenceUploaded={bumpEvidence}
      />
    </div>
  );
});

/* =========================== FAIL DETAILS DIALOG =========================== */
/**
 * Forces two pieces of context when a tester records a Fail:
 *   1. A note explaining what went wrong.
 *   2. The 1-based step where the failure was observed.
 * Screenshot upload is optional (Evidence panel or here).
 */
function FailDetailsDialog({
  open,
  onOpenChange,
  test,
  initialNote,
  initialStep,
  userId,
  onConfirm,
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
  }) => void | Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // Reset / hydrate every time the dialog opens for a new failure.
  useEffect(() => {
    if (!open) return;
    setNote(initialNote ?? "");
    const parsed = parseInt(initialStep, 10);
    setStepIndex(Number.isFinite(parsed) && parsed > 0 ? parsed - 1 : null);
    setFile(null);
    setBusy(false);
  }, [open, initialStep, initialNote]);

  const error = validateFailDetails({ note, stepIndex });
  const blockDismiss = note.trim().length > 0 || stepIndex != null || !!file;

  const submit = async () => {
    if (error || stepIndex == null) return;
    setBusy(true);
    try {
      await onConfirm({
        note,
        stepLabel: String(stepIndex + 1),
        stepIndex,
        file,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) onOpenChange(v);
      }}
    >
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Record failure for {test.id}</DialogTitle>
          <DialogDescription>
            Describe what broke and which step failed. Attachment is optional.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <Label className="text-xs font-semibold text-destructive">
              Failure note (required)
            </Label>
            <Textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              placeholder="What did you see? What did you expect? Browser/device, error text…"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-destructive">
              Which step failed? (required)
            </Label>
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
          <NoteAttachmentField
            file={file}
            onFileChange={setFile}
            userId={userId}
            disabled={busy}
          />
          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!!error || busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
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
  open,
  onOpenChange,
  testId,
  userId,
  initialNote,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: string;
  userId: string | null;
  initialNote: string;
  onConfirm: (note: string, file: File | null) => void | Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setNote(initialNote ?? "");
    setFile(null);
    setBusy(false);
  }, [open, initialNote]);
  const hasNote = note.trim().length > 0;
  const blockDismiss = hasNote || !!file;
  const submit = async () => {
    setBusy(true);
    try {
      await onConfirm(note, file);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) onOpenChange(v);
      }}
    >
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Pass {testId}</DialogTitle>
          <DialogDescription>
            Add an optional note about this pass — observations, caveats, device/browser used. Leave
            blank if there's nothing to record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <Label className="text-xs font-semibold text-foreground">QA note (optional)</Label>
            <Textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              placeholder="e.g. Tested on iPhone 15 Safari — passed. Minor visual spacing nit noted but not a fail."
              className="mt-1 text-xs"
            />
          </div>
          <NoteAttachmentField
            file={file}
            onFileChange={setFile}
            userId={userId}
            disabled={busy}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={submit}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1" />
            )}
            {hasNote || file ? "Save Note" : "No Note for this Test - Just Save It"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_LABEL: Record<TestStatus, string> = {
  not_run: "Not run",
  in_progress: "In progress",
  pass: "Pass",
  fail: "Fail",
  blocked: "Blocked",
  fixed_retest: "Fixed / Retest",
  failed_retest: "Failed / Retest",
};

function StatusNoteDialog({
  open,
  onOpenChange,
  testId,
  userId,
  status,
  initialNote,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: string;
  userId: string | null;
  status: TestStatus;
  initialNote: string;
  onConfirm: (note: string, file: File | null) => void | Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setNote(initialNote ?? "");
    setFile(null);
    setWorking(false);
    setBusy(false);
  }, [open, initialNote]);
  const label = STATUS_LABEL[status] ?? status;
  const hasNote = note.trim().length > 0;
  const blockDismiss = (hasNote || !!file) && !working && !busy;
  const submit = async () => {
    setBusy(true);
    try {
      await onConfirm(working ? "Working as expected." : note, working ? null : file);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) onOpenChange(v);
      }}
    >
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            Mark {testId} as {label}
          </DialogTitle>
          <DialogDescription>
            Add a quick comment about this status change, or confirm the test is working as
            expected.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <TouchCheckboxField
            checked={working}
            onChange={(e) => setWorking(e.target.checked)}
            className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 !py-3"
          >
            <span className="text-xs font-semibold text-foreground">
              Working as expected — no note needed
            </span>
          </TouchCheckboxField>
          <div>
            <Label className="text-xs font-semibold text-foreground">Comment (optional)</Label>
            <Textarea
              autoFocus
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (e.target.value.trim()) setWorking(false);
              }}
              rows={6}
              placeholder="What did you observe? Device / browser, repro notes, anything to flag."
              className="mt-1 text-xs"
              disabled={working}
            />
          </div>
          {!working && (
            <NoteAttachmentField
              file={file}
              onFileChange={setFile}
              userId={userId}
              disabled={busy}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="default" onClick={submit} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {working
              ? "Save — Working as expected"
              : hasNote || file
                ? "Save Comment"
                : "Save without comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestEvidence({ testId, refreshToken = 0 }: { testId: string; refreshToken?: number }) {
  const { user } = useApp();
  const confirm = useConfirm();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const canCaptureScreen =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    listTestEvidence(user.id, testId)
      .then((list) => {
        if (!cancelled) setFiles(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, testId, refreshToken]);

  if (!user) return null;

  const onPick = () => fileRef.current?.click();
  const onTakePhoto = () => {
    // iOS Safari can't trigger a system screenshot from a web page (the OS
    // gesture is Side + Volume Up). Prompt QA to capture it, then offer the
    // photo library via the camera input (which on iOS surfaces "Photo
    // Library" alongside "Take Photo").
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      toast.info("Use Side + Volume Up to screenshot, then pick it from Photos.", {
        duration: 6000,
      });
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
      toast.error(
        "Your browser can't capture the screen. Use the Take photo or Upload button instead.",
      );
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
      const ImageCaptureCtor = (
        window as unknown as {
          ImageCapture?: new (t: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> };
        }
      ).ImageCapture;
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
    if (!url) {
      toast.error("Could not open file");
      return;
    }
    window.open(url, "_blank", "noopener");
  };

  const onDelete = async (f: EvidenceFile) => {
    if (
      !(await confirm({
        title: "Delete file?",
        description: `Delete ${f.name}?`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return;
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
          {files.length > 0 && (
            <span className="text-muted-foreground font-normal">· {files.length}</span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={EVIDENCE_ACCEPT_ATTR}
          onChange={onUpload}
        />
        <input
          ref={cameraRef}
          type="file"
          className="hidden"
          accept={EVIDENCE_ACCEPT_ATTR}
          onChange={onUpload}
        />
        <div className="flex gap-1">
          {canCaptureScreen && !isMobile && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={busy}
              onClick={onCaptureScreen}
            >
              {busy ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Paperclip className="h-3 w-3 mr-1" />
              )}
              Capture screen
            </Button>
          )}
          {isMobile && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={busy}
              onClick={onTakePhoto}
            >
              <Upload className="h-3 w-3 mr-1" />
              Choose image
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={busy}
            onClick={onPick}
          >
            {busy ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Upload className="h-3 w-3 mr-1" />
            )}
            Upload
          </Button>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mb-2 leading-snug">
        Required for Fail / Failed-Retest. {EVIDENCE_HELP_TEXT}
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
            <li
              key={f.path}
              className="flex items-center gap-2 text-[11px] rounded-md border border-border bg-muted/30 px-2 py-1"
            >
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

function StatusButtons({
  status,
  onChange,
}: {
  status: TestStatus;
  onChange: (s: TestStatus) => void;
}) {
  const { user } = useApp();
  const isQA = user?.role === "qa";

  const btn = (s: TestStatus, label: string, Icon: React.ElementType, on: string) => (
    <button
      key={s}
      type="button"
      onClick={() => onChange(s)}
      title={label}
      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-md border text-xs font-semibold touch-manipulation transition ${status === s ? on : "bg-background border-input text-muted-foreground hover:bg-muted"}`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  if (isQA) {
    return (
      <div className="flex flex-wrap gap-1">
        {btn(
          "pass",
          "Pass",
          CheckCircle2,
          "bg-emerald-500/15 border-emerald-500/50 text-emerald-700",
        )}
        {btn("fail", "Fail", XCircle, "bg-destructive/15 border-destructive/50 text-destructive")}
        {btn(
          "in_progress",
          "In progress",
          AlertOctagon,
          "bg-amber-500/15 border-amber-500/50 text-amber-700",
        )}
        {btn(
          "blocked",
          "Blocked",
          AlertOctagon,
          "bg-amber-500/15 border-amber-500/50 text-amber-700",
        )}
        {btn("not_run", "Not started", MinusCircle, "bg-muted border-border text-foreground")}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {btn(
        "pass",
        "Pass",
        CheckCircle2,
        "bg-emerald-500/15 border-emerald-500/50 text-emerald-700",
      )}
      {btn("fail", "Fail", XCircle, "bg-destructive/15 border-destructive/50 text-destructive")}
      {btn("fixed_retest", "Fixed/Retest", Wrench, "bg-sky-500/15 border-sky-500/50 text-sky-700")}
      {btn(
        "failed_retest",
        "Failed/Retest",
        RefreshCw,
        "bg-orange-500/15 border-orange-500/50 text-orange-700",
      )}
      {btn(
        "in_progress",
        "In progress",
        AlertOctagon,
        "bg-amber-500/15 border-amber-500/50 text-amber-700",
      )}
      {btn(
        "blocked",
        "Blocked",
        AlertOctagon,
        "bg-amber-500/15 border-amber-500/50 text-amber-700",
      )}
      {btn("not_run", "Reset", MinusCircle, "bg-muted border-border text-foreground")}
    </div>
  );
}

/* ============================ SAVE CHANGES DIALOG ========================== */
type PendingChange = {
  key: string;
  testId: string;
  field:
    | "status"
    | "qaNote"
    | "devNote"
    | "severity"
    | "assignee"
    | "devAssignee"
    | "sprint"
    | "checkedSteps";
  label: string;
  before: string;
  after: string;
};

function SaveChangesDialog({
  open,
  onOpenChange,
  changes,
  onConfirm,
  onDiscardAll,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  changes: PendingChange[];
  onConfirm: (selectedKeys: Set<string>) => void;
  onDiscardAll?: () => void;
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
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  // Group changes by test id for a tidy diff view
  const grouped = useMemo(() => {
    const g: Record<string, PendingChange[]> = {};
    for (const c of changes) (g[c.testId] ||= []).push(c);
    return Object.entries(g);
  }, [changes]);

  const allSelected = changes.length > 0 && picked.size === changes.length;
  const toggleAll = () => setPicked(allSelected ? new Set() : new Set(changes.map((c) => c.key)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review changes before saving</DialogTitle>
          <DialogDescription>
            {changes.length} pending change{changes.length === 1 ? "" : "s"} across {grouped.length}{" "}
            test
            {grouped.length === 1 ? "" : "s"}. Uncheck any row you don't want to save — only the
            checked changes will be written. Unchecked changes stay in your draft.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs border-b border-border pb-2">
          <label className="inline-flex items-center gap-1 font-semibold cursor-pointer touch-manipulation min-h-11">
            <TouchCheckbox
              checked={allSelected}
              onChange={toggleAll}
              aria-label="Select all changes"
            />
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
                    <li key={c.key} className="px-3 py-2 flex items-start gap-1 text-xs">
                      <TouchCheckbox
                        checked={checked}
                        onChange={() => toggle(c.key)}
                        aria-label={`Save ${c.label}`}
                      />
                      <div className="w-20 shrink-0 font-semibold text-foreground">{c.label}</div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="rounded border border-border bg-muted/30 px-2 py-1">
                          <div className="text-[10px] uppercase text-muted-foreground mb-0.5">
                            Before
                          </div>
                          <div className="whitespace-pre-wrap break-words text-muted-foreground">
                            {c.before}
                          </div>
                        </div>
                        <div className="rounded border border-primary/30 bg-primary/5 px-2 py-1">
                          <div className="text-[10px] uppercase text-primary mb-0.5">After</div>
                          <div className="whitespace-pre-wrap break-words text-foreground">
                            {c.after}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {changes.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No pending changes.
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-3">
          {onDiscardAll && (
            <Button
              variant="ghost"
              className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => void onDiscardAll()}
            >
              Discard all
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
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
  // confirmation dialog to open.
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
  const pct = progress.total === 0 ? 100 : testRatePercentValue(progress.done, progress.total);
  const finishing = progress.done >= progress.total;
  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-border bg-background shadow-lg p-3">
      <div className="flex items-center justify-between text-xs font-semibold mb-2">
        <span className="flex items-center gap-1.5">
          {finishing ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          )}
          {finishing ? "Finishing up…" : "Saving to cloud…"}
        </span>
        <span className="font-mono">
          {progress.done} / {progress.total}
        </span>
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
          p.status === "done"
            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
            : p.status === "in_progress"
              ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
              : "bg-muted text-muted-foreground border-border";
        return (
          <Card key={p.name} className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-xs font-mono font-bold text-muted-foreground w-6 pt-0.5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span
                    className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 capitalize ${color}`}
                  >
                    {p.status.replace("_", " ")}
                  </span>
                  {p.shippedOn && (
                    <span className="text-[11px] text-muted-foreground">Shipped {p.shippedOn}</span>
                  )}
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
        const pct = testRatePercentValue(done, s.items.length);
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
                  <p className="text-xs text-muted-foreground">
                    {s.start} → {s.end}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {isBacklog ? "Unassigned tests" : "Progress"}
                </div>
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
                    <Badge variant="secondary" className="text-[10px]">
                      {t.area}
                    </Badge>
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
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {i.type}
                    </Badge>
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
    done: { c: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30", l: "Done" },
    in_progress: { c: "bg-amber-500/10 text-amber-700 border-amber-500/30", l: "WIP" },
    todo: { c: "bg-muted text-muted-foreground border-border", l: "Todo" },
    blocked: { c: "bg-destructive/10 text-destructive border-destructive/30", l: "Blocked" },
  };
  const v = map[status];
  return (
    <span
      className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 w-16 text-center ${v.c}`}
    >
      {v.l}
    </span>
  );
}

/* ========================= EDIT DESCRIPTION DIALOG ========================= */
function EditDescriptionDialog({
  test,
  saveAsTestId,
  open,
  onOpenChange,
  onSaved,
}: {
  test: TestCase | null;
  /** Row id being edited (may be a platform variant); used for save routing. */
  saveAsTestId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [preconditions, setPreconditions] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [expected, setExpected] = useState("");
  const [notes, setNotes] = useState("");
  const [initial, setInitial] = useState({
    title: "",
    preconditions: "",
    stepsText: "",
    expected: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
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

  const onSave = async () => {
    if (!saveAsTestId) return;
    const ov: TestDescriptionOverride = {
      title,
      preconditions,
      steps: stepsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      expected,
      notes,
    };
    setSaving(true);
    try {
      const ok = await saveTestPlanContent(saveAsTestId, ov);
      if (!ok) {
        toast.error("Couldn't save test — check that you're signed in.");
        return;
      }
      toast.success("Test saved to database.");
      await onSaved();
    } catch (e) {
      toast.error((e as Error).message || "Couldn't save test.");
    } finally {
      setSaving(false);
    }
  };

  const onResetToDefault = async () => {
    if (!saveAsTestId || isCustomTestContentId(resolveTestContentId(saveAsTestId))) return;
    if (
      !(await confirm({
        title: "Restore defaults?",
        description: "Clear all edits for this test and restore defaults?",
        confirmLabel: "Restore",
        destructive: true,
      }))
    )
      return;
    setSaving(true);
    try {
      const ok = await clearTestPlanContent(saveAsTestId);
      if (!ok) {
        toast.error("Couldn't restore defaults.");
        return;
      }
      toast.success("Restored default description.");
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const hasOverride =
    !!saveAsTestId &&
    !isCustomTestContentId(resolveTestContentId(saveAsTestId)) &&
    Object.keys(loadDescriptionOverride(saveAsTestId)).length > 0;

  const handleOpenChange = async (v: boolean) => {
    if (!v && isDirty) {
      if (
        !(await confirm({
          title: "Discard changes?",
          description: "You have unsaved changes. Discard them?",
          confirmLabel: "Discard",
          destructive: true,
        }))
      )
        return;
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
            Owner-only. Built-in tests save to test_results; custom tests (CUS-###) save to
            custom_tests.
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
            <Button
              variant="outline"
              onClick={onResetToDefault}
              disabled={saving}
              className="mr-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset to default
            </Button>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!isDirty || saving}
            className={isDirty && !saving ? "ring-2 ring-primary/40 animate-pulse" : ""}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving…" : isDirty ? "Save changes" : "No changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================= TASKS TAB =============================== */
function TasksTab() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "done" | "in_progress" | "todo" | "blocked"
  >("all");
  const filtered = TASKS.filter((t) => statusFilter === "all" || t.status === statusFilter);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {(["all", "todo", "in_progress", "done", "blocked"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
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
              <span
                className={`text-[11px] font-semibold rounded-full border px-2 py-0.5 ${priorityVariant(t.priority)}`}
                title={PRIORITY_LABELS[t.priority]}
              >
                {PRIORITY_SHORT[t.priority]}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {t.area}
              </Badge>
              <span className="flex-1">{t.title}</span>
              {t.notes && <span className="text-xs text-muted-foreground italic">{t.notes}</span>}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              No tasks in this status.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
/* ============================== NEW TEST DIALOG ============================== */
function NewTestDialog({
  open,
  onOpenChange,
  existingIds,
  onCreated,
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
    setArea("");
    setTitle("");
    setPriority("P2");
    setPreconditions("");
    setStepsText("");
    setExpected("");
    setNotes("");
  };

  const submit = async () => {
    if (!title.trim() || !expected.trim()) {
      toast.error("Title and expected result are required");
      return;
    }
    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
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
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Auth, Intake, Voice…"
              />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is being tested?"
            />
          </div>
          <div className="space-y-1">
            <Label>Preconditions</Label>
            <Textarea
              rows={2}
              value={preconditions}
              onChange={(e) => setPreconditions(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Steps * (one per line)</Label>
            <Textarea
              rows={4}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder={"Open /auth\nClick Sign in\n…"}
            />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Creating…" : "Create test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
