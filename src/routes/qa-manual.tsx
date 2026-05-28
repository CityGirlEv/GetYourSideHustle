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
          <p className="text-sm text-muted-foreground">How a test moves between QA and Dev until QA passes it. A passed test is <b>closed</b>, but the status and every field stay editable.</p>
          <div className="overflow-x-auto">
            <svg viewBox="0 0 860 720" className="w-full h-auto text-foreground" role="img" aria-label="QA bug pipeline flow chart">
              <defs>
                <marker id="qa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              <g fontFamily="ui-sans-serif, system-ui" fontSize="13" textAnchor="middle" fill="currentColor">
                {/* Start: Not Run */}
                <rect x="330" y="20" width="200" height="46" rx="10" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
                <text x="430" y="48" fontWeight="600">Not Run</text>

                {/* QA executes */}
                <rect x="330" y="110" width="200" height="46" rx="10" fill="var(--primary)" fillOpacity="0.18" stroke="var(--primary)" strokeWidth="1.5" />
                <text x="430" y="138" fontWeight="600">QA executes / re-tests</text>

                {/* Decision diamond: Pass? */}
                <polygon points="430,190 530,250 430,310 330,250" fill="oklch(0.85 0.12 90 / 0.18)" stroke="oklch(0.7 0.15 75)" strokeWidth="1.5" />
                <text x="430" y="246" fontWeight="700">Pass?</text>
                <text x="430" y="266" fontSize="11" opacity="0.8">QA decides</text>

                {/* PASSED terminal (right) */}
                <rect x="620" y="227" width="200" height="60" rx="10" fill="oklch(0.7 0.18 145 / 0.22)" stroke="oklch(0.55 0.18 145)" strokeWidth="2" />
                <text x="720" y="252" fontWeight="800">PASSED — CLOSED</text>
                <text x="720" y="270" fontSize="11" opacity="0.85">status + fields still editable</text>

                {/* Fail box (left) — QA must add a note */}
                <rect x="30" y="227" width="200" height="60" rx="10" fill="oklch(0.6 0.2 25 / 0.18)" stroke="oklch(0.55 0.22 25)" strokeWidth="1.5" />
                <text x="130" y="252" fontWeight="700">Fail</text>
                <text x="130" y="270" fontSize="11" opacity="0.85">QA note REQUIRED</text>

                {/* Dev triage */}
                <rect x="330" y="360" width="200" height="60" rx="10" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="1.5" />
                <text x="430" y="385" fontWeight="700">Dev triages</text>
                <text x="430" y="405" fontSize="11" opacity="0.85">picks ONE status + adds note</text>

                {/* Dev branch 1: Fixed / Retest */}
                <rect x="40" y="470" width="220" height="60" rx="10" fill="oklch(0.7 0.16 230 / 0.18)" stroke="oklch(0.55 0.16 230)" strokeWidth="1.5" />
                <text x="150" y="495" fontWeight="700">Fixed / Retest</text>
                <text x="150" y="513" fontSize="11" opacity="0.85">Dev believes it's fixed</text>

                {/* Dev branch 2: Failed / Retest */}
                <rect x="600" y="470" width="220" height="60" rx="10" fill="oklch(0.65 0.2 330 / 0.18)" stroke="oklch(0.55 0.2 330)" strokeWidth="1.5" />
                <text x="710" y="495" fontWeight="700">Failed / Retest</text>
                <text x="710" y="513" fontSize="11" opacity="0.85">Dev couldn't reproduce / needs QA re-run</text>

                {/* Loop legend */}
                <rect x="320" y="600" width="220" height="50" rx="10" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="430" y="623" fontWeight="700">Loop until QA marks Pass</text>
                <text x="430" y="641" fontSize="11" opacity="0.8">every hand-off carries a note</text>

                {/* Arrows */}
                <g stroke="currentColor" fill="none" strokeWidth="1.6" markerEnd="url(#qa-arrow)">
                  {/* Not Run -> QA executes */}
                  <line x1="430" y1="66" x2="430" y2="108" />
                  {/* QA executes -> Pass? */}
                  <line x1="430" y1="156" x2="430" y2="188" />
                  {/* Pass? Yes -> PASSED (right) */}
                  <line x1="530" y1="250" x2="618" y2="250" />
                  {/* Pass? No -> Fail (left) */}
                  <line x1="330" y1="250" x2="232" y2="250" />
                  {/* Fail -> Dev triage (down then right) */}
                  <polyline points="130,287 130,390 328,390" />
                  {/* Dev -> Fixed/Retest (down-left) */}
                  <polyline points="380,420 380,468" />
                  {/* Dev -> Failed/Retest (down-right) */}
                  <polyline points="480,420 480,468" />
                  {/* Fixed/Retest -> back up to QA executes */}
                  <polyline points="150,470 150,180 328,180" />
                  {/* Failed/Retest -> back up to QA executes */}
                  <polyline points="710,470 710,180 532,180" />
                </g>

                {/* Labels on decision branches */}
                <text x="570" y="242" fontSize="11" fontWeight="700" fill="oklch(0.5 0.18 145)">Yes</text>
                <text x="290" y="242" fontSize="11" fontWeight="700" fill="oklch(0.55 0.22 25)">No</text>
                <text x="345" y="448" fontSize="11" opacity="0.85">Dev-only</text>
                <text x="515" y="448" fontSize="11" opacity="0.85">Dev-only</text>
              </g>
            </svg>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Only <b>Dev</b> can set <b>Fixed/Retest</b> or <b>Failed/Retest</b>. QA can only set Pass, Fail, In Progress, or Not Started.</li>
            <li>Every failed test must include a <b>QA note</b>. Every Dev hand-off (Fixed/Retest or Failed/Retest) must include a <b>Dev note</b>.</li>
            <li>The loop continues until QA marks <b>Pass</b>. The test is then <b>closed</b> — but status and every field remain editable.</li>
          </ul>
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