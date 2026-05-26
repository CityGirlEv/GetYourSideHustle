import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, MapPin, User, Calendar, DollarSign } from "lucide-react";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import { DrugReport } from "@/components/DrugReport";

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

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`scenario:${code}`);
      if (raw) setScenario(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [code]);

  return (
    <AppShell title="Scenario summary" subtitle={`ID ${code}`}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Link to="/scenario/created/$code" params={{ code }}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1.5"/>Back</Button>
        </Link>

        {!scenario ? (
          <Card className="glass p-6 text-sm text-muted-foreground">
            We couldn't find this scenario in your browser session. Open the link from the device where you created it, or ask your agent to pull it up by Scenario ID.
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
                      <span className="text-muted-foreground">{[m.dose, m.frequency].filter(Boolean).join(" · ") || "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {scenario.medications.length > 0 && <DrugReport medications={scenario.medications} />}
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