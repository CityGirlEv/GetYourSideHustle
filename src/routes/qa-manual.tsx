import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import { BookOpen, ArrowLeft, Filter, LayoutDashboard, CheckSquare, MessageSquareWarning, ListChecks } from "lucide-react";

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
            <li><b>Pass</b> — the test met all acceptance criteria.</li>
            <li><b>Fail</b> — bug found. <span className="text-destructive font-semibold">A QA note is required</span> describing what broke, exact steps, and expected vs actual.</li>
            <li><b>Failed / Re-Test</b> — Dev sent a fix back; you re-ran it and it still fails. Note required.</li>
            <li><b>Fixed / Re-Test</b> — Dev marked it fixed and assigned back to QA for verification.</li>
            <li><b>Blocked</b> — cannot run (e.g. environment down, depends on another test).</li>
          </ul>
          <div className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm flex gap-2">
            <MessageSquareWarning className="h-4 w-4 text-amber shrink-0 mt-0.5" />
            <span><b>Rule:</b> any <b>Fail</b> or <b>Failed/Re-Test</b> must include a QA note. Dev will <b>always</b> leave a note when they mark a test <b>Fixed/Re-Test</b> or send it back as <b>Failed/Re-Test</b> — read it before you re-run.</span>
          </div>
        </Card>

        {/* 5. Pipeline diagram */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">5. The bug pipeline</h2>
          <p className="text-sm text-muted-foreground">How a test moves through QA and Dev until it ends at <b>Passed</b>.</p>
          <div className="overflow-x-auto">
            <svg viewBox="0 0 720 280" className="w-full h-auto" role="img" aria-label="QA pipeline diagram">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              <g fontFamily="ui-sans-serif, system-ui" fontSize="12" textAnchor="middle">
                {/* Not Run */}
                <rect x="20" y="120" width="110" height="40" rx="8" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
                <text x="75" y="145" fill="currentColor">Not Run</text>

                {/* QA runs */}
                <rect x="170" y="120" width="120" height="40" rx="8" fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" />
                <text x="230" y="145" fill="currentColor">QA executes</text>

                {/* Pass terminal */}
                <rect x="560" y="20" width="140" height="40" rx="8" fill="hsl(142 70% 45% / 0.2)" stroke="hsl(142 70% 45%)" />
                <text x="630" y="45" fill="currentColor" fontWeight="700">PASSED ✓</text>

                {/* Fail */}
                <rect x="330" y="120" width="120" height="40" rx="8" fill="hsl(0 70% 55% / 0.15)" stroke="hsl(0 70% 55%)" />
                <text x="390" y="138" fill="currentColor">Fail</text>
                <text x="390" y="153" fill="currentColor" fontSize="10">(QA note req.)</text>

                {/* Dev fixes */}
                <rect x="490" y="120" width="160" height="40" rx="8" fill="hsl(var(--primary)/0.1)" stroke="hsl(var(--primary))" />
                <text x="570" y="138" fill="currentColor">Dev → Fixed / Re-Test</text>
                <text x="570" y="152" fill="currentColor" fontSize="10">(Dev note required)</text>

                {/* QA re-runs */}
                <rect x="330" y="220" width="120" height="40" rx="8" fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" />
                <text x="390" y="245" fill="currentColor">QA re-tests</text>

                {/* Still broken */}
                <rect x="160" y="220" width="140" height="40" rx="8" fill="hsl(0 70% 55% / 0.15)" stroke="hsl(0 70% 55%)" />
                <text x="230" y="238" fill="currentColor">Failed / Re-Test</text>
                <text x="230" y="252" fill="currentColor" fontSize="10">(QA note req.)</text>

                {/* Arrows */}
                <g stroke="currentColor" fill="none" markerEnd="url(#arrow)">
                  <line x1="130" y1="140" x2="168" y2="140" />
                  <line x1="290" y1="140" x2="328" y2="140" />
                  {/* QA executes -> Passed (top) */}
                  <path d="M 260 120 C 260 60, 480 40, 558 40" />
                  <line x1="450" y1="140" x2="488" y2="140" />
                  {/* Dev fixed -> QA re-tests */}
                  <path d="M 570 160 C 570 200, 470 220, 452 230" />
                  {/* QA re-tests -> Passed */}
                  <path d="M 450 230 C 560 230, 620 120, 628 62" />
                  {/* QA re-tests -> Failed/Re-Test */}
                  <line x1="330" y1="240" x2="302" y2="240" />
                  {/* Failed/Re-Test back to Dev */}
                  <path d="M 230 220 C 230 180, 500 175, 568 160" />
                </g>
                <text x="380" y="80" fontSize="11" fill="currentColor" opacity="0.7">pass on first run →</text>
                <text x="600" y="200" fontSize="11" fill="currentColor" opacity="0.7">re-run passes →</text>
              </g>
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">A test only leaves the pipeline when it lands on <b>PASSED</b>. Every hand-off (QA→Dev or Dev→QA) carries a note.</p>
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