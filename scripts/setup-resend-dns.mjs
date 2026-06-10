import fs from "fs";
import path from "path";

const ZONE_ID = "bc51ba8f291107c7c8bc930ffc3a0ef2";
const DOMAIN = "mypartb.com";

const configPath = path.join(
  process.env.APPDATA ?? "",
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);

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

function readToken() {
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/oauth_token = "([^"]+)"/);
  if (!match) throw new Error("Run: npx wrangler login");
  return match[1];
}

const cfToken = readToken();
const resendKey = loadEnv().RESEND_API_KEY?.trim();
if (!resendKey) throw new Error("RESEND_API_KEY missing in .env");

const cfHeaders = {
  Authorization: `Bearer ${cfToken}`,
  "Content-Type": "application/json",
};

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
  const existing = (await listDns()).find(
    (r) => r.type === record.type && r.name === record.name,
  );
  const body = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 1,
    proxied: false,
    ...(record.priority != null ? { priority: record.priority } : {}),
  };
  if (existing) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${existing.id}`,
      { method: "PUT", headers: cfHeaders, body: JSON.stringify(body) },
    );
    const json = await res.json();
    console.log("updated", record.type, record.name, json.success ? "ok" : json.errors);
    return json;
  }
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`,
    { method: "POST", headers: cfHeaders, body: JSON.stringify(body) },
  );
  const json = await res.json();
  console.log("created", record.type, record.name, json.success ? "ok" : json.errors);
  return json;
}

const resendHeaders = { Authorization: `Bearer ${resendKey}` };
const domainsRes = await fetch("https://api.resend.com/domains", { headers: resendHeaders });
const domains = await domainsRes.json();
const domain = domains.data?.find((d) => d.name === DOMAIN);
if (!domain) throw new Error(`Resend domain ${DOMAIN} not found`);

const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, {
  headers: resendHeaders,
});
const detail = await detailRes.json();
console.log("Resend domain status before:", detail.status);

for (const rec of detail.records ?? []) {
  const fqdn =
    rec.name === DOMAIN || rec.name.endsWith(`.${DOMAIN}`)
      ? rec.name
      : `${rec.name}.${DOMAIN}`;
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

const verifyRes = await fetch(`https://api.resend.com/domains/${domain.id}/verify`, {
  method: "POST",
  headers: resendHeaders,
});
console.log("verify:", verifyRes.status, await verifyRes.text());

await new Promise((r) => setTimeout(r, 5000));

const afterRes = await fetch(`https://api.resend.com/domains/${domain.id}`, {
  headers: resendHeaders,
});
const after = await afterRes.json();
console.log("Resend domain status after:", after.status);
console.log("records:", JSON.stringify(after.records?.map((r) => ({ record: r.record, name: r.name, status: r.status })), null, 2));
