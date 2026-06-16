/** Send new-registration-admin test through production (verifies merge fields). */
import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
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

const env = loadEnv();
const secret = env.TEST_EMAIL_SECRET;
const recipient = process.argv[2] ?? "evelyn3@cox.net";
const origin = (process.argv[3] ?? "https://mypartb.com").replace(/\/$/, "");

if (!secret) {
  console.error("TEST_EMAIL_SECRET missing in .env");
  process.exit(1);
}

console.log(`POST ${origin}/api/public/send-test-email → ${recipient} (new-registration-admin)`);

const res = await fetch(
  `${origin}/api/public/send-test-email?secret=${encodeURIComponent(secret)}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template: "new-registration-admin", recipient }),
  },
);

const body = await res.text();
console.log("status:", res.status);
console.log(body);
