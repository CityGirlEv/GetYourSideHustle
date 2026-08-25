/**
 * Shift incomplete task/test due dates +14 days after the Aug 4–17 pause.
 * Leaves dues that were already past-due before 2026-08-04 unchanged.
 *
 *   node --use-system-ca scripts/shift-dues-after-pause.mjs --dry-run
 *   node --use-system-ca scripts/shift-dues-after-pause.mjs --remote
 */
import { d1ExecFile, d1Select, sqlEscape } from "./_d1-remote.mjs";

const dryRun = process.argv.includes("--dry-run");

function parseMmddyy(raw) {
  const m = String(raw || "")
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  let year = Number(m[3]);
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

function formatMmddyy(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function shiftDue(raw) {
  const due = parseMmddyy(raw);
  if (!due) return { next: raw, changed: false };
  const pause = new Date(2026, 7, 4);
  pause.setHours(0, 0, 0, 0);
  if (due.getTime() < pause.getTime()) return { next: raw, changed: false };
  const next = new Date(due);
  next.setDate(due.getDate() + 14);
  return { next: formatMmddyy(next), changed: true };
}

const taskPayload = d1Select(
  `SELECT id, status, due_date, sprint FROM tasks WHERE status != 'done' AND TRIM(COALESCE(due_date,'')) != ''`,
);
const testPayload = d1Select(
  `SELECT case_id, status, due_date, sprint FROM test_case_status WHERE status NOT IN ('pass','conditional_approval') AND TRIM(COALESCE(due_date,'')) != ''`,
);

const taskRows = taskPayload[0]?.results ?? [];
const testRows = testPayload[0]?.results ?? [];

const taskUpdates = [];
for (const row of taskRows) {
  const { next, changed } = shiftDue(row.due_date);
  if (changed) taskUpdates.push({ id: row.id, from: row.due_date, to: next, sprint: row.sprint });
}

const testUpdates = [];
for (const row of testRows) {
  const { next, changed } = shiftDue(row.due_date);
  if (changed) {
    testUpdates.push({
      id: row.case_id,
      from: row.due_date,
      to: next,
      sprint: row.sprint,
    });
  }
}

console.log(
  `Tasks to shift: ${taskUpdates.length} · Tests to shift: ${testUpdates.length}` +
    (dryRun ? " (dry-run)" : ""),
);
for (const u of taskUpdates.slice(0, 20)) {
  console.log(`  task ${u.id}  ${u.from} → ${u.to}  (sprint ${u.sprint})`);
}
if (taskUpdates.length > 20) console.log(`  … +${taskUpdates.length - 20} more tasks`);
for (const u of testUpdates.slice(0, 20)) {
  console.log(`  test ${u.id}  ${u.from} → ${u.to}  (sprint ${u.sprint})`);
}
if (testUpdates.length > 20) console.log(`  … +${testUpdates.length - 20} more tests`);

if (dryRun) {
  console.log("Dry run only — no writes.");
  process.exit(0);
}

const stmts = [];
for (const u of taskUpdates) {
  stmts.push(`UPDATE tasks SET due_date = '${sqlEscape(u.to)}' WHERE id = '${sqlEscape(u.id)}';`);
}
for (const u of testUpdates) {
  stmts.push(
    `UPDATE test_case_status SET due_date = '${sqlEscape(u.to)}' WHERE case_id = '${sqlEscape(u.id)}';`,
  );
}

if (stmts.length === 0) {
  console.log("Nothing to update.");
  process.exit(0);
}

const CHUNK = 40;
for (let i = 0; i < stmts.length; i += CHUNK) {
  d1ExecFile(stmts.slice(i, i + CHUNK).join("\n"));
  console.log(
    `Wrote ${Math.min(CHUNK, stmts.length - i)} statements (${i + 1}–${Math.min(i + CHUNK, stmts.length)})`,
  );
}

console.log("Done.");
