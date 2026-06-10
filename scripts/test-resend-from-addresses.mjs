import fs from "fs";

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
const key = env.RESEND_API_KEY?.trim();
if (!key) {
  console.error("RESEND_API_KEY missing");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${key}` };

const domainsRes = await fetch("https://api.resend.com/domains", { headers });
const domains = await domainsRes.json();
console.log("domains:", JSON.stringify(domains, null, 2));

const domainId = domains.data?.[0]?.id;
if (domainId) {
  const detailRes = await fetch(`https://api.resend.com/domains/${domainId}`, { headers });
  console.log("domain detail:", JSON.stringify(await detailRes.json(), null, 2));
}

for (const from of [
  "The Medicare Optimizer <onboarding@resend.dev>",
  "The Medicare Optimizer <noreply@mypartb.com>",
]) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: ["evelyn3@cox.net"],
      subject: `[TEST] from ${from}`,
      html: "<p>delivery test</p>",
    }),
  });
  console.log("\nfrom:", from);
  console.log("status:", res.status, await res.text());
}
