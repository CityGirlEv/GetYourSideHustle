/**
 * New memberships stay pending until the person clicks the verification email.
 * That click sets the account Active. Staff do not approve the login.
 */

export function registerUserStatus(
  _membershipTier?: string | null,
): "pending" {
  void _membershipTier;
  return "pending";
}

/**
 * Login must not skip the verification email.
 * Pending memberships become Active only from the emailed link.
 */
export function pendingFreeAccountMaySignIn(_input?: {
  status?: string | null;
  membershipTier?: string | null;
}): boolean {
  void _input;
  return false;
}
