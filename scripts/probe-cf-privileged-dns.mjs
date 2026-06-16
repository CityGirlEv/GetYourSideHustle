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
  ["routing dns send", { name: "send.mypartb.com" }],
  ["routing dns notify", { name: "notify.mypartb.com" }],
  ["sending subdomain notify", null],
];

for (const [label, body] of tests) {
  const url = label.startsWith("sending")
    ? `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/sending/subdomains`
    : `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/dns`;
  const init = label.startsWith("sending")
    ? { method: "POST", body: JSON.stringify({ name: "notify.mypartb.com" }) }
    : { method: "POST", body: JSON.stringify(body) };
  const res = await fetch(url, { headers, ...init });
  const json = await res.json();
  console.log(
    label,
    res.status,
    json.success,
    json.errors?.[0]?.message ?? "",
    json.result?.status ?? "",
  );
}

// Try connectivity admin endpoints
for (const pathSuffix of ["/connectivity/dns", "/dns_records/import"]) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}${pathSuffix}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      records: [
        {
          type: "TXT",
          name: "resend._domainkey.mypartb.com",
          content: NEW_DKIM,
          ttl: 1,
        },
      ],
    }),
  });
  const json = await res.json();
  console.log("POST", pathSuffix, res.status, json.success, json.errors?.[0]?.message ?? "");
}
