import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import {
  CREDIT_REWARDS,
  REPRO_FAIL_BONUS,
  totalCreditBudget,
  creditBudgetByOwner,
  TEST_CASES,
} from "@/lib/test-plan";
import {
  Coins,
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/qa-credits")({
  head: () => ({
    meta: [
      { title: "QA Credit Guide — Part B Optimizer" },
      {
        name: "description",
        content: "How QA testers earn credit tokens for every test executed and bug filed.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: QACreditsPage,
});

function QACreditsPage() {
  const { user, authLoading, credits, creditTxns } = useApp();
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

  const budgetByOwner = creditBudgetByOwner();
  const totalBudget = totalCreditBudget();
  const yourBudget = budgetByOwner[(user.full_name || "").trim().split(/\s+/)[0]] ?? 0;

  // Count tests by priority for the reward table
  const countsByPriority = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const t of TEST_CASES) {
    if (countsByPriority[t.priority as keyof typeof countsByPriority] !== undefined) {
      countsByPriority[t.priority as keyof typeof countsByPriority]++;
    }
  }

  return (
    <AppShell
      title="QA Credit Guide"
      subtitle="How you earn credits for testing, and how they’re spent."
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" /> Credit system reference
          </div>
          <Link to="/testing">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Testing Portal
            </Button>
          </Link>
        </div>

        {/* Current balance */}
        <Card className="glass p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald/10 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-emerald" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Your current balance</div>
                <div className="font-display text-4xl font-bold tabular-nums">{credits}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total available in test plan</div>
              <div className="font-display text-2xl font-bold tabular-nums text-primary">
                {totalBudget}
              </div>
            </div>
          </div>
        </Card>

        {/* How to earn */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            How credits are earned
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald" />
                Mark a test as Pass
              </div>
              <p className="text-sm text-muted-foreground">
                Execute the test case, verify all steps, then set the status to <b>Pass</b>. Credits
                are awarded immediately based on the test priority.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <XCircle className="h-4 w-4 text-destructive" />
                File a reproducible Fail
              </div>
              <p className="text-sm text-muted-foreground">
                If you find a bug, set status to <b>Fail</b> and leave detailed QA notes (steps,
                expected vs actual). You still earn the base credit, plus a bonus for the first
                reproducible fail on that test.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber shrink-0 mt-0.5" />
            <span>
              <b>Blocked</b> and <b>Not Run</b> earn <b>0</b> credits. A test must reach <b>Pass</b>{" "}
              or a documented <b>Fail</b> with QA notes to be eligible.
            </span>
          </div>
        </Card>

        {/* Reward table */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Credit reward table
          </h2>
          <p className="text-sm text-muted-foreground">
            Token amount scales with test complexity, proxied by priority:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Meaning</th>
                  <th className="px-3 py-2 text-right">Tokens per test</th>
                  <th className="px-3 py-2 text-right">Tests in plan</th>
                  <th className="px-3 py-2 text-right">Sub-total</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    {
                      key: "P0",
                      label: "Severe (Show Stopper)",
                      reward: CREDIT_REWARDS.P0,
                      count: countsByPriority.P0,
                    },
                    {
                      key: "P1",
                      label: "High (w/i 24h)",
                      reward: CREDIT_REWARDS.P1,
                      count: countsByPriority.P1,
                    },
                    {
                      key: "P2",
                      label: "Medium (Can wait)",
                      reward: CREDIT_REWARDS.P2,
                      count: countsByPriority.P2,
                    },
                    {
                      key: "P3",
                      label: "Low (Non-Priority)",
                      reward: CREDIT_REWARDS.P3,
                      count: countsByPriority.P3,
                    },
                  ] as const
                ).map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="px-3 py-2 font-mono font-semibold">{row.key}</td>
                    <td className="px-3 py-2">{row.label}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      {row.reward}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.count}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-emerald">
                      {row.reward * row.count}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-secondary/30">
                  <td className="px-3 py-2 font-semibold" colSpan={4}>
                    Total credit budget
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-emerald">
                    {totalBudget}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Fail bonus */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            First-reproducible-fail bonus
          </h2>
          <p className="text-sm text-muted-foreground">
            The <b>first</b> time a test id gets a reproducible <b>Fail</b> with QA notes, the filer
            receives an extra bonus:
          </p>
          <div className="flex items-center gap-3 rounded-md bg-primary/5 border border-primary/20 p-4">
            <div className="font-display text-3xl font-bold text-primary">+{REPRO_FAIL_BONUS}</div>
            <div className="text-sm">
              <div className="font-semibold">Bonus tokens</div>
              <div className="text-muted-foreground">
                Paid manually by admin during sprint retro.
              </div>
            </div>
          </div>
        </Card>

        {/* How credits are spent */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            How credits are spent
          </h2>
          <ul className="text-sm space-y-1.5 ml-1">
            <li>
              <b>Scenario lookups</b> — Advisors spend 1 credit each time they look up a scenario by
              code (first lookup claims it free).
            </li>
            <li>
              <b>Plan exports</b> — Coming soon: credit-gated PDF/CSV exports for advisors.
            </li>
            <li>
              <b>QA redemption</b> — QA testers can request credit payout or conversion to advisor
              lookup credits via admin.
            </li>
          </ul>
        </Card>

        {/* Your assignment budget */}
        <Card className="glass p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Your assignment budget</h2>
          <p className="text-sm text-muted-foreground">
            Based on the tests currently assigned to you in the test plan:
          </p>
          <div className="flex items-center gap-3">
            <div className="font-display text-3xl font-bold text-primary">{yourBudget}</div>
            <div className="text-sm text-muted-foreground">
              potential tokens if every assigned test reaches <b>Pass</b> or documented <b>Fail</b>
            </div>
          </div>
        </Card>

        {/* Recent transactions */}
        {creditTxns.length > 0 && (
          <Card className="glass p-5 space-y-3">
            <h2 className="font-display text-lg font-bold">Recent credit activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2">When</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {creditTxns.slice(0, 10).map((t) => (
                    <tr key={t.id} className="border-b border-border/60">
                      <td className="py-2 text-muted-foreground whitespace-nowrap">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td className="py-2">{t.description}</td>
                      <td
                        className={`py-2 text-right tabular-nums font-semibold ${t.amount > 0 ? "text-emerald" : "text-warning"}`}
                      >
                        {t.amount > 0 ? `+${t.amount}` : t.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card className="glass p-5 space-y-2">
          <h2 className="font-display text-base font-bold">Need help?</h2>
          <p className="text-sm text-muted-foreground">
            If your credits look wrong or a payout is missing, ping an admin in the project chat.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <Link to="/testing">
              <Button size="sm" className="grad-indigo">
                Open Testing Portal
              </Button>
            </Link>
            <Link to="/qa-manual">
              <Button size="sm" variant="outline">
                Open QA Manual
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
