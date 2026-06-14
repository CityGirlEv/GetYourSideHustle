import fs from "fs";
import path from "path";

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

const endpoints = [
  ["POST dns_records", `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`],
  ["POST batch", `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/batch`],
  ["PUT settings", `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings`],
];

for (const [label, url] of endpoints) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "TXT", name: "probe.mypartb.com", content: "test", ttl: 1 }),
  });
  const json = await res.json();
  console.log(label, json.success, json.errors?.[0]?.code, json.errors?.[0]?.message);
}
