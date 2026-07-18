import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zip3CountySelect } from "@/components/Zip3CountySelect";
import { IntakeReferralFields } from "@/components/intake/IntakeReferralFields";
import { IntakeConditionsFields } from "@/components/intake/IntakeConditionsFields";
import { IntakeMedicationsFields } from "@/components/intake/IntakeMedicationsFields";
import { PBO_BLUEPRINT_LABEL } from "@/lib/plan-comparison-copy";
import { INCOME_BANDS, INCOME_BAND_FIELD_LABEL, INCOME_BAND_FIELD_TIP, type IncomeBand } from "@/lib/income-bands";
import { saveBenchmarkEstimate } from "@/lib/benchmark-estimate-storage";
import { benchmarkOptInSessionKeys, markBenchmarkAwaitingPlans } from "@/lib/benchmark-optin-trigger";
import {
  finalizeBenchmarkIntake,
  needsBenchmarkEligibilityQuestion,
  type BenchmarkBenefitPriority,
  type BenchmarkEligibilityCircumstance,
  type BenchmarkGender,
  type BenchmarkIntakeInput,
  type BenchmarkMedicareEnrolled,
  type BenchmarkPreferredPharmacy,
  type BenchmarkVisitFrequency,
} from "@/lib/benchmark-intake";
import {
  BIRTH_YEAR_SUGGESTIONS,
  INTAKE_GENDER_OPTIONS,
  MAX_BIRTH_YEAR,
  MIN_BIRTH_YEAR,
} from "@/lib/intake-constants";
import {
  countiesForZip3,
  countyMatchesZip3,
  normalizeZip3Input,
} from "@/lib/zip3-county-lookup";
import { cn } from "@/lib/utils";
import { useIntakeReferral } from "@/hooks/use-intake-referral";
import { useIntakeConditions } from "@/hooks/use-intake-conditions";
import { useIntakeMedications } from "@/hooks/use-intake-medications";
import {
  buildReferralPreferences,
  validateReferralDetails,
} from "@/lib/referral-sources";

const STEP_COUNT = 5;

const BENEFIT_OPTIONS = [
  { value: "dental", label: "Dental Coverage" },
  { value: "vision", label: "Vision Care" },
  { value: "hearing", label: "Hearing Aids" },
  { value: "fitness", label: "Gym Memberships / Fitness" },
  { value: "otc", label: "Over-the-Counter (OTC) Allowances" },
] as const;

function RadioOption({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-2.5 cursor-pointer border rounded-md px-3 py-2.5 bg-background hover:bg-muted/40 transition-colors",
        checked ? "border-primary bg-primary/5" : "border-input",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 accent-primary shrink-0"
      />
      <span className="text-sm leading-snug">{children}</span>
    </label>
  );
}

function CompactChoice({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 cursor-pointer border rounded-md px-2 py-1.5 bg-background hover:bg-muted/40 transition-colors text-xs leading-snug",
        checked ? "border-primary bg-primary/5 font-semibold" : "border-input",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-primary shrink-0"
      />
      {children}
    </label>
  );
}

function FieldLegend({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <legend className="text-sm font-semibold mb-2 block">
      {children}
      {required ? <span className="text-destructive ml-0.5">*</span> : null}
    </legend>
  );
}

