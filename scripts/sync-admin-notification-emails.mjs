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
const value = "evelyn3@cox.net,sharpebanker@yahoo.com,info@mypartb.com,getpartb@gmail.com";

function readToken() {
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/oauth_token = "([^"]+)"/);
  if (!match) throw new Error("Wrangler OAuth token not found. Run: npx wrangler login");
  return match[1];
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
const projectJson = await projectRes.json();
if (!projectJson.success) {
  console.error(JSON.stringify(projectJson.errors, null, 2));
  process.exit(1);
}

const production = projectJson.result?.deployment_configs?.production ?? {};
const envVars = { ...(production.env_vars ?? {}) };
envVars.ADMIN_NOTIFICATION_EMAILS = { type: "plain_text", value };

const patchRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
  {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      deployment_configs: {
        ...projectJson.result.deployment_configs,
        production: { ...production, env_vars: envVars },
      },
    }),
  },
);
const patchJson = await patchRes.json();
if (!patchJson.success) {
  console.error(JSON.stringify(patchJson.errors, null, 2));
  process.exit(1);
}

console.log("Updated ADMIN_NOTIFICATION_EMAILS on Cloudflare Pages production:");
console.log(value);
