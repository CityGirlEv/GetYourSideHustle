import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StrategyScorecard } from "@/components/StrategyScorecard";
import { ArrowLeft, MapPin, Pill, Download, FileSignature, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/advisor/scenario/$code")({ component: ScenarioDetail });

function ScenarioDetail() {
  const { code } = Route.useParams();
  const { user, authLoading, scenarios, lookupScenario, soas, addSOA, deductCredit, log } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    if (scenarios.some((s) => s.scenario_code === code)) { setLoading(false); return; }
    lookupScenario(code).then(() => setLoading(false)).catch((e) => {
      toast.error((e as Error).message);
      router.navigate({ to: "/advisor" });
    });
  }, [user, code, scenarios, lookupScenario, router]);

  if (!user || loading) return null;
  const scenario = scenarios.find((s) => s.scenario_code === code);
  if (!scenario) return null;

  const soa = soas.find((s) => s.scenario_id === scenario.id && s.status === "active");

  const exportDossier = async () => {
    if (!(await deductCredit("Exported dossier PDF"))) {
      toast.error("Out of credits — top up to continue."); return;
    }
    log("EXPORT_DOSSIER", { scenario: scenario.id });
    toast.success("Dossier exported");
  };

  const signSOA = async () => {
    await addSOA(scenario.id, "Medicare Advantage");
    toast.success("SOA recorded for this scenario");
  };

  return (
    <AppShell title={`Scenario ${scenario.scenario_code}`} subtitle="De-identified data — no personal information attached">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link to="/advisor"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button></Link>
          <Button onClick={exportDossier} className="grad-indigo"><Download className="h-4 w-4 mr-2"/>Export dossier (1 credit)</Button>
        </div>

        <Card className="glass p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><div className="text-xs text-muted-foreground uppercase">Year of birth</div><div className="font-semibold">{scenario.birth_year}</div></div>
            <div><div className="text-xs text-muted-foreground uppercase flex items-center gap-1"><MapPin className="h-3 w-3"/>ZIP region</div><div className="font-semibold">{scenario.zip3}xx</div></div>
            <div><div className="text-xs text-muted-foreground uppercase">Gender</div><div className="font-semibold capitalize">{scenario.gender?.replace(/_/g," ") ?? "—"}</div></div>
            <div><div className="text-xs text-muted-foreground uppercase">Tobacco</div><div className="font-semibold">{scenario.tobacco ? "Yes" : "No"}</div></div>
            <div><div className="text-xs text-muted-foreground uppercase">Income band</div><div className="font-semibold">{scenario.income_band ?? "—"}</div></div>
            <div><div className="text-xs text-muted-foreground uppercase">Cost preference</div><div className="font-semibold">{scenario.cost_preference === "minimize_monthly" ? "Minimize monthly" : "Predictability"}</div></div>
            <div className="col-span-2"><div className="text-xs text-muted-foreground uppercase">Conditions</div>
              <div className="font-semibold">{scenario.conditions.length > 0 ? scenario.conditions.join(", ") : "None reported"}</div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><StrategyScorecard scenario={scenario}/></div>
          <div className="space-y-4">
            <Card className="glass p-5">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Pill className="h-4 w-4 text-primary"/>Medications ({scenario.medications.length})</h3>
              <div className="divide-y divide-border">
                {scenario.medications.map((m) => (
                  <div key={m.id} className="py-2 text-sm">
                    <div className="font-semibold">{m.medication_name || "Unnamed"} · {m.strength}</div>
                    <div className="text-xs text-muted-foreground">{m.resolved_diagnosis ?? "Unmapped"} · ${m.estimated_monthly_retail}/mo</div>
                  </div>
                ))}
                {scenario.medications.length === 0 && <div className="py-2 text-xs text-muted-foreground">None listed</div>}
              </div>
            </Card>

            <Card className="glass p-5">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><FileSignature className="h-4 w-4 text-primary"/>Scope of Appointment</h3>
              {soa ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald font-semibold"><ShieldCheck className="h-4 w-4"/> On file</div>
                  <div className="text-xs text-muted-foreground">Signed {new Date(soa.signed_at).toLocaleString()} · {soa.plan_type}</div>
                </div>
              ) : (
                <Button onClick={signSOA} className="w-full">Record SOA for this scenario</Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
