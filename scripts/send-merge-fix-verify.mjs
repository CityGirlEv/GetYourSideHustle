import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i)] = val;
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const messageId = crypto.randomUUID();
const recipient = process.argv[2] ?? "evelyn3@cox.net";
const origin = (process.argv[3] ?? "https://mypartb.com").replace(/\/$/, "");

await sb.from("email_send_log").insert({
  message_id: messageId,
  template_name: "merge-fix-verify",
  recipient_email: recipient,
  status: "pending",
});

const { error } = await sb.rpc("enqueue_email", {
  queue_name: "transactional_emails",
  payload: {
    message_id: messageId,
    to: recipient,
    from: "The Medicare Optimizer <noreply@mypartb.com>",
    sender_domain: "mypartb.com",
    subject: "New beta registration — Merge Fix Test User",
    html: `<p>If you see this, Cox delivery is working. Merge-field fix deployed ${new Date().toISOString()}. Earlier registration emails may be in Spam/Junk — search for <strong>New beta registration</strong>.</p>`,
    text: "Merge fix deployed. Check spam for earlier registration emails.",
    purpose: "transactional",
    label: "merge-fix-verify",
    idempotency_key: messageId,
    queued_at: new Date().toISOString(),
  },
});
if (error) throw error;

const processRes = await fetch(`${origin}/lovable/email/queue/process`, {
  method: "POST",
  headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
});
console.log("process:", processRes.status, await processRes.text());

const { data: log } = await sb
  .from("email_send_log")
  .select("status, error_message, recipient_email")
  .eq("message_id", messageId)
  .maybeSingle();
console.log("log:", log);
