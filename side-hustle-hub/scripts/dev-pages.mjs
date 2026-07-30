/**
 * Local full-stack GYSH: Vite (HMR) + Wrangler Pages Functions + local D1.
 *
 * Browser: http://localhost:5173  (Vite proxies /api → Functions on :8788)
 * Direct API: http://127.0.0.1:8788/api/...
 *
 * Plain Vite alone does NOT serve functions/ — use this for login to work.
 * A Vite proxy with no worker on :8788 shows as HTTP 502 in the UI.
 */
import { spawn, spawnSync, execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

/** Load `.dev.vars` into the child env so Wrangler picks up Resend secrets even if a long-lived session is restarted. */
function loadDevVars() {
  const file = path.join(root, ".dev.vars");
  if (!existsSync(file)) {
    console.warn("⚠ No .dev.vars — local email/auth secrets will be missing.");
    return {};
  }
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i <= 0) continue;
    out[trimmed.slice(0, i)] = trimmed.slice(i + 1);
  }
  const key = (out.RESEND_API_KEY || "").trim();
  if (key.startsWith("re_")) {
    console.log(`✓ .dev.vars RESEND_API_KEY loaded (${key.slice(0, 6)}… len ${key.length})`);
  } else {
    console.warn("⚠ .dev.vars has no usable RESEND_API_KEY — reset emails will fail locally.");
  }
  return out;
}

const VITE_PORT = 5173;
const API_PORT = 8788;
const isWin = process.platform === "win32";

if (!existsSync(wrangler)) {
  console.error(`Wrangler not found at ${wrangler}`);
  console.error("Install wrangler in muntie-ev-ai-studio-main, or add wrangler as a devDependency here.");
  process.exit(1);
}

const children = [];

function killTree(pid) {
  if (!pid) return;
  try {
    if (isWin) {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGTERM");
    }
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* ignore */
    }
  }
}

function shutdown(code = 0) {
  for (const child of children) {
    killTree(child.pid);
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function portInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
      server.close(() => resolve(false));
    });
    server.listen(port, "127.0.0.1");
  });
}

function pidsOnPort(port) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!/LISTENING/i.test(line)) continue;
        const m = line.trim().match(/(\d+)\s*$/);
        if (m && m[1] !== "0") pids.add(m[1]);
      }
      return [...pids];
    }
    const out = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, { encoding: "utf8" });
    return out
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function freePort(port, label) {
  const pids = pidsOnPort(port);
  if (!pids.length) return;
  console.warn(`Port ${port} (${label}) in use by pid(s) ${pids.join(", ")} — freeing…`);
  for (const pid of pids) {
    killTree(Number(pid));
  }
}

const devVars = loadDevVars();

function spawnInherit(cmd, args, label, extraEnv = {}) {
  const child = spawn(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: isWin,
    env: { ...process.env, ...devVars, ...extraEnv },
    detached: !isWin,
  });
  child.on("exit", (code, signal) => {
    if (signal) return;
    console.error(`[${label}] exited with code ${code ?? 1}`);
    shutdown(code ?? 1);
  });
  children.push(child);
  return child;
}

function waitForHealth(timeoutMs = 90_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`http://127.0.0.1:${API_PORT}/api/health`, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      req.on("error", retry);
      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for http://127.0.0.1:${API_PORT}/api/health`));
        return;
      }
      setTimeout(tick, 500);
    };
    tick();
  });
}

console.log("GYSH local full-stack");
console.log(`  Functions + D1 → http://127.0.0.1:${API_PORT}`);
console.log(`  Vite UI       → http://localhost:${VITE_PORT}  (open this; /api is proxied)`);
console.log("");

const syncScript = path.join(root, "scripts", "sync-test-statuses-from-remote.mjs");
const syncTasksScript = path.join(root, "scripts", "sync-tasks-from-remote.mjs");
const syncAgendaScript = path.join(root, "scripts", "sync-agenda-from-remote.mjs");

function runProdD1Sync({ quiet = false, force = false } = {}) {
  const args = ["--use-system-ca", syncScript];
  if (quiet) args.push("--quiet");
  if (force) args.push("--force");
  return spawnSync(process.execPath, args, {
    cwd: root,
    stdio: quiet ? "pipe" : "inherit",
    env: process.env,
    encoding: "utf8",
  });
}

function runProdTasksSync({ quiet = false } = {}) {
  return spawnSync(process.execPath, ["--use-system-ca", syncTasksScript], {
    cwd: root,
    stdio: quiet ? "pipe" : "inherit",
    env: process.env,
    encoding: "utf8",
  });
}

function runProdAgendaSync({ quiet = false } = {}) {
  return spawnSync(process.execPath, ["--use-system-ca", syncAgendaScript], {
    cwd: root,
    stdio: quiet ? "pipe" : "inherit",
    env: process.env,
    encoding: "utf8",
  });
}

