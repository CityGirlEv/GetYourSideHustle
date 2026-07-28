/**
 * Ensure Sprint 0 + Sprint 1 are closed/locked on remote (and optionally local) D1.
 *
 *   node --use-system-ca scripts/close-sprints-remote.mjs
 *   node --use-system-ca scripts/close-sprints-remote.mjs --local-too
 */
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = join(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);
const localToo = process.argv.includes("--local-too");
const now = new Date().toISOString();
const closedBy = "Evelyn";

function wranglerD1(args) {
  if (!existsSync(wrangler)) {
    throw new Error(`Wrangler not found at ${wrangler}`);
  }
  const result = spawnSync(
    process.execPath,
    ["--use-system-ca", wrangler, "d1", "execute", "gysh-db", ...args],
    {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "wrangler failed");
  }
  return result.stdout || "";
}

function runCommand(extraArgs, sql) {
  const out = wranglerD1([...extraArgs, "--json", "--command", sql]);
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error(`No JSON:\n${out.slice(0, 400)}`);
  return JSON.parse(out.slice(start, end + 1))?.[0]?.results ?? [];
}

function runFile(extraArgs, sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-close-"));
  const file = join(dir, "q.sql");
  writeFileSync(file, sql.endsWith(";") ? sql : `${sql};`, "utf8");
  try {
    wranglerD1([...extraArgs, "--file", file]);
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function ensureClosed(extraArgs, label) {
  console.log(`\n=== ${label} ===`);
  runFile(
    extraArgs,
    `CREATE TABLE IF NOT EXISTS closed_sprints (
      sprint_index INTEGER PRIMARY KEY,
      closed_at TEXT NOT NULL,
      closed_by TEXT NOT NULL DEFAULT ''
    )`,
  );

  const before = runCommand(
    extraArgs,
    "SELECT sprint_index, closed_at, closed_by FROM closed_sprints ORDER BY sprint_index",
  );
  console.log("before", before);

  for (const sprint of [0, 1]) {
    runFile(
      extraArgs,
      `INSERT INTO closed_sprints (sprint_index, closed_at, closed_by)
       VALUES (${sprint}, '${now}', '${closedBy}')
       ON CONFLICT(sprint_index) DO NOTHING`,
    );
  }

  const after = runCommand(
    extraArgs,
    "SELECT sprint_index, closed_at, closed_by FROM closed_sprints ORDER BY sprint_index",
  );
  console.log("after", after);
}

ensureClosed(["--remote"], "REMOTE prod");
if (localToo) {
  ensureClosed(["--local", "--persist-to", ".wrangler/state"], "LOCAL");
}
console.log("\nDone — Sprint 0 + Sprint 1 locked.");
