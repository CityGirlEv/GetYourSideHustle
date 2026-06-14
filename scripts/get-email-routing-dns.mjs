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

const res = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/dns?name=notify.mypartb.com`,
  { headers },
);
const json = await res.json();
console.log(JSON.stringify(json, null, 2));

const settings = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing`,
  { headers },
);
console.log("routing settings", settings.status, await settings.text());
