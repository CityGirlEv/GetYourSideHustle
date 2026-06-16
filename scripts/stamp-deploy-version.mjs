/**
 * Marks dist/version.json as live immediately before Cloudflare Pages deploy.
 * The gate only reacts to manifests with live: true, so failed builds / local
 * builds that never reach this step do not trigger "New version available".
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const distVersionPath = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "version.json");

let manifest;
try {
  manifest = JSON.parse(readFileSync(distVersionPath, "utf8"));
} catch (error) {
  console.error(`stamp-deploy-version: could not read ${distVersionPath}`);
  throw error;
}

if (typeof manifest.buildId !== "string" || !manifest.buildId) {
  throw new Error("stamp-deploy-version: dist/version.json is missing buildId");
}

manifest.live = true;
manifest.deployedAt = new Date().toISOString();

writeFileSync(distVersionPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`stamp-deploy-version: marked ${manifest.buildId} as live`);
