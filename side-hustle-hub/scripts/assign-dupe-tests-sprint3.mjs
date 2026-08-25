/**
 * Assign Evelyn/Tina duplicated catalog tests to Sprint 3 with due dates
 * split across tomorrow and day-after-tomorrow.
 *
 * Usage: node --use-system-ca scripts/assign-dupe-tests-sprint3.mjs --remote
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isRemote = process.argv.includes("--remote");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

function wranglerD1(extraArgs) {
  const result = spawnSync(
    process.execPath,
    ["--use-system-ca", wrangler, "d1", "execute", "gysh-db", ...extraArgs],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    console.error(result.stdout || "");
    console.error(result.stderr || "");
    process.exit(result.status ?? 1);
  }
  return result.stdout || "";
}

function runFile(sql) {
  const tmp = path.join(os.tmpdir(), `gysh-sprint3-dupes-${Date.now()}.sql`);
  fs.writeFileSync(tmp, sql, "utf8");
  try {
    const loc = isRemote
      ? ["--remote", "--yes", "--file", tmp]
      : ["--local", "--persist-to", ".wrangler/state", "--yes", "--file", tmp];
    return wranglerD1(loc);
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

function esc(s) {
  return String(s ?? "").replace(/'/g, "''");
}

const dump = spawnSync("npx", ["tsx", "scripts/dump-assign-dupe-sprint3.ts"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
  maxBuffer: 8 * 1024 * 1024,
});
if (dump.status !== 0) {
  console.error(dump.stderr || dump.stdout);
  process.exit(dump.status ?? 1);
}

const { cases, tasks, tomorrow, dayAfter } = JSON.parse(dump.stdout.trim());
const now = new Date().toISOString();
const statements = [];

for (const c of cases) {
  statements.push(`INSERT INTO test_case_status (
    case_id, status, updated_at, updated_by, assignee, sprint, due_date, assigned_by, date_assigned
  ) VALUES (
    '${esc(c.id)}',
    'not_run',
    '${esc(now)}',
    'assign-dupe-sprint3',
    '${esc(c.assignee)}',
    3,
    '${esc(c.dueDate)}',
    'Evelyn',
    '${esc(c.dateAssigned)}'
  )
  ON CONFLICT(case_id) DO UPDATE SET
    assignee = excluded.assignee,
    sprint = 3,
    due_date = excluded.due_date,
    assigned_by = excluded.assigned_by,
    date_assigned = excluded.date_assigned,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;`);
}

for (const t of tasks) {
  statements.push(`UPDATE tasks SET
    sprint = 3,
    due_date = '${esc(t.dueDate)}',
    assigned_to = '${esc(t.assignedTo)}',
    updated_at = '${esc(now)}',
    updated_by = 'assign-dupe-sprint3'
  WHERE id = '${esc(t.id)}';`);
}

runFile(statements.join("\n"));
console.log(
  `Sprint 3 assign (${isRemote ? "remote" : "local"}): tomorrow=${tomorrow} dayAfter=${dayAfter}`,
);
console.log(
  `cases=${cases.length} → ${cases.map((c) => `${c.id}@${c.dueDate}`).join(", ")}`,
);
if (tasks.length) {
  console.log(`tasks=${tasks.length} → ${tasks.map((t) => `${t.id}@${t.dueDate}`).join(", ")}`);
}
