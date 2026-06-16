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

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);

const { data: pendingRows } = await sb
  .from("email_send_log")
  .select("id, message_id")
  .eq("status", "pending")
  .not("message_id", "is", null);

let deleted = 0;
for (const row of pendingRows ?? []) {
  const { data: finalRows } = await sb
    .from("email_send_log")
    .select("id")
    .eq("message_id", row.message_id)
    .neq("status", "pending")
    .limit(1);
  if (!finalRows?.length) continue;

  const { error } = await sb.from("email_send_log").delete().eq("id", row.id);
  if (error) {
    console.error("delete failed", row.id, error.message);
    continue;
  }
  deleted++;
}

const { count } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");

console.log(`Removed ${deleted} stale pending row(s). Remaining pending: ${count ?? 0}.`);
