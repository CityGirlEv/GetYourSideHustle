import fs from "fs";
import { spawnSync } from "child_process";

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

const key = loadEnv().RESEND_API_KEY?.trim();
if (!key || !key.startsWith("re_")) {
  console.error("RESEND_API_KEY missing or invalid in .env");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["wrangler", "pages", "secret", "put", "RESEND_API_KEY", "--project-name", "mypartb"],
  {
    input: key,
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Uploaded RESEND_API_KEY to Cloudflare Pages (production).");
