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

const { data: orphans } = await sb
  .from("email_send_log")
  .select("message_id, template_name, status, created_at")
  .eq("status", "pending")
  .not("message_id", "is", null);

let orphanWithSent = 0;
let orphanAlone = 0;
for (const row of orphans ?? []) {
  const { data: others } = await sb
    .from("email_send_log")
    .select("status")
    .eq("message_id", row.message_id)
    .neq("status", "pending");
  if (others?.length) orphanWithSent++;
  else orphanAlone++;
}

console.log("pending rows:", orphans?.length ?? 0);
console.log("orphan pending (also has sent/failed/dlq):", orphanWithSent);
console.log("stuck pending (no other status):", orphanAlone);
