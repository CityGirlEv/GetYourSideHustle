/**
 * Mirror `tasks` table from remote (prod) → local D1 (UPSERT by id).
 * Fixes Task List / Schedule rollover bubbles when local notes/sprints lag prod.
 *
 *   node --use-system-ca scripts/sync-tasks-from-remote.mjs
 *   npm run db:sync-tasks
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

function wranglerD1(args) {
  const result = spawnSync(
    process.execPath,
    ["--use-system-ca", wrangler, "d1", "execute", "gysh-db", ...args],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || "wrangler failed");
    process.exit(result.status ?? 1);
  }
  return result.stdout || "";
}

function localD1(args) {
  return wranglerD1(["--local", "--persist-to", ".wrangler/state", ...args]);
}

/** Parse wrangler --json even when row values contain `]` (task notes JSON). */
function parseJsonResults(stdout) {
  const start = stdout.indexOf("[");
  if (start < 0) throw new Error(`No JSON array in wrangler output:\n${stdout.slice(0, 400)}`);
  let end = stdout.length;
  while (end > start) {
    try {
      const parsed = JSON.parse(stdout.slice(start, end));
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((b) => b?.results ?? []);
    } catch {
      const prev = stdout.lastIndexOf("]", end - 1);
      if (prev < start) break;
      end = prev + 1;
    }
  }
  throw new Error(`Could not parse wrangler JSON:\n${stdout.slice(0, 400)}`);
}

function sqlEscape(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function runSqlFile(sql) {
  const dir = mkdtempSync(path.join(tmpdir(), "gysh-sync-tasks-"));
  const file = path.join(dir, "batch.sql");
  try {
    writeFileSync(file, sql, "utf8");
    localD1(["--file", file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function taskUpsertSql(r) {
  const sprint = Number.isFinite(Number(r.sprint)) ? Number(r.sprint) : 0;
  const doneTina = Number(r.done_tina ?? 0) ? 1 : 0;
  const doneEvelyn = Number(r.done_evelyn ?? 0) ? 1 : 0;
  const sortOrder = Number.isFinite(Number(r.sort_order)) ? Number(r.sort_order) : 0;
  return `INSERT INTO tasks (
    id, description, category, priority, status, assign_by, assigned_to,
    date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
    sort_order, updated_at, updated_by
  ) VALUES (
    '${sqlEscape(r.id)}',
    '${sqlEscape(r.description)}',
    '${sqlEscape(r.category)}',
    '${sqlEscape(r.priority)}',
    '${sqlEscape(r.status)}',
    '${sqlEscape(r.assign_by)}',
    '${sqlEscape(r.assigned_to)}',
    '${sqlEscape(r.date_assigned ?? "")}',
    '${sqlEscape(r.due_date ?? "")}',
    '${sqlEscape(r.date_completed ?? "")}',
    '${sqlEscape(r.notes ?? "")}',
    ${sprint},
    ${doneTina},
    ${doneEvelyn},
    ${sortOrder},
    '${sqlEscape(r.updated_at ?? "")}',
    '${sqlEscape(r.updated_by ?? "")}'
  )
  ON CONFLICT(id) DO UPDATE SET
    description = excluded.description,
    category = excluded.category,
    priority = excluded.priority,
    status = excluded.status,
    assign_by = excluded.assign_by,
    assigned_to = excluded.assigned_to,
    date_assigned = excluded.date_assigned,
    due_date = excluded.due_date,
    date_completed = excluded.date_completed,
    notes = excluded.notes,
    sprint = excluded.sprint,
    done_tina = excluded.done_tina,
    done_evelyn = excluded.done_evelyn,
    sort_order = excluded.sort_order,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;`;
}

console.log("Syncing tasks: prod D1 → local…");

const remoteRows = parseJsonResults(
  wranglerD1([
    "--remote",
    "--json",
    "--command",
    `SELECT id, description, category, priority, status, assign_by, assigned_to,
            date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
            sort_order, updated_at, updated_by
     FROM tasks
     ORDER BY id`,
  ]),
);

if (remoteRows.length === 0) {
  console.error("No tasks from remote — aborting.");
  process.exit(1);
}

const chunkSize = 25;
for (let i = 0; i < remoteRows.length; i += chunkSize) {
  const slice = remoteRows.slice(i, i + chunkSize);
  runSqlFile(slice.map(taskUpsertSql).join("\n"));
  process.stdout.write(`\r  tasks: ${Math.min(i + slice.length, remoteRows.length)}/${remoteRows.length}`);
}
process.stdout.write("\n");

const verify = parseJsonResults(
  localD1([
    "--json",
    "--command",
    `SELECT
       SUM(CASE WHEN notes LIKE '%over from Sprint%' THEN 1 ELSE 0 END) AS rolled,
       SUM(CASE WHEN CAST(sprint AS INTEGER) = 2 THEN 1 ELSE 0 END) AS sprint2,
       COUNT(*) AS total
     FROM tasks`,
  ]),
)?.[0];

console.log({
  remote_tasks: remoteRows.length,
  local_total: verify?.total,
  local_sprint2: verify?.sprint2,
  local_with_rollover_note: verify?.rolled,
});
console.log("Done. Refresh Task List / Schedule & Plan.");
