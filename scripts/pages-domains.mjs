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
    console.error(JSON.stringify(json.errors ?? json, null, 2));
    throw new Error(`API failed: ${path}`);
  }
  return json.result;
}

const action = process.argv[2] ?? "list";
const domain = process.argv[3];

if (action === "list") {
  const proj = await api(`/accounts/${accountId}/pages/projects/${project}`);
  console.log("subdomain:", proj.subdomain);
  console.log("production_branch:", proj.production_branch);
  console.log("domains:", proj.domains);
  const custom = await api(`/accounts/${accountId}/pages/projects/${project}/domains`);
  console.log("custom_domains:", JSON.stringify(custom, null, 2));
}

if (action === "add" && domain) {
  const result = await api(`/accounts/${accountId}/pages/projects/${project}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });
  console.log("added:", JSON.stringify(result, null, 2));
}

if (action === "detail" && domain) {
  const custom = await api(`/accounts/${accountId}/pages/projects/${project}/domains`);
  const match = custom.find((d) => d.name === domain);
  console.log(JSON.stringify(match, null, 2));
}

if (action === "validate" && domain) {
  const custom = await api(`/accounts/${accountId}/pages/projects/${project}/domains`);
  const match = custom.find((d) => d.name === domain);
  if (!match) throw new Error(`Domain not on project: ${domain}`);
  const result = await api(
    `/accounts/${accountId}/pages/projects/${project}/domains/${match.id}/validate`,
    { method: "POST" },
  );
  console.log(JSON.stringify(result, null, 2));
}
