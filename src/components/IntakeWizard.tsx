import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Plus, Trash2, ChevronRight, ChevronLeft, Pill, ShieldAlert, Search, X } from "lucide-react";
import { resolveDiagnosis, COMMON_MEDS_BY_CONDITION, searchMedCatalog, type MedCatalogEntry } from "@/lib/diagnosis-resolver";
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
  const [focusedMedId, setFocusedMedId] = useState<string | null>(null);
  const [medQuery, setMedQuery] = useState<Record<string, string>>({});

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

  const applyCatalogEntry = (id: string, entry: MedCatalogEntry) => {
    setMeds((p) => p.map((m) => m.id === id ? {
      ...m,
      medication_name: entry.name,
      strength: entry.strength ?? m.strength,
      dosage_form: entry.form ?? m.dosage_form,
      frequency: entry.freq ?? m.frequency,
      estimated_monthly_retail: entry.retail ?? m.estimated_monthly_retail,
      resolved_diagnosis: resolveDiagnosis(entry.name) ?? entry.category ?? m.resolved_diagnosis,
    } : m));
    setMedQuery((q) => ({ ...q, [id]: "" }));
    setFocusedMedId(null);
  };

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
    const code = data as string;
    try {
      sessionStorage.setItem(`scenario:${code}`, JSON.stringify({
        scenarioCode: code,
        year: new Date().getFullYear() < 2027 ? 2026 : 2027,
        birthYear, zip3, gender, tobacco,
        incomeBand, costPreference: costPref,
        conditions, medications: meds,
      }));
    } catch { /* ignore quota */ }
    toast.success("Scenario created");
    onDone?.(code);
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

          <Card className="p-4 bg-muted/40 border-dashed">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Your scenario so far</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
              <div><span className="text-muted-foreground">Birth year:</span> {birthYear}</div>
              <div><span className="text-muted-foreground">ZIP3:</span> {zip3 || "—"}</div>
              <div><span className="text-muted-foreground">Gender:</span> {gender.replace(/_/g," ")}</div>
              <div><span className="text-muted-foreground">Tobacco:</span> {tobacco ? "Yes" : "No"}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Income:</span> {incomeBand}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Priority:</span> {costPref === "minimize_monthly" ? "Minimize monthly cost" : "Predictability"}</div>
              <div className="col-span-full">
                <span className="text-muted-foreground">Conditions:</span>{" "}
                {conditions.length ? conditions.join(", ") : "None selected"}
              </div>
            </div>
          </Card>

          {(() => {
            const suggestions = conditions.flatMap((c) =>
              (COMMON_MEDS_BY_CONDITION[c] ?? []).map((m) => ({ ...m, condition: c }))
            );
            if (!suggestions.length) return (
              <p className="text-xs text-muted-foreground">
                Tip: go back to Step 3 and pick your conditions to see a list of common medications you can add with one click.
              </p>
            );
            return (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="text-sm font-semibold mb-2">Common medications for your conditions</div>
                <p className="text-xs text-muted-foreground mb-3">Don't remember the exact drug? Click any to add it — you can edit details after.</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => {
                    const already = meds.some((m) => m.medication_name.trim().toLowerCase() === s.name.toLowerCase());
                    return (
                      <button
                        key={`${s.name}-${i}`}
                        type="button"
                        disabled={already}
                        onClick={() => setMeds((p) => {
                          const next: Medication = {
                            id: crypto.randomUUID(),
                            medication_name: s.name,
                            strength: s.strength ?? "",
                            dosage_form: s.form ?? "Tablet",
                            frequency: s.freq ?? "Daily",
                            estimated_monthly_retail: s.retail ?? 25,
                            resolved_diagnosis: resolveDiagnosis(s.name) ?? s.condition,
                          };
                          // If the only existing med is empty, replace it.
                          if (p.length === 1 && !p[0].medication_name.trim()) return [next];
                          return [...p, next];
                        })}
                        className={`text-xs border rounded-full px-3 py-1.5 transition ${already ? "bg-muted text-muted-foreground border-border cursor-not-allowed" : "bg-background border-primary/40 hover:bg-primary hover:text-primary-foreground"}`}
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        {s.name} {s.strength ? <span className="opacity-70">({s.strength})</span> : null}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })()}

          {meds.map((m) => (
            <Card key={m.id} className="p-4 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="relative col-span-2 md:col-span-1">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-7"
                      placeholder="Search drug or DME…"
                      value={m.medication_name}
                      onFocus={() => setFocusedMedId(m.id)}
                      onBlur={() => setTimeout(() => setFocusedMedId((cur) => cur === m.id ? null : cur), 150)}
                      onChange={(e) => {
                        updateMed(m.id, { medication_name: e.target.value });
                        setMedQuery((q) => ({ ...q, [m.id]: e.target.value }));
                        setFocusedMedId(m.id);
                      }}
                    />
                  </div>
                  {focusedMedId === m.id && (() => {
                    const q = medQuery[m.id] ?? m.medication_name;
                    const results = searchMedCatalog(q, 8);
                    if (!results.length) return null;
                    return (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-72 overflow-auto">
                        {results.map((r) => (
                          <button
                            key={r.name}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); applyCatalogEntry(m.id, r); }}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                          >
                            <div className="font-medium">{r.name} {r.strength && r.strength !== "—" ? <span className="text-muted-foreground font-normal">· {r.strength}</span> : null}</div>
                            <div className="text-xs text-muted-foreground">
                              {r.form ?? "—"} · {r.category ?? "—"}
                              {r.aliases?.length ? <span className="opacity-70"> · aka {r.aliases.join(", ")}</span> : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
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
