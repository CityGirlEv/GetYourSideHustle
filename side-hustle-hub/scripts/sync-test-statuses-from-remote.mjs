/**
 * Mirror Testing Portal D1 tables from remote (prod) → local (full replace).
 * Keeps Evelyn/Tina/Lyriq pass counts identical to production.
 *
 *   npm run db:sync-test-statuses
 *   npm run db:sync-from-prod
 *
 * Timesheet (`time_entries`) is NOT overwritten unless you opt in — auto-sync was
 * wiping local hours every few minutes and “reverting” totals back to prod.
 *
 *   GYSH_SYNC_TIME_ENTRIES=1 npm run db:sync-from-prod
 *   npm run db:sync-from-prod -- --time
 *
 * Also runs at the start of `npm run dev` (skip with GYSH_SKIP_D1_SYNC=1).
 *
 * Flags:
 *   --force   replace even when fingerprint matches
 *   --quiet   less progress output (for background sync)
 *   --time    also replace local time_entries from prod
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);
const stampPath = path.join(root, ".wrangler", "gysh-d1-sync-stamp.json");
const force = process.argv.includes("--force");
const quiet = process.argv.includes("--quiet");
const syncTimeEntries =
  process.argv.includes("--time") || process.env.GYSH_SYNC_TIME_ENTRIES === "1";

function log(...args) {
  if (!quiet) console.log(...args);
}

function wranglerD1(args) {
  const result = spawnSync(
    process.execPath,
    ["--use-system-ca", wrangler, "d1", "execute", "gysh-db", ...args],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || "wrangler failed");
    process.exit(result.status ?? 1);
  }
  return result.stdout || "";
}

function localD1(args) {
  return wranglerD1(["--local", "--persist-to", ".wrangler/state", ...args]);
}

function parseJsonResults(stdout) {
  const start = stdout.indexOf("[");
  if (start < 0) throw new Error(`No JSON array in wrangler output:\n${stdout.slice(0, 400)}`);
  const parsed = JSON.parse(stdout.slice(start));
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((b) => b?.results ?? []);
}

function sqlEscape(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function runSqlFile(sql) {
  const dir = mkdtempSync(path.join(tmpdir(), "gysh-sync-"));
  const file = path.join(dir, "batch.sql");
  try {
    writeFileSync(file, sql, "utf8");
    localD1(["--file", file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function chunkedApply(rows, toSql, label, chunkSize = 80) {
  if (rows.length === 0) {
    log(`  ${label}: 0 rows`);
    return;
  }
  for (let i = 0; i < rows.length; i += chunkSize) {
    const slice = rows.slice(i, i + chunkSize);
    runSqlFile(slice.map(toSql).join("\n"));
    if (!quiet) {
      process.stdout.write(`\r  ${label}: ${Math.min(i + slice.length, rows.length)}/${rows.length}`);
    }
  }
  if (!quiet) process.stdout.write("\n");
}

function fingerprintFromRows(rows) {
  /** Count every status — Fail→Fixed/Cursor must not look identical to an older Fail snapshot. */
  const byStatus = new Map();
  let maxUpdated = "";
  for (const r of rows) {
    const st = String(r.status || "not_run");
    byStatus.set(st, (byStatus.get(st) ?? 0) + 1);
    const u = String(r.updated_at ?? "");
    if (u > maxUpdated) maxUpdated = u;
  }
  const statusPart = [...byStatus.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([st, n]) => `${st}=${n}`)
    .join(",");
  return `${rows.length}:${statusPart}:${maxUpdated}`;
}

function statusInsertSql(r) {
  const failed =
    r.failed_step_index === null || r.failed_step_index === undefined || r.failed_step_index === ""
      ? "NULL"
      : String(Number(r.failed_step_index));
  return `INSERT INTO test_case_status
    (case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
     assigned_by, date_assigned, original_assignee, updated_at, updated_by)
    VALUES (
      '${sqlEscape(r.case_id)}',
      '${sqlEscape(r.status)}',
      '${sqlEscape(r.note)}',
      '${sqlEscape(r.assignee)}',
      ${Number.isFinite(Number(r.sprint)) ? Number(r.sprint) : 0},
      '${sqlEscape(r.due_date ?? "")}',
      '${sqlEscape(r.checked_steps_json ?? "[]")}',
      ${failed},
      '${sqlEscape(r.assigned_by ?? "System")}',
      '${sqlEscape(r.date_assigned ?? "")}',
      '${sqlEscape(r.original_assignee ?? "")}',
      '${sqlEscape(r.updated_at ?? "")}',
      '${sqlEscape(r.updated_by ?? "")}'
    );`;
}

