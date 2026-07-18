import type { AudienceGroup } from "./membership";

const STORAGE_KEY = "gysh_join_audience";

const VALID: AudienceGroup[] = ["kids", "junior", "adult", "senior"];

export function isAudienceGroup(value: unknown): value is AudienceGroup {
  return typeof value === "string" && (VALID as string[]).includes(value);
}

export function normalizeAudienceGroup(
  value: unknown,
  fallback: AudienceGroup = "adult",
): AudienceGroup {
  return isAudienceGroup(value) ? value : fallback;
}

export function readSavedJoinAudience(fallback: AudienceGroup = "adult"): AudienceGroup {
  try {
    return normalizeAudienceGroup(localStorage.getItem(STORAGE_KEY), fallback);
  } catch {
    return fallback;
  }
}

export function saveJoinAudience(audience: AudienceGroup): void {
  try {
    localStorage.setItem(STORAGE_KEY, audience);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Map wizard / corner age groups onto membership audience tabs. */
export function audienceFromAgeGroup(
  ageGroup: "kids" | "junior" | "adult" | "senior" | string | null | undefined,
): AudienceGroup {
  return normalizeAudienceGroup(ageGroup, "adult");
}
