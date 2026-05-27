export type UserRole = "admin" | "agent" | "qa" | "advisor" | "editor" | "viewer";

/**
 * Where to send a user immediately after a successful login,
 * based on their primary role. Pure function — easy to unit-test.
 */
export function roleDestination(role: UserRole | string | null | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "agent") return "/agent";
  if (role === "qa") return "/testing";
  return "/advisor";
}