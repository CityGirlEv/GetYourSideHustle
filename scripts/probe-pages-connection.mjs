import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i)] = val;
  }
  return env;
}

const configPath = path.join(
  process.env.APPDATA ?? "",
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const token = fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Run: npx wrangler login");

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const headers = { Authorization: `Bearer ${token}` };
const env = loadEnv();

const projRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/mypartb`,
  { headers },
);
const proj = (await projRes.json()).result;

console.log("production_branch:", proj.production_branch);
console.log("canonical_deployment:", proj.canonical_deployment?.url);
console.log("latest_deployment:", proj.latest_deployment?.url, proj.latest_deployment?.environment);
console.log(
  "custom_domains:",
  (proj.domains ?? []).map((d) => `${d.name} (${d.status})`).join(", ") || "(none)",
);

const prodEnv = proj.deployment_configs?.production?.env_vars ?? {};
const prodKeys = Object.keys(prodEnv).sort();
console.log("\nproduction env keys:", prodKeys.join(", "));
console.log("has PUBLIC_SITE_URL:", "PUBLIC_SITE_URL" in prodEnv);
console.log("has SITE_ORIGIN:", "SITE_ORIGIN" in prodEnv);
console.log("has RESEND_API_KEY:", "RESEND_API_KEY" in prodEnv);

const origins = [
  "https://mypartb.com",
  proj.canonical_deployment?.url,
  proj.latest_deployment?.url,
].filter(Boolean);

console.log("\nQueue processor probe (needs valid service role):");
for (const origin of [...new Set(origins)]) {
  try {
    const res = await fetch(`${origin.replace(/\/$/, "")}/lovable/email/queue/process`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const body = await res.text();
    console.log(`  ${origin}: ${res.status} ${body.slice(0, 120)}`);
  } catch (err) {
    console.log(`  ${origin}: ERROR ${err.message}`);
  }
}
