/**
 * Deploy static assets + _worker.js to Cloudflare Pages.
 *
 * Nitro writes `.wrangler/deploy/config.json` → dist/_worker.js/wrangler.json.
 * Root `wrangler.json` is for the standalone Worker. Hide both during Pages deploy
 * so Wrangler uses the `dist` CLI arg only (no pages_build_output_dir warnings).
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerBin = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const deployConfigPath = path.join(root, ".wrangler", "deploy", "config.json");
const deployConfigBackup = `${deployConfigPath}.pages-deploy-bak`;
const rootWranglerPath = path.join(root, "wrangler.json");
const rootWranglerBackup = `${rootWranglerPath}.pages-deploy-bak`;

function run(args) {
  const result = spawnSync(
    process.execPath,
    ["--use-system-ca", wranglerBin, ...args],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const fixPages = spawnSync(process.execPath, [path.join(root, "scripts", "fix-pages-wrangler.mjs")], {
  cwd: root,
  stdio: "inherit",
});
if (fixPages.status !== 0) {
  process.exit(fixPages.status ?? 1);
}

const hidden = [];
function hide(filePath, backupPath) {
  if (!fs.existsSync(filePath)) return;
  fs.renameSync(filePath, backupPath);
  hidden.push({ filePath, backupPath });
}

hide(deployConfigPath, deployConfigBackup);
hide(rootWranglerPath, rootWranglerBackup);

try {
  run([
    "pages",
    "deploy",
    "dist",
    "--project-name=mypartb",
    "--branch=main",
    "--no-bundle",
    "--commit-dirty=true",
  ]);
} finally {
  for (const { filePath, backupPath } of hidden.reverse()) {
    if (fs.existsSync(backupPath)) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      fs.renameSync(backupPath, filePath);
    }
  }
}

console.log("Pages deploy complete");
