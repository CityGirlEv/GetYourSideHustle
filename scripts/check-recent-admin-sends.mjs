import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    env[line.slice(0, i)] = val;
  }
  return env;
}

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);
const { data } = await sb
  .from("email_send_log")
  .select("template_name, recipient_email, status, created_at")
  .in("recipient_email", ["evelyn3@cox.net", "sharpebanker@yahoo.com"])
  .order("created_at", { ascending: false })
  .limit(30);

const byStatus = {};
for (const r of data ?? []) {
  byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
}
console.log("by_status:", byStatus);
for (const r of data ?? []) {
  console.log(r.status.padEnd(8), r.template_name, "→", r.recipient_email);
}
