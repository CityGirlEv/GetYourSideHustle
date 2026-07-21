/**
 * Purge Cloudflare edge cache for getyoursidehustle.com (custom domain).
 * pages.dev is not affected the same way; custom domains use the zone cache.
 *
 *   node --use-system-ca scripts/purge-pages-cache.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const cfgPath = path.join(
  os.homedir(),
  "AppData/Roaming/xdg.config/.wrangler/config/default.toml",
);
const cfg = fs.readFileSync(cfgPath, "utf8");
const token = cfg.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Missing wrangler oauth token — run: wrangler login");

async function api(apiPath, method = "GET", body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, json };
}

const zones = await api("/zones?name=getyoursidehustle.com");
const zone = zones.json.result?.[0];
if (!zone?.id) {
  console.error("Zone not found:", zones.json.errors ?? zones.json);
  process.exit(1);
}

console.log(`Purging everything for zone ${zone.name} (${zone.id})…`);
const purge = await api(`/zones/${zone.id}/purge_cache`, "POST", {
  purge_everything: true,
});

if (!purge.json.success) {
  console.error("Purge failed:", purge.json.errors ?? purge.json);
  process.exit(1);
}

console.log("Cache purged. Hard-refresh https://getyoursidehustle.com");
