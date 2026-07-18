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

const base = process.env.BASE_URL ?? "http://localhost:8081";
const payload = {
  full_name: "Dev Probe",
  email: `dev-probe+${Date.now()}@example.com`,
  phone: "5551234567",
  scenario_code: "TEST99",
  scenario_snapshot: { year: 2026, zip3: "902" },
  agency_name: "CMS Health & Wealth Insurance",
  privacy_acknowledged: true,
  contact_authorized: true,
  marketing_opt_in: false,
  client_metadata: { pageUrl: `${base}/scenario/created/TEST99` },
  trustedform_cert_url: null,
  trustedform_token: null,
  trustedform_ping_url: null,
};

// TanStack Start server fn POST — discover URL from devtools pattern
const urls = [
  `${base}/_server/submitExpertContactRequest`,
  `${base}/api/submitExpertContactRequest`,
];

for (const url of urls) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
    });
    const text = await res.text();
    console.log(url, res.status, text.slice(0, 500));
  } catch (e) {
    console.log(url, "FAIL", e.message);
  }
}
