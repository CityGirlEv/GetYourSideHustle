#!/usr/bin/env node
/**
 * Run Vitest + Playwright with their JSON reporters and write the merged
 * pass/fail status for every test into `src/lib/automated-test-results.json`.
 *
 * The Testing Portal reads that file at build time (see
 * `src/lib/automated-tests.ts`) and pre-populates each automated test's
 * status so QA/Admin can see what last passed or failed in CI without
 * having to run the suites locally.
 *
 * Usage:  npm run test:record
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

// Mirror the id generation in src/lib/automated-tests.ts so keys line up.
function idSlug(s) {
  return s
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .toUpperCase();
}

function runNode(args, opts = {}) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    stdio: "inherit",
    ...opts,
  });
}

const tmp = mkdtempSync(join(tmpdir(), "test-record-"));
const out = {};

// ---------- Vitest ----------
const vitestOut = join(tmp, "vitest.json");
console.log("→ running vitest…");
runNode([
  join(root, "node_modules", "vitest", "vitest.mjs"),
  "run",
  "--reporter=json",
  `--outputFile=${vitestOut}`,
]);
try {
  const v = JSON.parse(readFileSync(vitestOut, "utf8"));
  for (const file of v.testResults ?? []) {
    const fname = basename(file.name || file.testFilePath || "");
    // Per-file 1-based ordering matches the parser in automated-tests.ts
    let idx = 0;
    for (const t of file.assertionResults ?? []) {
      idx += 1;
      const id = `UNIT-${idSlug(fname)}-${String(idx).padStart(2, "0")}`;
      out[id] = t.status === "passed" ? "pass" : t.status === "pending" ? "blocked" : "fail";
    }
  }
} catch (e) {
  console.warn("vitest results unavailable:", e?.message);
}

// ---------- Playwright ----------
const pwOut = join(tmp, "playwright.json");
console.log("→ running playwright…");
const pwEnv = { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: pwOut };
// Always use playwright.config webServer (vite preview on :4173), not a stale dev port.
delete pwEnv.E2E_BASE_URL;
delete pwEnv.E2E_NO_SERVER;
delete pwEnv.E2E_PORT;
const pwRun = runNode(
  [join(root, "node_modules", "playwright", "cli.js"), "test", "--reporter=json"],
  {
    env: pwEnv,
  },
);
if (pwRun.status !== 0) {
  console.warn(`playwright exited with code ${pwRun.status ?? "unknown"} (recording partial results)`);
}
try {
  if (!existsSync(pwOut)) {
    throw new Error("playwright JSON output missing — set PLAYWRIGHT_JSON_OUTPUT_NAME");
  }
  const p = JSON.parse(readFileSync(pwOut, "utf8"));
  /** Per-file index — must not reset across nested describe() blocks. */
  const e2eIdxByFile = new Map();

  function specStatus(spec) {
    const tests = spec.tests ?? [];
    if (tests.length === 0) return spec.ok === false ? "fail" : "pass";

    let sawSkip = false;
    let sawFail = false;
    for (const t of tests) {
      for (const r of t.results ?? []) {
        if (r.status === "skipped") {
          sawSkip = true;
          continue;
        }
        if (r.status === "passed" || r.status === "expected") continue;
        sawFail = true;
      }
    }
    if (sawFail || spec.ok === false) return sawSkip && !sawFail ? "blocked" : "fail";
    if (sawSkip) return "blocked";
    return "pass";
  }

  function walk(suite, fname) {
    const file = fname || basename(suite.file || "");
    for (const spec of suite.specs ?? []) {
      const idx = (e2eIdxByFile.get(file) ?? 0) + 1;
      e2eIdxByFile.set(file, idx);
      const id = `E2E-${idSlug(file)}-${String(idx).padStart(2, "0")}`;
      out[id] = specStatus(spec);
    }
    for (const child of suite.suites ?? []) walk(child, file);
  }
  for (const s of p.suites ?? []) walk(s);
} catch (e) {
  console.warn("playwright results unavailable:", e?.message);
}

writeFileSync(join(root, "src/lib/automated-test-results.json"), JSON.stringify(out, null, 2) + "\n");
rmSync(tmp, { recursive: true, force: true });
const unitN = Object.keys(out).filter((k) => k.startsWith("UNIT-")).length;
const e2eN = Object.keys(out).filter((k) => k.startsWith("E2E-")).length;
console.log(`✔ wrote ${Object.keys(out).length} results (${unitN} unit, ${e2eN} e2e) to src/lib/automated-test-results.json`);
