/**
 * Resolve stuck "pending" rows in email_send_log where the queue message
 * is gone and no sent/failed/dlq row exists for the same message_id.
 *
 * Default: mark as failed with an explanatory message (clears admin UI noise).
 * Pass --delete to remove rows instead (bulk-test cleanup).
 */
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

const deleteMode = process.argv.includes("--delete");
const reason =
  "Queue item expired or was processed without updating this log row. " +
  "No message remains in the email queue to resend.";

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);

const { data: pendingRows, error } = await sb
  .from("email_send_log")
  .select("id, message_id, template_name, recipient_email")
  .eq("status", "pending");

if (error) throw error;

let resolved = 0;
let skipped = 0;

for (const row of pendingRows ?? []) {
  if (row.message_id) {
    const { data: finalRows } = await sb
      .from("email_send_log")
      .select("id")
      .eq("message_id", row.message_id)
      .neq("status", "pending")
      .limit(1);
    if (finalRows?.length) {
      skipped++;
      continue;
    }
  }

  if (deleteMode) {
    const { error: delErr } = await sb.from("email_send_log").delete().eq("id", row.id);
    if (delErr) {
      console.error("delete failed", row.id, delErr.message);
      continue;
    }
  } else {
    const { error: updErr } = await sb
      .from("email_send_log")
      .update({ status: "failed", error_message: reason })
      .eq("id", row.id);
    if (updErr) {
      console.error("update failed", row.id, updErr.message);
      continue;
    }
  }
  resolved++;
}

const { count } = await sb
  .from("email_send_log")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");

console.log(
  JSON.stringify(
    {
      mode: deleteMode ? "delete" : "mark_failed",
      resolved,
      skipped_stale_duplicates: skipped,
      remaining_pending: count ?? 0,
    },
    null,
    2,
  ),
);
