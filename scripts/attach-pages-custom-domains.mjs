/**
 * Attach custom domains to Cloudflare Pages project mypartb.
 * Usage: node scripts/attach-pages-custom-domains.mjs [domain ...]
 */
import fs from "fs";

const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
const config = fs.readFileSync(configPath, "utf8");
const token = config.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error("Run: npx wrangler login");

const accountId = "100285aafdca60b46f266877fa2fa7dc";
const project = "mypartb";
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function api(path, init) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers, ...init });
  const json = await res.json();
  if (!json.success) {
    throw new Error(`${path}: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.result;
}

async function addPagesDomain(name) {
  try {
    const result = await api(`/accounts/${accountId}/pages/projects/${project}/domains`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    console.log(`Pages domain added: ${name} (${result?.status ?? "pending"})`);
  } catch (e) {
    const msg = String(e.message ?? e);
    if (msg.includes("already") || msg.includes("8000018") || msg.includes("duplicate")) {
      console.log(`Pages domain already registered: ${name}`);
    } else {
      console.warn(`Pages domain ${name}:`, msg);
    }
  }
}

// mypartb.com + www.mypartb.com are served by the Worker (routes), not Pages.
const defaults = [
  "themedicareoptimizer.com",
  "www.themedicareoptimizer.com",
  "www.mypartb.com",
];

const domains = process.argv.slice(2).length ? process.argv.slice(2) : defaults;

for (const domain of domains) {
  await addPagesDomain(domain);
}

const custom = await api(`/accounts/${accountId}/pages/projects/${project}/domains`);
console.log("\nCustom domains:");
for (const d of custom) {
  console.log(
    `  ${d.name}: ${d.status ?? d.verification_data?.status ?? "?"}` +
      (d.verification_data?.error_message ? ` (${d.verification_data.error_message})` : ""),
  );
}

console.log(
  "\nIf status is pending, point DNS apex CNAME @ → mypartb.pages.dev (proxied) in Cloudflare DNS for each zone.",
);
