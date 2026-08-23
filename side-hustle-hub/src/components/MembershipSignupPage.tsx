import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, UserPlus } from "lucide-react";
import { BusyOverlay, WaitLabel } from "./WaitFeedback";
import { PasswordField } from "./PasswordField";
import { registerFreeMember, updateMembershipPlan, fetchMe, type AuthUser } from "../lib/auth";
import { passwordPolicyError } from "../lib/password-policy";
import { grantFreeMemberSession } from "../lib/free-member-session";
import {
  AUDIENCE_LABELS,
  MEMBERSHIP_TIERS,
  formatUsd,
  isMembershipSubscriber,
  tierPriceMonthlyUsd,
  tierPriceYearlyUsd,
  yearlySavingsUsd,
  type AudienceGroup,
  type TierId,
} from "../lib/membership";
import { saveJoinAudience } from "../lib/join-audience";
import {
  confirmStripeCheckout,
  startMembershipCheckout,
  supportsMembershipStripeCheckout,
} from "../lib/stripe-checkout";
import { clearAlaCarteCart } from "../lib/alacarte-cart";
import type { MembershipBillingInterval } from "../lib/stripe-catalog";
import { ApiError } from "../lib/api";
import {
  pendingShouldResumeCheckout,
  savePendingMembershipCheckout,
} from "../lib/pending-membership-checkout";
import {
  browseGuidesButtonLabel,
  membershipSignupSubmitLabel,
  membershipUpgradeActionBubbles,
} from "../lib/membership-signup-labels";

export { membershipSignupSubmitLabel, membershipPlanChooseLabel } from "../lib/membership-signup-labels";

type SignupStep = "register" | "profile" | "checkout" | "done" | "kids_consent_sent";

type MembershipSignupPageProps = {
  initialAudience?: AudienceGroup | null;
  initialTier?: TierId | null;
  /** After Sign in from this flow — open Stripe checkout (skip register). */
  resumeCheckout?: boolean;
  /** Prefill email when resuming as a logged-in member. */
  loggedInEmail?: string | null;
  /** True when the visitor already has a session. */
  isLoggedIn?: boolean;
  /** Current plan on the logged-in profile (for upgrade copy). */
  currentTier?: TierId | null;
  /** Refresh app auth state after profile plan update. */
  onProfileUpdated?: (user: AuthUser) => void;
  onBackToPlans: () => void;
  onGoToLogin: () => void;
  onOpenFreeGuides?: () => void;
};

const AUDIENCE_OPTIONS: AudienceGroup[] = ["kids", "junior", "adult", "senior"];

function readCheckoutQuery(): { status: "success" | "canceled" | null; sessionId: string | null } {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("checkout");
    const sessionId = params.get("session_id");
    if (raw === "success") return { status: "success", sessionId };
    if (raw === "canceled") return { status: "canceled", sessionId: null };
  } catch {
    /* ignore */
  }
  return { status: null, sessionId: null };
}

function clearCheckoutQuery(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("checkout") && !url.searchParams.has("session_id")) return;
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore */
  }
}

