/**
 * Restore Sprint 1 completions that were incorrectly rolled into Sprint 2.
 *
 * Rules (Sprint 1 close cutoff: 2026-07-27 11:59 PM America/Chicago):
 * - Done tasks with date_completed on/before 07/27/26 → sprint 1, strip rollover notes
 * - Tests that were Pass or Conditional Pass at End Sprint → sprint 1, strip rollover notes
 * - Items completed on/after Sprint 2 day 1 (07/28/26) stay on Sprint 2 (may keep roll note)
 *
 *   node --use-system-ca scripts/restore-pre-cutoff-completed-rollover.mjs --dry-run
 *   node --use-system-ca scripts/restore-pre-cutoff-completed-rollover.mjs
 *   node --use-system-ca scripts/restore-pre-cutoff-completed-rollover.mjs --local
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const dryRun = process.argv.includes("--dry-run");
const local = process.argv.includes("--local");
const FLAG = local ? "--local --persist-to .wrangler/state" : "--remote";
const WRANGLER =
  "node --use-system-ca ../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js";

const LEGACY_RE = /Roll(?:ed|ing) over from Sprint\s*\d+/i;
/** End Sprint timestamp (UTC) — status history before this is "at close". */
const END_SPRINT_AT = "2026-07-28T07:17:21.000Z";
/** Last calendar day of Sprint 1 completion (MM/DD/YY). */
const CUTOFF_COMPLETED = "07/27/26";

function parseWranglerJson(out) {
  const start = out.indexOf("[");
  if (start < 0) throw new Error(`No JSON:\n${out.slice(0, 400)}`);
  let end = out.length;
  while (end > start) {
    try {
      return JSON.parse(out.slice(start, end));
    } catch {
      const prev = out.lastIndexOf("]", end - 1);
      if (prev < start) break;
      end = prev + 1;
    }
  }
  throw new Error(`Could not parse wrangler JSON:\n${out.slice(0, 400)}`);
}

function runCommand(sql) {
  const oneLine = String(sql).replace(/\s+/g, " ").trim();
  const out = execSync(
    `${WRANGLER} d1 execute gysh-db ${FLAG} --json --command ${JSON.stringify(oneLine)}`,
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 40 * 1024 * 1024 },
  );
  return parseWranglerJson(out)?.[0]?.results ?? [];
}

