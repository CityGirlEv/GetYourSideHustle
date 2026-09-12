import { writeFileSync } from "node:fs";
import { guideKitForId } from "../src/lib/guide-tools.ts";
import { uniqueGuideLibraryEntries } from "../src/lib/guide-library-pool.ts";
import { GUIDE_SUPPLIES } from "../src/lib/guide-supplies.ts";
import { GUIDE_SUGGESTED_PRICING } from "../src/lib/guide-suggested-pricing.ts";
import { defaultSuppliesForGuide, defaultSuggestedPricingForGuide } from "../src/lib/guide-prep-defaults.ts";

const rows = uniqueGuideLibraryEntries().map((e) => {
  const kit = guideKitForId(e.id);
  const defS = defaultSuppliesForGuide(e.id);
  const defP = defaultSuggestedPricingForGuide(e.id);
  return {
    id: e.id,
    name: e.name,
    authoredS: Boolean(GUIDE_SUPPLIES[e.id]?.items?.length),
    authoredP: Boolean(GUIDE_SUGGESTED_PRICING[e.id]?.items?.length),
    sCount: kit.supplies?.items?.length ?? 0,
    pCount: kit.suggestedPricing?.items?.length ?? 0,
    defKindHint: defS.starterKitTotal,
    p0: kit.suggestedPricing?.items?.[0],
    s0: kit.supplies?.items?.[0]?.name,
  };
});

writeFileSync(
  "tmp-pricing-supplies.json",
  JSON.stringify(
    {
      total: rows.length,
      empty: rows.filter((r) => !r.sCount || !r.pCount).length,
      authoredOnlyS: rows.filter((r) => r.authoredS).length,
      authoredOnlyP: rows.filter((r) => r.authoredP).length,
      samples: rows.filter((r) => !r.authoredS || !r.authoredP).slice(0, 25),
    },
    null,
    2,
  ),
);
console.log("wrote tmp-pricing-supplies.json");
