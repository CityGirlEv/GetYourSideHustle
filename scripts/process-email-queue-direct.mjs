/** Process email queue directly (no HTTP) using local .env Resend key. */
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

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
process.env.RESEND_API_KEY = env.RESEND_API_KEY;
process.env.SUPABASE_URL = env.SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
process.env.NODE_ENV = "development";

const { processEmailQueue } = await import("../src/lib/process-email-queue.ts");

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
let total = 0;
for (let round = 1; round <= 50; round++) {
  const result = await processEmailQueue(sb);
  console.log(`Round ${round}:`, JSON.stringify(result));
  total += result.processed ?? 0;
  if (result.skipped && result.reason === "rate_limited") {
    console.log("Rate limited — waiting 60s...");
    await new Promise((r) => setTimeout(r, 60000));
    continue;
  }
  if (result.stopped === "rate_limited") break;
  if ((result.processed ?? 0) === 0 && !result.stopped) break;
  await new Promise((r) => setTimeout(r, 500));
}
console.log("Total processed:", total);
