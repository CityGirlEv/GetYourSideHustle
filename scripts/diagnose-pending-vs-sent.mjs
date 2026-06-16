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

const { data: pending } = await sb
  .from("email_send_log")
  .select("message_id, template_name, recipient_email, created_at")
  .eq("status", "pending")
  .order("created_at", { ascending: false });

for (const row of pending ?? []) {
  const { data: sent } = await sb
    .from("email_send_log")
    .select("id, created_at")
    .eq("message_id", row.message_id)
    .eq("status", "sent")
    .maybeSingle();
  console.log(
    row.message_id?.slice(0, 8),
    row.template_name,
    sent ? "ALSO_HAS_SENT" : "NO_SENT_ROW",
    row.created_at,
  );
}
