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
const config = fs.readFileSync(configPath, "utf8");
const oauth = config.match(/oauth_token = "([^"]+)"/)?.[1];
const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

const token = apiToken || oauth;
const label = apiToken ? "CLOUDFLARE_API_TOKEN" : "wrangler oauth";
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

for (const url of [
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}`,
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=5`,
  `https://api.cloudflare.com/client/v4/accounts/100285aafdca60b46f266877fa2fa7dc/pages/projects/mypartb`,
]) {
  const res = await fetch(url, { headers });
  const json = await res.json();
  console.log(label, url.split("/v4/")[1], "->", json.success, json.errors?.[0]?.message ?? "");
}
