import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[line.slice(0, i)] = val;
  }
  return env;
}

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);
const { data } = await sb
  .from("email_template_overrides")
  .select("template_name, subject, updated_at")
  .order("updated_at", { ascending: false });
console.log("overrides:", data?.length ?? 0);
for (const row of data ?? []) {
  console.log(`  ${row.template_name} — "${row.subject}" (${row.updated_at})`);
}
