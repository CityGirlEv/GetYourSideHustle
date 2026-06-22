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

export const Route = createFileRoute("/agent/scenario/$code/edit")({
  component: EditScenario,
});

import { INCOME_BANDS, DEFAULT_INCOME_BAND } from "@/lib/income-bands";

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const CONDITIONS = [
  "Diabetes",
  "Type 2 Diabetes",
  "Hypertension",
  "Heart disease",
  "COPD",
  "Cancer history",
  "Chronic kidney disease",
  "Arthritis",
];

function blankMed(): Medication {
  return {
    id: crypto.randomUUID(),
    medication_name: "",
    strength: "",
    dosage_form: "Tablet",
    frequency: "Daily",
    estimated_monthly_retail: 25,
  };
}

function EditScenario() {
  const { code } = Route.useParams();
  const router = useRouter();
  const { user, authLoading, scenarios, lookupScenario, refreshScenarios, log } = useApp();

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);

  const existing = useMemo(
    () => scenarios.find((s) => s.scenario_code === code),
    [scenarios, code],
  );
  const [scenario, setScenario] = useState<Scenario | null>(existing ?? null);
  const [loading, setLoading] = useState(!existing);

  useEffect(() => {
    if (existing) {
      setScenario(existing);
      setLoading(false);
      return;
    }
    if (!user) return;
    lookupScenario(code)
      .then((s) => {
        setScenario(s);
        setLoading(false);
      })
      .catch((e) => {
        toast.error((e as Error).message);
        router.navigate({ to: "/agent" });
      });
  }, [user, code, existing, lookupScenario, router]);

  const [birthYear, setBirthYear] = useState(0);
  const [zip3, setZip3] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [tobacco, setTobacco] = useState(false);
  const [incomeBand, setIncomeBand] = useState(DEFAULT_INCOME_BAND);
  const [costPref, setCostPref] = useState<"minimize_monthly" | "predictability">(
    "minimize_monthly",
  );
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
    setIncomeBand((scenario.income_band as any) ?? DEFAULT_INCOME_BAND);
    setCostPref(scenario.cost_preference);
    setConditions(scenario.conditions ?? []);
    setCounty(((scenario.preferences ?? {}) as { county?: string }).county ?? "");
    setMeds((scenario.medications ?? []).map((m) => ({ ...m, id: m.id || crypto.randomUUID() })));
  }, [scenario]);

  if (!user || loading || !scenario) return null;

  const toggleCondition = (c: string) =>
    setConditions((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const updateMed = (id: string, patch: Partial<Medication>) =>
    setMeds((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const save = async () => {
    if (!/^\d{3}$/.test(zip3)) {
      toast.error("ZIP must be 3 digits");
      return;
    }
    if (!birthYear || birthYear < 1900) {
      toast.error("Invalid birth year");
      return;
    }
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
    if (error) {
      toast.error(error.message);
      return;
    }
    log("UPDATE_SCENARIO", { scenario: scenario.id });
    await refreshScenarios();
    toast.success("Comparison saved");
    router.history.back();
  };

  return (
    <AppShell
      title={`Edit ${scenario.scenario_code}`}
      subtitle="Update plan comparison details — changes are audit-logged"
    >
      <div className="space-y-4 max-w-4xl">
        <Link to="/agent/scenario/$code" params={{ code: scenario.scenario_code }}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>

        <Card className="glass p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Year of birth</Label>
              <Input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>ZIP3</Label>
              <Input
                value={zip3}
                onChange={(e) => setZip3(e.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            </div>
            <div>
              <Label>County / Parish</Label>
              <Input value={county} onChange={(e) => setCounty(e.target.value.slice(0, 80))} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Gender</Label>
              <div className="grid grid-cols-2 gap-2">
                {GENDER_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 text-sm cursor-pointer border rounded-md px-2.5 py-2 bg-background hover:bg-muted/40 ${
                      gender === value ? "border-primary bg-primary/5" : "border-input"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary shrink-0"
                      checked={gender === value}
                      onChange={() => setGender(value)}
                    />
                    <span className="leading-snug font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tobacco use</Label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary shrink-0"
                  checked={tobacco}
                  onChange={() => setTobacco(true)}
                />
                <span className="text-sm">
                  <strong>Yes</strong> — uses tobacco
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary shrink-0"
                  checked={!tobacco}
                  onChange={() => setTobacco(false)}
                />
                <span className="text-sm">
                  <strong>No</strong> — does not use tobacco
                </span>
              </label>
            </div>
            <div className="col-span-2 md:col-span-3 space-y-2">
              <Label>Income band</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1.5">
                {INCOME_BANDS.map((b) => (
                  <label key={b} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-primary shrink-0"
                      checked={incomeBand === b}
                      onChange={() => setIncomeBand(b)}
                    />
                    <span className="text-sm leading-snug">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Cost preference</Label>
            <div className="flex items-center gap-3 mt-2">
              <Switch
                checked={costPref === "minimize_monthly"}
                onCheckedChange={(v) => setCostPref(v ? "minimize_monthly" : "predictability")}
              />
              <span className="text-sm font-medium">
                {costPref === "minimize_monthly" ? "Minimize monthly cost" : "Predictability"}
              </span>
            </div>
          </div>

          <div>
            <Label>Conditions</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCondition(c)}
                  className={`text-xs leading-tight border rounded-md px-2 py-1.5 text-left transition ${conditions.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input"}`}
                >
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
              <Plus className="h-4 w-4 mr-1" />
              Add medication
            </Button>
          </div>
          <div className="space-y-3">
            {meds.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-12 gap-2 items-end border-b border-border/60 pb-3"
              >
                <div className="col-span-12 md:col-span-4">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={m.medication_name}
                    onChange={(e) => updateMed(m.id, { medication_name: e.target.value })}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs">Strength</Label>
                  <Input
                    value={m.strength}
                    onChange={(e) => updateMed(m.id, { strength: e.target.value })}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs">Form</Label>
                  <Input
                    value={m.dosage_form}
                    onChange={(e) => updateMed(m.id, { dosage_form: e.target.value })}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs">Frequency</Label>
                  <Input
                    value={m.frequency}
                    onChange={(e) => updateMed(m.id, { frequency: e.target.value })}
                  />
                </div>
                <div className="col-span-5 md:col-span-1">
                  <Label className="text-xs">$/mo</Label>
                  <Input
                    type="number"
                    value={m.estimated_monthly_retail}
                    onChange={(e) =>
                      updateMed(m.id, { estimated_monthly_retail: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setMeds((p) => p.filter((x) => x.id !== m.id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {meds.length === 0 && (
              <div className="text-sm text-muted-foreground">No medications.</div>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/agent/scenario/$code" params={{ code: scenario.scenario_code }}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button onClick={save} disabled={busy} className="grad-indigo">
            <Save className="h-4 w-4 mr-2" />
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
