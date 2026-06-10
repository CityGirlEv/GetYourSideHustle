import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = process.argv[2] ?? "mypartb.com";

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

const key = loadEnv().RESEND_API_KEY?.trim();
const headers = {
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  "User-Agent": "mypartb-setup/1.0",
};

const create = await fetch("https://api.resend.com/domains", {
  method: "POST",
  headers,
  body: JSON.stringify({ name: DOMAIN, region: "us-east-1" }),
});
console.log("create:", create.status, await create.text());

const list = await fetch("https://api.resend.com/domains", { headers });
const domains = await list.json();
const domain = domains.data?.find((d) => d.name === DOMAIN);
if (!domain) process.exit(1);

const verify = await fetch(`https://api.resend.com/domains/${domain.id}/verify`, {
  method: "POST",
  headers,
});
console.log("verify:", verify.status, await verify.text());

await new Promise((r) => setTimeout(r, 5000));

const detail = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers }).then((r) =>
  r.json(),
);
console.log("status:", detail.status);
console.log(JSON.stringify(detail.records?.map((r) => ({ record: r.record, name: r.name, status: r.status })), null, 2));
