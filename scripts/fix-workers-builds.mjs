/**
 * Fix Cloudflare Workers Builds Git CI (frozen bun.lock install failure).
 *
 * Cloudflare auto-runs `bun install --frozen-lockfile` before your build command.
 * Set SKIP_DEPENDENCY_INSTALL so our build command runs a normal `bun install`.
 *
 * Requires user-scoped CLOUDFLARE_API_TOKEN in .env:
 *   Workers Builds Configuration (Edit), Workers Scripts (Read)
 * https://dash.cloudflare.com/profile/api-tokens
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const WORKER_NAME = "mypartb";
const BUN_VERSION = "1.3.14";
const BUILD_COMMAND = "bun install && bun run build";
const DEPLOY_COMMAND =
  "npx wrangler deploy --config dist/_worker.js/wrangler.json --keep-vars";
const BUILD_ENV = {
  SKIP_DEPENDENCY_INSTALL: "true",
  BUN_VERSION,
};

function loadEnv() {
  const env = {};
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i).trim()] = val;
  }
  return env;
}

const token = process.env.CLOUDFLARE_API_TOKEN?.trim() || loadEnv().CLOUDFLARE_API_TOKEN?.trim();
if (!token) {
  console.error(
    "Missing CLOUDFLARE_API_TOKEN in .env\n\n" +
      "Manual dashboard fix (Worker mypartb.com → Settings → Builds):\n" +
      "  Variables: SKIP_DEPENDENCY_INSTALL = true\n" +
      "             BUN_VERSION = 1.3.14\n" +
      "  Build command: bun install && bun run build\n" +
      "  Deploy command: npx wrangler deploy --config dist/_worker.js/wrangler.json --keep-vars\n",
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.errors?.[0]?.message ?? res.statusText);
  }
  return json.result;
}

const scripts = await cf(`/accounts/${ACCOUNT_ID}/workers/scripts`);
const worker = scripts.find((s) => s.id === WORKER_NAME);
if (!worker?.tag) throw new Error(`Worker ${WORKER_NAME} not found`);

console.log(`Worker tag: ${worker.tag}`);

const triggers = await cf(`/accounts/${ACCOUNT_ID}/builds/workers/${worker.tag}/triggers`);
if (!triggers?.length) {
  console.log("No Workers Builds triggers — Git may not be connected on this Worker.");
  process.exit(0);
}

for (const trigger of triggers) {
  console.log(`Updating trigger ${trigger.trigger_name} (${trigger.trigger_uuid})`);
  console.log(`  was build: ${trigger.build_command ?? "(none)"}`);
  console.log(`  was deploy: ${trigger.deploy_command ?? "(none)"}`);
  console.log(`  was env: ${JSON.stringify(trigger.environment_variables ?? {})}`);
  await cf(`/accounts/${ACCOUNT_ID}/builds/triggers/${trigger.trigger_uuid}`, {
    method: "PATCH",
    body: JSON.stringify({
      build_command: BUILD_COMMAND,
      deploy_command: DEPLOY_COMMAND,
      build_caching_enabled: false,
      environment_variables: {
        ...(trigger.environment_variables ?? {}),
        ...BUILD_ENV,
      },
    }),
  });
  console.log("  triggering rebuild...");
  const build = await cf(`/accounts/${ACCOUNT_ID}/builds/triggers/${trigger.trigger_uuid}/builds`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  console.log(`  build started: ${build.build_uuid ?? build.id ?? JSON.stringify(build)}`);
}

console.log("\nDone. Refresh Cloudflare dashboard in ~2 min.");
