// Auto-discovered automated tests (Vitest unit tests + Playwright e2e tests).
//
// Test names are generated at build time into automated-test-manifest.json
// (see scripts/generate-automated-test-manifest.mjs) so we never bundle raw
// *.test.ts sources into the Cloudflare Worker.
import type { TestCase } from "./test-plan";
import type { TestStatus } from "./test-plan";
import manifest from "./automated-test-manifest.json";

const resultsFiles = import.meta.glob("/src/lib/automated-test-results.json", {
  eager: true,
}) as Record<string, { default?: Record<string, TestStatus> }>;

const recordedResults: Record<string, TestStatus> = (() => {
  const first = Object.values(resultsFiles)[0];
  return (first?.default ?? {}) as Record<string, TestStatus>;
})();

export const UNIT_TEST_CASES: TestCase[] = manifest.unit as TestCase[];
export const E2E_TEST_CASES: TestCase[] = manifest.e2e as TestCase[];
export const AUTOMATED_TEST_CASES: TestCase[] = [...UNIT_TEST_CASES, ...E2E_TEST_CASES];

/** Set of all auto-discovered test ids — used by the UI to lock the owner
 * dropdown so users can't reassign Vitest/Playwright tests to humans. */
export const AUTOMATED_TEST_IDS: Set<string> = new Set(AUTOMATED_TEST_CASES.map((t) => t.id));

/** Last-recorded pass/fail status per automated test id, sourced from
 * `src/lib/automated-test-results.json` (produced by `bun run test:record`).
 * Empty when the file is missing or hasn't been generated yet. */
export const AUTOMATED_TEST_RESULTS: Record<string, TestStatus> = recordedResults;
