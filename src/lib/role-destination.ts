export type UserRole =
  | "leads_admin"
  | "admin"
  | "agent"
  | "customer"
  | "qa"
  | "advisor"
  | "editor"
  | "client"
  | "viewer";

/**
 * Where to send a user immediately after a successful login,
 * based on their primary role. Pure function — easy to unit-test.
 */
export function roleDestination(role: UserRole | string | null | undefined): string {
  if (role === "admin" || role === "leads_admin") return "/admin";
  if (role === "agent") return "/agent";
  if (role === "customer") return "/agent";
  if (role === "qa") return "/testing";
  if (role === "client") return "/";
  return "/agent";
}
