import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    env[line.slice(0, i)] = val;
  }
  return env;
}

const env = loadEnv();
const key = env.RESEND_API_KEY;
const to = process.argv[2] ?? "evelyn3@cox.net";

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Part B Optimizer <noreply@mypartb.com>",
    to: [to],
    subject: "[mypartb] Domain verification test",
    html: "<p>If you received this, Resend delivery from <strong>noreply@mypartb.com</strong> is working.</p>",
  }),
});

console.log("status:", res.status);
console.log(await res.text());
