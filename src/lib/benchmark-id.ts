/** Benchmark estimate IDs issued by the Part B Optimizer Benchmark Tool. */
export const BENCHMARK_ESTIMATE_ID_PREFIX = "BM-";

/** localStorage prefix for persisted benchmark report payloads. */
export const BENCHMARK_ESTIMATE_STORE_PREFIX = "benchmark-estimate:store:";

/** Normalize BM- IDs for consistent local storage keys (IDs are issued uppercase). */
export function normalizeBenchmarkEstimateId(id: string | undefined | null): string {
  return (id ?? "").trim().toUpperCase();
}

export function isBenchmarkEstimateId(id: string): boolean {
  return normalizeBenchmarkEstimateId(id).startsWith(BENCHMARK_ESTIMATE_ID_PREFIX);
}

export function benchmarkEstimateReportPath(code: string): string {
  return `/scenario/estimate/${encodeURIComponent(code.trim())}`;
}

export function benchmarkEstimateCreatedPath(code: string): string {
  return `/scenario/estimate-created/${encodeURIComponent(code.trim())}`;
}
