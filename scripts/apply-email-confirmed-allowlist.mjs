/**
 * One-off: email confirmed ON for admins + Lyric/Lyriq + Maria only; everyone else OFF.
 * Uses admin_set_email_confirmed RPC when available; falls back to Auth Admin API for confirm.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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

const ALLOWED_FIRST_NAMES = new Set(["lyriq", "lyric", "maria"]);

function isAllowlisted({ roles, fullName }) {
  if (roles.includes("admin")) return true;
  const first = (fullName ?? "").trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const full = (fullName ?? "").trim().toLowerCase();
  if (ALLOWED_FIRST_NAMES.has(first)) return true;
  for (const name of ALLOWED_FIRST_NAMES) {
    if (full.startsWith(name)) return true;
  }
  return false;
}

const env = loadEnv();
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function setConfirmed(userId, confirmed) {
  const { error } = await admin.rpc("admin_set_email_confirmed", {
    p_user_id: userId,
    p_confirmed: confirmed,
  });
  if (!error) return "rpc";

  if (confirmed) {
    const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (authErr) throw authErr;
    return "auth-confirm";
  }
  throw new Error(
    `Cannot unconfirm ${userId}: run migration 20260614070000 (admin_set_email_confirmed RPC). ${error.message}`,
  );
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

  const ids = users.map((u) => u.id);
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    admin.from("profiles").select("id, full_name").in("id", ids),
    admin.from("user_roles").select("user_id, role").in("user_id", ids),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? ""]));
  const rolesMap = new Map();
  for (const r of roles ?? []) {
    const arr = rolesMap.get(r.user_id) ?? [];
    arr.push(r.role);
    rolesMap.set(r.user_id, arr);
  }

  let on = 0;
  let off = 0;
  const errors = [];

  for (const u of users) {
    const allowlisted = isAllowlisted({
      roles: rolesMap.get(u.id) ?? [],
      fullName: profileMap.get(u.id),
    });
    const shouldConfirm = allowlisted;
    const isConfirmed = !!u.email_confirmed_at;
    if (shouldConfirm === isConfirmed) continue;

    try {
      await setConfirmed(u.id, shouldConfirm);
      if (shouldConfirm) on++;
      else off++;
      console.log(
        `${shouldConfirm ? "ON " : "OFF"} ${u.email ?? u.id} (${profileMap.get(u.id) || "—"})`,
      );
    } catch (e) {
      errors.push({ email: u.email, message: e.message });
    }
  }

  console.log(
    `Done. Turned on: ${on}, turned off: ${off}, skipped (already correct): ${users.length - on - off - errors.length}`,
  );
  if (errors.length) {
    console.error("Errors:", errors);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
