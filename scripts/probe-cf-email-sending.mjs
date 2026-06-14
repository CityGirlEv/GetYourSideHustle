import fs from "fs";
import path from "path";

const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const configPath = path.join(
  process.env.APPDATA ?? "",
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const token = fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)[1];
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function api(pathSuffix, init = {}) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}${pathSuffix}`,
    { headers, ...init },
  );
  const json = await res.json();
  console.log(pathSuffix, res.status, json.success, json.errors?.[0]?.message ?? "");
  return json;
}

await api("/email/sending/domains");
await api("/email/sending/addresses");
await api("/email/routing/addresses");
await api("/email/routing/rules");
