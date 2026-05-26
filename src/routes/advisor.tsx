import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Receipt, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Advisor Workbench — The Medicare Optimizer" },
      { name: "description", content: "Look up Medicare scenarios by ID and manage your advisor caseload. No PII stored." },
      { property: "og:title", content: "Advisor Workbench — The Medicare Optimizer" },
      { property: "og:description", content: "Advisor caseload and scenario lookup." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/advisor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [
      { rel: "canonical", href: "https://themedicareoptimizer.lovable.app/advisor" },
    ],
  }),
  component: AdvisorPortal,
});

function AdvisorPortal() {
  const { user, authLoading, scenarios, creditTxns, lookupScenario } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState("lookup");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);
  if (!user) return null;

  const submitLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      const s = await lookupScenario(code);
      toast.success(`Loaded scenario ${s.scenario_code}`);
      router.navigate({ to: "/advisor/scenario/$code", params: { code: s.scenario_code } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <AppShell title="Advisor command center" subtitle="Look up scenarios by ID — no personal information stored">
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="glass">
            <TabsTrigger value="lookup"><Search className="h-4 w-4 mr-1.5"/>Look up scenario</TabsTrigger>
            <TabsTrigger value="roster"><Users className="h-4 w-4 mr-1.5"/>My scenarios ({scenarios.length})</TabsTrigger>
            <TabsTrigger value="billing"><Receipt className="h-4 w-4 mr-1.5"/>Billing</TabsTrigger>
          </TabsList>
          <Link to="/scenario/new">
            <Button size="sm" className="grad-indigo"><Plus className="h-4 w-4 mr-1.5"/>Create new scenario</Button>
          </Link>
        </div>

        <TabsContent value="lookup">
          <Card className="glass p-8 max-w-2xl mx-auto space-y-5">
            <div className="text-center space-y-1">
              <h2 className="font-display text-xl font-bold">Enter a Scenario ID</h2>
              <p className="text-sm text-muted-foreground">The consumer received this ID after building their scenario. The first agent to look it up becomes the only agent who can view it.</p>
            </div>
            <form onSubmit={submitLookup} className="space-y-3">
              <Input
                value={code}
                onChange={(e)=>setCode(e.target.value.toUpperCase())}
                placeholder="SCN-2026-XXXX-XXXX"
                className="font-mono text-center text-lg h-12 tracking-wider"
                autoFocus
              />
              <Button type="submit" disabled={busy || !code} className="grad-indigo w-full h-11">
                {busy ? "Looking up…" : "Look up scenario"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center">Rate-limited: 10 failed attempts per minute.</p>
          </Card>
        </TabsContent>

        <TabsContent value="roster" className="space-y-4">
          {scenarios.length === 0 ? (
            <Card className="glass p-6 text-center text-sm text-muted-foreground">
              No scenarios claimed yet. Use <strong>Look up scenario</strong> to retrieve one by ID.
            </Card>
          ) : (
            <Card className="glass overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Scenario ID</th>
                    <th className="px-4 py-3">Profile</th>
                    <th className="px-4 py-3">Meds</th>
                    <th className="px-4 py-3">Claimed</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((s) => (
                    <tr key={s.id} className="border-t border-border hover:bg-secondary/30 transition">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link to="/advisor/scenario/$code" params={{ code: s.scenario_code }} className="hover:underline text-primary">
                          {s.scenario_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        b. {s.birth_year} · ZIP {s.zip3}xx · {s.gender ?? "—"}
                      </td>
                      <td className="px-4 py-3">{s.medications.length}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {s.claimed_at ? new Date(s.claimed_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to="/advisor/scenario/$code" params={{ code: s.scenario_code }}>
                          <Button size="sm" variant="ghost">View summary →</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing">
          <Card className="glass p-5">
            <h3 className="font-display font-bold mb-3">Credit ledger</h3>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr><th className="py-2">When</th><th className="py-2">Description</th><th className="py-2 text-right">Δ</th></tr>
              </thead>
              <tbody>
                {creditTxns.map((t) => (
                  <tr key={t.id} className="border-b border-border/60">
                    <td className="py-2 text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                    <td className="py-2">{t.description}</td>
                    <td className={`py-2 text-right tabular-nums font-semibold ${t.amount > 0 ? "text-emerald" : "text-warning"}`}>{t.amount > 0 ? `+${t.amount}` : t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
