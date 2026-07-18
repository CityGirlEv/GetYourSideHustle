import type {
  BenchmarkBenefitPriority,
  BenchmarkIntakeInput,
  BenchmarkVisitFrequency,
} from "@/lib/benchmark-intake";
import type { IncomeBand } from "@/lib/income-bands";
import {
  buildRegionalBenchmarksFromZip3,
  currentMedicarePlanYear,
  formatUsd,
} from "@/lib/benchmark-regional-data";
import { countyMatchesZip3 } from "@/lib/zip3-county-lookup";

export { formatUsd };

export const BENEFIT_LABELS: Record<BenchmarkBenefitPriority, string> = {
  dental: "Dental coverage",
  vision: "Vision care",
  hearing: "Hearing aids",
  fitness: "Gym memberships / fitness",
  otc: "Over-the-counter (OTC) allowances",
};

const HIGH_TIER_PATTERNS =
  /insulin|humira|enbrel|eliquis|xarelto|ozempic|mounjaro|trulicity|januvia|keytruda|opdivo|stelara|cosentyx|skyrizi|dupixent|breo|symbicort|trelegy|advair/i;

const SPECIALTY_PATTERNS =
  /injection|infusion|chemo|biologic|specialty/i;

export function buildPrescriptionTierSummary(medications: string[]): string {
  if (medications.length === 0) {
    return "You did not list regular prescriptions. Under Original Medicare, outpatient drugs are generally not covered unless paired with a separate Part D plan or other creditable coverage.";
  }

  const names = medications.map((m) => m.trim()).filter(Boolean);
  const specialtyHits = names.filter(
    (n) => SPECIALTY_PATTERNS.test(n) || HIGH_TIER_PATTERNS.test(n),
  ).length;

  if (specialtyHits >= 2 || (names.length >= 4 && specialtyHits >= 1)) {
    return `Your input lists ${names.length} regular medication${names.length === 1 ? "" : "s"}, including patterns consistent with mid-to-high formulary tiers. Educational takeaway: formulary alignment and tier placement often drive more of your out-of-pocket drug exposure than the Part D premium alone.`;
  }

  if (names.length >= 3 || specialtyHits === 1) {
    return `Your input indicates regular utilization of ${names.length} medication${names.length === 1 ? "" : "s"}, with at least one entry that may map to a higher formulary tier. Optimized formulary pairing is an important structural concept when comparing Part D frameworks.`;
  }

  return `Your input lists ${names.length} maintenance medication${names.length === 1 ? "" : "s"}, generally consistent with lower-to-mid formulary tiers in many regional benchmarks. Even so, tier placement and pharmacy network rules still affect total drug spending.`;
}

export function buildUtilizationContext(visitFrequency: BenchmarkVisitFrequency): string {
  if (visitFrequency === "low") {
    return "You reported low annual provider utilization (about 1–2 visits). From an educational standpoint, network restrictions may be less central to your cost exposure, though emergency and specialist access still matter under HMO-style models.";
  }
  if (visitFrequency === "medium") {
    return "You reported moderate utilization (about 3–5 visits per year). With this level of utilization, network design often matters: HMO models typically require in-network primary care and referrals, while PPO-style models trade higher premiums for broader out-of-network flexibility.";
  }
  return "You reported high utilization (6+ visits per year). Educational note: provider network breadth, referral rules, and prior-authorization structures (common in HMO frameworks) can materially affect predictable access and out-of-pocket exposure compared with more flexible PPO-style designs.";
}

export function buildIncomeBandNote(incomeBand: IncomeBand): string {
  if (incomeBand === "Prefer not to say") {
    return "You preferred not to share an income band. Part B premiums shown use the standard federal rate; IRMAA surcharges and Extra Help (LIS) depend on income and are not estimated here.";
  }
  if (incomeBand === "Under $15k" || incomeBand === "$15k–$35k") {
    return `You selected income band ${incomeBand}. You may want to verify Extra Help (Low Income Subsidy) and Medicaid coordination on Medicare.gov — many beneficiaries in lower bands qualify for premium or cost-sharing assistance.`;
  }
  if (incomeBand === "Over $115k" || incomeBand === "$95k–$115k") {
    return `You selected income band ${incomeBand}. Higher modified adjusted gross income may trigger Income-Related Monthly Adjustment Amount (IRMAA) surcharges above the standard Part B premium shown below.`;
  }
  return `You selected income band ${incomeBand}. Standard Part B premium applies unless IRMAA surcharges apply at higher income levels, or Extra Help applies at lower levels.`;
}

export function buildAncillaryNeedsBreakdown(
  benefitPriorities: BenchmarkBenefitPriority[],
): { selected: string[]; note: string } {
  if (benefitPriorities.length === 0) {
    return {
      selected: [],
      note: "You did not flag extra benefits as priorities. Standard federal Original Medicare (Parts A and B) does not include routine dental, vision, hearing, fitness, or OTC allowances — those are private-market additions available only through separate coverage frameworks.",
    };
  }

  const selected = benefitPriorities.map((b) => BENEFIT_LABELS[b]);
  return {
    selected,
    note: `You identified ${selected.join(", ")} as priorities. These benefits are not part of standard federal Original Medicare. They are offered only through private insurance frameworks (for example, many Medicare Advantage plans or standalone supplemental products) and vary widely by region and contract.`,
  };
}

export function buildEducationalBenchmarkReport(input: BenchmarkIntakeInput) {
  const year = currentMedicarePlanYear();
  const regional = buildRegionalBenchmarksFromZip3(input.zip3, year);
  const selectedCounty = countyMatchesZip3(input.county, input.zip3);

  return {
    zip3: input.zip3,
    year,
    counties: regional.counties,
    selectedCounty,
    catalogRevision: regional.catalogRevision,
    partBBase: regional.partBBase,
    localBenchmarks: regional.localBenchmarks,
    prescriptionTierSummary: buildPrescriptionTierSummary(input.medications),
    utilizationContext: buildUtilizationContext(input.visitFrequency),
    ancillaryNeeds: buildAncillaryNeedsBreakdown(input.benefitPriorities),
    preferredPharmacyName:
      input.preferredPharmacy === "yes" ? input.preferredPharmacyName.trim() || null : null,
    hasPreferredPharmacy: input.preferredPharmacy === "yes",
    incomeBand: input.incomeBand,
    incomeBandNote: buildIncomeBandNote(input.incomeBand),
    medicareEnrolled: input.medicareEnrolled,
    eligibilityCircumstance: input.eligibilityCircumstance,
  };
}

export type EducationalBenchmarkReport = ReturnType<typeof buildEducationalBenchmarkReport>;
