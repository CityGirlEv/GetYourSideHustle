/**
 * Fix Cloudflare Workers Builds Git CI (frozen bun.lock install failure).
 *
 * Cloudflare auto-runs `bun install --frozen-lockfile` before your build command.
 * Set SKIP_DEPENDENCY_INSTALL so our build command runs a normal `bun install`.
 *
 * Requires user-scoped CLOUDFLARE_API_TOKEN in .env / Cloudflare settings:
 *   Account -> Workers Builds Configuration -> Edit
 *   Account -> Workers Scripts -> Edit
 *   Account -> Cloudflare Pages -> Edit
 *   Zone -> DNS -> Edit
 * https://dash.cloudflare.com/profile/api-tokens
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const WORKER_NAME = "mypartb";
const BUN_VERSION = "1.3.14";
const BUILD_COMMAND = "bun run build:ci";
const DEPLOY_COMMAND =
  "env -u CLOUDFLARE_API_TOKEN -u WRANGLER_API_KEY node scripts/deploy-ci.mjs";
const BUILD_ENV = {
  SKIP_DEPENDENCY_INSTALL: "true",
  BUN_VERSION,
  // Cloudflare Workers Builds containers have 8 GB RAM total.
  NODE_OPTIONS: "--max-old-space-size=8192",
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
      "             NODE_OPTIONS = --max-old-space-size=8192\n" +
      "  Do NOT set CLOUDFLARE_API_TOKEN here — Workers Builds injects deploy auth.\n" +
      "  (A custom token without Cloudflare Pages → Edit breaks pages deploy.)\n" +
      "  Build command: bun run build:ci\n" +
      "  Deploy command: env -u CLOUDFLARE_API_TOKEN -u WRANGLER_API_KEY node scripts/deploy-ci.mjs\n",
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
  const mergedEnv = {
    ...(trigger.environment_variables ?? {}),
    ...BUILD_ENV,
  };
  // Workers Builds supplies deploy credentials automatically. A manually-set
  // CLOUDFLARE_API_TOKEN (often Workers-only) breaks `wrangler pages deploy`
  // with upload-token Authentication error 10000.
  delete mergedEnv.CLOUDFLARE_API_TOKEN;
  delete mergedEnv.WRANGLER_API_KEY;
  console.log(`  next env: ${JSON.stringify(mergedEnv)}`);
  await cf(`/accounts/${ACCOUNT_ID}/builds/triggers/${trigger.trigger_uuid}`, {
    method: "PATCH",
    body: JSON.stringify({
      build_command: BUILD_COMMAND,
      deploy_command: DEPLOY_COMMAND,
      build_caching_enabled: false,
      environment_variables: mergedEnv,
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
