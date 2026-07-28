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

const all = runCommand(
  "SELECT id, status, sprint, substr(notes,1,200) AS n, updated_at FROM tasks ORDER BY sprint, id",
);

const incomplete = all.filter((t) => t.status !== "done");
const withNote = all.filter((t) => /Rolling over from Sprint/i.test(String(t.n || "")));
const incompleteWithNote = incomplete.filter((t) =>
  /Rolling over from Sprint/i.test(String(t.n || "")),
);
const incompleteNoNote = incomplete.filter(
  (t) => !/Rolling over from Sprint/i.test(String(t.n || "")),
);

console.log({
  total: all.length,
  incomplete: incomplete.length,
  withRollNote: withNote.length,
  incompleteWithNote: incompleteWithNote.length,
  incompleteNoNote: incompleteNoNote.length,
});
console.log(
  "incomplete by sprint",
  incomplete.reduce((acc, t) => {
    acc[t.sprint] = (acc[t.sprint] || 0) + 1;
    return acc;
  }, {}),
);
console.log(
  "incompleteWithNote",
  incompleteWithNote.map((t) => `${t.id}:S${t.sprint}:${t.status}`),
);
console.log(
  "incompleteNoNote sample",
  incompleteNoNote.slice(0, 40).map((t) => `${t.id}:S${t.sprint}:${t.status}:${t.updated_at}`),
);

// Tasks updated in the 2:17 batch
const batch = all.filter((t) => String(t.updated_at || "").startsWith("2026-07-28T07:17"));
console.log("updated at 07:17", batch.length, "statuses", {
  done: batch.filter((t) => t.status === "done").length,
  open: batch.filter((t) => t.status !== "done").length,
  withNote: batch.filter((t) => /Rolling over from Sprint/i.test(String(t.n || ""))).length,
});
console.log(
  "07:17 open without note",
  batch
    .filter((t) => t.status !== "done" && !/Rolling over from Sprint/i.test(String(t.n || "")))
    .map((t) => t.id),
);
