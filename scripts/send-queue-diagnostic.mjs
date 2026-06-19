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
const messageId = crypto.randomUUID();
const recipient = process.argv[2] ?? "riverashretreat@gmail.com";

await sb.from("email_send_log").insert({
  message_id: messageId,
  template_name: "post-fix diagnostic",
  recipient_email: recipient,
  status: "pending",
});

const { error } = await sb.rpc("enqueue_email", {
  queue_name: "transactional_emails",
  payload: {
    message_id: messageId,
    to: recipient,
    from: env.EMAIL_FROM ?? "Part B Optimizer <noreply@mypartb.com>",
    sender_domain: env.EMAIL_SENDER_DOMAIN ?? "mypartb.com",
    subject: "[TEST] post-fix diagnostic",
    html: "<p>Queue send after sandbox from fallback fix.</p>",
    text: "Queue send after sandbox from fallback fix.",
    purpose: "transactional",
    label: "post-fix-diagnostic",
    idempotency_key: messageId,
    queued_at: new Date().toISOString(),
  },
});
if (error) throw error;

const processRes = await fetch("https://mypartb.pages.dev/lovable/email/queue/process", {
  method: "POST",
  headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
});
console.log("process:", processRes.status, await processRes.text());

const { data: log } = await sb
  .from("email_send_log")
  .select("status,error_message,recipient_email")
  .eq("message_id", messageId)
  .maybeSingle();
console.log("log:", log);
