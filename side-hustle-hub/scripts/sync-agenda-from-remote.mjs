/**
 * Mirror partner agenda tables from remote (prod) → local D1.
 * Replaces local agenda / items / time picks / availability so Admin → Agenda matches prod.
 *
 *   node --use-system-ca scripts/sync-agenda-from-remote.mjs
 *   npm run db:sync-agenda
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

function wranglerD1(args, { allowFail = false } = {}) {
  const result = spawnSync(
    process.execPath,
    ["--use-system-ca", wrangler, "d1", "execute", "gysh-db", ...args],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    if (allowFail) return result.stdout || result.stderr || "";
    console.error(result.stderr || result.stdout || "wrangler failed");
    process.exit(result.status ?? 1);
  }
  return result.stdout || "";
}

function localD1(args, opts) {
  return wranglerD1(["--local", "--persist-to", ".wrangler/state", ...args], opts);
}

function remoteD1(args, opts) {
  return wranglerD1(["--remote", ...args], opts);
}

/** Parse wrangler --json even when row values contain `]`. */
function parseJsonResults(stdout) {
  const start = stdout.indexOf("[");
  if (start < 0) throw new Error(`No JSON array in wrangler output:\n${stdout.slice(0, 400)}`);
  let end = stdout.length;
  while (end > start) {
    try {
      const parsed = JSON.parse(stdout.slice(start, end));
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((b) => b?.results ?? []);
    } catch {
      const prev = stdout.lastIndexOf("]", end - 1);
      if (prev < start) break;
      end = prev + 1;
    }
  }
  throw new Error(`Could not parse wrangler JSON:\n${stdout.slice(0, 400)}`);
}

function sqlEscape(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runSqlFile(sql) {
  const dir = mkdtempSync(path.join(tmpdir(), "gysh-sync-agenda-"));
  const file = path.join(dir, "batch.sql");
  try {
    writeFileSync(file, sql, "utf8");
    localD1(["--file", file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function ensureLocalSchema() {
  console.log("Ensuring local agenda tables…");
  // Avoid `d1 migrations apply` here — local D1 can already have columns while
  // migration history lags, which fails on duplicate column. Mirror runtime DDL.
  runSqlFile(`
CREATE TABLE IF NOT EXISTS partner_agenda (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Partner Meeting Agenda',
  active INTEGER NOT NULL DEFAULT 1,
  created_by_user_id TEXT NOT NULL DEFAULT '',
  created_by_name TEXT NOT NULL DEFAULT '',
  invite_sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS partner_agenda_items (
  id TEXT PRIMARY KEY,
  agenda_id TEXT NOT NULL,
  body TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  source_kind TEXT NOT NULL DEFAULT 'user',
  source_id TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS partner_agenda_time_picks (
  id TEXT PRIMARY KEY,
  agenda_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  starts_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS partner_agenda_availability (
  agenda_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'preferred',
  excluded_dates TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (agenda_id, user_id)
);
`);
  for (const sql of [
    `ALTER TABLE partner_agenda ADD COLUMN meeting_date TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN meeting_time TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN invited_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda ADD COLUMN attended_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN source_kind TEXT NOT NULL DEFAULT 'user'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN source_id TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN importance INTEGER NOT NULL DEFAULT 3`,
    `ALTER TABLE partner_agenda_items ADD COLUMN discussion_notes TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda_items ADD COLUMN action_items_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN questions_json TEXT NOT NULL DEFAULT '[]'`,
  ]) {
    localD1(["--command", sql], { allowFail: true });
  }
}

function insertRows(table, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const chunkSize = 40;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const slice = rows.slice(i, i + chunkSize);
    const sql = slice
      .map((r) => {
        const values = cols.map((c) => sqlEscape(r[c])).join(", ");
        return `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${values});`;
      })
      .join("\n");
    runSqlFile(sql);
  }
}

function fetchRemote(table) {
  try {
    return parseJsonResults(remoteD1(["--json", "--command", `SELECT * FROM ${table}`]));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/no such table/i.test(msg)) {
      console.warn(`  (remote ${table} missing — skipping)`);
      return [];
    }
    throw e;
  }
}

console.log("Syncing partner agenda: prod D1 → local…");
ensureLocalSchema();

const agenda = fetchRemote("partner_agenda");
const items = fetchRemote("partner_agenda_items");
const picks = fetchRemote("partner_agenda_time_picks");
let availability = [];
try {
  availability = fetchRemote("partner_agenda_availability");
} catch {
  availability = [];
}

console.log(
  `  remote: agenda=${agenda.length} items=${items.length} picks=${picks.length} availability=${availability.length}`,
);

// Full replace so local deletions match prod.
runSqlFile(`
PRAGMA foreign_keys = OFF;
DELETE FROM partner_agenda_time_picks;
DELETE FROM partner_agenda_availability;
DELETE FROM partner_agenda_items;
DELETE FROM partner_agenda;
PRAGMA foreign_keys = ON;
`);

insertRows("partner_agenda", agenda);
insertRows("partner_agenda_items", items);
insertRows("partner_agenda_time_picks", picks);
if (availability.length) insertRows("partner_agenda_availability", availability);

const verify = parseJsonResults(
  localD1([
    "--json",
    "--command",
    `SELECT
       (SELECT COUNT(*) FROM partner_agenda) AS agendas,
       (SELECT COUNT(*) FROM partner_agenda_items) AS items,
       (SELECT COUNT(*) FROM partner_agenda_time_picks) AS picks`,
  ]),
)?.[0];

console.log({
  local_agendas: verify?.agendas,
  local_items: verify?.items,
  local_picks: verify?.picks,
});
console.log("Done. Refresh Admin → Agenda (hard refresh if needed).");
