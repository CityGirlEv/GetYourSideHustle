import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Plus, Trash2, ChevronRight, ChevronLeft, Pill, ShieldAlert } from "lucide-react";
import { resolveDiagnosis } from "@/lib/diagnosis-resolver";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Medication } from "@/lib/medicare-math";

function blankMed(): Medication {
  return { id: crypto.randomUUID(), medication_name: "", strength: "", dosage_form: "Tablet", frequency: "Daily", estimated_monthly_retail: 25 };
}

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - 50 - i); // 50..109 years old
const INCOME_BANDS = ["Under $25k", "$25k–$50k", "$50k–$100k", "$100k–$200k", "Over $200k", "Prefer not to say"];
const CONDITIONS = ["Diabetes", "Hypertension", "Heart disease", "COPD", "Cancer history", "Chronic kidney disease", "Arthritis", "None of the above"];

export function IntakeWizard({ onDone }: { onDone?: (code: string) => void }) {
  const [step, setStep] = useState(1);
  const [birthYear, setBirthYear] = useState<number>(CURRENT_YEAR - 67);
  const [zip3, setZip3] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [tobacco, setTobacco] = useState(false);
  const [incomeBand, setIncomeBand] = useState(INCOME_BANDS[2]);
  const [costPref, setCostPref] = useState<"minimize_monthly" | "predictability">("minimize_monthly");
  const [conditions, setConditions] = useState<string[]>([]);
  const [meds, setMeds] = useState<Medication[]>([blankMed()]);
  const [busy, setBusy] = useState(false);

  const toggleCondition = (c: string) =>
    setConditions((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  const updateMed = (id: string, patch: Partial<Medication>) =>
    setMeds((p) => p.map((m) => {
      if (m.id !== id) return m;
      const next = { ...m, ...patch };
      if (patch.medication_name !== undefined) {
        next.resolved_diagnosis = resolveDiagnosis(patch.medication_name) ?? m.resolved_diagnosis;
      }
      return next;
    }));

  const finish = async () => {
    if (!/^\d{3}$/.test(zip3)) {
      toast.error("ZIP3 must be exactly 3 digits");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("create_scenario", {
      p_birth_year: birthYear,
      p_zip3: zip3,
      p_gender: gender,
      p_tobacco: tobacco,
      p_income_band: incomeBand,
      p_cost_preference: costPref,
      p_medications: meds as unknown as never,
      p_conditions: conditions as unknown as never,
      p_preferences: {} as unknown as never,
    });
    setBusy(false);
    if (error || !data) { toast.error(error?.message ?? "Could not create scenario"); return; }
    toast.success("Scenario created");
    onDone?.(data as string);
  };

  return (
    <Card className="glass p-6 max-w-3xl mx-auto">
      <div className="flex gap-2 bg-warning/10 border border-warning/30 rounded-md p-3 mb-5 text-xs">
        <ShieldAlert className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <strong>We do not collect any personally identifiable information.</strong> Do NOT enter your name, address, phone, email, Social Security number, Medicare ID, or full date of birth — there are no fields for these. You will receive a Scenario ID to share with your agent yourself.
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 1 · Basics (no name, no birth date)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Year of birth</Label>
              <select className="w-full border border-input rounded-md px-3 h-9 bg-background" value={birthYear} onChange={(e)=>setBirthYear(Number(e.target.value))}>
                {BIRTH_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <Label>First 3 digits of ZIP code</Label>
              <Input value={zip3} onChange={(e)=>setZip3(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="e.g. 770" inputMode="numeric" maxLength={3}/>
            </div>
            <div>
              <Label>Gender</Label>
              <select className="w-full border border-input rounded-md px-3 h-9 bg-background" value={gender} onChange={(e)=>setGender(e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <Label>Income band</Label>
              <select className="w-full border border-input rounded-md px-3 h-9 bg-background" value={incomeBand} onChange={(e)=>setIncomeBand(e.target.value)}>
                {INCOME_BANDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch checked={tobacco} onCheckedChange={setTobacco}/>
              <Label className="!mt-0">Tobacco user</Label>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 2 · Cost preference</h3>
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="font-medium mb-3">Is minimizing your monthly out-of-pocket cost a top priority, or do you prefer total predictability (no surprise medical bills)?</p>
            <div className="flex items-center gap-3">
              <Switch checked={costPref === "minimize_monthly"} onCheckedChange={(v)=>setCostPref(v ? "minimize_monthly" : "predictability")}/>
              <span className="font-semibold">{costPref === "minimize_monthly" ? "Minimize monthly cost" : "Predictability matters more"}</span>
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 3 · Conditions (optional)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CONDITIONS.map((c) => (
              <button key={c} type="button" onClick={()=>toggleCondition(c)}
                className={`text-sm border rounded-md px-3 py-2 text-left transition ${conditions.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">Step 4 · Medications</h3>
            <Button size="sm" variant="outline" onClick={() => setMeds([...meds, blankMed()])}><Plus className="h-4 w-4 mr-1"/>Add</Button>
          </div>
          {meds.map((m) => (
            <Card key={m.id} className="p-4 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Input placeholder="Name (e.g. Lisinopril)" value={m.medication_name} onChange={(e) => updateMed(m.id, { medication_name: e.target.value })}/>
                <Input placeholder="Strength" value={m.strength} onChange={(e) => updateMed(m.id, { strength: e.target.value })}/>
                <Input placeholder="Form" value={m.dosage_form} onChange={(e) => updateMed(m.id, { dosage_form: e.target.value })}/>
                <Input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMed(m.id, { frequency: e.target.value })}/>
                <Input type="number" placeholder="$/mo retail" value={m.estimated_monthly_retail} onChange={(e) => updateMed(m.id, { estimated_monthly_retail: Number(e.target.value) })}/>
              </div>
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="text-muted-foreground flex items-center gap-1 flex-1"><Pill className="h-3 w-3"/>
                  Auto-resolved condition: <Input className="h-7 flex-1" value={m.resolved_diagnosis ?? ""} placeholder="auto" onChange={(e) => updateMed(m.id, { resolved_diagnosis: e.target.value })}/>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setMeds(meds.filter(x => x.id !== m.id))}><Trash2 className="h-4 w-4"/></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft className="h-4 w-4"/>Back</Button>
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} className="grad-indigo">Next<ChevronRight className="h-4 w-4"/></Button>
        ) : (
          <Button onClick={finish} disabled={busy} className="grad-indigo">{busy ? "Creating…" : "Create scenario"}</Button>
        )}
      </div>
    </Card>
  );
}
