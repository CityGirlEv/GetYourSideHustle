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

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);
const { data } = await sb
  .from("email_send_log")
  .select("template_name, recipient_email, created_at, message_id")
  .eq("status", "pending")
  .order("created_at", { ascending: false });

const byTemplate = {};
for (const row of data ?? []) {
  byTemplate[row.template_name] = (byTemplate[row.template_name] ?? 0) + 1;
}
console.log("total:", data?.length ?? 0);
console.log("by_template:", byTemplate);
console.log(JSON.stringify(data, null, 2));
