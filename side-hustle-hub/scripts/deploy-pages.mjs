/**
 * Production deploy for getyoursidehustle.com on Cloudflare Pages (+ D1 Functions).
 *
 * CANONICAL GYSH deploy — always run from this repo (side-hustle-hub):
 *   npm run deploy:pages
 *
 * Do NOT run `wrangler pages deploy dist --project-name=getyoursidehustle` from
 * muntie-ev-ai-studio-main (or any other cwd). That uploads static assets only and
 * drops `functions/` + D1 bindings, which causes /api/auth/login 404.
 *
 * Prerequisites (one-time / after schema changes):
 *   npm run db:migrate
 *   npm run db:seed
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

const required = [
  "functions/api/[[path]].ts",
  "wrangler.toml",
  "public/_routes.json",
];

for (const rel of required) {
  const full = path.join(root, rel);
  if (!existsSync(full)) {
    console.error(`Missing ${rel} — aborting. GYSH Pages deploy requires Functions + D1 + _routes.json.`);
    process.exit(1);
  }
}

if (!existsSync(wrangler)) {
  console.error(`Wrangler not found at ${wrangler}`);
  process.exit(1);
}

const env = {
  ...process.env,
  VITE_SITE_URL: "https://getyoursidehustle.com",
};

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npm", ["run", "build"]);

const routesInDist = path.join(root, "dist", "_routes.json");
if (!existsSync(routesInDist)) {
  console.error("dist/_routes.json missing after build — Vite must copy public/_routes.json.");
  process.exit(1);
}

// cwd = side-hustle-hub root so Wrangler packs ./functions and reads wrangler.toml D1.
run("node", [
  "--use-system-ca",
  wrangler,
  "pages",
  "deploy",
  "dist",
  "--project-name=getyoursidehustle",
  "--commit-dirty=true",
  "--branch=main",
]);

console.log("\nDeployed to https://getyoursidehustle.pages.dev (custom domain: https://getyoursidehustle.com)");
console.log("API: /api/health  |  Auth: /api/auth/login  |  D1 binding: DB (gysh-db)");
