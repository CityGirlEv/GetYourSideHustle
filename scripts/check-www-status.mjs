/**
 * Check www.mypartb.com setup via Cloudflare API (OAuth) and HTTP fetch.
 */
import fs from "fs";

const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";

function loadOAuth() {
  const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
  if (!fs.existsSync(configPath)) return null;
  return fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)?.[1] ?? null;
}

const token = loadOAuth();
if (!token) {
  console.error("Run: npx wrangler login");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function cf(apiPath, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${apiPath}`, { headers, ...init });
  const json = await res.json();
  if (!json.success) {
    const msg = json.errors?.map((e) => e.message).join("; ") ?? JSON.stringify(json.errors);
    throw new Error(`${apiPath}: ${msg}`);
  }
  return json.result;
}

async function main() {
  const domains = await cf(`/accounts/${ACCOUNT_ID}/pages/projects/mypartb/domains`);
  console.log("=== Pages domains ===");
  for (const d of domains) console.log(`  ${d.name} status=${d.status} id=${d.id}`);

  const www = domains.find((d) => d.name === "www.mypartb.com");
  if (www) {
    console.log("\nRemoving www from Pages...");
    try {
      await cf(`/accounts/${ACCOUNT_ID}/pages/projects/mypartb/domains/${www.name}`, { method: "DELETE" });
      console.log("  deleted");
    } catch (e) {
      console.log("  delete failed:", e.message);
    }
  }

  const zones = await cf("/zones?name=mypartb.com");
  const zoneId = zones[0].id;
  const recs = await cf(`/zones/${zoneId}/dns_records?per_page=100`);
  console.log("\n=== WWW DNS ===");
  for (const r of recs.filter((x) => x.name.includes("www"))) {
    console.log(`  ${r.type} ${r.name} -> ${r.content} proxied=${r.proxied}`);
  }

  const routes = await cf(`/zones/${zoneId}/workers/routes`);
  console.log("\n=== Worker routes ===");
  for (const r of routes) console.log(`  ${r.pattern} -> ${r.script}`);

  const workerDomains = await cf(
    `/accounts/${ACCOUNT_ID}/workers/domains/records?service=mypartb&environment=production&per_page=50`,
  );
  console.log("\n=== Worker custom domains ===");
  for (const d of workerDomains) console.log(`  ${d.hostname}`);

  console.log("\n=== HTTP ===");
  for (const url of ["https://mypartb.com", "https://www.mypartb.com"]) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      console.log(`  ${url} -> ${res.status} server=${res.headers.get("server")} ray=${res.headers.get("cf-ray")}`);
    } catch (e) {
      console.log(`  ${url} -> ERR ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
