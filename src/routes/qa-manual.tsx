import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import {
  BookOpen,
  ArrowLeft,
  Filter,
  LayoutDashboard,
  CheckSquare,
  MessageSquareWarning,
  ListChecks,
  Coins,
  Play,
} from "lucide-react";
import { CREDIT_REWARDS, REPRO_FAIL_BONUS } from "@/lib/test-plan";

export const Route = createFileRoute("/qa-manual")({
  head: () => ({
    meta: [
      { title: "QA Manual — Part B Optimizer Benchmark Tool" },
      {
        name: "description",
        content:
          "Quick reference for QA testers: filters, layout, bulk edits, statuses, the bug pipeline, and credits.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: QAManualPage,
});

function QAManualPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }
    if (user.role !== "qa" && user.role !== "admin") {
      router.navigate({ to: "/" });
    }
  }, [user, authLoading, router]);

  if (!user) return null;

  return (
    <AppShell
      title="QA Manual"
      subtitle="Everything you need to start testing — kept short on purpose."
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" /> Reference guide
          </div>
          <Link to="/testing">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Testing
            </Button>
          </Link>
        </div>

        {/* 1. Page layout */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            1. Page layout
          </h2>
          <p className="text-sm text-muted-foreground">
            The Testing Portal has two tabs you'll use:
          </p>
          <ul className="text-sm space-y-1.5 ml-1">
            <li>
              <b>Test Plan</b> — every test case, grouped by area. This is your daily workspace.
            </li>
            <li>
              <b>Sprints</b> — what's planned for the current and upcoming sprints. Check here to
              know what's in scope this week.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground italic">
            ↳ Tabs are at the top of the page, just under the title.
          </p>
        </Card>

        {/* 2. Execute a test — step by step */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            2. Execute a test — step by step
          </h2>
          <p className="text-sm text-muted-foreground">
            High-level flow for running one scenario test from the Test Plan tab. The numbered
            bubbles in the diagram map to the steps below.
          </p>
          <ol className="text-sm space-y-1.5 ml-4 list-decimal">
            <li>
              <b>Pick a test row.</b> Use the filters to narrow to your queue, then click the row
              title to expand it and read the scenario steps.
            </li>
            <li>
              <b>Run the scenario</b> in the app (or in the linked external link) and observe the
              actual result vs. the expected result.
            </li>
            <li>
              <b>Attach evidence</b> in the Evidence panel — Capture screen, Take photo, or Upload.{" "}
              <span className="text-muted-foreground">Optional but encouraged</span> for <b>Fail</b>{" "}
              or <b>Failed/Retest</b>.
            </li>
            <li>
              <b>Write a note.</b>{" "}
              <span className="text-destructive font-semibold">Required for Fail</span> — the
              failure dialog asks for a note and which step broke. Dev note when handing back from
              Dev.
            </li>
            <li>
              <b>Set the Status</b> from the dropdown — Pass, Fail, Blocked, etc.
            </li>
            <li>
              <b>Click Save</b> on the row, review the confirmation dialog, then confirm to commit
              your changes.
            </li>
          </ol>
          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 900 360"
              className="w-full h-auto"
              role="img"
              aria-label="Numbered test row diagram showing where each execution step happens"
            >
              <defs>
                <marker
                  id="qm-bubble-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
                </marker>
              </defs>
              {/* Mock test row */}
              <g fontFamily="ui-sans-serif, system-ui" fontSize="12" fill="#374151">
                {/* Row background */}
                <rect
                  x="40"
                  y="120"
                  width="820"
                  height="120"
                  rx="10"
                  fill="#f9fafb"
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                />
                {/* Title cell */}
                <rect
                  x="60"
                  y="140"
                  width="280"
                  height="80"
                  rx="6"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                />
                <text x="76" y="166" fontWeight="700" fontSize="13" fill="#111827">
                  SCEN-014 · Drug interaction
                </text>
                <text x="76" y="186" fontSize="11" fill="#6b7280">
                  Expected: warning banner appears
                </text>
                <text x="76" y="204" fontSize="11" fill="#6b7280">
                  Steps: 1) open plan 2) add drug…
                </text>
                {/* Evidence cell */}
                <rect
                  x="355"
                  y="155"
                  width="140"
                  height="50"
                  rx="6"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                />
                <text x="425" y="178" textAnchor="middle" fontWeight="700" fill="#111827">
                  Evidence
                </text>
                <text x="425" y="194" textAnchor="middle" fontSize="11" fill="#6b7280">
                  Capture · Upload
                </text>
                {/* Note cell */}
                <rect
                  x="510"
                  y="155"
                  width="140"
                  height="50"
                  rx="6"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                />
                <text x="580" y="178" textAnchor="middle" fontWeight="700" fill="#111827">
                  QA note
                </text>
                <text x="580" y="194" textAnchor="middle" fontSize="11" fill="#6b7280">
                  what broke…
                </text>
                {/* Status cell */}
                <rect
                  x="665"
                  y="155"
                  width="100"
                  height="50"
                  rx="6"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                />
                <text x="715" y="178" textAnchor="middle" fontWeight="700" fill="#111827">
                  Status ▾
                </text>
                <text x="715" y="194" textAnchor="middle" fontSize="11" fill="#6b7280">
                  Pass / Fail
                </text>
                {/* Save button */}
                <rect x="775" y="160" width="70" height="40" rx="8" fill="#002870" />
                <text x="810" y="184" textAnchor="middle" fontWeight="800" fill="#ffffff">
                  Save
                </text>

                {/* Bubbles */}
                <g fontWeight="800" fontSize="14" fill="#ffffff" textAnchor="middle">
                  {/* 1 — Pick test (title) */}
                  <circle cx="76" cy="140" r="16" fill="#002870" stroke="#ffffff" strokeWidth="2" />
                  <text x="76" y="145">
                    1
                  </text>
                  {/* 2 — Run scenario (steps text) */}
                  <circle
                    cx="200"
                    cy="220"
                    r="16"
                    fill="#002870"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text x="200" y="225">
                    2
                  </text>
                  {/* 3 — Evidence */}
                  <circle
                    cx="425"
                    cy="150"
                    r="16"
                    fill="#002870"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text x="425" y="155">
                    3
                  </text>
                  {/* 4 — Note */}
                  <circle
                    cx="580"
                    cy="150"
                    r="16"
                    fill="#002870"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text x="580" y="155">
                    4
                  </text>
                  {/* 5 — Status */}
                  <circle
                    cx="715"
                    cy="150"
                    r="16"
                    fill="#002870"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text x="715" y="155">
                    5
                  </text>
                  {/* 6 — Save */}
                  <circle
                    cx="810"
                    cy="150"
                    r="16"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text x="810" y="155">
                    6
                  </text>
                </g>

                {/* Callouts */}
                <g fontSize="11" fontWeight="700" fill="#374151" textAnchor="middle">
                  <text x="76" y="105">
                    Pick test
                  </text>
                  <text x="200" y="270">
                    Run scenario
                  </text>
                  <text x="425" y="105">
                    Attach evidence
                  </text>
                  <text x="580" y="105">
                    Write note
                  </text>
                  <text x="715" y="105">
                    Set status
                  </text>
                  <text x="810" y="105">
                    Save
                  </text>
                </g>
              </g>
            </svg>
          </div>
          <p className="text-xs text-muted-foreground italic">
            ↳ When marking <b>Fail</b> or <b>Failed/Retest</b>, a <b>note</b> and{" "}
            <b>which step failed</b> are required (bubble 4). Evidence (bubble 3) is optional.
          </p>
        </Card>

        {/* 3. Filtering */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            3. Filtering
          </h2>
          <p className="text-sm">
            Use the filter bar at the top of <b>Test Plan</b> to narrow what you see:
          </p>
          <ul className="text-sm space-y-1.5 ml-1">
            <li>
              <b>Search</b> — text match on test ID or title.
            </li>
            <li>
              <b>Area</b> — Intake, Drug, Plan Match, Scenario, etc.
            </li>
            <li>
              <b>Sprint</b> — show only this sprint's work.
            </li>
            <li>
              <b>Status</b> — e.g. show only Failed or Not Run.
            </li>
            <li>
              <b>Assignee</b> — your own queue.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground italic">
            ↳ Filters live in the toolbar directly above the test table.
          </p>
        </Card>

        {/* 4. Bulk edit */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            4. Bulk edits
          </h2>
          <ol className="text-sm space-y-1.5 ml-4 list-decimal">
            <li>
              Tick the checkbox on each row you want to edit (or the header checkbox to select all
              visible).
            </li>
            <li>
              The <b>bulk-edit bar</b> appears at the top — pick a new <b>Status</b>,{" "}
              <b>Severity</b>, <b>Sprint</b>, or <b>Assignee</b>.
            </li>
            <li>
              Click <b>Apply</b>. Changes save immediately.
            </li>
          </ol>
          <p className="text-xs text-muted-foreground italic">
            ↳ The bar only appears once at least one row is selected.
          </p>
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <b>Bulk-failing?</b> Bulk status changes do not open the failure dialog — add QA notes
            per row (or use bulk QA note) before saving. When you flip a single row to <b>Fail</b>,
            a dialog requires a <b>note</b> and <b>which step failed</b>; screenshot is optional.
          </div>
        </Card>

        {/* 5. Test statuses */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            5. Test status options
          </h2>
          <p className="text-sm">
            Set status from the <b>Status</b> dropdown on any row (or via bulk edit).
          </p>
          <ul className="text-sm space-y-1.5 ml-1">
            <li>
              <b>Not Run</b> — default; not yet executed.
            </li>
            <li>
              <b>Pass</b> — the test met all acceptance criteria. The test is <b>closed</b>, but
              status and every field stay editable.
            </li>
            <li>
              <b>Fail</b> — bug found.{" "}
              <span className="text-destructive font-semibold">
                A QA note and which step failed are required
              </span>{" "}
              — a dialog opens when you pick Fail. Describe what broke (expected vs actual).
              Screenshot/PDF/log in Evidence is <span className="font-semibold">optional</span> but
              encouraged.
            </li>
            <li>
              <b>Fixed / Re-Test</b> — <b>Dev-only</b>. Dev believes the bug is fixed and hands it
              back to QA for verification.{" "}
              <span className="text-destructive font-semibold">Dev note required.</span>
            </li>
            <li>
              <b>Failed / Re-Test</b> — <b>Dev-only</b>. Dev couldn't reproduce or test needs
              clarification / needs QA to re-evaluate and re-test.{" "}
              <span className="text-destructive font-semibold">Dev note required</span>; screenshot
              optional.
            </li>
            <li>
              <b>Blocked</b> — cannot run (e.g. environment down, depends on another test).
            </li>
          </ul>
          <div className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm flex gap-2">
            <MessageSquareWarning className="h-4 w-4 text-amber shrink-0 mt-0.5" />
            <span>
              <b>Loop:</b> QA fails it → Dev triages and assigns <b>Fixed/Retest</b> or{" "}
              <b>Failed/Retest</b> (Dev-only, with a Dev note) → QA re-runs and either Passes or
              Fails again. Repeat until QA marks <b>Pass</b> — at which point the test is closed but
              every field stays editable.
            </span>
          </div>
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <b>Note gate (every Fail).</b> When you pick <b>Fail</b> on a row, a dialog blocks the
            status change until you enter a<b> failure note</b> and select <b>which step failed</b>.
            Screenshot is optional — attach one in the dialog or Evidence panel if you have it. Save
            (single-row or bulk) is <u>not</u> blocked by missing screenshots.
          </div>
        </Card>

        {/* 6. Pipeline diagram */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">6. The bug pipeline</h2>
          <p className="text-sm text-muted-foreground">
            How a test moves between QA and Dev until QA passes it. A passed test is <b>closed</b>,
            but the status and every field stay editable.
          </p>
          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 900 640"
              className="w-full h-auto"
              role="img"
              aria-label="QA bug pipeline flow chart"
            >
              <defs>
                <marker
                  id="qa-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
                </marker>
              </defs>
              <g
                fontFamily="ui-sans-serif, system-ui"
                fontSize="14"
                textAnchor="middle"
                fill="#ffffff"
              >
                {/* START (top center) */}
                <rect
                  x="370"
                  y="30"
                  width="160"
                  height="60"
                  rx="10"
                  fill="#3FA34D"
                  stroke="#2f7d3a"
                  strokeWidth="1.5"
                />
                <text x="450" y="66" fontWeight="800" fontSize="18">
                  START
                </text>

                {/* QA EXECUTES TEST */}
                <rect
                  x="370"
                  y="160"
                  width="160"
                  height="70"
                  rx="10"
                  fill="#F1A892"
                  stroke="#d98a73"
                  strokeWidth="1.5"
                />
                <text x="450" y="190" fontWeight="800">
                  QA EXECUTES
                </text>
                <text x="450" y="212" fontWeight="800">
                  TEST
                </text>

                {/* PASS/FAIL diamond (center) */}
                <polygon
                  points="450,300 580,400 450,500 320,400"
                  fill="#FFEB3B"
                  stroke="#e6c200"
                  strokeWidth="1.5"
                />
                <text x="450" y="394" fontWeight="800" fill="#1f2937">
                  PASS/
                </text>
                <text x="450" y="416" fontWeight="800" fill="#1f2937">
                  FAIL?
                </text>

                {/* TEST CLOSED END (right) */}
                <rect
                  x="650"
                  y="365"
                  width="170"
                  height="70"
                  rx="10"
                  fill="#3FA34D"
                  stroke="#2f7d3a"
                  strokeWidth="1.5"
                />
                <text x="735" y="395" fontWeight="800">
                  TEST CLOSED
                </text>
                <text x="735" y="417" fontWeight="800">
                  END
                </text>

                {/* TEST FAILED (left) */}
                <rect
                  x="30"
                  y="365"
                  width="220"
                  height="70"
                  rx="10"
                  fill="#E53935"
                  stroke="#b32a26"
                  strokeWidth="1.5"
                />
                <text x="140" y="395" fontWeight="800">
                  TEST FAILED
                </text>
                <text x="140" y="417" fontSize="12" fontWeight="700">
                  (NOW IN DEV'S QUE)
                </text>

                {/* DEV (bottom left) */}
                <rect
                  x="30"
                  y="505"
                  width="220"
                  height="90"
                  rx="10"
                  fill="#4FC3F7"
                  stroke="#2196f3"
                  strokeWidth="1.5"
                />
                <text x="140" y="535" fontWeight="800">
                  DEV
                </text>
                <text x="140" y="557" fontSize="12" fontWeight="700">
                  (sets status to
                </text>
                <text x="140" y="573" fontSize="12" fontWeight="700">
                  FIXED/RETEST OR
                </text>
                <text x="140" y="589" fontSize="12" fontWeight="700">
                  FAILED/RETEST)
                </text>

                {/* Arrows — all perfectly orthogonal, no overlaps */}
                <g stroke="#374151" fill="none" strokeWidth="2" markerEnd="url(#qa-arrow)">
                  {/* START -> QA EXECUTES (vertical) */}
                  <line x1="450" y1="90" x2="450" y2="160" />
                  {/* QA EXECUTES -> Diamond (vertical) */}
                  <line x1="450" y1="230" x2="450" y2="300" />
                  {/* Diamond Pass -> TEST CLOSED (horizontal) */}
                  <line x1="580" y1="400" x2="650" y2="400" />
                  {/* Diamond Fail -> TEST FAILED (horizontal) */}
                  <line x1="320" y1="400" x2="250" y2="400" />
                  {/* TEST FAILED -> DEV (vertical) */}
                  <line x1="140" y1="435" x2="140" y2="505" />
                  {/* DEV -> back up to Diamond bottom (right, then up — clean L) */}
                  <polyline points="250,550 450,550 450,500" />
                </g>

                {/* Branch labels */}
                <text x="615" y="392" fontSize="13" fontWeight="700" fill="#1f2937">
                  Pass
                </text>
                <text x="285" y="392" fontSize="13" fontWeight="700" fill="#1f2937">
                  Fail
                </text>
              </g>
            </svg>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>
              Only <b>Dev</b> can set <b>Fixed/Retest</b> or <b>Failed/Retest</b>. QA can only set
              Pass, Fail, In Progress, or Not Started.
            </li>
            <li>
              Every failed test must include a <b>QA note</b> (and which step failed, via the Fail
              dialog). Every Dev hand-off (Fixed/Retest or Failed/Retest) must include a{" "}
              <b>Dev note</b>. Screenshots are optional but help Dev reproduce bugs faster.
            </li>
            <li>
              <b>Screenshots are optional.</b> You can attach one in the Evidence section or the
              Fail dialog — <b>Capture screen</b> (desktop), <b>Take photo</b> (mobile camera), or{" "}
              <b>Upload</b>. On iPhone, capture with <b>Side + Volume Up</b>; on Android,{" "}
              <b>Power + Volume Down</b>. The image lands in Photos, then tap{" "}
              <b>Take photo → Photo Library</b> to upload. Allowed: PNG, JPG, HEIC, GIF, WEBP, PDF,
              .log, .txt (20&nbsp;MB max). Executables, HTML, SVG, scripts, and archives are blocked
              for safety.
            </li>
            <li>
              The loop continues until QA marks <b>Pass</b>. The test is then <b>closed</b> — but
              status and every field remain editable.
            </li>
          </ul>
        </Card>

        {/* 7. Credits */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            7. Credits
          </h2>
          <p className="text-sm text-muted-foreground">
            <b>Credit tokens</b> reward QA work in the Testing Portal. Each token maps{" "}
            <b>1:1</b> to an advisor lookup credit inside the product. You do not need a screenshot
            to earn credits — a saved <b>Pass</b> or a documented <b>Fail</b> (note + failed step)
            is enough.
          </p>

          <div className="space-y-2">
            <p className="text-sm font-semibold">How you earn credits</p>
            <ul className="text-sm space-y-1.5 ml-1">
              <li>
                <b>Pass</b> — execute the test, confirm it meets acceptance criteria, set status to{" "}
                <b>Pass</b>, and <b>Save</b>. Tokens are based on test priority (see table below).
              </li>
              <li>
                <b>Fail</b> — file a reproducible bug: set <b>Fail</b>, enter a QA note and which
                step broke, then <b>Save</b>. You earn the same base tokens as a Pass for that
                priority. Evidence helps Dev but is optional for credit eligibility.
              </li>
              <li>
                <b>First-fail bonus</b> — the first reproducible <b>Fail</b> on a given test id
                earns an extra <b>+{REPRO_FAIL_BONUS}</b> tokens. Admins apply this bonus during
                sprint retro.
              </li>
              <li>
                <b>Blocked</b> and <b>Not Run</b> — <b>0</b> tokens. In Progress alone does not pay
                until the test reaches Pass or a documented Fail.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Token amounts by priority</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Meaning</th>
                    <th className="px-3 py-2 text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono font-semibold">P0</td>
                    <td className="px-3 py-2">Severe (show stopper)</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      {CREDIT_REWARDS.P0}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono font-semibold">P1</td>
                    <td className="px-3 py-2">High (within 24h)</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      {CREDIT_REWARDS.P1}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono font-semibold">P2</td>
                    <td className="px-3 py-2">Medium (can wait)</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      {CREDIT_REWARDS.P2}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono font-semibold">P3</td>
                    <td className="px-3 py-2">Low (non-priority polish)</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      {CREDIT_REWARDS.P3}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground italic">
              ↳ The Testing Portal header shows total credit budget and per-tester totals for the
              current test plan.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">What credits are for</p>
            <ul className="text-sm space-y-1.5 ml-1">
              <li>
                <b>Advisors</b> spend credits on scenario lookups (1 credit per lookup after the
                first free claim).
              </li>
              <li>
                <b>QA testers</b> can request payout or conversion through an admin after sprint
                retro.
              </li>
            </ul>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <b>Check your balance.</b> Open the QA Credit Guide for your current balance,
            assignment budget, reward breakdown, and recent transactions.
          </div>

          <div className="pt-1 flex flex-wrap gap-2">
            <Link to="/qa-credits">
              <Button size="sm" variant="outline">
                Open full credit guide →
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-base font-bold">Need help?</h2>
          <p className="text-sm text-muted-foreground">
            Ping an admin in the project chat. For account or access issues, contact your
            administrator — they'll see your message in the in-app notifications bell.
          </p>
          <div className="pt-2">
            <Link to="/testing">
              <Button size="sm" className="grad-indigo">
                Open Testing Portal
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="glass p-5 space-y-3 border-yellow-500/50 bg-yellow-500/15">
          <h2 className="font-display text-base font-bold text-yellow-900 dark:text-yellow-100">
            Local dev: browser connection errors
          </h2>
          <div className="rounded-md border border-yellow-500/40 bg-yellow-50 dark:bg-yellow-950/40 p-3 text-sm text-yellow-950 dark:text-yellow-100 font-mono whitespace-pre-wrap leading-relaxed">
            {`Browser error to investigate:
URL: http://localhost:8081/
Local port: 8081
Category: Connection failure
Error: ERR_CONNECTION_REFUSED
Details: Error Code: -102`}
          </div>
          <p className="text-sm text-yellow-950 dark:text-yellow-100">
            <b>Most likely cause:</b> nothing is listening on port <b>8081</b> — the Vite dev server
            is stopped or crashed.
          </p>
          <ol className="text-sm text-yellow-950 dark:text-yellow-100 space-y-1.5 ml-4 list-decimal">
            <li>
              Check the terminal where you ran <code className="text-xs">npm run dev</code> — is it
              still running?
            </li>
            <li>
              Restart from the project folder: <code className="text-xs">npm run dev</code> (fixed
              port <b>8081</b>).
            </li>
            <li>
              Use the URL Vite prints — e.g. <b>http://localhost:8081/</b>, not 8080.
            </li>
            <li>
              If it still fails: <code className="text-xs">netstat -ano | findstr :8081</code> on
              Windows to see if another process owns the port.
            </li>
          </ol>
        </Card>
      </div>
    </AppShell>
  );
}
