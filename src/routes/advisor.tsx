import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, FileSignature, AlertTriangle, CheckCircle2, MapPin, Pill, Receipt, Download } from "lucide-react";
import { IntakeWizard } from "@/components/IntakeWizard";
import { StrategyScorecard } from "@/components/StrategyScorecard";
import { toast } from "sonner";

export const Route = createFileRoute("/advisor")({
  component: AdvisorPortal,
});

function AdvisorPortal() {
  const { user, clients, soas, creditTxns, deductCredit, log } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState("roster");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.navigate({ to: "/" });
  }, [user, router]);
  if (!user) return null;

  const active = selected ? clients.find((c) => c.id === selected) : null;

  const exportDossier = () => {
    if (!deductCredit("Exported dossier PDF")) {
      toast.error("Out of credits — top up to continue auditing.");
      return;
    }
    log("EXPORT_DOSSIER", { client: active?.id });
    toast.success("Dossier exported");
  };

  return (
    <AppShell title="Advisor command center" subtitle="Roster, SOAs, and Medicare strategy auditing">
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="roster"><Users className="h-4 w-4 mr-1.5"/>Roster</TabsTrigger>
          <TabsTrigger value="new"><Plus className="h-4 w-4 mr-1.5"/>New client</TabsTrigger>
          <TabsTrigger value="billing"><Receipt className="h-4 w-4 mr-1.5"/>Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          {active ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>← Back to roster</Button>
                  <h2 className="font-display text-2xl font-bold mt-1">{active.first_name} {active.last_name}</h2>
                  <div className="text-sm text-muted-foreground flex gap-3"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>{active.county} · {active.zip_code}</span><span>DOB {active.dob}</span></div>
                </div>
                <Button onClick={exportDossier} className="grad-indigo"><Download className="h-4 w-4 mr-2"/>Export dossier (1 credit)</Button>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><StrategyScorecard client={active}/></div>
                <Card className="glass p-5">
                  <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Pill className="h-4 w-4 text-primary"/>Medications ({active.meds.length})</h3>
                  <div className="divide-y divide-border">
                    {active.meds.map((m) => (
                      <div key={m.id} className="py-2 text-sm">
                        <div className="font-semibold">{m.medication_name} · {m.strength}</div>
                        <div className="text-xs text-muted-foreground">{m.resolved_diagnosis ?? "Unmapped"} · ${m.estimated_monthly_retail}/mo</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="glass overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">County / ZIP</th>
                    <th className="px-4 py-3">Meds</th>
                    <th className="px-4 py-3">SOA status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => {
                    const soa = soas.find((s) => s.client_id === c.id && s.status === "active");
                    const signedAgo = soa ? (Date.now() - new Date(soa.signed_at).getTime()) / 3600000 : 0;
                    const within48 = soa && signedAgo < 48;
                    return (
                      <tr key={c.id} className="border-t border-border hover:bg-secondary/30 transition cursor-pointer" onClick={() => { setSelected(c.id); log("VIEW_CLIENT_PHI", { client: c.id }); }}>
                        <td className="px-4 py-3 font-semibold">{c.first_name} {c.last_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.county} · {c.zip_code}</td>
                        <td className="px-4 py-3">{c.meds.length}</td>
                        <td className="px-4 py-3">
                          {soa ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${within48 ? "bg-warning/15 text-warning" : "bg-emerald/15 text-emerald"}`}>
                              {within48 ? <AlertTriangle className="h-3 w-3"/> : <CheckCircle2 className="h-3 w-3"/>}
                              {within48 ? `Signed ${signedAgo.toFixed(0)}h ago · within 48h` : `Active · ${new Date(soa.signed_at).toLocaleDateString()}`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-destructive/15 text-destructive">
                              <AlertTriangle className="h-3 w-3"/> Not signed · action required
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost"><FileSignature className="h-4 w-4"/></Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new">
          <IntakeWizard onDone={() => setTab("roster")} />
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
