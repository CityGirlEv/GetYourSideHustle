import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const zoneId = "932e58b61110c32778b7f48d2bec4395";
const project = "getyoursidehustle";
const target = "getyoursidehustle.pages.dev";

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

const records = [
  {
    type: "CNAME",
    name: "getyoursidehustle.com",
    content: target,
    proxied: true,
    ttl: 1,
    comment: "Apex → Cloudflare Pages",
  },
  {
    type: "CNAME",
    name: "www",
    content: target,
    proxied: true,
    ttl: 1,
    comment: "www → Cloudflare Pages",
  },
];

for (const rec of records) {
  const existing = await api(
    `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(
      rec.name.includes(".") ? rec.name : `${rec.name}.getyoursidehustle.com`,
    )}`,
  );
  const found = existing.json.result?.[0];
  if (found) {
    const upd = await api(`/zones/${zoneId}/dns_records/${found.id}`, "PUT", {
      ...rec,
      name: found.name,
    });
    console.log("Updated", rec.name, upd.json.success ? "OK" : upd.json.errors);
  } else {
    const add = await api(`/zones/${zoneId}/dns_records`, "POST", rec);
    console.log("Created", rec.name, add.json.success ? "OK" : add.json.errors);
  }
}

// Re-check Pages domain status after a short wait
await new Promise((r) => setTimeout(r, 3000));
const domains = await api(`/accounts/${accountId}/pages/projects/${project}/domains`);
console.log("\nPages domains:");
for (const d of domains.json.result || []) {
  console.log(`- ${d.name}: ${d.status}`, d.verification_data?.error_message || "");
}

for (const url of ["https://getyoursidehustle.com/", "https://www.getyoursidehustle.com/"]) {
  try {
    const r = await fetch(url, { redirect: "follow" });
    const text = await r.text();
    const title = text.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "(no title)";
    console.log(`\n${url} → ${r.status} | ${title}`);
  } catch (e) {
    console.log(`\n${url} → ERROR ${e.message}`);
  }
}
