/**
 * Seed Testing Portal rows for catalog cases that were expanded to single assignees
 * (calculator triples + former dual/triple assignee cases).
 *
 * Usage: node --use-system-ca scripts/seed-assignee-dupes.mjs --remote
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
  const tmp = path.join(os.tmpdir(), `gysh-assignee-dupes-${Date.now()}.sql`);
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

const dump = spawnSync("npx", ["tsx", "scripts/dump-assignee-dupe-seeds.ts"], {
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
const statements = cases.map(
  (c) => `INSERT INTO test_case_status (
    case_id, status, updated_at, updated_by, assignee, sprint, due_date, assigned_by, date_assigned
  ) VALUES (
    '${esc(c.id)}',
    'not_run',
    '${esc(now)}',
    'seed-assignee-dupes',
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
    updated_by = excluded.updated_by;`,
);

if (!statements.length) {
  console.log("No assignee-dupe cases to seed.");
  process.exit(0);
}

runFile(statements.join("\n"));
console.log(
  `Seeded assignee dupes (${isRemote ? "remote" : "local"}): ${cases
    .map((c) => `${c.id}→${c.assignee}`)
    .join(", ")} due=${cases[0]?.dueDate}`,
);
