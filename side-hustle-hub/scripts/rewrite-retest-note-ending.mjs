/**
 * Rewrite latest Cursor "Previously…" notes to end with: <Tester>. please re-test.
 *
 *   node --use-system-ca scripts/rewrite-retest-note-ending.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseNotes } from "./_d1-remote.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);
const now = new Date().toISOString();

const CASES = [
  { caseId: "PROOF-047-TINA", qa: "Tina" },
  { caseId: "PROOF-049-TINA", qa: "Tina" },
  { caseId: "PROOF-050-TINA", qa: "Tina" },
  { caseId: "PROOF-051-LYRIQ", qa: "Lyriq" },
];

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function wranglerJson(args) {
  const r = spawnSync(process.execPath, ["--use-system-ca", wrangler, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || "wrangler failed");
  const start = r.stdout.indexOf("[");
  if (start < 0) throw new Error(`No JSON:\n${r.stdout.slice(0, 400)}`);
  return JSON.parse(r.stdout.slice(start));
}

function execFile(sql) {
  const dir = mkdtempSync(path.join(tmpdir(), "gysh-retest-"));
  const file = path.join(dir, "q.sql");
  writeFileSync(file, sql.endsWith(";") ? `${sql}\n` : `${sql};\n`, "utf8");
  try {
    const r = spawnSync(
      process.execPath,
      ["--use-system-ca", wrangler, "d1", "execute", "gysh-db", "--remote", "--file", file],
      { cwd: root, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
    );
    if (r.status !== 0) throw new Error(r.stderr || r.stdout || "exec failed");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function rewriteEnding(text, qa) {
  let t = String(text || "").trim();
  // Strip old endings: "Please re-test. Tina" / "Tina Please re-test." / "Tina. Please re-test."
  t = t
    .replace(/\s*Please re-test\.\s*[A-Za-z]+\.?\s*$/i, "")
    .replace(/\s*[A-Za-z]+\.?\s*please re-test\.?\s*$/i, "")
    .replace(/\s*Please re-test\.?\s*$/i, "")
    .trim();
  // Ensure sentence ends with punctuation before tester name.
  if (!/[.!?]$/.test(t)) t = `${t}.`;
  return `${t} ${qa}. please re-test.`;
}

for (const { caseId, qa } of CASES) {
  const row = wranglerJson([
    "d1",
    "execute",
    "gysh-db",
    "--remote",
    "--json",
    "--command",
    `SELECT note FROM test_case_status WHERE case_id = '${sqlEscape(caseId)}'`,
  ])?.[0]?.results?.[0];
  if (!row) {
    console.log(`skip missing ${caseId}`);
    continue;
  }
  const entries = parseNotes(row.note);
  let changed = false;
  const next = entries.map((e) => {
    if (String(e.author || "").toLowerCase() !== "cursor") return e;
    if (!/^Previously (Failed|Conditional Pass)\./i.test(String(e.text || "").trim())) return e;
    const rewritten = rewriteEnding(e.text, qa);
    if (rewritten === e.text) return e;
    changed = true;
    return { ...e, text: rewritten, updatedAt: now };
  });
  if (!changed) {
    console.log(`unchanged ${caseId}`);
    continue;
  }
  execFile(`
UPDATE test_case_status
SET note = '${sqlEscape(JSON.stringify(next))}',
    updated_at = '${now}',
    updated_by = 'Cursor'
WHERE case_id = '${sqlEscape(caseId)}'
`);
  const last = [...next].reverse().find((e) => String(e.author).toLowerCase() === "cursor");
  console.log(`${caseId}: …${String(last?.text || "").slice(-60)}`);
}

console.log("Done.");
