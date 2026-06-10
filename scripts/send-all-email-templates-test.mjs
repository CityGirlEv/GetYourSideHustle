/**
 * Send every registered email template (transactional + auth) as a test.
 *
 * Usage:
 *   node scripts/send-all-email-templates-test.mjs
 *   node scripts/send-all-email-templates-test.mjs --recipient you@example.com
 *
 * Requires: dev server running (npm run dev), TEST_EMAIL_SECRET in .env
 */
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

const env = loadEnv();
const origin = (env.SITE_ORIGIN || "http://localhost:8080").replace(/\/$/, "");
const secret = env.TEST_EMAIL_SECRET;
const recipientArg = process.argv.find((a) => a.startsWith("--recipient="))?.slice(12)
  ?? process.argv[process.argv.indexOf("--recipient") + 1];
const recipient =
  recipientArg ||
  env.TEST_EMAIL_RECIPIENT ||
  env.ADMIN_NOTIFICATION_EMAILS?.split(",")[0]?.trim() ||
  "riverashretreat@gmail.com";

if (!secret) {
  console.error("TEST_EMAIL_SECRET is not set in .env");
  process.exit(1);
}

console.log(`Sending all templates to ${recipient} via ${origin} ...`);

const res = await fetch(`${origin}/api/public/send-test-email?secret=${encodeURIComponent(secret)}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ all: true, recipient }),
});

const body = await res.text();
let json;
try {
  json = JSON.parse(body);
} catch {
  console.error("Non-JSON response:", res.status, body.slice(0, 500));
  process.exit(1);
}

if (!res.ok) {
  console.error("Request failed:", res.status, json);
  process.exit(1);
}

console.log(`Queued ${json.sent}/${json.templates?.length ?? "?"} templates for ${recipient}`);
if (json.failed > 0) {
  console.error("Failures:");
  for (const r of json.results ?? []) {
    if (!r.ok) console.error(`  - ${r.templateName}: ${r.error}`);
  }
  process.exit(1);
}

for (const r of json.results ?? []) {
  if (r.ok) console.log(`  ✓ ${r.templateName} → ${r.messageId}`);
}

console.log("\nDone. Check inbox (Resend sandbox may only deliver to the account owner until mypartb.com is verified).");
