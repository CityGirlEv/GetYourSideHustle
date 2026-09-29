import { LayoutDashboard } from "lucide-react";
import { dashboardNavPlanLabel, dashboardNavTone } from "../lib/membership";

/** Compact My Dashboard chip — plan color plus the membership level (Free / Starter / Pro / Elite). */
export function HeaderDashboardBadge({
  membershipTier,
  isActive = false,
  onClick,
}: {
  membershipTier?: string | null;
  isActive?: boolean;
  onClick: () => void;
}) {
  const plan = dashboardNavPlanLabel(membershipTier);
  return (
    <button
      type="button"
      className={`header-title-dashboard-badge header-title-dashboard-badge--compact nav-dashboard-btn${
        isActive ? " is-active" : ""
      }`}
      data-tier={dashboardNavTone(membershipTier)}
      onClick={onClick}
      data-testid="page-focus-dashboard"
      aria-current={isActive ? "page" : undefined}
      aria-label={`My Dashboard · ${plan} membership level`}
    >
      <LayoutDashboard size={14} aria-hidden />
      <span>My Dashboard</span>
      <span className="header-title-dashboard-badge__plan" data-testid="dashboard-membership-level">
        {plan}
      </span>
    </button>
  );
}
