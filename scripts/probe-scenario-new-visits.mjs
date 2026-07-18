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

const paths = ["/scenario/new", "/scenario/new/"];

const { data, error } = await sb
  .from("site_visits")
  .select("ip_address, path, created_at, referrer")
  .in("path", paths)
  .order("created_at", { ascending: false });

if (error) {
  console.log("error:", error.message);
  process.exit(1);
}

const rows = data ?? [];
const uniqueIps = new Set(rows.map((r) => r.ip_address).filter(Boolean));
const withIp = rows.filter((r) => r.ip_address);
const withoutIp = rows.length - withIp.length;

console.log("Path: /scenario/new");
console.log("Total page views (visits logged):", rows.length);
console.log("Unique IP addresses:", uniqueIps.size);
console.log("Visits with no IP recorded:", withoutIp);

// By month
const byMonth = new Map();
for (const r of rows) {
  const month = r.created_at?.slice(0, 7) ?? "unknown";
  byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
}
console.log("\nPage views by month:");
for (const [m, n] of [...byMonth.entries()].sort()) {
  console.log(`  ${m}: ${n}`);
}

// Unique IPs by month (approximate)
console.log("\nUnique IPs by month:");
const ipsByMonth = new Map();
for (const r of rows) {
  if (!r.ip_address) continue;
  const month = r.created_at?.slice(0, 7) ?? "unknown";
  if (!ipsByMonth.has(month)) ipsByMonth.set(month, new Set());
  ipsByMonth.get(month).add(r.ip_address);
}
for (const [m, set] of [...ipsByMonth.entries()].sort()) {
  console.log(`  ${m}: ${set.size}`);
}

// Top referrers
const refCounts = new Map();
for (const r of rows) {
  const ref = r.referrer?.trim() || "(direct / none)";
  refCounts.set(ref, (refCounts.get(ref) ?? 0) + 1);
}
console.log("\nTop referrers (page views):");
for (const [ref, n] of [...refCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
  console.log(`  ${n}\t${ref.slice(0, 80)}`);
}

const isLocalOrDev = (r) => {
  const ref = (r.referrer ?? "").toLowerCase();
  const ip = r.ip_address ?? "";
  if (ref.includes("localhost")) return true;
  if (ref.includes("lovableproject.com")) return true;
  if (ref.includes("getpartb.com/testing")) return true;
  if (ip === "127.0.0.1" || ip === "::1") return true;
  return false;
};

const prodRows = rows.filter((r) => !isLocalOrDev(r));
const prodIps = new Set(prodRows.map((r) => r.ip_address).filter(Boolean));

console.log("\n--- Excluding localhost / QA / Lovable dev ---");
console.log("Page views:", prodRows.length);
console.log("Unique IP addresses:", prodIps.size);

const fbRows = rows.filter((r) => /facebook\.com/i.test(r.referrer ?? ""));
console.log("\n--- From Facebook referrers (all environments) ---");
console.log("Page views:", fbRows.length);
console.log("Unique IPs:", new Set(fbRows.map((r) => r.ip_address).filter(Boolean)).size);
