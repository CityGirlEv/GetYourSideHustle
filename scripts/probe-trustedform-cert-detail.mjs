import { createClient } from "@supabase/supabase-js";
import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[line.slice(0, i).trim()] = v;
  }
  return env;
}

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);

const { data } = await sb
  .from("lead_certificates")
  .select("submitted_at, source_url, trustedform_cert_url, trustedform_token, trustedform_ping_url")
  .not("trustedform_cert_url", "is", null)
  .order("submitted_at", { ascending: false })
  .limit(3);

for (const row of data ?? []) {
  console.log("---");
  console.log("when:", row.submitted_at);
  console.log("source:", row.source_url);
  console.log("cert host:", row.trustedform_cert_url ? new URL(row.trustedform_cert_url).hostname : "—");
  console.log("cert path prefix:", row.trustedform_cert_url?.slice(0, 60));
  console.log("has token:", Boolean(row.trustedform_token));
  console.log("has ping:", Boolean(row.trustedform_ping_url));
}
