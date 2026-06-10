import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const processUrl =
  process.argv[2] ?? "https://mypartb.pages.dev/lovable/email/queue/process";

for (const dlqName of ["transactional_emails_dlq", "auth_emails_dlq"]) {
  const { data: dlqMessages, error } = await sb.rpc("read_email_batch", {
    queue_name: dlqName,
    batch_size: 50,
    vt: 120,
  });
  if (error) {
    console.error(`read ${dlqName} failed:`, error.message);
    continue;
  }
  const targetQueue = dlqName.replace("_dlq", "");
  console.log(`${dlqName}: ${dlqMessages?.length ?? 0} messages`);
  for (const msg of dlqMessages ?? []) {
    const payload = msg.message;
    const { error: enqErr } = await sb.rpc("enqueue_email", {
      queue_name: targetQueue,
      payload: {
        ...payload,
        queued_at: new Date().toISOString(),
        from: "The Medicare Optimizer <onboarding@resend.dev>",
        sender_domain: "resend.dev",
      },
    });
    if (enqErr) {
      console.error("requeue failed", msg.msg_id, enqErr.message);
      continue;
    }
    await sb.rpc("delete_email", { queue_name: dlqName, message_id: msg.msg_id });
  }
}

const res = await fetch(processUrl, {
  method: "POST",
  headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
});
console.log("process:", res.status, await res.text());

const { count: pendingCount } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");
const { count: sentCount } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "sent");
console.log("pending:", pendingCount, "sent:", sentCount);
