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
            <svg viewBox="0 0 760 540" className="w-full h-auto text-foreground" role="img" aria-label="QA bug pipeline flow chart">
              <defs>
                <marker id="qa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              <g fontFamily="ui-sans-serif, system-ui" fontSize="13" textAnchor="middle" fill="currentColor">
                {/* Start: Not Run */}
                <rect x="300" y="20" width="160" height="46" rx="10" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
                <text x="380" y="48" fontWeight="600">Not Run</text>

                {/* QA executes */}
                <rect x="300" y="110" width="160" height="46" rx="10" fill="var(--primary)" fillOpacity="0.18" stroke="var(--primary)" strokeWidth="1.5" />
                <text x="380" y="138" fontWeight="600">QA executes test</text>

                {/* Decision diamond: Pass? */}
                <polygon points="380,190 470,250 380,310 290,250" fill="oklch(0.85 0.12 90 / 0.18)" stroke="oklch(0.7 0.15 75)" strokeWidth="1.5" />
                <text x="380" y="246" fontWeight="700">Pass?</text>
                <text x="380" y="266" fontSize="11" opacity="0.8">QA decides</text>

                {/* PASSED terminal (right) */}
                <rect x="560" y="227" width="170" height="46" rx="10" fill="oklch(0.7 0.18 145 / 0.22)" stroke="oklch(0.55 0.18 145)" strokeWidth="2" />
                <text x="645" y="248" fontWeight="800">PASSED</text>
                <text x="645" y="264" fontSize="11" opacity="0.85">end of pipeline</text>

                {/* Fail box (left) */}
                <rect x="30" y="227" width="170" height="46" rx="10" fill="oklch(0.6 0.2 25 / 0.18)" stroke="oklch(0.55 0.22 25)" strokeWidth="1.5" />
                <text x="115" y="248" fontWeight="700">Fail</text>
                <text x="115" y="264" fontSize="11" opacity="0.85">QA note required</text>

                {/* Dev fixes */}
                <rect x="30" y="340" width="220" height="56" rx="10" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="1.5" />
                <text x="140" y="365" fontWeight="700">Dev → Fixed / Re-Test</text>
                <text x="140" y="383" fontSize="11" opacity="0.85">Dev note ALWAYS required</text>

                {/* QA re-tests decision */}
                <polygon points="380,340 480,400 380,460 280,400" fill="oklch(0.85 0.12 90 / 0.18)" stroke="oklch(0.7 0.15 75)" strokeWidth="1.5" />
                <text x="380" y="396" fontWeight="700">QA re-tests</text>
                <text x="380" y="416" fontSize="11" opacity="0.85">Pass on retry?</text>

                {/* Failed / Re-Test loop-back */}
                <rect x="540" y="370" width="200" height="56" rx="10" fill="oklch(0.6 0.2 25 / 0.18)" stroke="oklch(0.55 0.22 25)" strokeWidth="1.5" />
                <text x="640" y="395" fontWeight="700">Failed / Re-Test</text>
                <text x="640" y="413" fontSize="11" opacity="0.85">QA note required</text>

                {/* Arrows */}
                <g stroke="currentColor" fill="none" strokeWidth="1.6" markerEnd="url(#qa-arrow)">
                  {/* Not Run -> QA executes */}
                  <line x1="380" y1="66" x2="380" y2="106" />
                  {/* QA executes -> Pass? */}
                  <line x1="380" y1="156" x2="380" y2="186" />
                  {/* Pass? Yes -> PASSED */}
                  <line x1="470" y1="250" x2="556" y2="250" />
                  {/* Pass? No -> Fail */}
                  <line x1="290" y1="250" x2="204" y2="250" />
                  {/* Fail -> Dev fixes */}
                  <path d="M 115 273 L 115 336" />
                  {/* Dev fixes -> QA re-tests */}
                  <path d="M 250 380 L 276 396" />
                  {/* QA re-tests Yes -> PASSED (up & right) */}
                  <path d="M 480 400 C 580 400, 645 330, 645 277" />
                  {/* QA re-tests No -> Failed/Re-Test */}
                  <line x1="480" y1="400" x2="536" y2="400" />
                  {/* Failed/Re-Test -> Dev fixes (loop back) */}
                  <path d="M 540 398 C 400 470, 200 470, 140 400" />
                </g>

                {/* Labels on decision branches */}
                <text x="510" y="242" fontSize="11" fontWeight="700" fill="oklch(0.5 0.18 145)">Yes</text>
                <text x="248" y="242" fontSize="11" fontWeight="700" fill="oklch(0.55 0.22 25)">No</text>
                <text x="508" y="392" fontSize="11" fontWeight="700" fill="oklch(0.55 0.22 25)">No</text>
                <text x="555" y="345" fontSize="11" fontWeight="700" fill="oklch(0.5 0.18 145)">Yes</text>
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