// Keep Testing Portal + Task List aligned with production on startup.
// Do NOT auto-overwrite time_entries (that was reverting local timesheet hours).
// Background re-sync is OFF by default so mid-session local work is not wiped.
if (process.env.GYSH_SKIP_D1_SYNC === "1") {
  console.warn("⚠ GYSH_SKIP_D1_SYNC=1 — skipping prod→local D1 sync.");
  console.warn("  Local pass/fail counts WILL diverge from production.");
} else {
  console.log("Syncing Testing Portal from prod D1 → local (startup)…");
  const sync = runProdD1Sync({ quiet: false });
  if (sync.status !== 0) {
    console.error("✗ Prod→local D1 sync failed.");
    console.error("  Fix network/wrangler auth, then: npm run db:sync-test-statuses");
    console.error("  Or set GYSH_SKIP_D1_SYNC=1 only if you intentionally want a local-only DB.");
    process.exit(sync.status ?? 1);
  }
  console.log("✓ Local Testing Portal statuses mirror production");
  console.log("Syncing tasks from prod D1 → local (startup)…");
  const taskSync = runProdTasksSync({ quiet: false });
  if (taskSync.status !== 0) {
    console.error("✗ Prod→local tasks sync failed.");
    console.error("  Fix network/wrangler auth, then: npm run db:sync-tasks");
    process.exit(taskSync.status ?? 1);
  }
  console.log("✓ Local tasks (incl. rollover notes) mirror production");
  console.log("Syncing partner agenda from prod D1 → local (startup)…");
  const agendaSync = runProdAgendaSync({ quiet: false });
  if (agendaSync.status !== 0) {
    console.error("✗ Prod→local agenda sync failed.");
    console.error("  Fix network/wrangler auth, then: npm run db:sync-agenda");
    process.exit(agendaSync.status ?? 1);
  }
  console.log("✓ Local Agenda mirrors production");
  console.log("  (timesheet hours are not overwritten — use GYSH_SYNC_TIME_ENTRIES=1 to pull prod hours)");
  console.log("");
}

freePort(API_PORT, "Pages Functions");
freePort(VITE_PORT, "Vite");
await new Promise((r) => setTimeout(r, 400));

if (await portInUse(API_PORT)) {
  console.error(`Port ${API_PORT} still busy after cleanup. Close the other process and retry.`);
  process.exit(1);
}
if (await portInUse(VITE_PORT)) {
  console.error(`Port ${VITE_PORT} still busy after cleanup. Close the other process and retry.`);
  process.exit(1);
}

// Serve public/ as static assets so Pages Functions load; Vite owns the real UI on 5173.
spawnInherit(
  "node",
  [
    "--use-system-ca",
    wrangler,
    "pages",
    "dev",
    "public",
    "--port",
    String(API_PORT),
    "--ip",
    "127.0.0.1",
    "--persist-to",
    ".wrangler/state",
    "--show-interactive-dev-session",
    "false",
  ],
  "wrangler",
);

try {
  await waitForHealth();
  console.log(`✓ Pages Functions ready on :${API_PORT}`);
} catch (err) {
  console.error(String(err?.message || err));
  console.error("Hint: run `npm run db:setup:local` once if D1 schema is missing.");
  shutdown(1);
}

spawnInherit("npx", ["vite", "--port", String(VITE_PORT), "--strictPort", "--host"], "vite");
console.log(`✓ Vite starting on :${VITE_PORT} — login uses proxied /api/auth/login`);

// Background re-sync OFF by default — periodic full replace was reverting local numbers
// while browsing. Opt in: GYSH_D1_SYNC_INTERVAL_MS=600000 (statuses only; not time_entries).
if (process.env.GYSH_SKIP_D1_SYNC !== "1") {
  const rawInterval = Number(process.env.GYSH_D1_SYNC_INTERVAL_MS);
  const intervalMs = Number.isFinite(rawInterval) ? rawInterval : 0;
  if (intervalMs >= 60_000) {
    console.log(
      `✓ Re-syncing Testing Portal statuses from prod every ${Math.round(intervalMs / 1000)}s`,
    );
    const timer = setInterval(() => {
      const sync = runProdD1Sync({ quiet: true });
      if (sync.status === 0) {
        const out = `${sync.stdout || ""}${sync.stderr || ""}`;
        if (/Already in sync/i.test(out)) return;
        console.log(`[d1-sync] Local Testing Portal refreshed from prod`);
      } else {
        console.warn(`[d1-sync] Background prod→local sync failed (status ${sync.status})`);
      }
    }, intervalMs);
    timer.unref?.();
  } else {
    console.log("✓ Startup D1 sync only (no background overwrite while you work).");
  }
}
