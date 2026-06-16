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

const { count: pendingCount } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");

const { data: pending } = await sb
  .from("email_send_log")
  .select("id,status,template_name,recipient_email,created_at,message_id")
  .eq("status", "pending")
  .order("created_at", { ascending: false })
  .limit(5);

const { data: failed } = await sb
  .from("email_send_log")
  .select("id,status,template_name,error_message,created_at")
  .eq("status", "failed")
  .order("created_at", { ascending: false })
  .limit(5);

const { count: sentCount } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "sent");

console.log("pending_count:", pendingCount ?? 0);
console.log("sent_count:", sentCount ?? 0);
console.log("recent_pending:", JSON.stringify(pending, null, 2));
console.log("recent_failed:", JSON.stringify(failed, null, 2));

for (const url of [
  "http://localhost:8080/lovable/email/queue/process",
  "https://mypartb.pages.dev/lovable/email/queue/process",
]) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const body = await res.text();
    console.log(`process ${url} -> ${res.status} ${body.slice(0, 400)}`);
  } catch (err) {
    console.log(`process ${url} -> ERROR ${err.message}`);
  }
}
