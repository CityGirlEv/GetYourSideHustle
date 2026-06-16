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

const { data: pending } = await sb
  .from("email_send_log")
  .select("recipient_email, template_name, created_at, message_id")
  .eq("status", "pending")
  .order("created_at", { ascending: false });

const byRecipient = {};
for (const row of pending ?? []) {
  const key = (row.recipient_email ?? "").toLowerCase();
  byRecipient[key] = byRecipient[key] ?? [];
  byRecipient[key].push(row);
}

console.log("pending count:", pending?.length ?? 0);
console.log(JSON.stringify(byRecipient, null, 2));

const userId = "93efb332-a9fa-41d3-a207-9266b0719430";
const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", userId);
const { data: prof } = await sb.from("profiles").select("full_name").eq("id", userId).maybeSingle();
console.log("msinsurancelady roles:", roles, "name:", prof?.full_name);
