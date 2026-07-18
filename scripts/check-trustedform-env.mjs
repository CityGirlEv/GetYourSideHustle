import fs from "fs";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const i = line.indexOf("=");
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

console.log("VITE_TRUSTEDFORM_ENABLED:", env.VITE_TRUSTEDFORM_ENABLED || "(unset — auto on mypartb.com only)");
console.log("VITE_TRUSTEDFORM_SANDBOX:", env.VITE_TRUSTEDFORM_SANDBOX || "(unset — sandbox on localhost)");
