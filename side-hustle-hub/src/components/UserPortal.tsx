import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckSquare,
  Bookmark,
  Star,
  Zap,
  Check,
  BookOpen,
  Coins,
  Compass,
  Copy,
  Link2,
  Sparkles,
} from "lucide-react";
import { WaitIndicator } from "./WaitFeedback";
import {
  CREDIT_EARN_ACTIONS,
  KID_TO_ADULT_CREDIT_RATIO,
  MEMBERSHIP_TIERS,
  type AudienceGroup,
} from "../lib/membership";
import {
  fetchMemberCredits,
  formatAdultCreditEquivalent,
  formatKidCreditBalance,
  formatLedgerDelta,
  summarizeMemberCredits,
  type MemberCreditsSummary,
} from "../lib/member-credits";
import { buildReferralUrl, getOrCreateReferralCode } from "../lib/referral";
import { listSavedBlueprints, type SavedBlueprint } from "../lib/blueprints-api";
import { clearPendingBlueprint, readPendingBlueprint } from "../lib/pending-blueprint";
import {
  blueprintAgeGroupTitle,
  blueprintMatchLabel,
} from "../lib/blueprint-match-labels";
import { hasLaunchGuide } from "../lib/launch-guides";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";

interface Goal {
  id: string;
  title: string;
  done: boolean;
}

