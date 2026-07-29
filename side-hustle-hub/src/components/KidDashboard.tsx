import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Coins,
  Compass,
  LayoutDashboard,
  Sparkles,
  PiggyBank,
} from "lucide-react";
import { WaitIndicator } from "./WaitFeedback";
import {
  fetchMemberCredits,
  formatKidCreditBalance,
  summarizeMemberCredits,
  type MemberCreditsSummary,
} from "../lib/member-credits";
import { listSavedBlueprints, type SavedBlueprint } from "../lib/blueprints-api";
import {
  blueprintAgeGroupTitle,
  blueprintMatchLabel,
} from "../lib/blueprint-match-labels";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";

type KidDashboardProps = {
  memberName?: string | null;
  /** kids | junior — from the logged-in youth account (or parent coach preview) */
  ageBand: "kids" | "junior";
  /** When a parent coach opens a specific kid’s dashboard, filter to that child profile. */
  childProfileId?: string | null;
  /** Parent is viewing a linked kid’s dashboard (shows coach copy + back). */
  parentCoachView?: boolean;
  onBack?: () => void;
  onOpenMatchWizard?: () => void;
  onOpenCorner?: (tab?: "wizard" | "piggy" | "guides" | "jobs") => void;
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
};

type DashTab = "blueprint" | "credits" | "explore";

const TABS: { id: DashTab; label: string; icon: React.ReactNode }[] = [
  { id: "blueprint", label: "My Blueprint", icon: <Compass size={15} aria-hidden /> },
  { id: "credits", label: "Credits", icon: <Coins size={15} aria-hidden /> },
  { id: "explore", label: "Explore", icon: <Sparkles size={15} aria-hidden /> },
];

