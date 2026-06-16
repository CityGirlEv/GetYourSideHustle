import fs from "fs";

const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
const config = fs.readFileSync(configPath, "utf8");
const token = config.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Run: npx wrangler login");

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const target = "mypartb.pages.dev";

async function api(path, init) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers, ...init });
  const json = await res.json();
  return json;
}

async function pointZoneToPages(zoneName) {
  const zones = (await api(`/zones?name=${encodeURIComponent(zoneName)}`)).result ?? [];
  const zone = zones[0];
  if (!zone) {
    console.log(`skip ${zoneName}: zone not found in account`);
    return;
  }

  console.log(`\n=== ${zoneName} (${zone.id}) ===`);
  const list = await api(`/zones/${zone.id}/dns_records?per_page=100`);
  if (!list.success) {
    console.log("DNS list failed:", JSON.stringify(list.errors));
    return;
  }

  const records = list.result ?? [];
  const rootRecords = records.filter(
    (r) =>
      (r.name === zoneName || r.name === "@") &&
      (r.type === "A" || r.type === "AAAA" || r.type === "CNAME"),
  );

  for (const r of rootRecords) {
    console.log(`delete ${r.type} ${r.name} -> ${r.content}`);
    const del = await api(`/zones/${zone.id}/dns_records/${r.id}`, { method: "DELETE" });
    if (!del.success) console.log("  delete failed:", JSON.stringify(del.errors));
  }

  console.log(`create CNAME ${zoneName} -> ${target}`);
  const create = await api(`/zones/${zone.id}/dns_records`, {
    method: "POST",
    body: JSON.stringify({
      type: "CNAME",
      name: "@",
      content: target,
      proxied: true,
      ttl: 1,
    }),
  });
  if (!create.success) {
    console.log("  create failed:", JSON.stringify(create.errors));
    return;
  }
  console.log("  ok:", create.result?.id);
}

for (const zoneName of ["mypartb.com", "getpartb.com", "www.mypartb.com", "www.getpartb.com"]) {
  if (zoneName.startsWith("www.")) {
    const apex = zoneName.slice(4);
    const zones = (await api(`/zones?name=${encodeURIComponent(apex)}`)).result ?? [];
    const zone = zones[0];
    if (!zone) continue;
    console.log(`\n=== ${zoneName} CNAME -> ${apex} ===`);
    const create = await api(`/zones/${zone.id}/dns_records`, {
      method: "POST",
      body: JSON.stringify({
        type: "CNAME",
        name: "www",
        content: apex,
        proxied: true,
        ttl: 1,
      }),
    });
    if (!create.success) console.log("  www create failed:", JSON.stringify(create.errors));
    else console.log("  www ok");
    continue;
  }
  await pointZoneToPages(zoneName);
}

console.log("\nDone. Re-check Pages custom domain status in ~1 min.");
