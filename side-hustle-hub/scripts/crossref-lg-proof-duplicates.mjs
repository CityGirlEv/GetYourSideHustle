/**
 * Mark Review Launch Guide tasks done when matching Proofread Launch Guide
 * tests have passed; align task sprint to the tests' sprint; append
 * duplicate/cross-reference notes on both task and test.
 *
 * Does NOT change any test statuses.
 *
 * Usage:
 *   node --use-system-ca scripts/crossref-lg-proof-duplicates.mjs --local
 *   node --use-system-ca scripts/crossref-lg-proof-duplicates.mjs --remote
 *   node --use-system-ca scripts/crossref-lg-proof-duplicates.mjs --local --remote
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));

// Load catalog via vite-node-compatible dynamic import of built mapping from source.
const { LAUNCH_GUIDES } = await import("../src/lib/launch-guides.ts");
const { PROOFREAD_CASES } = await import("../src/lib/gysh-proofread-cases.ts");
const { appendActorNote } = await import("../src/lib/gysh-note-entries.ts");

const args = new Set(process.argv.slice(2));
/** Default local; pass --remote and/or --local explicitly. */
const finalTargets = [];
if (args.has("--local") || !args.has("--remote")) finalTargets.push("local");
if (args.has("--remote")) finalTargets.push("remote");

const AUTHOR = "System";
const nowIso = new Date().toISOString();
const completedDate = (() => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
})();

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function wranglerBin() {
  try {
    return require.resolve("wrangler/bin/wrangler.js");
  } catch {
    return join(root, "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js");
  }
}

