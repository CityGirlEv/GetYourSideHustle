import fs from "node:fs";

const env = fs.readFileSync(".env", "utf8");
const match = env.match(/^FACEBOOK_ACCESS_TOKEN=(.+)$/m);
if (!match) {
  console.log("NO_TOKEN");
  process.exit(0);
}
const token = match[1].replace(/^["']|["']$/g, "");
const fields =
  "page_id,page_name,ad_snapshot_url,ad_creative_body,ad_creative_link_title,ad_creative_link_description";
const base = "https://graph.facebook.com/v20.0/ads_archive";

async function q(params) {
  const u = `${base}?${new URLSearchParams({ ...params, access_token: token, fields, limit: "3" })}`;
  const r = await fetch(u);
  const j = await r.json();
  return {
    status: r.status,
    dataLen: j.data?.length ?? 0,
    error: j.error ? { message: j.error.message, code: j.error.code, type: j.error.type } : null,
  };
}

console.log("WITHOUT countries:", await q({ search_terms: "medicare" }));
console.log(
  "WITH countries ALL:",
  await q({ search_terms: "medicare", ad_reached_countries: '["US"]', ad_type: "ALL" }),
);
console.log(
  "WITH countries FINANCIAL:",
  await q({
    search_terms: "medicare",
    ad_reached_countries: '["US"]',
    ad_type: "FINANCIAL_PRODUCTS_AND_SERVICES_ADS",
  }),
);
