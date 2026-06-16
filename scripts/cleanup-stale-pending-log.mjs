/** Mark stale pending log rows that have a newer sent/failed/dlq row for the same message_id. */
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
const reason = "Superseded by a later delivery attempt.";

const { data: pendingRows } = await sb
  .from("email_send_log")
  .select("id, message_id, template_name, recipient_email")
  .eq("status", "pending");

let resolved = 0;
for (const row of pendingRows ?? []) {
  if (row.message_id) {
    const { data: finalRows } = await sb
      .from("email_send_log")
      .select("id, status")
      .eq("message_id", row.message_id)
      .neq("status", "pending")
      .limit(1);
    if (finalRows?.length) {
      await sb.from("email_send_log").update({ status: "failed", error_message: reason }).eq("id", row.id);
      resolved++;
      continue;
    }
  }
  if ((row.template_name ?? "").includes("bulk-test")) {
    await sb
      .from("email_send_log")
      .update({ status: "failed", error_message: "Bulk test row — not a live delivery." })
      .eq("id", row.id);
    resolved++;
  }
}

const { count } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");

console.log(JSON.stringify({ resolved, remaining_pending: count ?? 0 }, null, 2));
