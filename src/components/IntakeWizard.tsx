import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Pill,
  ShieldAlert,
  Search,
  X,
  AlertTriangle,
  Phone,
  Check,
  CircleHelp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  resolveDiagnosis,
  getCommonMedsForCondition,
  searchMedCatalog,
  type MedCatalogEntry,
} from "@/lib/diagnosis-resolver";
import { searchRxNorm, getGenericFor, type RxNormSuggestion } from "@/lib/rxnorm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VoiceButton, matchSpokenOption } from "./VoiceButton";
import type { Medication } from "@/lib/medicare-math";
import {
  countiesForZip3,
  countyMatchesZip3,
  normalizeZip3Input,
  type Zip3County,
} from "@/lib/zip3-county-lookup";
import { TouchCheckboxField } from "./ui/touch-checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

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

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 110;
const MAX_BIRTH_YEAR = CURRENT_YEAR;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
); // today back to 110 years old
import { INCOME_BANDS } from "@/lib/income-bands";
import {
  clearIntakeWizardDraft,
  loadIntakeWizardDraft,
  saveIntakeWizardDraft,
} from "@/lib/intake-wizard-draft";
import { registerDeploySaveHandler } from "@/lib/deploy-version";
import {
  REFERRAL_SOURCES,
  REFERRAL_SOURCES_WITH_DETAIL,
  REFERRAL_DETAIL_FIELDS,
  buildReferralPreferences,
  validateReferralDetails,
  type ReferralSource,
} from "@/lib/referral-sources";
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
  "None of the above",
  "Other",
];

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

