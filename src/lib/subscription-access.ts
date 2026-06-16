/** Subscription statuses that unlock agent dashboard features. */
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export type SubscriptionSnapshot = {
  status: string | null;
  planKey: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export function isActiveSubscriptionStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}

export function hasAgentDashboardAccess(opts: {
  roles: string[];
  subscription: SubscriptionSnapshot | null | undefined;
}): boolean {
  const { roles, subscription } = opts;
  if (roles.includes("admin") || roles.includes("leads_admin")) return true;
  if (!isActiveSubscriptionStatus(subscription?.status)) return false;
  return roles.includes("agent") || roles.includes("customer");
}