interface Badge {
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

type PortalBlueprint = {
  id: string;
  ageGroup: BlueprintAgeGroup;
  resultIds: string[];
  resultPcts: Record<string, number>;
  completedAt: string;
  source: "saved" | "pending";
};

type UserPortalProps = {
  memberName?: string | null;
  onOpenMatchWizard?: () => void;
  onOpenJoin?: () => void;
  /** Open the Launch Guide / Corner guides for a Blueprint match. */
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
};

function toPortalBlueprint(bp: SavedBlueprint): PortalBlueprint {
  return {
    id: bp.id,
    ageGroup: bp.ageGroup,
    resultIds: bp.resultIds ?? [],
    resultPcts: bp.resultPcts ?? {},
    completedAt: bp.completedAt || bp.updatedAt,
    source: "saved",
  };
}

function MatchRow({
  match,
  ageGroup,
  onOpenGuide,
}: {
  match: { id: string; rank: number; label: string; pct?: number };
  ageGroup: BlueprintAgeGroup;
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
}) {
  const canOpenGuide =
    Boolean(onOpenGuide) &&
    (ageGroup === "adult" ? hasLaunchGuide(match.id) : true);

  return (
    <li>
      <span className="user-portal-blueprint-rank">{match.rank}</span>
      <span className="user-portal-blueprint-match-body">
        <strong>{match.label}</strong>
        {typeof match.pct === "number" && <em>{match.pct}% match</em>}
      </span>
      {canOpenGuide && (
        <button
          type="button"
          className="btn btn-outline user-portal-blueprint-guide-btn"
          data-testid={`user-portal-guide-${match.id}`}
          onClick={() => onOpenGuide?.(ageGroup, match.id)}
        >
          <BookOpen size={14} aria-hidden /> Guide
        </button>
      )}
    </li>
  );
}

type PortalTab = "blueprint" | "credits" | "earn" | "milestones" | "bookmarks";

const PORTAL_TABS: { id: PortalTab; label: string; icon: React.ReactNode }[] = [
  { id: "blueprint", label: "Blueprint", icon: <Compass size={15} aria-hidden /> },
  { id: "credits", label: "Credits", icon: <Coins size={15} aria-hidden /> },
  { id: "earn", label: "Ways to Earn", icon: <Sparkles size={15} aria-hidden /> },
  { id: "milestones", label: "Milestones", icon: <CheckSquare size={15} aria-hidden /> },
  { id: "bookmarks", label: "Bookmarks", icon: <Bookmark size={15} aria-hidden /> },
];

export const UserPortal: React.FC<UserPortalProps> = ({
  memberName,
  onOpenMatchWizard,
  onOpenJoin,
  onOpenGuide,
}) => {
  const [portalTab, setPortalTab] = useState<PortalTab>("blueprint");
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", title: "Complete the GYSH Match Wizard", done: true },
    { id: "2", title: "Run profit estimates on two side hustles", done: true },
    { id: "3", title: "Select a niche keyword list for POD shirts", done: false },
    { id: "4", title: "Request sample packaging from manufacturer", done: false },
    { id: "5", title: "Verify local city STR/Airbnb permit guidelines", done: false },
  ]);
  const [referralCode, setReferralCode] = useState("GYSHHOME");
  const [referralUrl, setReferralUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState<MemberCreditsSummary | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [blueprints, setBlueprints] = useState<PortalBlueprint[]>([]);
  const [blueprintsLoading, setBlueprintsLoading] = useState(true);
  const [blueprintsError, setBlueprintsError] = useState<string | null>(null);

  useEffect(() => {
    const code = getOrCreateReferralCode();
    setReferralCode(code);
    setReferralUrl(buildReferralUrl(code));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCreditsLoading(true);
    void fetchMemberCredits()
      .then((payload) => {
        if (cancelled) return;
        setCredits(summarizeMemberCredits(payload));
        setCreditsError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCredits(null);
        setCreditsError(err instanceof Error ? err.message : "Could not load credits.");
      })
      .finally(() => {
        if (!cancelled) setCreditsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBlueprintsLoading(true);
    void listSavedBlueprints()
      .then((rows) => {
        if (cancelled) return;
        if (rows.length > 0) {
          setBlueprints(rows.map(toPortalBlueprint));
          clearPendingBlueprint();
          setBlueprintsError(null);
          return;
        }
        const pending = readPendingBlueprint();
        if (pending?.resultIds?.length) {
          setBlueprints([
            {
              id: "pending-local",
              ageGroup: pending.ageGroup,
              resultIds: pending.resultIds,
              resultPcts: pending.resultPcts ?? {},
              completedAt: pending.completedAt,
              source: "pending",
            },
          ]);
          setBlueprintsError(null);
          return;
        }
        setBlueprints([]);
        setBlueprintsError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const pending = readPendingBlueprint();
        if (pending?.resultIds?.length) {
          setBlueprints([
            {
              id: "pending-local",
              ageGroup: pending.ageGroup,
              resultIds: pending.resultIds,
              resultPcts: pending.resultPcts ?? {},
              completedAt: pending.completedAt,
              source: "pending",
            },
          ]);
          setBlueprintsError(null);
          return;
        }
        setBlueprints([]);
        setBlueprintsError(err instanceof Error ? err.message : "Could not load your Blueprint.");
      })
      .finally(() => {
        if (!cancelled) setBlueprintsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const audience: AudienceGroup = credits?.audience ?? "adult";

  const earnActions = useMemo(
    () => CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes(audience)),
    [audience],
  );

  const tierLabel = credits
    ? MEMBERSHIP_TIERS.find((t) => t.id === credits.membershipTier)?.name ?? "Free"
    : null;

  const badges: Badge[] = [
    { name: "Scout Apprentice 🏷️", desc: "Searched product databases for profitable margins", icon: "🏷️", unlocked: true },
    { name: "Hustle Rookie 🚀", desc: "Completed your first GYSH Match Wizard questionnaire", icon: "🚀", unlocked: true },
    { name: "Superhost Trainee 🏡", desc: "Calculated Airbnb nightly yields and operating costs", icon: "🏡", unlocked: true },
    { name: "First Sale 🎉", desc: "Receive your first customer purchase confirmation", icon: "🎉", unlocked: false },
    { name: "Ad Manager 📊", desc: "Set up Facebook/TikTok business manager tracking pixels", icon: "📊", unlocked: false },
  ];

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) return { ...g, done: !g.done };
        return g;
      }),
    );
  };

  const copyReferral = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const completedGoalsCount = goals.filter((g) => g.done).length;
  const progressPercent = Math.round((completedGoalsCount / goals.length) * 100);
  const displayName = (memberName || "").trim() || "there";

  return (
    <div className="user-portal" data-testid="user-portal">
      <div className="user-portal-main">
        <div className="glass user-portal-welcome">
          <div className="user-portal-welcome-row">
            <div className="user-portal-welcome-copy">
              <h2>Welcome back, {displayName}!</h2>
              <p>
                Your Side Hustle Blueprint and credits live here — use the tabs below to review
                matches, check balances, and earn more credits.
              </p>
            </div>
            <div className="user-portal-header-referral" data-testid="user-portal-referral">
              <div className="user-portal-header-referral-label">
                <Link2 size={16} aria-hidden />
                <span>
                  Referral · <strong>{referralCode}</strong>
                </span>
              </div>
              <p className="user-portal-header-referral-hint">
                Share for <strong>+40 credits</strong>
              </p>
              <div className="user-portal-referral-row">
                <input
                  id="user-referral-link"
                  className="flat-input"
                  readOnly
                  value={referralUrl}
                  data-testid="user-referral-link"
                  aria-label="Your referral link"
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={copyReferral}
                  data-testid="user-referral-copy"
                >
                  <Copy size={16} aria-hidden /> {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="user-portal-tabs"
          role="tablist"
          aria-label="My Dashboard sections"
          data-testid="user-portal-tabs"
        >
          {PORTAL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`user-portal-tab-${tab.id}`}
              aria-selected={portalTab === tab.id}
              aria-controls={`user-portal-panel-${tab.id}`}
              className={`user-portal-tab${portalTab === tab.id ? " is-active" : ""}`}
              data-testid={`user-portal-tab-${tab.id}`}
              onClick={() => setPortalTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass user-portal-panel" data-testid="user-portal-panel">
          {portalTab === "blueprint" && (
            <section
              id="user-portal-panel-blueprint"
              role="tabpanel"
              aria-labelledby="user-portal-tab-blueprint"
              data-testid="user-portal-blueprint"
            >
              <div className="user-portal-blueprint-head">
                <h3 id="user-portal-blueprint-heading">
                  <Compass size={20} aria-hidden /> Your Side Hustle Blueprint
                </h3>
                {onOpenMatchWizard && (
                  <button type="button" className="btn btn-outline" onClick={onOpenMatchWizard}>
                    Retake Match Wizard
                  </button>
                )}
              </div>

              {blueprintsLoading && (
                <WaitIndicator
                  className="user-portal-credits-muted"
                  data-testid="user-portal-blueprint-loading"
                  message="Loading your Blueprint…"
                  style={{ marginTop: 0 }}
                />
              )}
              {!blueprintsLoading && blueprintsError && (
                <p className="user-portal-credits-error" data-testid="user-portal-blueprint-error">
                  {blueprintsError}
                </p>
              )}
              {!blueprintsLoading && !blueprintsError && blueprints.length === 0 && (
                <div className="user-portal-blueprint-empty" data-testid="user-portal-blueprint-empty">
                  <p>
                    No Blueprint saved yet. Take the GYSH Match Wizard to unlock personalized Side
                    Hustle matches.
                  </p>
                  {onOpenMatchWizard && (
                    <button type="button" className="btn btn-primary" onClick={onOpenMatchWizard}>
                      <Compass size={16} aria-hidden /> Start Match Wizard
                    </button>
                  )}
                </div>
              )}
              {!blueprintsLoading &&
                blueprints.map((bp) => {
                  const title = blueprintAgeGroupTitle(bp.ageGroup);
                  const matches = bp.resultIds.map((id, i) => ({
                    id,
                    rank: i + 1,
                    label: blueprintMatchLabel(bp.ageGroup, id),
                    pct: bp.resultPcts[id],
                  }));
                  const topMatches = matches.slice(0, 3);
                  const moreMatches = matches.slice(3);
                  return (
                    <div
                      key={bp.id}
                      className="user-portal-blueprint-block"
                      data-testid={`user-portal-blueprint-${bp.ageGroup}`}
                    >
                      <div className="user-portal-blueprint-block-head">
                        <strong>{title}</strong>
                        <span className="user-portal-blueprint-summary-meta">
                          Top {Math.min(3, matches.length)} of {matches.length}
                          {bp.completedAt
                            ? ` · ${new Date(bp.completedAt).toLocaleDateString()}`
                            : ""}
                        </span>
                      </div>
                      <ol className="user-portal-blueprint-matches">
                        {topMatches.map((m) => (
                          <MatchRow
                            key={`${bp.id}-${m.id}`}
                            match={m}
                            ageGroup={bp.ageGroup}
                            onOpenGuide={onOpenGuide}
                          />
                        ))}
                      </ol>
                      {moreMatches.length > 0 && (
                        <details
                          className="user-portal-blueprint-details user-portal-blueprint-more"
                          data-testid={`user-portal-blueprint-more-${bp.ageGroup}`}
                        >
                          <summary>
                            <span className="user-portal-blueprint-summary-main">
                              <strong>
                                {moreMatches.length} more match
                                {moreMatches.length === 1 ? "" : "es"}
                              </strong>
                              <span className="user-portal-blueprint-summary-meta">
                                Matches 4–{matches.length}
                              </span>
                            </span>
                            <span className="collapse-show-hide" aria-hidden="true" />
                          </summary>
                          <ol className="user-portal-blueprint-matches">
                            {moreMatches.map((m) => (
                              <MatchRow
                                key={`${bp.id}-${m.id}`}
                                match={m}
                                ageGroup={bp.ageGroup}
                                onOpenGuide={onOpenGuide}
                              />
                            ))}
                          </ol>
                        </details>
                      )}
                    </div>
                  );
                })}
            </section>
          )}

          {portalTab === "credits" && (
            <section
              id="user-portal-panel-credits"
              role="tabpanel"
              aria-labelledby="user-portal-tab-credits"
              className="user-portal-credits"
              data-testid="user-portal-credits"
            >
              <h3 id="user-portal-credits-heading">
                <Coins size={20} aria-hidden /> Your Credits
              </h3>
              {creditsLoading && (
                <WaitIndicator
                  className="user-portal-credits-muted"
                  data-testid="user-portal-credits-loading"
                  message="Loading your credit balance…"
                  style={{ marginTop: 0 }}
                />
              )}
              {!creditsLoading && creditsError && (
                <p className="user-portal-credits-error" data-testid="user-portal-credits-error">
                  {creditsError}
                </p>
              )}
              {!creditsLoading && credits && (
                <>
                  <div className="user-portal-credits-dual" data-testid="user-portal-credits-dual">
                    <div className="user-portal-credit-card" data-testid="user-portal-kid-credits">
                      <p className="user-portal-credits-label">Kid Credits available</p>
                      <p
                        className="user-portal-credits-balance"
                        data-testid="user-portal-credits-balance"
                      >
                        {formatKidCreditBalance(credits.balance)}
                      </p>
                      <p className="user-portal-credits-muted">
                        Great for kids workshops, Story Time, and youth sessions
                      </p>
                    </div>
                    <div className="user-portal-credit-card" data-testid="user-portal-adult-credits">
                      <p className="user-portal-credits-label">Adult credits available</p>
                      <p
                        className="user-portal-credits-balance"
                        data-testid="user-portal-credits-adult-equiv"
                      >
                        {formatAdultCreditEquivalent(credits.balance)}
                      </p>
                      <p className="user-portal-credits-muted">
                        For adult workshops &amp; 1-on-1s ({KID_TO_ADULT_CREDIT_RATIO} Kid Credits = 1
                        adult credit)
                      </p>
                    </div>
                  </div>
                  <div className="user-portal-credits-meta">
                    <p data-testid="user-portal-credits-tier">
                      Plan: <strong>{tierLabel}</strong>
                    </p>
                    {credits.monthlyAllowance > 0 ? (
                      <p data-testid="user-portal-credits-allowance">
                        Plan includes up to <strong>{credits.monthlyAllowance}</strong> credits /
                        month
                      </p>
                    ) : (
                      <p data-testid="user-portal-credits-allowance">
                        Earn or purchase credits anytime
                        {onOpenJoin ? (
                          <>
                            {" "}
                            — see packs on{" "}
                            <button
                              type="button"
                              className="user-portal-inline-link"
                              onClick={onOpenJoin}
                            >
                              Join
                            </button>
                            .
                          </>
                        ) : (
                          " — see packs on Join."
                        )}
                      </p>
                    )}
                    <p className="user-portal-credits-muted">{credits.ratioLabel}</p>
                  </div>
                  <div className="user-portal-credits-history">
                    <h4>Recent activity</h4>
                    {credits.recent.length === 0 ? (
                      <p
                        className="user-portal-credits-muted"
                        data-testid="user-portal-credits-history-empty"
                      >
                        No credit activity yet. Refer a friend or open Ways to Earn to grow your
                        balance.
                      </p>
                    ) : (
                      <ul data-testid="user-portal-credits-history">
                        {credits.recent.map((entry) => (
                          <li key={entry.id}>
                            <strong className={entry.delta >= 0 ? "is-credit" : "is-debit"}>
                              {formatLedgerDelta(entry.delta)}
                            </strong>
                            <span>{entry.reason}</span>
                            <time dateTime={entry.createdAt}>
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </time>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {portalTab === "earn" && (
            <section
              id="user-portal-panel-earn"
              role="tabpanel"
              aria-labelledby="user-portal-tab-earn"
              data-testid="user-portal-earn-credits"
            >
              <h3>
                <Sparkles size={20} aria-hidden /> Ways to Earn Credits
              </h3>
              <p className="user-portal-panel-lead">
                Treat this like an earnings checklist — learn, launch, refer, and check in weekly.
                Earn actions grow your Kid Credit balance (and adult credit equivalent).
              </p>
              <ul className="user-portal-earn-list">
                {earnActions.map((a) => (
                  <li key={a.id} data-testid={`user-earn-${a.id}`}>
                    <strong className="user-portal-earn-delta">+{a.credits}</strong>
                    <span>
                      <strong className="user-portal-earn-label">{a.label}</strong>
                      <em className="user-portal-earn-detail">{a.detail}</em>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {portalTab === "milestones" && (
            <section
              id="user-portal-panel-milestones"
              role="tabpanel"
              aria-labelledby="user-portal-tab-milestones"
              data-testid="user-portal-milestones"
            >
              <h3>
                <CheckSquare size={20} style={{ color: "var(--accent-purple)" }} /> My Active
                Milestones
              </h3>
              <div className="user-portal-goal-list">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`checklist-item ${g.done ? "completed" : ""}`}
                    style={{ margin: 0 }}
                  >
                    <div className="checklist-checkbox">{g.done && <Check size={12} />}</div>
                    <div className="checklist-text">
                      <span style={{ fontSize: "0.925rem" }}>{g.title}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="user-portal-progress">
                <div className="user-portal-progress-labels">
                  <span>Overall Roadmap Completion</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div className="user-portal-progress-track">
                  <div
                    className="user-portal-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>
          )}

          {portalTab === "bookmarks" && (
            <section
              id="user-portal-panel-bookmarks"
              role="tabpanel"
              aria-labelledby="user-portal-tab-bookmarks"
              data-testid="user-portal-bookmarks"
            >
              <h3>
                <Bookmark size={20} style={{ color: "var(--accent-pink)" }} /> Bookmarked Hustles
              </h3>
              <div className="user-portal-bookmarks">
                <div className="user-portal-bookmark-card">
                  <span className="glow-badge pink">Real Estate</span>
                  <h4>Airbnb Hosting</h4>
                  <p>Active guide progress: 33%</p>
                </div>
                <div className="user-portal-bookmark-card">
                  <span className="glow-badge purple">E-Commerce</span>
                  <h4>Print-on-Demand</h4>
                  <p>Active guide progress: 50%</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="user-portal-side">
        <div className="glass">
          <h3>
            <Award size={20} style={{ color: "var(--accent-amber)" }} /> Unlocked Badges
          </h3>
          <div className="user-portal-badges">
            {badges.map((b, idx) => (
              <div key={idx} className={`user-portal-badge${b.unlocked ? " is-unlocked" : ""}`}>
                <div className="user-portal-badge-icon">
                  {b.unlocked ? (
                    <Star size={20} style={{ color: "white", fill: "white" }} />
                  ) : (
                    <Zap size={20} style={{ color: "var(--text-primary)" }} />
                  )}
                </div>
                <div>
                  <h4>{b.name}</h4>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass">
          <h3>Hustle Level: 3</h3>
          <p>
            Earn 120 more XP by completing milestones to unlock &quot;Level 4: Affiliate Expert&quot;.
          </p>
          <div className="user-portal-progress-track">
            <div className="user-portal-progress-fill is-pink" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
