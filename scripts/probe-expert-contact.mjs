import fs from "fs";
import { createClient } from "@supabase/supabase-js";

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

const test = {
  full_name: "Probe Test",
  email: `probe+${Date.now()}@example.com`,
  phone: "5551234567",
  scenario_code: null,
  scenario_snapshot: null,
  marketing_opt_in: false,
  agency_name: "CMS Health & Wealth Insurance Partner",
};

const r1 = await sb.from("expert_contact_requests").insert(test).select("id").single();
console.log("contact insert:", r1.error ? `FAIL ${r1.error.message}` : `ok ${r1.data.id}`);

if (r1.data?.id) {
  const cert = {
    expert_contact_request_id: r1.data.id,
    consumer_name: test.full_name,
    email: test.email,
    phone: test.phone,
    scenario_code: null,
    agency_name: test.agency_name,
    client_metadata: {},
    consent_snapshot: { flow_version: "probe" },
    privacy_acknowledged: true,
    contact_authorized: true,
    marketing_opt_in: false,
    submitted_at: new Date().toISOString(),
  };
  const r2 = await sb.from("lead_certificates").insert(cert).select("id").single();
  console.log("cert insert:", r2.error ? `FAIL ${r2.error.message}` : `ok ${r2.data.id}`);
  if (r2.data?.id) await sb.from("lead_certificates").delete().eq("id", r2.data.id);
  await sb.from("expert_contact_requests").delete().eq("id", r1.data.id);
}