function WizardFieldLabel({
  children,
  tip,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  tip: string;
  required?: boolean;
  htmlFor?: string;
}) {
  const labelText = typeof children === "string" ? children : "this field";
  return (
    <div className="flex items-center gap-1 mb-1">
      <Label htmlFor={htmlFor} className="text-xs font-semibold leading-none mb-0">
        {children}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            aria-label={`About ${labelText}`}
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[16rem] text-left leading-snug normal-case font-normal"
        >
          {tip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function IntakeWizard({ onDone }: { onDone?: (code: string) => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [zip, setZip] = useState(""); // 3-digit ZIP prefix (de-identified)
  const [county, setCounty] = useState("");
  const [gender, setGender] = useState("");
  const [tobacco, setTobacco] = useState<boolean | null>(null);
  const [incomeBand, setIncomeBand] = useState("");
  const [costPref, setCostPref] = useState<"minimize_monthly" | "predictability" | "">("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherConditions, setOtherConditions] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState("");
  const [meds, setMeds] = useState<Medication[]>([blankMed()]);
  const [confirmedMedIds, setConfirmedMedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [focusedMedId, setFocusedMedId] = useState<string | null>(null);
  const [medQuery, setMedQuery] = useState<Record<string, string>>({});
  const [rxnormResults, setRxnormResults] = useState<Record<string, RxNormSuggestion[]>>({});
  const [rxnormLoading, setRxnormLoading] = useState<Record<string, boolean>>({});
  const [requestExpertContact, setRequestExpertContact] = useState(false);
  const [expertContactNoticeOpen, setExpertContactNoticeOpen] = useState(false);
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);
  const [referralAgentName, setReferralAgentName] = useState("");
  const [referralFriendFamily, setReferralFriendFamily] = useState("");
  const [referralMedicareEvent, setReferralMedicareEvent] = useState("");
  const [referralOther, setReferralOther] = useState("");
  const zipInputRef = useRef<HTMLInputElement>(null);
  const countyFieldRef = useRef<HTMLDivElement>(null);
  const wizardTopRef = useRef<HTMLDivElement>(null);
  const draftRestoredRef = useRef(false);
  const draftSnapshotRef = useRef({
    step: 1,
    birthYear: "" as number | "",
    zip: "",
    county: "",
    gender: "",
    tobacco: null as boolean | null,
    incomeBand: "",
    costPref: "" as "minimize_monthly" | "predictability" | "",
    conditions: [] as string[],
    otherConditions: [] as string[],
    otherInput: "",
    meds: [blankMed()],
    confirmedMedIds: [] as string[],
    requestExpertContact: false,
    referralSources: [] as ReferralSource[],
    referralAgentName: "",
    referralFriendFamily: "",
    referralMedicareEvent: "",
    referralOther: "",
  });

  useEffect(() => {
    if (draftRestoredRef.current) return;
    const draft = loadIntakeWizardDraft();
    if (!draft) return;
    draftRestoredRef.current = true;
    setStep(draft.step);
    setBirthYear(draft.birthYear);
    setZip(draft.zip);
    setCounty(draft.county);
    setGender(draft.gender);
    setTobacco(draft.tobacco);
    setIncomeBand(draft.incomeBand);
    setCostPref(draft.costPref);
    setConditions(draft.conditions);
    setOtherConditions(draft.otherConditions);
    setOtherInput(draft.otherInput);
    setMeds(draft.meds.length > 0 ? draft.meds : [blankMed()]);
    setConfirmedMedIds(draft.confirmedMedIds ?? []);
    setRequestExpertContact(draft.requestExpertContact);
    setReferralSources(
      draft.referralSources ??
        ("referralSource" in draft && draft.referralSource
          ? [draft.referralSource as ReferralSource]
          : []),
    );
    setReferralAgentName(draft.referralAgentName);
    setReferralFriendFamily(draft.referralFriendFamily ?? "");
    setReferralMedicareEvent(draft.referralMedicareEvent ?? "");
    setReferralOther(draft.referralOther);
    toast.message("Restored your in-progress scenario");
  }, []);

  const scrollWizardIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const persistDraftStep = useCallback((next: number) => {
    const clamped = Math.min(3, Math.max(1, next));
    draftSnapshotRef.current = { ...draftSnapshotRef.current, step: clamped };
    saveIntakeWizardDraft(draftSnapshotRef.current);
    return clamped;
  }, []);

  const goToStep = useCallback(
    (next: number) => {
      const clamped = persistDraftStep(next);
      setStep(clamped);
      scrollWizardIntoView();
    },
    [persistDraftStep, scrollWizardIntoView],
  );

  const handleBack = useCallback(() => {
    if (step <= 1) {
      router.navigate({ to: "/" });
      return;
    }
    goToStep(step - 1);
  }, [goToStep, router, step]);

  useEffect(() => {
    draftSnapshotRef.current = {
      step,
      birthYear,
      zip,
      county,
      gender,
      tobacco,
      incomeBand,
      costPref,
      conditions,
      otherConditions,
      otherInput,
      meds,
      confirmedMedIds,
      requestExpertContact,
      referralSources,
      referralAgentName,
      referralFriendFamily,
      referralMedicareEvent,
      referralOther,
    };
  }, [
    step,
    birthYear,
    zip,
    county,
    gender,
    tobacco,
    incomeBand,
    costPref,
    conditions,
    otherConditions,
    otherInput,
    meds,
    confirmedMedIds,
    requestExpertContact,
    referralSources,
    referralAgentName,
    referralFriendFamily,
    referralMedicareEvent,
    referralOther,
  ]);

  useEffect(() => {
    if (step <= 1 && !birthYear && !zip && conditions.length === 0) return;
    const timer = window.setTimeout(() => {
      saveIntakeWizardDraft(draftSnapshotRef.current);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    step,
    birthYear,
    zip,
    county,
    gender,
    tobacco,
    incomeBand,
    costPref,
    conditions,
    otherConditions,
    otherInput,
    meds,
    confirmedMedIds,
    requestExpertContact,
    referralSources,
    referralAgentName,
    referralFriendFamily,
    referralMedicareEvent,
    referralOther,
  ]);

  useEffect(() => {
    return registerDeploySaveHandler(async () => {
      saveIntakeWizardDraft(draftSnapshotRef.current);
    });
  }, []);

  const applyZipInput = (raw: string) => {
    setZip(normalizeZip3Input(raw));
  };

  const syncZipFromDom = () => {
    const el = zipInputRef.current;
    if (!el) return;
    const normalized = normalizeZip3Input(el.value);
    if (normalized !== zip) setZip(normalized);
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
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
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

  // Single-county ZIP prefixes auto-select (INTAKE-002).
  useEffect(() => {
    if (countyOptions.length !== 1) return;
    const only = countyOptions[0]!.county;
    if (county !== only) setCounty(only);
  }, [zip3, countyOptions, county]);

  // When counties become available, bring the field into view (helps iPad testers).
  useEffect(() => {
    if (countyOptions.length === 0) return;
    countyFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [countyOptions.length, zip3]);

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

  const removeOtherCondition = (c: string) => setOtherConditions((p) => p.filter((x) => x !== c));

  const referralDetailValues = {
    agent_referral: referralAgentName,
    friend_family: referralFriendFamily,
    medicare_event: referralMedicareEvent,
    other: referralOther,
  } as const;

  const setReferralDetailValue = (source: keyof typeof referralDetailValues, value: string) => {
    switch (source) {
      case "agent_referral":
        setReferralAgentName(value);
        break;
      case "friend_family":
        setReferralFriendFamily(value);
        break;
      case "medicare_event":
        setReferralMedicareEvent(value);
        break;
      case "other":
        setReferralOther(value);
        break;
    }
  };

  const clearReferralDetail = (source: ReferralSource) => {
    if (source === "agent_referral") setReferralAgentName("");
    if (source === "friend_family") setReferralFriendFamily("");
    if (source === "medicare_event") setReferralMedicareEvent("");
    if (source === "other") setReferralOther("");
  };

  const toggleReferralSource = (value: ReferralSource) => {
    setReferralSources((prev) => {
      if (value === "prefer_not_to_say") {
        return prev.includes(value) ? [] : [value];
      }
      const withoutPrefer = prev.filter((s) => s !== "prefer_not_to_say");
      return withoutPrefer.includes(value)
        ? withoutPrefer.filter((s) => s !== value)
        : [...withoutPrefer, value];
    });
  };

  const handleReferralSourceChange = (value: ReferralSource) => {
    const isSelected = referralSources.includes(value);
    if (isSelected) {
      clearReferralDetail(value);
    } else if (value === "prefer_not_to_say") {
      for (const source of referralSources) clearReferralDetail(source);
    }
    toggleReferralSource(value);
  };

  const allConditions = conditions.filter((c) => c !== "Other").concat(otherConditions);

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

  const confirmMed = (id: string) => {
    const med = meds.find((m) => m.id === id);
    if (!med?.medication_name.trim()) {
      toast.error("Enter a medication name before adding this drug.");
      return;
    }
    const nameLower = med.medication_name.trim().toLowerCase();
    const duplicate = meds.some(
      (m) =>
        m.id !== id &&
        confirmedMedIds.includes(m.id) &&
        m.medication_name.trim().toLowerCase() === nameLower,
    );
    if (duplicate) {
      toast.error("This drug is already in your list.");
      return;
    }
    if (!confirmedMedIds.includes(id)) {
      setConfirmedMedIds((prev) => [...prev, id]);
    }
    if (!med.resolved_diagnosis) {
      updateMed(id, { resolved_diagnosis: resolveDiagnosis(med.medication_name) ?? undefined });
    }
    toast.success(`Added ${med.medication_name.trim()}`);
  };

  const removeMed = (id: string) => {
    setMeds((prev) => prev.filter((x) => x.id !== id));
    setConfirmedMedIds((prev) => prev.filter((x) => x !== id));
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
    // Strip dose/form annotations from the RxNorm display name so the input
    // shows just the drug name (e.g. "Lipitor" not "Lipitor 10 MG Oral Tablet").
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
    // Fetch generic equivalent in the background.
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

  const finish = async () => {
    if (!birthYear) {
      toast.error("Please enter your year of birth");
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
          .join(", ")}.`,
      );
      return;
    }
    if (!gender) {
      toast.error("Please select a gender option");
      return;
    }
    if (tobacco === null) {
      toast.error("Please indicate whether you use tobacco");
      return;
    }
    if (!incomeBand) {
      toast.error("Please select an income band");
      return;
    }
    if (!costPref) {
      toast.error("Please select a cost preference");
      return;
    }
    const referralError = validateReferralDetails(referralSources, {
      agent_referral: referralAgentName,
      friend_family: referralFriendFamily,
      medicare_event: referralMedicareEvent,
      other: referralOther,
    });
    if (referralError) {
      toast.error(referralError);
      return;
    }
    const submittedMeds = meds.filter(
      (m) => confirmedMedIds.includes(m.id) && m.medication_name.trim(),
    );
    const unconfirmedFilled = meds.filter(
      (m) => !confirmedMedIds.includes(m.id) && m.medication_name.trim(),
    );
    if (unconfirmedFilled.length) {
      toast.error('Click "Add this Drug" on each medication card before creating your scenario.');
      return;
    }
    if (submittedMeds.length === 0) {
      toast.error('Add at least one medication using "Add this Drug".');
      return;
    }
    setBusy(true);
    const referralPrefs = buildReferralPreferences(referralSources, {
      agent_referral: referralAgentName,
      friend_family: referralFriendFamily,
      medicare_event: referralMedicareEvent,
      other: referralOther,
    });
    const { data, error } = await supabase.rpc("create_scenario", {
      p_birth_year: birthYear as number,
      p_zip3: zip3,
      p_gender: gender,
      p_tobacco: tobacco as boolean,
      p_income_band: incomeBand,
      p_cost_preference: costPref as "minimize_monthly" | "predictability",
      p_medications: submittedMeds as unknown as never,
      p_conditions: allConditions as unknown as never,
      p_preferences: {
        county: county.trim(),
        ...(requestExpertContact ? { requestExpertContact: true } : {}),
        ...referralPrefs,
      } as unknown as never,
    });
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create scenario");
      return;
    }
    const code = data as string;
    try {
      sessionStorage.setItem(
        `scenario:${code}`,
        JSON.stringify({
          scenarioCode: code,
          year: new Date().getFullYear() < 2027 ? 2026 : 2027,
          birthYear,
          zip3,
          county: county.trim(),
          gender,
          tobacco,
          incomeBand,
          costPreference: costPref,
          conditions: allConditions,
          medications: submittedMeds,
          requestExpertContact,
          referralSources,
          referralAgentName: referralAgentName.trim() || undefined,
          referralFriendFamily: referralFriendFamily.trim() || undefined,
          referralMedicareEvent: referralMedicareEvent.trim() || undefined,
          referralOther: referralOther.trim() || undefined,
        }),
      );
    } catch {
      /* ignore quota */
    }
    try {
      (await import("@/lib/scenario-history")).rememberScenario(code);
    } catch {
      /* ignore */
    }
    toast.success("Scenario created");
    clearIntakeWizardDraft();
    onDone?.(code);
  };

  return (
    <TooltipProvider delayDuration={300}>
    <Card className="glass p-6 max-w-3xl mx-auto">
      <div className="flex gap-2 bg-warning/10 border border-warning/30 rounded-md p-3 mb-5 text-xs">
        <ShieldAlert className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <strong>We do not collect any personally identifiable information.</strong> Do NOT enter
          your name, address, phone, email, Social Security number, Medicare ID, or date of birth —
          there are no fields for these. You will receive a Scenario ID to share with your agent
          yourself.
        </div>
      </div>

      <div ref={wizardTopRef} className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">
            Step 1 · Demographics (no name, no birth date)
          </h3>
          <p className="text-xs text-muted-foreground">Next: Cost preference →</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <WizardFieldLabel
                required
                tip="Used to estimate Medicare eligibility and age-based plan options. We only store the year — never your full birth date."
              >
                Year of birth
              </WizardFieldLabel>
              <Input
                type="number"
                inputMode="numeric"
                min={MIN_BIRTH_YEAR}
                max={MAX_BIRTH_YEAR}
                placeholder="e.g. 1958"
                value={birthYear}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    setBirthYear("");
                    return;
                  }
                  const n = Number(raw);
                  if (!Number.isNaN(n)) setBirthYear(n);
                }}
                list="birth-year-options"
                className="text-base md:text-sm touch-manipulation"
                required
              />
              <datalist id="birth-year-options">
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground mt-1">
                Type your birth year or pick from suggestions ({MIN_BIRTH_YEAR}–{MAX_BIRTH_YEAR}).
              </p>
            </div>
            <div>
              <WizardFieldLabel
                required
                tip="The first three digits of your ZIP locate your region for plan availability. We never store your full ZIP code or street address."
              >
                ZIP code (first 3 digits)
              </WizardFieldLabel>
              <Input
                ref={zipInputRef}
                type="tel"
                value={zip}
                onChange={(e) => applyZipInput(e.target.value)}
                onInput={(e) => applyZipInput(e.currentTarget.value)}
                onBlur={syncZipFromDom}
                placeholder="e.g. 770"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="next"
                maxLength={3}
                className="text-base md:text-sm touch-manipulation"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                We only store the first 3 digits — never your full ZIP.
              </p>
            </div>
            <div className="col-span-2" ref={countyFieldRef}>
              <WizardFieldLabel
                required
                tip="Medicare Advantage and Part D plans vary by county, even within the same ZIP prefix. Choose the county or parish where you live."
              >
                County or parish
              </WizardFieldLabel>
              {countyOptions.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <select
                    key={`county-select-${zip3}`}
                    className="w-full min-h-11 sm:min-h-9 border border-input rounded-md px-3 py-2 text-base md:text-sm bg-background touch-manipulation"
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
                  <VoiceButton
                    label="Speak county name"
                    onTranscript={(t) => setCounty(t.slice(0, 80))}
                  />
                </div>
              )}
              {zip3Unknown && (
                <p className="text-xs text-destructive mt-1">
                  We don't recognize ZIP prefix {zip}. Double-check the first 3 digits of your ZIP.
                </p>
              )}
              {countyOptions.length > 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ZIP prefix {zip} covers {countyOptions.length} counties — tap the list above to
                  pick yours ({countyOptions.map((c) => c.county).join(", ")}).
                </p>
              )}
              {countyOptions.length === 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Only one county for ZIP prefix {zip}.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <WizardFieldLabel
                required
                tip="Some plan cost estimates use gender for actuarial pricing. Pick the option that best describes you."
              >
                Gender
              </WizardFieldLabel>
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
              <WizardFieldLabel
                required
                tip="Tobacco use can affect Part B premiums and some Medigap pricing. Answer honestly for accurate estimates."
              >
                Tobacco use
              </WizardFieldLabel>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary shrink-0"
                  checked={tobacco === true}
                  onChange={() => setTobacco(true)}
                />
                <span className="text-sm">
                  <strong>Yes</strong> — I use tobacco
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary shrink-0"
                  checked={tobacco === false}
                  onChange={() => setTobacco(false)}
                />
                <span className="text-sm">
                  <strong>No</strong> — I do not use tobacco
                </span>
              </label>
            </div>
            <div className="col-span-2 space-y-2">
              <WizardFieldLabel
                required
                tip="Income range helps estimate Extra Help (LIS) eligibility and monthly costs. We only store the band — never your exact income."
              >
                Income band
              </WizardFieldLabel>
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
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 2 · Preferences &amp; Conditions</h3>
          <p className="text-xs text-muted-foreground">Next: Medications →</p>

          <Card className="p-4 bg-primary/5 border-primary/20 space-y-3">
            <WizardFieldLabel
              required
              tip="Choose what matters most when comparing plans: lowest monthly premium, or fewer surprise medical bills (often favoring PPO-style coverage)."
            >
              a. Cost preference
            </WizardFieldLabel>
            <p className="text-xs text-muted-foreground">Pick one — what matters most to you?</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={costPref === "minimize_monthly"}
                onChange={() => setCostPref("minimize_monthly")}
              />
              <span className="text-sm">
                <strong>Minimize monthly cost</strong> — lowest premium each month.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={costPref === "predictability"}
                onChange={() => setCostPref("predictability")}
              />
              <span className="text-sm">
                <strong>Predictability matters more</strong> — no surprise medical bills (lean
                toward PPO vs. HMO).
              </span>
            </label>
          </Card>

          <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
            <WizardFieldLabel tip="Health conditions help us suggest common medications and tailor drug-cost estimates. Optional — check all that apply.">
              b. Conditions
            </WizardFieldLabel>
            <p className="text-xs text-muted-foreground">Optional — check all that apply</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CONDITIONS.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-1.5 text-xs cursor-pointer border border-input rounded-md px-2 py-1.5 bg-background hover:bg-muted/40 leading-tight"
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-primary shrink-0"
                    checked={conditions.includes(c)}
                    onChange={() => toggleCondition(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            {conditions.includes("Other") && (
              <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
                <WizardFieldLabel tip="Type a condition not listed above, then press Enter or tap + to add it. This helps us suggest relevant medications.">
                  Add your condition(s)
                </WizardFieldLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    className="w-full min-h-10"
                    placeholder="e.g. Asthma, Glaucoma, Osteoporosis"
                    value={otherInput}
                    onChange={(e) => setOtherInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOtherCondition();
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <VoiceButton
                      label="Speak condition name"
                      onTranscript={(t) => setOtherInput(t)}
                    />
                    <Button size="sm" onClick={addOtherCondition}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {otherConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {otherConditions.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => removeOtherCondition(c)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold">Step 3 · Medications</h3>

          <Card className="p-2.5 md:p-3 bg-muted/40 border-dashed">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Your scenario so far
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-0.5 text-xs leading-snug">
              <div>
                <span className="text-muted-foreground">Birth year:</span> {birthYear}
              </div>
              <div>
                <span className="text-muted-foreground">ZIP3:</span> {zip3 || "—"}
              </div>
              <div className="col-span-2 sm:col-span-1 min-w-0 truncate">
                <span className="text-muted-foreground">County:</span> {county || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span> {gender.replace(/_/g, " ")}
              </div>
              <div>
                <span className="text-muted-foreground">Tobacco:</span> {tobacco ? "Yes" : "No"}
              </div>
              <div className="col-span-2 sm:col-span-1 min-w-0">
                <span className="text-muted-foreground">Income:</span> {incomeBand}
              </div>
              <div className="col-span-2 sm:col-span-3 flex flex-wrap items-baseline gap-x-3 gap-y-0">
                <span className="shrink-0">
                  <span className="text-muted-foreground">Priority:</span>{" "}
                  {costPref === "minimize_monthly"
                    ? "Minimize monthly cost"
                    : costPref === "predictability"
                      ? "Predictability"
                      : "—"}
                </span>
                <span className="min-w-0">
                  <span className="text-muted-foreground">Conditions:</span>{" "}
                  {allConditions.length ? allConditions.join(", ") : "None selected"}
                </span>
              </div>
            </div>
          </Card>

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
                  Tip: go back to Step 2 and pick your conditions to see a list of common
                  medications you can add with one click.
                </p>
              );
            return (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="text-sm font-semibold mb-2">
                  Common medications for your conditions
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Don't remember the exact drug? Click any to add it — you can edit details after.
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
                          disabled={already}
                          onClick={() =>
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
                              if (p.length === 1 && !p[0].medication_name.trim()) return [next];
                              return [...p, next];
                            })
                          }
                          className={`text-xs border rounded-full px-3 py-1.5 transition ${already ? "bg-muted text-muted-foreground border-border cursor-not-allowed" : "bg-background border-primary/40 hover:bg-primary hover:text-primary-foreground"}`}
                        >
                          <Plus className="h-3 w-3 inline mr-1" />
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
                          className="text-xs border rounded-full px-3 py-1.5 bg-emerald/10 border-emerald/40 text-foreground"
                        >
                          <Check className="h-3 w-3 inline mr-1 text-emerald" />
                          {m.medication_name}
                          {m.strength ? (
                            <span className="opacity-70"> ({m.strength})</span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })()}

          <p className="text-sm text-muted-foreground">
            Your medication may not appear on this list as an exact match. Pick the closest option
            or type the name as you know it — coverage estimates may be less certain for drugs not
            in our catalog.
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
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={isConfirmed ? "secondary" : "outline"}
                    className="gap-1"
                    title="Add this drug to your list"
                    aria-label="Add this drug to your list"
                    disabled={isConfirmed}
                    onClick={() => confirmMed(m.id)}
                  >
                    {isConfirmed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {isConfirmed ? "Added" : "Add this Drug"}
                  </Button>
                  {meds.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      title="Remove this medication"
                      aria-label="Remove this medication"
                      onClick={() => removeMed(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                        setTimeout(() => setFocusedMedId((cur) => (cur === m.id ? null : cur)), 150)
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
                          {local.length > 0 && (
                            <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40">
                              In our pricing catalog
                            </div>
                          )}
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
                              <div className="font-medium">
                                {r.name}{" "}
                                {r.strength && r.strength !== "—" ? (
                                  <span className="text-muted-foreground font-normal">
                                    · {r.strength}
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {r.form ?? "—"} · {r.category ?? "—"}
                                {r.aliases?.length ? (
                                  <span className="opacity-70"> · aka {r.aliases.join(", ")}</span>
                                ) : null}
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
                              onMouseDown={(e) => {
                                e.preventDefault();
                                applyRxNormEntry(m.id, r);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                            >
                              <div className="font-medium">{r.name}</div>
                              <div className="text-xs text-muted-foreground">
                                RxNorm · pricing not in catalog — will be flagged
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                      })()}
                  </div>
                  <div className="relative min-w-0 flex flex-col gap-1">
                    <WizardFieldLabel tip="Dosage amount on your label — for example 10 mg, 100 units, or 0.5 mL. Use the mic button to speak it.">
                      Strength
                    </WizardFieldLabel>
                    <div className="relative">
                    <Input
                      className="w-full pr-16"
                      placeholder="Strength"
                    value={m.strength}
                    onChange={(e) => updateMed(m.id, { strength: e.target.value })}
                  />
                  <VoiceButton
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    label="Speak strength (e.g. 10 milligrams)"
                      onTranscript={(t) => updateMed(m.id, { strength: t })}
                    />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <WizardFieldLabel tip="How the medication is delivered — tablet, capsule, injection, inhaler, patch, and so on.">
                      Dosage form
                    </WizardFieldLabel>
                  <div className="flex gap-1 items-center min-w-0">
                    <select
                    className="w-full min-w-0 border border-input rounded-md px-3 h-9 bg-background text-sm"
                    value={
                      DOSAGE_FORMS.includes(m.dosage_form)
                        ? m.dosage_form
                        : m.dosage_form
                          ? "Other"
                          : ""
                    }
                    onChange={(e) => updateMed(m.id, { dosage_form: e.target.value })}
                  >
                    <option value="">Form…</option>
                    {DOSAGE_FORMS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
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
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <WizardFieldLabel tip="How often you take or use this medication — once daily, twice daily, as needed, and so on.">
                    Frequency
                  </WizardFieldLabel>
                  <div className="flex gap-1 items-center min-w-0">
                    <select
                    className="w-full min-w-0 border border-input rounded-md px-3 h-9 bg-background text-sm"
                    value={
                      FREQUENCIES.includes(m.frequency)
                        ? m.frequency
                        : m.frequency === "Daily"
                          ? "Once daily"
                          : ""
                    }
                    onChange={(e) => updateMed(m.id, { frequency: e.target.value })}
                  >
                    <option value="">Frequency…</option>
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
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
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <WizardFieldLabel tip="Estimated monthly cash price before insurance — auto-filled from our catalog when available. Edit to match what your pharmacy charges.">
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
                <WizardFieldLabel tip="We link each drug to a health condition for plan comparison. This is filled in automatically — change it if our guess is wrong.">
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
                  <VoiceButton
                    label="Speak condition"
                    onTranscript={(t) => updateMed(m.id, { resolved_diagnosis: t })}
                  />
                </div>
              </div>
              {m.coverage_uncertain && (
                <div className="flex items-start gap-2 text-xs bg-warning/10 border border-warning/30 rounded-md p-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-warning">
                      Not in our pricing catalog — coverage will be flagged
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      This drug is FDA-recognized (RxNorm) but its Part D tier and cost vary by
                      plan. We'll still include it in the determination using the monthly retail you
                      enter.
                    </div>
                    {m.generic_alternative && (
                      <div className="mt-1 text-foreground">
                        Generic equivalent available:{" "}
                        <span className="font-semibold">{m.generic_alternative}</span> — usually
                        much cheaper.
                      </div>
                    )}
                    {!m.generic_alternative && m.no_generic_available && (
                      <div className="mt-1 text-foreground">
                        No generic equivalent available — this is a brand-only drug.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
            );
          })}

          <div className="flex justify-center">
            <Button
              type="button"
              size="sm"
              variant="outline"
              title="Add another medication card"
              aria-label="Add another medication card"
              onClick={() => {
                const last = meds[meds.length - 1];
                if (last && !last.medication_name.trim()) {
                  toast.error("Enter a medication name in the current card first.");
                  return;
                }
                if (last && !confirmedMedIds.includes(last.id)) {
                  toast.error('Click "Add this Drug" on the current card before adding another.');
                  return;
                }
                setMeds([...meds, blankMed()]);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add drug
            </Button>
          </div>

          <Card className="p-4 bg-muted/30 border-muted-foreground/20">
            <TouchCheckboxField
              checked={requestExpertContact}
              onChange={(e) => {
                const checked = e.target.checked;
                setRequestExpertContact(checked);
                if (checked) setExpertContactNoticeOpen(true);
              }}
            >
              <span className="text-sm">
                I have questions about my medications — please have a licensed Medicare Agent from
                CMS Health &amp; Wealth Insurance contact me
              </span>
            </TouchCheckboxField>
          </Card>

          <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
            <WizardFieldLabel tip="Optional — helps us understand how people find the tool. Do not enter names, email, phone numbers, or other personal information.">
              How did you hear about us?
            </WizardFieldLabel>
            <p className="text-xs text-muted-foreground leading-snug">
              Optional — select all that apply. Do not enter your name, email, phone, or anyone
              else&apos;s personal information.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {REFERRAL_SOURCES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-1.5 text-xs cursor-pointer border rounded-md px-2 py-1.5 bg-background hover:bg-muted/40 leading-tight ${
                    referralSources.includes(value) ? "border-primary bg-primary/5" : "border-input"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-primary shrink-0"
                    checked={referralSources.includes(value)}
                    onChange={() => handleReferralSourceChange(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {REFERRAL_SOURCES_WITH_DETAIL.filter((source) => referralSources.includes(source)).map(
              (source) => {
                const field = REFERRAL_DETAIL_FIELDS[source];
                return (
                  <div key={source} className="space-y-1 pt-1 border-t border-primary/10">
                    <WizardFieldLabel tip={field.hint}>
                      {field.label}
                      {field.required ? " *" : ""}
                    </WizardFieldLabel>
                    <Input
                      className="h-9 text-sm"
                      placeholder={field.placeholder}
                      value={referralDetailValues[source]}
                      onChange={(e) =>
                        setReferralDetailValue(source, e.target.value.slice(0, 80))
                      }
                      maxLength={80}
                      required={field.required}
                    />
                  </div>
                );
              },
            )}
            {referralSources.includes("other") && (
              <div className="space-y-1 pt-1 border-t border-primary/10">
                <Label className="text-xs">Please briefly describe *</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g. Community bulletin board"
                  value={referralOther}
                  onChange={(e) => setReferralOther(e.target.value.slice(0, 80))}
                  maxLength={80}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  No names, email addresses, or phone numbers.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {step < 3 ? (
          <Button
            type="button"
            onClick={() => {
              if (step === 1) {
                if (!birthYear) {
                  toast.error("Please enter your year of birth before continuing.");
                  return;
                }
                if (birthYear < MIN_BIRTH_YEAR || birthYear > MAX_BIRTH_YEAR) {
                  toast.error(
                    `Year of birth must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}.`,
                  );
                  return;
                }
                if (!/^\d{3}$/.test(zip)) {
                  toast.error(
                    "Please enter the first 3 digits of your ZIP code before continuing.",
                  );
                  return;
                }
                if (county.trim().length < 2) {
                  toast.error("Please select your county or parish before continuing.");
                  return;
                }
                if (countyOptions.length > 0 && !countyMatchesZip3(county, zip3)) {
                  toast.error(
                    `"${county}" is not within ZIP ${zip}xx. Valid options: ${countyOptions.map((c) => c.county).join(", ")}.`,
                  );
                  return;
                }
                if (!gender) {
                  toast.error("Please select a gender option before continuing.");
                  return;
                }
                if (tobacco === null) {
                  toast.error("Please indicate whether you use tobacco before continuing.");
                  return;
                }
                if (!incomeBand) {
                  toast.error("Please select an income band before continuing.");
                  return;
                }
              }
              if (step === 2) {
                if (!costPref) {
                  toast.error("Please select a cost preference before continuing.");
                  return;
                }
              }
              goToStep(step + 1);
            }}
            className="grad-indigo"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={finish} disabled={busy} className="grad-indigo">
            {busy ? "Creating…" : "Create scenario"}
          </Button>
        )}
      </div>

      <Dialog open={expertContactNoticeOpen} onOpenChange={setExpertContactNoticeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>We&apos;ll connect you with an expert</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-left">
              After you create your scenario, you&apos;ll enter your email and phone. A licensed
              Medicare Agent from CMS Health &amp; Wealth Insurance — will contact you about your
              medications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setExpertContactNoticeOpen(false)}
              className="grad-indigo w-full sm:w-auto"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
    </TooltipProvider>
  );
}
