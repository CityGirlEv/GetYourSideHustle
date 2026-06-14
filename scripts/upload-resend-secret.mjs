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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
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

async function uploadViaCloudflareApi(key) {
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
  envVars.RESEND_API_KEY = { type: "secret_text", value: key };

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
  console.log("Patched RESEND_API_KEY on Cloudflare Pages production via API.");
}

const key = loadEnv().RESEND_API_KEY?.trim();
if (!key || !key.startsWith("re_")) {
  console.error("RESEND_API_KEY missing or invalid in .env");
  process.exit(1);
}

console.log("Uploading key fingerprint:", `${key.slice(0, 12)}...${key.slice(-4)}`);

await uploadViaCloudflareApi(key);

const result = spawnSync(
  "npx",
  ["wrangler", "pages", "secret", "put", "RESEND_API_KEY", "--project-name", CF_PROJECT],
  {
    input: key,
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
  },
);

if (result.status !== 0) {
  console.warn("wrangler pages secret put failed; API patch above should still apply.");
} else {
  console.log("Uploaded RESEND_API_KEY via wrangler pages secret put.");
}

const domains = await fetch("https://api.resend.com/domains", {
  headers: { Authorization: `Bearer ${key}` },
}).then((r) => r.json());
const domain = domains.data?.[0];
console.log(
  "Resend account check:",
  domain ? `${domain.name} (${domain.status})` : "no domains on this key",
);
