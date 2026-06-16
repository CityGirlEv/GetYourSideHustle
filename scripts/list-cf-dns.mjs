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
const config = fs.readFileSync(configPath, "utf8");
const token = config.match(/oauth_token = "([^"]+)"/)[1];

const res = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=5`,
  { headers: { Authorization: `Bearer ${token}` } },
);
console.log(await res.json());
