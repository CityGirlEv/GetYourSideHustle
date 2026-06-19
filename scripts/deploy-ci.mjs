/**
 * Cloudflare Workers Builds deploy entrypoint (Pages + standalone Worker).
 *
 * Do NOT unset CLOUDFLARE_API_TOKEN here — Workers Builds injects the API token
 * configured under Settings > Builds > API token. Only remove CLOUDFLARE_API_TOKEN
 * from build *environment variables* if it overrides that token with one lacking
 * Cloudflare Pages → Edit (causes upload-token error 10000).
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

if (process.env.WORKERS_CI && !process.env.CLOUDFLARE_API_TOKEN) {
  console.error(
    "deploy-ci: CLOUDFLARE_API_TOKEN is missing.\n" +
      "In Cloudflare → Worker mypartb → Settings → Builds:\n" +
      "  1. Set API token to one with Account: Cloudflare Pages (Edit) + Workers Scripts (Edit)\n" +
      "  2. Remove CLOUDFLARE_API_TOKEN from build environment variables (not the API token picker)\n",
  );
  process.exit(1);
}

function run(script) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("stamp-deploy-version.mjs");
run("deploy-pages.mjs");
run("deploy-worker.mjs");

console.log("deploy-ci: complete");
