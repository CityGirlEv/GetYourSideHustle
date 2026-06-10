/**
 * Fix Resend email delivery for mypartb.com:
 * - Update DKIM TXT in Cloudflare (requires CLOUDFLARE_API_TOKEN with Zone DNS Edit)
 * - Or complete Resend "Sign in to Cloudflare" in the browser (Domain Connect)
 * - Verify domain in Resend and sync Pages admin email env
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ZONE_ID = "bc51ba8f291107c7c8bc930ffc3a0ef2";
const ZONE_NAME = "mypartb.com";
const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const CF_PROJECT = "mypartb";
const RESEND_DOMAIN_ID = "4df35878-a6da-4755-a2a7-d16990218049";
const WAIT_SEC = Number(process.argv[2] ?? 120);

function loadEnvFile() {
  const env = {};
  for (const line of fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i)] = val;
  }
  return env;
}

function readOAuth() {
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

function openBrowser(url) {
  console.log("Opening:", url);
  spawnSync(
    "powershell.exe",
    ["-NoProfile", "-Command", `Start-Process '${url.replace(/'/g, "''")}'`],
    { stdio: "ignore" },
  );
}

const envFile = loadEnvFile();
const cfToken = process.env.CLOUDFLARE_API_TOKEN?.trim() || envFile.CLOUDFLARE_API_TOKEN?.trim();
const oauth = readOAuth();
const pagesHeaders = {
  Authorization: `Bearer ${oauth}`,
  "Content-Type": "application/json",
};

async function getResendDomainDetail() {
  const key = envFile.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY missing");
  const headers = { Authorization: `Bearer ${key}`, "User-Agent": "mypartb-fix/1.0" };
  return fetch(`https://api.resend.com/domains/${RESEND_DOMAIN_ID}`, { headers }).then((r) =>
    r.json(),
  );
}

async function listDns(token) {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=100`,
    { headers },
  );
  const json = await res.json();
  if (!json.success) throw new Error(`list dns: ${JSON.stringify(json.errors)}`);
  return json.result;
}

async function upsertDkim(token, name, content) {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const existing = (await listDns(token)).find(
    (r) => r.type === "TXT" && r.name.includes("resend._domainkey"),
  );
  const body = { type: "TXT", name, content, ttl: 1, proxied: false };
  const url = existing
    ? `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${existing.id}`
    : `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;
  const res = await fetch(url, {
    method: existing ? "PUT" : "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`upsert dkim: ${JSON.stringify(json.errors)}`);
  console.log(existing ? "Updated" : "Created", "DKIM TXT for", name);
}

async function publicDkim() {
  const res = await fetch(
    "https://cloudflare-dns.com/dns-query?name=resend._domainkey.mypartb.com&type=TXT",
    { headers: { Accept: "application/dns-json" } },
  );
  const json = await res.json();
  const raw = json.Answer?.[0]?.data ?? "";
  return raw.replace(/^"|"$/g, "");
}

async function verifyResend(maxAttempts = 12) {
  const key = envFile.RESEND_API_KEY?.trim();
  const headers = { Authorization: `Bearer ${key}`, "User-Agent": "mypartb-fix/1.0" };
  await fetch(`https://api.resend.com/domains/${RESEND_DOMAIN_ID}/verify`, {
    method: "POST",
    headers,
  });
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const detail = await fetch(`https://api.resend.com/domains/${RESEND_DOMAIN_ID}`, {
      headers,
    }).then((r) => r.json());
    const dkimStatus = detail.records?.find((r) => r.record === "DKIM")?.status;
    console.log(`verify attempt ${i + 1}: domain=${detail.status} dkim=${dkimStatus}`);
    if (detail.status === "verified") return detail;
  }
  return null;
}

async function syncPagesEnv() {
  const projectRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${CF_PROJECT}`,
    { headers: pagesHeaders },
  );
  const projectJson = await projectRes.json();
  if (!projectJson.success) throw new Error(JSON.stringify(projectJson.errors));
  const production = projectJson.result?.deployment_configs?.production ?? {};
  const envVars = { ...(production.env_vars ?? {}) };
  envVars.ADMIN_NOTIFICATION_EMAILS = {
    type: "plain_text",
    value: "evelyn3@cox.net,sharpebanker@yahoo.com",
  };
  envVars.EMAIL_FROM = {
    type: "plain_text",
    value: `The Medicare Optimizer <noreply@${ZONE_NAME}>`,
  };
  envVars.EMAIL_SENDER_DOMAIN = { type: "plain_text", value: ZONE_NAME };
  const patchRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${CF_PROJECT}`,
    {
      method: "PATCH",
      headers: pagesHeaders,
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
  console.log("Synced ADMIN_NOTIFICATION_EMAILS on Pages production");
}

async function testSend() {
  const key = envFile.RESEND_API_KEY?.trim();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "User-Agent": "mypartb-fix/1.0",
    },
    body: JSON.stringify({
      from: `The Medicare Optimizer <noreply@${ZONE_NAME}>`,
      to: ["evelyn3@cox.net"],
      subject: "[mypartb] Resend delivery test",
      html: "<p>If you received this, mypartb.com is verified and sending.</p>",
    }),
  });
  console.log("test send:", res.status, await res.text());
}

const detail = await getResendDomainDetail();
const dkim = detail.records?.find((r) => r.record === "DKIM");
if (!dkim?.value) throw new Error("No DKIM record from Resend");
const fqdn = dkim.name.includes(".") ? dkim.name : `${dkim.name}.${ZONE_NAME}`;

if (cfToken) {
  console.log("Using CLOUDFLARE_API_TOKEN for DNS update...");
  await upsertDkim(cfToken, fqdn, dkim.value);
} else {
  const live = await publicDkim();
  if (live === dkim.value) {
    console.log("Public DKIM already matches Resend — skipping DNS update.");
  } else {
    console.log("\nWrangler OAuth cannot edit DNS. Fix DKIM one of these ways:");
    console.log("  A) Resend dashboard → Sign in to Cloudflare (recommended)");
    console.log("  B) Cloudflare DNS → edit TXT `resend._domainkey` manually");
    console.log("  C) Set CLOUDFLARE_API_TOKEN in .env (Zone DNS Edit) and re-run\n");
    console.log("Required DKIM value:");
    console.log(dkim.value);
    openBrowser(`https://resend.com/domains/${RESEND_DOMAIN_ID}`);
    openBrowser(`https://dash.cloudflare.com/${ZONE_ID}/${ZONE_NAME}/dns/records`);
    console.log(`Waiting ${WAIT_SEC}s for DNS update...`);
    for (let elapsed = 0; elapsed < WAIT_SEC; elapsed += 15) {
      await new Promise((r) => setTimeout(r, 15000));
      const liveNow = await publicDkim();
      if (liveNow === dkim.value) {
        console.log("Public DKIM now matches Resend.");
        break;
      }
      console.log(`...still waiting (${elapsed + 15}s)`);
    }
  }
}

console.log("Verifying domain in Resend...");
const verified = await verifyResend();
await syncPagesEnv();

if (!verified) {
  console.error(
    "\nDomain still not verified. Complete the Cloudflare DNS update, then run:\n  node scripts/poll-resend-verify.mjs\n",
  );
  process.exit(1);
}

console.log("Domain verified.");
await testSend();
console.log("Done.");
