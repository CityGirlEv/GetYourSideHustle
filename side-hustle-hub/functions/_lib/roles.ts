/** Shared role helpers for GYSH D1 users (single primary + optional multi-role JSON). */

export const ALL_ROLES = ["admin", "qa", "kid", "junior", "adult", "senior"] as const;
export type GyshRole = (typeof ALL_ROLES)[number];

/** Privilege order — first match becomes the stored primary `role`. */
const ROLE_PRIORITY: GyshRole[] = ["admin", "qa", "adult", "senior", "junior", "kid"];

export function isGyshRole(value: unknown): value is GyshRole {
  return typeof value === "string" && (ALL_ROLES as readonly string[]).includes(value);
}

export function parseRoles(role: string, rolesJson?: string | null): GyshRole[] {
  if (rolesJson) {
    try {
      const parsed = JSON.parse(rolesJson);
      if (Array.isArray(parsed)) {
        const roles = [...new Set(parsed.filter(isGyshRole))];
        if (roles.length > 0) return sortRoles(roles);
      }
    } catch {
      /* fall through */
    }
  }
  return isGyshRole(role) ? [role] : ["adult"];
}

export function sortRoles(roles: GyshRole[]): GyshRole[] {
  return [...roles].sort(
    (a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b),
  );
}

export function primaryRole(roles: GyshRole[]): GyshRole {
  const sorted = sortRoles(roles);
  return sorted[0] ?? "adult";
}

export function serializeRoles(roles: GyshRole[]): string {
  return JSON.stringify(sortRoles([...new Set(roles)]));
}

/** Normalize body input: prefer `roles` array, else single `role`. */
export function normalizeRolesInput(
  role: unknown,
  roles: unknown,
): GyshRole[] | null {
  if (Array.isArray(roles)) {
    const list = [...new Set(roles.filter(isGyshRole))];
    if (list.length === 0) return null;
    return sortRoles(list);
  }
  if (isGyshRole(role)) return [role];
  return null;
}

/** Portal login / Admin Studio: admin or QA (or both). */
export function canAccessAdminPortal(roles: GyshRole[]): boolean {
  return roles.includes("admin") || roles.includes("qa");
}

export function hasRole(roles: GyshRole[], role: GyshRole): boolean {
  return roles.includes(role);
}
