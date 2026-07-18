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

function isTestRow(row) {
  const email = (row.email ?? "").toLowerCase();
  const code = (row.scenario_code ?? "").toUpperCase();
  if (email.includes("@example.com")) return true;
  if (email.includes("dev-submit")) return true;
  if (email.includes("probe")) return true;
  if (email.includes("tf-test")) return true;
  if (code === "TEST99" || code.startsWith("TFPROBE")) return true;
  return false;
}

const sb = createClient(loadEnv().SUPABASE_URL, loadEnv().SUPABASE_SERVICE_ROLE_KEY);

const { data: allRequests } = await sb
  .from("expert_contact_requests")
  .select("id, email, ip_address, source_url, scenario_code, submitted_at, created_at")
  .order("created_at", { ascending: false });

const { data: allCerts } = await sb
  .from("lead_certificates")
  .select("id, email, ip_address, source_url, scenario_code, submitted_at")
  .order("submitted_at", { ascending: false });

const requests = (allRequests ?? []).filter((r) => !isTestRow(r));
const certs = (allCerts ?? []).filter((r) => !isTestRow(r));

const uniqueIpsReq = new Set(requests.map((r) => r.ip_address).filter(Boolean));
const uniqueEmailsReq = new Set(requests.map((r) => r.email?.toLowerCase()).filter(Boolean));
const uniqueIpsCert = new Set(certs.map((r) => r.ip_address).filter(Boolean));
const uniqueEmailsCert = new Set(certs.map((r) => r.email?.toLowerCase()).filter(Boolean));

const withSource = requests.filter((r) => r.source_url);
const productionHosts = withSource.filter((r) => {
  try {
    const h = new URL(r.source_url).hostname;
    return h === "mypartb.com" || h === "www.mypartb.com";
  } catch {
    return false;
  }
});

console.log("CONTACT AGENT FORM — what the database actually captures\n");
console.log("Important: We do NOT log “tried to fill out” (opened dialog, partial fill, failed submit).");
console.log("We only log SUCCESSFUL submits.\n");

console.log("--- All-time successful submits (excluding obvious test data) ---");
console.log("expert_contact_requests:", requests.length);
console.log("Unique emails (completed):", uniqueEmailsReq.size);
console.log("Unique IP addresses (completed):", uniqueIpsReq.size);
console.log("lead_certificates:", certs.length);
console.log("Unique emails (certificates):", uniqueEmailsCert.size);
console.log("Unique IPs (certificates):", uniqueIpsCert.size);

console.log("\n--- Production site only (source_url on mypartb.com) ---");
console.log("Successful submits:", productionHosts.length);
console.log(
  "Unique IPs:",
  new Set(productionHosts.map((r) => r.ip_address).filter(Boolean)).size,
);
console.log(
  "Unique emails:",
  new Set(productionHosts.map((r) => r.email?.toLowerCase()).filter(Boolean)).size,
);

console.log("\n--- By page (production submits) ---");
const byPage = new Map();
for (const r of productionHosts) {
  let page = "/";
  try {
    page = new URL(r.source_url).pathname;
  } catch {
    /* ignore */
  }
  byPage.set(page, (byPage.get(page) ?? 0) + 1);
}
for (const [page, n] of [...byPage.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${n}\t${page}`);
}

console.log("\n--- Production submit details ---");
for (const r of productionHosts) {
  const when = (r.submitted_at ?? r.created_at)?.slice(0, 19);
  let page = "—";
  try {
    page = new URL(r.source_url).pathname;
  } catch {
    /* ignore */
  }
  console.log(`  ${when}  ${r.email}  ${page}`);
}

// Rough proxy: visitors who reached created/summary pages (not = tried form)
const { data: visits } = await sb
  .from("site_visits")
  .select("ip_address, path")
  .or("path.like./scenario/created/%,path.eq./");

const createdVisits = (visits ?? []).filter((v) => v.path?.startsWith("/scenario/created/"));
const homeVisits = (visits ?? []).filter((v) => v.path === "/");
console.log("\n--- Not form attempts — page traffic proxy ---");
console.log("Unique IPs that viewed /scenario/created/* (all time):", new Set(createdVisits.map((v) => v.ip_address).filter(Boolean)).size);
console.log("Unique IPs that viewed home / (all time):", new Set(homeVisits.map((v) => v.ip_address).filter(Boolean)).size);

const noSource = requests.filter((r) => !r.source_url);
console.log("\n--- Older submits (no source_url captured) ---");
console.log("Count:", noSource.length);
for (const r of noSource.slice(0, 12)) {
  console.log(`  ${(r.submitted_at ?? r.created_at)?.slice(0, 10)}  ${r.email}  ${r.scenario_code ?? "—"}`);
}
