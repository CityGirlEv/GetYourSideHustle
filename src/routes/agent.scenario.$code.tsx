import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StrategyScorecard } from "@/components/StrategyScorecard";
import {
  ArrowLeft,
  MapPin,
  Pill,
  Download,
  FileSignature,
  ShieldCheck,
  FileSpreadsheet,
  Pencil,
  MessageSquare,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { buildScenarioPdf, type ScenarioPdfInput } from "@/lib/scenario-pdf";
import { downloadScenarioXlsx } from "@/lib/scenario-xlsx";
import { ScenarioConversationDialog } from "@/components/ScenarioConversationDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Scenario } from "@/lib/app-store";
import type { Year } from "@/lib/medicare-math";

function buildExportInput(s: Scenario, year: Year): ScenarioPdfInput {
  const prefs = (s.preferences ?? {}) as { county?: string };
  return {
    scenarioCode: s.scenario_code,
    year,
    birthYear: s.birth_year,
    zip3: s.zip3,
    county: prefs.county,
    gender: s.gender ?? "prefer_not_to_say",
    tobacco: s.tobacco,
    incomeBand: s.income_band ?? "—",
    costPreference: s.cost_preference,
    conditions: s.conditions ?? [],
    medications: s.medications ?? [],
  };
}

export const Route = createFileRoute("/agent/scenario/$code")({
  component: ScenarioDetail,
});

function ScenarioDetail() {
  const { code } = Route.useParams();
  const { user, authLoading, scenarios, lookupScenario, soas, addSOA, deductCredit, log, year } =
    useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const existing = scenarios.find((s) => s.scenario_code === code);
    if (existing) {
      setNotes(existing.agent_notes ?? "");
      setLoading(false);
      return;
    }
    lookupScenario(code)
      .then((s) => {
        setNotes(s.agent_notes ?? "");
        setLoading(false);
      })
      .catch((e) => {
        toast.error((e as Error).message);
        router.navigate({ to: "/agent" });
      });
  }, [user, code, scenarios, lookupScenario, router]);

  if (!user || loading) return null;
  const scenario = scenarios.find((s) => s.scenario_code === code);
  if (!scenario) return null;

  const soa = soas.find((s) => s.scenario_id === scenario.id && s.status === "active");

  const exportDossier = async () => {
    if (!(await deductCredit("Exported dossier PDF"))) {
      toast.error("Out of credits — top up to continue.");
      return;
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
      toast.error("Out of credits — top up to continue.");
      return;
    }
    try {
      await downloadScenarioXlsx(buildExportInput(scenario, year));
      log("EXPORT_DOSSIER", { scenario: scenario.id, format: "xlsx" });
      toast.success("Dossier spreadsheet downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate spreadsheet");
    }
  };

  const signSOA = async () => {
    await addSOA(scenario.id, "Medicare Advantage");
    toast.success("SOA recorded for this comparison");
  };

  const saveNotes = async () => {
    setSaving(true);
    // Note: Database function expects scenario UUID, not code
    const { error } = await supabase.rpc("agent_update_notes", {
      p_scenario: scenario.id,
      p_notes: notes,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Notes saved");
    scenario.agent_notes = notes;
  };

  const canAddNotes =
    user?.role === "admin" ||
    scenario.assigned_agent_id === user?.id ||
    scenario.claimed_by === user?.id;

  return (
    <AppShell
      title={`Comparison ${scenario.scenario_code}`}
      subtitle="De-identified data — no personal information attached"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link to="/agent">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to command center
            </Button>
          </Link>
          <Link to="/agent/scenario/$code/edit" params={{ code: scenario.scenario_code }}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit comparison
            </Button>
          </Link>
        </div>

        <Card className="glass p-5">
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h2 className="font-display text-lg font-bold">Recommendation</h2>
              <p className="text-xs text-muted-foreground">
                Strategy scorecard for comparison {scenario.scenario_code}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportXlsx} variant="outline" size="sm" className="h-8 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                Excel · 1 cr
              </Button>
              <Button onClick={exportDossier} size="sm" className="grad-indigo h-8 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                PDF · 1 cr
              </Button>
            </div>
          </div>
          <StrategyScorecard scenario={scenario} />
        </Card>

        <Card className="glass p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground uppercase">Year of birth</div>
              <div className="font-semibold">{scenario.birth_year}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                ZIP region
              </div>
              <div className="font-semibold">{scenario.zip3}xx</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Gender</div>
              <div className="font-semibold capitalize">
                {scenario.gender?.replace(/_/g, " ") ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Tobacco</div>
              <div className="font-semibold">{scenario.tobacco ? "Yes" : "No"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Income band</div>
              <div className="font-semibold">{scenario.income_band ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Cost preference</div>
              <div className="font-semibold">
                {scenario.cost_preference === "minimize_monthly"
                  ? "Minimize monthly"
                  : "Predictability"}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground uppercase">Conditions</div>
              <div className="font-semibold">
                {scenario.conditions.length > 0 ? scenario.conditions.join(", ") : "None reported"}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="glass p-5">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                Medications ({scenario.medications.length})
              </h3>
              <div className="divide-y divide-border">
                {scenario.medications.map((m) => (
                  <div key={m.id} className="py-2 text-sm">
                    <div className="font-semibold">
                      {m.medication_name || "Unnamed"} · {m.strength}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.resolved_diagnosis ?? "Unmapped"} · ${m.estimated_monthly_retail}/mo
                    </div>
                  </div>
                ))}
                {scenario.medications.length === 0 && (
                  <div className="py-2 text-xs text-muted-foreground">None listed</div>
                )}
              </div>
            </Card>
          </div>
          <div className="space-y-4 font-normal">
            <Card className="glass p-5">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-primary" />
                Scope of Appointment
              </h3>
              {soa ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald font-semibold">
                    <ShieldCheck className="h-4 w-4" /> On file
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Signed {new Date(soa.signed_at).toLocaleString()} · {soa.plan_type}
                  </div>
                </div>
              ) : (
                <Button onClick={signSOA} className="w-full">
                  Record SOA for this comparison
                </Button>
              )}
            </Card>
            <Card className="glass p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Agent notes
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNotesDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1 text-primary" />
                  View thread
                </Button>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                maxLength={10000}
                placeholder="Record your notes, plan recommendations, and next steps…"
              />
              <div className="flex justify-end">
                <Button onClick={saveNotes} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Saving…" : "Save notes"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ScenarioConversationDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        scenarioId={scenario.id}
        scenarioCode={scenario.scenario_code}
        currentUserId={user?.id ?? null}
        canAddNotes={canAddNotes}
      />
    </AppShell>
  );
}
