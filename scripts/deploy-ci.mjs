/**
 * Cloudflare Workers Builds deploy entrypoint.
 * Strips CLOUDFLARE_API_TOKEN so Wrangler uses Workers Builds auth (Pages + Worker).
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { stripWranglerApiTokenFromProcessEnv } from "./wrangler-ci-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const hadToken = Boolean(process.env.CLOUDFLARE_API_TOKEN);
stripWranglerApiTokenFromProcessEnv();
if (hadToken) {
  console.log("deploy-ci: ignoring CLOUDFLARE_API_TOKEN — using Workers Builds deploy auth");
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
