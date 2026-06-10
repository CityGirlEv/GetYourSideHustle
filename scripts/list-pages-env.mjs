import fs from "fs";
import path from "path";

const ACCOUNT_ID = "100285aafdca60b46f266877fa2fa7dc";
const PROJECT = "mypartb";
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
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`,
  { headers },
);
const json = await res.json();
if (!json.success) {
  console.error(json.errors);
  process.exit(1);
}
const env = json.result?.deployment_configs?.production?.env_vars ?? {};
for (const [k, v] of Object.entries(env)) {
  const val = v?.value ?? "(secret)";
  const display =
    k.includes("KEY") || k.includes("TOKEN") || k.includes("SECRET")
      ? val === "(secret)"
        ? "(encrypted secret)"
        : `${String(val).slice(0, 8)}...`
      : val;
  console.log(k, display);
}
