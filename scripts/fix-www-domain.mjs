/**
 * Fix www.mypartb.com 522: remove www from Pages (conflicts with Worker), attach to Worker.
 * Usage: node --use-system-ca scripts/fix-www-domain.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const ZONE_NAME = "mypartb.com";
const WORKER_NAME = "mypartb";
const PAGES_PROJECT = "mypartb";
const WWW = "www.mypartb.com";
const APEX = "mypartb.com";

function loadToken() {
  if (process.env.CLOUDFLARE_API_TOKEN?.trim()) return process.env.CLOUDFLARE_API_TOKEN.trim();
  const envPath = path.join(__dirname, "..", ".env");
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
  return fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)?.[1] ?? null;
}

const token = loadToken() ?? loadOAuth();
if (!token) {
  console.error("Need CLOUDFLARE_API_TOKEN in .env or npx wrangler login");
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
  console.log("=== Pages custom domains ===");
  const pagesDomains = await cf(`/accounts/${ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}/domains`);
  for (const d of pagesDomains) {
    console.log(`  ${d.name} (${d.id}) status=${d.status ?? "?"}`);
    if (d.name === WWW) {
      console.log(`  removing ${WWW} from Pages (conflicts with Worker)...`);
      try {
        await cf(`/accounts/${ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}/domains/${d.name}`, {
          method: "DELETE",
        });
        console.log("  removed from Pages");
      } catch (e) {
        console.warn("  Pages delete:", e.message);
      }
    }
  }

  console.log("\n=== Worker custom domains ===");
  let workerDomains = [];
  try {
    workerDomains = await cf(
      `/accounts/${ACCOUNT_ID}/workers/domains/records?service=${WORKER_NAME}&environment=production&per_page=50`,
    );
  } catch (e) {
    console.warn("list worker domains:", e.message);
  }
  for (const d of workerDomains ?? []) {
    console.log(`  ${d.hostname} id=${d.id} service=${d.service}`);
  }

  for (const hostname of [APEX, WWW]) {
    if (workerDomains?.some((d) => d.hostname === hostname)) {
      console.log(`already on Worker: ${hostname}`);
      continue;
    }
    console.log(`attaching ${hostname} to Worker ${WORKER_NAME}...`);
    try {
      const result = await cf(`/accounts/${ACCOUNT_ID}/workers/domains`, {
        method: "PUT",
        body: JSON.stringify({
          hostname,
          service: WORKER_NAME,
          environment: "production",
        }),
      });
      console.log(`  ok: ${result.hostname}`);
    } catch (e) {
      console.error(`  failed ${hostname}:`, e.message);
    }
  }

  console.log("\n=== DNS (www should CNAME to apex, proxied) ===");
  const zones = await cf(`/zones?name=${ZONE_NAME}`);
  const zone = zones[0];
  if (!zone) throw new Error(`Zone not found: ${ZONE_NAME}`);
  const records = await cf(`/zones/${zone.id}/dns_records?per_page=100`);
  const wwwRec = records.find((r) => r.name === WWW && (r.type === "CNAME" || r.type === "A"));
  if (!wwwRec) {
    console.log("creating www CNAME -> mypartb.com (proxied)");
    await cf(`/zones/${zone.id}/dns_records`, {
      method: "POST",
      body: JSON.stringify({
        type: "CNAME",
        name: "www",
        content: APEX,
        proxied: true,
        ttl: 1,
      }),
    });
  } else {
    console.log(`www DNS: ${wwwRec.type} ${wwwRec.name} -> ${wwwRec.content} proxied=${wwwRec.proxied}`);
    if (wwwRec.content !== APEX || !wwwRec.proxied) {
      await cf(`/zones/${zone.id}/dns_records/${wwwRec.id}`, {
        method: "PATCH",
        body: JSON.stringify({ content: APEX, proxied: true, ttl: 1 }),
      });
      console.log("  patched www -> apex proxied");
    }
  }

  console.log("\n=== Final worker domains ===");
  workerDomains = await cf(
    `/accounts/${ACCOUNT_ID}/workers/domains/records?service=${WORKER_NAME}&environment=production&per_page=50`,
  );
  for (const d of workerDomains ?? []) {
    console.log(`  ${d.hostname}`);
  }

  console.log("\nDone. Test https://www.mypartb.com in 30-60 seconds.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
