import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import { BookOpen, ArrowLeft, Filter, LayoutDashboard, CheckSquare, MessageSquareWarning, ListChecks, Coins } from "lucide-react";

export const Route = createFileRoute("/qa-manual")({
  head: () => ({
    meta: [
      { title: "QA Manual — The Medicare Optimizer" },
      { name: "description", content: "Quick reference for QA testers: filters, layout, bulk edits, statuses, and the bug pipeline." },
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
    if (!user) { router.navigate({ to: "/auth" }); return; }
    if (user.role !== "qa" && user.role !== "admin") { router.navigate({ to: "/" }); }
  }, [user, authLoading, router]);

  if (!user) return null;

  return (
    <AppShell title="QA Manual" subtitle="Everything you need to start testing — kept short on purpose.">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" /> Reference guide
          </div>
          <Link to="/testing"><Button size="sm" variant="outline"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to Testing</Button></Link>
        </div>

        {/* 1. Page layout */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-primary" />1. Page layout</h2>
          <p className="text-sm text-muted-foreground">The Testing Portal has two tabs you'll use:</p>
          <ul className="text-sm space-y-1.5 ml-1">
            <li><b>Test Plan</b> — every test case, grouped by area. This is your daily workspace.</li>
            <li><b>Sprints</b> — what's planned for the current and upcoming sprints. Check here to know what's in scope this week.</li>
          </ul>
          <p className="text-xs text-muted-foreground italic">↳ Tabs are at the top of the page, just under the title.</p>
        </Card>

        {/* 2. Filtering */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><Filter className="h-4 w-4 text-primary" />2. Filtering</h2>
          <p className="text-sm">Use the filter bar at the top of <b>Test Plan</b> to narrow what you see:</p>
          <ul className="text-sm space-y-1.5 ml-1">
            <li><b>Search</b> — text match on test ID or title.</li>
            <li><b>Area</b> — Intake, Drug, Plan Match, Scenario, etc.</li>
            <li><b>Sprint</b> — show only this sprint's work.</li>
            <li><b>Status</b> — e.g. show only Failed or Not Run.</li>
            <li><b>Assignee</b> — your own queue.</li>
          </ul>
          <p className="text-xs text-muted-foreground italic">↳ Filters live in the toolbar directly above the test table.</p>
        </Card>

        {/* 3. Bulk edit */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" />3. Bulk edits</h2>
          <ol className="text-sm space-y-1.5 ml-4 list-decimal">
            <li>Tick the checkbox on each row you want to edit (or the header checkbox to select all visible).</li>
            <li>The <b>bulk-edit bar</b> appears at the top — pick a new <b>Status</b>, <b>Severity</b>, <b>Sprint</b>, or <b>Assignee</b>.</li>
            <li>Click <b>Apply</b>. Changes save immediately.</li>
          </ol>
          <p className="text-xs text-muted-foreground italic">↳ The bar only appears once at least one row is selected.</p>
        </Card>

        {/* 4. Test statuses */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" />4. Test status options</h2>
          <p className="text-sm">Set status from the <b>Status</b> dropdown on any row (or via bulk edit).</p>
          <ul className="text-sm space-y-1.5 ml-1">
            <li><b>Not Run</b> — default; not yet executed.</li>
            <li><b>Pass</b> — the test met all acceptance criteria. The test is <b>closed</b>, but status and every field stay editable.</li>
            <li><b>Fail</b> — bug found. <span className="text-destructive font-semibold">A QA note is required</span> describing what broke, exact steps, and expected vs actual.</li>
            <li><b>Fixed / Re-Test</b> — <b>Dev-only</b>. Dev believes the bug is fixed and hands it back to QA for verification. <span className="text-destructive font-semibold">Dev note required.</span></li>
            <li><b>Failed / Re-Test</b> — <b>Dev-only</b>. Dev couldn't reproduce or test needs clarification / needs QA to re-evaluate and re-test. <span className="text-destructive font-semibold">Dev note required.</span></li>
            <li><b>Blocked</b> — cannot run (e.g. environment down, depends on another test).</li>
          </ul>
          <div className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm flex gap-2">
            <MessageSquareWarning className="h-4 w-4 text-amber shrink-0 mt-0.5" />
            <span><b>Loop:</b> QA fails it → Dev triages and assigns <b>Fixed/Retest</b> or <b>Failed/Retest</b> (Dev-only, with a Dev note) → QA re-runs and either Passes or Fails again. Repeat until QA marks <b>Pass</b> — at which point the test is closed but every field stays editable.</span>
          </div>
        </Card>

        {/* 5. Pipeline diagram */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">5. The bug pipeline</h2>
          <p className="text-sm text-muted-foreground">How a test moves between QA and Dev until QA passes it. A passed test is <b>closed</b>, but the status and every field stay editable.</p>
          <div className="overflow-x-auto">
            <svg viewBox="0 0 900 640" className="w-full h-auto" role="img" aria-label="QA bug pipeline flow chart">
              <defs>
                <marker id="qa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
                </marker>
              </defs>
              <g fontFamily="ui-sans-serif, system-ui" fontSize="14" textAnchor="middle" fill="#ffffff">
                {/* START (top center) */}
                <rect x="370" y="30" width="160" height="60" rx="10" fill="#3FA34D" stroke="#2f7d3a" strokeWidth="1.5" />
                <text x="450" y="66" fontWeight="800" fontSize="18">START</text>

                {/* QA EXECUTES TEST */}
                <rect x="370" y="160" width="160" height="70" rx="10" fill="#F1A892" stroke="#d98a73" strokeWidth="1.5" />
                <text x="450" y="190" fontWeight="800">QA EXECUTES</text>
                <text x="450" y="212" fontWeight="800">TEST</text>

                {/* PASS/FAIL diamond (center) */}
                <polygon points="450,300 580,400 450,500 320,400" fill="#FFEB3B" stroke="#e6c200" strokeWidth="1.5" />
                <text x="450" y="394" fontWeight="800" fill="#1f2937">PASS/</text>
                <text x="450" y="416" fontWeight="800" fill="#1f2937">FAIL?</text>

                {/* TEST CLOSED END (right) */}
                <rect x="650" y="365" width="170" height="70" rx="10" fill="#3FA34D" stroke="#2f7d3a" strokeWidth="1.5" />
                <text x="735" y="395" fontWeight="800">TEST CLOSED</text>
                <text x="735" y="417" fontWeight="800">END</text>

                {/* TEST FAILED (left) */}
                <rect x="30" y="365" width="220" height="70" rx="10" fill="#E53935" stroke="#b32a26" strokeWidth="1.5" />
                <text x="140" y="395" fontWeight="800">TEST FAILED</text>
                <text x="140" y="417" fontSize="12" fontWeight="700">(NOW IN DEV'S QUEUE)</text>

                {/* DEV (bottom left) */}
                <rect x="30" y="505" width="220" height="90" rx="10" fill="#4FC3F7" stroke="#2196f3" strokeWidth="1.5" />
                <text x="140" y="535" fontWeight="800">DEV</text>
                <text x="140" y="557" fontSize="12" fontWeight="700">(sets status to</text>
                <text x="140" y="573" fontSize="12" fontWeight="700">FIXED/RETEST OR</text>
                <text x="140" y="589" fontSize="12" fontWeight="700">FAILED/RETEST)</text>

                {/* Arrows */}
                <g stroke="#374151" fill="none" strokeWidth="2" markerEnd="url(#qa-arrow)">
                  {/* All five primary connectors are exactly 70 units long. */}
                  {/* START -> QA EXECUTES (vertical, 70) */}
                  <line x1="450" y1="90" x2="450" y2="160" />
                  {/* QA EXECUTES -> Diamond (vertical, 70) */}
                  <line x1="450" y1="230" x2="450" y2="300" />
                  {/* Diamond Pass -> TEST CLOSED (horizontal, 70) */}
                  <line x1="580" y1="400" x2="650" y2="400" />
                  {/* Diamond Fail -> TEST FAILED (horizontal, 70) */}
                  <line x1="320" y1="400" x2="250" y2="400" />
                  {/* TEST FAILED -> DEV (vertical, 70) */}
                  <line x1="140" y1="435" x2="140" y2="505" />
                  {/* DEV -> back up to Diamond (mirrors Fail+QA pair, 70+70) */}
                  <polyline points="250,550 320,550 320,500 450,500" />
                </g>

                {/* Branch labels */}
                <text x="615" y="390" fontSize="13" fontWeight="700" fill="#1f2937">Pass</text>
                <text x="285" y="390" fontSize="13" fontWeight="700" fill="#1f2937">Fail</text>
                <text x="360" y="544" fontSize="13" fontWeight="700" fill="#1f2937">Retest</text>
              </g>
            </svg>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Only <b>Dev</b> can set <b>Fixed/Retest</b> or <b>Failed/Retest</b>. QA can only set Pass, Fail, In Progress, or Not Started.</li>
            <li>Every failed test must include a <b>QA note</b>. Every Dev hand-off (Fixed/Retest or Failed/Retest) must include a <b>Dev note</b>.</li>
            <li><b>Screenshot is mandatory for every Fail / Failed-Retest.</b> Attach at least one screenshot (or PDF/log) of the result in the Evidence section before saving — the Save will be blocked otherwise. On iPhone, capture with <b>Side + Volume Up</b>; on Android, <b>Power + Volume Down</b>. The image lands in Photos, then tap <b>Take photo → Photo Library</b> to upload. Allowed: PNG, JPG, HEIC, GIF, WEBP, PDF, .log, .txt (20&nbsp;MB max). Executables, HTML, SVG, scripts, and archives are blocked for safety.</li>
            <li>The loop continues until QA marks <b>Pass</b>. The test is then <b>closed</b> — but status and every field remain editable.</li>
          </ul>
        </Card>

        {/* 6. Credits */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><Coins className="h-4 w-4 text-primary" />6. Credits</h2>
          <p className="text-sm text-muted-foreground">You earn credit tokens for every test you execute and submit with evidence.</p>
          <ul className="text-sm space-y-1.5 ml-1">
            <li><b>Pass</b> — earn tokens based on test priority (P0 = 15, P1 = 10, P2 = 5, P3 = 3).</li>
            <li><b>Fail</b> — earn the same base tokens if you leave reproducible QA notes.</li>
            <li><b>First-fail bonus</b> — +5 bonus for the first reproducible fail filed on a given test id.</li>
            <li><b>Blocked / Not Run</b> — 0 tokens.</li>
          </ul>
          <div className="pt-1"><Link to="/qa-credits"><Button size="sm" variant="outline">Open full credit guide →</Button></Link></div>
        </Card>

        <Card className="glass p-5 space-y-2">
          <h2 className="font-display text-base font-bold">Need help?</h2>
          <p className="text-sm text-muted-foreground">Ping an admin in the project chat. For account or access issues, contact your administrator — they'll see your message in the in-app notifications bell.</p>
          <div className="pt-2"><Link to="/testing"><Button size="sm" className="grad-indigo">Open Testing Portal</Button></Link></div>
        </Card>
      </div>
    </AppShell>
  );
}