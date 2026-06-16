import zip3Data from "@/data/zip3-counties.json";

export type Zip3County = { county: string; stateCode: string };

type RawEntry = { c: string; s: string };
const DATA = zip3Data as unknown as Record<string, RawEntry[]>;

/** Normalize typed/pasted/autofill input to a 3-digit ZIP prefix. */
export function normalizeZip3Input(raw: string): string {
  return raw
    .replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30))
    .replace(/\D/g, "")
    .slice(0, 3);
}

export function countiesForZip3(zip3: string): Zip3County[] {
  const normalized = normalizeZip3Input(zip3);
  if (!/^\d{3}$/.test(normalized)) return [];
  const raw = DATA[normalized];
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
