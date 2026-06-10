import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const DOMAIN = process.argv[2] ?? "mypartb.com";
const key = loadEnv().RESEND_API_KEY?.trim();
if (!key) {
  console.error("RESEND_API_KEY missing in .env");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${key}` };
const domainsRes = await fetch("https://api.resend.com/domains", { headers });
const domains = await domainsRes.json();
const domain = domains.data?.find((d) => d.name === DOMAIN);
if (!domain) {
  console.error(`Domain ${DOMAIN} not found in Resend. Add it at https://resend.com/domains`);
  process.exit(1);
}

const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers });
const detail = await detailRes.json();

console.log(`\nResend domain: ${DOMAIN}`);
console.log(`Status: ${detail.status}\n`);
console.log("Add these DNS records in Cloudflare (DNS → Records for mypartb.com):\n");
console.log("Type | Name | Content | Priority");
console.log("-----|------|---------|--------");

for (const rec of detail.records ?? []) {
  const name = rec.name.includes(".") ? rec.name : `${rec.name}.${DOMAIN}`;
  const priority = rec.priority != null ? String(rec.priority) : "";
  console.log(`${rec.type} | ${name} | ${rec.value} | ${priority}`);
}

console.log("\nAfter saving DNS records, verify in Resend:");
console.log(`  node scripts/setup-resend-dns.mjs   (or click Verify in the Resend dashboard)`);
console.log("\nThen set EMAIL_FROM in Cloudflare Pages:");
console.log(`  The Medicare Optimizer <noreply@${DOMAIN}>`);
console.log("\nTest send to any address:");
console.log("  node scripts/test-resend-from-addresses.mjs\n");
