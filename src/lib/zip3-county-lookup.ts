import zip3Data from "@/data/zip3-counties.json";

export type Zip3County = { county: string; stateCode: string };

type RawEntry = { c: string; s: string };
const DATA = zip3Data as unknown as Record<string, RawEntry[]>;

export function countiesForZip3(zip3: string): Zip3County[] {
  if (!/^\d{3}$/.test(zip3)) return [];
  const raw = DATA[zip3];
  if (!raw) return [];
  return raw.map((e) => ({ county: e.c, stateCode: e.s }));
}

export function normalizeCountyName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+(county|parish|borough|census area|municipality|city and borough)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function countyMatchesZip3(input: string, zip3: string): Zip3County | null {
  const list = countiesForZip3(zip3);
  if (!list.length) return null;
  const n = normalizeCountyName(input);
  if (!n) return null;
  return list.find((c) => normalizeCountyName(c.county) === n) ?? null;
}