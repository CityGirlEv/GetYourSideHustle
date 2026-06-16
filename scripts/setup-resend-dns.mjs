/**
 * Sync Resend DNS records in Cloudflare and verify mypartb.com.
 * Requires CLOUDFLARE_API_TOKEN in .env with Zone DNS Edit for mypartb.com.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ZONE_ID = "bc51ba8f291107c7c8bc930ffc3a0ef2";
const DOMAIN = "mypartb.com";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i)] = val;
  }
  return env;
}

const env = loadEnv();
const cfToken = process.env.CLOUDFLARE_API_TOKEN?.trim() || env.CLOUDFLARE_API_TOKEN?.trim();
const resendKey = env.RESEND_API_KEY?.trim();

if (!cfToken) {
  console.error(
    "CLOUDFLARE_API_TOKEN missing. Create a token at https://dash.cloudflare.com/profile/api-tokens\n" +
      "with Zone → DNS → Edit for mypartb.com, add to .env, then re-run:\n" +
      "  node scripts/setup-resend-dns.mjs",
  );
  process.exit(1);
}
if (!resendKey) {
  console.error("RESEND_API_KEY missing in .env");
  process.exit(1);
}

const cfHeaders = { Authorization: `Bearer ${cfToken}`, "Content-Type": "application/json" };
const resendHeaders = { Authorization: `Bearer ${resendKey}` };

async function listDns() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=100`,
    { headers: cfHeaders },
  );
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  return json.result;
}

async function upsertDns(record) {
  const existing = (await listDns()).find((r) => r.type === record.type && r.name === record.name);
  const body = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 1,
    proxied: false,
    ...(record.priority != null ? { priority: record.priority } : {}),
  };
  const url = existing
    ? `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${existing.id}`
    : `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;
  const res = await fetch(url, {
    method: existing ? "PUT" : "POST",
    headers: cfHeaders,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log(
    existing ? "updated" : "created",
    record.type,
    record.name,
    json.success ? "ok" : json.errors,
  );
  if (!json.success) throw new Error(JSON.stringify(json.errors));
}

const domainsRes = await fetch("https://api.resend.com/domains", { headers: resendHeaders });
const domains = await domainsRes.json();
const domain = domains.data?.find((d) => d.name === DOMAIN);
if (!domain) throw new Error(`Resend domain ${DOMAIN} not found`);

const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, {
  headers: resendHeaders,
});
const detail = await detailRes.json();
console.log("Resend status before:", detail.status);

for (const rec of detail.records ?? []) {
  const fqdn =
    rec.name === DOMAIN || rec.name.endsWith(`.${DOMAIN}`) ? rec.name : `${rec.name}.${DOMAIN}`;
  if (rec.type === "MX") {
    await upsertDns({
      type: "MX",
      name: fqdn,
      content: rec.value,
      priority: rec.priority ?? 10,
    });
  } else if (rec.type === "TXT") {
    await upsertDns({ type: "TXT", name: fqdn, content: rec.value });
  }
}

await fetch(`https://api.resend.com/domains/${domain.id}/verify`, {
  method: "POST",
  headers: resendHeaders,
});

for (let i = 0; i < 12; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const afterRes = await fetch(`https://api.resend.com/domains/${domain.id}`, {
    headers: resendHeaders,
  });
  const after = await afterRes.json();
  const dkim = after.records?.find((r) => r.record === "DKIM")?.status;
  console.log(`verify ${i + 1}: domain=${after.status} dkim=${dkim}`);
  if (after.status === "verified") {
    console.log("Domain verified — emails can go to any address.");
    process.exit(0);
  }
}

console.error("Domain still not verified. Check Cloudflare DNS propagation, then run:");
console.error("  node scripts/poll-resend-verify.mjs");
process.exit(1);
