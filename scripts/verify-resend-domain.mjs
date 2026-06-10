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

const key = loadEnv().RESEND_API_KEY?.trim();
if (!key) throw new Error("RESEND_API_KEY missing");
const headers = { Authorization: `Bearer ${key}` };

const domainsRes = await fetch("https://api.resend.com/domains", { headers });
const domains = await domainsRes.json();
console.log("Current API key sees domains:");
for (const d of domains.data ?? []) {
  console.log(`  - ${d.name}: ${d.status}`);
}

const domain = domains.data?.find((d) => d.name === "mypartb.com");
if (!domain) {
  console.log("\nNo mypartb.com on this key — use the OTHER Resend account that owns the domain.");
  process.exit(0);
}

const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers });
const detail = await detailRes.json();
console.log("\nmypartb.com detail status:", detail.status);

const verifyRes = await fetch(`https://api.resend.com/domains/${domain.id}/verify`, {
  method: "POST",
  headers,
});
const verifyBody = await verifyRes.text();
console.log("verify attempt:", verifyRes.status, verifyBody);
