import type { BenchmarkIntakeInput } from "@/lib/benchmark-intake";
import { buildBenchmarkProfileAnswerRows } from "@/lib/benchmark-profile-answers";
import {
  getBenchmarkWorkbookContent,
  totalChecklistItemCount,
} from "@/lib/benchmark-workbook-content";
import type { EducationalBenchmarkReport } from "@/lib/educational-benchmark-report";

/** My Input tab — profile answer rows shown in the report. */
export function benchmarkInputTabCount(intake: BenchmarkIntakeInput): number {
  return buildBenchmarkProfileAnswerRows(intake).length;
}

/** Blueprint & Benchmarks tab — Part B block plus MA, Part D, and optional Medigap categories. */
export function benchmarkPboLocalTabCount(report: EducationalBenchmarkReport): number {
  let count = 3;
  if (report.localBenchmarks.medigap) count += 1;
  return count;
}

/** Turning 65 Workbook tab — checklist items plus writing sections. */
export function benchmarkWorkbookTabCount(): number {
  const workbook = getBenchmarkWorkbookContent();
  return totalChecklistItemCount(workbook) + workbook.writingSections.length;
}
