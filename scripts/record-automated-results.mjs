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
 * Usage:  bun run test:record
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";

// Mirror the id generation in src/lib/automated-tests.ts so keys line up.
function idSlug(s) {
  return s.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toUpperCase();
}

const tmp = mkdtempSync(join(tmpdir(), "test-record-"));
const out = {};

// ---------- Vitest ----------
const vitestOut = join(tmp, "vitest.json");
console.log("→ running vitest…");
spawnSync("bunx", ["vitest", "run", "--reporter=json", `--outputFile=${vitestOut}`], {
  stdio: "inherit",
});
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
spawnSync("bunx", ["playwright", "test", `--reporter=json`], {
  stdio: ["inherit", "pipe", "inherit"],
  env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: pwOut },
}).stdout && void 0; // reporter writes via env var
try {
  const p = JSON.parse(readFileSync(pwOut, "utf8"));
  function walk(suite, fname) {
    const file = fname || basename(suite.file || "");
    let idx = 0;
    for (const spec of suite.specs ?? []) {
      idx += 1;
      const id = `E2E-${idSlug(file)}-${String(idx).padStart(2, "0")}`;
      const ok = (spec.tests ?? []).every((t) =>
        (t.results ?? []).every((r) => r.status === "passed" || r.status === "expected"),
      );
      out[id] = ok ? "pass" : "fail";
    }
    for (const child of suite.suites ?? []) walk(child, file);
  }
  for (const s of p.suites ?? []) walk(s);
} catch (e) {
  console.warn("playwright results unavailable:", e?.message);
}

writeFileSync(
  "src/lib/automated-test-results.json",
  JSON.stringify(out, null, 2) + "\n",
);
rmSync(tmp, { recursive: true, force: true });
console.log(`✔ wrote ${Object.keys(out).length} results to src/lib/automated-test-results.json`);