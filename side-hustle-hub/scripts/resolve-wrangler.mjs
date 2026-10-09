import { existsSync } from "node:fs";
import path from "node:path";

/** Prefer a project-local wrangler, then the sibling Muntie install. */
export function wranglerBinCandidates(root) {
  return [
    path.resolve(root, "node_modules/wrangler/bin/wrangler.js"),
    path.resolve(root, "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js"),
  ];
}

export function resolveWranglerBin(root, exists = existsSync) {
  return wranglerBinCandidates(root).find((candidate) => exists(candidate)) ?? null;
}
