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

const incomplete = runCommand(
  "SELECT case_id, status, sprint, updated_at, note FROM test_case_status WHERE CAST(sprint AS INTEGER) = 2 AND status NOT IN ('pass','conditional_approval') ORDER BY status, case_id",
);

console.log("S2 incomplete total:", incomplete.length);

const byStatus = {};
const noteAuthorsAt217 = [];
const noteTimes = new Map();

for (const r of incomplete) {
  byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  let entries = [];
  try {
    const parsed = JSON.parse(r.note || "[]");
    if (Array.isArray(parsed)) entries = parsed;
  } catch {
    if (r.note) entries = [{ text: r.note, createdAt: r.updated_at, author: "?" }];
  }
  for (const e of entries) {
    const t = String(e.createdAt || e.updatedAt || "");
    // 2:17 AM CDT = 07:17 UTC; also catch 07:19 batch
    if (t.includes("2026-07-28T07:1") || t.includes("2026-07-28T07:2")) {
      noteAuthorsAt217.push({
        case_id: r.case_id,
        status: r.status,
        author: e.author,
        createdAt: t,
        text: String(e.text || "").slice(0, 120),
      });
    }
    const key = t.slice(0, 16);
    if (key) noteTimes.set(key, (noteTimes.get(key) || 0) + 1);
  }
}

console.log("byStatus", byStatus);
console.log(
  "top note minute buckets:",
  [...noteTimes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
);
console.log("notes created ~07:1x–07:2x UTC today:", noteAuthorsAt217.length);
console.log(noteAuthorsAt217.slice(0, 40));

// History: sprint/status changes around that time
try {
  const hist = runCommand(
    "SELECT case_id, status, sprint, changed_at, changed_by, substr(note,1,100) AS n FROM test_case_status_history WHERE changed_at LIKE '2026-07-28T07:%' ORDER BY changed_at DESC LIMIT 100",
  );
  console.log("\nhistory @ 07:xx UTC today:", hist.length);
  const histByStatus = {};
  for (const h of hist) histByStatus[h.status] = (histByStatus[h.status] || 0) + 1;
  console.log("history statuses", histByStatus);
  console.log(hist.slice(0, 20));
} catch (e) {
  console.log("history fail", String(e.message || e).slice(0, 300));
}

console.log("\ncase ids:", incomplete.map((r) => `${r.case_id}:${r.status}`).join(", "));
