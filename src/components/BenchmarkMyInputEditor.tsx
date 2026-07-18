import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Zip3CountySelect } from "@/components/Zip3CountySelect";
import { IntakeConditionsFields } from "@/components/intake/IntakeConditionsFields";
import { IntakeMedicationsFields } from "@/components/intake/IntakeMedicationsFields";
import { INCOME_BANDS, INCOME_BAND_FIELD_LABEL, INCOME_BAND_FIELD_TIP, type IncomeBand } from "@/lib/income-bands";
import {
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
import { validateMedicationsForSubmit } from "@/lib/intake-medications-validation";
import { useIntakeConditions } from "@/hooks/use-intake-conditions";
import { useIntakeMedications } from "@/hooks/use-intake-medications";
import { useState } from "react";

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

type Props = {
  intake: BenchmarkIntakeInput;
  onIntakeChange: (intake: BenchmarkIntakeInput) => void;
};

export function BenchmarkMyInputEditor({ intake, onIntakeChange }: Props) {
  const [birthYear, setBirthYear] = useState(intake.birthYear);
  const [gender, setGender] = useState<BenchmarkGender>(intake.gender);
  const [tobacco, setTobacco] = useState(intake.tobacco);
  const [zip3, setZip3] = useState(intake.zip3);
  const [county, setCounty] = useState(intake.county);
  const [medicareEnrolled, setMedicareEnrolled] = useState<BenchmarkMedicareEnrolled>(
    intake.medicareEnrolled,
  );
  const [eligibilityCircumstance, setEligibilityCircumstance] = useState<
    BenchmarkEligibilityCircumstance | ""
  >(intake.eligibilityCircumstance ?? "");
  const [eligibilityCircumstanceOther, setEligibilityCircumstanceOther] = useState(
    intake.eligibilityCircumstanceOther,
  );
  const [incomeBand, setIncomeBand] = useState<IncomeBand>(intake.incomeBand);
  const [visitFrequency, setVisitFrequency] = useState<BenchmarkVisitFrequency>(intake.visitFrequency);
  const [preferredPharmacy, setPreferredPharmacy] = useState<BenchmarkPreferredPharmacy>(
    intake.preferredPharmacy,
  );
  const [preferredPharmacyName, setPreferredPharmacyName] = useState(intake.preferredPharmacyName);
  const [benefitPriorities, setBenefitPriorities] = useState<BenchmarkBenefitPriority[]>(
    intake.benefitPriorities,
  );

  const intakeConditions = useIntakeConditions(intake.conditions);
  const { allConditions } = intakeConditions;

  const intakeMeds = useIntakeMedications(intake.medicationDetails);
  const { meds, confirmedMedIds } = intakeMeds;

  const countyFieldRef = useRef<HTMLDivElement>(null);
  const countyOptions = useMemo(
    () => (/^\d{3}$/.test(zip3) ? countiesForZip3(zip3) : []),
    [zip3],
  );
  const showEligibilityQuestion = needsBenchmarkEligibilityQuestion(medicareEnrolled);

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
  }, [zip3, county]);

  useEffect(() => {
    if (countyOptions.length !== 1) return;
    const only = countyOptions[0]!.county;
    if (county !== only) setCounty(only);
  }, [zip3, countyOptions, county]);

  const toggleBenefit = (value: BenchmarkBenefitPriority, checked: boolean) => {
    setBenefitPriorities((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  };

  useEffect(() => {
    const eligibilityRequired = needsBenchmarkEligibilityQuestion(medicareEnrolled);
    const medValidation = validateMedicationsForSubmit(meds, confirmedMedIds);
    const medicationDetails = medValidation.ok
      ? medValidation.submitted
      : meds.filter((m) => confirmedMedIds.includes(m.id));
    const medicationNames = medicationDetails
      .map((m) => m.medication_name.trim())
      .filter(Boolean);

    onIntakeChange({
      birthYear,
      gender,
      tobacco,
      zip3,
      county: county.trim(),
      medicareEnrolled,
      eligibilityCircumstance: eligibilityRequired ? eligibilityCircumstance || null : null,
      eligibilityCircumstanceOther: eligibilityCircumstanceOther.trim(),
      incomeBand,
      conditions: allConditions,
      medications: medicationNames,
      medicationDetails,
      visitFrequency,
      preferredPharmacy,
      preferredPharmacyName,
      benefitPriorities,
      referral: intake.referral,
    });
  }, [
    birthYear,
    gender,
    tobacco,
    zip3,
    county,
    medicareEnrolled,
    eligibilityCircumstance,
    eligibilityCircumstanceOther,
    incomeBand,
    allConditions,
    meds,
    confirmedMedIds,
    visitFrequency,
    preferredPharmacy,
    preferredPharmacyName,
    benefitPriorities,
    intake.referral,
    onIntakeChange,
  ]);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:p-4">
        <div>
          <Label htmlFor="my-input-birth-year" className="text-sm font-semibold">
            Year of birth
            <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="my-input-birth-year"
            type="number"
            inputMode="numeric"
            min={MIN_BIRTH_YEAR}
            max={MAX_BIRTH_YEAR}
            value={birthYear}
            onChange={(e) => {
              const raw = e.target.value;
              if (!raw) return;
              const n = Number(raw);
              if (!Number.isNaN(n)) setBirthYear(n);
            }}
            list="my-input-birth-year-options"
            className="mt-1.5 max-w-[10rem] text-base md:text-sm touch-manipulation"
          />
          <datalist id="my-input-birth-year-options">
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
                  name="my-input-gender"
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
                name="my-input-tobacco"
                value="smoker"
                checked={tobacco === true}
                onChange={() => setTobacco(true)}
              >
                Smoker
              </CompactChoice>
              <CompactChoice
                name="my-input-tobacco"
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

      <div
        ref={countyFieldRef}
        className="grid gap-3 sm:grid-cols-[minmax(0,8.5rem)_minmax(0,18rem)] sm:items-start sm:gap-4"
      >
        <div className="min-w-0">
          <Label htmlFor="my-input-zip3" className="text-sm font-semibold whitespace-nowrap">
            First 3 digits of ZIP<span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="my-input-zip3"
            type="tel"
            inputMode="numeric"
            maxLength={3}
            value={zip3}
            onChange={(e) => setZip3(normalizeZip3Input(e.target.value))}
            className="mt-1.5 w-full text-base md:text-sm touch-manipulation"
          />
        </div>
        <div className="min-w-0 sm:pl-2">
          <Label htmlFor="my-input-county" className="text-sm font-semibold whitespace-nowrap">
            County or parish<span className="text-destructive ml-0.5">*</span>
          </Label>
          <Zip3CountySelect
            id="my-input-county"
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
          {(
            [
              ["part_a", "Part A"],
              ["part_b", "Part B"],
              ["both", "Both"],
              ["unsure", "Unsure"],
              ["none", "None"],
            ] as const
          ).map(([value, label]) => (
            <RadioOption
              key={value}
              name="my-input-medicare-enrolled"
              value={value}
              checked={medicareEnrolled === value}
              onChange={() => setMedicareEnrolledChoice(value)}
            >
              <strong>{label}</strong>
            </RadioOption>
          ))}
        </div>
      </fieldset>

      {showEligibilityQuestion ? (
        <fieldset className="space-y-2">
          <FieldLegend required>
            Are you turning 65 soon, or do you qualify due to a special circumstance?
          </FieldLegend>
          <div className="grid gap-2">
            <RadioOption
              name="my-input-eligibility"
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
              name="my-input-eligibility"
              value="special_circumstance"
              checked={eligibilityCircumstance === "special_circumstance"}
              onChange={() => {
                setEligibilityCircumstance("special_circumstance");
                setEligibilityCircumstanceOther("");
              }}
            >
              Special circumstance (such as losing employer-provided coverage or a recent relocation)
            </RadioOption>
            <RadioOption
              name="my-input-eligibility"
              value="other"
              checked={eligibilityCircumstance === "other"}
              onChange={() => setEligibilityCircumstance("other")}
            >
              Other
            </RadioOption>
          </div>
          {eligibilityCircumstance === "other" ? (
            <Input
              type="text"
              value={eligibilityCircumstanceOther}
              onChange={(e) => setEligibilityCircumstanceOther(e.target.value.slice(0, 200))}
              placeholder="Describe your situation (optional)"
              maxLength={200}
              className="mt-1"
            />
          ) : null}
        </fieldset>
      ) : null}

      <fieldset className="space-y-2">
        <FieldLegend required>{INCOME_BAND_FIELD_LABEL}</FieldLegend>
        <p className="text-xs text-muted-foreground leading-relaxed">{INCOME_BAND_FIELD_TIP}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
          {INCOME_BANDS.map((band) => (
            <label
              key={band}
              className={cn(
                "flex items-start gap-2 cursor-pointer rounded-md border px-2.5 py-2 text-sm leading-snug transition-colors",
                incomeBand === band ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/40",
              )}
            >
              <input
                type="radio"
                name="my-input-income-band"
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

      <IntakeConditionsFields
        conditions={intakeConditions.conditions}
        otherConditions={intakeConditions.otherConditions}
        otherInput={intakeConditions.otherInput}
        onOtherInputChange={intakeConditions.setOtherInput}
        onToggleCondition={intakeConditions.toggleCondition}
        onAddOtherCondition={intakeConditions.addOtherCondition}
        onRemoveOtherCondition={intakeConditions.removeOtherCondition}
        showComparisonLabel={false}
      />

      <IntakeMedicationsFields
        allConditions={allConditions}
        meds={intakeMeds.meds}
        setMeds={intakeMeds.setMeds}
        confirmedMedIds={intakeMeds.confirmedMedIds}
        setConfirmedMedIds={intakeMeds.setConfirmedMedIds}
        focusedMedId={intakeMeds.focusedMedId}
        setFocusedMedId={intakeMeds.setFocusedMedId}
        medQuery={intakeMeds.medQuery}
        setMedQuery={intakeMeds.setMedQuery}
        rxnormResults={intakeMeds.rxnormResults}
        rxnormLoading={intakeMeds.rxnormLoading}
        updateMed={intakeMeds.updateMed}
        saveMed={intakeMeds.saveMed}
        saveMedAndAddNew={intakeMeds.saveMedAndAddNew}
        removeMed={intakeMeds.removeMed}
        removeConfirmedMedByName={intakeMeds.removeConfirmedMedByName}
        applyCatalogEntry={intakeMeds.applyCatalogEntry}
        applyRxNormEntry={intakeMeds.applyRxNormEntry}
        continueActionLabel="Continue"
      />

      <fieldset className="space-y-2">
        <FieldLegend required>Doctor visit frequency</FieldLegend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["low", "Low (1–2 times)"],
              ["medium", "Medium (3–5 times)"],
              ["high", "High (6+ times)"],
            ] as const
          ).map(([value, label]) => (
            <RadioOption
              key={value}
              name="my-input-visit-frequency"
              value={value}
              checked={visitFrequency === value}
              onChange={() => setVisitFrequency(value)}
            >
              {label}
            </RadioOption>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <FieldLegend required>Preferred pharmacy</FieldLegend>
        <div className="grid gap-2 sm:grid-cols-2 max-w-xs">
          <RadioOption
            name="my-input-preferred-pharmacy"
            value="yes"
            checked={preferredPharmacy === "yes"}
            onChange={() => setPreferredPharmacy("yes")}
          >
            <strong>Yes</strong>
          </RadioOption>
          <RadioOption
            name="my-input-preferred-pharmacy"
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
          <Label htmlFor="my-input-pharmacy-name" className="text-sm font-semibold">
            Pharmacy name
            <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="my-input-pharmacy-name"
            value={preferredPharmacyName}
            onChange={(e) => setPreferredPharmacyName(e.target.value)}
            placeholder="e.g., CVS, Walgreens"
            maxLength={200}
            className="mt-2 text-base md:text-sm touch-manipulation"
          />
        </div>
      ) : null}

      <fieldset className="space-y-3">
        <FieldLegend>Extra benefit priorities (optional)</FieldLegend>
        <div className="grid gap-2 sm:grid-cols-2">
          {BENEFIT_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className={cn(
                "flex items-start gap-2.5 cursor-pointer border rounded-md px-3 py-2.5 bg-background hover:bg-muted/40",
                benefitPriorities.includes(value) ? "border-primary bg-primary/5" : "border-input",
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
    </div>
  );
}
