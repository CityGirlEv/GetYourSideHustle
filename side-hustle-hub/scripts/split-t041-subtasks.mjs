/**
 * Split / heal T-041 → parent T-041 + Tina T-041T + Evelyn T-041E (shared notes).
 * Usage: node scripts/split-t041-subtasks.mjs [--remote]
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
  const tmp = path.join(os.tmpdir(), `gysh-t041-${Date.now()}.sql`);
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

const colInfo = runJson("PRAGMA table_info(tasks);");
const cols = new Set((colInfo[0]?.results ?? []).map((r) => r.name));
if (!cols.has("parent_id")) {
  console.log("Adding parent_id column…");
  runFile(`ALTER TABLE tasks ADD COLUMN parent_id TEXT NOT NULL DEFAULT '';`);
}

const existing = runJson(
  "SELECT id FROM tasks WHERE id IN ('T-041','T-041T','T-041E') ORDER BY id;",
);
const ids = new Set((existing[0]?.results ?? []).map((r) => r.id));
if (!ids.has("T-041")) {
  console.error("T-041 not found.");
  process.exit(1);
}
if (ids.has("T-041T") && ids.has("T-041E")) {
  console.log("T-041T and T-041E already exist — ensuring parent links + assignees.");
  runFile(`
UPDATE tasks SET parent_id = 'T-041', assigned_to = 'Tina' WHERE id = 'T-041T';
UPDATE tasks SET parent_id = 'T-041', assigned_to = 'Evelyn', done_evelyn = 1, status = 'done',
  date_completed = CASE WHEN date_completed = '' OR date_completed IS NULL THEN strftime('%m/%d/%y','now') ELSE date_completed END
WHERE id = 'T-041E';
UPDATE tasks SET parent_id = '', assigned_to = 'Tina',
  description = 'AI site analysis → improvement tasks + counterpart tests (Tina + Evelyn)'
WHERE id = 'T-041';
UPDATE tasks SET notes = (SELECT notes FROM tasks WHERE id = 'T-041') WHERE id IN ('T-041T','T-041E');
`);
  console.log("✓ Linked / healed T-041 family");
  process.exit(0);
}

const rowWrap = runJson(
  "SELECT id, description, category, priority, status, assign_by, assigned_to, date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn, sort_order, updated_at, updated_by FROM tasks WHERE id = 'T-041';",
);
const row = rowWrap[0]?.results?.[0];
if (!row) {
  console.error("Could not load T-041.");
  process.exit(1);
}

const now = new Date().toISOString();
const notes = row.notes || "";
const originalDesc = row.description || "";
const parentDesc = "AI site analysis → improvement tasks + counterpart tests (Tina + Evelyn)";
const evelynDesc =
  "Evelyn: AI site analysis run (Lighthouse / Foresight) — capture Cursor prompts + improvement list with counterpart tests";

const sql = `
UPDATE tasks SET
  description = '${esc(parentDesc)}',
  assigned_to = 'Tina',
  status = 'in_progress',
  done_tina = 0,
  done_evelyn = 0,
  parent_id = '',
  date_completed = '',
  updated_at = '${esc(now)}',
  updated_by = 'Evelyn'
WHERE id = 'T-041';

INSERT INTO tasks (
  id, description, category, priority, status, assign_by, assigned_to,
  date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
  parent_id, sort_order, updated_at, updated_by
) VALUES (
  'T-041T',
  '${esc(originalDesc)}',
  '${esc(row.category)}',
  '${esc(row.priority)}',
  'in_progress',
  '${esc(row.assign_by || "Evelyn")}',
  'Tina',
  '${esc(row.date_assigned)}',
  '${esc(row.due_date)}',
  '',
  '${esc(notes)}',
  ${Number(row.sprint) || 2},
  0,
  0,
  'T-041',
  ${Number(row.sort_order) || 0},
  '${esc(now)}',
  'Evelyn'
);

INSERT INTO tasks (
  id, description, category, priority, status, assign_by, assigned_to,
  date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
  parent_id, sort_order, updated_at, updated_by
) VALUES (
  'T-041E',
  '${esc(evelynDesc)}',
  '${esc(row.category)}',
  '${esc(row.priority)}',
  'done',
  '${esc(row.assign_by || "Evelyn")}',
  'Evelyn',
  '${esc(row.date_assigned)}',
  '${esc(row.due_date)}',
  '${esc(row.date_completed || "07/30/26")}',
  '${esc(notes)}',
  ${Number(row.sprint) || 2},
  0,
  1,
  'T-041',
  ${Number(row.sort_order) || 0},
  '${esc(now)}',
  'Evelyn'
);

UPDATE tasks SET notes = '${esc(notes)}' WHERE id IN ('T-041', 'T-041T', 'T-041E');
`;

console.log(`Splitting T-041 on ${isRemote ? "remote" : "local"} D1…`);
runFile(sql);
console.log("✓ T-041 (parent / Tina) · T-041T (Tina) · T-041E (Evelyn done)");
