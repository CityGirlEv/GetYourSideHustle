import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  resolveDiagnosis,
  type MedCatalogEntry,
} from "@/lib/diagnosis-resolver";
import { searchRxNorm, getGenericFor, type RxNormSuggestion } from "@/lib/rxnorm";
import type { Medication } from "@/lib/medicare-math";
import { blankIntakeMedication } from "@/lib/intake-constants";
import {
  prepareMedicationsForStepFinish,
  validateMedicationEntry,
  validateMedicationNotDuplicate,
  validateMedicationsForSubmit,
} from "@/lib/intake-medications-validation";

export function useIntakeMedications(initialMeds?: Medication[]) {
  const [meds, setMeds] = useState<Medication[]>(
    initialMeds?.length ? initialMeds : [blankIntakeMedication()],
  );
  const [confirmedMedIds, setConfirmedMedIds] = useState<string[]>(() =>
    initialMeds?.length ? initialMeds.map((m) => m.id) : [],
  );
  const [focusedMedId, setFocusedMedId] = useState<string | null>(null);
  const [medQuery, setMedQuery] = useState<Record<string, string>>({});
  const [rxnormResults, setRxnormResults] = useState<Record<string, RxNormSuggestion[]>>({});
  const [rxnormLoading, setRxnormLoading] = useState<Record<string, boolean>>({});

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
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [focusedMedId, medQuery]);

  const updateMed = (id: string, patch: Partial<Medication>) => {
    if (patch.medication_name !== undefined && confirmedMedIds.includes(id)) {
      setConfirmedMedIds((prev) => prev.filter((x) => x !== id));
    }
    setMeds((p) =>
      p.map((m) => {
        if (m.id !== id) return m;
        const next = { ...m, ...patch };
        if (patch.medication_name !== undefined) {
          next.resolved_diagnosis = resolveDiagnosis(patch.medication_name) ?? m.resolved_diagnosis;
        }
        return next;
      }),
    );
  };

  const saveMed = (id: string): boolean => {
    const med = meds.find((m) => m.id === id);
    if (!med) return false;
    const entryError = validateMedicationEntry(med);
    if (entryError) {
      toast.error(entryError);
      return false;
    }
    const dupError = validateMedicationNotDuplicate(med, meds, confirmedMedIds);
    if (dupError) {
      toast.error(dupError);
      return false;
    }
    const newlyConfirmed = !confirmedMedIds.includes(id);
    if (newlyConfirmed) {
      setConfirmedMedIds((prev) => [...prev, id]);
    }
    if (!med.resolved_diagnosis) {
      updateMed(id, { resolved_diagnosis: resolveDiagnosis(med.medication_name) ?? undefined });
    }
    if (newlyConfirmed) {
      toast.success(`Saved ${med.medication_name.trim()}`);
    }
    return true;
  };

  const saveMedAndAddNew = (id: string): boolean => {
    const med = meds.find((m) => m.id === id);
    if (!med?.medication_name.trim()) {
      toast.error("Enter a medication name before saving.");
      return false;
    }
    if (!saveMed(id)) return false;
    setMeds((prev) => {
      const last = prev[prev.length - 1];
      if (last && !last.medication_name.trim()) {
        return prev;
      }
      return [...prev, blankIntakeMedication()];
    });
    return true;
  };

  const finishMedicationEntry = (id: string): boolean => {
    const result = prepareMedicationsForStepFinish(meds, confirmedMedIds, id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    const med = meds.find((m) => m.id === id);
    const newlyConfirmed =
      Boolean(med?.medication_name.trim()) && !confirmedMedIds.includes(id);
    if (newlyConfirmed) {
      setConfirmedMedIds(result.nextConfirmedIds);
      if (med && !med.resolved_diagnosis) {
        updateMed(id, { resolved_diagnosis: resolveDiagnosis(med.medication_name) ?? undefined });
      }
      toast.success(`Saved ${med!.medication_name.trim()}`);
    }
    return true;
  };

  const removeMed = (id: string) => {
    setMeds((prev) => prev.filter((x) => x.id !== id));
    setConfirmedMedIds((prev) => prev.filter((x) => x !== id));
  };

  const removeConfirmedMedByName = (name: string) => {
    const nameLower = name.trim().toLowerCase();
    const med = meds.find(
      (m) =>
        confirmedMedIds.includes(m.id) &&
        m.medication_name.trim().toLowerCase() === nameLower,
    );
    if (med) removeMed(med.id);
  };

  const applyCatalogEntry = (id: string, entry: MedCatalogEntry) => {
    setMeds((p) =>
      p.map((m) =>
        m.id === id
          ? {
              ...m,
              medication_name: entry.name,
              strength: entry.strength ?? m.strength,
              dosage_form: entry.form ?? m.dosage_form,
              frequency: entry.freq ?? m.frequency,
              estimated_monthly_retail: entry.retail ?? m.estimated_monthly_retail,
              resolved_diagnosis:
                resolveDiagnosis(entry.name) ?? entry.category ?? m.resolved_diagnosis,
              coverage_uncertain: false,
              generic_alternative: undefined,
              no_generic_available: undefined,
            }
          : m,
      ),
    );
    setMedQuery((q) => ({ ...q, [id]: "" }));
    setFocusedMedId(null);
  };

  const applyRxNormEntry = async (id: string, entry: RxNormSuggestion) => {
    const cleanName =
      entry.name
        .replace(/\s*\d.*$/, "")
        .replace(/\s*\[.*$/, "")
        .trim() || entry.name;
    setMeds((p) =>
      p.map((m) =>
        m.id === id
          ? {
              ...m,
              medication_name: cleanName,
              coverage_uncertain: true,
              resolved_diagnosis: resolveDiagnosis(cleanName) ?? m.resolved_diagnosis,
            }
          : m,
      ),
    );
    setMedQuery((q) => ({ ...q, [id]: "" }));
    setFocusedMedId(null);
    const info = await getGenericFor(entry.rxcui);
    setMeds((p) =>
      p.map((m) =>
        m.id === id
          ? {
              ...m,
              generic_alternative:
                info.generic && info.generic.toLowerCase() !== cleanName.toLowerCase()
                  ? info.generic
                  : undefined,
              no_generic_available: info.noGenericAvailable,
            }
          : m,
      ),
    );
  };

  const validateForSubmit = () => validateMedicationsForSubmit(meds, confirmedMedIds);

  return {
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
    finishMedicationEntry,
    removeMed,
    removeConfirmedMedByName,
    applyCatalogEntry,
    applyRxNormEntry,
    validateForSubmit,
  };
}
