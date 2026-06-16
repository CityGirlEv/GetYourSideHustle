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
const messageId = process.argv[2] ?? "811491b9-63b5-42eb-9aaa-58340715d414";

const { data: logBefore } = await sb
  .from("email_send_log")
  .select("*")
  .eq("message_id", messageId)
  .maybeSingle();
console.log("log before:", logBefore);

const processRes = await fetch("https://mypartb.pages.dev/lovable/email/queue/process", {
  method: "POST",
  headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
});
console.log("process:", processRes.status, await processRes.text());

const { data: logAfter } = await sb
  .from("email_send_log")
  .select("*")
  .eq("message_id", messageId)
  .maybeSingle();
console.log("log after:", logAfter);

const key = env.RESEND_API_KEY;
for (const from of [
  "Get Part B Optimizer <onboarding@resend.dev>",
  "Get Part B Optimizer <noreply@mypartb.com>",
]) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: ["riverashretreat@gmail.com"],
      subject: "diag from test",
      html: "<p>test</p>",
    }),
  });
  console.log(`resend from ${from}:`, res.status, (await res.text()).slice(0, 300));
}
