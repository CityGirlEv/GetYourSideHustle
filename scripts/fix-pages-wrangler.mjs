/**
 * Cloudflare Pages deploy fix for Nitro-generated worker config.
 *
 * Nitro emits main: index.mjs; Pages expects index.js in _worker.js.
 * Keep the ASSETS binding so the worker can serve /assets/* (CSS, JS, images).
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

// pages_build_output_dir is only for wrangler.toml-style deploys, not pages deploy dist/
delete config.pages_build_output_dir;

config.name = config.name ?? "mypartb";
config.compatibility_date = config.compatibility_date ?? "2026-06-05";
config.compatibility_flags = config.compatibility_flags ?? ["nodejs_compat"];
config.main = "index.js";
config.no_bundle = true;
config.rules = config.rules ?? [{ type: "ESModule", globs: ["**/*.mjs", "**/*.js"] }];

// Required: worker fetch handler serves public assets via env.ASSETS.fetch()
if (!config.assets) {
  config.assets = { binding: "ASSETS", directory: ".." };
}

fs.writeFileSync(wranglerPath, `${JSON.stringify(config, null, 2)}\n`);

const indexMjs = path.join(workerDir, "index.mjs");
const indexJs = path.join(workerDir, "index.js");
if (!fs.existsSync(indexMjs)) {
  console.error("Missing", indexMjs);
  process.exit(1);
}
fs.copyFileSync(indexMjs, indexJs);

console.log("Fixed dist/_worker.js/wrangler.json (kept ASSETS binding, main=index.js)");
console.log("Worker entry: dist/_worker.js/index.js");
