import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN_ID = "4df35878-a6da-4755-a2a7-d16990218049";

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

const headers = {
  Authorization: `Bearer ${loadEnv().RESEND_API_KEY.trim()}`,
  "User-Agent": "mypartb/1.0",
  "Content-Type": "application/json",
};

for (const suffix of ["/cloudflare", "/dns-provider"]) {
  for (const body of [{}, { provider: "cloudflare" }, { redirect_url: "http://localhost" }]) {
    const res = await fetch(`https://api.resend.com/domains/${DOMAIN_ID}${suffix}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log("POST", suffix, JSON.stringify(body), res.status, text.slice(0, 600));
  }
}
