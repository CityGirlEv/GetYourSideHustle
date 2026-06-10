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
const messageId = process.argv[2] ?? "1a32a4e0-e6c9-49f6-9c55-846c0b605cca";

const { data } = await sb
  .from("email_send_log")
  .select("*")
  .eq("message_id", messageId)
  .order("created_at", { ascending: true });
console.log(JSON.stringify(data, null, 2));
