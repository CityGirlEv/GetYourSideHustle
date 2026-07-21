/**
 * Persist soft-launch / GMSH rollout sprint assignments to D1.
 *
 *   node --use-system-ca scripts/apply-rollout-schedule.mjs
 *   node --use-system-ca scripts/apply-rollout-schedule.mjs --local
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

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function d1Json(sql) {
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
  const parsed = JSON.parse(r.stdout || "[]");
  return Array.isArray(parsed) ? parsed : [parsed];
}

function d1Run(sql) {
  const args = [
    "--use-system-ca",
    wrangler,
    "d1",
    "execute",
    "gysh-db",
    isLocal ? "--local" : "--remote",
  ];
  if (isLocal) args.push("--persist-to", ".wrangler/state");
  args.push("--command", sql);
  const r = spawnSync("node", args, { cwd: root, encoding: "utf8", shell: false });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`D1 execute failed: ${sql.slice(0, 160)}`);
  }
}

function d1File(filePath) {
  const args = [
    "--use-system-ca",
    wrangler,
    "d1",
    "execute",
    "gysh-db",
    isLocal ? "--local" : "--remote",
    "--file",
    filePath,
  ];
  if (isLocal) args.push("--persist-to", ".wrangler/state");
  const r = spawnSync("node", args, { cwd: root, encoding: "utf8", shell: false });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`D1 file execute failed`);
  }
}

console.log(`Loading snapshot from ${isLocal ? "local" : "remote"} D1…`);

const taskRows =
  d1Json(
    `SELECT id, category, notes, sprint, due_date AS dueDate, assigned_to AS assignedTo,
            description, priority, status, assign_by AS assignBy,
            date_assigned AS dateAssigned, date_completed AS dateCompleted,
            done_tina AS tinaDone, done_evelyn AS evelynDone
     FROM tasks ORDER BY id`,
  )[0]?.results ?? [];

const testRows =
  d1Json(
    `SELECT case_id AS id, sprint, due_date AS dueDate FROM test_case_status ORDER BY case_id`,
  )[0]?.results ?? [];

const planRows =
  d1Json(
    `SELECT id, title, notes, owner, kind, sprint, status, date, date_label AS dateLabel,
            done_tina AS tinaDone, done_evelyn AS evelynDone
     FROM plan_items ORDER BY sort_order ASC, id ASC`,
  )[0]?.results ?? [];

const testSprints = {};
const testDueDates = {};
for (const row of testRows) {
  testSprints[row.id] = Number(row.sprint);
  testDueDates[row.id] = String(row.dueDate ?? "");
}

const snapshot = {
  tasks: taskRows.map((t) => ({
    ...t,
    sprint: Number(t.sprint),
    notes: t.notes ?? "",
    dueDate: t.dueDate ?? "",
    assignedTo: t.assignedTo ?? "Unassigned",
    tinaDone: Boolean(t.tinaDone),
    evelynDone: Boolean(t.evelynDone),
  })),
  testSprints,
  testDueDates,
  planItems: planRows.map((p) => ({
    id: p.id,
    title: p.title,
    notes: p.notes ?? "",
    owner: p.owner,
    kind: p.kind,
    sprint: Number(p.sprint),
    status: p.status,
    date: p.date ?? "",
    dateLabel: p.dateLabel ?? "",
    tinaDone: Boolean(p.tinaDone),
    evelynDone: Boolean(p.evelynDone),
    attachments: [],
  })),
};

const computeScript = path.join(root, "scripts/_compute-rollout-spread.mts");
const snapFile = path.join(os.tmpdir(), `gysh-rollout-snap-${Date.now()}.json`);
fs.writeFileSync(snapFile, JSON.stringify(snapshot));

const compute = spawnSync("npx", ["vite-node", computeScript], {
  cwd: root,
  encoding: "utf8",
  shell: true,
  input: fs.readFileSync(snapFile, "utf8"),
  maxBuffer: 64 * 1024 * 1024,
});
if (compute.status !== 0) {
  console.error(compute.stderr || compute.stdout);
  throw new Error("Failed to compute rollout spread");
}
const out = (compute.stdout || "").trim();
const start = out.indexOf("{");
const end = out.lastIndexOf("}");
if (start < 0 || end < start) throw new Error("Could not parse rollout spread JSON");
const plan = JSON.parse(out.slice(start, end + 1));

console.log(
  `Computed: ${plan.summary.tasksChanged} tasks, ${plan.summary.testsChanged} tests, ${plan.summary.planChanged} plan items`,
);
console.log("Sample dues:", plan.summary.sampleDue);

const now = new Date().toISOString();
const statements = [];

for (const t of plan.taskUpdates) {
  statements.push(
    `UPDATE tasks SET sprint = ${Number(t.sprint)}, due_date = '${esc(t.dueDate)}', assigned_to = '${esc(t.assignedTo)}', updated_at = '${now}', updated_by = 'apply-rollout-schedule' WHERE id = '${esc(t.id)}';`,
  );
}

for (const t of plan.testUpdates) {
  statements.push(
    `INSERT INTO test_case_status
      (case_id, status, note, assignee, sprint, due_date, assigned_by, date_assigned, updated_at, updated_by)
     VALUES ('${esc(t.id)}', 'not_run', '', '', ${Number(t.sprint)}, '${esc(t.dueDate)}', 'System', '', '${now}', 'apply-rollout-schedule')
     ON CONFLICT(case_id) DO UPDATE SET
       sprint = excluded.sprint,
       due_date = excluded.due_date,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by;`,
  );
}

for (const p of plan.planUpdates) {
  statements.push(
    `UPDATE plan_items SET sprint = ${Number(p.sprint)}, date = '${esc(p.date)}', date_label = '${esc(p.dateLabel)}', title = '${esc(p.title)}', notes = '${esc(p.notes)}', updated_at = '${now}' WHERE id = '${esc(p.id)}';`,
  );
}

if (statements.length === 0) {
  console.log("Nothing to update — D1 already matches rollout schedule.");
  process.exit(0);
}

// Chunk to stay under wrangler command size limits
const chunkSize = 40;
const sqlPath = path.join(os.tmpdir(), `gysh-rollout-apply-${Date.now()}.sql`);
for (let i = 0; i < statements.length; i += chunkSize) {
  const chunk = statements.slice(i, i + chunkSize);
  fs.writeFileSync(sqlPath, chunk.join("\n"));
  console.log(`Applying SQL chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} statements)…`);
  d1File(sqlPath);
}

const verify = d1Json(
  `SELECT sprint, COUNT(*) AS n FROM test_case_status GROUP BY sprint ORDER BY sprint;
   SELECT sprint, COUNT(*) AS n FROM tasks GROUP BY sprint ORDER BY sprint;`,
);
console.log("Tests by sprint:", verify[0]?.results);
console.log("Tasks by sprint:", verify[1]?.results);
console.log("Done.");
