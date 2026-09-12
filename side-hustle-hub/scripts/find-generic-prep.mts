import { writeFileSync } from "node:fs";
import { uniqueGuideLibraryEntries } from "../src/lib/guide-library-pool.ts";
import { guideKitForId } from "../src/lib/guide-tools.ts";
import { GUIDE_SUPPLIES } from "../src/lib/guide-supplies.ts";
import { GUIDE_SUGGESTED_PRICING } from "../src/lib/guide-suggested-pricing.ts";
import {
  defaultSuppliesForGuide,
  defaultSuggestedPricingForGuide,
} from "../src/lib/guide-prep-defaults.ts";

const genericP: Array<Record<string, unknown>> = [];
const genericS: Array<Record<string, unknown>> = [];
const usingKindFallback: string[] = [];

for (const e of uniqueGuideLibraryEntries()) {
  const kit = guideKitForId(e.id);
  const defS = defaultSuppliesForGuide(e.id);
  const defP = defaultSuggestedPricingForGuide(e.id);
  const kitS = kit.supplies;
  const kitP = kit.suggestedPricing;
  const authoredS = Boolean(GUIDE_SUPPLIES[e.id]?.items?.length);
  const authoredP = Boolean(GUIDE_SUGGESTED_PRICING[e.id]?.items?.length);

  // If kit equals kind-default path: no authored + matches def which may still be override
  // Detect generic label patterns
  const pLabels = (kitP?.items ?? []).map((i) => i.label).join(" | ");
  const sNames = (kitS?.items ?? []).map((i) => i.name).join(" | ");
  const sTotal = kitS?.starterKitTotal ?? "";

  const looksGenericP =
    /Scoped starter project|Hourly helper rate|Multi-task bundle|single asset \/ clip|5-asset content pack|starter product price|per piece|Chore payout toward goal|Parent-approved chore|learning goals/i.test(
      pLabels,
    ) ||
    new RegExp(
      `${e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} (hourly|single task|single asset|per piece|starter product|setup fee)`,
      "i",
    ).test(pLabels);

  const looksGenericS =
    /starter materials|delivery \/ client-facing printables|small helper kit|car\/phone comfort gear|turnover \/ showing essentials|Quiet activities \/ games pack|first batch materials/i.test(
      `${sTotal} ${sNames}`,
    );

  // Kind fallback: kit supplies/pricing identical to default AND default looks archetype-ish
  const sameAsDefaultS =
    JSON.stringify(kitS?.items?.map((i) => i.id)) ===
    JSON.stringify(defS.items.map((i) => i.id));
  const sameAsDefaultP =
    JSON.stringify(kitP?.items?.map((i) => i.id)) ===
    JSON.stringify(defP.items.map((i) => i.id));

  if (!authoredS && !authoredP && (looksGenericP || looksGenericS)) {
    usingKindFallback.push(e.id);
  }

  if (looksGenericP) {
    genericP.push({ id: e.id, name: e.name, pLabels, authoredP });
  }
  if (looksGenericS) {
    genericS.push({ id: e.id, name: e.name, sTotal, sNames, authoredS });
  }
}

writeFileSync(
  "tmp-generic-prep.json",
  JSON.stringify(
    {
      genericPCount: genericP.length,
      genericSCount: genericS.length,
      usingKindFallbackCount: usingKindFallback.length,
      usingKindFallback,
      genericP,
      genericS,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      genericPCount: genericP.length,
      genericSCount: genericS.length,
      usingKindFallbackCount: usingKindFallback.length,
      usingKindFallback,
      genericPIds: genericP.map((r) => r.id),
      genericSIds: genericS.map((r) => r.id),
    },
    null,
    2,
  ),
);
