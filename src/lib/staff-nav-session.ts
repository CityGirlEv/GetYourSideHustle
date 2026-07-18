/** sessionStorage key — remembers which user id last had staff nav access. */
const STAFF_NAV_USER_KEY = "staff-nav-user-id";

export function persistStaffNavUser(userId: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STAFF_NAV_USER_KEY, userId);
}

export function clearStaffNavUser(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STAFF_NAV_USER_KEY);
}

export function hasStaffNavHint(userId: string | undefined): boolean {
  if (!userId || typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(STAFF_NAV_USER_KEY) === userId;
}
