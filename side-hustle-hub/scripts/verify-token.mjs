import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const cfgPath = path.join(
  os.homedir(),
  "AppData/Roaming/xdg.config/.wrangler/config/default.toml",
);
const cfg = fs.readFileSync(cfgPath, "utf8");
const token = cfg.match(/oauth_token = "([^"]+)"/)?.[1];

const res = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
  headers: { Authorization: `Bearer ${token}` },
});
console.log(JSON.stringify(await res.json(), null, 2));
