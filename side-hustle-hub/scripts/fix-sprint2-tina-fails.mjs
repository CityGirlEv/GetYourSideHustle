/**
 * Mark Sprint 2 Tina (and related) fails as Fixed/Cursor after copy fixes.
 *
 *   node --use-system-ca scripts/fix-sprint2-tina-fails.mjs
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

const FIXES = [
  {
    caseId: "PROOF-047-TINA",
    qa: "Tina",
    assignee: "tina",
    fix:
      "Kids Guide §2 checklist item 4 now reads “Credits on paid plans fund activities — adults can redeem the credit pool for consulting at half rate.” (also flows into the Complete Guide).",
  },
  {
    caseId: "PROOF-049-TINA",
    qa: "Tina",
    assignee: "tina",
    fix:
      "Audience-guide Membership Perks yearly lines now use “$…/yr (2 Months Free w/Annual Payment)” — Seniors Starter shows $340/yr.",
  },
  {
    caseId: "PROOF-050-TINA",
    qa: "Tina",
    assignee: "tina",
    fix:
      "Audience-guide Membership Perks yearly lines now use “$…/yr (2 Months Free w/Annual Payment)” — Adult Starter shows $390/yr; Seniors keep senior yearly rates.",
  },
  {
    caseId: "PROOF-051-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix:
      "Removed default DRAFT watermark from marketing/member/audience guide PDFs (watermark is opt-in only; tentative Agenda PDFs still mark draft until finalized).",
  },
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
  if (r.status !== 0) {
    throw new Error(r.stderr || r.stdout || "wrangler failed");
  }
  const start = r.stdout.indexOf("[");
  if (start < 0) throw new Error(`No JSON:\n${r.stdout.slice(0, 400)}`);
  return JSON.parse(r.stdout.slice(start));
}

function select(sql) {
  return wranglerJson(["d1", "execute", "gysh-db", "--remote", "--json", "--command", sql]);
}

function execFile(sql) {
  const dir = mkdtempSync(path.join(tmpdir(), "gysh-fix-"));
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

function noteId() {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadMergedNotes(caseId) {
  const current = select(
    `SELECT case_id, note, original_assignee, assignee, status FROM test_case_status WHERE case_id = '${sqlEscape(caseId)}'`,
  )?.[0]?.results?.[0];
  if (!current) return null;
  const hist =
    select(
      `SELECT note FROM test_case_status_history WHERE case_id = '${sqlEscape(caseId)}' AND note IS NOT NULL AND TRIM(note) != '' ORDER BY changed_at DESC LIMIT 40`,
    )?.[0]?.results ?? [];
  const byId = new Map();
  for (const list of [parseNotes(current.note), ...hist.map((r) => parseNotes(r.note))]) {
    for (const e of list) {
      const eid = String(e.id || "").trim() || `legacy-${String(e.text).slice(0, 24)}`;
      const text = String(e.text ?? "").trim();
      if (!text) continue;
      if (!byId.has(eid)) {
        byId.set(eid, {
          id: eid,
          author: String(e.author || "Prior note").trim() || "Prior note",
          createdAt: e.createdAt || "1970-01-01T00:00:00.000Z",
          updatedAt: e.updatedAt || e.createdAt || "1970-01-01T00:00:00.000Z",
          text,
        });
      }
    }
  }
  const entries = [...byId.values()].sort(
    (a, b) =>
      String(a.createdAt).localeCompare(String(b.createdAt)) || a.id.localeCompare(b.id),
  );
  return { row: current, entries };
}

function upsertCursorNote(entries, text) {
  const nonCursorBefore = entries.filter(
    (e) => String(e.author || "").toLowerCase() !== "cursor",
  ).length;
  const preserved = entries.filter((e) => {
    const author = String(e.author || "").toLowerCase();
    const body = String(e.text || "");
    if (author !== "cursor") return true;
    return !/^Previously (Failed|Conditional Pass)\./i.test(body.trim());
  });
  preserved.push({
    id: noteId(),
    author: "Cursor",
    createdAt: now,
    updatedAt: now,
    text,
  });
  const nonCursorAfter = preserved.filter(
    (e) => String(e.author || "").toLowerCase() !== "cursor",
  ).length;
  if (nonCursorAfter < nonCursorBefore) {
    throw new Error(`Refusing note write (${nonCursorBefore} → ${nonCursorAfter})`);
  }
  return JSON.stringify(preserved);
}

for (const item of FIXES) {
  const loaded = loadMergedNotes(item.caseId);
  if (!loaded) {
    console.log(`skip missing ${item.caseId}`);
    continue;
  }
  const { row, entries } = loaded;
  const note = upsertCursorNote(
    entries,
    (() => {
      const body = String(item.fix || "").trim().replace(/[.!?]+$/, "");
      return `Previously Failed. ${body}. ${item.qa}. please re-test.`;
    })(),
  );
  const original =
    String(row.original_assignee || item.assignee || "").trim() || item.assignee;
  execFile(`
UPDATE test_case_status
SET status = 'fixed_cursor',
    note = '${sqlEscape(note)}',
    assignee = '${sqlEscape(item.assignee)}',
    original_assignee = '${sqlEscape(original)}',
    failed_step_index = NULL,
    checked_steps_json = '[]',
    updated_at = '${now}',
    updated_by = 'Cursor'
WHERE case_id = '${sqlEscape(item.caseId)}'
`);
  console.log(`fixed_cursor ← ${item.caseId} → ${item.assignee}`);
}

console.log("Done.");
