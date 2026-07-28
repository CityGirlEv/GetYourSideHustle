import { execSync } from "node:child_process";

function runCommand(sql) {
  const out = execSync(
    `npx wrangler d1 execute gysh-db --remote --json --command ${JSON.stringify(sql)}`,
    { cwd: process.cwd(), encoding: "utf8", shell: true, maxBuffer: 40 * 1024 * 1024 },
  );
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error(`No JSON:\n${out.slice(0, 500)}`);
  return JSON.parse(out.slice(start, end + 1));
}

function rows(res) {
  return res?.[0]?.results ?? [];
}

console.log("\n===== incomplete by status/sprint =====");
console.log(
  rows(
    runCommand(
      "SELECT status, sprint, COUNT(1) AS n FROM test_case_status WHERE status NOT IN ('pass','conditional_approval') GROUP BY status, sprint ORDER BY sprint, n DESC",
    ),
  ),
);

console.log("\n===== fixed_cursor sample =====");
console.log(
  rows(
    runCommand(
      "SELECT case_id, status, sprint, substr(note,1,240) AS note_preview, updated_at FROM test_case_status WHERE status = 'fixed_cursor' ORDER BY updated_at DESC LIMIT 25",
    ),
  ),
);

console.log("\n===== notes updated today (UTC date) =====");
console.log(
  rows(
    runCommand(
      "SELECT case_id, status, sprint, substr(note,1,240) AS note_preview, updated_at FROM test_case_status WHERE updated_at LIKE '2026-07-28%' AND note IS NOT NULL AND TRIM(note) != '' ORDER BY updated_at DESC LIMIT 50",
    ),
  ),
);

console.log("\n===== notes with :17 timestamp (2:17 local / UTC) =====");
console.log(
  rows(
    runCommand(
      "SELECT case_id, status, sprint, substr(note,1,260) AS note_preview, updated_at FROM test_case_status WHERE note LIKE '%:17:%' ORDER BY updated_at DESC LIMIT 80",
    ),
  ),
);

console.log("\n===== history changed today =====");
try {
  console.log(
    rows(
      runCommand(
        "SELECT case_id, status, sprint, changed_at, substr(note,1,180) AS note_preview FROM test_case_status_history WHERE changed_at LIKE '2026-07-28%' ORDER BY changed_at DESC LIMIT 80",
      ),
    ),
  );
} catch (e) {
  console.log("history query failed:", String(e.message || e).slice(0, 300));
}