export function KidDashboard({
  memberName,
  ageBand,
  childProfileId = null,
  parentCoachView = false,
  onBack,
  onOpenMatchWizard,
  onOpenCorner,
  onOpenGuide,
}: KidDashboardProps) {
  const [tab, setTab] = useState<DashTab>("blueprint");
  const [blueprints, setBlueprints] = useState<SavedBlueprint[]>([]);
  const [blueprintsLoading, setBlueprintsLoading] = useState(true);
  const [blueprintsError, setBlueprintsError] = useState<string | null>(null);
  const [credits, setCredits] = useState<MemberCreditsSummary | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  const displayName = (memberName || "").trim() || (ageBand === "junior" ? "teen Side Hustler" : "Side Hustler");
  const cornerLabel = ageBand === "junior" ? "Teens Corner" : "Kids Corner";
  const bandLabel = ageBand === "junior" ? "Teens" : "Kids";

  useEffect(() => {
    let cancelled = false;
    setBlueprintsLoading(true);
    void listSavedBlueprints()
      .then((rows) => {
        if (cancelled) return;
        const ageRows = rows.filter((bp) => bp.ageGroup === ageBand);
        if (childProfileId) {
          setBlueprints(ageRows.filter((bp) => bp.childProfileId === childProfileId));
        } else {
          // Youth sessions: prefer blueprints assigned to their child profile.
          const assigned = ageRows.filter((bp) => Boolean(bp.childProfileId));
          setBlueprints(assigned.length > 0 ? assigned : ageRows);
        }
        setBlueprintsError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setBlueprints([]);
        setBlueprintsError(err instanceof Error ? err.message : "Could not load your Blueprint.");
      })
      .finally(() => {
        if (!cancelled) setBlueprintsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ageBand, childProfileId]);

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

  return (
    <div className="user-portal kid-dashboard" data-testid="kid-dashboard">
      <div className="user-portal-main">
        <div className="glass user-portal-welcome">
          <div className="user-portal-welcome-row">
            <div className="user-portal-welcome-copy">
              <h2 data-testid="kid-dashboard-welcome">
                <LayoutDashboard size={22} aria-hidden />{" "}
                {parentCoachView
                  ? `${displayName}'s ${bandLabel} dashboard`
                  : `Welcome, ${displayName}!`}
              </h2>
              <p>
                {parentCoachView
                  ? `Parent coach view — Blueprints assigned to ${displayName}, credits, and shortcuts into ${cornerLabel}.`
                  : `This is your ${bandLabel} dashboard — see Blueprints your parent coach assigned, check credits, and jump into ${cornerLabel}.`}
              </p>
            </div>
            {parentCoachView && onBack ? (
              <button
                type="button"
                className="btn btn-outline"
                data-testid="kid-dashboard-back-to-family"
                onClick={onBack}
              >
                Back to Family Coach
              </button>
            ) : null}
          </div>
        </div>

        <div
          className="user-portal-tabs"
          role="tablist"
          aria-label="Kid dashboard sections"
          data-testid="kid-dashboard-tabs"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`user-portal-tab${tab === t.id ? " is-active" : ""}`}
              data-testid={`kid-dashboard-tab-${t.id}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="glass user-portal-panel" data-testid="kid-dashboard-panel">
          {tab === "blueprint" && (
            <section data-testid="kid-dashboard-blueprint">
              <div className="user-portal-blueprint-head">
                <h3>
                  <Compass size={20} aria-hidden /> My Side Hustle Blueprint
                </h3>
                {onOpenMatchWizard && (
                  <button type="button" className="btn btn-outline" onClick={onOpenMatchWizard}>
                    Open Match Wizard
                  </button>
                )}
              </div>

              {blueprintsLoading && (
                <WaitIndicator message="Loading your Blueprint…" style={{ marginTop: 0 }} />
              )}
              {!blueprintsLoading && blueprintsError && (
                <p className="user-portal-credits-error">{blueprintsError}</p>
              )}
              {!blueprintsLoading && !blueprintsError && blueprints.length === 0 && (
                <div className="user-portal-blueprint-empty" data-testid="kid-dashboard-blueprint-empty">
                  <p>
                    No Blueprint assigned yet. Ask your parent coach to map a Match Wizard result to
                    you — or try the wizard in {cornerLabel}.
                  </p>
                  {onOpenCorner && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onOpenCorner("wizard")}
                    >
                      <Compass size={16} aria-hidden /> Go to Match Wizard
                    </button>
                  )}
                </div>
              )}

              {!blueprintsLoading &&
                blueprints.map((bp) => {
                  const matches = (bp.resultIds ?? []).map((id, i) => ({
                    id,
                    rank: i + 1,
                    label: blueprintMatchLabel(bp.ageGroup, id),
                    pct: bp.resultPcts?.[id],
                  }));
                  const top = matches.slice(0, 3);
                  const more = matches.slice(3);
                  return (
                    <div
                      key={bp.id}
                      className="user-portal-blueprint-block"
                      data-testid={`kid-dashboard-blueprint-${bp.id}`}
                    >
                      <div className="user-portal-blueprint-block-head">
                        <strong>{blueprintAgeGroupTitle(bp.ageGroup)}</strong>
                        <span className="user-portal-blueprint-summary-meta">
                          Top {Math.min(3, matches.length)} of {matches.length}
                          {bp.completedAt
                            ? ` · ${new Date(bp.completedAt).toLocaleDateString()}`
                            : ""}
                        </span>
                      </div>
                      <ol className="user-portal-blueprint-matches">
                        {top.map((m) => (
                          <li key={`${bp.id}-${m.id}`}>
                            <span className="user-portal-blueprint-rank">{m.rank}</span>
                            <span className="user-portal-blueprint-match-body">
                              <strong>{m.label}</strong>
                              {typeof m.pct === "number" && <em>{m.pct}% match</em>}
                            </span>
                            {onOpenGuide && (
                              <button
                                type="button"
                                className="btn btn-outline user-portal-blueprint-guide-btn"
                                data-testid={`kid-dashboard-guide-${m.id}`}
                                onClick={() => onOpenGuide(bp.ageGroup, m.id)}
                              >
                                <BookOpen size={14} aria-hidden /> Guide
                              </button>
                            )}
                          </li>
                        ))}
                      </ol>
                      {more.length > 0 && (
                        <details className="user-portal-blueprint-details user-portal-blueprint-more">
                          <summary>
                            <span className="user-portal-blueprint-summary-main">
                              <strong>
                                {more.length} more match{more.length === 1 ? "" : "es"}
                              </strong>
                            </span>
                            <span className="collapse-show-hide" aria-hidden="true" />
                          </summary>
                          <ol className="user-portal-blueprint-matches">
                            {more.map((m) => (
                              <li key={`${bp.id}-${m.id}`}>
                                <span className="user-portal-blueprint-rank">{m.rank}</span>
                                <span className="user-portal-blueprint-match-body">
                                  <strong>{m.label}</strong>
                                  {typeof m.pct === "number" && <em>{m.pct}% match</em>}
                                </span>
                                {onOpenGuide && (
                                  <button
                                    type="button"
                                    className="btn btn-outline user-portal-blueprint-guide-btn"
                                    onClick={() => onOpenGuide(bp.ageGroup, m.id)}
                                  >
                                    <BookOpen size={14} aria-hidden /> Guide
                                  </button>
                                )}
                              </li>
                            ))}
                          </ol>
                        </details>
                      )}
                    </div>
                  );
                })}
            </section>
          )}

          {tab === "credits" && (
            <section data-testid="kid-dashboard-credits">
              <h3>
                <Coins size={20} aria-hidden /> My Credits
              </h3>
              {creditsLoading && (
                <WaitIndicator message="Loading credits…" style={{ marginTop: 0 }} />
              )}
              {creditsError && <p className="user-portal-credits-error">{creditsError}</p>}
              {!creditsLoading && !creditsError && credits && (
                <div className="user-portal-credit-card" data-testid="kid-dashboard-credit-balance">
                  <strong>{formatKidCreditBalance(credits.balance)}</strong>
                  <p>Kid credits for workshops, Story Time, and youth sessions</p>
                </div>
              )}
              {!creditsLoading && !creditsError && !credits && (
                <p className="user-portal-credits-muted">Credits will show here after your first earn.</p>
              )}
            </section>
          )}

          {tab === "explore" && (
            <section data-testid="kid-dashboard-explore">
              <h3>
                <Sparkles size={20} aria-hidden /> Explore {cornerLabel}
              </h3>
              <p className="user-portal-panel-lead">
                Jump into Match Wizard, savings, hustle ideas, and member guides.
              </p>
              <div className="kid-dashboard-explore-grid">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenCorner?.("wizard") ?? onOpenMatchWizard?.()}
                >
                  <Compass size={16} aria-hidden /> Match Wizard
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onOpenCorner?.("piggy")}
                >
                  <PiggyBank size={16} aria-hidden />{" "}
                  {ageBand === "junior" ? "My Bank" : "Piggy Bank"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onOpenCorner?.("jobs")}
                >
                  <Sparkles size={16} aria-hidden /> Hustle ideas
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onOpenCorner?.("guides")}
                >
                  <BookOpen size={16} aria-hidden /> Guides
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/** Logged-in youth (kid/teen) accounts get the dedicated kid dashboard. */
export function isYouthDashboardUser(user: {
  role?: string;
  roles?: string[];
  audience?: string;
} | null | undefined): boolean {
  if (!user) return false;
  const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
  const audience = String(user.audience || "").toLowerCase();
  return (
    roles.includes("kid") ||
    roles.includes("junior") ||
    audience === "kids" ||
    audience === "junior"
  );
}

export function youthAgeBand(user: {
  role?: string;
  roles?: string[];
  audience?: string;
} | null | undefined): "kids" | "junior" {
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const audience = String(user?.audience || "").toLowerCase();
  if (roles.includes("junior") || audience === "junior") return "junior";
  return "kids";
}
