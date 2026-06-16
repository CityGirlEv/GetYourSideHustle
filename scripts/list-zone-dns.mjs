import fs from "fs";

const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
const config = fs.readFileSync(configPath, "utf8");
const token = config.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Run: npx wrangler login");

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function api(path, init) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers, ...init });
  const json = await res.json();
  if (!json.success) {
    console.error(JSON.stringify(json.errors ?? json, null, 2));
    throw new Error(`API failed: ${path}`);
  }
  return json.result;
}

const zoneName = process.argv[2] ?? "mypartb.com";
const zones = await api(`/zones?name=${zoneName}`);
const zone = zones[0];
if (!zone) throw new Error(`Zone not found: ${zoneName}`);
console.log("zone:", zone.name, zone.id);

const records = await api(`/zones/${zone.id}/dns_records?per_page=100`);
for (const r of records) {
  if (r.type === "A" || r.type === "AAAA" || r.type === "CNAME") {
    console.log(`${r.type}\t${r.name}\t${r.content}\tproxied=${r.proxied}\tid=${r.id}`);
  }
}
