import { execSync } from "node:child_process";

function runCommand(sql) {
  const out = execSync(
    `npx wrangler d1 execute gysh-db --remote --json --command ${JSON.stringify(sql)}`,
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 40 * 1024 * 1024 },
  );
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  return JSON.parse(out.slice(start, end + 1))?.[0]?.results ?? [];
}

const s2 = runCommand(
  "SELECT case_id, status, note, updated_at FROM test_case_status WHERE CAST(sprint AS INTEGER) = 2 AND status NOT IN ('pass','conditional_approval')",
);

const missing = [];
const has = [];
for (const r of s2) {
  const note = String(r.note || "");
  const ok = /Rolling over from Sprint/i.test(note);
  (ok ? has : missing).push(`${r.case_id}:${r.status}:${r.updated_at}`);
}
console.log("with roll note", has.length);
console.log("missing roll note", missing.length);
console.log(missing);

// tasks?
try {
  const tasks = runCommand(
    "SELECT id, status, sprint, substr(notes,1,160) AS n, updated_at FROM tasks WHERE notes LIKE '%Rolling over from Sprint%' LIMIT 40",
  );
  console.log("tasks with roll note", tasks.length, tasks.slice(0, 10));
} catch (e) {
  console.log("tasks query", String(e.message || e).slice(0, 200));
}
