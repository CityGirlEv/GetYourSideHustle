/**
 * Deploy the standalone Worker that serves mypartb.com with ASSETS from dist/.
 * Uses dist/wrangler.worker.json — never the Pages _worker.js wrangler config.
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerBin = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const deployConfigPath = path.join(root, ".wrangler", "deploy", "config.json");
const deployConfigBackup = `${deployConfigPath}.worker-deploy-bak`;

const fixWorker = spawnSync(process.execPath, [path.join(root, "scripts", "fix-worker-wrangler.mjs")], {
  cwd: root,
  stdio: "inherit",
});
if (fixWorker.status !== 0) {
  process.exit(fixWorker.status ?? 1);
}

let hadDeployConfig = false;
if (fs.existsSync(deployConfigPath)) {
  fs.renameSync(deployConfigPath, deployConfigBackup);
  hadDeployConfig = true;
}

try {
  const result = spawnSync(
    process.execPath,
    [
      "--use-system-ca",
      wranglerBin,
      "deploy",
      "--config",
      "dist/wrangler.worker.json",
      "--keep-vars",
    ],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
} finally {
  if (hadDeployConfig && fs.existsSync(deployConfigBackup)) {
    if (fs.existsSync(deployConfigPath)) {
      fs.unlinkSync(deployConfigPath);
    }
    fs.renameSync(deployConfigBackup, deployConfigPath);
  }
}

console.log("Worker deploy complete");
