/**
 * Cloudflare Pages deploy fix for Nitro-generated worker config.
 *
 * Nitro emits main: index.mjs; Pages expects index.js in _worker.js.
 * Do NOT declare an ASSETS binding — Pages injects env.ASSETS automatically
 * for _worker.js, and wrangler 4.98+ rejects a manual ASSETS binding when
 * pages_build_output_dir is present anywhere in the merged config.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const workerDir = path.join(root, "dist", "_worker.js");
const wranglerPath = path.join(workerDir, "wrangler.json");

if (!fs.existsSync(wranglerPath)) {
  console.error("Missing", wranglerPath, "— run npm run build first.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(wranglerPath, "utf8"));

// Worker entry uses `main`; Pages wrangler config cannot set both `main` and
// `pages_build_output_dir`. Pages deploy passes `dist` on the CLI instead.
delete config.pages_build_output_dir;
// Pages provides ASSETS at runtime; manual binding fails wrangler deploy validation.
delete config.assets;

config.name = config.name ?? "mypartb";
config.compatibility_date = config.compatibility_date ?? "2026-06-05";
config.compatibility_flags = config.compatibility_flags ?? ["nodejs_compat"];
config.main = "index.js";
config.no_bundle = true;
config.rules = config.rules ?? [{ type: "ESModule", globs: ["**/*.mjs", "**/*.js"] }];

fs.writeFileSync(wranglerPath, `${JSON.stringify(config, null, 2)}\n`);

if (config.assets?.binding === "ASSETS" || config.pages_build_output_dir) {
  console.error("fix-pages-wrangler: ASSETS/pages_build_output_dir still present after sanitize");
  process.exit(1);
}

const indexMjs = path.join(workerDir, "index.mjs");
const indexJs = path.join(workerDir, "index.js");
if (!fs.existsSync(indexMjs)) {
  console.error("Missing", indexMjs);
  process.exit(1);
}
fs.copyFileSync(indexMjs, indexJs);

console.log("Fixed dist/_worker.js/wrangler.json (main=index.js, no manual ASSETS binding)");
console.log("Worker entry: dist/_worker.js/index.js");
