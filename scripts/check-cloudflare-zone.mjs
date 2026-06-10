import fs from "fs";
import path from "path";

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
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const zonesRes = await fetch("https://api.cloudflare.com/client/v4/zones?name=mypartb.com", {
  headers,
});
const zones = await zonesRes.json();
console.log("zones:", JSON.stringify(zones, null, 2));
