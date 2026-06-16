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
console.log("supabase_host:", new URL(env.SUPABASE_URL).hostname);

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const emailFilter = process.argv[2] ?? "msinsurancelady";

const { data: usersPage } = await sb.auth.admin.listUsers({ perPage: 200 });
const matches = (usersPage?.users ?? []).filter((u) =>
  (u.email ?? "").toLowerCase().includes(emailFilter.toLowerCase()),
);
console.log(
  "users:",
  matches.map((u) => ({
    email: u.email,
    id: u.id,
    confirmed: !!u.email_confirmed_at,
    banned: !!u.banned_until,
  })),
);

for (const u of matches) {
  const em = (u.email ?? "").toLowerCase();
  const { data: logs } = await sb
    .from("email_send_log")
    .select("id, template_name, status, error_message, created_at, message_id")
    .ilike("recipient_email", em)
    .order("created_at", { ascending: false })
    .limit(30);
  console.log(`logs for ${em}:`, JSON.stringify(logs, null, 2));
}

const { data: state } = await sb.from("email_send_state").select("*").single();
console.log("email_send_state:", state);

const { count: pending } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");
const { count: failed } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "failed");
console.log("pending total:", pending, "failed total:", failed);

for (const queue of ["transactional_emails", "auth_emails", "transactional_emails_dlq", "auth_emails_dlq"]) {
  const { data: batch, error } = await sb.rpc("read_email_batch", {
    queue_name: queue,
    batch_size: 100,
    vt: 1,
  });
  if (error) console.log(queue, "error:", error.message);
  else console.log(queue, "depth:", batch?.length ?? 0);
}
