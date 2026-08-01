/** Small helpers so App can avoid eagerly importing KidDashboard. */

/** Logged-in youth (kid/teen) accounts get the dedicated kid dashboard. */
export function isYouthDashboardUser(user: {
  role?: string;
  roles?: string[];
  audience?: string;
} | null | undefined): boolean {
  if (!user) return false;
  const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
  const audience = String(user.audience || "").toLowerCase();
  return (
    roles.includes("kid") ||
    roles.includes("junior") ||
    audience === "kids" ||
    audience === "junior"
  );
}

export function youthAgeBand(user: {
  role?: string;
  roles?: string[];
  audience?: string;
} | null | undefined): "kids" | "junior" {
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const audience = String(user?.audience || "").toLowerCase();
  if (roles.includes("junior") || audience === "junior") return "junior";
  return "kids";
}
