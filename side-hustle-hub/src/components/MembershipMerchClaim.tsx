import { useState, type FormEvent } from "react";
import { Shirt } from "lucide-react";
import { saveMemberMerch, type AuthUser } from "../lib/auth";
import {
  isMembershipSubscriber,
  merchChoiceSummaryFromNotes,
  merchChoicesError,
  merchItemCount,
  parseMerchChoices,
  type MerchItemId,
  type MerchTshirtSize,
  type TierId,
} from "../lib/membership";
import {
  GYSH_GEAR_COLLECTION_URL,
} from "../lib/gysh-gear-store";
import { merchEmailVars } from "../lib/membership-email-copy";
import { MembershipMerchChoice, type MerchChoiceSlot } from "./MembershipMerchChoice";

export function MembershipMerchClaim({
  membershipTier,
  notes,
  onSaved,
}: {
  membershipTier: string | null | undefined;
  notes: string | null | undefined;
  onSaved?: (user: AuthUser) => void;
}) {
  const tier = (["starter", "pro", "elite"].includes(String(membershipTier || "").toLowerCase())
    ? String(membershipTier).toLowerCase()
    : "free") as TierId;
  const count = merchItemCount(tier);
  const current = merchChoiceSummaryFromNotes(notes);
  const [choices, setChoices] = useState<MerchChoiceSlot[]>(() =>
    Array.from({ length: count }, () => ""),
  );
  const [sizes, setSizes] = useState<(MerchTshirtSize | "")[]>(() =>
    Array.from({ length: count }, () => ""),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  if (!isMembershipSubscriber(tier)) return null;
  const merchCopy = merchEmailVars(tier);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    const merchErr = merchChoicesError(tier, choices, sizes);
    if (merchErr) {
      setError(merchErr);
      return;
    }
    const resolved = parseMerchChoices(choices, count);
    if (!resolved) {
      setError(merchErr || "Choose your complimentary GYSH merch.");
      return;
    }
    setBusy(true);
    try {
      const result = await saveMemberMerch({
        merchChoices: resolved as MerchItemId[],
        merchTshirtSizes: sizes,
      });
      if (!result.ok) {
        setError(result.error || "Could not save merch choice.");
        return;
      }
      setOk(result.message || "Saved your complimentary GYSH gear choice.");
      if (result.user) onSaved?.(result.user);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="user-portal-merch-claim"
      data-testid="user-portal-merch-claim"
      id="user-portal-merch-claim"
      onSubmit={(e) => void submit(e)}
    >
      <h4>
        <Shirt size={18} aria-hidden /> Complimentary GYSH gear
      </h4>
      <p>
        Your <strong>{merchCopy.tier}</strong> plan includes <strong>{merchCopy.merchPerkTitle}</strong>{" "}
        ({merchCopy.merchCell} on the membership page) — {merchCopy.merchItemPhrase}.{" "}
        {merchCopy.merchPerkDetail}
      </p>
      <p>
        <a
          href={GYSH_GEAR_COLLECTION_URL}
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="user-portal-merch-store-link"
        >
          Shop GYSH Gear
        </a>
      </p>
      {current ? (
        <p className="user-portal-merch-claim__saved" data-testid="user-portal-merch-saved">
          On file: <strong>{current.replace(/^Merch:\s*/i, "")}</strong>
        </p>
      ) : (
        <p className="user-portal-merch-claim__needed" data-testid="user-portal-merch-needed">
          We don’t have a T-shirt/hat choice (or T-shirt size) on your account yet.
        </p>
      )}
      <MembershipMerchChoice
        tierId={tier}
        choices={choices}
        tshirtSizes={sizes}
        onChange={setChoices}
        onTshirtSizesChange={setSizes}
        idPrefix="dashboard-merch"
      />
      {error ? (
        <p className="user-portal-merch-claim__error" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="user-portal-merch-claim__ok" role="status">
          {ok}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={busy} data-testid="user-portal-merch-save">
        {busy ? "Saving…" : current ? "Update merch choice" : "Save merch choice"}
      </button>
    </form>
  );
}
