/**
 * Probe submission_checklist_progress table and team user in remote Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEAM_USER_ID = "00000000-0000-0000-0000-000000000001";

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

async function main() {
  console.log("Supabase URL:", url);

  const { data: teamUser, error: userErr } = await admin.auth.admin.getUserById(TEAM_USER_ID);
  if (userErr) {
    console.log("Team user lookup:", userErr.message);
  } else {
    console.log("Team user exists:", !!teamUser?.user, teamUser?.user?.email ?? "(no email)");
  }

  const { data: checklistRows, error: checklistErr } = await admin
    .from("submission_checklist_progress")
    .select("user_id, checklist_id, updated_at")
    .limit(5);

  if (checklistErr) {
    console.log("submission_checklist_progress:", checklistErr.message, checklistErr.code);
  } else {
    console.log("submission_checklist_progress rows:", checklistRows?.length ?? 0);
    console.log(JSON.stringify(checklistRows, null, 2));
  }

  const { data: editorialRows, error: editorialErr } = await admin
    .from("editorial_calendar_progress")
    .select("user_id, updated_at")
    .limit(5);

  if (editorialErr) {
    console.log("editorial_calendar_progress:", editorialErr.message);
  } else {
    console.log("editorial_calendar_progress rows:", editorialRows?.length ?? 0);
    console.log(JSON.stringify(editorialRows, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
