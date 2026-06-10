import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = process.argv[2] ?? "notify.mypartb.com";

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
const headers = { Authorization: `Bearer ${key}`, "User-Agent": "mypartb-setup/1.0" };

const list = await fetch("https://api.resend.com/domains", { headers });
const domain = (await list.json()).data?.find((d) => d.name === DOMAIN);
if (!domain) throw new Error(`Domain ${DOMAIN} not found`);

const detail = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers }).then((r) =>
  r.json(),
);
console.log(JSON.stringify(detail, null, 2));
