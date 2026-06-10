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

function readToken() {
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/oauth_token = "([^"]+)"/);
  if (!match) throw new Error("Run: npx wrangler login");
  return match[1];
}

const token = readToken();
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const getRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
  { headers },
);
const current = await getRes.json();
if (!current.success) {
  console.error("Failed to fetch project:", current);
  process.exit(1);
}

const production = current.result.deployment_configs?.production ?? {};
const patchRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
  {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      deployment_configs: {
        production: {
          ...production,
          compatibility_flags: ["nodejs_compat"],
          compatibility_date: "2026-06-05",
        },
        preview: {
          ...(current.result.deployment_configs?.preview ?? {}),
          compatibility_flags: ["nodejs_compat"],
          compatibility_date: "2026-06-05",
        },
      },
    }),
  },
);
const patchJson = await patchRes.json();
if (!patchJson.success) {
  console.error("Failed to patch project:", JSON.stringify(patchJson, null, 2));
  process.exit(1);
}
console.log("Updated Cloudflare Pages compatibility flags");
