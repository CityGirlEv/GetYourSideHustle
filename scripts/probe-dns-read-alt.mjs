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

const urls = [
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=TXT&name=resend._domainkey.mypartb.com`,
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?name=resend._domainkey.mypartb.com`,
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/dns/sync`,
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/dns/apply`,
];

for (const url of urls) {
  const method = url.includes("sync") || url.includes("apply") ? "POST" : "GET";
  const res = await fetch(url, {
    method,
    headers,
    ...(method === "POST" ? { body: JSON.stringify({}) } : {}),
  });
  const text = await res.text();
  console.log(method, url.split("/v4/")[1], res.status, text.slice(0, 400));
}
