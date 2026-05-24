import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StrategyScorecard } from "@/components/StrategyScorecard";
import { ArrowLeft, MapPin, Pill, Download, FileSignature, ShieldCheck, FileSpreadsheet, Pencil } from "lucide-react";
import { toast } from "sonner";
import { buildScenarioPdf } from "@/lib/scenario-pdf";
import { buildScenarioXlsx } from "@/lib/scenario-xlsx";

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
    try {
      const doc = buildScenarioPdf(buildExportInput(scenario, year));
      doc.save(`${scenario.scenario_code}-dossier.pdf`);
      log("EXPORT_DOSSIER", { scenario: scenario.id, format: "pdf" });
      toast.success("Dossier PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF");
    }
  };

  const exportXlsx = async () => {
    if (!(await deductCredit("Exported dossier XLSX"))) {
      toast.error("Out of credits — top up to continue."); return;
    }
    try {
      const wb = await buildScenarioXlsx(buildExportInput(scenario, year));
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${scenario.scenario_code}-dossier.xlsx`;
      a.click(); URL.revokeObjectURL(url);
      log("EXPORT_DOSSIER", { scenario: scenario.id, format: "xlsx" });
      toast.success("Dossier spreadsheet downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate spreadsheet");
    }
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
          <div className="flex flex-wrap gap-2">
            <Link to="/advisor/scenario/$code/edit" params={{ code: scenario.scenario_code }}>
              <Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-2"/>Edit scenario</Button>
            </Link>
            <Button onClick={exportXlsx} variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-2"/>Excel (1 credit)</Button>
            <Button onClick={exportDossier} className="grad-indigo"><Download className="h-4 w-4 mr-2"/>PDF dossier (1 credit)</Button>
          </div>
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
