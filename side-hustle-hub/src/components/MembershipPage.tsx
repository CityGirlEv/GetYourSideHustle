import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Coins,
  CreditCard,
  Crown,
  HeartHandshake,
  LayoutDashboard,
  Link2,
  ShoppingCart,
  Shield,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import {
  ALA_CARTE_PRICE_LIST,
  AUDIENCE_LABELS,
  MEMBERSHIP_INTRO_RATE_BANNER,
  CREDIT_EARN_ACTIONS,
  CREDIT_PACKS,
  MEMBERSHIP_FEATURES,
  MILITARY_VETERAN_CALLOUT,
  SHOW_MILITARY_VETERAN_CALLOUT,
  SCHEDULE_SUITE_FEATURE_IDS,
  SCHEDULE_SUITE_TIER,
  oneOnOneFeatureLabel,
  formatUsd,
  isMembershipSubscriber,
  tierPriceMonthlyUsd,
  tierPriceYearlyUsd,
  yearlyListPriceUsd,
  yearlySavingsUsd,
  equivalentMonthlyUsd,
  formatAlaCarteDetails,
  formatCreditPackCost,
  formatCreditPackListingName,
  formatEarnCreditDelta,
  type AudienceGroup,
  type BillingPeriod,
  type NumberedTierPerk,
  type TierId,
} from "../lib/membership";
import {
  membershipCompareRowsWithAudienceGuideCounts,
  membershipGuideCountLine,
  membershipTiersWithAudienceGuideCounts,
  numberedTierPerksWithAudienceGuideCount,
  useLiveGuideLibraryCounts,
} from "../lib/guide-library-live-counts";
import { membershipGuideCountsByTier } from "../lib/guide-library-pool";
import { SCHEDULE_SUITE_DASHBOARD_HREF } from "../lib/hustle-schedule";
import { BILLING_DASHBOARD_HREF } from "../lib/member-purchases";
import { MembershipModelExplainer } from "./MembershipModelExplainer";
import {
  normalizeAudienceGroup,
  readSavedJoinAudience,
  saveJoinAudience,
} from "../lib/join-audience";
import {
  browseGuidesButtonLabel,
  membershipPlanBubbles,
  membershipPlanChooseLabel,
} from "../lib/membership-signup-labels";
import {
  membershipAdvanceBillingNoteCopy,
  membershipQuarterlyUsd,
} from "../lib/membership-commitment-billing";
import {
  addAlaCarteToCart,
  alacarteCartItemCount,
  alacarteCartTotalUsd,
  clearAlaCarteCart,
  memberVisibleCart,
  emptyAlaCarteCart,
  readAlaCarteCart,
  removeAlaCarteFromCart,
  resolveAlaCarteCartLines,
  setAlaCarteCartQuantity,
  subscribeAlaCarteCart,
  supportsAlaCarteStripeCheckout,
  type AlaCarteCart,
} from "../lib/alacarte-cart";
import { startAlaCarteCartCheckout } from "../lib/stripe-checkout";
import { ApiError } from "../lib/api";
import { WaitLabel } from "./WaitFeedback";
import { PageCollapse } from "./PageCollapse";
import { membershipBenefitsPreviewCount } from "../lib/narrow-viewport";
import { useNarrowViewport } from "../lib/use-narrow-viewport";
import membershipHero from "../assets/membership-hero.png";
import { fetchMemberCredits, spendableCreditBalance, CREDITS_DASHBOARD_HREF } from "../lib/member-credits";
import { CreditPaidThankYou } from "./CreditPaidThankYou";
import {
  clampCreditsByItem,
  centsToUsd,
  creditsByItemFromTotal,
  lineCreditNeed,
  maxCreditsForLine,
  membershipCreditPrice,
  mixedCheckoutButtonLabel,
  offerStripeBesideCredits,
  payWithStripeButtonLabel,
  quoteMixedCartPayment,
  usdToCents,
  type MixedCartLine,
} from "../lib/credit-checkout";
import { CartLineCreditApply, CreditApplyControls } from "./CreditApplyControls";
import { LOGIN_BUTTON_LABEL } from "../lib/auth";

const MEMBERSHIP_BENEFITS_PREVIEW = 2;


function TierBenefitsList({
  tierId,
  benefits,
}: {
  tierId: TierId;
  benefits: NumberedTierPerk[];
}) {
  const [expanded, setExpanded] = useState(false);
  const narrow = useNarrowViewport();
  const previewCount = membershipBenefitsPreviewCount(narrow, MEMBERSHIP_BENEFITS_PREVIEW);
  const preview = benefits.slice(0, previewCount);
  const rest = benefits.slice(previewCount);
  const canCollapse = rest.length > 0;
  const showRest = !canCollapse || expanded;
  const hiddenCount = rest.length;

  const renderPerk = (b: NumberedTierPerk) => (
    <li key={`perk-${b.n}-${b.title}`}>
      <BadgeCheck size={14} className="membership-check" aria-hidden />
      <span>
        <strong>{b.numberedTitle}</strong>
        {b.detail ? <em className="membership-benefit-detail">{b.detail}</em> : null}
      </span>
    </li>
  );

  return (
    <div className="membership-tier-benefits" data-testid={`membership-benefits-${tierId}`}>
      <ol className="membership-tier-features" start={1}>
        {(canCollapse ? preview : benefits).map(renderPerk)}
      </ol>
      {canCollapse ? (
        <button
          type="button"
          className="membership-benefits-toggle"
          data-testid={`membership-benefits-toggle-${tierId}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "See less" : previewCount === 0 ? `What's included (${hiddenCount})` : `See more (${hiddenCount})`}
        </button>
      ) : null}
      {showRest && rest.length > 0 ? (
        <ol
          className="membership-tier-features membership-tier-features--rest"
          start={previewCount + 1}
        >
          {rest.map(renderPerk)}
        </ol>
      ) : null}
    </div>
  );
}

type MembershipPageProps = {
  /** Open membership sign-up; optional tier + the audience lane in focus when the button was clicked. */
  onGoToJoin?: (tier?: TierId, audience?: AudienceGroup) => void;
  onGoToLogin?: () => void;
  onOpenFreeGuides?: () => void;
  /** Prefill membership lane from the page that linked here (kids / teens / adult / senior). */
  initialAudience?: AudienceGroup | null;
  /** Scroll to Free–Elite plans once mounted (main-nav See Memberships). */
  autoScrollToPlans?: boolean;
  onAutoScrolledToPlans?: () => void;
  /** Highlight / focus the Upgrade or Choose button for this plan. */
  focusTier?: TierId | null;
  /** Scroll to a-la-carte cart / checkout once mounted (header Cart). */
  autoScrollToCart?: boolean;
  onAutoScrolledToCart?: () => void;
  /** Logged-in member — plan cards show Upgrade / Current plan. */
  isLoggedIn?: boolean;
  /** Current membership tier on the logged-in profile. */
  currentTier?: TierId | null;
  /** Prefill a-la-carte checkout email when signed in. */
  checkoutEmail?: string | null;
  /** Open My Dashboard → Schedule Suite (Join Schedule Suite links). */
  onOpenScheduleSuite?: () => void;
  /** Open My Dashboard → Billing/Access. */
  onOpenBilling?: () => void;
  /** Open My Dashboard → Credits. */
  onOpenCredits?: () => void;
  /** Open My Dashboard (home). */
  onOpenDashboard?: () => void;
  /** Open My Dashboard → Blueprint. */
  onOpenBlueprints?: () => void;
};

function ScheduleSuiteLink({
  href,
  children,
  testId,
  onOpen,
  className,
}: {
  href: string;
  children: ReactNode;
  testId?: string;
  onOpen?: () => void;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className ?? "membership-schedule-link"}
      data-testid={testId}
      onClick={(e) => {
        if (href.startsWith("#") || !onOpen) return;
        e.preventDefault();
        onOpen();
      }}
    >
      {children}
    </a>
  );
}

