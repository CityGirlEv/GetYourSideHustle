// Lightweight client for the NLM RxNorm API — https://rxnav.nlm.nih.gov
// RxNorm is the standard vocabulary CMS uses to identify Medicare-approved
// prescription drugs, so a hit here means the drug is FDA-recognized and
// eligible to appear on a Medicare Part D formulary (individual plan
// formularies still vary). The API is free, requires no auth, and is
// CORS-enabled — safe to call directly from the browser.
// Docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html

export interface RxNormSuggestion {
  rxcui: string;
  name: string;
  score: number;
}

const BASE = "https://rxnav.nlm.nih.gov/REST";

/** Typeahead-style search. Returns deduped, named candidates ranked by RxNorm. */
export async function searchRxNorm(
  query: string,
  maxEntries = 8,
  signal?: AbortSignal,
): Promise<RxNormSuggestion[]> {
  const term = query.trim();
  if (term.length < 3) return [];
  try {
    const r = await fetch(
      `${BASE}/approximateTerm.json?term=${encodeURIComponent(term)}&maxEntries=${maxEntries * 2}`,
      { signal },
    );
    if (!r.ok) return [];
    const j = await r.json();
    const candidates: Array<{ rxcui?: string; name?: string; score?: string }> =
      j?.approximateGroup?.candidate ?? [];
    const seen = new Set<string>();
    const out: RxNormSuggestion[] = [];
    for (const c of candidates) {
      if (!c.name || !c.rxcui) continue;
      const key = c.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ rxcui: c.rxcui, name: c.name, score: Number(c.score ?? 0) });
      if (out.length >= maxEntries) break;
    }
    return out;
  } catch {
    return [];
  }
}

export interface GenericInfo {
  /** Generic active-ingredient name(s), e.g. "atorvastatin". */
  generic?: string;
  /** True when RxNorm confirms there is no generic equivalent. */
  noGenericAvailable: boolean;
}

/** Look up the generic (active ingredient, TTY=IN) for a given RxCUI. */
export async function getGenericFor(rxcui: string, signal?: AbortSignal): Promise<GenericInfo> {
  try {
    const r = await fetch(`${BASE}/rxcui/${rxcui}/related.json?tty=IN`, { signal });
    if (!r.ok) return { noGenericAvailable: false };
    const j = await r.json();
    const groups: Array<{ tty: string; conceptProperties?: Array<{ name: string }> }> =
      j?.relatedGroup?.conceptGroup ?? [];
    const ins = groups.find((g) => g.tty === "IN")?.conceptProperties ?? [];
    if (!ins.length) return { noGenericAvailable: true };
    const generic = ins.map((c) => c.name).join(" / ");
    return { generic, noGenericAvailable: false };
  } catch {
    return { noGenericAvailable: false };
  }
}
