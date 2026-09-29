import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { WaitLabel } from "./WaitFeedback";
import { ApiError } from "../lib/api";
import { grantInternalCredits, formatKidCreditBalance } from "../lib/member-credits";
import {
  INTERNAL_CREDITS_REASON,
  INTERNAL_CREDITS_REMOVED_REASON,
  internalCreditUserOptionLabel,
  sortUsersForInternalCreditGrant,
  type InternalCreditAction,
} from "../lib/internal-credits";
import { fetchUsers, type GyshUser } from "../lib/gysh-roles";

export function AdminInternalCreditsPanel({
  onGranted,
}: {
  onGranted?: () => void;
}) {
  const [users, setUsers] = useState<GyshUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState("100");
  const [busy, setBusy] = useState<InternalCreditAction | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const list = await fetchUsers();
      setUsers(sortUsersForInternalCreditGrant(list));
    } catch (err) {
      setUsers([]);
      setUsersError(err instanceof ApiError ? err.message : "Could not load members.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const selected = users.find((u) => u.email === email);

  const submit = async (action: InternalCreditAction) => {
    if (busy) return;
    setError("");
    setOk("");
    setBusy(action);
    try {
      const result = await grantInternalCredits({
        email,
        credits: Number(credits),
        action,
      });
      const amount =
        action === "remove"
          ? formatKidCreditBalance(result.removed)
          : formatKidCreditBalance(result.granted);
      const verb = action === "remove" ? "Removed" : "Added";
      setOk(
        `${verb} ${amount} ${action === "remove" ? "from" : "to"} ${result.email}. New balance: ${formatKidCreditBalance(result.balance)}.`,
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.email === result.email ? { ...u, creditBalance: result.balance } : u,
        ),
      );
      onGranted?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update credits.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <form
      className="user-portal-admin-credits"
      data-testid="user-portal-admin-credits"
      onSubmit={(e) => {
        e.preventDefault();
        void submit("add");
      }}
    >
      <h4>
        <Coins size={16} aria-hidden /> Add or remove member credits
      </h4>
      <p className="user-portal-credits-muted">
        Admin only. Pick any member, then add or remove credits on their membership wallet. Ledger
        lines are <strong>{INTERNAL_CREDITS_REASON}</strong> or{" "}
        <strong>{INTERNAL_CREDITS_REMOVED_REASON}</strong>.
      </p>
      <div className="user-portal-admin-credits-row">
        <label>
          Member
          <select
            className="select-input"
            required
            value={email}
            disabled={usersLoading || Boolean(usersError)}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="user-portal-admin-credits-user"
          >
            <option value="">
              {usersLoading ? "Loading members…" : "Select a member…"}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.email}>
                {internalCreditUserOptionLabel(u)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Credits
          <input
            type="number"
            required
            min={1}
            max={10000}
            step={1}
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            data-testid="user-portal-admin-credits-amount"
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={Boolean(busy) || usersLoading || !email}
          data-testid="user-portal-admin-credits-submit"
        >
          {busy === "add" ? <WaitLabel>Adding…</WaitLabel> : "Add credits"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={Boolean(busy) || usersLoading || !email}
          data-testid="user-portal-admin-credits-remove"
          onClick={() => void submit("remove")}
        >
          {busy === "remove" ? <WaitLabel>Removing…</WaitLabel> : "Remove credits"}
        </button>
      </div>
      {selected ? (
        <p className="user-portal-credits-muted" data-testid="user-portal-admin-credits-selected-balance">
          {selected.name || selected.email}:{" "}
          {formatKidCreditBalance(selected.creditBalance ?? 0)} on this membership account
        </p>
      ) : null}
      {usersError ? (
        <p className="user-portal-credits-error" role="alert">
          {usersError}{" "}
          <button type="button" className="btn btn-outline" onClick={() => void loadUsers()}>
            Retry
          </button>
        </p>
      ) : null}
      {error ? (
        <p className="user-portal-credits-error" role="alert" data-testid="user-portal-admin-credits-error">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="user-portal-admin-credits-ok" role="status" data-testid="user-portal-admin-credits-ok">
          {ok}
        </p>
      ) : null}
    </form>
  );
}
