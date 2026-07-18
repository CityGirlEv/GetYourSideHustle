/**
 * Run Vitest and write pass/fail results to remote (or local) D1.
 * Failures create generated_test_cases + test_case_status fail rows in the current sprint.
 *
 *   node --use-system-ca scripts/report-vitest-to-d1.mjs
 *   node --use-system-ca scripts/report-vitest-to-d1.mjs --local
 *   node --use-system-ca scripts/report-vitest-to-d1.mjs --mode=new
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);
const isLocal = process.argv.includes("--local");
const mode = (process.argv.find((a) => a.startsWith("--mode=")) || "--mode=all").split("=")[1];

const VT_CATALOG = [
  "VT-AUTH-001",
  "VT-JOIN-001",
  "VT-MEMBER-001",
  "VT-ROLE-001",
  "VT-PLAN-001",
  "VT-WIZARD-001",
  "VT-WORK-001",
  "VT-FIND-001",
];

const SPRINT_ZERO_START = new Date(2026, 6, 14);
function currentSprintIndex(ref = new Date()) {
  const d = new Date(ref);
  const day = d.getDay();
  const toTue = (day + 5) % 7;
  d.setDate(d.getDate() - toTue);
  d.setHours(0, 0, 0, 0);
  const base = new Date(SPRINT_ZERO_START);
  base.setHours(0, 0, 0, 0);
  const idx = Math.floor((d.getTime() - base.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, Math.min(7, idx));
}

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function d1(sql) {
  const args = [
    "--use-system-ca",
    wrangler,
    "d1",
    "execute",
    "gysh-db",
    isLocal ? "--local" : "--remote",
  ];
  if (isLocal) args.push("--persist-to", ".wrangler/state");
  args.push("--command", sql);
  const r = spawnSync("node", args, { cwd: root, encoding: "utf8", shell: false });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`D1 execute failed: ${sql.slice(0, 120)}`);
  }
  return r.stdout;
}

function severityFor(filePath, title) {
  const p = `${filePath} ${title}`.toLowerCase();
  if (p.includes("auth") || p.includes("wizard") || p.includes("role") || p.includes("member")) return "P0";
  if (p.includes("plan") || p.includes("find") || p.includes("sprint")) return "P1";
  return "P2";
}

console.log(`Running Vitest (mode=${mode}, ${isLocal ? "local" : "remote"} D1)…`);
const jsonOut = path.join(os.tmpdir(), `gysh-vitest-${Date.now()}.json`);
const vitest = spawnSync(
  "npx",
  ["vitest", "run", "--reporter=json", `--outputFile=${jsonOut}`],
  { cwd: root, encoding: "utf8", shell: true },
);

let report = null;
if (fs.existsSync(jsonOut)) {
  try {
    report = JSON.parse(fs.readFileSync(jsonOut, "utf8"));
  } catch {
    report = null;
  }
}

const sprint = currentSprintIndex();
const now = new Date().toISOString();
const passed = vitest.status === 0;
const failTests = [];

if (report?.testResults) {
  for (const file of report.testResults) {
    const filePath = file.name || file.assertionResults?.[0]?.ancestorTitles?.[0] || "unknown";
    for (const t of file.assertionResults || []) {
      if (t.status === "failed" || t.status === "fail") {
        failTests.push({
          file: filePath,
          title: [...(t.ancestorTitles || []), t.title || t.fullName].filter(Boolean).join(" › "),
          message: (t.failureMessages || []).join("\n").slice(0, 2500) || "Assertion failed",
        });
      }
    }
  }
}

const numPassed = Number(report?.numPassedTests ?? 0);
const numFailed = Number(report?.numFailedTests ?? failTests.length);
const numTotal = Number(report?.numTotalTests ?? numPassed + numFailed);
const numFiles = Number(report?.numPassedTestSuites ?? report?.numTotalTestSuites ?? 0);

const lastRunPath = path.join(root, "src", "lib", "vitest-last-run.json");
fs.writeFileSync(
  lastRunPath,
  `${JSON.stringify(
    {
      passed: numPassed,
      failed: numFailed,
      total: numTotal,
      files: numFiles,
      at: now,
      ok: passed,
    },
    null,
    2,
  )}\n`,
);
console.log(passed ? `Vitest PASSED (${numPassed}/${numTotal} tests)` : `Vitest FAILED (${numPassed}/${numTotal})`);
console.log(`Wrote ${path.relative(root, lastRunPath)}`);
console.log(`Failures to file: ${failTests.length}`);

// Ensure generated table exists
d1(`CREATE TABLE IF NOT EXISTS generated_test_cases (
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

const notePass = `Full suite npm run test:unit passed ${now}. Reporter synced statuses.`;
for (const id of VT_CATALOG) {
  if (mode === "new") {
    // Only touch not_run / missing — skip if already pass/fail/blocked
    const check = d1(`SELECT status FROM test_case_status WHERE case_id='${esc(id)}' LIMIT 1`);
    if (check.includes('"pass"') || check.includes('"fail"') || check.includes('"blocked"') || check.includes('"in_progress"')) {
      continue;
    }
  }
  const status = passed ? "pass" : "fail";
  const note = passed
    ? notePass
    : `Full suite failed ${now}. See VT-FAIL-* cases for details.`;
  d1(
    `INSERT INTO test_case_status (case_id, status, note, assignee, sprint, updated_at, updated_by)
     VALUES ('${esc(id)}', '${status}', '${esc(note)}', 'vitest', ${sprint}, '${now}', 'vitest-reporter')
     ON CONFLICT(case_id) DO UPDATE SET
       status=excluded.status, note=excluded.note, assignee='vitest', sprint=${sprint},
       updated_at=excluded.updated_at, updated_by=excluded.updated_by`,
  );
}

// Update existing wizard matrix rows
d1(
  `UPDATE test_case_status
   SET status='${passed ? "pass" : "fail"}',
       note='${esc(passed ? "Covered by npm run test:unit (wizard matrix)." : "Wizard coverage failed with suite — see VT-FAIL cases.")}',
       assignee='vitest', sprint=${sprint}, updated_at='${now}', updated_by='vitest-reporter'
   WHERE case_id LIKE 'KIDS-FMSH-%' OR case_id LIKE 'JR-FMSH-%'
      OR case_id LIKE 'ADULT-FMSH-%' OR case_id LIKE 'SENIOR-FMSH-%'
      OR case_id LIKE 'WIZARD-EDGE-%'`,
);

for (const fail of failTests) {
  const sev = severityFor(fail.file, fail.title);
  const id = `VT-FAIL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const steps = [
    "Open GYSH repo (side-hustle-hub).",
    "Run: npm run test:unit",
    `Reproduce failing test: ${fail.title}`,
    `Source: ${fail.file}`,
  ];
  const fixSteps = [
    "Read the failure message and stack below.",
    "Open the source file from Source and locate the assertion.",
    "Fix production code or update the test expectation if product behavior changed intentionally.",
    "Re-run: npm run test:unit (or Testing Portal → Run Vitest for new/failed).",
    "Mark this case Pass once green; leave Fail with an updated note if still broken.",
  ];
  const detail = [
    `SEVERITY: ${sev}`,
    `WHY IT FAILED: Vitest assertion/error while running the unit suite.`,
    `TEST: ${fail.title}`,
    `FILE: ${fail.file}`,
    "",
    "FAILURE OUTPUT:",
    fail.message,
  ].join("\n");

  d1(
    `INSERT INTO generated_test_cases (
      id, area, title, priority, suite, steps_json, expected, failure_detail, fix_steps_json,
      severity, source_file, created_at, created_from_run
    ) VALUES (
      '${esc(id)}', 'Vitest Failure', '${esc(`FAIL: ${fail.title}`.slice(0, 180))}', '${sev}', 'vitest',
      '${esc(JSON.stringify(steps))}', 'Test passes with no assertion errors',
      '${esc(detail)}', '${esc(JSON.stringify(fixSteps))}', '${sev}', '${esc(fail.file)}',
      '${now}', 'vitest-reporter'
    )`,
  );

  const statusNote = [
    detail,
    "",
    "STEPS TO REPRODUCE:",
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "STEPS TO FIX:",
    ...fixSteps.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");

  d1(
    `INSERT INTO test_case_status (case_id, status, note, assignee, sprint, updated_at, updated_by)
     VALUES ('${esc(id)}', 'fail', '${esc(statusNote)}', 'vitest', ${sprint}, '${now}', 'vitest-reporter')
     ON CONFLICT(case_id) DO UPDATE SET
       status='fail', note=excluded.note, assignee='vitest', sprint=${sprint},
       updated_at=excluded.updated_at, updated_by=excluded.updated_by`,
  );
  console.log(`Created failure case ${id} (${sev}) in sprint ${sprint}`);
}

try {
  fs.unlinkSync(jsonOut);
} catch {
  /* ignore */
}

console.log(`Done. Sprint ${sprint}. Catalog VT cases synced. Failures created: ${failTests.length}`);
process.exit(passed ? 0 : 1);
