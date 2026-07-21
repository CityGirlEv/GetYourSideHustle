/**
 * Move all PROOF-* proofread cases to Sprint 1 with Tina/Lyriq assignees
 * and due dates spread Tue Jul 21 – Mon Jul 27, 2026 (MM/DD/YY).
 *
 *   node --use-system-ca scripts/assign-proofread-sprint1.mjs
 *   node --use-system-ca scripts/assign-proofread-sprint1.mjs --local
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
const isLocal = process.argv.includes("--local");

/** Sprint 1 week: Tue Jul 21 – Mon Jul 27, 2026 */
const DUE_DATES = [
  "07/21/26", // Tue
  "07/22/26", // Wed
  "07/23/26", // Thu
  "07/24/26", // Fri
  "07/25/26", // Sat
  "07/26/26", // Sun
  "07/27/26", // Mon
];

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function d1(sql) {
  const args = [
    "--use-system-ca",
    wrangler,
    "d1",
    "execute",
    "gysh-db",
    isLocal ? "--local" : "--remote",
    "--json",
  ];
  if (isLocal) args.push("--persist-to", ".wrangler/state");
  args.push("--command", sql);
  const r = spawnSync("node", args, { cwd: root, encoding: "utf8", shell: false });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`D1 execute failed: ${sql.slice(0, 160)}`);
  }
  return r.stdout;
}

function loadCatalog() {
  const listScript = path.join(root, "scripts/_list-proofread.mts");
  const r = spawnSync("npx", ["vite-node", listScript], {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error("Failed to list proofread catalog via vite-node");
  }
  const out = (r.stdout || "").trim();
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error("Could not parse proofread catalog JSON");
  return JSON.parse(out.slice(start, end + 1));
}

function assigneeFor(row) {
  const hay = `${row.id} ${row.title}`;
  if (/lyriq/i.test(hay)) return "lyriq";
  if (/tina/i.test(hay)) return "tina";
  const catalog = String(row.catalogAssignee || "").toLowerCase();
  if (catalog === "lyriq" || catalog === "tina") return catalog;
  return "";
}

const catalog = loadCatalog();
console.log(`Catalog proofread cases: ${catalog.length}`);

const now = new Date().toISOString();
const today = (() => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
})();

let tina = 0;
let lyriq = 0;
let skipped = 0;
const statements = [];

// Stable sort so due-date spread is deterministic across runs
const sorted = [...catalog].sort((a, b) => a.id.localeCompare(b.id));

sorted.forEach((row, i) => {
  const assignee = assigneeFor(row);
  if (!assignee) {
    skipped += 1;
    console.warn(`No Tina/Lyriq match for ${row.id} — skipped assignee`);
    return;
  }
  if (assignee === "tina") tina += 1;
  else lyriq += 1;

  const due = DUE_DATES[i % DUE_DATES.length];
  const caseId = esc(row.id);
  statements.push(
    `INSERT INTO test_case_status
      (case_id, status, note, assignee, sprint, due_date, assigned_by, date_assigned, updated_at, updated_by)
     VALUES ('${caseId}', 'not_run', '', '${assignee}', 1, '${due}', 'System', '${today}', '${now}', 'assign-proofread-sprint1')
     ON CONFLICT(case_id) DO UPDATE SET
       assignee = excluded.assignee,
       sprint = 1,
       due_date = excluded.due_date,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
  );
});

const CHUNK = 25;
for (let i = 0; i < statements.length; i += CHUNK) {
  const batch = statements.slice(i, i + CHUNK).join(";\n") + ";";
  const tmp = path.join(os.tmpdir(), `gysh-proofread-${Date.now()}-${i}.sql`);
  fs.writeFileSync(tmp, batch, "utf8");
  const args = [
    "--use-system-ca",
    wrangler,
    "d1",
    "execute",
    "gysh-db",
    isLocal ? "--local" : "--remote",
    "--file",
    tmp,
  ];
  if (isLocal) args.push("--persist-to", ".wrangler/state");
  const r = spawnSync("node", args, { cwd: root, encoding: "utf8", shell: false });
  fs.unlinkSync(tmp);
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`D1 batch failed at offset ${i}`);
  }
  console.log(`Wrote batch ${i / CHUNK + 1} (${Math.min(CHUNK, statements.length - i)} rows)`);
}

const verify = d1(
  `SELECT
     SUM(CASE WHEN assignee = 'tina' THEN 1 ELSE 0 END) AS tina_n,
     SUM(CASE WHEN assignee = 'lyriq' THEN 1 ELSE 0 END) AS lyriq_n,
     COUNT(*) AS total,
     SUM(CASE WHEN sprint = 1 THEN 1 ELSE 0 END) AS sprint1_n
   FROM test_case_status
   WHERE case_id LIKE 'PROOF-%'`,
);
console.log("D1 verify:", verify);
console.log(
  JSON.stringify(
    {
      movedToSprint1: statements.length,
      assignedTina: tina,
      assignedLyriq: lyriq,
      skippedNoAssignee: skipped,
      dueDateSpread: DUE_DATES,
      target: isLocal ? "local" : "remote",
    },
    null,
    2,
  ),
);
