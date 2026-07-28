/**
 * Delete ghost rolled_over rows from renamed proofread IDs (PROOF-KG/LG/…).
 * Current catalog uses PROOF-NNN-TINA / PROOF-NNN-LYRIQ.
 */
import { d1Select, d1ExecFile } from "./_d1-remote.mjs";

const dryRun = process.argv.includes("--dry-run");

const rolled =
  d1Select(
    "SELECT case_id FROM test_case_status WHERE status = 'rolled_over' AND sprint = 2",
  )?.[0]?.results ?? [];

const ids = rolled.map((r) => String(r.case_id));
/** Current board proof IDs look like PROOF-001-TINA */
const currentProof = ids.filter((id) => /^PROOF-\d{3}-/.test(id));
const orphanProof = ids.filter((id) => id.startsWith("PROOF-") && !/^PROOF-\d{3}-/.test(id));
const other = ids.filter((id) => !id.startsWith("PROOF-"));

console.log({
  rolledTotal: ids.length,
  currentNumberedProof: currentProof.length,
  orphanLegacyProof: orphanProof.length,
  otherRolled: other.length,
  orphanSample: orphanProof.slice(0, 10),
  otherSample: other.slice(0, 10),
});

if (!orphanProof.length) {
  console.log("No orphan proof rows to delete.");
  process.exit(0);
}

const sql = `
DELETE FROM test_case_status
WHERE status = 'rolled_over'
  AND sprint = 2
  AND case_id LIKE 'PROOF-%'
  AND case_id NOT GLOB 'PROOF-[0-9][0-9][0-9]-*';
`;

if (dryRun) {
  console.log("=== DRY RUN ===");
  console.log(sql.trim());
  console.log("would delete", orphanProof.length);
  process.exit(0);
}

console.log("=== DELETE ORPHAN ROLLED ROWS ===");
d1ExecFile(sql);

const left =
  d1Select(
    "SELECT COUNT(1) AS n FROM test_case_status WHERE status = 'rolled_over' AND sprint = 2",
  )?.[0]?.results?.[0]?.n;
const leftOrphans =
  d1Select(
    "SELECT COUNT(1) AS n FROM test_case_status WHERE status = 'rolled_over' AND sprint = 2 AND case_id LIKE 'PROOF-%' AND case_id NOT GLOB 'PROOF-[0-9][0-9][0-9]-*'",
  )?.[0]?.results?.[0]?.n;

console.log({ rolled_over_left_on_S2: left, orphan_proof_left: leftOrphans });
