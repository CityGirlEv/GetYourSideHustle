import { useState } from "react";
import { Unlock } from "lucide-react";
import { trackGyshEvent, type BlueprintAgeGroup } from "../lib/gysh-analytics";
import { grantFreeMemberSession } from "../lib/free-member-session";
import { clearPendingBlueprint, readPendingBlueprint } from "../lib/pending-blueprint";
import { registerFreeMember } from "../lib/auth";
import { claimBlueprint, saveBlueprintToAccount } from "../lib/blueprints-api";
import { BETA_NDA_VERSION, betaNdaRegisterError, betaNdaTodayDate } from "../lib/beta-tester-nda";
import type { BetaNdaReceipt } from "../lib/beta-tester-dashboard";
import { BetaNdaAcceptancePanel, type BetaNdaAcceptanceValue } from "./BetaNdaAcceptancePanel";
import { PasswordField } from "./PasswordField";

type BlueprintUnlockPanelProps = {
  onUnlocked: (ageGroup: BlueprintAgeGroup) => void;
  onSignIn: () => void;
  onOpenBetaNda?: () => void;
  onBetaTestingUnlocked?: (receipt: BetaNdaReceipt) => void;
};

export function BlueprintUnlockPanel({
  onUnlocked,
  onSignIn,
  onOpenBetaNda,
  onBetaTestingUnlocked,
}: BlueprintUnlockPanelProps) {
  const pending = readPendingBlueprint();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [childDisplayName, setChildDisplayName] = useState("");
  const [error, setError] = useState("");
  const [applyBetaTester, setApplyBetaTester] = useState(false);
  const [betaNda, setBetaNda] = useState<BetaNdaAcceptanceValue>({
    legalName: "",
    email: "",
    signature: "",
    agreed: false,
  });
  const [busy, setBusy] = useState(false);

  if (!pending) return null;

  const ageGroup = pending.ageGroup;
  const isKids = ageGroup === "kids";
  const title =
    ageGroup === "junior"
      ? "Unlock your Teens Side Hustle Blueprint"
      : ageGroup === "senior"
        ? "Unlock your Senior Side Hustle Blueprint"
        : ageGroup === "kids"
          ? "Parent unlock — Kids Side Hustle Blueprint"
          : "Unlock your Adult Side Hustle Blueprint";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError(isKids ? "Enter a parent or guardian email." : "Enter a valid email address.");
      return;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters.");
      return;
    }
    if (isKids && !childDisplayName.trim()) {
      setError("Enter a first name or nickname for the child (we do not collect a child email).");
      return;
    }
    const ndaPayload = {
      agreed: betaNda.agreed,
      legalName: betaNda.legalName.trim() || name.trim(),
      email: betaNda.email.trim() || trimmed,
      signature: betaNda.signature,
      ndaVersion: BETA_NDA_VERSION,
    };
    if (applyBetaTester) {
      const ndaErr = betaNdaRegisterError(true, ndaPayload, trimmed);
      if (ndaErr) {
        setError(ndaErr);
        return;
      }
    }

    setBusy(true);
    try {
      const result = await registerFreeMember({
        email: trimmed,
        password,
        name: name.trim() || undefined,
        ageGroup,
        childDisplayName: isKids ? childDisplayName.trim() : undefined,
        claimToken: pending.claimToken,
        applyBetaTester,
        betaNda: applyBetaTester ? ndaPayload : undefined,
      });

      if (!result.ok) {
        setError(result.error || "Could not create account.");
        setBusy(false);
        return;
      }

      // Local unlock marker for offline-tolerant UI + wizard restore
      grantFreeMemberSession({
        email: trimmed,
        ageGroup,
        isParentAccount: isKids || undefined,
      });

      if (pending.claimToken && !result.claimedBlueprintId) {
        try {
          await claimBlueprint(pending.claimToken, result.childProfileId);
        } catch {
          /* register may have already claimed */
        }
      }

      if (!result.claimedBlueprintId) {
        try {
          await saveBlueprintToAccount({
            ageGroup,
            answers: pending.answers,
            resultIds: pending.resultIds,
            resultPcts: pending.resultPcts,
            childProfileId: result.childProfileId,
            claimToken: pending.claimToken,
          });
        } catch {
          /* local restore still works */
        }
      }

      clearPendingBlueprint();
      trackGyshEvent("blueprint_unlocked", { age_group: ageGroup, source: "free_signup" });
      trackGyshEvent("blueprint_saved", { age_group: ageGroup, source: "free_signup" });
      if (applyBetaTester && result.testingUnlocked && result.betaNda && onBetaTestingUnlocked) {
        onBetaTestingUnlocked(result.betaNda);
      }
      onUnlocked(ageGroup);
    } catch {
      setError("Registration unavailable. Check that the database migration has been applied.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="blueprint-unlock-panel glass" data-testid="blueprint-unlock-panel">
      <h2>
        <Unlock size={20} aria-hidden /> {title}
      </h2>
      <p>
        {isKids
          ? "A parent or guardian must create the free family account to save and unlock this child’s complete Side Hustle Blueprint. We do not collect the child’s email."
          : "Create your free GYSH account to unlock your complete Side Hustle Blueprint and save your progress. No credit card required."}
      </p>
      <form onSubmit={handleSubmit} className="blueprint-unlock-form">
        {!isKids && (
          <>
            <label htmlFor="blueprint-unlock-name">Name (optional)</label>
            <input
              id="blueprint-unlock-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </>
        )}
        {isKids && (
          <>
            <label htmlFor="blueprint-unlock-parent-name">Parent / guardian name (optional)</label>
            <input
              id="blueprint-unlock-parent-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Parent name"
            />
            <label htmlFor="blueprint-unlock-child-name">Child first name or nickname</label>
            <input
              id="blueprint-unlock-child-name"
              type="text"
              value={childDisplayName}
              onChange={(e) => setChildDisplayName(e.target.value)}
              placeholder="e.g. Jordan"
              required
              data-testid="blueprint-unlock-child-name"
            />
          </>
        )}
        <label htmlFor="blueprint-unlock-email">
          {isKids ? "Parent / guardian email" : "Email"}
        </label>
        <input
          id="blueprint-unlock-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isKids ? "parent@email.com" : "you@email.com"}
          required
          data-testid="blueprint-unlock-email"
        />
        <PasswordField
          id="blueprint-unlock-password"
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          placeholder="At least 5 characters"
          required
          minLength={5}
          showStrength
          data-testid="blueprint-unlock-password"
        />
        <label className="membership-signup-role-opt" htmlFor="blueprint-unlock-beta">
          <input
            id="blueprint-unlock-beta"
            type="checkbox"
            checked={applyBetaTester}
            onChange={(e) => setApplyBetaTester(e.target.checked)}
            data-testid="blueprint-unlock-beta-role"
          />
          <span>
            <strong>Apply as a Beta Tester</strong>
            <span className="membership-signup-role-opt__hint">
              Select this role if you want to try GYSH before launch. You must read and
              accept {BETA_NDA_VERSION} — this does not grant QA or Admin access.
            </span>
          </span>
        </label>
        {applyBetaTester ? (
          <BetaNdaAcceptancePanel
            idPrefix="blueprint-unlock-nda"
            value={{
              legalName: betaNda.legalName || name,
              email: betaNda.email || email,
              signature: betaNda.signature,
              agreed: betaNda.agreed,
            }}
            acceptedAt={betaNdaTodayDate()}
            onChange={setBetaNda}
            onOpenFullNda={onOpenBetaNda}
          />
        ) : null}
        {error && (
          <p className="blueprint-unlock-error" role="alert">
            {error}
          </p>
        )}
        <div className="blueprint-unlock-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy}
            data-testid="blueprint-unlock-submit"
          >
            {busy
              ? "Creating account…"
              : isKids
                ? "Create family account & unlock"
                : "Create free account & unlock"}
          </button>
          <button type="button" className="btn btn-outline" onClick={onSignIn} disabled={busy}>
            Already have an account? Sign in
          </button>
        </div>
      </form>
      <p className="blueprint-unlock-reassure">Free account. No credit card required.</p>
    </section>
  );
}
