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

const consentSnapshot = {
  flow_version: "2026-06-17-v2",
  agency_name: "CMS Health & Wealth Insurance",
  scenario_code: "TEST99",
  notices_shown: [],
  checkboxes: {},
};

const contact = {
  full_name: "Full Flow Probe",
  email: `fullflow+${Date.now()}@example.com`,
  phone: "5551234567",
  scenario_code: "TEST99",
  scenario_snapshot: { year: 2026, zip3: "902", medications: [] },
  marketing_opt_in: false,
  agency_name: "CMS Health & Wealth Insurance",
  ip_address: "127.0.0.1",
  source_url: "http://localhost:8081/scenario/created/TEST99",
  consent_text: "probe",
  consent_snapshot: consentSnapshot,
  submitted_at: new Date().toISOString(),
  trustedform_cert_url: null,
  trustedform_token: null,
  trustedform_ping_url: null,
};

const r1 = await sb.from("expert_contact_requests").insert(contact).select("id").single();
console.log("contact:", r1.error?.message ?? r1.data?.id);

if (r1.data?.id) {
  const cert = {
    expert_contact_request_id: r1.data.id,
    consumer_name: contact.full_name,
    email: contact.email,
    phone: contact.phone,
    scenario_code: contact.scenario_code,
    agency_name: contact.agency_name,
    ip_address: contact.ip_address,
    user_agent: "probe",
    source_url: contact.source_url,
    consent_text: contact.consent_text,
    client_metadata: { pageUrl: contact.source_url },
    consent_snapshot: consentSnapshot,
    privacy_acknowledged: true,
    contact_authorized: true,
    marketing_opt_in: false,
    submitted_at: contact.submitted_at,
    trustedform_cert_url: null,
    trustedform_token: null,
    trustedform_ping_url: null,
  };
  const r2 = await sb.from("lead_certificates").insert(cert).select("id").single();
  console.log("cert:", r2.error?.message ?? r2.data?.id);
  if (r2.data?.id) {
    const r3 = await sb
      .from("expert_contact_requests")
      .update({ lead_certificate_id: r2.data.id })
      .eq("id", r1.data.id);
    console.log("link:", r3.error?.message ?? "ok");
    await sb.from("lead_certificates").delete().eq("id", r2.data.id);
  }
  await sb.from("expert_contact_requests").delete().eq("id", r1.data.id);
}
