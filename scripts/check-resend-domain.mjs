import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    env[line.slice(0, i)] = val;
  }
  return env;
}

const key = loadEnv().RESEND_API_KEY;
const headers = { Authorization: `Bearer ${key}` };
const domains = await fetch("https://api.resend.com/domains", { headers }).then((r) => r.json());
const domain = domains.data?.[0];
if (!domain) {
  console.log("No domains found");
  process.exit(1);
}
const detail = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers }).then((r) =>
  r.json(),
);
console.log("domain:", detail.name, "status:", detail.status);
console.log("records:");
for (const r of detail.records ?? []) {
  console.log(`  ${r.record} ${r.name} -> ${r.status}`);
}
