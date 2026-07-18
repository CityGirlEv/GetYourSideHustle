import type { FinalizedBenchmark, BenchmarkIntakeInput } from "@/lib/benchmark-intake";
import { rememberBenchmarkEstimate } from "@/lib/benchmark-estimate-history";
import {
  BENCHMARK_ESTIMATE_STORE_PREFIX,
  normalizeBenchmarkEstimateId,
} from "@/lib/benchmark-id";

const SESSION_PREFIX = "benchmark-estimate:";
const LOCAL_PREFIX = BENCHMARK_ESTIMATE_STORE_PREFIX;

function sessionKey(id: string): string {
  return `${SESSION_PREFIX}${normalizeBenchmarkEstimateId(id)}`;
}

function localKey(id: string): string {
  return `${LOCAL_PREFIX}${normalizeBenchmarkEstimateId(id)}`;
}

function migrateBenchmarkIntake(intake: Partial<BenchmarkIntakeInput>): BenchmarkIntakeInput {
  return {
    birthYear: intake.birthYear ?? 1960,
    gender: intake.gender ?? "female",
    tobacco: intake.tobacco ?? false,
    zip3: intake.zip3 ?? "000",
    county: intake.county ?? "",
    medicareEnrolled: intake.medicareEnrolled ?? "none",
    eligibilityCircumstance: intake.eligibilityCircumstance ?? null,
    eligibilityCircumstanceOther: intake.eligibilityCircumstanceOther ?? "",
    incomeBand: intake.incomeBand ?? "$55k–$75k",
    conditions: intake.conditions ?? [],
    medications: intake.medications ?? [],
    medicationDetails: intake.medicationDetails ?? [],
    visitFrequency: intake.visitFrequency ?? "medium",
    preferredPharmacy: intake.preferredPharmacy ?? "no",
    preferredPharmacyName: intake.preferredPharmacyName ?? "",
    benefitPriorities: intake.benefitPriorities ?? [],
    referral: intake.referral,
  };
}

function parseStoredBenchmark(raw: string, expectedId: string): FinalizedBenchmark | null {
  try {
    const parsed = JSON.parse(raw) as Partial<FinalizedBenchmark>;
    if (!parsed?.report) return null;
    const estimateId = normalizeBenchmarkEstimateId(parsed.estimateId ?? expectedId);
    if (estimateId !== normalizeBenchmarkEstimateId(expectedId)) return null;
    const intake = parsed.intake ? migrateBenchmarkIntake(parsed.intake) : null;
    if (!intake) return null;
    return {
      estimateId,
      intake,
      intakeSnapshot: parsed.intakeSnapshot ?? {},
      report: parsed.report,
    };
  } catch {
    return null;
  }
}

export function saveBenchmarkEstimate(benchmark: FinalizedBenchmark): void {
  const estimateId = normalizeBenchmarkEstimateId(benchmark.estimateId);
  const payload = JSON.stringify({ ...benchmark, estimateId });
  try {
    sessionStorage.setItem(sessionKey(estimateId), payload);
  } catch {
    /* ignore quota */
  }
  try {
    localStorage.setItem(localKey(estimateId), payload);
  } catch {
    /* ignore quota */
  }
  rememberBenchmarkEstimate({ id: estimateId, zip3: benchmark.intake.zip3 });
}

export function loadBenchmarkEstimate(id: string): FinalizedBenchmark | null {
  const normalized = normalizeBenchmarkEstimateId(id);
  if (!normalized) return null;

  for (const storage of [sessionStorage, localStorage]) {
    const key =
      storage === sessionStorage ? sessionKey(normalized) : localKey(normalized);
    const direct = parseStoredBenchmark(storage.getItem(key) ?? "", normalized);
    if (direct) return direct;
  }

  // Legacy keys (mixed case) or orphaned entries — scan benchmark storage keys.
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(LOCAL_PREFIX)) continue;
    const loaded = parseStoredBenchmark(localStorage.getItem(key) ?? "", normalized);
    if (loaded) return loaded;
  }
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key?.startsWith(SESSION_PREFIX)) continue;
    const loaded = parseStoredBenchmark(sessionStorage.getItem(key) ?? "", normalized);
    if (loaded) return loaded;
  }

  return null;
}

/** Whether a saved benchmark payload exists on this device. */
export function hasBenchmarkEstimate(id: string): boolean {
  return loadBenchmarkEstimate(id) != null;
}
