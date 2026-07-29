/**
 * Create PW-FAIL follow-up for PW-JOIN-002 (Contact form submit 502).
 * Usage: node --use-system-ca scripts/create-pw-join-002-fail-case.mjs [--local]
 */
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const wranglerJs = path.resolve(
  root,
  "../../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);
const local = process.argv.includes("--local");
const flags = local
  ? ["d1", "execute", "gysh-db", "--local", "--persist-to", ".wrangler/state", "--json"]
  : ["d1", "execute", "gysh-db", "--remote", "--json"];

function sqlEscape(s) {
  return String(s ?? "").replace(/'/g, "''");
}

function run(command) {
  const out = execFileSync(
    process.execPath,
    ["--use-system-ca", wranglerJs, ...flags, "--command", command],
    { cwd: path.resolve(root, ".."), encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out);
  if (parsed.error) throw new Error(JSON.stringify(parsed.error));
  return parsed;
}

const id = `PW-FAIL-${randomUUID().slice(0, 8)}`;
const now = new Date().toISOString();
const title = "FAIL: PW-JOIN-002 — Contact form submit returns 502";
const area = "Playwright Failure";
const priority = "P0";
const suite = "playwright";
const reproSteps = [
  "Open https://getyoursidehustle.com → Contact Us (header or footer).",
  "Fill Name, Email, and Message with valid values.",
  "Click Send message.",
  "Observe Request Failed (502) instead of a success confirmation.",
];
const fixSteps = [
  "Inspect /api contact (or form handler) Pages Function + Resend/email binding on production.",
  "Reproduce the 502 in Function logs; fix handler/env/timeout so submit returns 200.",
  "Re-test Contact form end-to-end; mark this case Pass when green.",
  "Optionally re-run Playwright smoke for PW-JOIN-002.",
];
const failureDetail = [
  "SEVERITY: P0",
  "WHY IT FAILED: Contact Us form submission fails in production with HTTP 502 (Request Failed).",
  "",
  "Source catalog case: PW-JOIN-002 (Contact signup form fields).",
  'QA note: The contacts don\'t actually go through. When you try to send a message it says "Request Failed (502)."',
].join("\n");
const note = [
  failureDetail,
  "",
  "STEPS TO REPRODUCE:",
  ...reproSteps.map((s, i) => `${i + 1}. ${s}`),
  "",
  "STEPS TO FIX:",
  ...fixSteps.map((s, i) => `${i + 1}. ${s}`),
].join("\n");

// New non-Kids/Youth failures → Backlog + Unassigned (empty assignee).
const sprint = -1;
const assignee = "";
const dueDate = "";

run(`CREATE TABLE IF NOT EXISTS generated_test_cases (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P1',
  suite TEXT NOT NULL DEFAULT 'vitest',
  steps_json TEXT NOT NULL DEFAULT '[]',
  expected TEXT NOT NULL DEFAULT '',
  failure_detail TEXT NOT NULL DEFAULT '',
  fix_steps_json TEXT NOT NULL DEFAULT '[]',
  severity TEXT NOT NULL DEFAULT 'P1',
  source_file TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  created_from_run TEXT NOT NULL DEFAULT ''
)`);

run(`INSERT INTO generated_test_cases (
  id, area, title, priority, suite, steps_json, expected, failure_detail, fix_steps_json,
  severity, source_file, created_at, created_from_run
) VALUES (
  '${sqlEscape(id)}',
  '${sqlEscape(area)}',
  '${sqlEscape(title)}',
  '${sqlEscape(priority)}',
  '${sqlEscape(suite)}',
  '${sqlEscape(JSON.stringify(reproSteps))}',
  'Contact form submits successfully without 502',
  '${sqlEscape(failureDetail)}',
  '${sqlEscape(JSON.stringify(fixSteps))}',
  '${sqlEscape(priority)}',
  'PW-JOIN-002',
  '${sqlEscape(now)}',
  'manual-pw-join-002-fail'
)`);

run(`INSERT INTO test_case_status (
  case_id, status, note, assignee, sprint, due_date, updated_at, updated_by, assigned_by, date_assigned
) VALUES (
  '${sqlEscape(id)}',
  'fail',
  '${sqlEscape(note)}',
  '${sqlEscape(assignee)}',
  ${sprint},
  '${sqlEscape(dueDate)}',
  '${sqlEscape(now)}',
  'system',
  'System',
  ''
)
ON CONFLICT(case_id) DO UPDATE SET
  status = excluded.status,
  note = excluded.note,
  assignee = excluded.assignee,
  sprint = excluded.sprint,
  due_date = excluded.due_date,
  updated_at = excluded.updated_at,
  updated_by = excluded.updated_by`);

const check = run(
  `SELECT case_id, status, sprint, assignee, substr(note,1,160) AS note FROM test_case_status WHERE case_id = '${sqlEscape(id)}'`,
);
console.log(JSON.stringify({ id, title, local, row: check?.[0]?.results?.[0] ?? check }, null, 2));
