/**
 * Side Hustle Library age query (?age=) — deep-links from Kids / Teens / Adults / Seniors.
 */

export type GuideLibraryAgeParam = "kids" | "junior" | "adult" | "senior";

const AGE_PARAMS = new Set<GuideLibraryAgeParam>(["kids", "junior", "adult", "senior"]);

/** Parse ?age= from the library URL (accepts teens/seniors aliases). */
export function parseGuideLibraryAgeParam(
  raw: string | null | undefined,
): GuideLibraryAgeParam | null {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (AGE_PARAMS.has(v as GuideLibraryAgeParam)) return v as GuideLibraryAgeParam;
  if (v === "teens" || v === "teen") return "junior";
  if (v === "seniors" || v === "senior") return "senior";
  return null;
}

export function readGuideLibraryAgeFromSearch(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): GuideLibraryAgeParam | null {
  try {
    return parseGuideLibraryAgeParam(new URLSearchParams(search).get("age"));
  } catch {
    return null;
  }
}
