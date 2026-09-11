import { CheckCircle2 } from "lucide-react";
import {
  CREDIT_PAID_DASHBOARD_LINKS,
  creditPaidThankYouCopy,
  type CreditPaidDashboardLinkId,
} from "../lib/member-dashboard";

export function CreditPaidThankYou({
  creditsApplied,
  onOpenDashboard,
  onOpenCredits,
  onOpenBilling,
  onOpenBlueprints,
}: {
  creditsApplied: number;
  onOpenDashboard?: () => void;
  onOpenCredits?: () => void;
  onOpenBilling?: () => void;
  onOpenBlueprints?: () => void;
}) {
  const copy = creditPaidThankYouCopy(creditsApplied);
  const openers: Record<CreditPaidDashboardLinkId, (() => void) | undefined> = {
    dashboard: onOpenDashboard,
    credits: onOpenCredits,
    billing: onOpenBilling,
    blueprints: onOpenBlueprints,
  };

  return (
    <div className="credit-paid-thank-you" role="status" data-testid="credit-paid-thank-you">
      <CheckCircle2 size={28} aria-hidden />
      <h4 data-testid="credit-paid-thank-you-title">{copy.title}</h4>
      <p data-testid="credit-paid-thank-you-body">{copy.body}</p>
      <nav className="credit-paid-thank-you__links" aria-label="Open your dashboard">
        {CREDIT_PAID_DASHBOARD_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className="btn btn-outline"
            data-testid={`credit-paid-thank-you-${link.id}`}
            onClick={(e) => {
              const open = openers[link.id];
              if (!open) return;
              e.preventDefault();
              open();
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
