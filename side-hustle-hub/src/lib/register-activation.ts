/**
 * Free signups can use My Dashboard immediately.
 * Paid plans stay pending until checkout / staff activation.
 */

export function registerUserStatus(
  membershipTier: string | null | undefined,
): "active" | "pending" {
  const tier = String(membershipTier || "free").trim().toLowerCase();
  return tier === "free" ? "active" : "pending";
}

/** Existing pending Free accounts may sign in; that flips them to active. */
export function pendingFreeAccountMaySignIn(input: {
  status: string | null | undefined;
  membershipTier?: string | null;
}): boolean {
  const status = String(input.status || "").trim().toLowerCase();
  if (status !== "pending") return false;
  const tier = String(input.membershipTier || "free").trim().toLowerCase();
  return tier === "free";
}
