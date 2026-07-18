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

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: leads, error } = await sb
  .from("lead_certificates")
  .select("id, email, submitted_at, trustedform_cert_url, source_url")
  .order("submitted_at", { ascending: false })
  .limit(15);

if (error) {
  console.log("query error:", error.message);
  process.exit(1);
}

const total = leads?.length ?? 0;
const withCert = leads?.filter((l) => l.trustedform_cert_url).length ?? 0;
console.log(`Recent leads: ${total}, with TrustedForm cert: ${withCert}`);
for (const row of leads ?? []) {
  const host = row.source_url ? new URL(row.source_url).hostname : "unknown";
  console.log(
    row.submitted_at?.slice(0, 19),
    row.email,
    host,
    row.trustedform_cert_url ? "CERT" : "no-cert",
  );
}
