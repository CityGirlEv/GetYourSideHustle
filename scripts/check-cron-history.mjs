import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Query cron jobs
console.log("--- pg_cron jobs ---");
const { data: jobs, error: jobsErr } = await sb.rpc("execute_sql_query", {
  sql: "SELECT jobid, schedule, command, nodename, nodeport, database, username, active FROM cron.job;"
}).catch(async (e) => {
  // If rpc execute_sql_query does not exist, let's try direct postgres execution or select from a view if exposed.
  // Wait, let's check if we can query it using standard PostgREST. Usually system schemas aren't exposed via PostgREST unless we have a custom RPC.
  // Is there a custom RPC like `execute_sql` or similar? Let's check migrations or try a generic RPC name.
  return { error: { message: "RPC execute_sql_query not available" } };
});

if (jobsErr) {
  // Let's write an RPC or check if there is an existing migration that creates a helper.
  console.log("Error querying cron jobs directly via RPC:", jobsErr.message);
  
  // Wait, let's look at migration files to see if there is any custom SQL executor RPC.
  // We can search the codebase for execute_sql or custom SQL execution.
} else {
  console.log(JSON.stringify(jobs, null, 2));
}

// Let's also check if we can run a SQL statement using a migration or if there is a function.
