import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Plus, Trash2, ChevronRight, ChevronLeft, Pill, ShieldAlert, Search, X, AlertTriangle, Upload } from "lucide-react";
import { resolveDiagnosis, COMMON_MEDS_BY_CONDITION, searchMedCatalog, type MedCatalogEntry } from "@/lib/diagnosis-resolver";
import { searchRxNorm, getGenericFor, type RxNormSuggestion } from "@/lib/rxnorm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VoiceButton, matchSpokenOption } from "./VoiceButton";
import type { Medication } from "@/lib/medicare-math";
import {
  countiesForZip3,
  countyMatchesZip3,
  type Zip3County,
} from "@/lib/zip3-county-lookup";

function blankMed(): Medication {
  return { id: crypto.randomUUID(), medication_name: "", strength: "", dosage_form: "Tablet", frequency: "Daily", estimated_monthly_retail: 25 };
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 110;
const MAX_BIRTH_YEAR = CURRENT_YEAR;
const BIRTH_YEARS = Array.from({ length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 }, (_, i) => MAX_BIRTH_YEAR - i); // today back to 110 years old
const INCOME_BANDS = ["Under $25k", "$25k–$50k", "$50k–$100k", "$100k–$200k", "Over $200k", "Prefer not to say"];
const CONDITIONS = ["Diabetes", "Hypertension", "Heart disease", "COPD", "Cancer history", "Chronic kidney disease", "Arthritis", "None of the above", "Other"];

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Vial",
  "Pen",
  "Injection",
  "Inhaler",
  "Nasal spray",
  "Cream",
  "Ointment",
  "Patch",
  "Drops",
  "Solution",
  "Suspension",
  "Powder",
  "Suppository",
  "Other",
];

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every other day",
  "Weekly",
  "Every 2 weeks",
  "Monthly",
  "Every 3 months",
  "With meals",
  "At bedtime",
  "As needed",
];

