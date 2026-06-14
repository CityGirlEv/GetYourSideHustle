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

const NEW_DKIM =
  "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOjY4YgWZ7QVU0tko17cZ2ZliGR/A4GN3FoWm7ahqYVApDpvmpqt4qWKJKTO8D9YwMxN1PMlSEhKUnXe702xBFmr3HAe7ZRxNmDUxtHC1e8ejIioL1Q1SRiVJc4vmoIPb+N7kIRpbSXpSF/IuAgUNjvsEk89CK8+PQ9zhwpfmI9QIDAQAB";

const tests = [
  [
    "POST email/routing/dns",
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/dns`,
    { method: "POST", body: JSON.stringify({ name: "mypartb.com" }) },
  ],
  [
    "PATCH resend dkim via dns_records",
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/resend._domainkey`,
    {
      method: "PATCH",
      body: JSON.stringify({
        type: "TXT",
        name: "resend._domainkey.mypartb.com",
        content: NEW_DKIM,
        ttl: 1,
      }),
    },
  ],
];

for (const [label, url, init] of tests) {
  const res = await fetch(url, { headers, ...init });
  const json = await res.json();
  console.log(label, res.status, json.success, json.errors?.[0]?.message ?? "");
}
