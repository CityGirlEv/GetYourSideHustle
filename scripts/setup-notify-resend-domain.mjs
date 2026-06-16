/**
 * Set up notify.mypartb.com on the current Resend account, sync DNS to Cloudflare,
 * verify, and update Cloudflare Pages email env vars.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ZONE_ID = "bc51ba8f291107c7c8bc930ffc3a0ef2";
const DOMAIN = "notify.mypartb.com";
const ROOT = "mypartb.com";
const CF_PROJECT = "mypartb";
const CF_ACCOUNT = "100285aafdca60b46f266877fa2fa7dc";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function readCfToken() {
  const configPath = path.join(
    process.env.APPDATA ?? "",
    "xdg.config",
    ".wrangler",
    "config",
    "default.toml",
  );
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/oauth_token = "([^"]+)"/);
  if (!match) throw new Error("Run: npx wrangler login");
  return match[1];
}

const resendKey = loadEnv().RESEND_API_KEY?.trim();
if (!resendKey?.startsWith("re_")) throw new Error("RESEND_API_KEY missing in .env");

const resendHeaders = {
  Authorization: `Bearer ${resendKey}`,
  "Content-Type": "application/json",
  "User-Agent": "mypartb-setup/1.0",
};

const cfHeaders = {
  Authorization: `Bearer ${readCfToken()}`,
  "Content-Type": "application/json",
};

async function listResendDomains() {
  const res = await fetch("https://api.resend.com/domains", { headers: resendHeaders });
  const json = await res.json();
  if (!json.data) throw new Error(`Resend list failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function getOrCreateDomain() {
  const existing = (await listResendDomains()).find((d) => d.name === DOMAIN);
  if (existing) {
    console.log("Resend domain exists:", DOMAIN, existing.status ?? existing.id);
    return existing;
  }
  const res = await fetch("https://api.resend.com/domains", {
    method: "POST",
    headers: resendHeaders,
    body: JSON.stringify({ name: DOMAIN, region: "us-east-1" }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Create domain failed: ${JSON.stringify(json)}`);
  console.log("Created Resend domain:", DOMAIN);
  return json;
}

async function getDomainDetail(id) {
  const res = await fetch(`https://api.resend.com/domains/${id}`, { headers: resendHeaders });
  const json = await res.json();
  if (!json.id) throw new Error(`Domain detail failed: ${JSON.stringify(json)}`);
  return json;
}

async function listCfDns() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=100`,
    { headers: cfHeaders },
  );
  const json = await res.json();
  if (!json.success) throw new Error(`CF DNS list failed: ${JSON.stringify(json.errors)}`);
  return json.result;
}

function recordFqdn(rec) {
  if (rec.name === DOMAIN || rec.name.endsWith(`.${ROOT}`)) return rec.name;
  if (rec.name.includes(".")) return `${rec.name}.${ROOT}`;
  return `${rec.name}.${DOMAIN}`;
}

async function upsertCfRecord(record) {
  const name = recordFqdn(record);
  const existing = (await listCfDns()).find((r) => r.type === record.type && r.name === name);
  const body = {
    type: record.type,
    name,
    content: record.value.replace(/^"|"$/g, ""),
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
    name,
    json.success ? "ok" : json.errors,
  );
  if (!json.success) throw new Error(JSON.stringify(json.errors));
}

async function syncDns(detail) {
  for (const rec of detail.records ?? []) {
    if (rec.record === "Tracking") continue;
    await upsertCfRecord(rec);
  }
}

async function verifyDomain(id) {
  const res = await fetch(`https://api.resend.com/domains/${id}/verify`, {
    method: "POST",
    headers: resendHeaders,
  });
  console.log("verify:", res.status, await res.text());
}

async function updatePagesEnv() {
  const projectRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/pages/projects/${CF_PROJECT}`,
    { headers: cfHeaders },
  );
  const projectJson = await projectRes.json();
  if (!projectJson.success) throw new Error(JSON.stringify(projectJson.errors));

  const production = projectJson.result?.deployment_configs?.production ?? {};
  const envVars = { ...(production.env_vars ?? {}) };
  envVars.EMAIL_FROM = {
    type: "plain_text",
    value: `Get Part B Optimizer <noreply@${DOMAIN}>`,
  };
  envVars.EMAIL_SENDER_DOMAIN = { type: "plain_text", value: DOMAIN };

  const patchRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/pages/projects/${CF_PROJECT}`,
    {
      method: "PATCH",
      headers: cfHeaders,
      body: JSON.stringify({
        deployment_configs: {
          ...projectJson.result.deployment_configs,
          production: { ...production, env_vars: envVars },
        },
      }),
    },
  );
  const patchJson = await patchRes.json();
  if (!patchJson.success) throw new Error(JSON.stringify(patchJson.errors));
  console.log("Updated Cloudflare Pages EMAIL_FROM / EMAIL_SENDER_DOMAIN");
}

async function testSend() {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: resendHeaders,
    body: JSON.stringify({
      from: `Get Part B Optimizer <noreply@${DOMAIN}>`,
      to: ["evelyn3@cox.net"],
      subject: "[mypartb] Resend notify subdomain test",
      html: "<p>If you received this, notify.mypartb.com is verified and sending.</p>",
    }),
  });
  console.log("test send:", res.status, await res.text());
}

const domain = await getOrCreateDomain();
let detail = await getDomainDetail(domain.id);
console.log("status before DNS:", detail.status);

await syncDns(detail);
await verifyDomain(domain.id);
await new Promise((r) => setTimeout(r, 8000));

detail = await getDomainDetail(domain.id);
console.log("status after verify:", detail.status);
console.log(
  "records:",
  JSON.stringify(
    detail.records?.map((r) => ({
      record: r.record,
      name: r.name,
      type: r.type,
      status: r.status,
    })),
    null,
    2,
  ),
);

await updatePagesEnv();
await testSend();

console.log("\nDone. Redeploy mypartb for env changes to take effect in production worker.");
