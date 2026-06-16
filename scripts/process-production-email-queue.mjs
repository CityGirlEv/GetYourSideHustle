/** Drain production email queue (mypartb.pages.dev). */
import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const url =
  process.argv[2]?.replace(/\/$/, "") ??
  "https://mypartb.pages.dev/lovable/email/queue/process";

console.log("Processing:", url);

let total = 0;
for (let round = 1; round <= 50; round++) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const body = await res.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    console.error("Round", round, "non-JSON:", res.status, body.slice(0, 400));
    break;
  }
  console.log(`Round ${round}:`, JSON.stringify(json));
  if (!res.ok) break;
  total += json.processed ?? 0;
  if (json.skipped && json.reason === "rate_limited") {
    console.log("Rate limited — waiting 60s...");
    await new Promise((r) => setTimeout(r, 60000));
    continue;
  }
  if (json.stopped === "rate_limited") {
    console.log("Stopped — rate limited mid-batch");
    break;
  }
  if ((json.processed ?? 0) === 0 && !json.stopped) break;
  await new Promise((r) => setTimeout(r, 500));
}

console.log("Total processed:", total);
