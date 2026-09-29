import { readFileSync, writeFileSync } from "node:fs";
import { uniqueGuideLibraryEntries } from "../src/lib/guide-library-pool.ts";
import { GUIDE_SUPPLIES } from "../src/lib/guide-supplies.ts";
import { GUIDE_SUGGESTED_PRICING } from "../src/lib/guide-suggested-pricing.ts";
import { guideKitForId } from "../src/lib/guide-tools.ts";

const src = readFileSync("src/lib/guide-prep-defaults.ts", "utf8");

function blockKeys(constName: string): Set<string> {
  const start = src.indexOf(`const ${constName}`);
  const brace = src.indexOf("{", start);
  let depth = 0;
  let end = brace;
  for (let i = brace; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const block = src.slice(brace, end + 1);
  const keys = new Set<string>();
  for (const m of block.matchAll(/(?:^|\n)\s*(?:\"([^\"]+)\"|([A-Za-z0-9_-]+))\s*:\s*\{/g)) {
    keys.add(m[1] ?? m[2]);
  }
  return keys;
}

const supplyKeys = blockKeys("SUPPLY_OVERRIDES");
const pricingKeys = blockKeys("PRICING_OVERRIDES");

const missingS: Array<{ id: string; name: string; sample: string }> = [];
const missingP: Array<{ id: string; name: string; sample: string }> = [];

for (const e of uniqueGuideLibraryEntries()) {
  const kit = guideKitForId(e.id);
  const hasS = Boolean(GUIDE_SUPPLIES[e.id]?.items?.length) || supplyKeys.has(e.id);
  const hasP = Boolean(GUIDE_SUGGESTED_PRICING[e.id]?.items?.length) || pricingKeys.has(e.id);
  if (!hasS) {
    missingS.push({
      id: e.id,
      name: e.name,
      sample: `${kit.supplies?.starterKitTotal} :: ${(kit.supplies?.items ?? []).map((i) => i.name).join(", ")}`,
    });
  }
  if (!hasP) {
    missingP.push({
      id: e.id,
      name: e.name,
      sample: (kit.suggestedPricing?.items ?? []).map((i) => `${i.label}=${i.price}`).join(" | "),
    });
  }
}

const out = {
  supplyOverrideCount: supplyKeys.size,
  pricingOverrideCount: pricingKeys.size,
  missingSCount: missingS.length,
  missingPCount: missingP.length,
  missingS,
  missingP,
  touchIds: [...new Set([...missingS.map((r) => r.id), ...missingP.map((r) => r.id)])].sort(),
};
writeFileSync("tmp-missing-prep-overrides.json", JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      supplyOverrideCount: out.supplyOverrideCount,
      pricingOverrideCount: out.pricingOverrideCount,
      missingSCount: out.missingSCount,
      missingPCount: out.missingPCount,
      touchIds: out.touchIds,
    },
    null,
    2,
  ),
);
