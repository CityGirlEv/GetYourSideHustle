/**
 * Append "Please re-test." to the end of every Fixed/Cursor Cursor note.
 * Preserves all other note entries.
 */
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const RETEST = "Please re-test.";
const now = new Date().toISOString();

function runCommand(sql) {
  const out = execSync(
    `npx wrangler d1 execute gysh-db --remote --json --command ${JSON.stringify(sql)}`,
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 20 * 1024 * 1024 },
  );
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error(`No JSON:\n${out.slice(0, 400)}`);
  return JSON.parse(out.slice(start, end + 1));
}

function runFile(sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-sql-"));
  const file = join(dir, "q.sql");
  writeFileSync(file, sql.endsWith(";") ? sql : `${sql};`, "utf8");
  try {
    const out = execSync(
      `npx wrangler d1 execute gysh-db --remote --json --file ${JSON.stringify(file)}`,
      { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 20 * 1024 * 1024 },
    );
    const start = out.indexOf("[");
    const end = out.lastIndexOf("]");
    if (start < 0 || end < start) throw new Error(`No JSON:\n${out.slice(0, 400)}`);
    return JSON.parse(out.slice(start, end + 1));
  } finally {
    try {
      unlinkSync(file);
    } catch {
      /* ignore */
    }
  }
}

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function parseNotes(raw) {
  if (Array.isArray(raw)) return raw;
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
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

function withRetestSentence(text) {
  const t = String(text || "").trim();
  if (!t) return RETEST;
  if (/please re-?test/i.test(t)) return t;
  return `${t} ${RETEST}`;
}

const res = runCommand(
  "SELECT case_id, note FROM test_case_status WHERE status = 'fixed_cursor' ORDER BY case_id",
);
const rows = res?.[0]?.results ?? [];
console.log(`Found ${rows.length} fixed_cursor rows`);

for (const row of rows) {
  const entries = parseNotes(row.note);
  let changed = false;
  const next = entries.map((e) => {
    if (String(e.author || "").toLowerCase() !== "cursor") return e;
    const text = withRetestSentence(e.text);
    if (text === e.text) return e;
    changed = true;
    return { ...e, text, updatedAt: now };
  });
  if (!changed) {
    console.log(`ok ${row.case_id}`);
    continue;
  }
  if (next.length < entries.length) {
    throw new Error(`${row.case_id}: refuse note drop`);
  }
  runFile(`
UPDATE test_case_status
SET note = '${sqlEscape(JSON.stringify(next))}',
    updated_at = '${now}',
    updated_by = 'Cursor'
WHERE case_id = '${sqlEscape(row.case_id)}'
`);
  const cursor = next.find((e) => String(e.author).toLowerCase() === "cursor");
  console.log(`updated ${row.case_id}`);
  console.log(`  …${String(cursor?.text || "").slice(-80)}`);
}

console.log("\nDone.");