export function MembershipSignupPage({
  initialAudience = "adult",
  initialTier = "free",
  resumeCheckout = false,
  loggedInEmail = null,
  isLoggedIn = false,
  currentTier = null,
  onProfileUpdated,
  onBackToPlans,
  onGoToLogin,
  onOpenFreeGuides,
}: MembershipSignupPageProps) {
  const startingAudience = initialAudience ?? "adult";
  const startingTier = initialTier ?? "free";
  const stripeReadyStart = supportsMembershipStripeCheckout(startingTier, startingAudience);
  const startOnCheckout = Boolean(isLoggedIn && resumeCheckout && stripeReadyStart);
  const startOnProfile = Boolean(isLoggedIn && !startOnCheckout);

  const [step, setStep] = useState<SignupStep>(
    startOnCheckout ? "checkout" : startOnProfile ? "profile" : "register",
  );
  const [audience, setAudience] = useState<AudienceGroup>(startingAudience);
  const [tierId, setTierId] = useState<TierId>(startingTier);
  const [billingInterval, setBillingInterval] = useState<MembershipBillingInterval>("month");
  const [name, setName] = useState("");
  const [childDisplayName, setChildDisplayName] = useState("");
  const [email, setEmail] = useState(() => String(loggedInEmail || "").trim());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stripePaid, setStripePaid] = useState(false);
  const [profileApplied, setProfileApplied] = useState(false);

  // Keep Plan / Audience in sync when opened from a membership bubble (Choose Starter, etc.).
  useEffect(() => {
    setTierId(startingTier);
  }, [startingTier]);
  useEffect(() => {
    setAudience(startingAudience);
  }, [startingAudience]);

  const tier = useMemo(
    () => MEMBERSHIP_TIERS.find((t) => t.id === tierId) ?? MEMBERSHIP_TIERS[0]!,
    [tierId],
  );
  const isKids = audience === "kids";
  const usesCredits = audience === "kids" || audience === "junior";
  const monthly = tierPriceMonthlyUsd(tier, audience);
  const yearly = tierPriceYearlyUsd(tier, audience);
  const yearlySave = yearly != null ? yearlySavingsUsd(monthly, yearly) : 0;
  const isPaid = tier.id !== "free";
  const stripeReady = supportsMembershipStripeCheckout(tier.id, audience);

  useEffect(() => {
    const { status, sessionId } = readCheckoutQuery();
    if (!status) return;
    clearCheckoutQuery();
    if (status === "canceled") {
      setStep("checkout");
      setError("Checkout was canceled. You can try again when you're ready.");
      return;
    }
    if (status === "success" && sessionId) {
      setBusy(true);
      void confirmStripeCheckout(sessionId)
        .then(async (result) => {
          setStripePaid(Boolean(result.paid));
          if (result.tier === "starter" || result.tier === "pro" || result.tier === "elite") {
            setTierId(result.tier);
          }
          if (result.audience === "adult" || result.audience === "senior") {
            setAudience(result.audience);
          }
          if (result.email) setEmail(result.email);

          // Refresh the logged-in profile so Join shows Current plan · Starter (etc.).
          if (result.user) {
            setProfileApplied(true);
            onProfileUpdated?.(result.user);
          } else if (isLoggedIn) {
            const me = await fetchMe();
            if (me) {
              setProfileApplied(true);
              onProfileUpdated?.(me);
            } else if (result.paid) {
              const paidTier =
                result.tier === "starter" || result.tier === "pro" || result.tier === "elite"
                  ? result.tier
                  : null;
              if (paidTier) {
                const applied = await updateMembershipPlan({
                  membershipTier: paidTier,
                  audience:
                    result.audience === "senior" ||
                    result.audience === "kids" ||
                    result.audience === "junior"
                      ? result.audience
                      : "adult",
                });
                if (applied.ok && applied.user) {
                  setProfileApplied(true);
                  onProfileUpdated?.(applied.user);
                }
              }
            }
          }
          setStep("done");
        })
        .catch(() => {
          setStripePaid(true);
          setStep("done");
        })
        .finally(() => {
          clearAlaCarteCart();
          setBusy(false);
        });
    }
  }, []);

  const usdPriceLabel = (t: (typeof MEMBERSHIP_TIERS)[number]) => {
    const mo = tierPriceMonthlyUsd(t, audience);
    const yr = tierPriceYearlyUsd(t, audience);
    if (yr == null) return `${formatUsd(mo)} / mo`;
    const save = yearlySavingsUsd(mo, yr);
    return `${formatUsd(mo)} / mo · ${formatUsd(yr)} / yr (save ${formatUsd(save)})`;
  };

  const chargeLabel =
    billingInterval === "year" && yearly != null
      ? `${formatUsd(yearly)} / yr`
      : `${formatUsd(monthly)} / mo`;

  const rememberAndGoToLogin = () => {
    savePendingMembershipCheckout({
      tierId,
      audience,
      resumeCheckout: pendingShouldResumeCheckout(tierId, audience),
    });
    onGoToLogin();
  };

  const applyPlanToProfile = async (nextTier: TierId = tier.id): Promise<boolean> => {
    const result = await updateMembershipPlan({
      membershipTier: nextTier,
      audience,
    });
    if (!result.ok) {
      setError(result.error || "Could not update your membership.");
      return false;
    }
    setProfileApplied(true);
    if (result.user) onProfileUpdated?.(result.user);
    saveJoinAudience(audience);
    if (result.user?.email) setEmail(result.user.email);
    return true;
  };

  const submitPlanChange = async (nextTier: TierId) => {
    if (busy) return;
    const nextStripeReady = supportsMembershipStripeCheckout(nextTier, audience);
    if (currentTier != null && currentTier === nextTier && !nextStripeReady) return;
    setTierId(nextTier);
    setError("");
    setBusy(true);
    try {
      if (nextStripeReady) {
        if (loggedInEmail) setEmail(String(loggedInEmail).trim());
        setStep("checkout");
        return;
      }
      const ok = await applyPlanToProfile(nextTier);
      if (!ok) return;
      setStep("done");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !resumeCheckout || !stripeReadyStart) return;
    // Paid Adult/Senior upgrades wait for Stripe — don't bump the plan until payment confirms.
    setStep("checkout");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot resume
  }, []);

  const handleAddToProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPlanChange(tier.id);
  };

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
        const msg = result.error || "Could not create account.";
        setError(msg);
        if (/already exists|sign in instead/i.test(msg)) {
          savePendingMembershipCheckout({
            tierId: tier.id,
            audience,
            resumeCheckout: pendingShouldResumeCheckout(tier.id, audience),
          });
        }
        setBusy(false);
        return;
      }

      grantFreeMemberSession({
        email: trimmed,
        ageGroup: audience,
        isParentAccount: isKids || undefined,
      });
      saveJoinAudience(audience);

      if (isPaid && stripeReady) {
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

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!stripeReady) {
      setError("Stripe checkout is only available for Adult and Senior paid plans.");
      return;
    }
    const checkoutEmail = String(isLoggedIn && loggedInEmail ? loggedInEmail : email)
      .trim()
      .toLowerCase();
    if (!checkoutEmail.includes("@")) {
      setError("A valid email is required for checkout.");
      return;
    }
    setBusy(true);
    try {
      const session = await startMembershipCheckout({
        email: checkoutEmail,
        name: name.trim() || undefined,
        tierId: tier.id,
        audience,
        interval: billingInterval,
      });
      if (!session.url) {
        setError("Stripe did not return a checkout link.");
        return;
      }
      window.location.assign(session.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start Stripe checkout.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="membership-signup-page" data-testid="membership-signup-page">
      <BusyOverlay
        active={busy}
        message={
          step === "checkout"
            ? "Redirecting to secure Stripe checkout…"
            : step === "done" && stripePaid
              ? "Confirming payment…"
              : step === "profile"
                ? "Updating your membership…"
                : "Creating account…"
        }
      />
      <button type="button" className="btn btn-outline membership-signup-back" onClick={onBackToPlans}>
        <ArrowLeft size={16} aria-hidden /> Back to membership plans
      </button>

      <section className="glass membership-signup-card" aria-labelledby="membership-signup-heading">
        <header className="membership-signup-header">
          <span className="glow-badge free">
            <UserPlus size={13} aria-hidden />{" "}
            {isLoggedIn ? "Membership upgrade" : "Membership sign-up"}
          </span>
          <h2 id="membership-signup-heading">
            {step === "checkout"
              ? "Secure checkout"
              : step === "done"
                ? profileApplied || isLoggedIn
                  ? "Membership updated"
                  : "You're almost in"
                : step === "profile"
                  ? "Upgrade your GYSH Membership"
                  : "Create your GYSH Membership"}
          </h2>
          <p>
            {step === "register" &&
              (isPaid && stripeReady
                ? "Enter your details to join. Paid Adult and Senior plans continue to Stripe Checkout (test cards work in Test mode)."
                : "Enter your details to join. Free plans need no payment; Kids/Teens paid plans use credits and activate after admin review.")}
            {step === "profile" &&
              (isPaid && stripeReady
                ? `You're signed in${loggedInEmail ? ` as ${loggedInEmail}` : ""}. Confirm the plan below — paid Adult and Senior upgrades continue to Stripe Checkout.`
                : `You're signed in${loggedInEmail ? ` as ${loggedInEmail}` : ""}. Choose a plan to add or upgrade on your profile${
                    currentTier ? ` (currently ${MEMBERSHIP_TIERS.find((t) => t.id === currentTier)?.name ?? currentTier})` : ""
                  }.`)}
            {step === "checkout" &&
              "You'll finish on Stripe's secure page. Use a test card like 4242 4242 4242 4242 while Stripe is in Test / Sandbox mode."}
            {step === "done" &&
              (stripePaid
                ? profileApplied || isLoggedIn
                  ? "Payment received and your membership plan is updated on your profile."
                  : "Account created and payment received. An admin still activates logins; you'll get email when you're ready."
                : profileApplied || isLoggedIn
                  ? "Your membership plan is saved on your profile."
                  : "Account created and awaiting admin activation. Check your email for confirmation.")}
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
                data-testid="membership-signup-audience"
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
                        ? ` — ${t.creditsPerMonth} credits/mo`
                        : ` — ${usdPriceLabel(t)}`}
                  </option>
                ))}
              </select>
            </div>

            <label htmlFor="membership-signup-name">{isKids ? "Parent / guardian name" : "Name"}</label>
            <input
              id="membership-signup-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="membership-signup-name"
            />

            {isKids && (
              <>
                <label htmlFor="membership-signup-child">Child first name / nickname</label>
                <input
                  id="membership-signup-child"
                  type="text"
                  value={childDisplayName}
                  onChange={(e) => setChildDisplayName(e.target.value)}
                  required
                  data-testid="membership-signup-child"
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
                {busy ? (
                  <WaitLabel>Creating account…</WaitLabel>
                ) : (
                  <>
                    <UserPlus size={16} aria-hidden />
                    {membershipSignupSubmitLabel(tier.name, {
                      tierId: tier.id,
                      isPaid,
                      stripeReady,
                      mode: "register",
                    })}
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline" onClick={rememberAndGoToLogin}>
                Already a member? Sign in
              </button>
              {/already exists|sign in instead/i.test(error) && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={rememberAndGoToLogin}
                  data-testid="membership-signup-signin-existing"
                >
                  Sign in to continue checkout
                </button>
              )}
            </div>
          </form>
        )}

        {step === "profile" && (
          <form
            className="membership-signup-form"
            onSubmit={handleAddToProfile}
            noValidate
            data-testid="membership-upgrade-form"
          >
            <div className="membership-signup-summary">
              <label htmlFor="membership-upgrade-audience">Audience</label>
              <select
                id="membership-upgrade-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as AudienceGroup)}
                data-testid="membership-signup-audience"
              >
                {AUDIENCE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {AUDIENCE_LABELS[a]}
                  </option>
                ))}
              </select>

              <label htmlFor="membership-upgrade-tier">Plan</label>
              <select
                id="membership-upgrade-tier"
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
                        ? ` — ${t.creditsPerMonth} credits/mo`
                        : ` — ${usdPriceLabel(t)}`}
                    {currentTier === t.id ? " (current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <p className="membership-signup-plan-note">
              Signed in as <strong>{loggedInEmail || email || "member"}</strong>
              {currentTier
                ? ` · Current plan: ${MEMBERSHIP_TIERS.find((t) => t.id === currentTier)?.name ?? currentTier}`
                : ""}
            </p>

            {error && (
              <p className="membership-signup-error" role="alert">
                {error}
              </p>
            )}

            <div
              className="membership-signup-actions membership-signup-plan-buttons"
              data-testid="membership-upgrade-plan-buttons"
            >
              {membershipUpgradeActionBubbles(currentTier).map((bubble) => {
                const selected = bubble.tierId === tier.id;
                return (
                  <button
                    key={bubble.tierId}
                    type="button"
                    className={`btn ${bubble.kind === "upgrade" ? "btn-primary" : "btn-outline"}`}
                    disabled={busy}
                    onClick={() => void submitPlanChange(bubble.tierId)}
                    data-testid={`membership-upgrade-choose-${bubble.tierId}`}
                    data-selected={selected ? "true" : "false"}
                  >
                    {busy && selected ? (
                      <WaitLabel>Updating membership…</WaitLabel>
                    ) : (
                      <>
                        <UserPlus size={16} aria-hidden />
                        {bubble.label}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </form>
        )}

        {step === "checkout" && (
          <form
            className="membership-signup-form membership-stripe-checkout"
            onSubmit={handleStripeCheckout}
            data-testid="membership-stripe-checkout"
          >
            <div className="membership-fake-checkout-banner" role="status">
              <CreditCard size={18} aria-hidden />
              <span>
                Secure Stripe Checkout — in <strong>Test / Sandbox</strong> mode use card{" "}
                <code>4242 4242 4242 4242</code>, any future expiry, any CVC.
              </span>
            </div>
            <p className="membership-signup-plan-note">
              Plan: <strong>{tier.name}</strong> · {AUDIENCE_LABELS[audience]}
            </p>

            {yearly != null && (
              <fieldset className="membership-billing-interval" data-testid="membership-billing-interval">
                <legend>Billing</legend>
                <label>
                  <input
                    type="radio"
                    name="billing-interval"
                    checked={billingInterval === "month"}
                    onChange={() => setBillingInterval("month")}
                  />{" "}
                  Monthly — {formatUsd(monthly)} / mo
                </label>
                <label>
                  <input
                    type="radio"
                    name="billing-interval"
                    checked={billingInterval === "year"}
                    onChange={() => setBillingInterval("year")}
                  />{" "}
                  Yearly — {formatUsd(yearly)} / yr
                  {yearlySave > 0 ? ` (save ${formatUsd(yearlySave)})` : ""}
                </label>
              </fieldset>
            )}

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
                data-testid="membership-stripe-pay"
              >
                {busy ? (
                  <WaitLabel>Opening Stripe…</WaitLabel>
                ) : (
                  <>
                    <CreditCard size={16} aria-hidden />
                    {`Pay ${chargeLabel} with Stripe`}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="membership-signup-done" data-testid="membership-signup-done">
            <CheckCircle2 size={36} aria-hidden />
            <h3>
              {stripePaid
                ? "Payment complete"
                : profileApplied || isLoggedIn
                  ? "Plan updated"
                  : "Account created"}
            </h3>
            <p>
              {stripePaid
                ? profileApplied || isLoggedIn
                  ? `Your ${tier.name} payment is recorded and your profile plan is updated.`
                  : `Your ${tier.name} payment is recorded. We'll email you when your login is activated.`
                : profileApplied || isLoggedIn
                  ? `Your profile is now on the ${tier.name} plan.`
                  : usesCredits && isPaid
                    ? `Your ${tier.name} credit plan request is saved for admin activation. Kid Credit packs can be purchased after you're approved.`
                    : "You can browse free guides while you wait for activation."}
            </p>
            <div className="membership-signup-actions">
              {onOpenFreeGuides && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onOpenFreeGuides}
                  data-testid="membership-signup-browse-guides"
                >
                  {browseGuidesButtonLabel(
                    Boolean(isLoggedIn && (isMembershipSubscriber(currentTier) || isMembershipSubscriber(tier.id))),
                  )}
                </button>
              )}
              {!isLoggedIn && (
                <button type="button" className="btn btn-outline" onClick={rememberAndGoToLogin}>
                  Go to sign in
                </button>
              )}
              {isLoggedIn && (
                <button type="button" className="btn btn-outline" onClick={onBackToPlans}>
                  Back to plans
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
