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

for (const queue of [
  "transactional_emails_dlq",
  "auth_emails_dlq",
]) {
  const { data, error } = await sb.rpc("read_email_batch", {
    queue_name: queue,
    batch_size: 5,
    vt: 30,
  });
  console.log(`queue ${queue}:`, error ? `ERROR ${error.message}` : `messages=${data?.length ?? 0}`);
  if (data?.length) console.log(JSON.stringify(data, null, 2));
}

const testPayload = {
  message_id: crypto.randomUUID(),
  to: "test@example.com",
  from: "The Medicare Optimizer <onboarding@resend.dev>",
  sender_domain: "resend.dev",
  subject: "queue test",
  html: "<p>test</p>",
  text: "test",
  purpose: "transactional",
  label: "diagnostic",
  idempotency_key: `diag-${Date.now()}`,
  queued_at: new Date().toISOString(),
};

const { data: enq, error: enqErr } = await sb.rpc("enqueue_email", {
  queue_name: "transactional_emails",
  payload: testPayload,
});
console.log("enqueue test:", enqErr ? enqErr.message : `ok msg_id=${enq}`);

const { data: batch } = await sb.rpc("read_email_batch", {
  queue_name: "transactional_emails",
  batch_size: 5,
  vt: 30,
});
console.log("after enqueue batch size:", batch?.length ?? 0);
