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
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: recent, error } = await sb
  .from("email_send_log")
  .select("template_name, recipient_email, status, error_message, created_at, message_id")
  .order("created_at", { ascending: false })
  .limit(40);

if (error) {
  console.error("log query failed:", error.message);
  process.exit(1);
}

const byStatus = {};
for (const row of recent ?? []) {
  byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
}

console.log("recent_by_status:", byStatus);
console.log(JSON.stringify(recent, null, 2));

const res = await fetch("https://api.resend.com/domains", {
  headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
});
console.log("\nresend domains:", res.status, await res.text());
