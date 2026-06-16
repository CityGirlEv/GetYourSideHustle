import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");
const raw = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  env[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, "");
}

console.log("SUPABASE_URL:", env.SUPABASE_URL ?? "(missing)");
console.log("VITE_SUPABASE_URL:", env.VITE_SUPABASE_URL ?? "(missing)");
console.log("URLs match:", env.SUPABASE_URL === env.VITE_SUPABASE_URL);
console.log("Has SUPABASE_PUBLISHABLE_KEY:", Boolean(env.SUPABASE_PUBLISHABLE_KEY));
console.log("Has VITE_SUPABASE_PUBLISHABLE_KEY:", Boolean(env.VITE_SUPABASE_PUBLISHABLE_KEY));
console.log(
  "Publishable keys match:",
  env.SUPABASE_PUBLISHABLE_KEY === env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
console.log("Has SUPABASE_SERVICE_ROLE_KEY:", Boolean(env.SUPABASE_SERVICE_ROLE_KEY));
if (env.SUPABASE_URL) {
  const ref = env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log("Project ref from URL:", ref ?? "(unparseable)");
}

const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (serviceKey) {
  const parts = serviceKey.split(".");
  if (parts.length >= 2) {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    console.log("Service key role:", payload.role);
    console.log("Service key ref:", payload.ref);
    console.log(
      "Service key matches URL:",
      payload.ref === env.SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1],
    );
  } else {
    console.log("Service key is not a JWT");
  }
}
