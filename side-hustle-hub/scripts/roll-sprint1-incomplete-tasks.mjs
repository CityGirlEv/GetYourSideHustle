/**
 * Move incomplete Sprint 1 tasks → Sprint 2 and append
 * "Rolling over from Sprint 1" note (same as End Sprint Done).
 *
 *   node --use-system-ca scripts/roll-sprint1-incomplete-tasks.mjs --dry-run
 *   node --use-system-ca scripts/roll-sprint1-incomplete-tasks.mjs
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const dryRun = process.argv.includes("--dry-run");
const FROM = 1;
const TO = 2;
const TO_DUE = "08/03/26"; // Sprint 2 end
const NOTE_TEXT = `Rolling over from Sprint ${FROM}`;
const now = new Date().toISOString();
const author = "Evelyn";

function runCommand(sql) {
  const out = execSync(
    `npx wrangler d1 execute gysh-db --remote --json --command ${JSON.stringify(sql)}`,
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 40 * 1024 * 1024 },
  );
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error(`No JSON:\n${out.slice(0, 400)}`);
  return JSON.parse(out.slice(start, end + 1))?.[0]?.results ?? [];
}

function runFile(sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-task-roll-"));
  const file = join(dir, "q.sql");
  writeFileSync(file, sql.endsWith(";") ? sql : `${sql};`, "utf8");
  try {
    execSync(`npx wrangler d1 execute gysh-db --remote --file ${JSON.stringify(file)}`, {
      cwd: process.cwd(),
      encoding: "utf8",
      shell: true,
      maxBuffer: 40 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function parseNotes(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((e) => e && typeof e === "object");
    } catch {
      /* fall through */
    }
  }
  return [
    {
      id: "legacy",
      author: "Prior note",
      createdAt: "1970-01-01T00:00:00.000Z",
      updatedAt: "1970-01-01T00:00:00.000Z",
      text: trimmed,
    },
  ];
}

function appendRollNote(raw) {
  const entries = parseNotes(raw);
  if (entries.some((e) => /Rolling over from Sprint\s*\d+/i.test(String(e.text || "")))) {
    return JSON.stringify(entries);
  }
  entries.push({
    id: `n-roll-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    author,
    createdAt: now,
    updatedAt: now,
    text: NOTE_TEXT,
  });
  return JSON.stringify(entries);
}

const rows = runCommand(
  `SELECT id, status, sprint, notes, due_date FROM tasks WHERE CAST(sprint AS INTEGER) = ${FROM} AND status != 'done' ORDER BY id`,
);

console.log(dryRun ? "=== DRY RUN ===" : "=== LIVE ROLL TASKS ===");
console.log(`Incomplete Sprint ${FROM} tasks:`, rows.length);
console.log(rows.map((r) => `${r.id}:${r.status}`));

if (rows.length === 0) {
  console.log("Nothing on Sprint 1 to move.");
  // Also report open S2 missing roll note (already moved earlier without tag)
  const openS2 = runCommand(
    `SELECT id, status, sprint, notes FROM tasks WHERE CAST(sprint AS INTEGER) = ${TO} AND status != 'done' ORDER BY id`,
  );
  const missing = openS2.filter(
    (r) => !/Rolling over from Sprint\s*\d+/i.test(String(r.notes || "")),
  );
  console.log(`Open Sprint ${TO} without roll note:`, missing.length, missing.map((r) => r.id));
  process.exit(0);
}

if (dryRun) {
  console.log(`Would move ${rows.length} → Sprint ${TO} with note "${NOTE_TEXT}"`);
  process.exit(0);
}

for (const r of rows) {
  const notes = appendRollNote(r.notes);
  const nextStatus = r.status === "not_started" ? "in_progress" : r.status;
  const sql = `UPDATE tasks SET sprint = ${TO}, status = '${sqlEscape(nextStatus)}', due_date = '${TO_DUE}', notes = '${sqlEscape(notes)}', updated_at = '${sqlEscape(now)}', updated_by = '${sqlEscape(author)}' WHERE id = '${sqlEscape(r.id)}' AND CAST(sprint AS INTEGER) = ${FROM} AND status != 'done'`;
  runFile(sql);
  console.log("rolled", r.id, r.status, "→", nextStatus, `S${TO}`);
}

const left = runCommand(
  `SELECT COUNT(1) AS n FROM tasks WHERE CAST(sprint AS INTEGER) = ${FROM} AND status != 'done'`,
)?.[0]?.n;
const tagged = runCommand(
  `SELECT COUNT(1) AS n FROM tasks WHERE CAST(sprint AS INTEGER) = ${TO} AND notes LIKE '%Rolling over from Sprint%'`,
)?.[0]?.n;
console.log({ incomplete_left_on_S1: left, s2_with_roll_note: tagged });
console.log("Done.");
