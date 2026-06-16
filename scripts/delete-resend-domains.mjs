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

const key = loadEnv().RESEND_API_KEY?.trim();
const headers = {
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  "User-Agent": "mypartb-setup/1.0",
};

const list = await fetch("https://api.resend.com/domains", { headers });
const domains = await list.json();
console.log(
  "domains:",
  JSON.stringify(
    domains.data?.map((d) => ({ id: d.id, name: d.name, status: d.status })),
    null,
    2,
  ),
);

for (const d of domains.data ?? []) {
  const del = await fetch(`https://api.resend.com/domains/${d.id}`, { method: "DELETE", headers });
  console.log("delete", d.name, del.status, await del.text());
}
