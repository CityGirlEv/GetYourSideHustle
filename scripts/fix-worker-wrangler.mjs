/**
 * Standalone Worker config for mypartb.com (custom domain routes through Worker).
 * Keep separate from dist/_worker.js/wrangler.json — that file is for Pages deploy
 * and must not include a manual ASSETS binding.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const workerWranglerPath = path.join(root, "dist", "_worker.js", "wrangler.json");
const standalonePath = path.join(root, "dist", "wrangler.worker.json");

if (!fs.existsSync(workerWranglerPath)) {
  console.error("Missing", workerWranglerPath, "— run npm run build first.");
  process.exit(1);
}

const generated = JSON.parse(fs.readFileSync(workerWranglerPath, "utf8"));

const config = {
  name: generated.name ?? "mypartb",
  compatibility_date: generated.compatibility_date ?? "2026-06-05",
  compatibility_flags: generated.compatibility_flags ?? ["nodejs_compat"],
  main: "_worker.js/index.js",
  no_bundle: true,
  rules: generated.rules ?? [{ type: "ESModule", globs: ["**/*.mjs", "**/*.js"] }],
  assets: { binding: "ASSETS", directory: "." },
};

fs.writeFileSync(standalonePath, `${JSON.stringify(config, null, 2)}\n`);
console.log("Wrote dist/wrangler.worker.json for standalone Worker deploy");
