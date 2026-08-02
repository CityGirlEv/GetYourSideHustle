/**
 * One-shot: create T-052 (Navy Fed) + note T-022 with Draft 2 + banking cross-refs.
 * Usage: node --use-system-ca scripts/tmp-append-t022-t052.mjs [--remote]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isRemote = process.argv.includes("--remote");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

function esc(s) {
  return String(s ?? "").replace(/'/g, "''");
}

function noteJson(author, text) {
  const now = new Date().toISOString();
  const id = `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return JSON.stringify([
    {
      id,
      author,
      createdAt: now,
      updatedAt: now,
      text,
    },
  ]);
}

function notesMulti(author, texts) {
  const base = Date.now();
  return JSON.stringify(
    texts.map((text, i) => {
      const now = new Date(base + i).toISOString();
      return {
        id: `n-${base.toString(36)}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        author,
        createdAt: now,
        updatedAt: now,
        text,
      };
    }),
  );
}

const t022Notes = notesMulti("Evelyn", [
  [
    "Draft 2 money model (Tina Aug 2026):",
    "1) Evelyn Build Credit $10,000 paid back first from remaining profit until paid in full; then membership splits 50/50.",
    "2) Tina retains complete control of Kevina Starr.",
    "3) Platform maintain fee = $50, only chargeable in months GYSH generates revenue; does not accumulate if skipped.",
    "See Admin → Financials → Money model → Draft 2.",
  ].join(" "),
  [
    "Tentatively decided: Evelyn to explore opening another Navy Federal business account for GYSH banking / ops separation.",
    "Cross-ref: T-052 (Explore Navy Federal business account).",
  ].join(" "),
]);

const t052Notes = noteJson(
  "Evelyn",
  [
    "Tentatively decided with Tina: Evelyn explores getting another Navy Federal business account (GYSH banking / ops).",
    "Complements Financials / money-model work — does not replace Draft 2 decisions.",
    "Cross-ref: T-022 (Financials / money model).",
  ].join(" "),
);

const now = new Date().toISOString();
const due = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
})();

const sql = `
UPDATE tasks SET
  notes = '${esc(t022Notes)}',
  updated_at = '${esc(now)}',
  updated_by = 'Evelyn'
WHERE id = 'T-022';

INSERT INTO tasks (
  id, description, category, priority, status, assign_by, assigned_to,
  date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
  sort_order, updated_at, updated_by
) VALUES (
  'T-052',
  'Explore opening another Navy Federal business account for GYSH',
  'admin_ops',
  'P2',
  'not_started',
  'Evelyn',
  'Evelyn',
  '${esc(now.slice(0, 10))}',
  '${esc(due)}',
  '',
  '${esc(t052Notes)}',
  3,
  0,
  0,
  520,
  '${esc(now)}',
  'Evelyn'
);
`;

const tmp = path.join(os.tmpdir(), `gysh-t022-t052-${Date.now()}.sql`);
fs.writeFileSync(tmp, sql, "utf8");
const loc = isRemote
  ? ["--remote", "--yes", "--file", tmp]
  : ["--local", "--persist-to", ".wrangler/state", "--yes", "--file", tmp];
const result = spawnSync(
  process.execPath,
  ["--use-system-ca", wrangler, "d1", "execute", "gysh-db", ...loc],
  { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
);
try {
  fs.unlinkSync(tmp);
} catch {
  /* ignore */
}
if (result.status !== 0) {
  console.error(result.stdout || "");
  console.error(result.stderr || "");
  process.exit(result.status ?? 1);
}
console.log(result.stdout || "ok");
console.log("Updated T-022 notes + inserted T-052 (Navy Fed).");
