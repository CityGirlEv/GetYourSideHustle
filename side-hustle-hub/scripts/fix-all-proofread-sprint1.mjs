/**
 * Ensure EVERY test_case_status PROOF-* row is Sprint 1 with spread due dates.
 * Paired *-TINA / *-LYRIQ get assignee from id; legacy unpaired rows keep assignee
 * unless id/title match fails — then leave assignee as-is and only fix sprint/due.
 *
 *   node --use-system-ca scripts/fix-all-proofread-sprint1.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

const DUE_DATES = [
  "07/21/26",
  "07/22/26",
  "07/23/26",
  "07/24/26",
  "07/25/26",
  "07/26/26",
  "07/27/26",
];

function d1Json(sql) {
  const args = [
    "--use-system-ca",
    wrangler,
    "d1",
    "execute",
    "gysh-db",
    "--remote",
    "--json",
    "--command",
    sql,
  ];
  const r = spawnSync("node", args, { cwd: root, encoding: "utf8", shell: false });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`D1 failed: ${sql.slice(0, 120)}`);
  }
  const parsed = JSON.parse(r.stdout);
  return parsed[0]?.results ?? [];
}

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function assigneeFromId(caseId) {
  if (/lyriq/i.test(caseId)) return "lyriq";
  if (/tina/i.test(caseId)) return "tina";
  return null;
}

const rows = d1Json(
  `SELECT case_id, assignee, sprint, due_date FROM test_case_status WHERE case_id LIKE 'PROOF-%' ORDER BY case_id`,
);
console.log(`Loaded ${rows.length} PROOF-* rows from remote D1`);

const now = new Date().toISOString();
const statements = [];
let tina = 0;
let lyriq = 0;
let other = 0;

rows.forEach((row, i) => {
  const fromId = assigneeFromId(row.case_id);
  const assignee = fromId || String(row.assignee || "").trim() || "tina";
  if (assignee === "tina") tina += 1;
  else if (assignee === "lyriq") lyriq += 1;
  else other += 1;
  const due = DUE_DATES[i % DUE_DATES.length];
  statements.push(
    `UPDATE test_case_status SET
       assignee = '${esc(assignee)}',
       sprint = 1,
       due_date = '${due}',
       updated_at = '${now}',
       updated_by = 'fix-all-proofread-sprint1'
     WHERE case_id = '${esc(row.case_id)}'`,
  );
});

const CHUNK = 40;
for (let i = 0; i < statements.length; i += CHUNK) {
  const batch = statements.slice(i, i + CHUNK).join(";\n") + ";";
  const tmp = path.join(os.tmpdir(), `gysh-proof-fix-${Date.now()}-${i}.sql`);
  fs.writeFileSync(tmp, batch, "utf8");
  const args = [
    "--use-system-ca",
    wrangler,
    "d1",
    "execute",
    "gysh-db",
    "--remote",
    "--file",
    tmp,
  ];
  const r = spawnSync("node", args, { cwd: root, encoding: "utf8", shell: false });
  fs.unlinkSync(tmp);
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`Batch failed at ${i}`);
  }
  console.log(`Updated batch ${i / CHUNK + 1}`);
}

const verify = d1Json(
  `SELECT
     COUNT(*) AS total,
     SUM(CASE WHEN sprint = 1 THEN 1 ELSE 0 END) AS sprint1,
     SUM(CASE WHEN assignee = 'tina' THEN 1 ELSE 0 END) AS tina_n,
     SUM(CASE WHEN assignee = 'lyriq' THEN 1 ELSE 0 END) AS lyriq_n,
     SUM(CASE WHEN due_date = '07/21/26' THEN 1 ELSE 0 END) AS d21,
     SUM(CASE WHEN due_date = '07/22/26' THEN 1 ELSE 0 END) AS d22,
     SUM(CASE WHEN due_date = '07/23/26' THEN 1 ELSE 0 END) AS d23,
     SUM(CASE WHEN due_date = '07/24/26' THEN 1 ELSE 0 END) AS d24,
     SUM(CASE WHEN due_date = '07/25/26' THEN 1 ELSE 0 END) AS d25,
     SUM(CASE WHEN due_date = '07/26/26' THEN 1 ELSE 0 END) AS d26,
     SUM(CASE WHEN due_date = '07/27/26' THEN 1 ELSE 0 END) AS d27
   FROM test_case_status WHERE case_id LIKE 'PROOF-%'`,
);

console.log(
  JSON.stringify(
    {
      updated: rows.length,
      assignedTina: tina,
      assignedLyriq: lyriq,
      assignedOther: other,
      verify: verify[0],
    },
    null,
    2,
  ),
);
