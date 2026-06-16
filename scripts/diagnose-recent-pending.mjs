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

const ids = [
  "4443561e-b95f-49ae-bb38-077c8c272a54",
  "42ee3ac9-b423-4b2a-93a9-2fa40a29ddd7",
  "8b1498a9-4a96-4b26-9d03-cffdaf836d7f",
  "d04a7029-376f-4997-8e0e-621a6eefd400",
];

for (const messageId of ids) {
  const { data } = await sb
    .from("email_send_log")
    .select("id, status, template_name, error_message, created_at")
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });
  console.log("\n", messageId.slice(0, 8), JSON.stringify(data, null, 2));
}

const { count: pendingCount } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");

console.log("\npending_count:", pendingCount);

const { data: stillPending } = await sb
  .from("email_send_log")
  .select("template_name, recipient_email, status, created_at, message_id")
  .eq("status", "pending")
  .order("created_at", { ascending: false })
  .limit(20);
console.log("\nstill_pending:", JSON.stringify(stillPending, null, 2));
