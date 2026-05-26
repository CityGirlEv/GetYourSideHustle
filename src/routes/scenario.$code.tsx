import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, MapPin, User, Calendar, DollarSign, FileDown, FileText } from "lucide-react";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import { downloadConsumerScenarioPdf } from "@/lib/scenario-pdf";
import { downloadScenarioXlsx } from "@/lib/scenario-xlsx";
import { DrugReport } from "@/components/DrugReport";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getScenarioByCode } from "@/lib/scenario-lookup.functions";

export const Route = createFileRoute("/scenario/$code")({
  head: () => ({
    meta: [
      { title: "Scenario Summary — The Medicare Optimizer" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScenarioSummary,
});

function ScenarioSummary() {
  const { code } = Route.useParams();
  const [scenario, setScenario] = useState<(ScenarioPdfInput & { county?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchByCode = useServerFn(getScenarioByCode);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Always fetch fresh from DB so links work across devices/sessions.
    fetchByCode({ data: { code } })
      .then((s) => {
        if (cancelled) return;
        setScenario(s as ScenarioPdfInput & { county?: string });
        try { sessionStorage.setItem(`scenario:${code}`, JSON.stringify(s)); } catch { /* ignore */ }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // Fallback to any cached copy in sessionStorage
        try {
          const raw = sessionStorage.getItem(`scenario:${code}`);
          if (raw) { setScenario(JSON.parse(raw)); return; }
        } catch { /* ignore */ }
        const msg = e instanceof Error ? e.message : "Could not load scenario";
        setError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [code, fetchByCode]);

  const downloadPdf = () => {
    try {
      if (!scenario) { toast.error("PDF not available"); return; }
      downloadConsumerScenarioPdf(scenario);
      toast.success("PDF downloaded");
    } catch (e) { toast.error("Could not generate PDF"); console.error(e); }
  };

  const downloadWord = () => {
    try {
      if (!scenario) { toast.error("Workbook not available"); return; }
      downloadScenarioXlsx({ ...scenario, county: scenario.county });
      toast.success("Excel workbook downloaded");
    } catch (e) { toast.error("Could not generate workbook"); console.error(e); }
  };

  return (
    <AppShell title="Scenario summary" subtitle={`ID ${code}`}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Link to="/scenario/created/$code" params={{ code }}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1.5"/>Back</Button>
        </Link>

        {loading ? (
          <Card className="glass p-6 text-sm text-muted-foreground">Loading scenario…</Card>
        ) : !scenario ? (
          <Card className="glass p-6 text-sm text-muted-foreground">
            We couldn't load this scenario. {error ? <span className="block mt-1 text-xs">({error})</span> : null}
            <div className="mt-2 text-xs">Sign in with a staff account (admin, agent, advisor, qa, editor, or viewer) to view any scenario by ID.</div>
          </Card>
        ) : (
          <>
            <Card className="glass p-6 space-y-4">
              <h2 className="font-display text-xl font-bold">Your information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <Field icon={<Calendar className="h-3 w-3"/>} label="Plan year" value={String(scenario.year)} />
                <Field icon={<User className="h-3 w-3"/>} label="Birth year" value={String(scenario.birthYear)} />
                <Field icon={<MapPin className="h-3 w-3"/>} label="ZIP region" value={`${scenario.zip3}xx${scenario.county ? ` · ${scenario.county}` : ""}`} />
                <Field label="Gender" value={scenario.gender?.replace(/_/g, " ") || "—"} />
                <Field label="Tobacco" value={scenario.tobacco ? "Yes" : "No"} />
                <Field label="Income band" value={scenario.incomeBand || "—"} />
                <Field icon={<DollarSign className="h-3 w-3"/>} label="Cost preference" value={scenario.costPreference === "minimize_monthly" ? "Minimize monthly" : "Predictability"} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Conditions</div>
                <div className="text-sm">{scenario.conditions.length ? scenario.conditions.join(", ") : "None reported"}</div>
              </div>
            </Card>

            <Card className="glass p-6 space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2"><Pill className="h-4 w-4 text-primary"/>Medications ({scenario.medications.length})</h2>
              {scenario.medications.length === 0 ? (
                <div className="text-sm text-muted-foreground">None listed.</div>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {scenario.medications.map((m, i) => (
                    <li key={i} className="py-2 flex justify-between gap-3">
                      <span className="font-medium">{m.medication_name}</span>
                      <span className="text-muted-foreground">{[m.strength, m.dosage_form, m.frequency].filter(Boolean).join(" · ") || "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {scenario.medications.length > 0 && <DrugReport medications={scenario.medications} />}

            <div className="flex gap-3">
              <Button onClick={downloadPdf} variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" /> PDF
              </Button>
              <Button onClick={downloadWord} variant="outline" className="flex-1">
                <FileDown className="h-4 w-4 mr-2" /> Word
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}