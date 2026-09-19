/** Wired My Dashboard tabs only — no placeholder gamification tabs. */
export const DASHBOARD_PORTAL_TAB_IDS = [
  "blueprint",
  "schedule",
  "family",
  "credits",
  "referral",
  "purchases",
  "earn",
] as const;

export type DashboardPortalTabId = (typeof DASHBOARD_PORTAL_TAB_IDS)[number];

/** My Dashboard landing (Blueprint tab is the default). */
export const DASHBOARD_HREF = "/my-dashboard";

/** My Dashboard → Blueprint tab. */
export const BLUEPRINT_DASHBOARD_HREF = "/my-dashboard#blueprint";

export function isBlueprintDashboardHash(hash: string): boolean {
  const h = String(hash || "").replace(/^#/, "").toLowerCase();
  return h === "blueprint" || h === "blueprints";
}

export function creditPaidThankYouCopy(creditsApplied: number): { title: string; body: string } {
  const n = Math.max(0, Math.floor(Number(creditsApplied) || 0));
  return {
    title: "Thank you!",
    body:
      n > 0
        ? `Your payment of ${n} credit${n === 1 ? "" : "s"} is complete. Nothing is due in cash.`
        : "Your payment is complete.",
  };
}

export const CREDIT_PAID_DASHBOARD_LINKS = [
  { id: "dashboard", href: DASHBOARD_HREF, label: "Dashboard" },
  { id: "credits", href: "/my-dashboard#credits", label: "Credits" },
  { id: "billing", href: "/my-dashboard#billing", label: "Billing" },
  { id: "blueprints", href: BLUEPRINT_DASHBOARD_HREF, label: "Blueprints" },
] as const;

export type CreditPaidDashboardLinkId = (typeof CREDIT_PAID_DASHBOARD_LINKS)[number]["id"];