function generatedInsertSql(r) {
  return `INSERT INTO generated_test_cases
    (id, area, title, priority, suite, steps_json, expected, failure_detail,
     fix_steps_json, severity, source_file, created_at, created_from_run)
    VALUES (
      '${sqlEscape(r.id)}',
      '${sqlEscape(r.area)}',
      '${sqlEscape(r.title)}',
      '${sqlEscape(r.priority ?? "P1")}',
      '${sqlEscape(r.suite ?? "vitest")}',
      '${sqlEscape(r.steps_json ?? "[]")}',
      '${sqlEscape(r.expected ?? "")}',
      '${sqlEscape(r.failure_detail ?? "")}',
      '${sqlEscape(r.fix_steps_json ?? "[]")}',
      '${sqlEscape(r.severity ?? "P1")}',
      '${sqlEscape(r.source_file ?? "")}',
      '${sqlEscape(r.created_at ?? "")}',
      '${sqlEscape(r.created_from_run ?? "")}'
    );`;
}

function closedInsertSql(r) {
  return `INSERT INTO closed_sprints (sprint_index, closed_at, closed_by) VALUES (
    ${Number(r.sprint_index)},
    '${sqlEscape(r.closed_at ?? "")}',
    '${sqlEscape(r.closed_by ?? "")}'
  );`;
}

function timeEntryInsertSql(r) {
  const ended =
    r.ended_at === null || r.ended_at === undefined || r.ended_at === ""
      ? "NULL"
      : `'${sqlEscape(r.ended_at)}'`;
  const running =
    r.running_since === null || r.running_since === undefined || r.running_since === ""
      ? "NULL"
      : `'${sqlEscape(r.running_since)}'`;
  return `INSERT INTO time_entries
    (id, user_id, user_email, user_name, source, source_id, source_label,
     status, started_at, ended_at, accumulated_ms, running_since, work_date, created_at, updated_at)
    VALUES (
      '${sqlEscape(r.id)}',
      '${sqlEscape(r.user_id)}',
      '${sqlEscape(r.user_email)}',
      '${sqlEscape(r.user_name ?? "")}',
      '${sqlEscape(r.source)}',
      '${sqlEscape(r.source_id)}',
      '${sqlEscape(r.source_label ?? "")}',
      '${sqlEscape(r.status)}',
      '${sqlEscape(r.started_at)}',
      ${ended},
      ${Number(r.accumulated_ms) || 0},
      ${running},
      '${sqlEscape(r.work_date)}',
      '${sqlEscape(r.created_at ?? "")}',
      '${sqlEscape(r.updated_at ?? "")}'
    );`;
}

function timeEntriesFingerprint(rows) {
  let maxUpdated = "";
  const byUser = new Map();
  for (const r of rows) {
    const id = String(r.user_id || "?");
    byUser.set(id, (byUser.get(id) ?? 0) + 1);
    const u = String(r.updated_at ?? "");
    if (u > maxUpdated) maxUpdated = u;
  }
  const users = [...byUser.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, n]) => `${id}=${n}`)
    .join(",");
  return `${rows.length}:${users}:${maxUpdated}`;
}

function ensureTimeEntriesTableLocal() {
  runSqlFile(`
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_label TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  accumulated_ms INTEGER NOT NULL DEFAULT 0,
  running_since TEXT,
  work_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, work_date);
`);
}

function readStamp() {
  try {
    if (!existsSync(stampPath)) return null;
    return JSON.parse(readFileSync(stampPath, "utf8"));
  } catch {
    return null;
  }
}

