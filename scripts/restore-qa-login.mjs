/**
 * Restore sign-in for a QA/admin user by first name (e.g. Lyriq).
 * Unbans, sets account_status active, confirms email, stamps password_confirmed_at.
 *
 * Usage: node scripts/restore-qa-login.mjs Lyriq
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const targetName = (process.argv[2] ?? "").trim();

if (!targetName) {
  console.error("Usage: node scripts/restore-qa-login.mjs <FirstName>");
  process.exit(1);
}

function loadEnv() {
  const path = resolve(root, ".env");
  if (!existsSync(path)) throw new Error("Missing .env");
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const needle = targetName.toLowerCase();

function matchesName(fullName) {
  const first = (fullName ?? "").trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const full = (fullName ?? "").trim().toLowerCase();
  return first === needle || full.startsWith(needle);
}

async function setEmailConfirmed(userId) {
  const { error } = await admin.rpc("admin_set_email_confirmed", {
    p_user_id: userId,
    p_confirmed: true,
  });
  if (!error) return;
  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (authErr) throw authErr;
}

const users = [];
for (let page = 1; page <= 50; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  const batch = data.users ?? [];
  users.push(...batch);
  if (batch.length < 200) break;
}

const ids = users.map((u) => u.id);
const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", ids);
const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? ""]));

const matches = users.filter((u) => matchesName(profileMap.get(u.id) || u.user_metadata?.full_name));

if (matches.length === 0) {
  console.error(`No user found matching first name "${targetName}".`);
  process.exit(1);
}

for (const user of matches) {
  const fullName = profileMap.get(user.id) || user.user_metadata?.full_name || targetName;
  const appMeta = { ...(user.app_metadata ?? {}), account_status: "active" };

  const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
    ban_duration: "none",
    email_confirm: true,
    app_metadata: appMeta,
  });
  if (updateErr) throw updateErr;

  await setEmailConfirmed(user.id);

  const { error: profileErr } = await admin.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    password_confirmed_at: new Date().toISOString(),
  });
  if (profileErr) throw profileErr;

  const { data: check } = await admin.auth.admin.getUserById(user.id);
  console.log(
    JSON.stringify(
      {
        email: check.user?.email,
        full_name: fullName,
        enabled: !check.user?.banned_until,
        email_confirmed: Boolean(check.user?.email_confirmed_at),
        account_status: check.user?.app_metadata?.account_status ?? null,
      },
      null,
      2,
    ),
  );
}

console.log(`Restored login for ${matches.length} user(s) matching "${targetName}".`);
