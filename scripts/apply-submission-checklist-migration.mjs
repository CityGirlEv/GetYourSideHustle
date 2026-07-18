/**
 * Apply submission_checklist_progress migration to remote Supabase.
 *
 * Tries (in order):
 *  1. Supabase Management API (needs SUPABASE_ACCESS_TOKEN)
 *  2. npx supabase db push (needs supabase link + DB password)
 *  3. Auth Admin API team-user bootstrap only (DDL still needs SQL Editor)
 *
 * Usage:
 *   node --use-system-ca scripts/apply-submission-checklist-migration.mjs
 *   node --use-system-ca scripts/apply-submission-checklist-migration.mjs --verify-only
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF = "xiqknyrikpuysbkvpkju";
const TEAM_USER_ID = "00000000-0000-0000-0000-000000000001";
const TEAM_EMAIL = "team-system@internal.mypartb";
const SQL_PATH = resolve(root, "scripts", "apply-submission-checklist-migration.sql");

function loadEnv() {
  const path = resolve(root, ".env");
  if (!existsSync(path)) throw new Error("Missing .env");
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return { ...env, ...process.env };
}

async function ensureTeamUserViaAuth(admin) {
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(TEAM_USER_ID);
  if (!getErr && existing?.user) {
    console.log("Team user already exists (Auth API):", existing.user.email ?? TEAM_USER_ID);
    return "exists";
  }

  const { data, error } = await admin.auth.admin.createUser({
    id: TEAM_USER_ID,
    email: TEAM_EMAIL,
    email_confirm: true,
    password: randomUUID() + "Aa1!",
    user_metadata: { system_user: true },
  });

  if (error) {
    if (/already|duplicate|exists/i.test(error.message)) {
      console.log("Team user already exists:", error.message);
      return "exists";
    }
    throw error;
  }

  console.log("Created team user via Auth API:", data.user?.email ?? TEAM_USER_ID);
  return "created";
}

async function runManagementApiSql(accessToken, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${body}`);
  }
  return body;
}

function runSupabaseDbPush(dbPassword) {
  const dbUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${PROJECT_REF}.supabase.co:5432/postgres`;
  const result = spawnSync(
    process.execPath,
    [
      "--use-system-ca",
      resolve(root, "node_modules", "supabase", "bin", "supabase"),
      "db",
      "push",
      "--db-url",
      dbUrl,
      "--include-all",
    ],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  return result.status === 0;
}

async function verify(admin) {
  const { data: teamUser, error: userErr } = await admin.auth.admin.getUserById(TEAM_USER_ID);
  console.log("Team user:", userErr ? userErr.message : (teamUser?.user?.email ?? "ok"));

  const { data: rows, error: tableErr } = await admin
    .from("submission_checklist_progress")
    .select("user_id, checklist_id, updated_at")
    .limit(3);

  if (tableErr) {
    console.log("submission_checklist_progress:", tableErr.message);
    return false;
  }

  console.log("submission_checklist_progress rows:", rows?.length ?? 0);
  console.log(JSON.stringify(rows, null, 2));

  const { error: upsertErr } = await admin.from("submission_checklist_progress").upsert(
    {
      user_id: TEAM_USER_ID,
      checklist_id: "pbo-submission-checklist-v4",
      state: { checked: {}, updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (upsertErr) {
    console.log("Upsert test failed:", upsertErr.message);
    return false;
  }

  console.log("Upsert test: OK (server save would work)");
  return true;
}

async function main() {
  const verifyOnly = process.argv.includes("--verify-only");
  const env = loadEnv();
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (verifyOnly) {
    const ok = await verify(admin);
    process.exit(ok ? 0 : 1);
  }

  await ensureTeamUserViaAuth(admin);

  const sql = readFileSync(SQL_PATH, "utf8");
  let applied = false;

  if (env.SUPABASE_ACCESS_TOKEN) {
    try {
      console.log("Applying SQL via Supabase Management API...");
      const result = await runManagementApiSql(env.SUPABASE_ACCESS_TOKEN, sql);
      console.log("Management API result:", result.slice(0, 500));
      applied = true;
    } catch (e) {
      console.warn("Management API failed:", e.message);
    }
  }

  if (!applied && env.SUPABASE_DB_PASSWORD) {
    console.log("Trying npx supabase db push with SUPABASE_DB_PASSWORD...");
    applied = runSupabaseDbPush(env.SUPABASE_DB_PASSWORD);
  }

  if (!applied) {
    console.log("\nCould not apply DDL automatically (no SUPABASE_ACCESS_TOKEN or SUPABASE_DB_PASSWORD).");
    console.log("Run this SQL in Supabase SQL Editor:");
    console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    console.log(`  File: scripts/apply-submission-checklist-migration.sql`);
    console.log("\nOr with Supabase CLI after login:");
    console.log(`  npx supabase login`);
    console.log(`  npx supabase link --project-ref ${PROJECT_REF}`);
    console.log(`  npx supabase db push`);
    process.exit(2);
  }

  const ok = await verify(admin);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
