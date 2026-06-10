/** Drain transactional + auth email queues via local dev server. */
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
const origins = [
  env.SITE_ORIGIN,
  "http://localhost:8080",
  "http://localhost:8081",
].filter(Boolean);

let origin = null;
for (const o of origins) {
  try {
    const ping = await fetch(o.replace(/\/$/, "") + "/");
    if (ping.ok || ping.status < 500) {
      origin = o.replace(/\/$/, "");
      break;
    }
  } catch {
    /* try next */
  }
}

if (!origin) {
  console.error("No dev server found on 8080/8081. Run: npm run dev");
  process.exit(1);
}

console.log("Using origin:", origin);

let total = 0;
for (let round = 1; round <= 30; round++) {
  const res = await fetch(`${origin}/lovable/email/queue/process`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const body = await res.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    console.error("Round", round, "non-JSON:", res.status, body.slice(0, 300));
    break;
  }
  console.log(`Round ${round}:`, res.status, JSON.stringify(json));
  if (!res.ok) break;
  const n = json.processed ?? 0;
  total += n;
  if (n === 0 && !json.skipped) break;
  if (json.skipped && json.reason === "rate_limited") {
    console.log("Rate limited — waiting 60s...");
    await new Promise((r) => setTimeout(r, 60000));
    continue;
  }
  if (n === 0) break;
  await new Promise((r) => setTimeout(r, 500));
}

console.log("Total processed:", total);