function d1Select(target, sql) {
  const args =
    target === "remote"
      ? ["d1", "execute", "gysh-db", "--remote", "--json", "--command", sql]
      : [
          "d1",
          "execute",
          "gysh-db",
          "--local",
          "--persist-to",
          ".wrangler/state",
          "--json",
          "--command",
          sql,
        ];
  const r = spawnSync(process.execPath, ["--use-system-ca", wranglerBin(), ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  if (r.status !== 0) {
    throw new Error(`d1Select failed (${target}): ${r.stderr || r.stdout}`);
  }
  const start = r.stdout.indexOf("[");
  if (start < 0) throw new Error(`No JSON from D1 (${target}):\n${r.stdout.slice(0, 400)}`);
  return JSON.parse(r.stdout.slice(start));
}

function d1ExecFile(target, sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-lg-xref-"));
  const file = join(dir, "q.sql");
  const body = sql.trim().endsWith(";") ? `${sql.trim()}\n` : `${sql.trim()};\n`;
  writeFileSync(file, body, "utf8");
  try {
    const args =
      target === "remote"
        ? ["d1", "execute", "gysh-db", "--remote", "--file", file]
        : ["d1", "execute", "gysh-db", "--local", "--persist-to", ".wrangler/state", "--file", file];
    const r = spawnSync(process.execPath, ["--use-system-ca", wranglerBin(), ...args], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    });
    if (r.status !== 0) {
      throw new Error(`d1ExecFile failed (${target}): ${r.stderr || r.stdout}`);
    }
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function results(json) {
  return json?.[0]?.results ?? [];
}

/** Build guideId → { taskId, taskName, tests: [{id,title}] } */
function buildPairs() {
  const lgProof = PROOFREAD_CASES.filter((c) => /^Proofread Launch Guide:/i.test(c.title));
  return LAUNCH_GUIDES.map((g) => {
    const taskId = `T-LG-${g.id}`;
    const taskName = `Review Launch Guide: ${g.name} — verify steps, costs, and verbiage`;
    const tests = lgProof
      .filter((c) => c.title.includes(g.name))
      .map((c) => ({ id: c.id, title: c.title }));
    return { guideId: g.id, taskId, taskName, guideName: g.name, tests };
  });
}

function taskNoteText(tests) {
  const lines = tests.map((t) => `${t.id} — ${t.title}`);
  return [
    "Duplicate of Proofread Launch Guide test(s) that already passed.",
    "Cross-reference:",
    ...lines.map((l) => `• ${l}`),
    "Marked done to match those passed tests; sprint aligned to the test sprint.",
  ].join("\n");
}

function testNoteText(taskId, taskName) {
  return [
    "Duplicate of Task List Review Launch Guide item.",
    `Cross-reference: ${taskId} — ${taskName}`,
    "Task marked done to match this passed proofread; no test status change.",
  ].join("\n");
}

function alreadyHasXref(raw, needle) {
  return String(raw || "").includes(needle);
}

async function processTarget(target) {
  console.log(`\n=== ${target.toUpperCase()} ===`);
  const pairs = buildPairs();

  const tasks = results(
    d1Select(
      target,
      `SELECT id, description, notes, status, sprint, date_completed, done_tina, done_evelyn, assigned_to
       FROM tasks WHERE id LIKE 'T-LG-%'`,
    ),
  );
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  const proofIds = pairs.flatMap((p) => p.tests.map((t) => t.id));
  const inList = proofIds.map((id) => `'${sqlEscape(id)}'`).join(",");
  const statuses = results(
    d1Select(
      target,
      `SELECT case_id, status, sprint, note FROM test_case_status WHERE case_id IN (${inList})`,
    ),
  );
  const statusById = new Map(statuses.map((s) => [s.case_id, s]));

  const statements = [];
  let tasksUpdated = 0;
  let testsNoted = 0;
  let skippedNoPass = 0;

  for (const pair of pairs) {
    const task = taskById.get(pair.taskId);
    if (!task) {
      console.log(`SKIP task missing: ${pair.taskId}`);
      continue;
    }

    const testRows = pair.tests.map((t) => statusById.get(t.id)).filter(Boolean);
    const passed = testRows.filter((r) => String(r.status).toLowerCase() === "pass");
    if (passed.length === 0) {
      console.log(`SKIP ${pair.taskId}: no matching passed proofread yet`);
      skippedNoPass += 1;
      continue;
    }

    // Align to the sprint used by passed tests (prefer majority / first).
    const sprintCounts = new Map();
    for (const r of passed) {
      const s = Number(r.sprint);
      sprintCounts.set(s, (sprintCounts.get(s) || 0) + 1);
    }
    let targetSprint = Number(passed[0].sprint);
    let best = 0;
    for (const [s, n] of sprintCounts) {
      if (n > best) {
        best = n;
        targetSprint = s;
      }
    }

    let nextNotes = task.notes || "";
    if (!alreadyHasXref(nextNotes, "Duplicate of Proofread Launch Guide")) {
      nextNotes = appendActorNote(nextNotes, AUTHOR, taskNoteText(pair.tests), nowIso);
    }

    statements.push(
      `UPDATE tasks SET
         status = 'done',
         sprint = ${targetSprint},
         date_completed = CASE
           WHEN TRIM(IFNULL(date_completed,'')) = '' THEN '${completedDate}'
           ELSE date_completed
         END,
         done_tina = 1,
         done_evelyn = 1,
         notes = '${sqlEscape(nextNotes)}',
         updated_at = '${nowIso}',
         updated_by = '${sqlEscape(AUTHOR)}'
       WHERE id = '${sqlEscape(pair.taskId)}'`,
    );
    tasksUpdated += 1;
    console.log(
      `TASK ${pair.taskId}: done, sprint ${task.sprint} → ${targetSprint}, notes xref (${passed.length}/${pair.tests.length} passed)`,
    );

    for (const t of pair.tests) {
      const row = statusById.get(t.id);
      if (!row) {
        // Insert note-only row without changing a non-existent status? Prefer UPDATE only if row exists.
        // Create row with status not_run would be inventing status — skip insert; only update existing.
        console.log(`  TEST ${t.id}: no status row — skip note (will not invent status)`);
        continue;
      }
      // Only annotate tests that passed (matching user's "matching tests that passed")
      if (String(row.status).toLowerCase() !== "pass") {
        console.log(`  TEST ${t.id}: status=${row.status} — skip note (not pass)`);
        continue;
      }
      let note = row.note || "";
      if (alreadyHasXref(note, pair.taskId) && alreadyHasXref(note, "Duplicate of Task List")) {
        console.log(`  TEST ${t.id}: xref already present`);
        continue;
      }
      note = appendActorNote(note, AUTHOR, testNoteText(pair.taskId, pair.taskName), nowIso);
      // Update note (+ updated_at/by) only — never touch status.
      statements.push(
        `UPDATE test_case_status SET
           note = '${sqlEscape(note)}',
           updated_at = '${nowIso}',
           updated_by = '${sqlEscape(AUTHOR)}'
         WHERE case_id = '${sqlEscape(t.id)}'`,
      );
      testsNoted += 1;
      console.log(`  TEST ${t.id}: note xref → ${pair.taskId}`);
    }
  }

  if (statements.length === 0) {
    console.log("Nothing to update.");
    return;
  }

  d1ExecFile(target, statements.join(";\n"));
  console.log(
    `Done (${target}): ${tasksUpdated} tasks updated, ${testsNoted} test notes appended, ${skippedNoPass} skipped (no pass).`,
  );
}

console.log("Launch guide ↔ proofread duplicate cross-ref");
console.log("Targets:", finalTargets.join(", "));
console.log("Pairs:", buildPairs().length);

for (const t of finalTargets) {
  await processTarget(t);
}
