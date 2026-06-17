import fs from "fs";

const configPath = `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`;
const token = fs.readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)?.[1];
const accountId = "100285aafdca60b46f266877fa2fa7dc";

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/mypartb`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const proj = (await res.json()).result;
console.log("production_branch:", proj.production_branch);
console.log("latest:", proj.latest_deployment?.url, proj.latest_deployment?.deployment_trigger?.metadata?.commit_hash?.slice(0, 7));
console.log("canonical:", proj.canonical_deployment?.url, proj.canonical_deployment?.deployment_trigger?.metadata?.commit_hash?.slice(0, 7));

const depRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/mypartb/deployments?per_page=8`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const deps = (await depRes.json()).result ?? [];
for (const d of deps) {
  const m = d.deployment_trigger?.metadata ?? {};
  console.log(
    d.id.slice(0, 8),
    d.environment,
    m.branch ?? "-",
    (m.commit_hash ?? "").slice(0, 7),
    d.latest_stage?.status,
    d.url,
  );
}
