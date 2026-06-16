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
const resendKey = env.RESEND_API_KEY;
const from =
  env.EMAIL_FROM ?? "Get Part B Optimizer <noreply@mypartb.com>";

async function sendViaResend(payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      ...(payload.idempotency_key
        ? { "Idempotency-Key": String(payload.idempotency_key) }
        : {}),
    },
    body: JSON.stringify({
      from: payload.from || from,
      to: [String(payload.to)],
      subject: String(payload.subject),
      html: String(payload.html),
      text: payload.text ? String(payload.text) : undefined,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${body.slice(0, 500)}`);
  return body;
}

async function markLog(messageId, status, errorMessage, templateName, recipientEmail) {
  if (!messageId) return;
  const { data: existing } = await sb
    .from("email_send_log")
    .select("id")
    .eq("message_id", messageId)
    .eq("status", status)
    .maybeSingle();
  if (existing) return;
  await sb.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: recipientEmail,
    status,
    error_message: errorMessage,
  });
}

let total = 0;
for (const queue of ["transactional_emails", "auth_emails"]) {
  for (let round = 1; round <= 30; round++) {
    const { data: messages, error } = await sb.rpc("read_email_batch", {
      queue_name: queue,
      batch_size: 10,
      vt: 30,
    });
    if (error) {
      console.error(queue, error.message);
      break;
    }
    if (!messages?.length) {
      console.log(queue, "empty at round", round);
      break;
    }
    console.log(queue, "batch", round, "size", messages.length);
    for (const msg of messages) {
      const payload = msg.message ?? {};
      const to = String(payload.to ?? "");
      const label = String(payload.label || queue);
      try {
        await sendViaResend(payload);
        await markLog(payload.message_id, "sent", null, label, to);
        await sb.rpc("delete_email", { queue_name: queue, message_id: msg.msg_id });
        console.log("sent", label, "→", to);
        total++;
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error("failed", label, "→", to, errMsg);
        await markLog(payload.message_id, "failed", errMsg.slice(0, 1000), label, to);
        if (errMsg.includes("429") || errMsg.startsWith("429")) {
          console.log("Rate limited — stopping");
          process.exit(1);
        }
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
}

console.log("Total sent:", total);

const target = (process.argv[2] ?? "msinsurancelady").toLowerCase();
const { data: logs } = await sb
  .from("email_send_log")
  .select("template_name, status, error_message, created_at, recipient_email")
  .ilike("recipient_email", `%${target}%`)
  .order("created_at", { ascending: false })
  .limit(10);
console.log("Recent logs for", target, JSON.stringify(logs, null, 2));
