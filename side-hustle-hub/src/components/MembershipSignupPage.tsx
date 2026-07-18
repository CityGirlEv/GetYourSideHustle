import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, UserPlus } from "lucide-react";
import { PasswordField } from "./PasswordField";
import { registerFreeMember } from "../lib/auth";
import { passwordPolicyError } from "../lib/password-policy";
import { grantFreeMemberSession } from "../lib/free-member-session";
import {
  AUDIENCE_LABELS,
  MEMBERSHIP_TIERS,
  formatUsd,
  tierPriceMonthlyUsd,
  type AudienceGroup,
  type TierId,
} from "../lib/membership";
import { saveJoinAudience } from "../lib/join-audience";

type SignupStep = "register" | "checkout" | "done";

type MembershipSignupPageProps = {
  initialAudience?: AudienceGroup | null;
  initialTier?: TierId | null;
  onBackToPlans: () => void;
  onGoToLogin: () => void;
  onOpenFreeGuides?: () => void;
};

const AUDIENCE_OPTIONS: AudienceGroup[] = ["kids", "junior", "adult", "senior"];

export function MembershipSignupPage({
  initialAudience = "adult",
  initialTier = "free",
  onBackToPlans,
  onGoToLogin,
  onOpenFreeGuides,
}: MembershipSignupPageProps) {
  const [step, setStep] = useState<SignupStep>("register");
  const [audience, setAudience] = useState<AudienceGroup>(initialAudience ?? "adult");
  const [tierId, setTierId] = useState<TierId>(initialTier ?? "free");
  const [name, setName] = useState("");
  const [childDisplayName, setChildDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [fakePaid, setFakePaid] = useState(false);

  const tier = useMemo(
    () => MEMBERSHIP_TIERS.find((t) => t.id === tierId) ?? MEMBERSHIP_TIERS[0],
    [tierId],
  );
  const isKids = audience === "kids";
  const usesCredits = audience === "kids" || audience === "junior";
  const monthly = tierPriceMonthlyUsd(tier, audience);
  const isPaid = tier.id !== "free";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setError(isKids ? "Enter a parent or guardian email." : "Enter a valid email address.");
      return;
    }
    const pwErr = passwordPolicyError(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (isKids && !childDisplayName.trim()) {
      setError("Enter a first name or nickname for the child.");
      return;
    }

    setBusy(true);
    try {
      const result = await registerFreeMember({
        email: trimmed,
        password,
        name: name.trim() || undefined,
        ageGroup: audience,
        childDisplayName: isKids ? childDisplayName.trim() : undefined,
        membershipTier: tier.id,
      });
      if (!result.ok) {
        setError(result.error || "Could not create account.");
        setBusy(false);
        return;
      }

      grantFreeMemberSession({
        email: trimmed,
        ageGroup: audience,
        isParentAccount: isKids || undefined,
      });
      saveJoinAudience(audience);

      if (isPaid) {
        setStep("checkout");
      } else {
        setStep("done");
      }
    } catch {
      setError("Registration unavailable. Try again later.");
    } finally {
      setBusy(false);
    }
  };

  const handleFakeCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!cardName.trim()) {
      setError("Enter the name on the card.");
      return;
    }
    const digits = cardNumber.replace(/\s+/g, "");
    if (digits.length < 13) {
      setError("Enter a card number (demo — any 13+ digits work).");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      setError("Enter expiry as MM/YY.");
      return;
    }
    if (!/^\d{3,4}$/.test(cardCvc.trim())) {
      setError("Enter a 3–4 digit CVC.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setFakePaid(true);
      setBusy(false);
      setStep("done");
    }, 700);
  };

  return (
    <div className="membership-signup-page" data-testid="membership-signup-page">
      <button type="button" className="btn btn-outline membership-signup-back" onClick={onBackToPlans}>
        <ArrowLeft size={16} aria-hidden /> Back to membership plans
      </button>

      <section className="glass membership-signup-card" aria-labelledby="membership-signup-heading">
        <header className="membership-signup-header">
          <span className="glow-badge free">
            <UserPlus size={13} aria-hidden /> Membership sign-up
          </span>
          <h2 id="membership-signup-heading">
            {step === "checkout"
              ? "Demo checkout"
              : step === "done"
                ? "You're almost in"
                : "Create your GYSH account"}
          </h2>
          <p>
            {step === "register" &&
              "Enter your details to join. Free plans need no payment; paid plans use a demo checkout until real billing is live."}
            {step === "checkout" &&
              "Payment is simulated for now — no real charge. Complete the fake checkout to finish your paid plan request."}
            {step === "done" &&
              (fakePaid
                ? "Account created and demo payment recorded. An admin still activates logins; you'll get email when you're ready."
                : "Account created on the Free plan and awaiting admin activation. Check your email for confirmation.")}
          </p>
        </header>

        {step === "register" && (
          <form className="membership-signup-form" onSubmit={handleRegister} noValidate>
            <div className="membership-signup-summary">
              <label htmlFor="membership-signup-audience">Audience</label>
              <select
                id="membership-signup-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as AudienceGroup)}
              >
                {AUDIENCE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {AUDIENCE_LABELS[a]}
                  </option>
                ))}
              </select>

              <label htmlFor="membership-signup-tier">Plan</label>
              <select
                id="membership-signup-tier"
                value={tierId}
                onChange={(e) => setTierId(e.target.value as TierId)}
                data-testid="membership-signup-tier"
              >
                {MEMBERSHIP_TIERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.id === "free"
                      ? " — Free"
                      : usesCredits && t.creditsPerMonth
                        ? ` — ${t.creditsPerMonth} credits / mo`
                        : ` — ${formatUsd(tierPriceMonthlyUsd(t, audience))} / mo`}
                  </option>
                ))}
              </select>
              <p className="membership-signup-plan-note">
                Selected: <strong>{tier.name}</strong> · {AUDIENCE_LABELS[audience]}
                {isPaid
                  ? usesCredits && tier.creditsPerMonth
                    ? ` · ${tier.creditsPerMonth} credits / mo`
                    : ` · ${formatUsd(monthly)} / mo`
                  : " · no payment required"}
              </p>
            </div>

            {isKids ? (
              <>
                <label htmlFor="membership-signup-parent-name">Parent / guardian name</label>
                <input
                  id="membership-signup-parent-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Parent name"
                />
                <label htmlFor="membership-signup-child-name">Child first name or nickname</label>
                <input
                  id="membership-signup-child-name"
                  type="text"
                  value={childDisplayName}
                  onChange={(e) => setChildDisplayName(e.target.value)}
                  placeholder="e.g. Jordan"
                  required
                  data-testid="membership-signup-child-name"
                />
              </>
            ) : (
              <>
                <label htmlFor="membership-signup-name">Full name</label>
                <input
                  id="membership-signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  data-testid="membership-signup-name"
                />
              </>
            )}

            <label htmlFor="membership-signup-email">
              {isKids ? "Parent / guardian email" : "Email"}
            </label>
            <input
              id="membership-signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isKids ? "parent@email.com" : "you@email.com"}
              required
              data-testid="membership-signup-email"
            />

            <PasswordField
              id="membership-signup-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              showStrength
              required
              data-testid="membership-signup-password"
            />
            <PasswordField
              id="membership-signup-password-confirm"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
              data-testid="membership-signup-password-confirm"
            />

            {error && (
              <p className="membership-signup-error" role="alert">
                {error}
              </p>
            )}

            <div className="membership-signup-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy}
                data-testid="membership-signup-submit"
              >
                <UserPlus size={16} aria-hidden />
                {busy
                  ? "Creating account…"
                  : isPaid
                    ? "Continue to checkout"
                    : "Create free account"}
              </button>
              <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                Already a member? Sign in
              </button>
            </div>
          </form>
        )}

        {step === "checkout" && (
          <form className="membership-signup-form membership-fake-checkout" onSubmit={handleFakeCheckout}>
            <div className="membership-fake-checkout-banner" role="status">
              <CreditCard size={18} aria-hidden />
              <span>
                Demo checkout only — <strong>no real payment</strong> is processed. Use any test card
                details.
              </span>
            </div>
            <p className="membership-signup-plan-note">
              Charging (simulated): <strong>{tier.name}</strong> · {AUDIENCE_LABELS[audience]} ·{" "}
              {usesCredits && tier.creditsPerMonth
                ? `${tier.creditsPerMonth} credits / mo`
                : `${formatUsd(monthly)} / mo`}
            </p>

            <label htmlFor="fake-card-name">Name on card</label>
            <input
              id="fake-card-name"
              type="text"
              autoComplete="cc-name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="As shown on card"
              required
            />

            <label htmlFor="fake-card-number">Card number</label>
            <input
              id="fake-card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              required
              data-testid="membership-fake-card-number"
            />

            <div className="membership-fake-checkout-row">
              <div>
                <label htmlFor="fake-card-expiry">Expiry (MM/YY)</label>
                <input
                  id="fake-card-expiry"
                  type="text"
                  autoComplete="cc-exp"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="12/28"
                  required
                />
              </div>
              <div>
                <label htmlFor="fake-card-cvc">CVC</label>
                <input
                  id="fake-card-cvc"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="membership-signup-error" role="alert">
                {error}
              </p>
            )}

            <div className="membership-signup-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy}
                data-testid="membership-fake-pay"
              >
                <CreditCard size={16} aria-hidden />
                {busy ? "Processing…" : `Pay ${formatUsd(monthly)} (demo)`}
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="membership-signup-done" data-testid="membership-signup-done">
            <CheckCircle2 size={36} aria-hidden />
            <h3>{fakePaid ? "Demo payment complete" : "Free account created"}</h3>
            <p>
              {fakePaid
                ? `Your ${tier.name} plan request is saved with a simulated checkout. Real Stripe checkout will replace this step later.`
                : "You can browse free guides while you wait for activation."}
            </p>
            <div className="membership-signup-actions">
              {onOpenFreeGuides && (
                <button type="button" className="btn btn-primary" onClick={onOpenFreeGuides}>
                  Browse free guides
                </button>
              )}
              <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                Go to Sign in
              </button>
              <button type="button" className="btn btn-outline" onClick={onBackToPlans}>
                Back to plans
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