export function EducationalIntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [birthYear, setBirthYear] = useState<number | "">("");
  const [gender, setGender] = useState<BenchmarkGender | "">("");
  const [tobacco, setTobacco] = useState<boolean | null>(null);
  const [zip3, setZip3] = useState("");
  const [county, setCounty] = useState("");
  const [medicareEnrolled, setMedicareEnrolled] = useState<BenchmarkMedicareEnrolled | "">("");
  const [eligibilityCircumstance, setEligibilityCircumstance] = useState<
    BenchmarkEligibilityCircumstance | ""
  >("");
  const [eligibilityCircumstanceOther, setEligibilityCircumstanceOther] = useState("");
  const [incomeBand, setIncomeBand] = useState<IncomeBand | "">("");

  const intakeConditions = useIntakeConditions();
  const {
    conditions,
    otherConditions,
    otherInput,
    setOtherInput,
    allConditions,
    toggleCondition,
    addOtherCondition,
    removeOtherCondition,
  } = intakeConditions;

  const intakeMeds = useIntakeMedications();
  const {
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
  } = intakeMeds;

  const handleMedicationSaveAndFinish = (medId: string) => {
    if (!finishMedicationEntry(medId)) return;
    goToStep(4);
  };

  const [visitFrequency, setVisitFrequency] = useState<BenchmarkVisitFrequency | "">("");
  const [preferredPharmacy, setPreferredPharmacy] = useState<BenchmarkPreferredPharmacy | "">("");
  const [preferredPharmacyName, setPreferredPharmacyName] = useState("");

  const [benefitPriorities, setBenefitPriorities] = useState<BenchmarkBenefitPriority[]>([]);

  const {
    referralSources,
    referralAgentName,
    referralFriendFamily,
    referralMedicareEvent,
    referralOther,
    setReferralOther,
    referralDetailValues,
    setReferralDetailValue,
    handleReferralSourceChange,
  } = useIntakeReferral();

  const wizardTopRef = useRef<HTMLDivElement>(null);
  const countyFieldRef = useRef<HTMLDivElement>(null);

  const countyOptions = useMemo(
    () => (/^\d{3}$/.test(zip3) ? countiesForZip3(zip3) : []),
    [zip3],
  );
  const zip3Unknown = /^\d{3}$/.test(zip3) && countyOptions.length === 0;
  const showEligibilityQuestion =
    medicareEnrolled !== "" && needsBenchmarkEligibilityQuestion(medicareEnrolled);

  const setMedicareEnrolledChoice = (value: BenchmarkMedicareEnrolled) => {
    setMedicareEnrolled(value);
    if (!needsBenchmarkEligibilityQuestion(value)) {
      setEligibilityCircumstance("");
      setEligibilityCircumstanceOther("");
    }
  };

  useEffect(() => {
    if (!/^\d{3}$/.test(zip3)) return;
    if (county && !countyMatchesZip3(county, zip3)) setCounty("");
  }, [zip3]);

  useEffect(() => {
    if (countyOptions.length !== 1) return;
    const only = countyOptions[0]!.county;
    if (county !== only) setCounty(only);
  }, [zip3, countyOptions, county]);

  useEffect(() => {
    if (countyOptions.length === 0) return;
    countyFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [countyOptions.length, zip3]);

  const scrollToTop = () => {
    wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToStep = (next: number) => {
    setStep(next);
    scrollToTop();
  };

  const toggleBenefit = (value: BenchmarkBenefitPriority, checked: boolean) => {
    setBenefitPriorities((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  };

  const currentIntake = (submittedMeds = validateForSubmit()): BenchmarkIntakeInput | null => {
    const eligibilityRequired =
      medicareEnrolled !== "" && needsBenchmarkEligibilityQuestion(medicareEnrolled);
    if (
      !birthYear ||
      !gender ||
      tobacco === null ||
      !medicareEnrolled ||
      (eligibilityRequired && !eligibilityCircumstance) ||
      !incomeBand ||
      !visitFrequency ||
      !preferredPharmacy
    ) {
      return null;
    }
    if (!submittedMeds.ok) return null;
    const medicationDetails = submittedMeds.submitted as typeof meds;
    const medicationNames = medicationDetails
      .map((m) => m.medication_name.trim())
      .filter(Boolean);
    return {
      birthYear,
      gender,
      tobacco,
      zip3,
      county: county.trim(),
      medicareEnrolled,
      eligibilityCircumstance: eligibilityRequired ? eligibilityCircumstance : null,
      eligibilityCircumstanceOther: eligibilityCircumstanceOther.trim(),
      incomeBand,
      conditions: allConditions,
      medications: medicationNames,
      medicationDetails,
      visitFrequency,
      preferredPharmacy,
      preferredPharmacyName,
      benefitPriorities,
      referral: buildReferralPreferences(referralSources, {
        agent_referral: referralAgentName,
        friend_family: referralFriendFamily,
        medicare_event: referralMedicareEvent,
        other: referralOther,
      }),
    };
  };

  const validateStep = (current: number): boolean => {
    if (current === 1) {
      if (!birthYear) {
        toast.error("Enter your year of birth.");
        return false;
      }
      if (birthYear < MIN_BIRTH_YEAR || birthYear > MAX_BIRTH_YEAR) {
        toast.error(`Year of birth must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}.`);
        return false;
      }
      if (!gender) {
        toast.error("Select your gender.");
        return false;
      }
      if (tobacco === null) {
        toast.error("Select whether you are a smoker or non-smoker.");
        return false;
      }
      if (!/^\d{3}$/.test(zip3)) {
        toast.error("Enter exactly 3 digits of your ZIP code.");
        return false;
      }
      if (county.trim().length < 2) {
        toast.error("Please select your county or parish.");
        return false;
      }
      if (countyOptions.length > 0 && !countyMatchesZip3(county, zip3)) {
        toast.error(
          `"${county}" is not within ZIP ${zip3}xx. Valid options: ${countyOptions.map((c) => c.county).join(", ")}.`,
        );
        return false;
      }
      if (zip3Unknown) {
        toast.error(`We don't recognize ZIP prefix ${zip3}. Double-check the first 3 digits.`);
        return false;
      }
      if (!medicareEnrolled) {
        toast.error("Select your current Medicare enrollment status.");
        return false;
      }
      if (showEligibilityQuestion && !eligibilityCircumstance) {
        toast.error("Select the option that best describes your situation.");
        return false;
      }
      if (!incomeBand) {
        toast.error("Please select an income band.");
        return false;
      }
      return true;
    }
    if (current === 2) {
      return true;
    }
    if (current === 3) {
      const medValidation = validateForSubmit();
      if (!medValidation.ok) {
        toast.error(medValidation.error);
        return false;
      }
      return true;
    }
    if (current === 4) {
      if (!visitFrequency) {
        toast.error("Select how often you visit doctors each year.");
        return false;
      }
      if (!preferredPharmacy) {
        toast.error("Select whether you have a preferred pharmacy.");
        return false;
      }
      if (preferredPharmacy === "yes" && !preferredPharmacyName.trim()) {
        toast.error("Enter your preferred pharmacy name.");
        return false;
      }
      return true;
    }
    if (current === 5) {
      const referralError = validateReferralDetails(referralSources, {
        agent_referral: referralAgentName,
        friend_family: referralFriendFamily,
        medicare_event: referralMedicareEvent,
        other: referralOther,
      });
      if (referralError) {
        toast.error(referralError);
        return false;
      }
      return true;
    }
    return true;
  };

  const onContinue = () => {
    if (!validateStep(step)) return;
    goToStep(Math.min(step + 1, STEP_COUNT));
  };

  const onBack = () => goToStep(Math.max(step - 1, 1));

  const onFinishIntake = async () => {
    const medValidation = validateForSubmit();
    if (
      !validateStep(1) ||
      !validateStep(2) ||
      !validateStep(3) ||
      !validateStep(4) ||
      !validateStep(5)
    ) {
      return;
    }
    if (!medValidation.ok) {
      toast.error(medValidation.error);
      return;
    }
    const intake = currentIntake(medValidation);
    if (!intake) return;

    setSubmitting(true);
    try {
      const finalized = finalizeBenchmarkIntake(intake);
      saveBenchmarkEstimate(finalized);
      const { justCreated: justCreatedKey } = benchmarkOptInSessionKeys(finalized.estimateId);
      sessionStorage.setItem(justCreatedKey, "1");
      markBenchmarkAwaitingPlans(finalized.estimateId);
      router.navigate({
        to: "/scenario/estimate/$code",
        params: { code: finalized.estimateId },
      });
    } catch (err) {
      console.error("[EducationalIntake] benchmark create failed", err);
      const message =
        err instanceof Error && import.meta.env.DEV
          ? err.message
          : "Could not generate your benchmark. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="glass p-6 max-w-3xl mx-auto">
        <div ref={wizardTopRef} className="flex items-center gap-2 mb-6" aria-hidden>
          {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors",
                step >= s ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <section className="space-y-5" aria-labelledby="intake-step-1-heading">
              <div>
                <h2 id="intake-step-1-heading" className="font-display text-xl font-bold">
                  Step 1 · {PBO_BLUEPRINT_LABEL}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Next: Conditions →</p>
              </div>

              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:p-4">
                <div>
                  <Label htmlFor="intake-birth-year" className="text-sm font-semibold">
                    Year of birth
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="intake-birth-year"
                    type="number"
                    inputMode="numeric"
                    min={MIN_BIRTH_YEAR}
                    max={MAX_BIRTH_YEAR}
                    placeholder="e.g. 1960"
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
                    list="intake-birth-year-options"
                    className="mt-1.5 max-w-[10rem] text-base md:text-sm touch-manipulation"
                    required
                  />
                  <datalist id="intake-birth-year-options">
                    {BIRTH_YEAR_SUGGESTIONS.map((y) => (
                      <option key={y} value={y} />
                    ))}
                  </datalist>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <fieldset className="min-w-0">
                    <FieldLegend required>Gender</FieldLegend>
                    <div className="grid grid-cols-2 gap-1.5">
                      {INTAKE_GENDER_OPTIONS.map(({ value, label }) => (
                        <CompactChoice
                          key={value}
                          name="intake-gender"
                          value={value}
                          checked={gender === value}
                          onChange={() => setGender(value)}
                        >
                          {label}
                        </CompactChoice>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="min-w-0">
                    <FieldLegend required>Smoker or non-smoker?</FieldLegend>
                    <div className="grid grid-cols-2 gap-1.5">
                      <CompactChoice
                        name="intake-tobacco"
                        value="smoker"
                        checked={tobacco === true}
                        onChange={() => setTobacco(true)}
                      >
                        Smoker
                      </CompactChoice>
                      <CompactChoice
                        name="intake-tobacco"
                        value="non-smoker"
                        checked={tobacco === false}
                        onChange={() => setTobacco(false)}
                      >
                        Non-smoker
                      </CompactChoice>
                    </div>
                  </fieldset>
                </div>
              </div>

              <div ref={countyFieldRef} className="grid gap-3 sm:grid-cols-[minmax(0,8.5rem)_minmax(0,18rem)] sm:items-start sm:gap-4">
                <div className="min-w-0">
                  <Label htmlFor="intake-zip3" className="text-sm font-semibold whitespace-nowrap">
                    First 3 digits of ZIP<span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="intake-zip3"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={3}
                    value={zip3}
                    onChange={(e) => setZip3(normalizeZip3Input(e.target.value))}
                    placeholder="e.g. 770"
                    className="mt-1.5 w-full text-base md:text-sm touch-manipulation"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    First 3 digits only — never your full ZIP.
                  </p>
                </div>
                <div className="min-w-0 sm:pl-2">
                  <Label htmlFor="intake-county" className="text-sm font-semibold whitespace-nowrap">
                    County or parish<span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Zip3CountySelect
                    id="intake-county"
                    zip3={zip3}
                    value={county}
                    onChange={setCounty}
                    className="mt-1.5 w-full"
                  />
                </div>
              </div>

              <fieldset className="space-y-2">
                <FieldLegend required>Are you already enrolled in Medicare?</FieldLegend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <RadioOption
                    name="medicare-enrolled"
                    value="part_a"
                    checked={medicareEnrolled === "part_a"}
                    onChange={() => setMedicareEnrolledChoice("part_a")}
                  >
                    <strong>Part A</strong>
                  </RadioOption>
                  <RadioOption
                    name="medicare-enrolled"
                    value="part_b"
                    checked={medicareEnrolled === "part_b"}
                    onChange={() => setMedicareEnrolledChoice("part_b")}
                  >
                    <strong>Part B</strong>
                  </RadioOption>
                  <RadioOption
                    name="medicare-enrolled"
                    value="both"
                    checked={medicareEnrolled === "both"}
                    onChange={() => setMedicareEnrolledChoice("both")}
                  >
                    <strong>Both</strong>
                  </RadioOption>
                  <RadioOption
                    name="medicare-enrolled"
                    value="unsure"
                    checked={medicareEnrolled === "unsure"}
                    onChange={() => setMedicareEnrolledChoice("unsure")}
                  >
                    <strong>Unsure</strong>
                  </RadioOption>
                  <RadioOption
                    name="medicare-enrolled"
                    value="none"
                    checked={medicareEnrolled === "none"}
                    onChange={() => setMedicareEnrolledChoice("none")}
                  >
                    <strong>None</strong>
                  </RadioOption>
                </div>
              </fieldset>

              {showEligibilityQuestion ? (
                <fieldset className="space-y-2">
                  <FieldLegend required>
                    Are you turning 65 soon, or do you qualify due to a special circumstance (such as a
                    recent relocation or losing employer-provided coverage)?
                  </FieldLegend>
                  <div className="grid gap-2">
                    <RadioOption
                      name="eligibility-circumstance"
                      value="turning_65"
                      checked={eligibilityCircumstance === "turning_65"}
                      onChange={() => {
                        setEligibilityCircumstance("turning_65");
                        setEligibilityCircumstanceOther("");
                      }}
                    >
                      Turning 65 soon
                    </RadioOption>
                    <RadioOption
                      name="eligibility-circumstance"
                      value="special_circumstance"
                      checked={eligibilityCircumstance === "special_circumstance"}
                      onChange={() => {
                        setEligibilityCircumstance("special_circumstance");
                        setEligibilityCircumstanceOther("");
                      }}
                    >
                      Special circumstance (such as losing employer-provided coverage or disabled or a
                      recent relocation)
                    </RadioOption>
                    <RadioOption
                      name="eligibility-circumstance"
                      value="other"
                      checked={eligibilityCircumstance === "other"}
                      onChange={() => setEligibilityCircumstance("other")}
                    >
                      Other
                    </RadioOption>
                  </div>
                  {eligibilityCircumstance === "other" ? (
                    <div className="pt-1">
                      <Label htmlFor="intake-eligibility-other" className="text-sm font-medium">
                        Describe your situation{" "}
                        <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="intake-eligibility-other"
                        type="text"
                        value={eligibilityCircumstanceOther}
                        onChange={(e) => setEligibilityCircumstanceOther(e.target.value.slice(0, 200))}
                        placeholder="e.g. retiring early, moving back to the U.S."
                        maxLength={200}
                        className="mt-1.5"
                      />
                    </div>
                  ) : null}
                </fieldset>
              ) : null}

              <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-4">
                <h3 className="font-display text-base font-bold">Economics</h3>
                <fieldset className="space-y-2">
                  <FieldLegend required>{INCOME_BAND_FIELD_LABEL}</FieldLegend>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {INCOME_BAND_FIELD_TIP}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {INCOME_BANDS.map((band) => (
                      <label
                        key={band}
                        className={cn(
                          "flex items-start gap-2 cursor-pointer rounded-md border px-2.5 py-2 text-sm leading-snug transition-colors",
                          incomeBand === band
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:bg-muted/40",
                        )}
                      >
                        <input
                          type="radio"
                          name="income-band"
                          value={band}
                          checked={incomeBand === band}
                          onChange={() => setIncomeBand(band)}
                          className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                        />
                        <span>{band}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5" aria-labelledby="intake-step-2-heading">
              <div>
                <h2 id="intake-step-2-heading" className="font-display text-xl font-bold">
                  Step 2 · Conditions (optional)
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Next: Medications — pick conditions first to see common drug suggestions
                </p>
              </div>

              <IntakeConditionsFields
                conditions={conditions}
                otherConditions={otherConditions}
                otherInput={otherInput}
                onOtherInputChange={setOtherInput}
                onToggleCondition={toggleCondition}
                onAddOtherCondition={addOtherCondition}
                onRemoveOtherCondition={removeOtherCondition}
                showComparisonLabel={false}
              />
            </section>
          )}

          {step === 3 && (
            <section className="space-y-5" aria-labelledby="intake-step-3-heading">
              <div>
                <h2 id="intake-step-3-heading" className="font-display text-xl font-bold">
                  Step 3 · Medications (optional)
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Next: Utilization &amp; pharmacy →</p>
              </div>

              <IntakeMedicationsFields
                allConditions={allConditions}
                meds={meds}
                setMeds={setMeds}
                confirmedMedIds={confirmedMedIds}
                setConfirmedMedIds={setConfirmedMedIds}
                focusedMedId={focusedMedId}
                setFocusedMedId={setFocusedMedId}
                medQuery={medQuery}
                setMedQuery={setMedQuery}
                rxnormResults={rxnormResults}
                rxnormLoading={rxnormLoading}
                updateMed={updateMed}
                saveMed={saveMed}
                saveMedAndAddNew={saveMedAndAddNew}
                onSaveAndFinish={handleMedicationSaveAndFinish}
                removeMed={removeMed}
                removeConfirmedMedByName={removeConfirmedMedByName}
                applyCatalogEntry={applyCatalogEntry}
                applyRxNormEntry={applyRxNormEntry}
                continueActionLabel="Continue"
                summaryCard={
                  <Card className="p-2.5 md:p-3 bg-muted/40 border-dashed">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Your benchmark so far
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-0.5 text-xs leading-snug">
                      <div>
                        <span className="text-muted-foreground">Born:</span> {birthYear || "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gender:</span>{" "}
                        {gender
                          ? INTAKE_GENDER_OPTIONS.find((o) => o.value === gender)?.label ?? "—"
                          : "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tobacco:</span>{" "}
                        {tobacco === null ? "—" : tobacco ? "Smoker" : "Non-smoker"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">ZIP3:</span> {zip3 || "—"}
                      </div>
                      <div className="col-span-2 sm:col-span-1 min-w-0 truncate">
                        <span className="text-muted-foreground">County:</span> {county || "—"}
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-muted-foreground">Income:</span> {incomeBand || "—"}
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-muted-foreground">Conditions:</span>{" "}
                        {allConditions.length ? allConditions.join(", ") : "None selected"}
                      </div>
                    </div>
                  </Card>
                }
              />
            </section>
          )}

          {step === 4 && (
            <section className="space-y-5" aria-labelledby="intake-step-4-heading">
              <div>
                <h2 id="intake-step-4-heading" className="font-display text-xl font-bold">
                  Step 4 · Utilization &amp; pharmacy
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Next: Benefit priorities →</p>
              </div>

              <fieldset className="space-y-2">
                <FieldLegend required>
                  How frequently do you visit your primary care doctor or specialists each year?
                </FieldLegend>
                <div className="grid gap-2">
                  <RadioOption
                    name="visit-frequency"
                    value="low"
                    checked={visitFrequency === "low"}
                    onChange={() => setVisitFrequency("low")}
                  >
                    <strong>Low</strong> (1–2 times)
                  </RadioOption>
                  <RadioOption
                    name="visit-frequency"
                    value="medium"
                    checked={visitFrequency === "medium"}
                    onChange={() => setVisitFrequency("medium")}
                  >
                    <strong>Medium</strong> (3–5 times)
                  </RadioOption>
                  <RadioOption
                    name="visit-frequency"
                    value="high"
                    checked={visitFrequency === "high"}
                    onChange={() => setVisitFrequency("high")}
                  >
                    <strong>High</strong> (6+ times)
                  </RadioOption>
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <FieldLegend required>Do you have a preferred pharmacy?</FieldLegend>
                <div className="grid gap-2 sm:grid-cols-2 max-w-xs">
                  <RadioOption
                    name="preferred-pharmacy"
                    value="yes"
                    checked={preferredPharmacy === "yes"}
                    onChange={() => setPreferredPharmacy("yes")}
                  >
                    <strong>Yes</strong>
                  </RadioOption>
                  <RadioOption
                    name="preferred-pharmacy"
                    value="no"
                    checked={preferredPharmacy === "no"}
                    onChange={() => {
                      setPreferredPharmacy("no");
                      setPreferredPharmacyName("");
                    }}
                  >
                    <strong>No</strong>
                  </RadioOption>
                </div>
              </fieldset>

              {preferredPharmacy === "yes" ? (
                <div>
                  <Label htmlFor="intake-pharmacy-name" className="text-sm font-semibold">
                    Pharmacy name
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="intake-pharmacy-name"
                    value={preferredPharmacyName}
                    onChange={(e) => setPreferredPharmacyName(e.target.value)}
                    placeholder="e.g., CVS, Walgreens, local independent pharmacy"
                    maxLength={200}
                    className="mt-2 text-base md:text-sm touch-manipulation"
                    required
                  />
                </div>
              ) : null}
            </section>
          )}

          {step === 5 && (
            <section className="space-y-5" aria-labelledby="intake-step-5-heading">
              <div>
                <h2 id="intake-step-5-heading" className="font-display text-xl font-bold">
                  Step 5 · Benefit priorities
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit when ready — you can connect with a partner afterward or skip.
                </p>
              </div>

              <fieldset className="space-y-3">
                <FieldLegend>
                  Which extra benefits are most important to you? (Select all that apply)
                </FieldLegend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BENEFIT_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className={cn(
                        "flex items-start gap-2.5 cursor-pointer border rounded-md px-3 py-2.5 bg-background hover:bg-muted/40",
                        benefitPriorities.includes(value)
                          ? "border-primary bg-primary/5"
                          : "border-input",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                        checked={benefitPriorities.includes(value)}
                        onChange={(e) => toggleBenefit(value, e.target.checked)}
                      />
                      <span className="text-sm leading-snug">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <IntakeReferralFields
                referralSources={referralSources}
                referralDetailValues={referralDetailValues}
                referralOther={referralOther}
                onReferralSourceChange={handleReferralSourceChange}
                onReferralDetailChange={setReferralDetailValue}
                onReferralOtherChange={setReferralOther}
              />
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={onBack} className="gap-1.5">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <span />
            )}

            {step < STEP_COUNT ? (
              <Button type="button" onClick={onContinue} className="gap-1.5 grad-indigo ml-auto">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onFinishIntake}
                disabled={submitting}
                className="gap-1.5 grad-indigo ml-auto"
              >
                {submitting ? "Building your benchmark…" : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </Card>
  );
}
