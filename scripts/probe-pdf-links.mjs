import fs from "fs";

const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
const token = fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Run: npx wrangler login");

const headers = { Authorization: `Bearer ${token}` };
const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";

async function cf(path, init) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers, ...init });
  return res.json();
}

const zones = (await cf("/zones?name=mypartb.com")).result ?? [];
console.log("=== mypartb.com zone ===");
console.log(zones[0] ? `${zones[0].id} status=${zones[0].status}` : "NOT IN ACCOUNT");

if (zones[0]) {
  const recs = (await cf(`/zones/${zones[0].id}/dns_records?per_page=100`)).result ?? [];
  console.log("DNS:");
  for (const r of recs) {
    console.log(`  ${r.type} ${r.name} -> ${r.content} proxied=${r.proxied}`);
  }
}

const workerDomains =
  (await cf(
    `/accounts/${ACCOUNT_ID}/workers/domains/records?service=mypartb&environment=production&per_page=50`,
  )).result ?? [];
console.log("\n=== Worker custom domains ===");
for (const d of workerDomains) console.log(`  ${d.hostname}`);

const pagesDomains =
  (await cf(`/accounts/${ACCOUNT_ID}/pages/projects/mypartb/domains`)).result ?? [];
console.log("\n=== Pages custom domains ===");
for (const d of pagesDomains) {
  console.log(`  ${d.name}: ${d.status} ${d.verification_data?.error_message ?? ""}`);
}

console.log("\n=== HTTP HEAD ===");
const urls = [
  "https://www.mypartb.com/downloads/PBO_Turning_65_Workbook.pdf",
  "https://mypartb.com/downloads/PBO_Turning_65_Workbook.pdf",
  "https://mypartb.pages.dev/downloads/PBO_Turning_65_Workbook.pdf",
  "https://mypartb.pages.dev/downloads/version.json",
];

for (const url of urls) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual" });
    console.log(
      `${url}\n  ${res.status} type=${res.headers.get("content-type")} len=${res.headers.get("content-length")}`,
    );
  } catch (e) {
    console.log(`${url}\n  ERR ${e.message}`);
  }
}
