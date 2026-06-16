const LOCALE_OPTS: Intl.CollatorOptions = { sensitivity: "base" };

/** Parse first/last name from a display string (full name or email fallback). */
export function parseStaffNameParts(displayName: string): { firstName: string; lastName: string } {
  const trimmed = displayName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: parts[0]! };
  }
  return {
    firstName: parts[0]!,
    lastName: parts[parts.length - 1]!,
  };
}

/** Compare two display names A–Z by first name, then last name, then full string. */
export function compareStaffByDisplayName(aName: string, bName: string): number {
  const a = parseStaffNameParts(aName);
  const b = parseStaffNameParts(bName);
  const firstCmp = a.firstName.localeCompare(b.firstName, undefined, LOCALE_OPTS);
  if (firstCmp !== 0) return firstCmp;
  const lastCmp = a.lastName.localeCompare(b.lastName, undefined, LOCALE_OPTS);
  if (lastCmp !== 0) return lastCmp;
  return aName.trim().localeCompare(bName.trim(), undefined, LOCALE_OPTS);
}

export function compareStaffByFullName(
  a: { full_name?: string | null; email?: string | null },
  b: { full_name?: string | null; email?: string | null },
): number {
  const aName = (a.full_name || a.email || "").trim();
  const bName = (b.full_name || b.email || "").trim();
  return compareStaffByDisplayName(aName, bName);
}

export function sortStaffByName<T>(items: readonly T[], getDisplayName: (item: T) => string): T[] {
  return [...items].sort((a, b) => compareStaffByDisplayName(getDisplayName(a), getDisplayName(b)));
}

/** @deprecated Use sortStaffByName — kept for call-site compatibility. */
export const sortStaffByLastName = sortStaffByName;
