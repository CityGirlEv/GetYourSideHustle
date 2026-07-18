import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const project = "getyoursidehustle";
const domains = ["getyoursidehustle.com", "www.getyoursidehustle.com"];

const cfgPath = path.join(
  os.homedir(),
  "AppData/Roaming/xdg.config/.wrangler/config/default.toml",
);
const cfg = fs.readFileSync(cfgPath, "utf8");
const token = cfg.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Missing wrangler oauth token — run: wrangler login");

async function api(apiPath, method = "GET", body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, json };
}

const zones = await api("/zones?name=getyoursidehustle.com");
console.log(
  "Zone:",
  zones.json.result?.map((z) => ({ id: z.id, name: z.name, status: z.status })) ??
    zones.json.errors ??
    zones.json,
);

const existing = await api(`/accounts/${accountId}/pages/projects/${project}/domains`);
const attached = existing.json.result ?? [];

for (const name of domains) {
  if (attached.some((d) => d.name === name)) {
    console.log(`Already attached: ${name}`);
    continue;
  }
  const add = await api(
    `/accounts/${accountId}/pages/projects/${project}/domains`,
    "POST",
    { name },
  );
  if (add.json.success) {
    console.log(`Attached: ${name}`, add.json.result?.status ?? add.json.result);
  } else {
    console.error(`Failed: ${name}`, add.json.errors ?? add.json);
  }
}
