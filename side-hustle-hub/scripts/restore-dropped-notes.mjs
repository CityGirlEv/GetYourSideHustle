/**
 * Restore QA notes from test_case_status_history into test_case_status.
 * Merges by note entry id — never drops Cursor or QA entries.
 *
 * SELECT via --command (PowerShell-quoted). UPDATE via --file (long JSON safe).
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CASE_IDS = [
  "NAV-002",
  "PROOF-019-TINA",
  "PROOF-020-TINA",
  "PROOF-021-TINA",
  "PROOF-024-TINA",
  "PROOF-025-TINA",
  "PROOF-030-TINA",
  "PROOF-031-TINA",
  "PROOF-036-TINA",
  "PROOF-005-TINA",
  "PROOF-006-LYRIQ",
  "PROOF-007-TINA",
  "PROOF-046-LYRIQ",
  "PROOF-047-LYRIQ",
  "PROOF-048-LYRIQ",
  "PROOF-049-LYRIQ",
  "PROOF-050-LYRIQ",
  "PROOF-051-LYRIQ",
  "PW-JOIN-002",
];

const now = new Date().toISOString();

/** Run a SELECT/short SQL via --command; return parsed JSON results. */
function runCommand(sql) {
  // PowerShell single-quoted literal; escape ' as ''
  const psSql = String(sql).replace(/'/g, "''");
  const cmd = `npx wrangler d1 execute gysh-db --remote --json --command '${psSql}'`;
  const out = execSync(cmd, {
    cwd: process.cwd(),
    shell: "powershell.exe",
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 50 * 1024 * 1024,
  });
  const start = out.indexOf("[");
  if (start < 0) throw new Error(`No JSON:\n${out.slice(0, 500)}`);
  return JSON.parse(out.slice(start));
}

/** Run UPDATE/DDL via --file (avoids command-line length limits). */
function runFile(sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-upd-"));
  const file = join(dir, "q.sql");
  writeFileSync(file, sql.trim().endsWith(";") ? `${sql.trim()}\n` : `${sql.trim()};\n`, "utf8");
  try {
    execSync(`npx wrangler d1 execute gysh-db --remote --file "${file}"`, {
      cwd: process.cwd(),
      shell: "powershell.exe",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
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
  if (Array.isArray(raw)) {
    return raw.filter((e) => e && typeof e === "object" && String(e.text ?? "").trim());
  }
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((e) => e && typeof e === "object" && String(e.text ?? "").trim());
      }
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

function mergeById(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const entry of list) {
      const id = String(entry.id || "").trim() || `legacy-${String(entry.text).slice(0, 24)}`;
      const text = String(entry.text ?? "").trim();
      if (!text) continue;
      const prev = map.get(id);
      if (!prev || text.length >= String(prev.text ?? "").length) {
        map.set(id, {
          id,
          author: String(entry.author || "Prior note").trim() || "Prior note",
          createdAt: entry.createdAt || now,
          updatedAt: entry.updatedAt || entry.createdAt || now,
          text,
        });
      }
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      String(a.createdAt).localeCompare(String(b.createdAt)) || a.id.localeCompare(b.id),
  );
}

function isCursorPreviouslyStamp(entry) {
  const author = String(entry.author || "").toLowerCase();
  const body = String(entry.text || "").trim();
  return author === "cursor" && /^Previously (Failed|Conditional Pass)\./i.test(body);
}

for (const caseId of CASE_IDS) {
  const currentRes = runCommand(
    `SELECT case_id, note FROM test_case_status WHERE case_id = '${sqlEscape(caseId)}'`,
  );
  const current = currentRes?.[0]?.results?.[0];
  if (!current) {
    console.log(`skip missing ${caseId}`);
    continue;
  }

  const histRes = runCommand(
    `SELECT note FROM test_case_status_history WHERE case_id = '${sqlEscape(caseId)}' AND note IS NOT NULL AND TRIM(note) != '' ORDER BY changed_at DESC LIMIT 30`,
  );
  const histRows = histRes?.[0]?.results ?? [];

  const currentEntries = parseNotes(current.note);
  const histLists = histRows.map((r) => parseNotes(r.note));
  const merged = mergeById(currentEntries, ...histLists);

  if (merged.length === 0) {
    console.log(
      `skip empty ${caseId} (noteType=${typeof current.note}, hist=${histRows.length})`,
    );
    continue;
  }

  const beforeNonCursor = currentEntries.filter(
    (e) => String(e.author).toLowerCase() !== "cursor",
  ).length;
  const afterNonCursor = merged.filter((e) => String(e.author).toLowerCase() !== "cursor").length;

  if (JSON.stringify(merged) === JSON.stringify(currentEntries)) {
    console.log(`ok ${caseId}: already has ${merged.length} note(s)`);
    continue;
  }

  if (afterNonCursor < beforeNonCursor) {
    throw new Error(`${caseId}: refuse drop non-Cursor ${beforeNonCursor} → ${afterNonCursor}`);
  }

  const stamps = merged.filter(isCursorPreviouslyStamp);
  const withoutStamps = merged.filter((e) => !isCursorPreviouslyStamp(e));
  const finalEntries =
    stamps.length > 1 ? [...withoutStamps, stamps[stamps.length - 1]] : merged;

  const noteJson = JSON.stringify(finalEntries);
  runFile(`UPDATE test_case_status
SET note = '${sqlEscape(noteJson)}',
    updated_at = '${now}',
    updated_by = 'System (restore dropped QA notes)'
WHERE case_id = '${sqlEscape(caseId)}'`);

  const restoredQa = finalEntries.filter((e) => String(e.author).toLowerCase() !== "cursor");
  console.log(
    `restored ${caseId}: ${currentEntries.length} → ${finalEntries.length} (QA notes: ${restoredQa.length})`,
  );
  for (const e of restoredQa) {
    console.log(`  [${e.author}] ${e.text.slice(0, 140)}`);
  }
}

console.log("\nDone.");
