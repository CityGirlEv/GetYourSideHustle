import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCartItemPrice, summarizeCartTotals } from "@/lib/cart-products";
import { useCart } from "@/lib/cart-store";
import type { StripePlanKey } from "@/lib/stripe-products";
import { formatAgentUsd } from "@/lib/agent-pricing-tiers";
import { formatUsd } from "@/lib/lead-pricing";

type PurchaseCartPanelProps = {
  canCheckoutStripe?: boolean;
  stripeCheckoutDisabledReason?: string;
  onCheckoutStripePlan?: (planKey: StripePlanKey) => void | Promise<void>;
  checkoutBusy?: boolean;
};

export function PurchaseCartPanel({
  canCheckoutStripe = false,
  stripeCheckoutDisabledReason,
  onCheckoutStripePlan,
  checkoutBusy = false,
}: PurchaseCartPanelProps) {
  const { items, itemCount, removeItem, clearCart } = useCart();

  if (itemCount === 0) return null;

  const stripeItems = items.filter((item) => item.checkoutViaStripe && item.stripePlanKey);
  const totals = summarizeCartTotals(items);

  return (
    <Card className="glass p-5 space-y-4 border-primary/20" data-testid="purchase-cart-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="font-display text-lg font-bold">Your cart</h3>
          <Badge variant="secondary">{itemCount}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} disabled={checkoutBusy}>
          Clear cart
        </Button>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.cartKey}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-background/40 p-3"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium">{item.label}</p>
              {item.subtitle ? (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              ) : null}
              <p className="text-xs font-semibold text-primary tabular-nums">
                {formatCartItemPrice(item)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={`Remove ${item.label}`}
              onClick={() => removeItem(item.cartKey)}
              disabled={checkoutBusy}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="text-xs text-muted-foreground space-y-1">
        {totals.monthlySubtotal > 0 ? (
          <p>Monthly items: {formatAgentUsd(totals.monthlySubtotal)}/mo</p>
        ) : null}
        {totals.oneTimeSubtotal > 0 ? (
          <p>One-time items: {formatUsd(totals.oneTimeSubtotal)}</p>
        ) : null}
        {totals.perLeadSubtotal > 0 ? (
          <p>Per-lead items: {formatUsd(totals.perLeadSubtotal)}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {stripeItems.map((item) => (
          <Button
            key={item.cartKey}
            className="grad-indigo"
            disabled={!canCheckoutStripe || checkoutBusy || !item.stripePlanKey}
            title={!canCheckoutStripe ? stripeCheckoutDisabledReason : undefined}
            onClick={() => item.stripePlanKey && onCheckoutStripePlan?.(item.stripePlanKey)}
          >
            {checkoutBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Checkout {item.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
