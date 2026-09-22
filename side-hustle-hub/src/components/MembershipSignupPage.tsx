import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, CreditCard, LayoutDashboard, Sparkles, UserPlus } from "lucide-react";
import { BusyOverlay, WaitLabel } from "./WaitFeedback";
import { PasswordField } from "./PasswordField";
import { registerFreeMember, updateMembershipPlan, fetchMe, type AuthUser } from "../lib/auth";
import { passwordPolicyError } from "../lib/password-policy";
import { grantFreeMemberSession } from "../lib/free-member-session";
import { pendingWizardRegisterPayload, readPendingBlueprint } from "../lib/pending-blueprint";
import { ensureComplimentaryClaim } from "../lib/wizard-comp-guide";
import {
  AUDIENCE_LABELS,
  MEMBERSHIP_TIERS,
  formatUsd,
  isMembershipSubscriber,
  merchChoicesError,
  merchItemCount,
  parseMerchChoices,
  tierPriceMonthlyUsd,
  tierPriceYearlyUsd,
  yearlySavingsUsd,
  type AudienceGroup,
  type MerchItemId,
  type MerchTshirtSize,
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
import { fetchMemberCredits, spendableCreditBalance } from "../lib/member-credits";
import {
  checkoutFullyPaidWithCredits,
  membershipCreditPrice,
  mixedCheckoutButtonLabel,
  quoteMixedUsdPayment,
} from "../lib/credit-checkout";
import {
  membershipAdvanceBillingNoteCopy,
  membershipCheckoutDueLabel,
  membershipJoinDueUsd,
  membershipJoinIntervalRadioLabel,
} from "../lib/membership-commitment-billing";
import { CreditApplyControls } from "./CreditApplyControls";
import {
  pendingShouldResumeCheckout,
  readPendingMerchChoices,
  savePendingMembershipCheckout,
  savePendingMerchChoices,
} from "../lib/pending-membership-checkout";
import {
  browseGuidesButtonLabel,
  freeMemberSignupNextStepsCopy,
  isFreeMemberSignupNextStepsVisible,
  membershipSignupDropdownTier,
  membershipSignupSubmitLabel,
  membershipUpgradeActionBubbles,
} from "../lib/membership-signup-labels";
import { VIEW_PATH } from "../lib/app-routes";
import {
  adminSimulatePaymentHint,
  adminSimulatePaymentLabel,
} from "../lib/admin-simulate-payment";
import { myDashboardLocationTip } from "../lib/dashboard-nav-tip";
import { BETA_NDA_VERSION, betaNdaRegisterError, betaNdaTodayDate } from "../lib/beta-tester-nda";
import { HEARD_ABOUT_SOURCES, parseHeardAboutInput } from "../lib/heard-about";
import { BetaNdaAcceptancePanel, type BetaNdaAcceptanceValue } from "./BetaNdaAcceptancePanel";
import {
  MembershipMerchChoice,
  type MerchChoiceSlot,
} from "./MembershipMerchChoice";
import type { BetaNdaReceipt } from "../lib/beta-tester-dashboard";

export { membershipSignupSubmitLabel, membershipPlanChooseLabel, membershipSignupDropdownTier } from "../lib/membership-signup-labels";

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
  /** Admin accounts can apply paid tiers without Stripe. */
  isAdmin?: boolean;
  /** Refresh app auth state after profile plan update. */
  onProfileUpdated?: (user: AuthUser) => void;
  onBackToPlans: () => void;
  onGoToLogin: () => void;
  onOpenFreeGuides?: () => void;
  /** Open My Dashboard after Free signup. */
  onOpenDashboard?: () => void;
  /** Open Match Wizard after Free signup. */
  onOpenMatchWizard?: () => void;
  onOpenBetaNda?: () => void;
  /** Fired after a successful signup that applied as a Beta Tester (pending activation). */
  onBetaTesterRegistered?: () => void;
  onBetaTestingUnlocked?: (receipt: BetaNdaReceipt) => void;
  /** Point new members to My Dashboard next to How it works. */
  onShowDashboardTip?: () => void;
  /** Return true to skip the done page (e.g. resume workshop registration). */
  onContinueAfterSignup?: () => boolean;
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
  isAdmin = false,
  onProfileUpdated,
  onBackToPlans,
  onGoToLogin,
  onOpenFreeGuides,
  onOpenDashboard,
  onOpenMatchWizard,
  onOpenBetaNda,
  onBetaTesterRegistered,
  onBetaTestingUnlocked,
  onShowDashboardTip,
  onContinueAfterSignup,
}: MembershipSignupPageProps) {
  const startingAudience = initialAudience ?? "adult";
  const startingTier = membershipSignupDropdownTier({
    initialTier,
    currentTier,
    isLoggedIn,
  });
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
  const [heardAboutSource, setHeardAboutSource] = useState("");
  const [heardAboutDetail, setHeardAboutDetail] = useState("");
  const [applyBetaTester, setApplyBetaTester] = useState(false);
  const [betaNda, setBetaNda] = useState<BetaNdaAcceptanceValue>({
    legalName: "",
    email: "",
    signature: "",
    agreed: false,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stripePaid, setStripePaid] = useState(false);
  const [profileApplied, setProfileApplied] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(() => Boolean(isLoggedIn));
  const [creditsToApply, setCreditsToApply] = useState(0);
  const creditsEdited = useRef(false);
  const [merchChoices, setMerchChoices] = useState<MerchChoiceSlot[]>(() => {
    const count = merchItemCount(startingTier);
    const saved = readPendingMerchChoices();
    if (saved && saved.length === count) return saved;
    return Array.from({ length: count }, () => "");
  });
  const [tshirtSizes, setTshirtSizes] = useState<(MerchTshirtSize | "")[]>(() =>
    Array.from({ length: merchItemCount(startingTier) }, () => ""),
  );

  // Keep Plan / Audience in sync when opened from a membership bubble (Choose Starter, etc.).
  // After an upgrade, currentTier updates on the profile — follow that so the dropdown
  // is not stuck on the leftover Free default.
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
  const includedMerchCount = merchItemCount(tier.id);
  const showFreeNextSteps = isFreeMemberSignupNextStepsVisible({
    isLoggedIn,
    currentTier,
    initialTier,
  });
  const nextStepsCopy = freeMemberSignupNextStepsCopy();

  useEffect(() => {
    setMerchChoices((prev) => {
      if (includedMerchCount <= 0) return [];
      const next = prev.slice(0, includedMerchCount);
      while (next.length < includedMerchCount) next.push("");
      return next;
    });
    setTshirtSizes((prev) => {
      if (includedMerchCount <= 0) return [];
      const next = prev.slice(0, includedMerchCount);
      while (next.length < includedMerchCount) next.push("");
      return next;
    });
  }, [includedMerchCount]);

  const resolvedMerch = parseMerchChoices(merchChoices, includedMerchCount);
  const merchError = merchChoicesError(tier.id, merchChoices, tshirtSizes);

  useEffect(() => {
    if (resolvedMerch?.length) savePendingMerchChoices(resolvedMerch);
  }, [resolvedMerch]);

  useEffect(() => {
    if (!isLoggedIn) {
      setCreditBalance(0);
      setCreditsToApply(0);
      setCreditsLoading(false);
      creditsEdited.current = false;
      return;
    }
    let cancelled = false;
    let retryTimer: number | undefined;
    setCreditsLoading(true);
    const load = (attempt: number) => {
      fetchMemberCredits()
        .then((payload) => {
          if (cancelled) return;
          setCreditBalance(spendableCreditBalance(payload));
          setCreditsLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          if (attempt < 2) {
            retryTimer = window.setTimeout(() => load(attempt + 1), 450);
            return;
          }
          setCreditBalance(0);
          setCreditsLoading(false);
        });
    };
    load(0);
    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [isLoggedIn]);

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

  /** Must match Stripe: non-yearly plans invoice every 3 months; yearly is the year amount. */
  const billingForDue: MembershipBillingInterval =
    billingInterval === "year" && yearly != null ? "year" : "month";
  const chargeUsd = membershipJoinDueUsd(billingForDue, monthly, yearly ?? null);
  const mixedQuote = quoteMixedUsdPayment({
    amountUsd: chargeUsd,
    balance: isLoggedIn ? creditBalance : 0,
    creditsToApply: isLoggedIn ? creditsToApply : 0,
  });
  const paidFullyWithCredits = checkoutFullyPaidWithCredits(mixedQuote);
  const chargeLabel = membershipCheckoutDueLabel({
    interval: billingForDue,
    monthlyUsd: monthly,
    yearlyUsd: yearly ?? null,
    formatUsd,
  });

  useEffect(() => {
    const max = mixedQuote.creditsMax;
    setCreditsToApply((prev) => {
      if (!creditsEdited.current) return max;
      return Math.min(prev, max);
    });
  }, [mixedQuote.creditsMax]);

  const rememberAndGoToLogin = () => {
    savePendingMembershipCheckout({
      tierId,
      audience,
      resumeCheckout: pendingShouldResumeCheckout(tierId, audience),
      merchChoices: resolvedMerch ?? undefined,
    });
    onGoToLogin();
  };

  const applyPlanToProfile = async (
    nextTier: TierId = tier.id,
    merch: MerchItemId[] | null = resolvedMerch,
    opts?: { adminSimulatePayment?: boolean },
  ): Promise<boolean> => {
    const result = await updateMembershipPlan({
      membershipTier: nextTier,
      audience,
      merchChoices: merch ?? undefined,
      merchTshirtSizes: tshirtSizes,
      adminSimulatePayment: opts?.adminSimulatePayment === true,
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

  const handleAdminSimulatePayment = async () => {
    if (!isAdmin || busy) return;
    const merchErr = merchChoicesError(tier.id, merchChoices, tshirtSizes);
    if (merchErr) {
      setError(merchErr);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const ok = await applyPlanToProfile(tier.id, resolvedMerch, { adminSimulatePayment: true });
      if (!ok) return;
      setStripePaid(true);
      setStep("done");
    } finally {
      setBusy(false);
    }
  };

  const submitPlanChange = async (nextTier: TierId) => {
    if (busy) return;
    setTierId(nextTier);
    const nextCount = merchItemCount(nextTier);
    const nextMerch = parseMerchChoices(merchChoices, nextCount);
    const nextMerchError = merchChoicesError(nextTier, merchChoices, tshirtSizes);
    if (nextMerchError) {
      setError(nextMerchError);
      return;
    }
    const nextStripeReady = supportsMembershipStripeCheckout(nextTier, audience);
    if (currentTier != null && currentTier === nextTier && !nextStripeReady) return;
    setError("");
    setBusy(true);
    try {
      if (nextStripeReady) {
        if (loggedInEmail) setEmail(String(loggedInEmail).trim());
        setStep("checkout");
        return;
      }
      const ok = await applyPlanToProfile(nextTier, nextMerch, {
        adminSimulatePayment: isAdmin,
      });
      if (!ok) return;
      if (isAdmin && isMembershipSubscriber(nextTier)) setStripePaid(true);
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
    if (merchError) {
      setError(merchError);
      return;
    }
    const heardAbout = parseHeardAboutInput({
      sourceId: heardAboutSource,
      detail: heardAboutDetail,
    });
    if (!heardAbout.ok) {
      setError(heardAbout.error);
      return;
    }

    setBusy(true);
    try {
      const wizard = pendingWizardRegisterPayload(readPendingBlueprint());
      const result = await registerFreeMember({
        email: trimmed,
        password,
        name: name.trim() || undefined,
        ageGroup: audience,
        childDisplayName: isKids ? childDisplayName.trim() : undefined,
        membershipTier: tier.id,
        merchChoices: resolvedMerch ?? undefined,
        merchTshirtSizes: tshirtSizes,
        heardAbout: { sourceId: heardAbout.sourceId, detail: heardAbout.detail },
        claimToken: wizard.claimToken,
        pendingBlueprint: wizard.pendingBlueprint,
        applyBetaTester,
        betaNda: applyBetaTester ? ndaPayload : undefined,
      });
      if (!result.ok) {
        const msg = result.error || "Could not create account.";
        setError(msg);
        if (/already exists|sign in instead/i.test(msg)) {
          savePendingMembershipCheckout({
            tierId: tier.id,
            audience,
            resumeCheckout: pendingShouldResumeCheckout(tier.id, audience),
            merchChoices: resolvedMerch ?? undefined,
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
      // Register issues a session for Free; keep the local wizard marker for restore.
      if (wizard.pendingBlueprint?.resultIds?.length) {
        await ensureComplimentaryClaim({
          isLoggedIn: true,
          resultIds: wizard.pendingBlueprint.resultIds,
          resultPcts: wizard.pendingBlueprint.resultPcts,
        });
      }
      if (result.user) onProfileUpdated?.(result.user);

      if (applyBetaTester) {
        onBetaTesterRegistered?.();
      }
      if (applyBetaTester && result.testingUnlocked && result.betaNda && onBetaTestingUnlocked) {
        onBetaTestingUnlocked(result.betaNda);
        return;
      }
      if (isPaid && stripeReady) {
        setStep("checkout");
      } else {
        onShowDashboardTip?.();
        if (onContinueAfterSignup?.()) return;
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
    if (merchError) {
      setError(merchError);
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
        creditsToApply: isLoggedIn ? mixedQuote.creditsApplied : 0,
        merchChoices: resolvedMerch ?? undefined,
        merchTshirtSizes: tshirtSizes,
      });
      if (session?.paid && !session.url) {
        setStripePaid(true);
        setProfileApplied(true);
        if (session.user) onProfileUpdated?.(session.user);
        setStep("done");
        return;
      }
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
            ? paidFullyWithCredits
              ? "Applying your credits…"
              : "Redirecting to secure Stripe checkout…"
            : step === "done" && stripePaid
              ? "Confirming payment…"
              : step === "profile"
                ? "Updating your membership…"
                : "Creating account…"
        }
      />
      <div className="membership-signup-toolbar">
        <button type="button" className="btn btn-outline membership-signup-back" onClick={onBackToPlans}>
          <ArrowLeft size={16} aria-hidden /> Back to membership plans
        </button>
      </div>

      <section className="glass membership-signup-card" aria-labelledby="membership-signup-heading">
        <header className="membership-signup-header">
          <span className="glow-badge free">
            <UserPlus size={13} aria-hidden />{" "}
            {isLoggedIn
              ? showFreeNextSteps && step === "profile"
                ? "You're a member"
                : "Membership upgrade"
              : "Membership sign-up"}
          </span>
          <h2 id="membership-signup-heading">
            {step === "checkout"
              ? "Secure checkout"
              : step === "done"
                ? profileApplied || isLoggedIn
                  ? "Membership updated"
                  : "You're almost in"
                : step === "profile"
                  ? showFreeNextSteps
                    ? nextStepsCopy.heading
                    : "Upgrade your GYSH Membership"
                  : "Create your GYSH Membership"}
          </h2>
          <p>
            {step === "register" &&
              (isPaid && stripeReady
                ? "Enter your details to join. Paid Adult and Senior plans continue to secure Stripe Checkout."
                : "Enter your details to join. Free plans need no payment; Kids/Teens paid plans use credits and activate after admin review.")}
            {step === "profile" &&
              (showFreeNextSteps
                ? nextStepsCopy.body
                : isPaid && stripeReady
                ? `You're signed in${loggedInEmail ? ` as ${loggedInEmail}` : ""}. Confirm the plan below — apply credits toward the amount due (1 credit = $1), or finish any remainder on Stripe.`
                : `You're signed in${loggedInEmail ? ` as ${loggedInEmail}` : ""}. Choose a plan to add or upgrade on your profile${
                    currentTier ? ` (currently ${MEMBERSHIP_TIERS.find((t) => t.id === currentTier)?.name ?? currentTier})` : ""
                  }.`)}
            {step === "checkout" &&
              (paidFullyWithCredits
                ? "Your credits cover today’s charge — confirm below to upgrade without Stripe."
                : "Apply credits toward the amount due (1 credit = $1). Any remainder goes to Stripe’s secure page. Credit packs cannot be bought with credits.")}
            {step === "done" &&
              (stripePaid
                ? profileApplied || isLoggedIn
                  ? "Payment received and your membership plan is updated on your profile."
                  : "Account created and payment received. An admin still activates logins; you'll get email when you're ready."
                : profileApplied || isLoggedIn
                  ? "Your membership plan is saved on your profile."
                  : applyBetaTester
                    ? "Beta Tester application received. Stand by for admin activation — check your email for confirmation and next steps."
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
                      : usesCredits
                        ? ` — ${membershipCreditPrice(t.id, audience)} credits/mo`
                        : ` — ${usdPriceLabel(t)}`}
                  </option>
                ))}
              </select>

              <MembershipMerchChoice
                tierId={tier.id}
                choices={merchChoices}
                tshirtSizes={tshirtSizes}
                onChange={setMerchChoices}
                onTshirtSizesChange={setTshirtSizes}
              />

              <label className="membership-signup-role-opt" htmlFor="membership-signup-beta">
                <input
                  id="membership-signup-beta"
                  type="checkbox"
                  checked={applyBetaTester}
                  onChange={(e) => setApplyBetaTester(e.target.checked)}
                  data-testid="membership-signup-beta-role"
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
                  idPrefix="membership-signup-nda"
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

            <label htmlFor="membership-signup-heard-about">How did you hear about us?</label>
            <select
              id="membership-signup-heard-about"
              value={heardAboutSource}
              onChange={(e) => setHeardAboutSource(e.target.value)}
              required
              data-testid="membership-signup-heard-about"
            >
              <option value="">Select one</option>
              {HEARD_ABOUT_SOURCES.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.label}
                </option>
              ))}
            </select>
            {heardAboutSource === "other" ? (
              <>
                <label htmlFor="membership-signup-heard-about-detail">Please tell us more</label>
                <input
                  id="membership-signup-heard-about-detail"
                  type="text"
                  value={heardAboutDetail}
                  onChange={(e) => setHeardAboutDetail(e.target.value)}
                  maxLength={80}
                  required
                  placeholder="Podcast, neighbor, church…"
                  data-testid="membership-signup-heard-about-detail"
                />
              </>
            ) : null}

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
                Already a member? Log in
              </button>
              {/already exists|sign in instead/i.test(error) && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={rememberAndGoToLogin}
                  data-testid="membership-signup-signin-existing"
                >
                  Log in to continue checkout
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
            {showFreeNextSteps ? (
              <div
                className="membership-signup-next-steps"
                data-testid="membership-signup-next-steps"
              >
                <div className="membership-signup-actions membership-signup-next-steps__actions">
                  {onOpenFreeGuides ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={onOpenFreeGuides}
                      data-testid="membership-signup-next-guides"
                    >
                      <BookOpen size={16} aria-hidden />
                      {nextStepsCopy.guidesLabel}
                    </button>
                  ) : null}
                  {onOpenMatchWizard ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={onOpenMatchWizard}
                      data-testid="membership-signup-next-wizard"
                    >
                      <Sparkles size={16} aria-hidden />
                      {nextStepsCopy.wizardLabel}
                    </button>
                  ) : (
                    <a
                      className="btn btn-outline"
                      href={VIEW_PATH.quiz}
                      data-testid="membership-signup-next-wizard"
                    >
                      <Sparkles size={16} aria-hidden />
                      {nextStepsCopy.wizardLabel}
                    </a>
                  )}
                </div>
                <p
                  className="membership-signup-dashboard-tip"
                  data-testid="membership-signup-next-steps-tip"
                  role="note"
                >
                  {myDashboardLocationTip()}
                </p>
                <p className="membership-signup-plan-note">{nextStepsCopy.upgradeHint}</p>
              </div>
            ) : null}
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
                      : usesCredits
                        ? ` — ${membershipCreditPrice(t.id, audience)} credits/mo`
                        : ` — ${usdPriceLabel(t)}`}
                    {currentTier === t.id ? " (current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <MembershipMerchChoice
              tierId={tier.id}
              choices={merchChoices}
              tshirtSizes={tshirtSizes}
              onChange={setMerchChoices}
              onTshirtSizesChange={setTshirtSizes}
            />

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
            <div className="membership-checkout-secure-banner" role="status">
              <CreditCard size={18} aria-hidden />
              <span>Secure Stripe Checkout — your card is processed on Stripe’s encrypted payment page.</span>
            </div>
            <p className="membership-signup-plan-note">
              Plan: <strong>{tier.name}</strong> · {AUDIENCE_LABELS[audience]}
            </p>

            <MembershipMerchChoice
              tierId={tier.id}
              choices={merchChoices}
              tshirtSizes={tshirtSizes}
              onChange={setMerchChoices}
              onTshirtSizesChange={setTshirtSizes}
            />

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
                  {membershipJoinIntervalRadioLabel({
                    interval: "month",
                    monthlyUsd: monthly,
                    yearlyUsd: yearly,
                    formatUsd,
                  })}
                </label>
                <label>
                  <input
                    type="radio"
                    name="billing-interval"
                    checked={billingInterval === "year"}
                    onChange={() => setBillingInterval("year")}
                  />{" "}
                  {membershipJoinIntervalRadioLabel({
                    interval: "year",
                    monthlyUsd: monthly,
                    yearlyUsd: yearly,
                    yearlySaveUsd: yearlySave,
                    formatUsd,
                  })}
                </label>
              </fieldset>
            )}
            <p className="membership-signup-plan-note">{membershipAdvanceBillingNoteCopy()}</p>

            <CreditApplyControls
              quote={mixedQuote}
              signedIn={isLoggedIn}
              loading={creditsLoading}
              cartItemCount={1}
              onSignIn={rememberAndGoToLogin}
              onCreditsChange={(n) => {
                creditsEdited.current = true;
                setCreditsToApply(n);
              }}
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
                disabled={busy || creditsLoading}
                data-testid="membership-stripe-pay"
              >
                {busy ? (
                  <WaitLabel>
                    {paidFullyWithCredits ? "Applying credits…" : "Opening Stripe…"}
                  </WaitLabel>
                ) : creditsLoading ? (
                  <WaitLabel>Loading credits…</WaitLabel>
                ) : (
                  <>
                    <CreditCard size={16} aria-hidden />
                    {mixedQuote.creditsApplied > 0
                      ? mixedCheckoutButtonLabel(mixedQuote)
                      : `Pay ${chargeLabel} with Stripe`}
                  </>
                )}
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={busy || creditsLoading}
                  onClick={() => void handleAdminSimulatePayment()}
                  data-testid="membership-admin-simulate-pay"
                  title={adminSimulatePaymentHint()}
                >
                  {busy ? <WaitLabel>Updating plan…</WaitLabel> : adminSimulatePaymentLabel()}
                </button>
              ) : null}
            </div>
            {isAdmin ? (
              <p className="membership-signup-plan-note" data-testid="membership-admin-simulate-hint">
                {adminSimulatePaymentHint()}
              </p>
            ) : null}
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
                  : applyBetaTester
                    ? "Please stand by for account activation. Check your email for confirmation; you'll get a welcome message with next steps once an admin clears you to sign in. Then open the Beta Tester dashboard to start testing."
                    : usesCredits && isPaid
                      ? `Your ${tier.name} credit plan request is saved for admin activation. Kid Credit packs can be purchased after you're approved.`
                      : "You can browse free guides while you wait for activation."}
            </p>
            {!applyBetaTester ? (
              <p className="membership-signup-dashboard-tip" data-testid="membership-dashboard-tip" role="note">
                {myDashboardLocationTip()}
              </p>
            ) : null}
            <div className="membership-signup-actions">
              {isLoggedIn && onOpenDashboard ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onOpenDashboard}
                  data-testid="membership-signup-go-dashboard"
                >
                  <LayoutDashboard size={16} aria-hidden />
                  {nextStepsCopy.dashboardLabel}
                </button>
              ) : null}
              {onOpenFreeGuides && (
                <button
                  type="button"
                  className={isLoggedIn && onOpenDashboard ? "btn btn-outline" : "btn btn-primary"}
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
                  Log in
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
