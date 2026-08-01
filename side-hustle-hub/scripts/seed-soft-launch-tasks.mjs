/**
 * Seed Soft Launch marketing tasks (T-SL-*) into D1.
 * Usage: node scripts/seed-soft-launch-tasks.mjs [--remote]
 *
 * Generates seed rows via tsx, then upserts with wrangler d1.
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

function runJson(command) {
  const loc = isRemote
    ? ["--remote", "--yes", "--json", "--command", command]
    : ["--local", "--persist-to", ".wrangler/state", "--yes", "--json", "--command", command];
  const raw = wranglerD1(loc).trim();
  const start = raw.indexOf("[");
  if (start < 0) throw new Error(`No JSON array in wrangler output:\n${raw.slice(0, 400)}`);
  return JSON.parse(raw.slice(start));
}

function runFile(sql) {
  const tmp = path.join(os.tmpdir(), `gysh-sl-${Date.now()}.sql`);
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

const dump = spawnSync("npx", ["tsx", "scripts/dump-soft-launch-seeds.ts"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
  maxBuffer: 32 * 1024 * 1024,
});
if (dump.status !== 0) {
  console.error(dump.stderr || dump.stdout);
  process.exit(dump.status ?? 1);
}
const seeds = JSON.parse(dump.stdout.trim());
const ids = seeds.map((s) => s.id);
const existing = runJson(
  `SELECT id FROM tasks WHERE id IN (${ids.map((id) => `'${esc(id)}'`).join(",")});`,
);
const have = new Set((existing[0]?.results ?? []).map((r) => r.id));

const now = new Date().toISOString();
const statements = [];
let inserted = 0;
let updated = 0;

for (const t of seeds) {
  const notes = `${t.notes}\n\nSprint ${t.sprint} soft-launch marketing`;
  if (have.has(t.id)) {
    statements.push(`UPDATE tasks SET
      description = '${esc(t.description)}',
      category = '${esc(t.category)}',
      priority = '${esc(t.priority)}',
      assign_by = '${esc(t.assignBy)}',
      assigned_to = '${esc(t.assignedTo)}',
      due_date = '${esc(t.dueDate)}',
      notes = '${esc(notes)}',
      sprint = ${t.sprint},
      updated_at = '${esc(now)}',
      updated_by = 'seed-soft-launch'
    WHERE id = '${esc(t.id)}';`);
    updated += 1;
  } else {
    statements.push(`INSERT INTO tasks (
      id, description, category, priority, status, assign_by, assigned_to,
      date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
      sort_order, updated_at, updated_by
    ) VALUES (
      '${esc(t.id)}',
      '${esc(t.description)}',
      '${esc(t.category)}',
      '${esc(t.priority)}',
      'not_started',
      '${esc(t.assignBy)}',
      '${esc(t.assignedTo)}',
      '${esc(now.slice(0, 10))}',
      '${esc(t.dueDate)}',
      '',
      '${esc(notes)}',
      ${t.sprint},
      0,
      0,
      ${9000 + inserted},
      '${esc(now)}',
      'seed-soft-launch'
    );`);
    inserted += 1;
  }
}

runFile(statements.join("\n"));
console.log(`Soft launch tasks: inserted ${inserted}, updated ${updated} (${isRemote ? "remote" : "local"}).`);
console.log(ids.join("\n"));
