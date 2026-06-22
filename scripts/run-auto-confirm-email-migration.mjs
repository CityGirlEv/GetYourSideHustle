/**
 * Applies supabase/migrations/20260621130000_auto_confirm_email_enabled_users.sql
 * via Auth Admin API (no Supabase CLI / direct Postgres required).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function confirmUser(userId) {
  const { error } = await admin.rpc("admin_set_email_confirmed", {
    p_user_id: userId,
    p_confirmed: true,
  });
  if (!error) return "rpc";

  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (authErr) throw authErr;
  return "auth";
}

function isEnabledUser(user) {
  const bannedUntil = user.banned_until ?? null;
  return !bannedUntil || new Date(bannedUntil).getTime() <= Date.now();
}

async function main() {
  const users = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const batch = data.users ?? [];
    users.push(...batch);
    if (batch.length < 200) break;
  }

  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const u of users) {
    const enabled = isEnabledUser(u);
    const confirmed = !!u.email_confirmed_at;
    if (!enabled || confirmed) {
      skipped++;
      continue;
    }

    try {
      const method = await confirmUser(u.id);
      updated++;
      console.log(`CONFIRMED ${u.email ?? u.id} (${method})`);
    } catch (e) {
      errors.push({ email: u.email, message: e.message });
    }
  }

  console.log(
    `Done. Confirmed: ${updated}, skipped: ${skipped}, errors: ${errors.length}`,
  );
  if (errors.length) {
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
