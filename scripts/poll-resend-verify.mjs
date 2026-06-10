/**
 * Poll Resend until mypartb.com verifies (run after updating DKIM in Cloudflare).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const maxAttempts = Number(process.argv[2] ?? 12);
const waitMs = Number(process.argv[3] ?? 15000);

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

const list = await fetch("https://api.resend.com/domains", { headers });
const domain = (await list.json()).data?.find((d) => d.name === "mypartb.com");
if (!domain) throw new Error("mypartb.com not found in Resend");

for (let i = 1; i <= maxAttempts; i++) {
  await fetch(`https://api.resend.com/domains/${domain.id}/verify`, { method: "POST", headers });
  const detail = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers }).then((r) =>
    r.json(),
  );
  console.log(`attempt ${i}/${maxAttempts}: ${detail.status}`);
  if (detail.status === "verified") {
    console.log("Domain verified.");
    process.exit(0);
  }
  if (i < maxAttempts) await new Promise((r) => setTimeout(r, waitMs));
}

console.log("Still not verified. Check DKIM TXT in Cloudflare matches Resend.");
process.exit(1);
