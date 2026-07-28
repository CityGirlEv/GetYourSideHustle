import { execSync } from "node:child_process";

function runCommand(sql) {
  const out = execSync(
    `npx wrangler d1 execute gysh-db --remote --json --command ${JSON.stringify(sql)}`,
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 40 * 1024 * 1024 },
  );
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error(`No JSON:\n${out.slice(0, 500)}`);
  return JSON.parse(out.slice(start, end + 1))?.[0]?.results ?? [];
}

for (const id of ["PROOF-005-TINA", "JOIN-001", "PROOF-001-TINA", "NAV-001"]) {
  console.log("\n====", id, "====");
  console.log(
    "current",
    runCommand(
      `SELECT case_id, status, sprint, updated_at, updated_by FROM test_case_status WHERE case_id = '${id}'`,
    ),
  );
  console.log(
    "history",
    runCommand(
      `SELECT status, sprint, changed_at, changed_by FROM test_case_status_history WHERE case_id = '${id}' ORDER BY changed_at DESC LIMIT 12`,
    ),
  );
}

// Count S2 incomplete with notes that have Cursor or Evelyn entries after Jul 28 07:00
const s2 = runCommand(
  "SELECT case_id, status, note FROM test_case_status WHERE CAST(sprint AS INTEGER) = 2 AND status NOT IN ('pass','conditional_approval')",
);
let withNote = 0;
let withRecentSystemish = 0;
const samples = [];
for (const r of s2) {
  let entries = [];
  try {
    entries = JSON.parse(r.note || "[]");
  } catch {
    entries = r.note ? [{ text: r.note }] : [];
  }
  if (!Array.isArray(entries) || !entries.length) continue;
  withNote += 1;
  const hit = entries.find((e) => {
    const t = String(e.createdAt || "");
    const a = String(e.author || "");
    return (
      t.startsWith("2026-07-28T07:") ||
      /roll|sprint\s*2|moved|re-?test/i.test(String(e.text || "")) &&
        t.startsWith("2026-07-2")
    );
  });
  if (hit) {
    withRecentSystemish += 1;
    if (samples.length < 15) {
      samples.push({
        id: r.case_id,
        status: r.status,
        author: hit.author,
        at: hit.createdAt,
        text: String(hit.text).slice(0, 140),
      });
    }
  }
}
console.log("\nS2 incomplete", s2.length, "with any note", withNote, "with Jul28 07:xx or roll-ish note", withRecentSystemish);
console.log(samples);
