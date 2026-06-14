import fs from "fs";
import path from "path";

const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const ZONE_ID = "bc51ba8f291107c7c8bc930ffc3a0ef2";
const configPath = path.join(
  process.env.APPDATA ?? "",
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const token = fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)[1];
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function api(label, url, init = {}) {
  const res = await fetch(url, { headers, ...init });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text.slice(0, 300);
  }
  console.log("\n===", label, res.status, "===");
  console.log(typeof json === "string" ? json : JSON.stringify(json, null, 2));
}

await api(
  "routing addresses",
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/email/routing/addresses`,
);
await api(
  "zone routing enable",
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/enable`,
  { method: "POST", body: JSON.stringify({}) },
);
await api(
  "zone routing dns",
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/dns`,
);
await api(
  "zone settings email routing",
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/email_routing`,
);
