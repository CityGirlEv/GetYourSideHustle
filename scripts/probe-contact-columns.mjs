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

const variants = [
  { label: "minimal", payload: { full_name: "x", email: `m${Date.now()}@e.com`, phone: "5551234567", marketing_opt_in: false } },
  {
    label: "with audit",
    payload: {
      full_name: "x",
      email: `a${Date.now()}@e.com`,
      phone: "5551234567",
      marketing_opt_in: false,
      ip_address: "127.0.0.1",
      source_url: "http://localhost/test",
      consent_text: "test",
      consent_snapshot: { flow_version: "probe" },
      submitted_at: new Date().toISOString(),
    },
  },
  {
    label: "with trustedform nulls",
    payload: {
      full_name: "x",
      email: `t${Date.now()}@e.com`,
      phone: "5551234567",
      marketing_opt_in: false,
      ip_address: "127.0.0.1",
      source_url: "http://localhost/test",
      consent_text: "test",
      consent_snapshot: { flow_version: "probe" },
      submitted_at: new Date().toISOString(),
      trustedform_cert_url: null,
      trustedform_token: null,
      trustedform_ping_url: null,
    },
  },
];

for (const v of variants) {
  const r = await sb.from("expert_contact_requests").insert(v.payload).select("id").single();
  console.log(v.label + ":", r.error?.message ?? "ok " + r.data?.id);
  if (r.data?.id) await sb.from("expert_contact_requests").delete().eq("id", r.data.id);
}
