import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

for (const queue of ["auth_emails", "transactional_emails"]) {
  const { data, error } = await sb.rpc("read_email_batch", {
    queue_name: queue,
    batch_size: 5,
    vt: 30,
  });
  console.log(
    `queue ${queue}:`,
    error ? `ERROR ${error.message}` : `messages=${data?.length ?? 0}`,
  );
  if (data?.length) {
    console.log(JSON.stringify(data.slice(0, 2), null, 2));
  }
}

const { data: state, error: stateErr } = await sb.from("email_send_state").select("*").single();
console.log("email_send_state:", stateErr ? stateErr.message : JSON.stringify(state));
