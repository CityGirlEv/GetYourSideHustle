import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const project = "getyoursidehustle";
const zoneName = "getyoursidehustle.com";

const cfgPath = path.join(
  os.homedir(),
  "AppData/Roaming/xdg.config/.wrangler/config/default.toml",
);
const cfg = fs.readFileSync(cfgPath, "utf8");
const token = cfg.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Missing wrangler oauth token");

async function api(apiPath, method = "GET", body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

const zones = await api(`/zones?name=${zoneName}`);
const zone = zones.json.result?.[0];
console.log("\n=== ZONE ===");
console.log(JSON.stringify(zone ? {
  id: zone.id,
  name: zone.name,
  status: zone.status,
  paused: zone.paused,
  name_servers: zone.name_servers,
  original_name_servers: zone.original_name_servers,
  type: zone.type,
} : zones.json, null, 2));

if (zone?.id) {
  const dns = await api(`/zones/${zone.id}/dns_records?per_page=100`);
  console.log("\n=== DNS RECORDS ===");
  console.log(JSON.stringify(
    (dns.json.result || []).map((r) => ({
      type: r.type,
      name: r.name,
      content: r.content,
      proxied: r.proxied,
      ttl: r.ttl,
    })),
    null,
    2,
  ));
}

const domains = await api(`/accounts/${accountId}/pages/projects/${project}/domains`);
console.log("\n=== PAGES CUSTOM DOMAINS ===");
console.log(JSON.stringify(domains.json.result || domains.json, null, 2));

const projectInfo = await api(`/accounts/${accountId}/pages/projects/${project}`);
console.log("\n=== PAGES PROJECT ===");
const p = projectInfo.json.result;
console.log(JSON.stringify(p ? {
  name: p.name,
  subdomain: p.subdomain,
  domains: p.domains,
  latest_deployment: p.latest_deployment?.url,
  production_branch: p.production_branch,
} : projectInfo.json, null, 2));

// HTTP checks
for (const url of [
  "https://getyoursidehustle.pages.dev/",
  "https://getyoursidehustle.com/",
  "https://www.getyoursidehustle.com/",
]) {
  try {
    const r = await fetch(url, { redirect: "manual" });
    const text = await r.text();
    const snippet = text.slice(0, 200).replace(/\s+/g, " ");
    console.log(`\n=== ${url} ===`);
    console.log("status", r.status, "location", r.headers.get("location"));
    console.log("body", snippet);
  } catch (e) {
    console.log(`\n=== ${url} === ERROR`, e.message);
  }
}
