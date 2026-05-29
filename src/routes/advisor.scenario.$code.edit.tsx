import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp, type Scenario } from "@/lib/app-store";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Medication } from "@/lib/medicare-math";

export const Route = createFileRoute("/advisor/scenario/$code/edit")({
  component: EditScenario,
});

const INCOME_BANDS = ["Under $25k", "$25k–$50k", "$50k–$100k", "$100k–$200k", "Over $200k", "Prefer not to say"];
const CONDITIONS = ["Diabetes", "Hypertension", "Heart disease", "COPD", "Cancer history", "Chronic kidney disease", "Arthritis"];

function blankMed(): Medication {
  return { id: crypto.randomUUID(), medication_name: "", strength: "", dosage_form: "Tablet", frequency: "Daily", estimated_monthly_retail: 25 };
}

function EditScenario() {
  const { code } = Route.useParams();
  const router = useRouter();
  const { user, authLoading, scenarios, lookupScenario, refreshScenarios, log } = useApp();

  useEffect(() => { if (!authLoading && !user) router.navigate({ to: "/auth" }); }, [user, authLoading, router]);

  const existing = useMemo(() => scenarios.find((s) => s.scenario_code === code), [scenarios, code]);
  const [scenario, setScenario] = useState<Scenario | null>(existing ?? null);
  const [loading, setLoading] = useState(!existing);

  useEffect(() => {
    if (existing) { setScenario(existing); setLoading(false); return; }
    if (!user) return;
    lookupScenario(code).then((s) => { setScenario(s); setLoading(false); })
      .catch((e) => { toast.error((e as Error).message); router.navigate({ to: "/advisor" }); });
  }, [user, code, existing, lookupScenario, router]);

  const [birthYear, setBirthYear] = useState(0);
  const [zip3, setZip3] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [tobacco, setTobacco] = useState(false);
  const [incomeBand, setIncomeBand] = useState(INCOME_BANDS[2]);
  const [costPref, setCostPref] = useState<"minimize_monthly" | "predictability">("minimize_monthly");
  const [conditions, setConditions] = useState<string[]>([]);
  const [county, setCounty] = useState("");
  const [meds, setMeds] = useState<Medication[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!scenario) return;
    setBirthYear(scenario.birth_year);
    setZip3(scenario.zip3);
    setGender(scenario.gender ?? "prefer_not_to_say");
    setTobacco(scenario.tobacco);
    setIncomeBand(scenario.income_band ?? INCOME_BANDS[2]);
    setCostPref(scenario.cost_preference);
    setConditions(scenario.conditions ?? []);
    setCounty(((scenario.preferences ?? {}) as { county?: string }).county ?? "");
    setMeds((scenario.medications ?? []).map((m) => ({ ...m, id: m.id || crypto.randomUUID() })));
  }, [scenario]);

  if (!user || loading || !scenario) return null;

  const toggleCondition = (c: string) =>
    setConditions((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  const updateMed = (id: string, patch: Partial<Medication>) =>
    setMeds((p) => p.map((m) => m.id === id ? { ...m, ...patch } : m));

  const save = async () => {
    if (!/^\d{3}$/.test(zip3)) { toast.error("ZIP must be 3 digits"); return; }
    if (!birthYear || birthYear < 1900) { toast.error("Invalid birth year"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("update_scenario", {
      p_scenario_id: scenario.id,
      p_birth_year: birthYear,
      p_zip3: zip3,
      p_gender: gender,
      p_tobacco: tobacco,
      p_income_band: incomeBand,
      p_cost_preference: costPref,
      p_medications: meds as unknown as never,
      p_conditions: conditions as unknown as never,
      p_preferences: { county } as unknown as never,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    log("UPDATE_SCENARIO", { scenario: scenario.id });
    await refreshScenarios();
    toast.success("Scenario saved");
    router.history.back();
  };

  return (
    <AppShell title={`Edit ${scenario.scenario_code}`} subtitle="Update scenario details — changes are audit-logged">
      <div className="space-y-4 max-w-4xl">
        <Link to="/advisor/scenario/$code" params={{ code: scenario.scenario_code }}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button>
        </Link>

        <Card className="glass p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Year of birth</Label>
              <Input type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} />
            </div>
            <div>
              <Label>ZIP3</Label>
              <Input value={zip3} onChange={(e) => setZip3(e.target.value.replace(/\D/g, "").slice(0, 3))} />
            </div>
            <div>
              <Label>County / Parish</Label>
              <Input value={county} onChange={(e) => setCounty(e.target.value.slice(0, 80))} />
            </div>
            <div>
              <Label>Gender</Label>
              <select className="w-full border border-input rounded-md px-3 h-9 bg-background" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <Label>Income band</Label>
              <select className="w-full border border-input rounded-md px-3 h-9 bg-background" value={incomeBand} onChange={(e) => setIncomeBand(e.target.value)}>
                {INCOME_BANDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <Switch checked={tobacco} onCheckedChange={setTobacco}/>
              <Label className="!mt-0">Tobacco user</Label>
            </div>
          </div>

          <div>
            <Label>Cost preference</Label>
            <div className="flex items-center gap-3 mt-2">
              <Switch checked={costPref === "minimize_monthly"} onCheckedChange={(v) => setCostPref(v ? "minimize_monthly" : "predictability")}/>
              <span className="text-sm font-medium">{costPref === "minimize_monthly" ? "Minimize monthly cost" : "Predictability"}</span>
            </div>
          </div>

          <div>
            <Label>Conditions</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {CONDITIONS.map((c) => (
                <button key={c} type="button" onClick={() => toggleCondition(c)}
                  className={`text-sm border rounded-md px-3 py-2 text-left transition ${conditions.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="glass p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Medications</h3>
            <Button size="sm" variant="outline" onClick={() => setMeds((p) => [...p, blankMed()])}>
              <Plus className="h-4 w-4 mr-1"/>Add medication
            </Button>
          </div>
          <div className="space-y-3">
            {meds.map((m) => (
              <div key={m.id} className="grid grid-cols-12 gap-2 items-end border-b border-border/60 pb-3">
                <div className="col-span-12 md:col-span-4">
                  <Label className="text-xs">Name</Label>
                  <Input value={m.medication_name} onChange={(e) => updateMed(m.id, { medication_name: e.target.value })} />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs">Strength</Label>
                  <Input value={m.strength} onChange={(e) => updateMed(m.id, { strength: e.target.value })} />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs">Form</Label>
                  <Input value={m.dosage_form} onChange={(e) => updateMed(m.id, { dosage_form: e.target.value })} />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs">Frequency</Label>
                  <Input value={m.frequency} onChange={(e) => updateMed(m.id, { frequency: e.target.value })} />
                </div>
                <div className="col-span-5 md:col-span-1">
                  <Label className="text-xs">$/mo</Label>
                  <Input type="number" value={m.estimated_monthly_retail} onChange={(e) => updateMed(m.id, { estimated_monthly_retail: Number(e.target.value) })} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button size="icon" variant="ghost" onClick={() => setMeds((p) => p.filter((x) => x.id !== m.id))}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              </div>
            ))}
            {meds.length === 0 && <div className="text-sm text-muted-foreground">No medications.</div>}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/advisor/scenario/$code" params={{ code: scenario.scenario_code }}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button onClick={save} disabled={busy} className="grad-indigo">
            <Save className="h-4 w-4 mr-2"/>{busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}