/**
 * Admin-only membership upgrade without Stripe / credit charge.
 */

/** Checkout CTA when the signed-in user is an admin. */
export function adminSimulatePaymentLabel(): string {
  return "Pay as Admin";
}

/** Short helper under the admin pay button. */
export function adminSimulatePaymentHint(): string {
  return "Simulate payment — no Stripe charge";
}

/** Server/client gate: only admins may request a simulated paid upgrade. */
export function canRequestAdminSimulatePayment(
  isAdmin: boolean,
  adminSimulatePayment: boolean,
): boolean {
  return Boolean(isAdmin && adminSimulatePayment);
}
