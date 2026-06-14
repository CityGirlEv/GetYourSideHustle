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

for (const queue of ["auth_emails", "transactional_emails", "auth_emails_dlq", "transactional_emails_dlq"]) {
  const { data, error } = await sb.rpc("read_email_batch", {
    queue_name: queue,
    batch_size: 1,
    vt: 1, // short visibility timeout
  });
  if (error) {
    console.log(`queue ${queue}: ERROR ${error.message}`);
  } else {
    // Note: read_email_batch only reads up to batch_size.
    // To get the full length, we can query pgmq.q_queue_name table directly if we have permission.
    // Let's first try to see if any messages are returned by read_email_batch.
    console.log(`queue ${queue} has message(s)? ${data && data.length > 0 ? "YES" : "NO"}`);
  }
}

// Let's count them using SQL if possible
const { data: counts, error: sqlError } = await sb.rpc("read_email_batch", {
  queue_name: "auth_emails",
  batch_size: 100,
  vt: 1
});
console.log("auth_emails count in batch (max 100):", counts?.length ?? 0);

const { data: txCounts } = await sb.rpc("read_email_batch", {
  queue_name: "transactional_emails",
  batch_size: 100,
  vt: 1
});
console.log("transactional_emails count in batch (max 100):", txCounts?.length ?? 0);

const { data: authDlq } = await sb.rpc("read_email_batch", {
  queue_name: "auth_emails_dlq",
  batch_size: 100,
  vt: 1
});
console.log("auth_emails_dlq count in batch (max 100):", authDlq?.length ?? 0);

const { data: txDlq } = await sb.rpc("read_email_batch", {
  queue_name: "transactional_emails_dlq",
  batch_size: 100,
  vt: 1
});
console.log("transactional_emails_dlq count in batch (max 100):", txDlq?.length ?? 0);
