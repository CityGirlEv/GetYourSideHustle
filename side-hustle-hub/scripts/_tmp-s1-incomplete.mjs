import { d1Select } from "./_d1-remote.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Pull catalog IDs from source without importing the full TS graph. */
function catalogIdsFromSources() {
  const roots = [
    "src/lib/gysh-test-plan.ts",
    "src/lib/gysh-proofread-cases.ts",
    "src/lib/gysh-automated-tests.ts",
  ];
  const ids = new Set();
  const re = /id:\s*"([^"]+)"/g;
  for (const rel of roots) {
    const text = readFileSync(join(process.cwd(), rel), "utf8");
    let m;
    while ((m = re.exec(text))) {
      const id = m[1];
      if (id.startsWith("WIZ-") || id.includes("wizard")) continue;
      ids.add(id);
    }
  }
  return ids;
}

const catalog = catalogIdsFromSources();
const passLike = new Set(["pass", "conditional_approval"]);

const s1 =
  d1Select(
    "SELECT case_id, status, sprint FROM test_case_status WHERE sprint = 1",
  )?.[0]?.results ?? [];

const s2 =
  d1Select(
    "SELECT case_id, status, sprint FROM test_case_status WHERE sprint = 2",
  )?.[0]?.results ?? [];

const s1Catalog = s1.filter((r) => catalog.has(String(r.case_id)));
const s1Incomplete = s1Catalog.filter((r) => !passLike.has(String(r.status)));
const s1Pass = s1Catalog.filter((r) => passLike.has(String(r.status)));
const s1Orphan = s1.filter((r) => !catalog.has(String(r.case_id)));

const s2Catalog = s2.filter((r) => catalog.has(String(r.case_id)));
const s2Rolled = s2Catalog.filter((r) => r.status === "rolled_over");
const s2Orphan = s2.filter((r) => !catalog.has(String(r.case_id)));

const byStatus = {};
for (const r of s1Incomplete) {
  const st = String(r.status);
  byStatus[st] = (byStatus[st] || 0) + 1;
}

console.log({
  catalogSize: catalog.size,
  sprint1: {
    totalRows: s1.length,
    catalog: s1Catalog.length,
    passLike: s1Pass.length,
    incompleteCatalog: s1Incomplete.length,
    incompleteByStatus: byStatus,
    orphan: s1Orphan.length,
  },
  sprint2: {
    totalRows: s2.length,
    catalog: s2Catalog.length,
    rolledOverCatalog: s2Rolled.length,
    orphan: s2Orphan.length,
  },
  incompleteSample: s1Incomplete.slice(0, 15).map((r) => `${r.case_id}:${r.status}`),
});