function runFile(sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-restore-roll-"));
  const file = join(dir, "q.sql");
  writeFileSync(file, sql.endsWith(";") ? sql : `${sql};`, "utf8");
  try {
    execSync(`${WRANGLER} d1 execute gysh-db ${FLAG} --file ${JSON.stringify(file)}`, {
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

function stripRollNotes(raw) {
  const entries = parseNotes(raw).filter((e) => !LEGACY_RE.test(String(e.text || "")));
  const next = entries.length ? JSON.stringify(entries) : "";
  const prev = String(raw ?? "");
  return { notes: next, changed: next !== prev };
}

/** Parse MM/DD/YY (or MM/DD/YYYY) → comparable YYYYMMDD number, or null. */
function completedKey(raw) {
  const m = String(raw ?? "")
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let y = Number(m[3]);
  if (y < 100) y += 2000;
  const mo = Number(m[1]);
  const d = Number(m[2]);
  return y * 10000 + mo * 100 + d;
}

const cutoffKey = completedKey(CUTOFF_COMPLETED);

console.log(dryRun ? "=== DRY RUN ===" : `=== LIVE (${local ? "local" : "remote"}) ===`);
console.log(`Task cutoff date_completed <= ${CUTOFF_COMPLETED}`);
console.log(`Test status-at-close before ${END_SPRINT_AT}`);

// --- TASKS: Done + rollover note + completed on/before cutoff ---
const doneRolled = runCommand(
  `SELECT id, status, sprint, date_completed, due_date, notes
   FROM tasks
   WHERE status = 'done'
     AND (notes LIKE '%Rolling over from Sprint%' OR notes LIKE '%Rolled over from Sprint%')
   ORDER BY id`,
);

const taskRestores = [];
const taskKeepS2 = [];
for (const r of doneRolled) {
  const key = completedKey(r.date_completed);
  if (key != null && key <= cutoffKey) {
    const { notes, changed } = stripRollNotes(r.notes);
    taskRestores.push({
      id: r.id,
      sprint: 1,
      notes,
      strip: changed,
      date_completed: r.date_completed,
      prevSprint: r.sprint,
    });
  } else {
    taskKeepS2.push({ id: r.id, date_completed: r.date_completed, sprint: r.sprint });
  }
}

console.log(
  "Tasks restore to Sprint 1 + strip roll note:",
  taskRestores.length,
  taskRestores.map((t) => `${t.id}(${t.date_completed})`).join(", "),
);
console.log(
  "Tasks keep on Sprint 2 (completed after cutoff):",
  taskKeepS2.length,
  taskKeepS2.map((t) => `${t.id}(${t.date_completed})`).join(", "),
);

// --- TESTS: Pass/CA at End Sprint but rolled ---
const statusAtClose = runCommand(
  `WITH ranked AS (
     SELECT case_id, status, changed_at,
            ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY changed_at DESC) AS rn
     FROM test_case_status_history
     WHERE changed_at < '${END_SPRINT_AT}'
       AND case_id IN (
         SELECT case_id FROM test_case_status
         WHERE note LIKE '%Rolling over from Sprint%'
            OR note LIKE '%Rolled over from Sprint%'
       )
   )
   SELECT case_id, status, changed_at FROM ranked WHERE rn = 1 ORDER BY case_id`,
);

const passedAtClose = new Set(
  statusAtClose
    .filter((r) => r.status === "pass" || r.status === "conditional_approval")
    .map((r) => r.case_id),
);

const taggedTests = runCommand(
  `SELECT case_id, status, sprint, due_date, note
   FROM test_case_status
   WHERE note LIKE '%Rolling over from Sprint%' OR note LIKE '%Rolled over from Sprint%'
   ORDER BY case_id`,
);

const testRestores = [];
const testKeepS2 = [];
for (const r of taggedTests) {
  if (!passedAtClose.has(r.case_id)) {
    if (r.status === "pass" || r.status === "conditional_approval") {
      testKeepS2.push({
        case_id: r.case_id,
        status: r.status,
        reason: "open at close; passed on Sprint 2",
      });
    }
    continue;
  }
  const { notes, changed } = stripRollNotes(r.note);
  testRestores.push({
    case_id: r.case_id,
    sprint: 1,
    note: notes,
    strip: changed,
    statusAtClose: statusAtClose.find((x) => x.case_id === r.case_id)?.status,
    currentStatus: r.status,
    prevSprint: r.sprint,
  });
}

console.log(
  "Tests restore to Sprint 1 + strip roll note:",
  testRestores.length,
  testRestores.map((t) => `${t.case_id}(atClose=${t.statusAtClose},now=${t.currentStatus})`).join(", "),
);
console.log(
  "Passed tests keep on Sprint 2 (open at close):",
  testKeepS2.length,
  testKeepS2.map((t) => t.case_id).join(", "),
);

if (dryRun) {
  console.log("Dry run only — no writes.");
  process.exit(0);
}

for (const u of taskRestores) {
  runFile(
    `UPDATE tasks SET sprint = 1, notes = '${sqlEscape(u.notes)}' WHERE id = '${sqlEscape(u.id)}'`,
  );
  console.log("task restore", u.id, `sprint ${u.prevSprint}→1`);
}

for (const u of testRestores) {
  runFile(
    `UPDATE test_case_status SET sprint = 1, note = '${sqlEscape(u.note)}' WHERE case_id = '${sqlEscape(u.case_id)}'`,
  );
  console.log("test restore", u.case_id, `sprint ${u.prevSprint}→1`);
}

const doneRolledLeft = runCommand(
  `SELECT id, date_completed FROM tasks
   WHERE status='done'
     AND (notes LIKE '%Rolled over from Sprint%' OR notes LIKE '%Rolling over from Sprint%')
   ORDER BY id`,
);
const passRolledLeft = runCommand(
  `SELECT case_id, status FROM test_case_status
   WHERE status IN ('pass','conditional_approval')
     AND (note LIKE '%Rolled over from Sprint%' OR note LIKE '%Rolling over from Sprint%')
   ORDER BY case_id`,
);

console.log({
  done_tasks_still_rolled: doneRolledLeft.map((r) => `${r.id}@${r.date_completed}`),
  passed_tests_still_rolled: passRolledLeft.map((r) => `${r.case_id}:${r.status}`),
});
console.log("Done.");
