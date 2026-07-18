import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  ChartColumnIncreasing,
  ChevronDown,
  ChevronRight,
  Coins,
  Crown,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  ALA_CARTE_PRICE_LIST,
  AUDIENCE_LABELS,
  CREDIT_EARN_ACTIONS,
  CREDIT_PACKS,
  MEMBER_PERK_AUDIENCE_LABELS,
  MEMBER_PERKS_BY_TIER,
  MEMBERSHIP_FEATURES,
  MEMBERSHIP_TIERS,
  SCHEDULE_SUITE_FEATURE_IDS,
  SCHEDULE_SUITE_TIER,
  kidCreditsFeatureLabel,
  oneOnOneFeatureLabel,
  formatUsd,
  tierPriceMonthlyUsd,
  tierPriceYearlyUsd,
  KID_TO_ADULT_CREDIT_RATIO,
  type AudienceGroup,
  type MemberPerkAudience,
  type TierId,
} from "../lib/membership";
import {
  normalizeAudienceGroup,
  readSavedJoinAudience,
  saveJoinAudience,
} from "../lib/join-audience";
import membershipHero from "../assets/membership-hero.png";

const PERK_AUDIENCES: MemberPerkAudience[] = ["adult", "kids", "junior", "senior"];

function TierMemberPerks({ tierId }: { tierId: TierId }) {
  const [open, setOpen] = useState(false);
  const [openAudience, setOpenAudience] = useState<MemberPerkAudience | null>("kids");
  const perks = MEMBER_PERKS_BY_TIER[tierId];

  return (
    <div className="membership-member-perks" data-testid={`membership-perks-${tierId}`}>
      <button
        type="button"
        className="membership-member-perks-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
        Member Perks
        <span className="membership-member-perks-hint">Adult · Kids · Teens · Senior</span>
      </button>
      {open && (
        <div className="membership-member-perks-body">
          {PERK_AUDIENCES.map((aud) => {
            const items = perks[aud];
            const isOpen = openAudience === aud;
            return (
              <div key={aud} className="membership-perk-audience">
                <button
                  type="button"
                  className="membership-perk-audience-toggle"
                  aria-expanded={isOpen}
                  data-testid={`membership-perks-${tierId}-${aud}`}
                  onClick={() => setOpenAudience((cur) => (cur === aud ? null : aud))}
                >
                  {isOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
                  {MEMBER_PERK_AUDIENCE_LABELS[aud]}
                </button>
                {isOpen && (
                  <ul className="membership-perk-list">
                    {items.map((item) => (
                      <li key={item.title}>
                        <BadgeCheck size={13} aria-hidden />
                        <span>
                          <strong>{item.title}</strong>
                          <em>{item.detail}</em>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  const usesCredits = audience === "kids" || audience === "junior";
  const showKidCreditPool = audience === "adult" || audience === "senior";
  const earnActions = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes(audience));
  const alaCarte = ALA_CARTE_PRICE_LIST.filter((i) => i.audiences.includes(audience));

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
    const el = audienceTabsRef.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const t = window.setTimeout(() => setHighlightAudience(false), 2800);
    return () => window.clearTimeout(t);
  }, [highlightAudience, audience]);

  const selectAudience = (next: AudienceGroup) => {
    setAudience(next);
    saveJoinAudience(next);
    setHighlightAudience(true);
  };

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
              Join GYSH!
              <span className="membership-hero-heading-aside">(FREE PLANS AVAILABLE)</span>
            </h2>
            <p data-testid="membership-lead">
              Start free with open guides — upgrade for schedules, trackers, progress reports, email
              alerts, training, and monthly 1-on-1 consulting (30 / 60 / 90 min by plan).
            </p>
            <div className="membership-hero-actions">
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
              {onGoToJoin && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onGoToJoin("free")}
                  style={{ gap: 6 }}
                  data-testid="membership-hero-join"
                >
                  <UserPlus size={16} /> Create account / Join
                </button>
              )}
            </div>
          </div>
          <ul className="membership-hero-pillars">
            <li>
              <BadgeCheck size={16} aria-hidden />
              <span>Free plan to browse guides &amp; save progress</span>
            </li>
            <li>
              <CalendarDays size={16} aria-hidden />
              <span>Pro+ schedule suite, tracker &amp; email alerts</span>
            </li>
            <li>
              <Sparkles size={16} aria-hidden />
              <span>Monthly 1-on-1 consulting on paid plans</span>
            </li>
            <li>
              <Coins size={16} aria-hidden />
              <span>Same consulting rates for Kids, Teens, Adults &amp; Seniors</span>
            </li>
          </ul>
        </div>
      </section>

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
            notifications for milestones and workshop seats. Every paid plan includes a monthly
            1-on-1 consulting session (Starter 30 min with a 3-month commitment, Pro 60 min, Elite
            90 min). Elite also adds the ZIP best-times scout for rideshare &amp; delivery.
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

      <div
        ref={audienceTabsRef}
        className={`membership-audience-tabs${highlightAudience ? " is-spotlight" : ""}`}
        role="tablist"
        aria-label="Membership audience"
        data-testid="membership-audience-tabs"
      >
        <p className="membership-audience-tabs__label" id="membership-audience-heading">
          Membership for: <strong>{AUDIENCE_LABELS[audience]}</strong>
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

      {usesCredits && (
        <p className="membership-credit-note glass">
          <Coins size={16} aria-hidden /> Kids and Teens pay with <strong>GYSH credits</strong>{" "}
          parents can fund — or kids earn by quizzes, launches, and milestones below.
        </p>
      )}

      {showKidCreditPool && (
        <p className="membership-credit-note glass" data-testid="membership-kid-credit-pool-note">
          <Coins size={16} aria-hidden /> Adult &amp; Senior plans include a monthly <strong>kid-credit</strong>{" "}
          pool for family activities. The same pool can pay for adult consulting at half rate —{" "}
          <strong>{KID_TO_ADULT_CREDIT_RATIO} kid credits = 1 adult credit</strong>.
        </p>
      )}

      {audience === "senior" && (
        <p className="membership-credit-note glass" data-testid="membership-senior-pricing-note">
          <Crown size={16} aria-hidden /> <strong>Senior pricing:</strong> 55+ members pay less than Adult
          plans — Starter $14, Pro $37, Elite $74 / mo (vs $19 / $49 / $99 for Adults).
        </p>
      )}

      <div className="membership-tier-grid" data-testid="membership-tier-grid">
        {MEMBERSHIP_TIERS.map((tier) => {
          const monthly = tierPriceMonthlyUsd(tier, audience);
          const yearly = tierPriceYearlyUsd(tier, audience);
          return (
          <article
            key={tier.id}
            className={`glass membership-tier-card${tier.highlight ? " is-featured" : ""}${tier.id === SCHEDULE_SUITE_TIER ? " unlocks-schedule" : ""}`}
            data-testid={`membership-tier-${tier.id}`}
          >
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
                1× {tier.oneOnOneMinutes}-min 1-on-1 / mo
              </span>
            ) : null}
            <h3>{tier.name}</h3>
            <p className="membership-tier-tagline">{tier.tagline}</p>
            <p className="membership-tier-price">
              {usesCredits ? (
                <>
                  <strong>{tier.creditsPerMonth ?? 0}</strong> credits / mo
                  {tier.id !== "free" && <span className="membership-tier-or">or parent top-up</span>}
                </>
              ) : (
                <>
                  <strong>{formatUsd(monthly)}</strong>
                  {tier.id !== "free" && "/ mo"}
                  {yearly ? (
                    <span className="membership-tier-or">
                      or {formatUsd(yearly)} / yr
                    </span>
                  ) : null}
                  {audience === "senior" && tier.id !== "free" && (tier.priceMonthlyUsd ?? 0) > monthly ? (
                    <span className="membership-tier-or">
                      Adult price {formatUsd(tier.priceMonthlyUsd ?? 0)} / mo
                    </span>
                  ) : null}
                </>
              )}
            </p>
            <ul className="membership-tier-features">
              {MEMBERSHIP_FEATURES.filter((f) => {
                if (!tier.featureIds.includes(f.id)) return false;
                if (audience === "kids" && (f.id === "zip_timing" || f.id === "kid_credits")) return false;
                if (audience === "junior" && f.id === "story_time") return false;
                if ((audience === "adult" || audience === "senior") && f.id === "story_time") return false;
                if (audience === "senior" && f.id === "zip_timing") return true;
                return true;
              }).map((f) => (
                <li key={f.id}>
                  <BadgeCheck size={14} className="membership-check" aria-hidden />
                  <span>
                    <strong>
                      {f.id === "kid_credits" && showKidCreditPool
                        ? kidCreditsFeatureLabel(tier.id)
                        : f.id === "one_on_one"
                          ? oneOnOneFeatureLabel(tier.id)
                          : f.label}
                    </strong>
                    {SCHEDULE_SUITE_FEATURE_IDS.includes(
                      f.id as (typeof SCHEDULE_SUITE_FEATURE_IDS)[number],
                    )
                      ? " · schedule suite"
                      : ""}
                    {f.id === "kid_credits" && showKidCreditPool ? " · family pool" : ""}
                    {f.id === "one_on_one" && tier.commitmentMonths && tier.commitmentMonths > 1
                      ? ` · ${tier.commitmentMonths}-mo commitment`
                      : ""}
                    {f.id === "one_on_one" ? " · all ages" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <TierMemberPerks tierId={tier.id} />
            <button
              type="button"
              className={`btn ${tier.id === "free" ? "btn-outline" : "btn-primary"}`}
              onClick={() => {
                if (tier.id === "free") {
                  onGoToJoin?.("free");
                  return;
                }
                onGoToJoin?.(tier.id);
              }}
              data-testid={`membership-choose-${tier.id}`}
            >
              {tier.id === "free" ? "Join Free" : `Choose ${tier.name}`}
            </button>
          </article>
          );
        })}
      </div>

      {usesCredits && (
        <>
          <section className="glass membership-credit-packs" data-testid="membership-credit-packs">
            <h3>
              <Coins size={18} /> Parent-funded credit packs
            </h3>
            <p>
              Parents and guardians can add credits at any time. Kids can also earn credits below,
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
                  <strong>{pack.credits} credits</strong>
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

          <section className="glass membership-credits" data-testid="membership-credits">
            <h3>
              <Sparkles size={18} /> Earn credits — {AUDIENCE_LABELS[audience]}
            </h3>
            <p>Stack earned credits instead of (or on top of) a parent-funded pack.</p>
            <div className="membership-credits-grid">
              {earnActions.map((a) => (
                <article key={a.id} className="membership-credit-card">
                  <strong>+{a.credits}</strong>
                  <span>{a.label}</span>
                  <p>{a.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

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
