import fs from "fs";

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
const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Get Part B Optimizer <onboarding@resend.dev>",
    to: ["riverashretreat@gmail.com"],
    subject: `[TEST] Resend key verification ${new Date().toISOString()}`,
    html: "<p>If you received this, the new Resend API key is working.</p>",
    text: "If you received this, the new Resend API key is working.",
  }),
});

console.log("status:", res.status);
console.log(await res.text());
