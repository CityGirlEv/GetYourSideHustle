/**
 * Nitro emits two Vite SSR env builds; only one is wired from _ssr/index.mjs.
 * Wrangler counts every .mjs in dist/_worker.js toward the Worker size limit —
 * delete unreachable duplicate chunks and orphaned puppeteer libs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "node:zlib";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const workerDir = path.join(root, "dist", "_worker.js");

if (!fs.existsSync(workerDir)) {
  console.warn("prune-worker-dead-chunks: no dist/_worker.js — skipping");
  process.exit(0);
}

const IMPORT_RE =
  /(?:from|import)\s*(?:\(\s*)?["'](\.[^"']+)["']\s*\)?/g;

function resolveImport(fromFile, spec) {
  let resolved = path.normalize(path.join(path.dirname(fromFile), spec));
  if (fs.existsSync(resolved)) return resolved;
  if (fs.existsSync(`${resolved}.mjs`)) return `${resolved}.mjs`;
  if (fs.existsSync(`${resolved}.js`)) return `${resolved}.js`;
  return null;
}

function collectReachable(entryFiles) {
  const reachable = new Set();
  const queue = [...entryFiles].filter((f) => fs.existsSync(f));

  while (queue.length) {
    const file = queue.pop();
    if (!file || reachable.has(file)) continue;
    reachable.add(file);

    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(content))) {
      const target = resolveImport(file, m[1]);
      if (target && !reachable.has(target)) queue.push(target);
    }
  }

  return reachable;
}

const entries = [
  path.join(workerDir, "index.mjs"),
  path.join(workerDir, "index.js"),
  path.join(workerDir, "_ssr", "index.mjs"),
];

const reachable = collectReachable(entries);
const allMjs = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full);
    else if (name.name.endsWith(".mjs") || name.name.endsWith(".js")) allMjs.push(full);
  }
}

walk(workerDir);

let removed = 0;
let removedBytes = 0;
for (const file of allMjs) {
  if (reachable.has(file)) continue;
  // Keep wrangler.json and non-module config
  if (file.endsWith("wrangler.json")) continue;
  const size = fs.statSync(file).size;
  fs.unlinkSync(file);
  removed++;
  removedBytes += size;
}

const kept = [...reachable].filter((f) => f.startsWith(workerDir));
let totalBytes = 0;
let gzipBytes = 0;
for (const file of kept) {
  if (!fs.existsSync(file)) continue;
  const buf = fs.readFileSync(file);
  totalBytes += buf.length;
  gzipBytes += gzipSync(buf).length;
}

console.log(
  `prune-worker-dead-chunks: removed ${removed} files (${(removedBytes / (1024 * 1024)).toFixed(2)} MB)`,
);
console.log(
  `prune-worker-dead-chunks: kept ${kept.length} modules — raw ${(totalBytes / (1024 * 1024)).toFixed(2)} MB, gzip ${(gzipBytes / (1024 * 1024)).toFixed(2)} MB`,
);

if (gzipBytes > 3 * 1024 * 1024) {
  console.warn(
    `WARNING: worker gzip total ${(gzipBytes / (1024 * 1024)).toFixed(2)} MB still exceeds 3 MiB free-plan limit`,
  );
}
