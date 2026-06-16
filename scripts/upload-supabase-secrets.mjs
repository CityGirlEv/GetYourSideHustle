/**
 * Upload Supabase secrets from local .env to Cloudflare Pages production.
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const CF_PROJECT = "mypartb";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function readOAuth() {
  const configPath = path.join(
    process.env.APPDATA ?? "",
    "xdg.config",
    ".wrangler",
    "config",
    "default.toml",
  );
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/oauth_token = "([^"]+)"/);
  if (!match) throw new Error("Run: npx wrangler login");
  return match[1];
}

async function patchPlainEnv(env) {
  const headers = {
    Authorization: `Bearer ${readOAuth()}`,
    "Content-Type": "application/json",
  };
  const projectRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${CF_PROJECT}`,
    { headers },
  );
  const projectJson = await projectRes.json();
  if (!projectJson.success) {
    throw new Error(`Cloudflare API read failed: ${JSON.stringify(projectJson.errors)}`);
  }

  const production = projectJson.result?.deployment_configs?.production ?? {};
  const envVars = { ...(production.env_vars ?? {}) };

  const plain = {
    SUPABASE_URL: env.SUPABASE_URL,
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ?? env.SUPABASE_URL,
    SUPABASE_PROJECT_ID: env.SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "",
    VITE_SUPABASE_PROJECT_ID: env.SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "",
  };

  for (const [key, value] of Object.entries(plain)) {
    if (value) envVars[key] = { type: "plain_text", value };
  }

  const patchRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${CF_PROJECT}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        deployment_configs: {
          ...projectJson.result.deployment_configs,
          production: { ...production, env_vars: envVars },
        },
      }),
    },
  );
  const patchJson = await patchRes.json();
  if (!patchJson.success) {
    throw new Error(`Cloudflare API patch failed: ${JSON.stringify(patchJson.errors)}`);
  }
  console.log("Patched plain Supabase URL vars on Cloudflare Pages production.");
}

function putSecret(name, value) {
  const result = spawnSync(
    "npx",
    ["wrangler", "pages", "secret", "put", name, "--project-name", CF_PROJECT],
    {
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    },
  );
  if (result.status !== 0) {
    throw new Error(`wrangler pages secret put ${name} failed`);
  }
  console.log(`Uploaded ${name} via wrangler pages secret put.`);
}

const env = loadEnv();
const required = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
];

for (const key of required) {
  if (!env[key]) {
    console.error(`Missing ${key} in .env`);
    process.exit(1);
  }
}

await patchPlainEnv(env);

for (const key of [
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
]) {
  putSecret(key, env[key].trim());
}

console.log("Supabase production secrets synced from .env.");
