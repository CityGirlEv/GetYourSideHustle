/**
 * Move incomplete Sprint 1 tests → Sprint 2 and mark status rolled_over.
 * Leaves Pass / Conditional Pass on Sprint 1.
 *
 *   node --use-system-ca scripts/roll-sprint1-incomplete-to-sprint2.mjs --dry-run
 *   node --use-system-ca scripts/roll-sprint1-incomplete-to-sprint2.mjs
 */
import { d1ExecFile, d1Select, sqlEscape } from "./_d1-remote.mjs";

const FROM_SPRINT = 1;
const TO_SPRINT = 2;
/** Sprint 2 ends Mon 8/3/26 */
const TO_DUE = "08/03/26";
const dryRun = process.argv.includes("--dry-run");

const DONE = new Set(["pass", "conditional_approval"]);

async function main() {
  const raw = d1Select(
    `SELECT case_id, status, sprint, due_date, assignee FROM test_case_status WHERE CAST(sprint AS INTEGER) = ${FROM_SPRINT} ORDER BY case_id`,
  );
  const rows = Array.isArray(raw?.[0]?.results) ? raw[0].results : raw?.results ?? raw;
  if (!Array.isArray(rows)) {
    throw new Error(`Unexpected D1 shape: ${JSON.stringify(raw).slice(0, 400)}`);
  }

  const toMove = rows.filter((r) => !DONE.has(String(r.status ?? "not_run")));
  console.log(dryRun ? "=== DRY RUN ===" : "=== LIVE ROLL ===");
  console.log(`Sprint ${FROM_SPRINT} rows: ${rows.length}`);
  console.log(`Pass/cond kept on S${FROM_SPRINT}: ${rows.length - toMove.length}`);
  console.log(`Moving to S${TO_SPRINT} as rolled_over: ${toMove.length}`);

  const byStatus = {};
  for (const r of toMove) {
    const st = String(r.status ?? "not_run");
    byStatus[st] = (byStatus[st] || 0) + 1;
  }
  console.log("Prior statuses:", byStatus);

  if (dryRun || toMove.length === 0) {
    console.log(dryRun ? "Dry run only — no writes." : "Nothing to move.");
    return;
  }

  const now = new Date().toISOString();
  const chunkSize = 40;
  for (let i = 0; i < toMove.length; i += chunkSize) {
    const chunk = toMove.slice(i, i + chunkSize);
    const ids = chunk.map((r) => `'${sqlEscape(r.case_id)}'`).join(",");
    const sql = `UPDATE test_case_status SET status = 'rolled_over', sprint = ${TO_SPRINT}, due_date = '${TO_DUE}', updated_at = '${sqlEscape(now)}', updated_by = 'system' WHERE case_id IN (${ids}) AND CAST(sprint AS INTEGER) = ${FROM_SPRINT} AND status NOT IN ('pass', 'conditional_approval');`;
    d1ExecFile(sql);
    console.log(`Updated ${Math.min(i + chunk.length, toMove.length)} / ${toMove.length}`);
  }

  const check = d1Select(
    `SELECT status, COUNT(*) AS n FROM test_case_status WHERE CAST(sprint AS INTEGER) = ${TO_SPRINT} GROUP BY status ORDER BY n DESC`,
  );
  const checkRows = Array.isArray(check?.[0]?.results)
    ? check[0].results
    : check?.results ?? check;
  console.log(`Sprint ${TO_SPRINT} status counts:`, checkRows);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
