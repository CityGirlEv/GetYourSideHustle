import { execSync } from "node:child_process";

function run(args) {
  const out = execSync(`npx wrangler d1 execute gysh-db ${args.join(" ")}`, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: true,
    maxBuffer: 20 * 1024 * 1024,
  });
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0) {
    console.log(out.slice(0, 500));
    return [];
  }
  return JSON.parse(out.slice(start, end + 1))?.[0]?.results ?? [];
}

const sql = "SELECT sprint_index, closed_at, closed_by FROM closed_sprints ORDER BY sprint_index";
console.log("REMOTE", run(["--remote", "--json", "--command", JSON.stringify(sql)]));
console.log(
  "LOCAL",
  run([
    "--local",
    "--persist-to",
    ".wrangler/state",
    "--json",
    "--command",
    JSON.stringify(sql),
  ]),
);
