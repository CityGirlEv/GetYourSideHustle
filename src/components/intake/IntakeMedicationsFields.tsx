import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  AlertTriangle,
  Check,
  Pill,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoiceButton, matchSpokenOption } from "@/components/VoiceButton";
import { WizardFieldLabel } from "@/components/intake/WizardFieldLabel";
import {
  INTAKE_FREQUENCIES,
  intakeCountPerDoseHeading,
  intakeCountPerDoseOptions,
  intakeDosageFormsForMedication,
  intakeDosageFormSupportsCount,
  intakeDosageFormUnitLabel,
  migrateCountPerDoseToForm,
} from "@/lib/intake-constants";
import {
  getCommonMedsForCondition,
  resolveDiagnosis,
  searchMedCatalog,
  type MedCatalogEntry,
} from "@/lib/diagnosis-resolver";
import type { Medication } from "@/lib/medicare-math";
import type { RxNormSuggestion } from "@/lib/rxnorm";

export type IntakeMedicationsFieldsProps = {
  allConditions: string[];
  meds: Medication[];
  setMeds: Dispatch<SetStateAction<Medication[]>>;
  confirmedMedIds: string[];
  setConfirmedMedIds: Dispatch<SetStateAction<string[]>>;
  focusedMedId: string | null;
  setFocusedMedId: (id: string | null) => void;
  medQuery: Record<string, string>;
  setMedQuery: Dispatch<SetStateAction<Record<string, string>>>;
  rxnormResults: Record<string, RxNormSuggestion[]>;
  rxnormLoading: Record<string, boolean>;
  updateMed: (id: string, patch: Partial<Medication>) => void;
  saveMed: (id: string) => boolean;
  saveMedAndAddNew: (id: string) => boolean;
  onSaveAndFinish?: (id: string) => void;
  removeMed: (id: string) => void;
  removeConfirmedMedByName: (name: string) => void;
  applyCatalogEntry: (id: string, entry: MedCatalogEntry) => void;
  applyRxNormEntry: (id: string, entry: RxNormSuggestion) => void;
  continueActionLabel: string;
  summaryCard?: ReactNode;
};

