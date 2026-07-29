/**
 * Remove "Rolling over from Sprint 1" notes we bulk-added to Sprint 2 tasks
 * that were NOT open on Sprint 1 at End Sprint close.
 *
 * Keep only the authentic End Sprint set (23 tasks already tagged before the
 * bulk tag-sprint2-task-rollovers run). Strip notes from the 21 false positives.
 *
 *   node --use-system-ca scripts/untag-false-sprint2-task-rollovers.mjs --dry-run
 *   node --use-system-ca scripts/untag-false-sprint2-task-rollovers.mjs
 *   node --use-system-ca scripts/untag-false-sprint2-task-rollovers.mjs --local
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

/** Tasks that already had End Sprint rollover notes before the bulk tag (keep these). */
const KEEP = new Set([
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

/** Bulk-tagged later — were not open-on-S1 at close (or already on S2). Strip note. */
const STRIP = [
  "T-007",
  "T-008",
  "T-009",
  "T-024",
  "T-025",
  "T-026",
  "T-027",
  "T-036",
  "T-LG-affiliate",
  "T-LG-ai-agents",
  "T-LG-ai-assets",
  "T-LG-amazon",
  "T-LG-book-publishing",
  "T-LG-digital-products",
  "T-LG-handyman",
  "T-LG-pod",
  "T-LG-property-mgmt",
  "T-LG-rideshare",
  "T-LG-social",
  "T-LG-web-leads",
  "T-SENIOR-PAGE",
];

const ROLL_RE = /Rolling over from Sprint\s*\d+/i;

function runCommand(sql) {
  const out = execSync(
    `${WRANGLER} d1 execute gysh-db ${FLAG} --json --command ${JSON.stringify(sql)}`,
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 40 * 1024 * 1024 },
  );
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error(`No JSON:\n${out.slice(0, 400)}`);
  return JSON.parse(out.slice(start, end + 1))?.[0]?.results ?? [];
}

function runFile(sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-untag-roll-"));
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

function stripRollNote(raw) {
  const entries = parseNotes(raw).filter((e) => !ROLL_RE.test(String(e.text || "")));
  if (entries.length === 0) return "";
  // If only a single legacy plain-text entry remains, keep JSON form for consistency.
  return JSON.stringify(entries);
}

const idList = STRIP.map((id) => `'${sqlEscape(id)}'`).join(",");
const rows = runCommand(
  `SELECT id, status, notes FROM tasks WHERE id IN (${idList}) ORDER BY id`,
);

console.log(dryRun ? "=== DRY RUN ===" : `=== LIVE (${local ? "local" : "remote"}) ===`);
console.log("Will strip rollover notes from:", rows.length, "tasks");
console.log(rows.map((r) => `${r.id}:${r.status}`).join(", "));
console.log("Keep authentic End Sprint set:", [...KEEP].join(", "));

if (dryRun) process.exit(0);

for (const r of rows) {
  const next = stripRollNote(r.notes);
  const had = ROLL_RE.test(String(r.notes || ""));
  if (!had) {
    console.log("skip (no roll note)", r.id);
    continue;
  }
  const sql = `UPDATE tasks SET notes = '${sqlEscape(next)}' WHERE id = '${sqlEscape(r.id)}'`;
  runFile(sql);
  console.log("stripped", r.id);
}

const tagged = runCommand(
  `SELECT COUNT(1) AS n FROM tasks WHERE CAST(sprint AS INTEGER) = 2 AND notes LIKE '%Rolling over from Sprint%'`,
)?.[0]?.n;
const keepStill = runCommand(
  `SELECT id FROM tasks WHERE id IN (${[...KEEP].map((id) => `'${sqlEscape(id)}'`).join(",")}) AND notes LIKE '%Rolling over from Sprint%' ORDER BY id`,
).map((r) => r.id);
console.log({ sprint2_with_roll_note: tagged, keep_still_tagged: keepStill.length, keepStill });
console.log("Done.");
