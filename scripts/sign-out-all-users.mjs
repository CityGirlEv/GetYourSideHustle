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

const env = loadEnv(envPath);
if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, label, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (result.ok || !/rate limit/i.test(result.message ?? "")) {
      return result;
    }
    const waitMs = attempt * 2000;
    console.warn(`${label}: rate limited, retrying in ${waitMs}ms (${attempt}/${maxAttempts})`);
    await delay(waitMs);
  }
  return { ok: false, message: "Request rate limit reached" };
}

async function signOutUserGloballyByEmail(email) {
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr) return { ok: false, message: linkErr.message };

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) return { ok: false, message: "generateLink did not return hashed_token" };

  const { data: sessionData, error: verifyErr } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (verifyErr) return { ok: false, message: verifyErr.message };

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return { ok: false, message: "verifyOtp did not return access_token" };

  const { error: signOutErr } = await supabase.auth.admin.signOut(accessToken, "global");
  if (signOutErr) return { ok: false, message: signOutErr.message };

  return { ok: true };
}

async function stampForceLogout(user: { id: string; app_metadata?: Record<string, unknown> | null }) {
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...appMeta, force_logout_at: new Date().toISOString() },
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

async function signOutUserGlobally(user) {
  const email = user.email?.trim();
  if (!email) return { ok: false, message: "User has no email" };

  const stamp = await stampForceLogout(user);
  if (!stamp.ok) return stamp;

  const wasBanned = !!user.banned_until;
  if (wasBanned) {
    const { error: unbanErr } = await supabase.auth.admin.updateUserById(user.id, {
      ban_duration: "none",
    });
    if (unbanErr) return { ok: false, message: unbanErr.message };
  }

  try {
    const result = await signOutUserGloballyByEmail(email);
    return result;
  } finally {
    if (wasBanned) {
      await supabase.auth.admin.updateUserById(user.id, { ban_duration: "876000h" });
    }
  }
}

let signedOut = 0;
let failed = 0;

for (let page = 1; page <= 100; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  const users = data.users ?? [];
  if (users.length === 0) break;

  for (const user of users) {
    const result = await withRetry(
      () => signOutUserGlobally(user),
      user.email ?? user.id,
    );
    if (result.ok) {
      signedOut++;
      console.log(`Signed out: ${user.email ?? user.id}`);
    } else {
      failed++;
      console.error(`Failed ${user.email ?? user.id}: ${result.message}`);
    }
    await delay(400);
  }

  if (users.length < 200) break;
}

console.log(`Done. Signed out ${signedOut} user(s).${failed ? ` ${failed} failed.` : ""}`);
