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

const cols = runCommand("PRAGMA table_info(tasks)");
console.log(
  "task cols",
  cols.map((c) => c.name),
);

const s1 = runCommand(
  "SELECT id, status, sprint, assigned_to, substr(notes,1,120) AS n, updated_at FROM tasks WHERE CAST(sprint AS INTEGER) = 1 ORDER BY id",
);
console.log("S1 tasks", s1.length);
const byStatus = {};
for (const t of s1) byStatus[t.status] = (byStatus[t.status] || 0) + 1;
console.log("byStatus", byStatus);
console.log(
  "incomplete",
  s1.filter((t) => t.status !== "done").map((t) => `${t.id}:${t.status}`),
);

const rolled = runCommand(
  "SELECT id, status, sprint, substr(notes,1,160) AS n FROM tasks WHERE notes LIKE '%Rolling over from Sprint%' AND CAST(sprint AS INTEGER) = 2",
);
console.log("S2 tasks with roll note", rolled.length);
console.log(rolled.slice(0, 15));
