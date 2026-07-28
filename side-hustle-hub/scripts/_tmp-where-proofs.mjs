import { d1Select, d1ExecFile } from "./_d1-remote.mjs";
import { TEST_CASES, withDefaultSuite } from "../src/lib/gysh-test-plan.ts";
import { PROOFREAD_CASES } from "../src/lib/gysh-proofread-cases.ts";
import {
  AUTOMATED_VITEST_CASES,
  AUTOMATED_PLAYWRIGHT_CASES,
  isWizardMatrixCaseId,
} from "../src/lib/gysh-automated-tests.ts";

const dryRun = process.argv.includes("--dry-run");
const cleanup = process.argv.includes("--cleanup-orphans");

const catalog = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
  ...PROOFREAD_CASES,
].filter((t) => !isWizardMatrixCaseId(t.id));
const catalogIds = new Set(catalog.map((t) => t.id));

const rolled = d1Select(
  "SELECT case_id FROM test_case_status WHERE status = 'rolled_over' AND sprint = 2",
)?.[0]?.results ?? [];

const orphanRolled = rolled.map((r) => String(r.case_id)).filter((id) => !catalogIds.has(id));
const visibleRolled = rolled.map((r) => String(r.case_id)).filter((id) => catalogIds.has(id));

console.log({
  rolledTotal: rolled.length,
  visibleOnBoard: visibleRolled.length,
  orphanGhostRows: orphanRolled.length,
});

const currentProof = d1Select(
  "SELECT sprint, status, COUNT(1) AS n FROM test_case_status WHERE case_id GLOB 'PROOF-[0-9]*' GROUP BY sprint, status ORDER BY sprint, n DESC",
)?.[0]?.results ?? [];
console.log("currentNumberedProofBySprint", currentProof);

if (cleanup && orphanRolled.length) {
  console.log(dryRun ? "=== DRY CLEANUP ===" : "=== DELETE ORPHAN ROLLED ROWS ===");
  // Delete only orphan proof-style IDs that are rolled_over on sprint 2
  const sql = `DELETE FROM test_case_status WHERE status = 'rolled_over' AND sprint = 2 AND (case_id LIKE 'PROOF-KG%' OR case_id LIKE 'PROOF-LG%' OR case_id LIKE 'PROOF-SG%' OR case_id LIKE 'PROOF-MG%' OR case_id LIKE 'PROOF-PG%');`;
  if (dryRun) {
    console.log(sql);
    console.log("would delete ~", orphanRolled.length);
  } else {
    d1ExecFile(sql);
    const left = d1Select(
      "SELECT COUNT(1) AS n FROM test_case_status WHERE status = 'rolled_over' AND sprint = 2",
    )?.[0]?.results?.[0]?.n;
    console.log("rolled_over left on S2", left);
  }
}