function writeStamp(stamp) {
  mkdirSync(path.dirname(stampPath), { recursive: true });
  writeFileSync(
    stampPath,
    JSON.stringify({ ...stamp, syncedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

/** Lightweight remote-only fingerprint — does not touch local SQLite (safe while API runs). */
function remoteStatusFingerprint() {
  const rows = parseJsonResults(
    wranglerD1([
      "--remote",
      "--json",
      "--command",
      `SELECT status, COUNT(*) AS n, MAX(updated_at) AS max_u FROM test_case_status GROUP BY status`,
    ]),
  );
  const part = rows
    .map((r) => `${r.status}=${r.n}`)
    .sort()
    .join(",");
  const maxU = rows.reduce((m, r) => (String(r.max_u || "") > m ? String(r.max_u) : m), "");
  const n = rows.reduce((s, r) => s + Number(r.n || 0), 0);
  return `${n}:${part}:${maxU}`;
}

function remoteTimeFingerprint() {
  const rows = parseJsonResults(
    wranglerD1([
      "--remote",
      "--json",
      "--command",
      `SELECT user_id, COUNT(*) AS n, MAX(updated_at) AS max_u FROM time_entries GROUP BY user_id`,
    ]),
  );
  const part = rows
    .map((r) => `${r.user_id}=${r.n}`)
    .sort()
    .join(",");
  const maxU = rows.reduce((m, r) => (String(r.max_u || "") > m ? String(r.max_u) : m), "");
  const n = rows.reduce((s, r) => s + Number(r.n || 0), 0);
  return `${n}:${part}:${maxU}`;
}

function syncTimeEntriesFromRemote() {
  ensureTimeEntriesTableLocal();
  let remoteRows = [];
  try {
    const out = wranglerD1([
      "--remote",
      "--json",
      "--command",
      `SELECT id, user_id, user_email, user_name, source, source_id, source_label,
              status, started_at, ended_at, accumulated_ms, running_since, work_date,
              created_at, updated_at
       FROM time_entries
       ORDER BY work_date ASC, started_at ASC`,
    ]);
    remoteRows = parseJsonResults(out);
  } catch (e) {
    log(`  time_entries: skip (remote query failed: ${e?.message || e})`);
    return remoteTimeFingerprint();
  }

  log(`  time_entries: replacing local with full prod history (${remoteRows.length} rows)`);
  runSqlFile(`DELETE FROM time_entries;`);
  chunkedApply(remoteRows, timeEntryInsertSql, "time_entries");
  return timeEntriesFingerprint(remoteRows);
}

function printTesterCounts(label) {
  const verify = localD1([
    "--json",
    "--command",
    `SELECT lower(assignee) AS a,
            SUM(CASE WHEN status='pass' THEN 1 ELSE 0 END) AS passed,
            COUNT(*) AS total
     FROM test_case_status
     WHERE lower(assignee) IN ('tina','evelyn','lyriq')
     GROUP BY lower(assignee)
     ORDER BY a;`,
  ]);
  log(`${label}:`);
  for (const row of parseJsonResults(verify)) {
    log(`  ${row.a}: ${row.passed}/${row.total} passed`);
  }
}

log(
  syncTimeEntries
    ? "Syncing Testing Portal + timesheet: prod D1 → local…"
    : "Syncing Testing Portal: prod D1 → local… (time_entries left alone)",
);

const remoteStatusFp = remoteStatusFingerprint();
let remoteTimeFp = "";
if (syncTimeEntries) {
  try {
    remoteTimeFp = remoteTimeFingerprint();
  } catch (e) {
    log(`  time_entries fingerprint unavailable: ${e?.message || e}`);
  }
}

const stamp = readStamp();
const statusesMatch = !force && stamp?.statusFp === remoteStatusFp;
const timeMatch =
  !syncTimeEntries ||
  (!force && !!stamp?.timeFp && !!remoteTimeFp && stamp.timeFp === remoteTimeFp);

if (statusesMatch && timeMatch) {
  log(
    syncTimeEntries
      ? "Already in sync with prod (statuses + time history)."
      : "Already in sync with prod (test statuses).",
  );
  process.exit(0);
}

const needStatuses = force || !stamp || stamp.statusFp !== remoteStatusFp;
const needTime =
  syncTimeEntries && (force || !stamp || !remoteTimeFp || stamp.timeFp !== remoteTimeFp);

if (needStatuses) {
  const statusOut = wranglerD1([
    "--remote",
    "--json",
    "--command",
    `SELECT case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
            assigned_by, date_assigned, original_assignee, updated_at, updated_by
     FROM test_case_status`,
  ]);
  const statusRows = parseJsonResults(statusOut);
  if (statusRows.length === 0) {
    console.error("No test_case_status rows from remote — aborting.");
    process.exit(1);
  }

  const generatedOut = wranglerD1([
    "--remote",
    "--json",
    "--command",
    `SELECT id, area, title, priority, suite, steps_json, expected, failure_detail,
            fix_steps_json, severity, source_file, created_at, created_from_run
     FROM generated_test_cases`,
  ]);
  const generatedRows = parseJsonResults(generatedOut);

  const closedOut = wranglerD1([
    "--remote",
    "--json",
    "--command",
    `SELECT sprint_index, closed_at, closed_by FROM closed_sprints`,
  ]);
  const closedRows = parseJsonResults(closedOut);

  log(
    `Remote: ${statusRows.length} statuses, ${generatedRows.length} generated, ${closedRows.length} closed sprints`,
  );
  if (stamp?.statusFp) log(`Statuses stale (${stamp.statusFp} → ${remoteStatusFp})`);

  runSqlFile(`
DELETE FROM test_case_status;
DELETE FROM generated_test_cases;
DELETE FROM closed_sprints;
`);

  chunkedApply(statusRows, statusInsertSql, "test_case_status");
  chunkedApply(generatedRows, generatedInsertSql, "generated_test_cases");
  chunkedApply(closedRows, closedInsertSql, "closed_sprints", 50);
  printTesterCounts("Local tester pass/total (mirrors prod)");
} else {
  log("Test statuses already match prod stamp.");
}

let appliedTimeFp = stamp?.timeFp || "";
if (needTime) {
  log("Syncing full time_entries history (beginning → now)…");
  appliedTimeFp = syncTimeEntriesFromRemote();
} else if (syncTimeEntries) {
  log("time_entries already match prod stamp.");
  appliedTimeFp = stamp?.timeFp || remoteTimeFp;
} else {
  log("time_entries: skipped (pass --time or GYSH_SYNC_TIME_ENTRIES=1 to overwrite from prod).");
  appliedTimeFp = stamp?.timeFp || "";
}

writeStamp({
  statusFp: remoteStatusFp,
  timeFp: appliedTimeFp,
  timeSyncEnabled: syncTimeEntries,
});
log("Done.");
