import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  ChartColumnIncreasing,
  Coins,
  Crown,
  LayoutDashboard,
  Link2,
  Shield,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  ALA_CARTE_PRICE_LIST,
  AUDIENCE_LABELS,
  CREDIT_EARN_ACTIONS,
  CREDIT_PACKS,
  MEMBERSHIP_FEATURES,
  MEMBERSHIP_TIERS,
  MILITARY_VETERAN_CALLOUT,
  SCHEDULE_SUITE_FEATURE_IDS,
  SCHEDULE_SUITE_TIER,
  numberedTierPerks,
  oneOnOneFeatureLabel,
  formatUsd,
  tierPriceMonthlyUsd,
  tierPriceYearlyUsd,
  KID_TO_ADULT_CREDIT_RATIO,
  type AudienceGroup,
  type NumberedTierPerk,
  type TierId,
} from "../lib/membership";
import {
  normalizeAudienceGroup,
  readSavedJoinAudience,
  saveJoinAudience,
} from "../lib/join-audience";
import membershipHero from "../assets/membership-hero.png";

function TierBenefitsList({
  tierId,
  benefits,
}: {
  tierId: TierId;
  benefits: NumberedTierPerk[];
}) {
  return (
    <div className="membership-tier-benefits" data-testid={`membership-benefits-${tierId}`}>
      <ol className="membership-tier-features" start={1}>
        {benefits.map((b) => (
          <li key={`perk-${b.n}-${b.title}`}>
            <BadgeCheck size={14} className="membership-check" aria-hidden />
            <span>
              <strong>{b.numberedTitle}</strong>
              {b.detail ? <em className="membership-benefit-detail">{b.detail}</em> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

type MembershipPageProps = {
  /** Open membership sign-up; optional tier from a plan card (free / starter / pro / elite). */
  onGoToJoin?: (tier?: TierId) => void;
  onGoToLogin?: () => void;
  onOpenFreeGuides?: () => void;
  /** Pre-select membership lane from the page that linked here (kids / teens / adult / senior). */
  initialAudience?: AudienceGroup | null;
};

const AUDIENCE_TABS: AudienceGroup[] = ["kids", "junior", "adult", "senior"];

export function MembershipPage({
  onGoToJoin,
  onGoToLogin,
  onOpenFreeGuides,
  initialAudience = null,
}: MembershipPageProps) {
  const [audience, setAudience] = useState<AudienceGroup>(() =>
    normalizeAudienceGroup(initialAudience, readSavedJoinAudience("adult")),
  );
  const [highlightAudience, setHighlightAudience] = useState(Boolean(initialAudience));
  const audienceTabsRef = useRef<HTMLDivElement>(null);
  const membershipPlansRef = useRef<HTMLElement>(null);
  const usesCredits = audience === "kids" || audience === "junior";
  const showKidCreditPool = audience === "adult" || audience === "senior";
  const showMilitaryCallout = audience === "adult" || audience === "senior";
  const earnActions = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes(audience));
  const alaCarte = ALA_CARTE_PRICE_LIST.filter((i) => i.audiences.includes(audience));

  const scrollToMemberships = () => {
    const el = membershipPlansRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.focus({ preventScroll: true });
    setHighlightAudience(true);
  };

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

  const selectAudience = (next: AudienceGroup) => {
    setAudience(next);
    saveJoinAudience(next);
    setHighlightAudience(true);
  };

  const audienceLabel = AUDIENCE_LABELS[audience];
  const seeMembershipsLabel = `See Memberships — ${audienceLabel} pricing`;
  const seeMembershipsHint = `Scrolls to Free–Elite pricing for ${audienceLabel}. Switch the lane below anytime.`;

  return (
    <div className="membership-page" data-testid="membership-page">
      <section className="membership-hero" aria-label="Join GYSH membership">
        <div className="membership-hero-media">
          <img
            src={membershipHero}
            alt="Join the GYSH Community — together we learn, grow, and succeed. A place for every age: kids, teens, adults, and seniors."
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="glass membership-hero-copy">
          <div className="membership-hero-intro">
            <span className="glow-badge free">
              <Crown size={13} /> Membership
            </span>
            <h2 className="membership-hero-heading">
              Your Side Hustle deserves a real plan
              <span className="membership-hero-heading-aside">(FREE TO START)</span>
            </h2>
            <p data-testid="membership-lead">
              GYSH membership turns “I should try this” into a weekly rhythm — age-appropriate Match Wizard
              matches, member guides, consulting time, and (on Pro+) a hustle schedule with tracker,
              progress reports, and email nudges. Start free, then pick the lane that fits your life.
            </p>
            <p className="membership-hero-dashboard-note" data-testid="membership-hero-dashboard-note">
              Members get a <strong>Member Dashboard</strong> (My Dashboard) to track progress, grab
              workshop seats, and share a personal <strong>referral link</strong> that earns Kid Credits
              when friends join.
            </p>
            <div className="membership-hero-actions">
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
              {onGoToJoin && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onGoToJoin("free")}
                  style={{ gap: 6 }}
                  data-testid="membership-hero-join"
                >
                  <UserPlus size={16} /> Create account / Join
                </button>
              )}
              {onOpenFreeGuides && (
                <button type="button" className="btn btn-outline" onClick={onOpenFreeGuides}>
                  Browse free guides
                </button>
              )}
              {onGoToLogin && (
                <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                  Sign in
                </button>
              )}
            </div>
            <p id="membership-see-plans-hint" className="membership-see-plans-hint" data-testid="membership-see-plans-hint">
              {seeMembershipsHint}
            </p>
          </div>
          <ul className="membership-hero-pillars">
            <li>
              <BadgeCheck size={16} aria-hidden />
              <span>Free forever to explore guides — upgrade when you’re ready to launch</span>
            </li>
            <li>
              <LayoutDashboard size={16} aria-hidden />
              <span>Member Dashboard keeps your hustle, credits, and checklist in one place</span>
            </li>
            <li>
              <Link2 size={16} aria-hidden />
              <span>Referral link on your dashboard — friends join, you earn Kid Credits</span>
            </li>
            <li>
              <Sparkles size={16} aria-hidden />
              <span>Paid plans add 1-on-1 consulting; Pro+ unlocks the schedule suite</span>
            </li>
          </ul>
        </div>
      </section>

      <section
        id="gysh-membership-plans"
        ref={membershipPlansRef}
        tabIndex={-1}
        className="membership-plans-section"
        aria-labelledby="membership-audience-heading"
        data-testid="membership-plans"
      >
      <div
        ref={audienceTabsRef}
        className={`membership-audience-tabs${highlightAudience ? " is-spotlight" : ""}`}
        role="tablist"
        aria-label="Membership audience"
        data-testid="membership-audience-tabs"
      >
        <p className="membership-audience-tabs__label" id="membership-audience-heading">
          Membership for: <strong>{audienceLabel}</strong>
        </p>
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

      <p className="membership-credit-note glass" data-testid="membership-kid-credit-pool-note">
        <Coins size={16} aria-hidden />{" "}
        <strong>Seniors save on every paid plan</strong> (Starter $34 · Pro $57 · Elite $94 / mo vs Adult $39 ·
        $69 · $119). <strong>Every paid package includes monthly Kid Credits</strong> — usable by kids{" "}
        <em>or</em> adults toward workshops and 1-on-1s. Adult redemptions run at half value:{" "}
        <strong>
          {KID_TO_ADULT_CREDIT_RATIO} Kid Credits = 1 adult credit
        </strong>
        . Earn more with referrals and the dashboard checklist below.
      </p>

      {usesCredits && (
        <p className="membership-credit-note glass">
          <Coins size={16} aria-hidden /> Kids and Teens can also spend parent-funded packs — or earn Kid
          Credits by learning, launching, and sharing your referral link.
        </p>
      )}

      <div className="membership-tier-grid" data-testid="membership-tier-grid">
        {MEMBERSHIP_TIERS.map((tier) => {
          const monthly = tierPriceMonthlyUsd(tier, audience);
          const yearly = tierPriceYearlyUsd(tier, audience);
          const benefits = numberedTierPerks(tier.id, audience);
          return (
          <article
            key={tier.id}
            className={`glass membership-tier-card${tier.highlight ? " is-featured" : ""}${tier.id === "free" ? " is-free-start" : ""}${tier.id === SCHEDULE_SUITE_TIER ? " unlocks-schedule" : ""}`}
            data-testid={`membership-tier-${tier.id}`}
          >
            <div className="membership-tier-card__top">
              <h3>{tier.id === "free" ? "Free — start here" : tier.name}</h3>
              <div className="membership-tier-badges">
                {tier.id === "free" && (
                  <span className="glow-badge free" data-testid="membership-free-start-badge">
                    $0 forever · real value
                  </span>
                )}
                {tier.highlight && <span className="glow-badge amber">Most popular</span>}
                {tier.id === SCHEDULE_SUITE_TIER && (
                  <span className="glow-badge free">Unlocks schedule suite</span>
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
              <p className="membership-tier-tagline">{tier.tagline}</p>
              <p className="membership-tier-price">
                {tier.id === "free" ? (
                  <>
                    <strong>Free</strong>
                    <span className="membership-tier-or">no card · upgrade when ready</span>
                  </>
                ) : usesCredits ? (
                  <>
                    <strong>{tier.creditsPerMonth ?? 0}</strong> credits / mo
                    <span className="membership-tier-or">or parent top-up</span>
                  </>
                ) : (
                  <>
                    <strong>{formatUsd(monthly)}</strong>
                    / mo
                    {yearly ? (
                      <span className="membership-tier-or">
                        or {formatUsd(yearly)} / yr
                      </span>
                    ) : null}
                    {audience === "senior" && (tier.priceMonthlyUsd ?? 0) > monthly ? (
                      <span className="membership-tier-or">
                        Adult price {formatUsd(tier.priceMonthlyUsd ?? 0)} / mo
                      </span>
                    ) : null}
                  </>
                )}
              </p>
            </div>
            <TierBenefitsList tierId={tier.id} benefits={benefits} />
            <button
              type="button"
              className={`btn btn-primary${tier.id === "free" ? " membership-choose-free" : ""}`}
              onClick={() => {
                if (tier.id === "free") {
                  onGoToJoin?.("free");
                  return;
                }
                onGoToJoin?.(tier.id);
              }}
              data-testid={`membership-choose-${tier.id}`}
            >
              {tier.id === "free" ? "Start Free" : `Choose ${tier.name}`}
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

      <section className="glass membership-schedule-callout" data-testid="membership-schedule-suite">
        <div className="membership-schedule-icons" aria-hidden>
          <CalendarDays size={22} />
          <ChartColumnIncreasing size={22} />
          <Bell size={22} />
        </div>
        <div>
          <h3>Proposed hustle schedule suite</h3>
          <p>
            Starting at <strong>Pro</strong>, members unlock a personalized weekly schedule from
            their Get Your Side Hustle matches, a live hustle tracker, progress reports, and email
            notifications for milestones and workshop seats. Every paid plan includes consulting
            (Starter: one 1-hour session; Pro: three 60-minute sessions; Elite: three 90-minute
            sessions) with a 3-month commitment. Elite also adds the ZIP best-times scout for
            rideshare &amp; delivery.
          </p>
          <ul className="membership-schedule-list">
            {SCHEDULE_SUITE_FEATURE_IDS.map((id) => {
              const f = MEMBERSHIP_FEATURES.find((x) => x.id === id);
              return f ? (
                <li key={id}>
                  <BadgeCheck size={14} aria-hidden /> <strong>{f.label}</strong> — {f.detail}
                </li>
              ) : null;
            })}
          </ul>
        </div>
      </section>

      {usesCredits && (
        <section className="glass membership-credit-packs" data-testid="membership-credit-packs">
          <h3>
            <Coins size={18} /> Parent-funded credit packs
          </h3>
          <p>
            Parents and guardians can add Kid Credits anytime. Members can also earn credits below,
            so purchasing a pack is always optional.
          </p>
          <div className="membership-credit-pack-grid">
            {CREDIT_PACKS.map((pack) => (
              <article
                key={pack.id}
                className={`membership-credit-pack-card${pack.popular ? " is-popular" : ""}`}
                data-testid={`membership-credit-pack-${pack.id}`}
              >
                {pack.popular && <span className="glow-badge amber">Most popular</span>}
                <h4>{pack.name}</h4>
                <strong>{pack.credits} Kid Credits</strong>
                <span>{formatUsd(pack.priceUsd)}</span>
                <p>{pack.detail}</p>
              </article>
            ))}
          </div>
          <small>
            Credit purchases require parent or guardian approval. Credits have no cash value and
            cannot be transferred or withdrawn.
          </small>
        </section>
      )}

      <section className="glass membership-credits" data-testid="membership-credits">
        <h3>
          <Sparkles size={18} /> Ways to earn Kid Credits — {AUDIENCE_LABELS[audience]}
        </h3>
        <p>
          Use Kid Credits for workshops and 1-on-1s (kids or adults). Adult redemptions spend at half
          rate ({KID_TO_ADULT_CREDIT_RATIO} Kid Credits = 1 adult credit). Your personal referral link
          lives on the member dashboard.
        </p>
        <div className="membership-credits-grid">
          {earnActions.map((a) => (
            <article key={a.id} className="membership-credit-card" data-testid={`membership-earn-${a.id}`}>
              <strong>+{a.credits}</strong>
              <span>{a.label}</span>
              <p>{a.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass membership-alacarte" data-testid="membership-alacarte">
        <h3>A la carte price list — {AUDIENCE_LABELS[audience]}</h3>
        <p>
          Buy single sessions anytime. Items marked included are covered by the listed membership
          tier.
        </p>
        <div className="membership-price-table-wrap">
          <table className="membership-price-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Price</th>
                {(usesCredits || showKidCreditPool) && <th>Kid credits</th>}
                {(usesCredits || showKidCreditPool) && <th>Adult credits</th>}
                <th>Included in</th>
              </tr>
            </thead>
            <tbody>
              {alaCarte.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <span className="membership-price-detail">{item.detail}</span>
                  </td>
                  <td>{formatUsd(item.priceUsd)}</td>
                  {(usesCredits || showKidCreditPool) && (
                    <td>{item.credits ?? "—"}</td>
                  )}
                  {(usesCredits || showKidCreditPool) && (
                    <td>
                      {item.credits
                        ? Math.floor(item.credits / KID_TO_ADULT_CREDIT_RATIO)
                        : "—"}
                    </td>
                  )}
                  <td>
                    {item.includedIn?.length
                      ? item.includedIn.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export type { TierId };
