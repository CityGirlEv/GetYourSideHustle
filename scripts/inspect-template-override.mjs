import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i)] = val;
  }
  return env;
}

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);
const name = process.argv[2] ?? "new-registration-admin";
const { data } = await sb
  .from("email_template_overrides")
  .select("subject, html")
  .eq("template_name", name)
  .maybeSingle();

if (!data) {
  console.log("no override for", name);
  process.exit(0);
}

console.log("subject:", data.subject);
const html = data.html;
console.log("has Jane Doe:", html.includes("Jane Doe"));
console.log("has jane@example:", html.includes("jane@example.com"));
console.log("has {{ merge tokens:", /\{\{/.test(html));
console.log(
  "text snippet:",
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 500),
);
