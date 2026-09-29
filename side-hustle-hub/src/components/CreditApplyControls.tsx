import { Coins } from "lucide-react";
import { formatUsd } from "../lib/membership";
import { formatKidCreditBalance } from "../lib/member-credits";
import { creditApplyView, shouldShowApplyAllCredits, type MixedPayQuote } from "../lib/credit-checkout";
import { CART_CREDITS_WAIT_MS } from "../lib/wait-estimate";
import { WaitIndicator, WaitLabel } from "./WaitFeedback";

export function CreditApplyControls({
  quote,
  onCreditsChange,
  signedIn,
  onSignIn,
  loading = false,
  cartItemCount = 1,
  showApplyInputs = true,
  panelId = "gysh-pay-with-credits",
}: {
  quote: MixedPayQuote;
  onCreditsChange: (credits: number) => void;
  signedIn: boolean;
  onSignIn?: () => void;
  loading?: boolean;
  cartItemCount?: number;
  /** Cart pages put qty under each item; keep a balance-only header. */
  showApplyInputs?: boolean;
  panelId?: string;
}) {
  const view = creditApplyView({
    signedIn,
    loading,
    creditsAvailable: quote.creditsAvailable,
    creditsMax: quote.creditsMax,
    cartItemCount,
  });
  const headingId = `${panelId}-heading`;
  const inputId = `${panelId}-input`;

  return (
    <section
      id={panelId}
      className={`credit-apply credit-apply--panel${view === "ready" ? " credit-apply--ready" : ""}${view === "loading" ? " credit-apply--loading" : ""}`}
      data-testid={panelId === "gysh-pay-with-credits" ? "checkout-credit-apply" : "checkout-credit-apply-pay"}
      aria-labelledby={headingId}
    >
      <h4 id={headingId} className="credit-apply-heading">
        <Coins size={20} aria-hidden /> Pay with credits
      </h4>

      {view === "guest" ? (
        <p data-testid="checkout-credit-apply-guest">
          This is where you apply credits at checkout (1 credit = $1).
          {onSignIn ? (
            <>
              {" "}
              <button type="button" className="user-portal-inline-link" onClick={onSignIn}>
                Log in to apply credits
              </button>
            </>
          ) : (
            " Log in to apply your balance."
          )}
        </p>
      ) : null}

      {view === "loading" ? (
        <div data-testid="checkout-credit-apply-loading">
          <WaitIndicator
            message="Loading your credits…"
            size="md"
            estimateMs={CART_CREDITS_WAIT_MS}
            data-testid="checkout-credits-loading"
          />
          <button type="button" className="btn btn-primary" disabled data-testid="checkout-credits-loading-btn">
            <WaitLabel>Loading credits</WaitLabel>
          </button>
        </div>
      ) : null}

      {view === "empty-cart" ? (
        <p className="credit-apply-balance" data-testid="checkout-credit-balance">
          Your balance: <strong>{formatKidCreditBalance(quote.creditsAvailable)}</strong>
        </p>
      ) : null}

      {view === "ineligible" ? (
        <div data-testid="checkout-credit-apply-ineligible">
          <p className="credit-apply-balance" data-testid="checkout-credit-balance">
            Your balance: <strong>{formatKidCreditBalance(quote.creditsAvailable)}</strong>
          </p>
          <p className="credit-apply-hint">
            Credit packs are cash. Add a workshop or 1-on-1 to spend these credits.
          </p>
        </div>
      ) : null}

      {view === "empty-balance" ? (
        <p className="credit-apply-balance" data-testid="checkout-credit-apply-empty">
          Your balance: <strong>{formatKidCreditBalance(0)}</strong>
        </p>
      ) : null}

      {view === "ready" ? (
        <>
          <p className="credit-apply-balance" data-testid="checkout-credit-balance">
            Your balance: <strong>{formatKidCreditBalance(quote.creditsAvailable)}</strong>
            {quote.creditsApplied > 0
              ? ` · ${quote.creditsApplied} applied · ${formatKidCreditBalance(Math.max(0, quote.creditsAvailable - quote.creditsApplied))} left`
              : quote.creditsMax < quote.creditsAvailable
                ? ` · this cart can take up to ${quote.creditsMax}`
                : ""}
          </p>
          {showApplyInputs ? (
            <>
              <label className="credit-apply-label" htmlFor={inputId}>
                Credits to apply
              </label>
              <div className="credit-apply-inputs">
                <input
                  id={inputId}
                  type="range"
                  min={0}
                  max={quote.creditsMax}
                  step={1}
                  value={quote.creditsApplied}
                  aria-valuemin={0}
                  aria-valuemax={quote.creditsMax}
                  aria-valuenow={quote.creditsApplied}
                  data-testid="checkout-credits-range"
                  onChange={(e) => onCreditsChange(Number(e.target.value))}
                />
                <input
                  type="number"
                  min={0}
                  max={quote.creditsMax}
                  value={quote.creditsApplied}
                  aria-label="Credits to apply"
                  data-testid="checkout-credits-input"
                  onChange={(e) => onCreditsChange(Number(e.target.value))}
                />
              </div>
              {shouldShowApplyAllCredits(quote) ? (
                <button
                  type="button"
                  className="btn btn-outline credit-apply-all"
                  data-testid="checkout-apply-all-credits"
                  onClick={() => onCreditsChange(quote.creditsMax)}
                >
                  Use all {quote.creditsMax} credit{quote.creditsMax === 1 ? "" : "s"}
                </button>
              ) : null}
              <ul className="credit-apply-summary">
                <li>
                  <span>Subtotal</span>
                  <strong>{formatUsd(quote.subtotalUsd)}</strong>
                </li>
                <li>
                  <span>
                    Credits applied
                    {quote.creditsApplied > 0 ? ` (${quote.creditsApplied})` : ""}
                  </span>
                  <strong>−{formatUsd(quote.creditValueUsd)}</strong>
                </li>
                <li className="credit-apply-due" data-testid="checkout-cash-due">
                  <span>Due today</span>
                  <strong>{formatUsd(quote.cashDueUsd)}</strong>
                </li>
              </ul>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

/** Qty under a cart line to apply credits toward that purchase. */
export function CartLineCreditApply({
  itemId,
  itemName,
  need,
  applied,
  max,
  remainingAfter,
  lineDueUsd,
  onChange,
}: {
  itemId: string;
  itemName: string;
  need: number;
  applied: number;
  max: number;
  remainingAfter: number;
  lineDueUsd: number;
  onChange: (credits: number) => void;
}) {
  const inputId = `cart-line-credits-${itemId}`;
  return (
    <div className="cart-line-credit-apply" data-testid={`cart-line-credits-${itemId}`}>
      <label className="cart-line-credit-apply__label" htmlFor={inputId}>
        Apply credits
      </label>
      <input
        id={inputId}
        type="number"
        min={0}
        max={max}
        step={1}
        value={applied}
        aria-label={`Credits to apply toward ${itemName}`}
        data-testid={`cart-line-credits-input-${itemId}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p className="cart-line-credit-apply__meta">
        of {need} for this item · due {formatUsd(lineDueUsd)}
        {applied > 0 ? ` · ${formatKidCreditBalance(remainingAfter)} left` : ""}
      </p>
    </div>
  );
}
