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
const envPath = path.join(__dirname, "..", ".env");
const accountId = "100285aafdca60b46f266877fa2fa7dc";
const projectName = "mypartb";

function readToken() {
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/oauth_token = "([^"]+)"/);
  if (!match) throw new Error("Wrangler OAuth token not found. Run: npx wrangler login");
  return match[1];
}

function setEnvLine(content, key, value) {
  const line = `${key}="${String(value).replace(/"/g, '\\"')}"`;
  const re = new RegExp(`^${key}=.*$`, "m");
  return re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

const token = readToken();
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const projectRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
  { headers },
);

if (!projectRes.ok) {
  console.error("Cloudflare API error:", projectRes.status, await projectRes.text());
  process.exit(1);
}

const projectJson = await projectRes.json();
const envVars =
  projectJson.result?.deployment_configs?.production?.env_vars ??
  projectJson.result?.latest_deployment?.env_vars ??
  {};

const byName = {};
for (const [name, entry] of Object.entries(envVars)) {
  if (entry?.value) byName[name] = entry.value;
}

const required = [
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const missing = required.filter((name) => !byName[name]);
if (missing.length) {
  console.error(
    "Could not retrieve encrypted secret values from Cloudflare:",
    missing.join(", "),
  );
  console.error(
    "Cloudflare only exposes secret values in the dashboard. Open:",
  );
  console.error(
    "https://dash.cloudflare.com/" + accountId + "/pages/view/" + projectName + "/settings/environment-variables",
  );
  process.exit(1);
}

const supabaseUrl =
  byName.SUPABASE_URL ??
  byName.VITE_SUPABASE_URL ??
  "https://xiqknyrikpuysbkvpkju.supabase.co";

let content = fs.readFileSync(envPath, "utf8");
content = setEnvLine(content, "SUPABASE_URL", supabaseUrl);
content = setEnvLine(content, "SUPABASE_PUBLISHABLE_KEY", byName.SUPABASE_PUBLISHABLE_KEY);
content = setEnvLine(content, "SUPABASE_SERVICE_ROLE_KEY", byName.SUPABASE_SERVICE_ROLE_KEY);
content = setEnvLine(content, "VITE_SUPABASE_URL", byName.VITE_SUPABASE_URL ?? supabaseUrl);
content = setEnvLine(
  content,
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  byName.VITE_SUPABASE_PUBLISHABLE_KEY ?? byName.SUPABASE_PUBLISHABLE_KEY,
);
if (byName.RESEND_API_KEY) content = setEnvLine(content, "RESEND_API_KEY", byName.RESEND_API_KEY);
content = setEnvLine(content, "SITE_ORIGIN", "http://localhost:8080");
content = setEnvLine(content, "PUBLIC_SITE_URL", "http://localhost:8080");

fs.writeFileSync(envPath, content);
console.log("Synced Cloudflare production env vars into .env");
