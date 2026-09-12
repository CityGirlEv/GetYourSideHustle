/**
 * One-shot: dump pinned guide numbers (Free-first A–Z with rideshare still Free for #018).
 * Run: npx vite-node scripts/dump-guide-numbers.mjs
 */
import { writeFileSync } from "node:fs";
import { uniqueGuideLibraryEntries } from "../src/lib/guide-library-pool.ts";

function compareName(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

const entries = uniqueGuideLibraryEntries();
/** Snapshot as if rideshare were still Free (its public #018 identity). */
const histFree = entries
  .filter((e) => e.id === "rideshare" || e.minTier === "free")
  .sort((a, b) => compareName(a.name, b.name) || a.id.localeCompare(b.id));
const histFreeIds = new Set(histFree.map((e) => e.id));
const histRest = entries
  .filter((e) => !histFreeIds.has(e.id))
  .sort((a, b) => compareName(a.name, b.name) || a.id.localeCompare(b.id));
const ordered = [...histFree, ...histRest];

const map: Record<string, string> = {};
ordered.forEach((e, i) => {
  map[e.id] = String(i + 1).padStart(3, "0");
});

console.log("rideshare", map.rideshare);
console.log("count", ordered.length);
writeFileSync(
  new URL("./_guide-number-snapshot.json", import.meta.url),
  JSON.stringify(map, null, 2) + "\n",
  "utf8",
);
console.log("wrote scripts/_guide-number-snapshot.json");
