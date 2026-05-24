// Free, key-less ZIP→county lookup.
// 1) api.zippopotam.us gives places (lat/lon) for a US ZIP.
// 2) geo.fcc.gov Census area API maps a lat/lon to a county.
// We dedupe counties across all places in the ZIP.

export type CountyMatch = {
  county: string;       // e.g. "Harris County"
  state: string;        // e.g. "Texas"
  stateCode: string;    // e.g. "TX"
};

type ZippoPlace = {
  "place name": string;
  latitude: string;
  longitude: string;
  state: string;
  "state abbreviation": string;
};

const cache = new Map<string, Promise<CountyMatch[]>>();

export function lookupCountiesForZip(zip: string): Promise<CountyMatch[]> {
  if (!/^\d{5}$/.test(zip)) return Promise.resolve([]);
  const hit = cache.get(zip);
  if (hit) return hit;

  const p = (async (): Promise<CountyMatch[]> => {
    const zRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!zRes.ok) throw new Error(`ZIP not found (${zip})`);
    const zData = (await zRes.json()) as { places: ZippoPlace[] };
    const places = zData.places ?? [];

    const results = await Promise.all(
      places.map(async (pl) => {
        try {
          const r = await fetch(
            `https://geo.fcc.gov/api/census/area?lat=${pl.latitude}&lon=${pl.longitude}&format=json`
          );
          if (!r.ok) return null;
          const j = (await r.json()) as {
            results: { county_name: string; state_name: string; state_code: string }[];
          };
          const top = j.results?.[0];
          if (!top?.county_name) return null;
          return {
            county: top.county_name,
            state: top.state_name,
            stateCode: top.state_code,
          } as CountyMatch;
        } catch {
          return null;
        }
      })
    );

    const seen = new Set<string>();
    const out: CountyMatch[] = [];
    for (const r of results) {
      if (!r) continue;
      const key = `${r.county}|${r.stateCode}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  })();

  cache.set(zip, p);
  // Don't cache failures forever.
  p.catch(() => cache.delete(zip));
  return p;
}

export function normalizeCountyName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+(county|parish|borough|census area|municipality|city and borough)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function countyMatchesList(input: string, list: CountyMatch[]): CountyMatch | null {
  const n = normalizeCountyName(input);
  if (!n) return null;
  return list.find((c) => normalizeCountyName(c.county) === n) ?? null;
}