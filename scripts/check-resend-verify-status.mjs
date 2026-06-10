import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const DOMAIN = "mypartb.com";
const key = loadEnv().RESEND_API_KEY?.trim();
const headers = { Authorization: `Bearer ${key}` };

const domainsRes = await fetch("https://api.resend.com/domains", { headers });
const domains = await domainsRes.json();
const domain = domains.data?.find((d) => d.name === DOMAIN);

const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers });
const detail = await detailRes.json();

console.log("domain status:", detail.status);
console.log(JSON.stringify(detail.records, null, 2));

const verifyRes = await fetch(`https://api.resend.com/domains/${domain.id}/verify`, {
  method: "POST",
  headers,
});
console.log("\nverify response:", verifyRes.status, await verifyRes.text());

await new Promise((r) => setTimeout(r, 3000));

const afterRes = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers });
const after = await afterRes.json();
console.log("\ndomain status after verify:", after.status);
console.log(JSON.stringify(after.records?.map((r) => ({ record: r.record, name: r.name, status: r.status, value: r.value?.slice?.(0, 40) })), null, 2));