export function IntakeWizard({ onDone }: { onDone?: (code: string) => void }) {
  const [step, setStep] = useState(1);
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [zip, setZip] = useState(""); // 3-digit ZIP prefix (de-identified)
  const [county, setCounty] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [tobacco, setTobacco] = useState(false);
  const [incomeBand, setIncomeBand] = useState(INCOME_BANDS[2]);
  const [costPref, setCostPref] = useState<"minimize_monthly" | "predictability">("minimize_monthly");
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherConditions, setOtherConditions] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState("");
  const [meds, setMeds] = useState<Medication[]>([blankMed()]);
  const [busy, setBusy] = useState(false);
  const [focusedMedId, setFocusedMedId] = useState<string | null>(null);
  const [medQuery, setMedQuery] = useState<Record<string, string>>({});
  const [rxnormResults, setRxnormResults] = useState<Record<string, RxNormSuggestion[]>>({});
  const [rxnormLoading, setRxnormLoading] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Parse an uploaded medication list (CSV or JSON). Only the medication
   * fields used by the wizard (name, strength, form, frequency, monthly
   * retail) are captured — every other column is discarded. The file is
   * read in-browser only; nothing is uploaded or persisted.
   */
  const handleMedFile = async (file: File) => {
    if (file.size > 256 * 1024) { toast.error("File too large (max 256 KB)."); return; }
    const text = await file.text();
    let rows: Record<string, string>[] = [];
    try {
      if (file.name.toLowerCase().endsWith(".json")) {
        const j = JSON.parse(text);
        rows = Array.isArray(j) ? j : Array.isArray(j?.medications) ? j.medications : [];
      } else {
        // CSV
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) { toast.error("CSV needs a header row + at least one medication."); return; }
        const split = (l: string) => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "").trim());
        const headers = split(lines[0]).map((h) => h.toLowerCase());
        rows = lines.slice(1).map((l) => {
          const cells = split(l);
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
          return obj;
        });
      }
    } catch {
      toast.error("Could not read that file. Use CSV or JSON.");
      return;
    }

    const pick = (r: Record<string, unknown>, keys: string[]): string => {
      for (const k of keys) {
        const v = r[k] ?? r[k.toLowerCase()];
        if (v != null && String(v).trim() !== "") return String(v).trim();
      }
      return "";
    };
    const matchEnum = (val: string, list: string[], fallback: string) => {
      const v = val.toLowerCase();
      return list.find((o) => o.toLowerCase() === v) ?? fallback;
    };

    const parsed: Medication[] = rows
      .map((r) => {
        const name = pick(r, ["medication", "medication_name", "name", "drug", "drug_name"]);
        if (!name) return null;
        const strength = pick(r, ["strength", "dose", "dosage"]);
        const formRaw = pick(r, ["form", "dosage_form"]);
        const freqRaw = pick(r, ["frequency", "freq", "how_often"]);
        const costRaw = pick(r, ["monthly_cost", "estimated_monthly_retail", "retail", "cost", "monthly"]);
        const cost = Number(String(costRaw).replace(/[^0-9.]/g, ""));
        return {
          id: crypto.randomUUID(),
          medication_name: name.slice(0, 120),
          strength: strength.slice(0, 60),
          dosage_form: matchEnum(formRaw, DOSAGE_FORMS, "Tablet"),
          frequency: matchEnum(freqRaw, FREQUENCIES, "Once daily"),
          estimated_monthly_retail: Number.isFinite(cost) && cost > 0 ? Math.min(cost, 50000) : 25,
        } as Medication;
      })
      .filter((m): m is Medication => m !== null)
      .slice(0, 40);

    if (!parsed.length) { toast.error("No medications found in that file."); return; }

    setMeds((prev) => {
      const base = prev.length === 1 && !prev[0].medication_name.trim() ? [] : prev;
      return [...base, ...parsed];
    });
    toast.success(`Imported ${parsed.length} medication${parsed.length === 1 ? "" : "s"}. No personal info was captured or stored.`);
  };

  // Debounced RxNorm lookup for the focused medication input.
  useEffect(() => {
    if (!focusedMedId) return;
    const id = focusedMedId;
    const q = (medQuery[id] ?? "").trim();
    if (q.length < 3) {
      setRxnormResults((r) => ({ ...r, [id]: [] }));
      return;
    }
    const ctrl = new AbortController();
    setRxnormLoading((r) => ({ ...r, [id]: true }));
    const t = setTimeout(async () => {
      const results = await searchRxNorm(q, 8, ctrl.signal);
      setRxnormResults((r) => ({ ...r, [id]: results }));
      setRxnormLoading((r) => ({ ...r, [id]: false }));
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [focusedMedId, medQuery]);

  const zip3 = zip;
  const countyOptions: Zip3County[] = /^\d{3}$/.test(zip3) ? countiesForZip3(zip3) : [];
  const zip3Unknown = /^\d{3}$/.test(zip3) && countyOptions.length === 0;

  // Reset county when ZIP3 changes and the previous selection no longer matches.
  useEffect(() => {
    if (!/^\d{3}$/.test(zip3)) return;
    if (county && !countyMatchesZip3(county, zip3)) setCounty("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip3]);

  const toggleCondition = (c: string) => {
    setConditions((p) => {
      if (p.includes(c)) {
        if (c === "Other") setOtherConditions([]);
        return p.filter((x) => x !== c);
      }
      return [...p, c];
    });
  };

  const addOtherCondition = () => {
    const text = otherInput.trim();
    if (!text) return;
    setOtherConditions((p) => (p.includes(text) ? p : [...p, text]));
    setOtherInput("");
  };

  const removeOtherCondition = (c: string) =>
    setOtherConditions((p) => p.filter((x) => x !== c));

  const allConditions = conditions
    .filter((c) => c !== "Other")
    .concat(otherConditions);

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
      coverage_uncertain: false,
      generic_alternative: undefined,
      no_generic_available: undefined,
    } : m));
    setMedQuery((q) => ({ ...q, [id]: "" }));
    setFocusedMedId(null);
  };

  const applyRxNormEntry = async (id: string, entry: RxNormSuggestion) => {
    // Strip dose/form annotations from the RxNorm display name so the input
    // shows just the drug name (e.g. "Lipitor" not "Lipitor 10 MG Oral Tablet").
    const cleanName = entry.name.replace(/\s*\d.*$/, "").replace(/\s*\[.*$/, "").trim() || entry.name;
    setMeds((p) => p.map((m) => m.id === id ? {
      ...m,
      medication_name: cleanName,
      coverage_uncertain: true,
      resolved_diagnosis: resolveDiagnosis(cleanName) ?? m.resolved_diagnosis,
    } : m));
    setMedQuery((q) => ({ ...q, [id]: "" }));
    setFocusedMedId(null);
    // Fetch generic equivalent in the background.
    const info = await getGenericFor(entry.rxcui);
    setMeds((p) => p.map((m) => m.id === id ? {
      ...m,
      generic_alternative: info.generic && info.generic.toLowerCase() !== cleanName.toLowerCase() ? info.generic : undefined,
      no_generic_available: info.noGenericAvailable,
    } : m));
  };

  const finish = async () => {
    if (!birthYear) {
      toast.error("Please select your year of birth");
      return;
    }
    if (birthYear < MIN_BIRTH_YEAR || birthYear > MAX_BIRTH_YEAR) {
      toast.error(`Year of birth must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}.`);
      return;
    }
    if (!/^\d{3}$/.test(zip)) {
      toast.error("Please enter the first 3 digits of your ZIP code");
      return;
    }
    if (county.trim().length < 2) {
      toast.error("Please select your county or parish");
      return;
    }
    if (countyOptions.length > 0 && !countyMatchesZip3(county, zip3)) {
      toast.error(
        `"${county}" is not within ZIP ${zip}xx. Valid options: ${countyOptions
          .map((c) => c.county)
          .join(", ")}.`
      );
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("create_scenario", {
      p_birth_year: birthYear as number,
      p_zip3: zip3,
      p_gender: gender,
      p_tobacco: tobacco,
      p_income_band: incomeBand,
      p_cost_preference: costPref,
      p_medications: meds as unknown as never,
      p_conditions: allConditions as unknown as never,
      p_preferences: { county: county.trim() } as unknown as never,
    });
    setBusy(false);
    if (error || !data) { toast.error(error?.message ?? "Could not create scenario"); return; }
    const code = data as string;
    try {
      sessionStorage.setItem(`scenario:${code}`, JSON.stringify({
        scenarioCode: code,
        year: new Date().getFullYear() < 2027 ? 2026 : 2027,
        birthYear, zip3, county: county.trim(), gender, tobacco,
        incomeBand, costPreference: costPref,
        conditions: allConditions, medications: meds,
      }));
    } catch { /* ignore quota */ }
    try { (await import("@/lib/scenario-history")).rememberScenario(code); } catch { /* ignore */ }
    toast.success("Scenario created");
    onDone?.(code);
  };

  return (
    <Card className="glass p-6 max-w-3xl mx-auto">
      <div className="flex gap-2 bg-warning/10 border border-warning/30 rounded-md p-3 mb-5 text-xs">
        <ShieldAlert className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <strong>We do not collect any personally identifiable information.</strong> Do NOT enter your name, address, phone, email, Social Security number, Medicare ID, or date of birth — there are no fields for these. You will receive a Scenario ID to share with your agent yourself.
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
          <p className="text-xs text-muted-foreground">Next: Cost preference →</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Year of birth <span className="text-destructive">*</span></Label>
              <select className="w-full border border-input rounded-md px-3 h-9 bg-background" value={birthYear} onChange={(e)=>setBirthYear(e.target.value ? Number(e.target.value) : "")} required>
                <option value="">Select year…</option>
                {BIRTH_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <Label>ZIP code (first 3 digits) <span className="text-destructive">*</span></Label>
              <Input
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="e.g. 770"
                inputMode="numeric"
                maxLength={3}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">We only store the first 3 digits — never your full ZIP.</p>
            </div>
            <div className="col-span-2">
              <Label>County or parish <span className="text-destructive">*</span></Label>
              {countyOptions.length > 0 ? (
                <div className="flex gap-2 items-center">
                <select
                  className="w-full border border-input rounded-md px-3 h-9 bg-background"
                  value={countyMatchesZip3(county, zip3)?.county ?? ""}
                  onChange={(e) => setCounty(e.target.value)}
                  required
                >
                  <option value="">Select your county…</option>
                  {countyOptions.map((c) => (
                    <option key={`${c.county}-${c.stateCode}`} value={c.county}>
                      {c.county}, {c.stateCode}
                    </option>
                  ))}
                </select>
                <VoiceButton
                  label="Speak county name"
                  onTranscript={(t) => {
                    const names = countyOptions.map((c) => c.county);
                    const m = matchSpokenOption(t, names);
                    if (m) setCounty(m);
                    else toast.error(`"${t}" didn't match a county for ZIP ${zip}.`);
                  }}
                />
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                <Input
                  value={county}
                  onChange={(e) => setCounty(e.target.value.slice(0, 80))}
                  placeholder={
                    zip.length === 3
                      ? "e.g. Harris County, Orleans Parish"
                      : "Enter the first 3 digits of your ZIP above first"
                  }
                  maxLength={80}
                  disabled={zip.length !== 3}
                  required
                />
                <VoiceButton label="Speak county name" onTranscript={(t) => setCounty(t.slice(0, 80))} />
                </div>
              )}
              {zip3Unknown && (
                <p className="text-xs text-destructive mt-1">
                  We don't recognize ZIP prefix {zip}. Double-check the first 3 digits of your ZIP.
                </p>
              )}
              {countyOptions.length > 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ZIP prefix {zip} covers multiple counties — pick yours from the list.
                </p>
              )}
              {countyOptions.length === 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Only one county for ZIP prefix {zip}.
                </p>
              )}
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
          <p className="text-xs text-muted-foreground">Next: Conditions →</p>
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
          {conditions.includes("Other") && (
            <Card className="p-4 bg-primary/5 border-primary/20 space-y-3">
              <Label>Add your condition(s)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Asthma, Glaucoma, Osteoporosis"
                  value={otherInput}
                  onChange={(e) => setOtherInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOtherCondition(); } }}
                />
                <VoiceButton
                  label="Speak condition name"
                  onTranscript={(t) => setOtherInput(t)}
                />
                <Button size="sm" onClick={addOtherCondition}><Plus className="h-4 w-4"/></Button>
              </div>
              {otherConditions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {otherConditions.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
                      {c}
                      <button type="button" onClick={() => removeOtherCondition(c)} className="hover:text-destructive"><X className="h-3 w-3"/></button>
                    </span>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 4 · Medications</h3>

          <Card className="p-4 bg-muted/40 border-dashed">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Your scenario so far</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
              <div><span className="text-muted-foreground">Birth year:</span> {birthYear}</div>
              <div><span className="text-muted-foreground">ZIP3:</span> {zip3 || "—"}</div>
              <div className="col-span-2"><span className="text-muted-foreground">County/Parish:</span> {county || "—"}</div>
              <div><span className="text-muted-foreground">Gender:</span> {gender.replace(/_/g," ")}</div>
              <div><span className="text-muted-foreground">Tobacco:</span> {tobacco ? "Yes" : "No"}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Income:</span> {incomeBand}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Priority:</span> {costPref === "minimize_monthly" ? "Minimize monthly cost" : "Predictability"}</div>
            <div className="col-span-full">
                <span className="text-muted-foreground">Conditions:</span>{" "}
                {allConditions.length ? allConditions.join(", ") : "None selected"}
              </div>
            </div>
          </Card>

          {(() => {
            const suggestions = allConditions.flatMap((c) =>
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
                      className="pl-7 pr-16"
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
                    <VoiceButton
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      label="Speak or spell drug name"
                      onTranscript={(t) => {
                        updateMed(m.id, { medication_name: t });
                        setMedQuery((q) => ({ ...q, [m.id]: t }));
                        setFocusedMedId(m.id);
                      }}
                    />
                  </div>
                  {focusedMedId === m.id && (() => {
                    const q = medQuery[m.id] ?? m.medication_name;
                    const local = searchMedCatalog(q, 8);
                    const localNames = new Set(local.map((r) => r.name.toLowerCase()));
                    const rx = (rxnormResults[m.id] ?? []).filter(
                      (r) => !localNames.has(r.name.toLowerCase()),
                    );
                    const loading = rxnormLoading[m.id];
                    if (!local.length && !rx.length && !loading) return null;
                    return (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-72 overflow-auto">
                        {local.length > 0 && (
                          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40">In our pricing catalog</div>
                        )}
                        {local.map((r) => (
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
                        {(rx.length > 0 || loading) && (
                          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40 border-t border-border">
                            FDA-approved drugs (RxNorm) {loading ? "· searching…" : ""}
                          </div>
                        )}
                        {rx.map((r) => (
                          <button
                            key={r.rxcui}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); applyRxNormEntry(m.id, r); }}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                          >
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">RxNorm · pricing not in catalog — will be flagged</div>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="relative">
                  <Input className="pr-16" placeholder="Strength" value={m.strength} onChange={(e) => updateMed(m.id, { strength: e.target.value })}/>
                  <VoiceButton
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    label="Speak strength (e.g. 10 milligrams)"
                    onTranscript={(t) => updateMed(m.id, { strength: t })}
                  />
                </div>
                <div className="flex gap-1 items-center">
                <select
                  className="w-full border border-input rounded-md px-3 h-9 bg-background text-sm"
                  value={DOSAGE_FORMS.includes(m.dosage_form) ? m.dosage_form : (m.dosage_form ? "Other" : "")}
                  onChange={(e) => updateMed(m.id, { dosage_form: e.target.value })}
                >
                  <option value="">Form…</option>
                  {DOSAGE_FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <VoiceButton
                  allowSpell={false}
                  label="Speak dosage form"
                  onTranscript={(t) => {
                    const match = matchSpokenOption(t, DOSAGE_FORMS);
                    if (match) updateMed(m.id, { dosage_form: match });
                    else toast.error(`"${t}" didn't match a form.`);
                  }}
                />
                </div>
                <div className="flex gap-1 items-center">
                <select
                  className="w-full border border-input rounded-md px-3 h-9 bg-background text-sm"
                  value={FREQUENCIES.includes(m.frequency) ? m.frequency : (m.frequency === "Daily" ? "Once daily" : "")}
                  onChange={(e) => updateMed(m.id, { frequency: e.target.value })}
                >
                  <option value="">Frequency…</option>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <VoiceButton
                  allowSpell={false}
                  label="Speak frequency"
                  onTranscript={(t) => {
                    const match = matchSpokenOption(t, FREQUENCIES);
                    if (match) updateMed(m.id, { frequency: match });
                    else toast.error(`"${t}" didn't match a frequency.`);
                  }}
                />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Monthly retail cost ($)</label>
                  <Input type="number" placeholder="$/mo retail" title="Estimated monthly retail cost in dollars (auto-filled from catalog; edit to match your pharmacy's cash price)" value={m.estimated_monthly_retail} onChange={(e) => updateMed(m.id, { estimated_monthly_retail: Number(e.target.value) })}/>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="text-muted-foreground flex items-center gap-1 flex-1"><Pill className="h-3 w-3"/>
                  Auto-resolved condition: <Input className="h-7 flex-1" value={m.resolved_diagnosis ?? ""} placeholder="auto" onChange={(e) => updateMed(m.id, { resolved_diagnosis: e.target.value })}/>
                  <VoiceButton label="Speak condition" onTranscript={(t) => updateMed(m.id, { resolved_diagnosis: t })} />
                </div>
                <Button size="sm" variant="ghost" onClick={() => setMeds(meds.filter(x => x.id !== m.id))}><Trash2 className="h-4 w-4"/></Button>
              </div>
              {m.coverage_uncertain && (
                <div className="flex items-start gap-2 text-xs bg-warning/10 border border-warning/30 rounded-md p-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-warning">Not in our pricing catalog — coverage will be flagged</div>
                    <div className="text-muted-foreground mt-0.5">
                      This drug is FDA-recognized (RxNorm) but its Part D tier and cost vary by plan. We'll still include it in the determination using the monthly retail you enter.
                    </div>
                    {m.generic_alternative && (
                      <div className="mt-1 text-foreground">
                        Generic equivalent available: <span className="font-semibold">{m.generic_alternative}</span> — usually much cheaper.
                      </div>
                    )}
                    {!m.generic_alternative && m.no_generic_available && (
                      <div className="mt-1 text-foreground">No generic equivalent available — this is a brand-only drug.</div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}

          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setMeds([...meds, blankMed()])}><Plus className="h-4 w-4 mr-1"/>Add drug</Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload list
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleMedFile(f);
                  // reset so the same file can be re-uploaded if needed
                  e.target.value = "";
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground text-center max-w-md">
              CSV or JSON. Only medication, strength, form, frequency, and monthly cost are read — any name, DOB, or other personal info in the file is ignored. The file is processed in your browser and never uploaded or stored.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft className="h-4 w-4"/>Back</Button>
        {step < 4 ? (
          <Button onClick={() => {
            if (step === 1) {
              if (!birthYear) { toast.error("Please select your year of birth before continuing."); return; }
              if (birthYear < MIN_BIRTH_YEAR || birthYear > MAX_BIRTH_YEAR) {
                toast.error(`Year of birth must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}.`);
                return;
              }
              if (!/^\d{3}$/.test(zip)) { toast.error("Please enter the first 3 digits of your ZIP code before continuing."); return; }
              if (county.trim().length < 2) { toast.error("Please select your county or parish before continuing."); return; }
              if (countyOptions.length > 0 && !countyMatchesZip3(county, zip3)) {
                toast.error(`"${county}" is not within ZIP ${zip}xx. Valid options: ${countyOptions.map((c) => c.county).join(", ")}.`);
                return;
              }
            }
            setStep(step + 1);
          }} className="grad-indigo">Next<ChevronRight className="h-4 w-4"/></Button>
        ) : (
          <Button onClick={finish} disabled={busy} className="grad-indigo">{busy ? "Creating…" : "Create scenario"}</Button>
        )}
      </div>
    </Card>
  );
}
