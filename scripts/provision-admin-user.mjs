import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

function loadEnv(filePath) {
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] ?? "Evelyn";

if (!email || !password) {
  console.error("Usage: node scripts/provision-admin-user.mjs <email> <password> [fullName]");
  process.exit(1);
}

const env = loadEnv(envPath);
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let user = null;
for (let page = 1; page <= 20; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
  if (user || data.users.length < 200) break;
}

if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  user = data.user;
  console.log("Created user:", user.id);
} else {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    ban_duration: "none",
    user_metadata: {
      ...(user.user_metadata ?? {}),
      full_name: user.user_metadata?.full_name ?? fullName,
    },
  });
  if (error) throw error;
  user = data.user;
  console.log("Updated user:", user.id);
}

await supabase.from("profiles").upsert({
  id: user.id,
  full_name: user.user_metadata?.full_name ?? fullName,
});

await supabase.from("user_roles").delete().eq("user_id", user.id);
const { error: roleErr } = await supabase.from("user_roles").insert({
  user_id: user.id,
  role: "admin",
});
if (roleErr) throw roleErr;

const { data: check, error: checkErr } = await supabase.auth.admin.getUserById(user.id);
if (checkErr) throw checkErr;

console.log(
  JSON.stringify(
    {
      email: check.user.email,
      role: "admin",
      enabled: !check.user.banned_until,
      email_confirmed: Boolean(check.user.email_confirmed_at),
    },
    null,
    2,
  ),
);
