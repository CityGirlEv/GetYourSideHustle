import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(
  process.env.APPDATA ?? "",
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const accountId = "100285aafdca60b46f266877fa2fa7dc";
const projectName = "mypartb";

const config = fs.readFileSync(configPath, "utf8");
const match = config.match(/oauth_token = "([^"]+)"/);
if (!match) throw new Error("Run: npx wrangler login");
const token = match[1];

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const json = await res.json();
const configs = json.result?.deployment_configs ?? {};
for (const envName of ["production", "preview"]) {
  console.log(`--- ${envName} env vars ---`);
  const envVars = configs[envName]?.env_vars ?? {};
  for (const [k, v] of Object.entries(envVars)) {
    if (k.includes("SUPABASE_URL")) {
      console.log(`${k}: type=${v.type} value=${v.value}`);
    }
  }
}
