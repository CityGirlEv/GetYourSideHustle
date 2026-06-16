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

const records = [
  {
    type: "TXT",
    name: "resend._domainkey.mypartb.com",
    content:
      "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOjY4YgWZ7QVU0tko17cZ2ZliGR/A4GN3FoWm7ahqYVApDpvmpqt4qWKJKTO8D9YwMxN1PMlSEhKUnXe702xBFmr3HAe7ZRxNmDUxtHC1e8ejIioL1Q1SRiVJc4vmoIPb+N7kIRpbSXpSF/IuAgUNjvsEk89CK8+PQ9zhwpfmI9QIDAQAB",
  },
  {
    type: "MX",
    name: "send.mypartb.com",
    content: "feedback-smtp.us-east-1.amazonses.com",
    priority: 10,
  },
  {
    type: "TXT",
    name: "send.mypartb.com",
    content: "v=spf1 include:amazonses.com ~all",
  },
];

for (const rec of records) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: rec.type,
      name: rec.name,
      content: rec.content,
      ttl: 1,
      proxied: false,
      ...(rec.priority != null ? { priority: rec.priority } : {}),
    }),
  });
  const json = await res.json();
  console.log(rec.type, rec.name, json.success ? "ok" : (json.errors?.[0]?.message ?? json.errors));
}
