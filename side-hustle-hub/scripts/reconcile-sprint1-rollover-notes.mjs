/**
 * Reconcile Sprint 1 → Sprint 2 rollover notes on tasks + tests.
 *
 * Rules:
 * - Only items that were still open when Sprint 1 closed are rollovers.
 * - Canonical note text: "Rolled over from Sprint 1"
 * - Tasks: keep End Sprint set for *open* KEEP tasks; strip false bulk tags; normalize wording.
 * - Done tasks are never ensured a rollover note (use restore-pre-cutoff-completed-rollover.mjs).
 * - Tests: normalize existing End Sprint notes; do not tag new S2-only work.
 *
 *   node --use-system-ca scripts/reconcile-sprint1-rollover-notes.mjs --dry-run
 *   node --use-system-ca scripts/reconcile-sprint1-rollover-notes.mjs
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

const NOTE = "Rolled over from Sprint 1";
const LEGACY_RE = /Roll(?:ed|ing) over from Sprint\s*\d+/i;
const AUTHOR = "Evelyn";
const AT = "2026-07-28T07:17:21.474Z";
const AT2 = "2026-07-28T07:17:22.475Z";

/** Authentic End Sprint task set (open on S1 at close). */
const KEEP_TASKS = new Set([
  "T-002",
  "T-004",
  "T-005",
  "T-010",
  "T-012",
  "T-014",
  "T-016",
  "T-017",
  "T-019",
  "T-022",
  "T-023",
  "T-028",
  "T-029",
  "T-031",
  "T-032",
  "T-034",
  "T-035",
  "T-037",
  "T-038",
  "T-039",
  "T-LG-ai-timing",
  "T-LG-dropshipping",
  "T-LG-food-delivery",
]);

/** Parse wrangler --json output even when row values contain `]` characters. */
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
  const dir = mkdtempSync(join(tmpdir(), "gysh-reconcile-roll-"));
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

/** Normalize legacy wording; optionally force-ensure one canonical roll note. */
function normalizeNotes(raw, { ensure = false } = {}) {
  let entries = parseNotes(raw);
  let changed = false;
  let hasRoll = false;
  entries = entries.map((e) => {
    const text = String(e.text || "");
    if (!LEGACY_RE.test(text)) return e;
    hasRoll = true;
    if (text.trim() === NOTE) return e;
    changed = true;
    return { ...e, text: NOTE, updatedAt: e.updatedAt || AT2 };
  });
  if (ensure && !hasRoll) {
    entries.push({
      id: `n-roll-${Math.random().toString(36).slice(2, 10)}`,
      author: AUTHOR,
      createdAt: AT,
      updatedAt: AT2,
      text: NOTE,
    });
    changed = true;
    hasRoll = true;
  }
  return {
    notes: entries.length ? JSON.stringify(entries) : "",
    changed,
    hasRoll,
  };
}

function stripRollNotes(raw) {
  const entries = parseNotes(raw).filter((e) => !LEGACY_RE.test(String(e.text || "")));
  const next = entries.length ? JSON.stringify(entries) : "";
  const prev = String(raw ?? "");
  return { notes: next, changed: next !== prev };
}

console.log(dryRun ? "=== DRY RUN ===" : `=== LIVE (${local ? "local" : "remote"}) ===`);
console.log(`Canonical note: "${NOTE}"`);

// --- TASKS ---
const allTaggedTasks = runCommand(
  `SELECT id, status, notes FROM tasks WHERE notes LIKE '%Rolling over from Sprint%' OR notes LIKE '%Rolled over from Sprint%' ORDER BY id`,
);
const allKeepRows = runCommand(
  `SELECT id, status, notes FROM tasks WHERE id IN (${[...KEEP_TASKS].map((id) => `'${id}'`).join(",")}) ORDER BY id`,
);

const taskUpdates = [];
for (const r of allTaggedTasks) {
  // Open KEEP tasks keep their notes (normalized below). Done+rolled cleanup is
  // handled by restore-pre-cutoff-completed-rollover.mjs (cutoff-aware).
  if (KEEP_TASKS.has(r.id)) continue;
  const { notes, changed } = stripRollNotes(r.notes);
  if (changed) taskUpdates.push({ id: r.id, notes, action: "strip" });
}
for (const r of allKeepRows) {
  // Only open work that was rolled at End Sprint should keep/ensure the note.
  if (r.status === "done") continue;
  const { notes, changed } = normalizeNotes(r.notes, { ensure: true });
  if (changed) taskUpdates.push({ id: r.id, notes, action: "normalize/ensure" });
}

console.log(
  "Tasks to update:",
  taskUpdates.filter((u) => u.action !== "ok").length,
  taskUpdates.filter((u) => u.action !== "ok").map((u) => `${u.id}:${u.action}`).join(", "),
);

// --- TESTS ---
const taggedTests = runCommand(
  `SELECT case_id, status, sprint, note FROM test_case_status
   WHERE note LIKE '%Rolling over from Sprint%' OR note LIKE '%Rolled over from Sprint%'
   ORDER BY case_id`,
);
const testUpdates = [];
for (const r of taggedTests) {
  const { notes, changed } = normalizeNotes(r.note, { ensure: false });
  if (changed) testUpdates.push({ case_id: r.case_id, note: notes, action: "normalize" });
}

console.log(
  "Tests to normalize:",
  testUpdates.length,
  testUpdates.map((u) => u.case_id).join(", "),
);
console.log(
  "(Open S2 tests without a rollover note are left alone — treated as Sprint 2-origin work.)",
);

if (dryRun) {
  console.log("Dry run only — no writes.");
  process.exit(0);
}

for (const u of taskUpdates) {
  if (u.action === "ok") continue;
  runFile(`UPDATE tasks SET notes = '${sqlEscape(u.notes)}' WHERE id = '${sqlEscape(u.id)}'`);
  console.log("task", u.action, u.id);
}

for (const u of testUpdates) {
  runFile(
    `UPDATE test_case_status SET note = '${sqlEscape(u.note)}' WHERE case_id = '${sqlEscape(u.case_id)}'`,
  );
  console.log("test", u.action, u.case_id);
}

const taskCount = runCommand(
  `SELECT COUNT(1) AS n FROM tasks WHERE notes LIKE '%Rolled over from Sprint 1%' OR notes LIKE '%Rolling over from Sprint 1%'`,
)?.[0]?.n;
const testCount = runCommand(
  `SELECT COUNT(1) AS n FROM test_case_status WHERE note LIKE '%Rolled over from Sprint 1%' OR note LIKE '%Rolling over from Sprint 1%'`,
)?.[0]?.n;
const legacyLeft = runCommand(
  `SELECT
     (SELECT COUNT(1) FROM tasks WHERE notes LIKE '%Rolling over from Sprint%') +
     (SELECT COUNT(1) FROM test_case_status WHERE note LIKE '%Rolling over from Sprint%') AS n`,
)?.[0]?.n;

console.log({
  tasks_with_rollover_note: taskCount,
  tests_with_rollover_note: testCount,
  legacy_rolling_over_left: legacyLeft,
});
console.log("Done.");
