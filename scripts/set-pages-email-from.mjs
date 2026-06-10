import fs from "fs";
import path from "path";

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const projectName = "mypartb";
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

const projectRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
  { headers },
);
const projectJson = await projectRes.json();
if (!projectJson.success) throw new Error(JSON.stringify(projectJson.errors));

const production = projectJson.result?.deployment_configs?.production ?? {};
const envVars = { ...(production.env_vars ?? {}) };
envVars.EMAIL_FROM = { type: "plain_text", value: "The Medicare Optimizer <noreply@mypartb.com>" };
envVars.EMAIL_SENDER_DOMAIN = { type: "plain_text", value: "mypartb.com" };

const patchRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
  {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      deployment_configs: {
        ...projectJson.result.deployment_configs,
        production: {
          ...production,
          env_vars: envVars,
        },
      },
    }),
  },
);
const patchJson = await patchRes.json();
console.log("patch:", patchJson.success ? "ok" : patchJson.errors);
if (patchJson.success) {
  console.log("Set EMAIL_FROM and EMAIL_SENDER_DOMAIN on Cloudflare Pages production.");
}
