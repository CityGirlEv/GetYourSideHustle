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

function readToken() {
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/oauth_token = "([^"]+)"/);
  if (!match) throw new Error("Run: npx wrangler login");
  return match[1];
}

const token = readToken();
console.log("Token length:", token.length);

const res = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=5`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  },
);

console.log("Status:", res.status);
console.log("Headers:", Object.fromEntries(res.headers.entries()));
console.log("Body:", await res.json());
