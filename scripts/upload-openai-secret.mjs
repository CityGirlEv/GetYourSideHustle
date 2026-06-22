/**
 * Upload OPENAI_API_KEY from .env to Cloudflare Pages + Worker (optional voice fallback).
 * Production voice uses Workers AI (Whisper) — no OpenAI key required after deploy.
 * Local dev (localhost) still needs OPENAI_API_KEY in .env unless testing on production.
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const CF_PROJECT = "mypartb";
const WORKER_NAME = "mypartb";

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

async function uploadToPages(key) {
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
  envVars.OPENAI_API_KEY = { type: "secret_text", value: key };

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
  console.log("Patched OPENAI_API_KEY on Cloudflare Pages production.");
}

const key = loadEnv().OPENAI_API_KEY?.trim();
if (!key || !key.startsWith("sk-")) {
  console.error("OPENAI_API_KEY missing or invalid in .env (expected sk-...)");
  console.error("Get one at https://platform.openai.com/api-keys");
  console.error("Add to .env: OPENAI_API_KEY=\"sk-...\"");
  process.exit(1);
}

console.log("Uploading key fingerprint:", `${key.slice(0, 8)}...${key.slice(-4)}`);

await uploadToPages(key);

for (const args of [
  ["wrangler", "pages", "secret", "put", "OPENAI_API_KEY", "--project-name", CF_PROJECT],
  ["wrangler", "secret", "put", "OPENAI_API_KEY", "--name", WORKER_NAME],
]) {
  const result = spawnSync("npx", args, {
    input: key,
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
    env: { ...process.env, NODE_OPTIONS: "--use-system-ca" },
  });
  if (result.status !== 0) {
    console.warn(`Warning: ${args.join(" ")} failed (may still be OK if patched via API).`);
  } else {
    console.log(`Uploaded via: ${args.join(" ")}`);
  }
}

console.log("Done. Redeploy for voice transcription on production.");