const AUDIENCE_TABS: AudienceGroup[] = ["kids", "junior", "adult", "senior"];

export function MembershipPage({
  onGoToJoin,
  onGoToLogin,
  onOpenFreeGuides,
  initialAudience = null,
  autoScrollToPlans = false,
  onAutoScrolledToPlans,
  focusTier = null,
  autoScrollToCart = false,
  onAutoScrolledToCart,
  isLoggedIn = false,
  currentTier = null,
  checkoutEmail = null,
  onOpenScheduleSuite,
  onOpenBilling,
  onOpenCredits,
  onOpenDashboard,
  onOpenBlueprints,
}: MembershipPageProps) {
  const liveGuideCounts = useLiveGuideLibraryCounts();
  const [audience, setAudience] = useState<AudienceGroup>(() =>
    normalizeAudienceGroup(initialAudience, readSavedJoinAudience("adult")),
  );
  const [upgradeFocusTier, setUpgradeFocusTier] = useState<TierId | null>(null);
  const guideCountsByTier = membershipGuideCountsByTier(
    audience,
    liveGuideCounts.states,
  );
  const membershipTiers = membershipTiersWithAudienceGuideCounts(
    audience,
    guideCountsByTier,
    liveGuideCounts.states,
  );
  const membershipCompareRows = membershipCompareRowsWithAudienceGuideCounts(
    audience,
    guideCountsByTier,
    liveGuideCounts.states,
  );
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [highlightAudience, setHighlightAudience] = useState(Boolean(initialAudience));
  const audienceTabsRef = useRef<HTMLDivElement>(null);
  const membershipPlansRef = useRef<HTMLElement>(null);
  const cartPanelRef = useRef<HTMLDivElement>(null);
  const alacarteDetailsRef = useRef<HTMLDetailsElement>(null);
  const [cart, setCart] = useState<AlaCarteCart>(() => readAlaCarteCart());
  const [cartEmail, setCartEmail] = useState(() => String(checkoutEmail || "").trim());
  const [cartBusy, setCartBusy] = useState(false);
  const [cartPayVia, setCartPayVia] = useState<"credits" | "stripe" | null>(null);
  const [cartError, setCartError] = useState("");
  const [cartPaid, setCartPaid] = useState("");
  const [creditPaidThanks, setCreditPaidThanks] = useState<number | null>(null);
  const thankYouRef = useRef<HTMLDivElement>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(() => Boolean(isLoggedIn));
  const [creditsByItem, setCreditsByItem] = useState<Record<string, number>>({});
  const creditsEdited = useRef(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const usesCredits = audience === "kids" || audience === "junior";
  const showMilitaryCallout =
    SHOW_MILITARY_VETERAN_CALLOUT && (audience === "adult" || audience === "senior");
  const showBillingToggle = !usesCredits;
  const earnActions = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes(audience));
  const alaCarte = ALA_CARTE_PRICE_LIST.filter((i) => i.audiences.includes(audience));
  const displayCart = memberVisibleCart(isLoggedIn, cart);
  const cartLines = resolveAlaCarteCartLines(displayCart);
  const cartCount = alacarteCartItemCount(displayCart);
  const cartTotal = alacarteCartTotalUsd(displayCart);
  const cartStripeReady =
    cartLines.length > 0 && cartLines.every((l) => l.stripeReady);
  const mixedCartLines: MixedCartLine[] = cartLines.map(({ item, quantity }) => ({
    itemId: item.id,
    name: item.name,
    quantity,
    priceUsd: item.priceUsd,
    kind: item.kind,
    credits: item.kind === "credit_pack" ? null : item.credits ?? null,
  }));
  const cartSignature = displayCart.lines.map((l) => `${l.itemId}x${l.quantity}`).join(",");
  const lineCredits = isLoggedIn
    ? clampCreditsByItem(mixedCartLines, creditBalance, creditsByItem)
    : {};
  const mixedQuote = quoteMixedCartPayment({
    lines: mixedCartLines,
    balance: isLoggedIn ? creditBalance : 0,
    creditsToApply: isLoggedIn ? Object.values(lineCredits).reduce((sum, n) => sum + n, 0) : 0,
  });

  const scrollToMemberships = () => {
    const el = membershipPlansRef.current ?? document.getElementById("gysh-membership-plans");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      (el as HTMLElement).focus({ preventScroll: true });
    } catch {
      /* ignore */
    }
    setHighlightAudience(true);
  };

  const scrollToCart = () => {
    if (alacarteDetailsRef.current) {
      alacarteDetailsRef.current.open = true;
    }
    const el =
      cartPanelRef.current ??
      (document.getElementById("gysh-alacarte-cart") as HTMLElement | null);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      el.focus({ preventScroll: true });
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!autoScrollToPlans && !focusTier) return;
    const tier = focusTier && focusTier !== "free" ? focusTier : null;
    const t = window.setTimeout(() => {
      if (tier) setUpgradeFocusTier(tier);
      scrollToMemberships();
      if (tier) {
        const btn = document.querySelector(
          `[data-testid="membership-choose-${tier}"]`,
        ) as HTMLButtonElement | null;
        if (btn) {
          try {
            btn.focus({ preventScroll: true });
          } catch {
            /* ignore */
          }
          btn.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      onAutoScrolledToPlans?.();
    }, 80);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when nav asks to focus plans / tier
  }, [autoScrollToPlans, focusTier]);

  useEffect(() => {
    if (!autoScrollToCart) return;
    const t = window.setTimeout(() => {
      scrollToCart();
      onAutoScrolledToCart?.();
    }, 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when header Cart opens checkout
  }, [autoScrollToCart]);

  useEffect(() => subscribeAlaCarteCart(setCart), []);

  useEffect(() => {
    if (!initialAudience) return;
    const next = normalizeAudienceGroup(initialAudience, audience);
    setAudience(next);
    saveJoinAudience(next);
    setHighlightAudience(true);
  }, [initialAudience]); // eslint-disable-line react-hooks/exhaustive-deps -- apply inbound lane when Join opens

  useEffect(() => {
    saveJoinAudience(audience);
  }, [audience]);

  useEffect(() => {
    if (!highlightAudience) return;
    const t = window.setTimeout(() => setHighlightAudience(false), 2800);
    return () => window.clearTimeout(t);
  }, [highlightAudience, audience]);

  useEffect(() => {
    const next = String(checkoutEmail || "").trim();
    if (next) setCartEmail(next);
  }, [checkoutEmail]);

  useEffect(() => {
    if (!isLoggedIn) {
      setCart(emptyAlaCarteCart());
      setCreditBalance(0);
      setCreditsByItem({});
      creditsEdited.current = false;
      setCreditsLoading(false);
      return;
    }
    setCart(readAlaCarteCart());
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
  }, [isLoggedIn, checkoutEmail]);

  useEffect(() => {
    if (!isLoggedIn || creditsLoading) return;
    setCreditsByItem((prev) => {
      if (!creditsEdited.current) {
        return creditsByItemFromTotal(mixedCartLines, creditBalance, Number.MAX_SAFE_INTEGER);
      }
      return clampCreditsByItem(mixedCartLines, creditBalance, prev);
    });
  }, [isLoggedIn, creditsLoading, creditBalance, cartSignature]); // mixedCartLines is derived from cartSignature

  const selectAudience = (next: AudienceGroup) => {
    setAudience(next);
    saveJoinAudience(next);
    setHighlightAudience(true);
  };

  const handleAddToCart = (itemId: string) => {
    setCartError("");
    setCreditPaidThanks(null);
    setCartPaid("");
    const next = addAlaCarteToCart(itemId, 1);
    if (!isLoggedIn) {
      onGoToLogin?.();
      return;
    }
    setCart(next);
    setJustAddedId(itemId);
    window.setTimeout(() => setJustAddedId((cur) => (cur === itemId ? null : cur)), 1200);
    window.setTimeout(() => scrollToCart(), 50);
  };

  const runCartCheckout = async (creditsToApply: number) => {
    if (cartBusy) return;
    setCartError("");
    setCartPaid("");
    const email = cartEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setCartError("Enter a valid email for checkout.");
      return;
    }
    const credits = Math.max(0, Math.floor(creditsToApply));
    const needsCard = credits <= 0 || mixedQuote.cashDueCents > 0;
    if (needsCard && !cartStripeReady) {
      setCartError("One or more cart items are not available for Stripe checkout yet.");
      return;
    }
    setCartPayVia(credits > 0 ? "credits" : "stripe");
    setCartBusy(true);
    try {
      const session = await startAlaCarteCartCheckout({
        email,
        items: cart.lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
        creditsToApply: isLoggedIn ? credits : 0,
      });
      if (session?.paid && !session.url) {
        const applied = credits;
        setCart(clearAlaCarteCart());
        setCartPaid(
          applied > 0
            ? `Paid with ${applied} credits. Nothing due in cash.`
            : "Payment complete.",
        );
        setCreditPaidThanks(applied);
        setCreditsByItem({});
        creditsEdited.current = false;
        fetchMemberCredits()
          .then((payload) => setCreditBalance(spendableCreditBalance(payload)))
          .catch(() => {});
        window.setTimeout(() => {
          thankYouRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return;
      }
      if (!session?.url) {
        setCartError("Stripe did not return a checkout link.");
        return;
      }
      window.location.assign(session.url);
    } catch (err) {
      setCartError(err instanceof ApiError ? err.message : "Could not start checkout.");
    } finally {
      setCartBusy(false);
      setCartPayVia(null);
    }
  };

  const handleCartCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    void runCartCheckout(0);
  };

  const audienceLabel = AUDIENCE_LABELS[audience];
  const seeMembershipsLabel = `See Memberships — ${audienceLabel} pricing`;
  const seeMembershipsHint = `Scrolls to Free–Elite pricing for ${audienceLabel}. Switch the lane under the picture anytime.`;

  return (
    <div className="membership-page" data-testid="membership-page">
      <section className="membership-hero" aria-label="Join GYSH membership">
        <div className="membership-hero-left">
          <div className="membership-hero-media">
            <img
              src={membershipHero}
              alt="Join the GYSH Community — together we learn, grow, and succeed. A place for every age: kids, teens, adults, and seniors."
              loading="eager"
              decoding="async"
            />
          </div>

          <aside
            className="membership-savings-card glass"
            data-testid="membership-kid-credit-pool-note"
            aria-label="Savings and Kid Credits"
          >
            <p className="membership-savings-card__title">
              <Coins size={16} aria-hidden /> Savings &amp; Kid Credits
            </p>
            <ul className="membership-savings-card__list">
              <li>
                <strong>Seniors save on every paid plan</strong>
                <span>
                  Starter $34 · Pro $57 · Elite $94 / mo
                  <br />
                  (Adult: $39 · $69 · $119)
                </span>
              </li>
              <li>
                <strong>Stripe bills every 3 months</strong>
                <span>{membershipAdvanceBillingNoteCopy()}</span>
              </li>
              <li>
                <strong>Pay yearly — save ~17%</strong>
                <span>That’s 2 months free · billed in advance</span>
              </li>
              <li>
                <strong>Paid plans include monthly credits</strong>
                <span>
                  Starter 5 · Pro 10 · Elite 20. 1 credit = $1. Spend on memberships,
                  workshops, consulting, and a-la-carte — not on buying more credit packs.
                </span>
              </li>
              <li>
                <strong>Earn more anytime</strong>
                <span>Referrals and the dashboard checklist below</span>
              </li>
            </ul>
          </aside>

          <p
            className="membership-credit-note membership-credit-note--under-media glass"
            data-testid={`membership-audience-blurb-${audience}`}
          >
            <span className="membership-credit-note__icon" aria-hidden>
              {usesCredits ? (
                <Coins size={16} />
              ) : audience === "senior" ? (
                <HeartHandshake size={16} />
              ) : (
                <Users size={16} />
              )}
            </span>
            <span className="membership-credit-note__body">
              {usesCredits ? (
                <>
                  Kids and Teens can also spend parent-funded packs — or earn Kid Credits by learning,
                  launching, and sharing your referral link.
                </>
              ) : audience === "senior" ? (
                <>
                  <strong>Senior special pricing</strong> on every paid plan — Starter $34 · Pro $57 ·
                  Elite $94 / mo (Adult: $39 · $69 · $119). Same member tools, lower monthly cost.
                </>
              ) : (
                <>
                  Adults become <strong>GYSH Coaches</strong> for their kids — guide Match Wizard picks,
                  fund Kid Credits, and cheer on launches with parental consent through age 12.
                </>
              )}
            </span>
          </p>
        </div>

        <div className="glass membership-hero-copy">
          <div className="membership-hero-intro">
            <span className="glow-badge free membership-hero-badge">
              <Crown size={13} aria-hidden /> Membership
              <span className="membership-hero-badge-aside">(FREE TO START)</span>
            </span>
            <h2 className="membership-hero-heading">Your Side Hustle deserves a real plan</h2>
            <div className="membership-hero-actions membership-hero-actions--top">
              <button
                type="button"
                className="btn btn-join-green"
                onClick={scrollToMemberships}
                style={{ gap: 6 }}
                data-testid="membership-hero-join"
                aria-describedby="membership-see-plans-hint"
              >
                <Crown size={16} aria-hidden /> See Memberships
              </button>
            </div>
            <PageCollapse
              testId="membership-hero-more"
              className="membership-hero-more"
              title="Why GYSH membership"
              collapseOnNarrow
              defaultOpen
            >
            <p data-testid="membership-lead">
              GYSH membership turns “I should try this” into a weekly rhythm — age-appropriate Match Wizard
              matches, member guides, consulting time, and (on Pro or higher) a{" "}
              <ScheduleSuiteLink href="#gysh-schedule-suite" testId="membership-lead-schedule-link">
                hustle schedule
              </ScheduleSuiteLink>{" "}
              with tracker, progress reports, and email nudges. Start free, then pick the lane that fits your life.
            </p>
            <p className="membership-hero-dashboard-note" data-testid="membership-hero-dashboard-note">
              Members get a <strong>Member Dashboard</strong> (My Dashboard) to track progress, grab
              workshop seats, and share a personal <strong>referral link</strong> that earns Kid Credits
              when friends join.
            </p>
          <ul className="membership-hero-pillars">
            <li>
              <BadgeCheck size={16} aria-hidden />
              <span>Free forever to explore guides — upgrade when you’re ready to launch</span>
            </li>
            <li>
              <LayoutDashboard size={16} aria-hidden />
              <span>Member Dashboard keeps your side hustle, credits, and checklist in one place</span>
            </li>
            <li>
              <Link2 size={16} aria-hidden />
              <span>Referral link on your dashboard — friends join, you earn Kid Credits</span>
            </li>
            <li>
              <Sparkles size={16} aria-hidden />
              <span>
                Paid plans add 1-on-1 consulting; Pro or higher unlocks the{" "}
                <ScheduleSuiteLink href="#gysh-schedule-suite" testId="membership-pillar-schedule-link">
                  schedule suite
                </ScheduleSuiteLink>
              </span>
            </li>
          </ul>
            </PageCollapse>

          <div className="membership-hero-actions membership-hero-actions--bottom">
            <button
              type="button"
              className="btn btn-primary"
              onClick={scrollToMemberships}
              style={{ gap: 6 }}
              data-testid="membership-see-plans"
              aria-describedby="membership-see-plans-hint"
            >
              <Crown size={16} aria-hidden /> {seeMembershipsLabel}
            </button>
            {onOpenFreeGuides && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={onOpenFreeGuides}
                data-testid="membership-browse-guides"
              >
                {browseGuidesButtonLabel(isLoggedIn && isMembershipSubscriber(currentTier))}
              </button>
            )}
            {onGoToLogin && !isLoggedIn && (
              <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                Log in
              </button>
            )}
          </div>
          <p
            id="membership-see-plans-hint"
            className="membership-see-plans-hint"
            data-testid="membership-see-plans-hint"
          >
            {seeMembershipsHint}
          </p>
          </div>
        </div>
      </section>

      <section
        id="gysh-membership-plans"
        ref={membershipPlansRef}
        tabIndex={-1}
        className="membership-plans-section"
        aria-label="Membership plans"
        data-testid="membership-plans"
      >
      <div
        className={`membership-plans-toolbar membership-plans-toolbar--stacked${highlightAudience ? " is-spotlight" : ""}`}
        data-testid="membership-plans-toolbar"
      >
        <div className="membership-plans-toolbar__heading-row">
          <span className="membership-audience-tabs__label" id="membership-audience-heading">
            Membership for: <strong>{audienceLabel}</strong>
          </span>
          <p
            className="membership-intro-rate-banner"
            role="status"
            data-testid="membership-intro-rate-banner"
          >
            {MEMBERSHIP_INTRO_RATE_BANNER}
          </p>
        </div>
        <div
          ref={audienceTabsRef}
          className="membership-audience-tabs membership-audience-tabs--toolbar"
          role="tablist"
          aria-label="Membership audience"
          data-testid="membership-audience-tabs"
        >
          {AUDIENCE_TABS.map((a) => (
            <button
              key={a}
              type="button"
              role="tab"
              aria-selected={audience === a}
              data-testid={`membership-audience-${a}`}
              className={`glow-chip-btn membership-audience-tab${audience === a ? " is-active" : ""}`}
              onClick={() => selectAudience(a)}
            >
              {AUDIENCE_LABELS[a]}
            </button>
          ))}
        </div>
        {usesCredits ? (
          <span
            className="membership-billing-toggle__hint membership-billing-toggle__hint--inline"
            data-testid="membership-billing-hint"
          >
            Kid Credits · monthly
          </span>
        ) : (
          <p
            className="membership-advance-billing-note"
            data-testid="membership-advance-billing-note"
          >
            All membership amounts shown are collected in advance.
          </p>
        )}
        {isLoggedIn ? (
          <div
            className="membership-plan-bubbles"
            role="group"
            aria-label="Switch or upgrade your membership plan"
            data-testid="membership-plan-bubbles"
          >
            {membershipPlanBubbles(currentTier).map((bubble) => (
              <button
                key={bubble.tierId}
                type="button"
                className={`glow-chip-btn membership-plan-bubble${
                  bubble.kind === "current" ? " is-active" : ""
                }${bubble.kind === "upgrade" ? " is-upgrade" : ""}`}
                disabled={bubble.kind === "current"}
                onClick={() => {
                  saveJoinAudience(audience);
                  onGoToJoin?.(bubble.tierId, audience);
                }}
                data-testid={`membership-plan-bubble-${bubble.tierId}`}
              >
                {bubble.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <MembershipModelExplainer showCompareTable={false} collapsible />

      <PageCollapse
        testId="membership-compare"
        className="membership-compare-wrap membership-collapse--standout"
        title="What each plan includes"
        defaultOpen={false}
      >
        <p className="membership-compare__lead">
          Four plans only — what each includes, what stays locked, and why you’d upgrade. Coming soon
          items are labeled separately and are not unlocked by paying.
        </p>
        <div className="membership-compare-scroll">
          <table className="membership-compare-table">
            <colgroup>
              <col className="membership-compare-table__col-feature" />
              <col className="membership-compare-table__col-plan" />
              <col className="membership-compare-table__col-plan" />
              <col className="membership-compare-table__col-plan" />
              <col className="membership-compare-table__col-plan" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Free</th>
                <th scope="col">Starter</th>
                <th scope="col">Pro</th>
                <th scope="col">Elite</th>
              </tr>
            </thead>
            <tbody>
              {membershipCompareRows.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className="membership-compare-table__feature">
                    <span className="membership-compare-table__feature-label">
                      <span className="membership-compare-table__bullet" aria-hidden>
                        •
                      </span>
                      {row.id === "schedule" ? (
                        <ScheduleSuiteLink href="#gysh-schedule-suite" testId="membership-compare-schedule-link">
                          {row.label}
                        </ScheduleSuiteLink>
                      ) : (
                        row.label
                      )}
                    </span>
                    {row.whyUpgrade ? (
                      <span className="membership-compare__why">{row.whyUpgrade}</span>
                    ) : null}
                  </th>
                  <td data-testid={row.id === "browse" ? `membership-compare-guides-free` : undefined}>
                    {row.cells.free}
                  </td>
                  <td data-testid={row.id === "browse" ? `membership-compare-guides-starter` : undefined}>
                    {row.cells.starter}
                  </td>
                  <td data-testid={row.id === "browse" ? `membership-compare-guides-pro` : undefined}>
                    {row.cells.pro}
                  </td>
                  <td data-testid={row.id === "browse" ? `membership-compare-guides-elite` : undefined}>
                    {row.cells.elite}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCollapse>

      <div className="membership-tier-grid" data-testid="membership-tier-grid">
        {membershipTiers.map((tier) => {
          const monthly = tierPriceMonthlyUsd(tier, audience);
          const yearly = tierPriceYearlyUsd(tier, audience);
          const guideCount = guideCountsByTier[tier.id];
          const benefits = numberedTierPerksWithAudienceGuideCount(
            tier.id,
            audience,
            guideCount,
          );
          const listYearly = yearlyListPriceUsd(monthly);
          const saveUsd = yearly != null ? yearlySavingsUsd(monthly, yearly) : 0;
          const equivMonthly = yearly != null ? equivalentMonthlyUsd(yearly) : 0;
          const showYearlyOption = showBillingToggle && tier.id !== "free" && yearly != null;
          const yearlyOn = showYearlyOption && billingPeriod === "yearly";
          return (
          <article
            key={tier.id}
            className={`glass membership-tier-card${tier.highlight ? " is-featured" : ""}${tier.id === "free" ? " is-free-start" : ""}${tier.id === SCHEDULE_SUITE_TIER ? " unlocks-schedule" : ""}${yearlyOn ? " is-yearly-billing" : ""}${upgradeFocusTier === tier.id ? " is-upgrade-focus" : ""}`}
            data-testid={`membership-tier-${tier.id}`}
          >
            <div className="membership-tier-card__top">
              <div className="membership-tier-title-row">
                <h3>{tier.id === "free" ? "Free — start here" : tier.name}</h3>
                <p
                  className={`membership-tier-price membership-tier-price--inline${
                    showYearlyOption ? " has-yearly" : ""
                  }${yearlyOn ? " is-yearly" : ""}`}
                >
                  {tier.id === "free" ? (
                    <strong>Free</strong>
                  ) : usesCredits ? (
                    <>
                      <strong>{membershipCreditPrice(tier.id, audience)}</strong>
                      <span className="membership-tier-price-unit"> credits/mo</span>
                    </>
                  ) : yearlyOn ? (
                    <>
                      <span className="membership-tier-rate-tag">Membership rate</span>
                      <strong data-testid={`membership-yearly-equiv-${tier.id}`}>
                        {formatUsd(equivMonthly)}
                      </strong>
                      <span className="membership-tier-price-unit">/mo</span>
                      <span className="membership-tier-price-sep" aria-hidden>
                        ·
                      </span>
                      <strong data-testid={`membership-yearly-price-${tier.id}`}>
                        {formatUsd(yearly)}
                      </strong>
                      <span className="membership-tier-price-unit">/yr</span>
                      <span
                        className="membership-tier-save"
                        data-testid={`membership-save-${tier.id}`}
                      >
                        Save {formatUsd(saveUsd)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="membership-tier-rate-tag">Membership rate</span>
                      <strong data-testid={`membership-monthly-price-${tier.id}`}>
                        {formatUsd(monthly)}
                      </strong>
                      <span className="membership-tier-price-unit">/mo</span>
                      {yearly != null ? (
                        <>
                          <span className="membership-tier-price-sep" aria-hidden>
                            ·
                          </span>
                          <strong data-testid={`membership-yearly-price-${tier.id}`}>
                            {formatUsd(yearly)}
                          </strong>
                          <span className="membership-tier-price-unit">/yr</span>
                        </>
                      ) : null}
                    </>
                  )}
                </p>
              </div>
              {showYearlyOption ? (
                <label
                  className={`membership-yearly-check membership-yearly-check--card${yearlyOn ? " is-on" : ""}`}
                  data-testid={
                    tier.id === "starter"
                      ? "membership-billing-toggle"
                      : `membership-billing-toggle-${tier.id}`
                  }
                >
                  <input
                    type="checkbox"
                    checked={billingPeriod === "yearly"}
                    onChange={(e) => setBillingPeriod(e.target.checked ? "yearly" : "monthly")}
                    data-testid={
                      tier.id === "starter"
                        ? "membership-billing-yearly"
                        : `membership-billing-yearly-${tier.id}`
                    }
                    aria-label={`Pay yearly for ${tier.name} and save ${formatUsd(saveUsd)}`}
                  />
                  <span className="membership-yearly-check__text">
                    Yearly
                    <em className="membership-yearly-check__save">
                      Save {formatUsd(saveUsd)}
                    </em>
                  </span>
                </label>
              ) : null}
              <div className="membership-tier-badges">
                {tier.id === "free" && (
                  <span className="glow-badge free" data-testid="membership-free-start-badge">
                    $0 forever · real value
                  </span>
                )}
                {tier.highlight && <span className="glow-badge amber">Most popular</span>}
                {tier.id === SCHEDULE_SUITE_TIER && (
                  <ScheduleSuiteLink
                    href="#gysh-schedule-suite"
                    className="glow-badge free membership-schedule-link"
                    testId="membership-tier-schedule-badge"
                  >
                    Unlocks schedule suite
                  </ScheduleSuiteLink>
                )}
                {tier.commitmentMonths && tier.commitmentMonths > 1 ? (
                  <span className="glow-badge amber" data-testid={`membership-commitment-${tier.id}`}>
                    {tier.commitmentMonths}-month commitment
                  </span>
                ) : null}
                {tier.oneOnOneMinutes ? (
                  <span className="glow-badge free" data-testid={`membership-session-${tier.id}`}>
                    {oneOnOneFeatureLabel(tier.id)}
                  </span>
                ) : null}
              </div>
              <p
                className="membership-tier-guide-count"
                data-testid={`membership-guide-count-${tier.id}`}
              >
                {membershipGuideCountLine(guideCount, audience)}
              </p>
              <p className="membership-tier-tagline">{tier.tagline}</p>
              {showYearlyOption &&
              audience === "senior" &&
              (tier.priceMonthlyUsd ?? 0) > monthly ? (
                <p className="membership-tier-or membership-tier-yearly-note">
                  {`Adult ${formatUsd(tier.priceMonthlyUsd ?? 0)}/mo or ${formatUsd(tier.priceYearlyUsd ?? listYearly)}/yr`}
                </p>
              ) : null}
              {!usesCredits && tier.id !== "free" && !yearlyOn ? (
                <p
                  className="membership-tier-or membership-tier-yearly-note"
                  data-testid={`membership-quarterly-note-${tier.id}`}
                >
                  {`Billed ${formatUsd(membershipQuarterlyUsd(monthly))} every 3 months`}
                </p>
              ) : null}
            </div>
            <TierBenefitsList tierId={tier.id} benefits={benefits} />
            <button
              type="button"
              className={`btn btn-primary${tier.id === "free" ? " membership-choose-free" : ""}${upgradeFocusTier === tier.id ? " is-upgrade-focus-btn" : ""}`}
              onClick={() => {
                saveJoinAudience(audience);
                onGoToJoin?.(tier.id === "free" ? "free" : tier.id, audience);
              }}
              disabled={isLoggedIn && (currentTier ?? "free") === tier.id}
              data-testid={`membership-choose-${tier.id}`}
            >
              {membershipPlanChooseLabel(tier.name, {
                tierId: tier.id,
                isLoggedIn,
                currentTier,
              })}
            </button>
          </article>
          );
        })}
      </div>
      </section>

      {showMilitaryCallout && (
        <aside
          className="glass membership-military-callout"
          data-testid="membership-military-veteran"
          aria-label={MILITARY_VETERAN_CALLOUT.badge}
        >
          <div className="membership-military-callout__badge">
            <Shield size={15} aria-hidden />
            <span className="glow-badge free">{MILITARY_VETERAN_CALLOUT.badge}</span>
            <span className="glow-badge amber">Veterans save even more</span>
          </div>
          <div>
            <h3>{MILITARY_VETERAN_CALLOUT.title}</h3>
            <p>{MILITARY_VETERAN_CALLOUT.body}</p>
          </div>
        </aside>
      )}

      <PageCollapse
        testId="membership-credit-packs"
        className="membership-credit-packs membership-price-list"
        title={
          <>
            Parent-funded Kid Credit packs
            {cartCount > 0 ? (
              <span className="membership-alacarte-cart-badge" data-testid="membership-credit-packs-cart-count">
                {cartCount} in cart
              </span>
            ) : null}
          </>
        }
        icon={<Coins size={18} aria-hidden />}
      >
        <p className="membership-price-list__lead">
          Optional top-ups when monthly Kid Credits aren’t enough. Add a pack to the same cart as a la
          carte, then check out with Stripe.
        </p>
        {cartCount > 0 ? (
          <div className="membership-alacarte-cart-jump" data-testid="membership-credit-packs-cart-jump">
            <button type="button" className="btn btn-primary" onClick={scrollToCart}>
              <ShoppingCart size={16} aria-hidden /> Go to cart · {formatUsd(cartTotal)} ({cartCount})
            </button>
          </div>
        ) : null}
        <div className="membership-price-table-wrap">
          <table className="membership-price-table membership-price-table--compact membership-price-table--stack">
            <thead>
              <tr>
                <th>Pack</th>
                <th>Cost</th>
                <th>Cart</th>
              </tr>
            </thead>
            <tbody>
              {CREDIT_PACKS.map((pack) => {
                const inCartQty = displayCart.lines.find((l) => l.itemId === pack.id)?.quantity ?? 0;
                const stripeReady = supportsAlaCarteStripeCheckout(pack.id);
                const justAdded = justAddedId === pack.id;
                return (
                  <tr
                    key={pack.id}
                    className={pack.popular ? "is-popular" : undefined}
                    data-testid={`membership-credit-pack-${pack.id}`}
                  >
                    <td className="membership-price-cell membership-price-cell--name">
                      <strong>{formatCreditPackListingName(pack)}</strong>
                      {pack.popular ? <span className="glow-badge amber">Most popular</span> : null}
                    </td>
                    <td className="membership-price-cell membership-price-cell--meta">
                      {formatCreditPackCost(pack)}
                    </td>
                    <td className="membership-price-cell membership-price-cell--action">
                      <button
                        type="button"
                        className="btn btn-outline membership-alacarte-add"
                        data-testid={`membership-credit-pack-add-${pack.id}`}
                        disabled={!stripeReady}
                        title={
                          !isLoggedIn
                            ? `${LOGIN_BUTTON_LABEL} to add ${pack.name} to cart`
                            : stripeReady
                              ? `Add ${pack.name} to cart`
                              : "Stripe checkout not configured for this pack yet"
                        }
                        onClick={() => handleAddToCart(pack.id)}
                      >
                        {justAdded
                          ? "Added"
                          : inCartQty > 0
                            ? `Add again (${inCartQty})`
                            : "Add to cart"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <small>
          Parent or guardian approval required. Credits have no cash value and cannot be transferred
          or withdrawn.
        </small>
      </PageCollapse>

      <PageCollapse
        testId="membership-alacarte"
        className="membership-alacarte membership-price-list"
        defaultOpen
        detailsRef={alacarteDetailsRef}
        icon={<ShoppingCart size={18} aria-hidden />}
        title={
          <>
            A la carte — {AUDIENCE_LABELS[audience]}
            {cartCount > 0 ? (
              <span className="membership-alacarte-cart-badge" data-testid="membership-alacarte-cart-count">
                {cartCount} in cart
              </span>
            ) : null}
          </>
        }
      >
        <p className="membership-price-list__lead">
          Single sessions and extras. Add to cart, then apply credits on the item (1 credit = $1).
        </p>
        <div
          id="gysh-alacarte-cart"
          className="membership-alacarte-cart"
          data-testid="membership-alacarte-cart"
          ref={cartPanelRef}
          tabIndex={-1}
        >
          <div
            className="membership-alacarte-cart-heading membership-alacarte-cart-heading--standout"
            data-testid="membership-alacarte-cart-heading"
          >
            <h4>
              <ShoppingCart size={20} aria-hidden /> Your Cart
            </h4>
            <p className="membership-alacarte-cart-dash-links">
              <ScheduleSuiteLink
                href={BILLING_DASHBOARD_HREF}
                onOpen={onOpenBilling}
                testId="membership-alacarte-cart-billing-link"
                className="membership-alacarte-cart-dash-link"
              >
                Billing
              </ScheduleSuiteLink>
              <span>and</span>
              <ScheduleSuiteLink
                href={CREDITS_DASHBOARD_HREF}
                onOpen={onOpenCredits}
                testId="membership-alacarte-cart-credits-link"
                className="membership-alacarte-cart-dash-link"
              >
                Credits
              </ScheduleSuiteLink>
            </p>
            {cartCount > 0 ? (
              <button
                type="button"
                className="btn btn-outline membership-alacarte-cart-clear-top"
                data-testid="membership-alacarte-cart-clear-top"
                disabled={cartBusy}
                onClick={() => {
                  setCart(clearAlaCarteCart());
                  setCartError("");
                }}
              >
                <Trash2 size={14} aria-hidden /> Clear cart
              </button>
            ) : null}
          </div>
          {cartLines.length === 0 ? (
            <>
            <CreditApplyControls
              quote={mixedQuote}
              signedIn={isLoggedIn}
              loading={creditsLoading}
              cartItemCount={cartCount}
              showApplyInputs={false}
              onSignIn={onGoToLogin}
              onCreditsChange={() => {}}
            />
            <div className="membership-alacarte-cart-empty" data-testid="membership-alacarte-cart-empty">
              <p>
                {isLoggedIn
                  ? "Cart is empty. Add a workshop or 1-on-1 from the list below, then apply credits on that line."
                  : `${LOGIN_BUTTON_LABEL} to add items to your cart.`}
              </p>
            </div>
            </>
          ) : (
            <form className="membership-alacarte-cart-form" onSubmit={handleCartCheckout}>
              <ul className="membership-alacarte-cart-lines">
                {cartLines.map(({ item, quantity, lineTotalUsd }) => {
                  const mixedLine = mixedCartLines.find((row) => row.itemId === item.id);
                  const need = mixedLine ? lineCreditNeed(mixedLine) : 0;
                  const applied = lineCredits[item.id] ?? 0;
                  return (
                  <li key={item.id} data-testid={`membership-alacarte-cart-line-${item.id}`}>
                    <div className="membership-alacarte-cart-line-main">
                      <strong>{item.name}</strong>
                      <span>
                        {formatUsd(lineTotalUsd)}
                        {item.kind !== "credit_pack" && item.credits
                          ? ` or ${item.credits * quantity} credit${item.credits * quantity === 1 ? "" : "s"}`
                          : ""}
                      </span>
                    </div>
                    <div className="membership-alacarte-cart-line-actions">
                      <label>
                        Qty
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={quantity}
                          aria-label={`Quantity for ${item.name}`}
                          data-testid={`membership-alacarte-qty-${item.id}`}
                          onChange={(e) => {
                            setCart(setAlaCarteCartQuantity(item.id, Number(e.target.value)));
                            setCartError("");
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-ghost membership-alacarte-remove"
                        data-testid={`membership-alacarte-remove-${item.id}`}
                        aria-label={`Remove ${item.name}`}
                        onClick={() => {
                          setCart(removeAlaCarteFromCart(item.id));
                          setCreditsByItem((prev) => {
                            const next = { ...prev };
                            delete next[item.id];
                            return next;
                          });
                          setCartError("");
                        }}
                      >
                        <Trash2 size={14} aria-hidden /> Remove
                      </button>
                    </div>
                    {isLoggedIn && !creditsLoading && creditBalance > 0 && need > 0 ? (
                      <CartLineCreditApply
                        itemId={item.id}
                        itemName={item.name}
                        need={need}
                        applied={applied}
                        max={maxCreditsForLine(mixedCartLines, creditBalance, creditsByItem, item.id)}
                        remainingAfter={Math.max(0, creditBalance - mixedQuote.creditsApplied)}
                        lineDueUsd={centsToUsd(Math.max(0, usdToCents(lineTotalUsd) - applied * 100))}
                        onChange={(credits) => {
                          creditsEdited.current = true;
                          setCreditsByItem((prev) => ({ ...prev, [item.id]: credits }));
                        }}
                      />
                    ) : null}
                  </li>
                  );
                })}
              </ul>
              <div className="membership-alacarte-cart-total" data-testid="membership-alacarte-cart-total">
                <span>Subtotal</span>
                <strong>{formatUsd(cartTotal)}</strong>
              </div>
              {mixedQuote.creditsApplied > 0 ? (
                <div className="membership-alacarte-cart-total membership-alacarte-cart-due" data-testid="membership-alacarte-cart-due">
                  <span>
                    After {mixedQuote.creditsApplied} credit{mixedQuote.creditsApplied === 1 ? "" : "s"}
                  </span>
                  <strong>{formatUsd(mixedQuote.cashDueUsd)}</strong>
                </div>
              ) : null}
              <label className="membership-alacarte-cart-email">
                Email for confirmation
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={cartEmail}
                  data-testid="membership-alacarte-cart-email"
                  placeholder="you@example.com"
                  onChange={(e) => setCartEmail(e.target.value)}
                />
              </label>
              {creditPaidThanks != null ? (
                <div ref={thankYouRef}>
                  <CreditPaidThankYou
                    creditsApplied={creditPaidThanks}
                    onOpenDashboard={onOpenDashboard}
                    onOpenCredits={onOpenCredits}
                    onOpenBilling={onOpenBilling}
                    onOpenBlueprints={onOpenBlueprints}
                  />
                </div>
              ) : cartPaid ? (
                <p className="membership-alacarte-cart-paid" role="status" data-testid="membership-alacarte-cart-paid">
                  {cartPaid}
                </p>
              ) : null}
              {cartError ? (
                <p className="membership-alacarte-cart-error" role="alert" data-testid="membership-alacarte-cart-error">
                  {cartError}
                </p>
              ) : null}
              <CreditApplyControls
                quote={mixedQuote}
                signedIn={isLoggedIn}
                loading={creditsLoading}
                cartItemCount={cartCount}
                showApplyInputs
                panelId="gysh-pay-with-credits-checkout"
                onSignIn={onGoToLogin}
                onCreditsChange={(n) => {
                  creditsEdited.current = true;
                  setCreditsByItem(creditsByItemFromTotal(mixedCartLines, creditBalance, n));
                }}
              />
              <div className="membership-alacarte-cart-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  data-testid="membership-alacarte-cart-clear"
                  disabled={cartBusy}
                  onClick={() => {
                    setCart(clearAlaCarteCart());
                    setCartError("");
                  }}
                >
                  Clear cart
                </button>
                {isLoggedIn &&
                offerStripeBesideCredits(mixedQuote) &&
                mixedQuote.creditsApplied > 0 ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    data-testid="membership-alacarte-cart-pay-credits"
                    disabled={cartBusy || creditsLoading}
                    onClick={() => void runCartCheckout(mixedQuote.creditsApplied)}
                  >
                    {cartBusy && cartPayVia === "credits" ? (
                      <WaitLabel>
                        {mixedQuote.cashDueCents <= 0 ? "Applying credits…" : "Opening Stripe…"}
                      </WaitLabel>
                    ) : (
                      <>
                        <Coins size={16} aria-hidden />
                        {mixedCheckoutButtonLabel(mixedQuote)}
                      </>
                    )}
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="btn btn-primary"
                  data-testid="membership-alacarte-cart-checkout"
                  disabled={cartBusy || creditsLoading || !cartStripeReady}
                >
                  {cartBusy && cartPayVia !== "credits" ? (
                    <WaitLabel>Opening Stripe…</WaitLabel>
                  ) : creditsLoading ? (
                    <WaitLabel>Loading credits…</WaitLabel>
                  ) : (
                    <>
                      <CreditCard size={16} aria-hidden />{" "}
                      {payWithStripeButtonLabel(formatUsd(mixedQuote.subtotalUsd || cartTotal))}
                    </>
                  )}
                </button>
              </div>
              <p className="membership-alacarte-cart-note">
                {offerStripeBesideCredits(mixedQuote)
                  ? `Pay with credits, or pay ${formatUsd(mixedQuote.subtotalUsd || cartTotal)} with Stripe. `
                  : "Pay the dollar total with Stripe, or sign in to pay with credits. "}
                We’ll email a GYSH confirmation after checkout.
              </p>
            </form>
          )}
        </div>
        <div className="membership-price-table-wrap">
          <table className="membership-price-table membership-price-table--compact membership-price-table--stack">
            <thead>
              <tr>
                <th>Service</th>
                <th>Cost</th>
                <th>Cart</th>
              </tr>
            </thead>
            <tbody>
              {alaCarte.map((item) => {
                const inCartQty = displayCart.lines.find((l) => l.itemId === item.id)?.quantity ?? 0;
                const stripeReady = supportsAlaCarteStripeCheckout(item.id);
                const justAdded = justAddedId === item.id;
                return (
                  <tr key={item.id} data-testid={`membership-alacarte-row-${item.id}`}>
                    <td className="membership-price-cell membership-price-cell--name">
                      <strong>{item.name}</strong>
                      <span className="membership-price-detail">{item.detail}</span>
                    </td>
                    <td className="membership-price-cell membership-price-cell--meta">
                      {formatAlaCarteDetails(item)}
                    </td>
                    <td className="membership-price-cell membership-price-cell--action">
                      <button
                        type="button"
                        className="btn btn-outline membership-alacarte-add"
                        data-testid={`membership-alacarte-add-${item.id}`}
                        disabled={!stripeReady}
                        title={
                          !isLoggedIn
                            ? `${LOGIN_BUTTON_LABEL} to add ${item.name} to cart`
                            : stripeReady
                              ? `Add ${item.name} to cart`
                              : "Stripe checkout not configured for this item yet"
                        }
                        onClick={() => handleAddToCart(item.id)}
                      >
                        {justAdded
                          ? "Added"
                          : inCartQty > 0
                            ? `Add again (${inCartQty})`
                            : "Add to cart"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <PageCollapse
          id="gysh-schedule-suite"
          testId="membership-schedule-suite"
          className="membership-schedule-callout membership-schedule-callout--compact membership-collapse--standout"
          title="Hustle Schedule Suite"
          icon={<CalendarDays size={18} aria-hidden />}
        >
          <p>
            Starting at <strong>Pro</strong>, open{" "}
            <ScheduleSuiteLink
              href={SCHEDULE_SUITE_DASHBOARD_HREF}
              onOpen={onOpenScheduleSuite}
              testId="membership-schedule-suite-dashboard-link"
            >
              My Dashboard → Schedule Suite
            </ScheduleSuiteLink>{" "}
            for a weekly Blueprint plan, tracker, P&amp;L, and email reminders. Free and Starter see it
            locked with an upgrade path.
          </p>
          <ul className="membership-schedule-options">
            {SCHEDULE_SUITE_FEATURE_IDS.map((id) => {
              const f = MEMBERSHIP_FEATURES.find((x) => x.id === id);
              return f ? (
                <li key={id}>
                  <BadgeCheck size={14} aria-hidden /> {f.label}
                </li>
              ) : null;
            })}
          </ul>
        </PageCollapse>
      </PageCollapse>

      <PageCollapse
        testId="membership-credits"
        className="membership-credits membership-price-list"
        title={
          audience === "kids" || audience === "junior"
            ? `Ways to earn Kid Credits — ${AUDIENCE_LABELS[audience]}`
            : `Ways to Earn Credits — ${AUDIENCE_LABELS[audience]}`
        }
        icon={<Sparkles size={18} aria-hidden />}
      >
        <p className="membership-price-list__lead">
          All credits are the same — 1 credit = $1. Referral link lives on the member dashboard.
        </p>
        <div className="membership-credits-grid membership-credits-grid--compact">
          {earnActions.map((a) => (
            <article key={a.id} className="membership-credit-card" data-testid={`membership-earn-${a.id}`}>
              <strong>{formatEarnCreditDelta(a.credits)}</strong>
              <span>{a.label}</span>
            </article>
          ))}
        </div>
      </PageCollapse>
    </div>
  );
}

export type { TierId };
