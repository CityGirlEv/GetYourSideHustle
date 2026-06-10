import { processEmailQueue } from "../src/lib/process-email-queue";

// Load environment variables from .env to process.env
import fs from "fs";
const envContent = fs.readFileSync(".env", "utf8");
for (const line of envContent.split(/\r?\n/)) {
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
  process.env[key] = val;
}

console.log("Starting direct queue processing run...");
try {
  const result = await processEmailQueue();
  console.log("Result:", result);
} catch (error) {
  console.error("Queue process directly failed:", error);
}
