import { useState } from "react";
import { Coins } from "lucide-react";
import { WaitLabel } from "../WaitFeedback";
import { ApiError } from "../../lib/api";
import { formatKidCreditBalance, grantInternalCredits } from "../../lib/member-credits";
import type { InternalCreditAction } from "../../lib/internal-credits";
import type { GyshUser } from "../../lib/gysh-roles";

export function UsersCreditAdjust({
  user,
  onBalanceChanged,
}: {
  user: GyshUser;
  onBalanceChanged?: (email: string, balance: number) => void;
}) {
  const [amount, setAmount] = useState("10");
  const [busy, setBusy] = useState<InternalCreditAction | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const balance = Math.max(0, Number(user.creditBalance) || 0);

  const submit = async (action: InternalCreditAction) => {
    if (busy) return;
    setError("");
    setOk("");
    setBusy(action);
    try {
      const result = await grantInternalCredits({
        email: user.email,
        credits: Number(amount),
        action,
      });
      onBalanceChanged?.(result.email, result.balance);
      const n = action === "remove" ? result.removed : result.granted;
      const verb = action === "remove" ? "Removed" : "Added";
      setOk(
        `${verb} ${formatKidCreditBalance(n)}. New balance: ${formatKidCreditBalance(result.balance)}.`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update credits.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <form
      className="users-credit-adjust"
      data-testid={`users-credits-${user.id}`}
      onSubmit={(e) => {
        e.preventDefault();
        void submit("add");
      }}
    >
      <div className="users-credit-adjust-label">
        <Coins size={14} aria-hidden /> Credits
        <strong data-testid={`users-credits-balance-${user.id}`}>
          {formatKidCreditBalance(balance)}
        </strong>
      </div>
      <div className="users-credit-adjust-row">
        <label>
          <span className="sr-only">Credit amount for {user.name}</span>
          <input
            type="number"
            min={1}
            max={10000}
            step={1}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-testid={`users-credits-amount-${user.id}`}
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={Boolean(busy)}
          data-testid={`users-credits-add-${user.id}`}
        >
          {busy === "add" ? <WaitLabel>Adding…</WaitLabel> : "Add credits"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={Boolean(busy)}
          data-testid={`users-credits-remove-${user.id}`}
          onClick={() => void submit("remove")}
        >
          {busy === "remove" ? <WaitLabel>Removing…</WaitLabel> : "Remove"}
        </button>
      </div>
      {error ? (
        <p className="users-credit-adjust-error" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="users-credit-adjust-ok" role="status">
          {ok}
        </p>
      ) : null}
    </form>
  );
}
