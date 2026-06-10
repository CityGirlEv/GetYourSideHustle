import fs from "fs";
import path from "path";

const ZONE_ID = "bc51ba8f291107c7c8bc930ffc3a0ef2";
const configPath = path.join(
  process.env.APPDATA ?? "",
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const token = fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)[1];
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const list = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=100`,
  { headers },
);
const json = await list.json();
console.log("list success:", json.success, json.errors);
const dkim = json.result?.filter((r) => r.name.includes("resend._domainkey"));
console.log("dkim records:", JSON.stringify(dkim, null, 2));

const NEW_DKIM =
  "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOjY4YgWZ7QVU0tko17cZ2ZliGR/A4GN3FoWm7ahqYVApDpvmpqt4qWKJKTO8D9YwMxN1PMlSEhKUnXe702xBFmr3HAe7ZRxNmDUxtHC1e8ejIioL1Q1SRiVJc4vmoIPb+N7kIRpbSXpSF/IuAgUNjvsEk89CK8+PQ9zhwpfmI9QIDAQAB";

if (dkim?.[0]) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${dkim[0].id}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        type: "TXT",
        name: dkim[0].name,
        content: NEW_DKIM,
        ttl: 1,
        proxied: false,
      }),
    },
  );
  const upd = await res.json();
  console.log("update dkim:", upd.success, upd.errors);
}
