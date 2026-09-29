/**
 * Production deploy for nonnegotiation.com on Cloudflare Pages (+ D1 Functions).
 */
import { existsSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const wrangler = path.resolve(root, '../node_modules/wrangler/bin/wrangler.js');

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('bun', ['run', 'build']);

const parentDeployConfig = path.resolve(root, '../.wrangler/deploy/config.json');
const parentDeployBackup = `${parentDeployConfig}.myplan-deploy-bak`;
let parkedParentConfig = false;
if (existsSync(parentDeployConfig) && !existsSync(parentDeployBackup)) {
  try {
    renameSync(parentDeployConfig, parentDeployBackup);
    parkedParentConfig = true;
  } catch (error) {
    console.warn('Could not park parent .wrangler deploy config:', error);
  }
}

try {
  run('node', [
    '--use-system-ca',
    wrangler,
    'pages',
    'deploy',
    'dist',
    '--project-name=my-plan-not-my-mood',
    '--commit-dirty=true',
    '--branch=main',
  ]);
} finally {
  if (parkedParentConfig && existsSync(parentDeployBackup)) {
    try {
      renameSync(parentDeployBackup, parentDeployConfig);
    } catch (error) {
      console.warn('Could not restore parent .wrangler deploy config:', error);
    }
  }
}

console.log('\nDeployed to https://my-plan-not-my-mood.pages.dev (custom domain: https://nonnegotiation.com)');
console.log('Agenda API: /api/agenda  |  Logos API: /api/logos  |  Gear API: /api/gear  |  D1 binding: DB (my-plan-agenda)');
