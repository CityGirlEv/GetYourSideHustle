import fs from "fs";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i)] = val;
  }
  return env;
}

const key = loadEnv().RESEND_API_KEY;
const emailId = process.argv[2] ?? "9659f082-6283-473e-aeb2-32132dc52f98";

const headers = { Authorization: `Bearer ${key}` };

const email = await fetch(`https://api.resend.com/emails/${emailId}`, { headers }).then((r) =>
  r.json(),
);
console.log("email:", JSON.stringify(email, null, 2));

const events = await fetch(`https://api.resend.com/emails/${emailId}/events`, { headers }).then(
  (r) => r.text(),
);
console.log("\nevents:", events);