export function IntakeMedicationsFields({
  allConditions,
  meds,
  setMeds,
  confirmedMedIds,
  setConfirmedMedIds,
  focusedMedId,
  setFocusedMedId,
  medQuery,
  setMedQuery,
  rxnormResults,
  rxnormLoading,
  updateMed,
  saveMed,
  saveMedAndAddNew,
  onSaveAndFinish,
  removeMed,
  removeConfirmedMedByName,
  applyCatalogEntry,
  applyRxNormEntry,
  continueActionLabel,
  summaryCard,
}: IntakeMedicationsFieldsProps) {
  const frequencies = INTAKE_FREQUENCIES as readonly string[];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Not taking any prescription medications? You can skip this step and click{" "}
        <strong>{continueActionLabel}</strong> below.
      </p>

      {summaryCard}

      {(() => {
        const suggestions = allConditions.flatMap((c) =>
          getCommonMedsForCondition(c).map((m) => ({ ...m, condition: c })),
        );
        const confirmedMeds = meds.filter(
          (m) => confirmedMedIds.includes(m.id) && m.medication_name.trim(),
        );
        if (!suggestions.length && !confirmedMeds.length)
          return (
            <p className="text-xs text-muted-foreground">
              No medications to add? Click <strong>{continueActionLabel}</strong> when you are
              ready. Tip: go back and pick your conditions to see common medications you can add
              with one click.
            </p>
          );
        return (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="text-sm font-semibold mb-2">Common medications for your conditions</div>
            <p className="text-xs text-muted-foreground mb-3">
              Don&apos;t remember the exact drug? Click any to add it — click again to remove. You
              can edit details after.
            </p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => {
                  const already = confirmedMeds.some(
                    (m) => m.medication_name.trim().toLowerCase() === s.name.toLowerCase(),
                  );
                  return (
                    <button
                      key={`${s.name}-${i}`}
                      type="button"
                      onClick={() => {
                        if (already) {
                          removeConfirmedMedByName(s.name);
                          return;
                        }
                        setMeds((p) => {
                          const next: Medication = {
                            id: crypto.randomUUID(),
                            medication_name: s.name,
                            strength: s.strength ?? "",
                            dosage_form: s.form ?? "Tablet",
                            frequency: s.freq ?? "Daily",
                            estimated_monthly_retail: s.retail ?? 25,
                            resolved_diagnosis: resolveDiagnosis(s.name) ?? s.condition,
                          };
                          setConfirmedMedIds((ids) => [...ids, next.id]);
                          if (p.length === 1 && !p[0]!.medication_name.trim()) return [next];
                          return [...p, next];
                        });
                      }}
                      className={`text-xs border rounded-full px-3 py-1.5 transition ${
                        already
                          ? "bg-emerald/10 border-emerald/40 text-foreground hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive"
                          : "bg-background border-primary/40 hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      {already ? (
                        <Check className="h-3 w-3 inline mr-1 text-emerald" />
                      ) : (
                        <Plus className="h-3 w-3 inline mr-1" />
                      )}
                      {s.name}{" "}
                      {s.strength ? <span className="opacity-70">({s.strength})</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
            {confirmedMeds.length > 0 && (
              <div className={suggestions.length ? "mt-4 pt-3 border-t border-primary/20" : ""}>
                <div className="text-xs font-semibold mb-2">Your added medications</div>
                <div className="flex flex-wrap gap-2">
                  {confirmedMeds.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 text-xs border rounded-full px-3 py-1.5 bg-emerald/10 border-emerald/40 text-foreground"
                    >
                      <Check className="h-3 w-3 text-emerald" />
                      {m.medication_name}
                      {m.strength ? (
                        <span className="opacity-70"> ({m.strength})</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeMed(m.id)}
                        className="ml-0.5 rounded-full hover:text-destructive"
                        title="Remove this medication"
                        aria-label={`Remove ${m.medication_name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })()}

      <p className="text-sm text-muted-foreground">
        Your medication may not appear on this list as an exact match. Pick the closest option or
        type the name as you know it — coverage estimates may be less certain for drugs not in our
        catalog.
      </p>

      {meds.map((m, medIndex) => {
        const isConfirmed = confirmedMedIds.includes(m.id);
        return (
          <Card key={m.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Medication {medIndex + 1}
                {isConfirmed ? (
                  <span className="ml-2 normal-case text-emerald font-medium">· Added</span>
                ) : null}
              </span>
              {meds.length > 1 && (
                <Button type="button" size="sm" variant="ghost" onClick={() => removeMed(m.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(8rem,11rem)] gap-3">
                <div className="relative min-w-0 flex flex-col gap-1">
                  <WizardFieldLabel tip="Search our pricing catalog or type the name from your prescription bottle. DME items (walkers, CPAP supplies, etc.) can be searched too.">
                    Drug name
                  </WizardFieldLabel>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-7 pr-16"
                      placeholder="Search drug or DME…"
                      value={m.medication_name}
                      onFocus={() => setFocusedMedId(m.id)}
                      onBlur={() =>
                        setTimeout(
                          () => setFocusedMedId((cur) => (cur === m.id ? null : cur)),
                          150,
                        )
                      }
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
                  {focusedMedId === m.id &&
                    (() => {
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
                          {local.map((r) => (
                            <button
                              key={r.name}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                applyCatalogEntry(m.id, r);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                            >
                              <div className="font-medium">{r.name}</div>
                            </button>
                          ))}
                          {rx.map((r) => (
                            <button
                              key={r.rxcui}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                applyRxNormEntry(m.id, r);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                            >
                              <div className="font-medium">{r.name}</div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                </div>
                <div className="relative min-w-0 flex flex-col gap-1">
                  <WizardFieldLabel tip="Dosage amount on your label — for example 10 mg, 100 units, or 0.5 mL.">
                    Strength
                  </WizardFieldLabel>
                  <Input
                    className="w-full"
                    placeholder="Strength"
                    value={m.strength}
                    onChange={(e) => updateMed(m.id, { strength: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <WizardFieldLabel tip="How the medication is delivered — tablet, capsule, injection, inhaler, patch, and so on.">
                    Dosage form
                  </WizardFieldLabel>
                  {(() => {
                    const dosageForms = intakeDosageFormsForMedication(m.medication_name);
                    return (
                  <select
                    className="w-full min-w-0 border border-input rounded-md px-3 h-9 bg-background text-sm"
                    value={
                      dosageForms.includes(m.dosage_form)
                        ? m.dosage_form
                        : m.dosage_form
                          ? "Other"
                          : ""
                    }
                    onChange={(e) => {
                      const nextForm = e.target.value;
                      const patch: Partial<Medication> = { dosage_form: nextForm };
                      if (!intakeDosageFormSupportsCount(nextForm)) {
                        patch.tablets_per_dose = undefined;
                      } else {
                        patch.tablets_per_dose = migrateCountPerDoseToForm(
                          m.tablets_per_dose,
                          nextForm,
                        );
                      }
                      updateMed(m.id, patch);
                    }}
                  >
                    <option value="">Form…</option>
                    {dosageForms.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                    );
                  })()}
                </div>
                {intakeDosageFormSupportsCount(m.dosage_form) ? (
                  <div className="flex flex-col gap-1 min-w-0">
                    <WizardFieldLabel
                      tip={`How many ${intakeDosageFormUnitLabel(m.dosage_form, 2)} you take each time.`}
                    >
                      {intakeCountPerDoseHeading(m.dosage_form)}
                    </WizardFieldLabel>
                    <select
                      className="w-full min-w-0 border border-input rounded-md px-3 h-9 bg-background text-sm"
                      value={migrateCountPerDoseToForm(m.tablets_per_dose, m.dosage_form)}
                      onChange={(e) => updateMed(m.id, { tablets_per_dose: e.target.value })}
                    >
                      {intakeCountPerDoseOptions(m.dosage_form).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="flex flex-col gap-1 min-w-0">
                  <WizardFieldLabel tip="How often you take or use this medication.">
                    Frequency
                  </WizardFieldLabel>
                  <select
                    className="w-full min-w-0 border border-input rounded-md px-3 h-9 bg-background text-sm"
                    value={
                      frequencies.includes(m.frequency)
                        ? m.frequency
                        : m.frequency === "Daily"
                          ? "Once daily"
                          : ""
                    }
                    onChange={(e) => updateMed(m.id, { frequency: e.target.value })}
                  >
                    <option value="">Frequency…</option>
                    {INTAKE_FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <WizardFieldLabel tip="Estimated monthly cash price before insurance.">
                    Monthly retail cost ($)
                  </WizardFieldLabel>
                  <Input
                    className="w-full"
                    type="number"
                    placeholder="$/mo retail"
                    value={m.estimated_monthly_retail}
                    onChange={(e) =>
                      updateMed(m.id, { estimated_monthly_retail: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <WizardFieldLabel tip="We link each drug to a health condition. Change it if our guess is wrong.">
                Linked condition
              </WizardFieldLabel>
              <div className="text-muted-foreground flex items-center gap-1 flex-1">
                <Pill className="h-3 w-3 shrink-0" />
                <Input
                  className="h-7 flex-1"
                  value={m.resolved_diagnosis ?? ""}
                  placeholder="auto"
                  onChange={(e) => updateMed(m.id, { resolved_diagnosis: e.target.value })}
                />
              </div>
            </div>
            {m.coverage_uncertain && (
              <div className="flex items-start gap-2 text-xs bg-warning/10 border border-warning/30 rounded-md p-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                <div className="font-semibold text-warning">
                  Not in our pricing catalog — coverage will be flagged
                </div>
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {onSaveAndFinish ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1 w-full sm:w-auto btn-brand-accent"
                    disabled={!m.medication_name.trim()}
                    title={
                      m.medication_name.trim()
                        ? "Save this drug and open a new card"
                        : "Enter a drug name before saving"
                    }
                    aria-label="Save and add new medication"
                    onClick={() => saveMedAndAddNew(m.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Save &amp; Add New
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1 w-full sm:w-auto bg-emerald hover:bg-emerald/90 text-emerald-foreground border-transparent"
                    disabled={
                      !m.medication_name.trim() &&
                      !(medIndex === meds.length - 1 && !m.medication_name.trim())
                    }
                    title={
                      m.medication_name.trim()
                        ? "Save this drug and continue to the next step"
                        : medIndex === meds.length - 1
                          ? `Skip medications and click ${continueActionLabel}`
                          : "Enter a drug name before saving"
                    }
                    aria-label="Save and finish medications step"
                    onClick={() => onSaveAndFinish(m.id)}
                  >
                    <Check className="h-4 w-4" />
                    Save &amp; Finish
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1 w-full sm:w-auto bg-emerald hover:bg-emerald/90 text-emerald-foreground border-transparent"
                    disabled={!m.medication_name.trim()}
                    title={
                      m.medication_name.trim()
                        ? "Save changes to this drug"
                        : "Enter a drug name before saving"
                    }
                    aria-label="Save medication"
                    onClick={() => saveMed(m.id)}
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </Button>
                  {medIndex === meds.length - 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1 w-full sm:w-auto btn-brand-accent"
                      disabled={!m.medication_name.trim()}
                      title={
                        m.medication_name.trim()
                          ? "Save this drug and open a new card"
                          : "Enter a drug name before saving"
                      }
                      aria-label="Save and add new medication"
                      onClick={() => saveMedAndAddNew(m.id)}
                    >
                      <Plus className="h-4 w-4" />
                      Save &amp; Add New
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </Card>
        );
      })}

    </div>
  );
}
