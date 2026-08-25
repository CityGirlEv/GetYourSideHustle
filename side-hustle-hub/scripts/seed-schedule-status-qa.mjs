/**
 * Seed Lyriq Schedule Suite QA as Testing Portal cases (not Task List).
 * Also supersedes any leftover T-SCHED-* Task List duplicates.
 *
 * Usage: node --use-system-ca scripts/seed-schedule-status-qa.mjs [--remote]
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
  const tmp = path.join(os.tmpdir(), `gysh-sched-status-${Date.now()}.sql`);
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

const dump = spawnSync("npx", ["tsx", "scripts/dump-schedule-status-qa-seeds.ts"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
  maxBuffer: 8 * 1024 * 1024,
});
if (dump.status !== 0) {
  console.error(dump.stderr || dump.stdout);
  process.exit(dump.status ?? 1);
}
const { cases } = JSON.parse(dump.stdout.trim());
const now = new Date().toISOString();
const statements = [];

// Remove Task List duplicates — Schedule Suite QA is Testing Portal only.
statements.push(`DELETE FROM tasks WHERE id LIKE 'T-SCHED-%';`);

for (const c of cases) {
  statements.push(`INSERT INTO test_case_status (
    case_id, status, updated_at, updated_by, assignee, sprint, due_date, assigned_by, date_assigned
  ) VALUES (
    '${esc(c.id)}',
    'not_run',
    '${esc(now)}',
    'seed-schedule-status-qa',
    '${esc(c.assignee)}',
    ${Number(c.sprint) || 3},
    '${esc(c.dueDate)}',
    'Evelyn',
    '${esc(c.dateAssigned)}'
  )
  ON CONFLICT(case_id) DO UPDATE SET
    status = 'not_run',
    assignee = excluded.assignee,
    sprint = excluded.sprint,
    due_date = excluded.due_date,
    assigned_by = excluded.assigned_by,
    date_assigned = excluded.date_assigned,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;`);
}

runFile(statements.join("\n"));
console.log(
  `Schedule Suite QA (${isRemote ? "remote" : "local"}): tests=${cases
    .map((c) => c.id)
    .join(", ")} assignee=lyriq sprint=3 due=${cases[0]?.dueDate}; deleted T-SCHED-* Task List rows`,
);
