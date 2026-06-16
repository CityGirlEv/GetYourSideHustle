import fs from "fs";

const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
const config = fs.readFileSync(configPath, "utf8");
const token = config.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Run: npx wrangler login");

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const project = "mypartb";
const headers = { Authorization: `Bearer ${token}` };

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}`,
  { headers },
);
const json = await res.json();
if (!json.success) {
  console.error(JSON.stringify(json.errors, null, 2));
  process.exit(1);
}

const prod = json.result?.deployment_configs?.production ?? {};
console.log("plain env_vars:");
for (const [name, entry] of Object.entries(prod.env_vars ?? {})) {
  const type = entry?.type ?? "?";
  const hasValue = Boolean(entry?.value);
  console.log(`  ${name}: type=${type} hasValue=${hasValue}`);
}
