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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
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
const config = fs.readFileSync(configPath, "utf8");
const token = config.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Run: npx wrangler login");

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/mypartb`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const json = await res.json();
if (!json.success) {
  console.error("CF API error:", json);
  process.exit(1);
}

const prod = json.result?.deployment_configs?.production;
const preview = json.result?.deployment_configs?.preview;
console.log("Production env vars:");
for (const [k, v] of Object.entries(prod?.env_vars ?? {})) {
  console.log(
    `  ${k}: type=${v.type}${v.type === "secret_text" ? "" : ` value=${JSON.stringify(v.value)}`}`,
  );
}
console.log("\nPreview env vars:");
for (const [k, v] of Object.entries(preview?.env_vars ?? {})) {
  console.log(
    `  ${k}: type=${v.type}${v.type === "secret_text" ? "" : ` value=${JSON.stringify(v.value)}`}`,
  );
}

const localKey = loadEnv().RESEND_API_KEY?.trim() ?? "";
console.log(
  "\nLocal RESEND_API_KEY fingerprint:",
  `${localKey.slice(0, 12)}...${localKey.slice(-4)}`,
);

async function probeKey(label, key) {
  const domains = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${key}` },
  }).then((r) => r.json());
  const domain = domains.data?.[0];
  console.log(`\n${label}:`);
  if (!domain) {
    console.log("  no domains");
    return;
  }
  console.log(`  domain=${domain.name} status=${domain.status}`);

  const testRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Part B Optimizer <noreply@mypartb.com>",
      to: ["evelyn3@cox.net"],
      subject: `[probe] ${label}`,
      html: "<p>probe</p>",
    }),
  });
  const testBody = await testRes.text();
  console.log(`  send to evelyn3@cox.net: ${testRes.status} ${testBody.slice(0, 200)}`);
}

await probeKey("local .env key", localKey);
