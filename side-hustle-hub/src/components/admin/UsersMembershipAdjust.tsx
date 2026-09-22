import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BadgeCheck, Mail } from "lucide-react";
import { WaitLabel } from "../WaitFeedback";
import { ApiError } from "../../lib/api";
import {
  adminMembershipFormIsDirty,
  adminMembershipTierLabel,
  FOUNDING_STARTER_LIMIT,
  hasFoundingStarterGrant,
} from "../../lib/admin-membership";
import { TIER_LADDER, isMembershipSubscriber, memberNeedsMerchChoice, type TierId } from "../../lib/membership";
import { sendMerchClaimEmail, updateUserMembership, type GyshUser } from "../../lib/gysh-roles";

function asTier(raw: string | undefined | null): TierId {
  const t = String(raw || "free").toLowerCase();
  if (t === "starter" || t === "pro" || t === "elite") return t;
  return "free";
}

export type MembershipAdjustResult =
  | { ok: true; skipped?: boolean; user?: GyshUser; message?: string }
  | { ok: false; error: string };

export type UsersMembershipAdjustHandle = {
  submit: (opts?: { force?: boolean }) => Promise<MembershipAdjustResult>;
  isDirty: () => boolean;
  isBusy: () => boolean;
};

export const UsersMembershipAdjust = forwardRef<
  UsersMembershipAdjustHandle,
  {
    user: GyshUser;
    foundingSlotsRemaining: number;
    onUpdated?: (next: GyshUser, message: string) => void;
  }
>(function UsersMembershipAdjust({ user, foundingSlotsRemaining, onUpdated }, ref) {
  const currentTier = asTier(user.membershipTier);
  const alreadyFounding = hasFoundingStarterGrant(user.notes);
  const [tier, setTier] = useState<TierId>(currentTier);
  const [notify, setNotify] = useState(currentTier === "free");
  const [complimentary, setComplimentary] = useState(
    currentTier === "free" && foundingSlotsRemaining > 0 && !alreadyFounding,
  );
  const [busy, setBusy] = useState(false);
  const [merchBusy, setMerchBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setTier(asTier(user.membershipTier));
    setNotify(asTier(user.membershipTier) === "free");
    setComplimentary(
      asTier(user.membershipTier) === "free" &&
        foundingSlotsRemaining > 0 &&
        !hasFoundingStarterGrant(user.notes),
    );
    setError("");
    setOk("");
    // Preserve an in-progress first-5 checkbox when other cards refresh slot counts.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching members
  }, [user.id]);

  const canCountFounding = tier === "starter" && (alreadyFounding || foundingSlotsRemaining > 0);
  const dirty = adminMembershipFormIsDirty({
    selectedTier: tier,
    savedTier: currentTier,
    complimentary,
    alreadyFounding,
  });

  const submit = async (opts?: { force?: boolean }): Promise<MembershipAdjustResult> => {
    if (busy) return { ok: false, error: "Saving…" };
    const grantFounding = complimentary && tier === "starter" && !alreadyFounding;
    const needsWrite = Boolean(opts?.force) || dirty || (notify && tier !== "free");
    if (!needsWrite) {
      return { ok: true, skipped: true, message: "No membership changes to save." };
    }
    setError("");
    setOk("");
    setBusy(true);
    try {
      const result = await updateUserMembership(user.id, {
        membershipTier: tier,
        notify,
        complimentaryFoundingStarter: grantFounding,
      });
      const plan = adminMembershipTierLabel(result.user.membershipTier);
      const parts = [`${user.name} is now on ${plan}.`];
      if (result.foundingSlot) {
        parts.push(`First-5 complimentary slot ${result.foundingSlot}/${FOUNDING_STARTER_LIMIT}.`);
      }
      parts.push(
        result.emailSent
          ? "Upgrade email sent."
          : notify && tier !== "free"
            ? "Email was not sent."
            : "No email sent.",
      );
      const message = parts.join(" ");
      setOk(message);
      onUpdated?.(result.user, message);
      return { ok: true, user: result.user, message };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not update membership.";
      setError(message);
      return { ok: false, error: message };
    } finally {
      setBusy(false);
    }
  };

  const submitRef = useRef(submit);
  submitRef.current = submit;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useImperativeHandle(ref, () => ({
    submit: (opts) => submitRef.current(opts),
    isDirty: () => dirtyRef.current,
    isBusy: () => busyRef.current,
  }));

  const needsMerch = memberNeedsMerchChoice(currentTier, user.notes);
  const sendMerch = async () => {
    if (merchBusy || !isMembershipSubscriber(currentTier)) return;
    setError("");
    setOk("");
    setMerchBusy(true);
    try {
      const result = await sendMerchClaimEmail(user.id);
      setOk(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send merch email.");
    } finally {
      setMerchBusy(false);
    }
  };

  return (
    <form
      className="users-credit-adjust users-membership-adjust"
      data-testid={`users-membership-${user.id}`}
      onSubmit={(e) => {
        e.preventDefault();
        void submit({ force: true });
      }}
    >
      <div className="users-credit-adjust-label">
        <BadgeCheck size={14} aria-hidden /> Membership
        <strong data-testid={`users-membership-current-${user.id}`}>
          {adminMembershipTierLabel(currentTier)}
        </strong>
        {alreadyFounding ? (
          <span className="users-membership-founding-pill">First 5 complimentary</span>
        ) : null}
      </div>
      <div className="users-credit-adjust-row">
        <label>
          <span className="sr-only">Membership level for {user.name}</span>
          <select
            className="select-input"
            value={tier}
            onChange={(e) => {
              const next = asTier(e.target.value);
              setTier(next);
              if (next === "starter" && foundingSlotsRemaining > 0 && !alreadyFounding) {
                setComplimentary(true);
                setNotify(true);
              }
              if (next === "free") setNotify(false);
            }}
            data-testid={`users-membership-tier-${user.id}`}
          >
            {TIER_LADDER.map((id) => (
              <option key={id} value={id}>
                {adminMembershipTierLabel(id)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={busy || (!dirty && !notify)}
          data-testid={`users-membership-save-${user.id}`}
        >
          {busy ? <WaitLabel>Saving…</WaitLabel> : "Save membership"}
        </button>
      </div>
      <label className="users-membership-check">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          data-testid={`users-membership-notify-${user.id}`}
        />
        Notify member by email
      </label>
      {canCountFounding ? (
        <label className="users-membership-check">
          <input
            type="checkbox"
            checked={alreadyFounding || complimentary}
            disabled={alreadyFounding || foundingSlotsRemaining <= 0}
            onChange={(e) => setComplimentary(e.target.checked)}
            data-testid={`users-membership-founding-${user.id}`}
          />
          {alreadyFounding
            ? `Counted in first ${FOUNDING_STARTER_LIMIT} complimentary Starter`
            : `Count toward first ${FOUNDING_STARTER_LIMIT} complimentary Starter (${foundingSlotsRemaining} left)`}
        </label>
      ) : null}
      {isMembershipSubscriber(currentTier) ? (
        <button
          type="button"
          className="btn btn-outline"
          disabled={merchBusy}
          data-testid={`users-membership-merch-email-${user.id}`}
          onClick={() => void sendMerch()}
        >
          <Mail size={14} aria-hidden />{" "}
          {merchBusy
            ? "Sending…"
            : needsMerch
              ? "Email GYSH Gear shop link"
              : "Re-send GYSH Gear email"}
        </button>
      ) : null}
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
});
