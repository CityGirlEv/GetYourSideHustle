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

async function api(url, init = {}) {
  const res = await fetch(url, { headers, ...init });
  const json = await res.json();
  console.log(
    init.method ?? "GET",
    url.split("/v4/")[1],
    res.status,
    json.success,
    json.errors?.[0]?.message ?? "",
  );
  if (json.result != null) console.log(JSON.stringify(json.result, null, 2));
  return json;
}

await api(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/sending/subdomains`);
await api(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/sending/dns_records`);
await api(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/sending/enable`, {
  method: "POST",
  body: JSON.stringify({}),
});
