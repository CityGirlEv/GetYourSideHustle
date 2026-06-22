/**
 * Attach www.mypartb.com to the mypartb Worker (fixes 522 on www while apex works).
 *
 * Requires wrangler login OR CLOUDFLARE_API_TOKEN in .env with:
 *   Account → Workers Scripts → Edit
 *   Zone → DNS → Edit
 *
 * Usage: node --use-system-ca scripts/attach-worker-www-domain.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const WORKER_NAME = "mypartb";
const HOSTNAMES = ["www.mypartb.com", "mypartb.com"];

function loadToken() {
  if (process.env.CLOUDFLARE_API_TOKEN?.trim()) return process.env.CLOUDFLARE_API_TOKEN.trim();
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!fs.existsSync(envPath)) return null;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line.startsWith("CLOUDFLARE_API_TOKEN=")) continue;
    let val = line.slice("CLOUDFLARE_API_TOKEN=".length).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    return val || null;
  }
  return null;
}

function loadOAuth() {
  const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
  if (!fs.existsSync(configPath)) return null;
  const config = fs.readFileSync(configPath, "utf8");
  return config.match(/oauth_token = "([^"]+)"/)?.[1] ?? null;
}

const token = loadToken() ?? loadOAuth();
if (!token) {
  console.error("Missing auth — run: npx wrangler login");
  console.error("Or set CLOUDFLARE_API_TOKEN in .env");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers, ...init });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.errors?.[0]?.message ?? JSON.stringify(json.errors));
  }
  return json.result;
}

const existing = await cf(
  `/accounts/${ACCOUNT_ID}/workers/domains/records?service=${WORKER_NAME}&environment=production&per_page=50`,
);

for (const hostname of HOSTNAMES) {
  if (existing?.some((d) => d.hostname === hostname)) {
    console.log(`already attached: ${hostname}`);
    continue;
  }
  const result = await cf(`/accounts/${ACCOUNT_ID}/workers/domains`, {
    method: "PUT",
    body: JSON.stringify({
      hostname,
      service: WORKER_NAME,
      environment: "production",
    }),
  });
  console.log(`attached: ${result.hostname} → ${result.service}`);
}

console.log("\nDone. Test https://www.mypartb.com in ~30 seconds.");
