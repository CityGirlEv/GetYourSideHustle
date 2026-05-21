import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Plus, Trash2, ChevronRight, ChevronLeft, Pill } from "lucide-react";
import { resolveDiagnosis } from "@/lib/diagnosis-resolver";
import { useApp } from "@/lib/app-store";
import { toast } from "sonner";
import type { Medication } from "@/lib/medicare-math";

function blankMed(): Medication {
  return { id: crypto.randomUUID(), medication_name: "", strength: "", dosage_form: "Tablet", frequency: "Daily", estimated_monthly_retail: 25 };
}

export function IntakeWizard({ onDone }: { onDone?: () => void }) {
  const { addClient, deductCredit, user } = useApp();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ first_name: "", last_name: "", dob: "", zip_code: "", county: "Harris" });
  const [costConcern, setCostConcern] = useState(true);
  const [meds, setMeds] = useState<Medication[]>([blankMed()]);

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
    if (user?.role === "advisor" && !(await deductCredit("Created client + dossier"))) {
      toast.error("Out of credits. Please top up to create a client.");
      return;
    }
    const c = await addClient({
      first_name: profile.first_name, last_name: profile.last_name, dob: profile.dob,
      zip_code: profile.zip_code, county: profile.county, monthly_cost_concern: costConcern, meds,
      advisor_id: user?.role === "advisor" ? user.id : undefined,
    });
    if (!c) { toast.error("Could not create client"); return; }
    toast.success(`Client ${c.first_name} created (encrypted)`);
    onDone?.();
  };

  return (
    <Card className="glass p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 1 · Core profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>First name</Label><Input value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})}/></div>
            <div><Label>Last name</Label><Input value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})}/></div>
            <div><Label>Date of birth</Label><Input type="date" value={profile.dob} onChange={(e) => setProfile({...profile, dob: e.target.value})}/></div>
            <div><Label>ZIP code</Label><Input value={profile.zip_code} onChange={(e) => setProfile({...profile, zip_code: e.target.value})}/></div>
            <div className="col-span-2"><Label>County</Label>
              <select className="w-full border border-input rounded-md px-3 h-9 bg-background" value={profile.county} onChange={(e) => setProfile({...profile, county: e.target.value})}>
                {["Harris","Los Angeles","Miami-Dade","Cook","Maricopa","King"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 2 · Cost preference</h3>
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="font-medium mb-3">Is keeping your monthly out-of-pocket costs at an absolute minimum a top concern, or does it not matter (preferring total medical predictability)?</p>
            <div className="flex items-center gap-3">
              <Switch checked={costConcern} onCheckedChange={setCostConcern}/>
              <span className="font-semibold">{costConcern ? "Yes — minimize monthly cost" : "No — predictability matters more"}</span>
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">Step 3 · Medications</h3>
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
                  Diagnosis: <Input className="h-7 flex-1" value={m.resolved_diagnosis ?? ""} placeholder="auto-resolve" onChange={(e) => updateMed(m.id, { resolved_diagnosis: e.target.value })}/>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setMeds(meds.filter(x => x.id !== m.id))}><Trash2 className="h-4 w-4"/></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft className="h-4 w-4"/>Back</Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} className="grad-indigo">Next<ChevronRight className="h-4 w-4"/></Button>
        ) : (
          <Button onClick={finish} className="grad-indigo">Create client &amp; generate dossier</Button>
        )}
      </div>
    </Card>
  );
}
