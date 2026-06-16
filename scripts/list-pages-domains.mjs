import fs from "fs";

const token = fs
  .readFileSync(`${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`, "utf8")
  .match(/oauth_token = "([^"]+)"/)?.[1];
const accountId = "100285aafdca60b46f266877fa2fa7dc";
const headers = { Authorization: `Bearer ${token}` };

const proj = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/mypartb`,
  { headers },
).then((r) => r.json());

console.log("canonical:", proj.result?.canonical_deployment?.url);
for (const d of proj.result?.domains ?? []) {
  console.log(`${d.name}: ${d.status} ${d.verification_data?.status ?? ""}`);
}

const domRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/mypartb/domains`,
  { headers },
).then((r) => r.json());
console.log("\ndomains endpoint:", JSON.stringify(domRes.result ?? domRes.errors, null, 2));
