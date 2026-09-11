import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { WaitLabel } from "./WaitFeedback";
import { ApiError } from "../lib/api";
import { grantInternalCredits, formatKidCreditBalance } from "../lib/member-credits";
import {
  INTERNAL_CREDITS_REASON,
  internalCreditUserOptionLabel,
  sortUsersForInternalCreditGrant,
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
  const [busy, setBusy] = useState(false);
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setOk("");
    setBusy(true);
    try {
      const result = await grantInternalCredits({
        email,
        credits: Number(credits),
      });
      setOk(
        `Added ${formatKidCreditBalance(result.granted)} to ${result.email}. New balance: ${formatKidCreditBalance(result.balance)}.`,
      );
      onGranted?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add credits.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="user-portal-admin-credits"
      data-testid="user-portal-admin-credits"
      onSubmit={(e) => void submit(e)}
    >
      <h4>
        <Coins size={16} aria-hidden /> Add credits to a parent account
      </h4>
      <p className="user-portal-credits-muted">
        Admin only. Pick the member, then add credits. Creates a ledger line{" "}
        <strong>{INTERNAL_CREDITS_REASON}</strong>.
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
          disabled={busy || usersLoading || !email}
          data-testid="user-portal-admin-credits-submit"
        >
          {busy ? <WaitLabel>Adding…</WaitLabel> : "Add credits"}
        </button>
      </div>
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
