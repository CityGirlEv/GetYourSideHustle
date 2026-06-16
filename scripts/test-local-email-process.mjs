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

const testPayload = {
  message_id: crypto.randomUUID(),
  to: env.ADMIN_NOTIFICATION_EMAILS?.split(",")[0]?.trim() || "evelyn3@cox.net",
  from: "Get Part B Optimizer <onboarding@resend.dev>",
  sender_domain: "resend.dev",
  subject: `[DIAG] Email queue test ${new Date().toISOString()}`,
  html: "<p>Queue processor diagnostic email.</p>",
  text: "Queue processor diagnostic email.",
  purpose: "transactional",
  label: "diagnostic",
  idempotency_key: `diag-${Date.now()}`,
  queued_at: new Date().toISOString(),
};

const { error: enqErr } = await sb.rpc("enqueue_email", {
  queue_name: "transactional_emails",
  payload: testPayload,
});
if (enqErr) {
  console.error("enqueue failed:", enqErr.message);
  process.exit(1);
}
console.log("enqueued", testPayload.message_id);

const res = await fetch("http://localhost:8080/lovable/email/queue/process", {
  method: "POST",
  headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
});
const body = await res.text();
console.log("process:", res.status, body);

const { data: dlq } = await sb
  .from("email_send_log")
  .select("status,error_message,created_at")
  .eq("message_id", testPayload.message_id)
  .order("created_at", { ascending: false });
console.log("log rows:", dlq);
