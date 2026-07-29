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
  Users,
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
import {
  assignSavedBlueprint,
  listSavedBlueprints,
  type SavedBlueprint,
} from "../lib/blueprints-api";
import { clearPendingBlueprint, readPendingBlueprint } from "../lib/pending-blueprint";
import {
  blueprintAgeGroupTitle,
  blueprintMatchLabel,
} from "../lib/blueprint-match-labels";
import { hasLaunchGuide } from "../lib/launch-guides";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";
import {
  fetchFamilyChildren,
  fetchFamilySettings,
  registerFamilyChild,
  updateFamilySettings,
  type FamilyChild,
} from "../lib/family";
import type { ProgressReportCadence } from "../lib/family-logic";

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
  childProfileId: string | null;
};

type UserPortalProps = {
  memberName?: string | null;
  onOpenMatchWizard?: () => void;
  onOpenJoin?: () => void;
  /** Open the Launch Guide / Corner guides for a Blueprint match. */
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
  /** Open that kid’s Kids / Teens dashboard (Corner). */
  onOpenKidDashboard?: (ageBand: "kids" | "junior") => void;
};

function toPortalBlueprint(bp: SavedBlueprint): PortalBlueprint {
  return {
    id: bp.id,
    ageGroup: bp.ageGroup,
    resultIds: bp.resultIds ?? [],
    resultPcts: bp.resultPcts ?? {},
    completedAt: bp.completedAt || bp.updatedAt,
    source: "saved",
    childProfileId: bp.childProfileId ?? null,
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

type PortalTab = "blueprint" | "family" | "credits" | "earn" | "milestones" | "bookmarks";

const PORTAL_TABS: { id: PortalTab; label: string; icon: React.ReactNode }[] = [
  { id: "blueprint", label: "Blueprint", icon: <Compass size={15} aria-hidden /> },
  { id: "family", label: "Family", icon: <Users size={15} aria-hidden /> },
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
  onOpenKidDashboard,
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
  const [familyChildren, setFamilyChildren] = useState<FamilyChild[]>([]);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [familyMessage, setFamilyMessage] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [kidName, setKidName] = useState("");
  const [kidAgeBand, setKidAgeBand] = useState<"kids" | "junior">("kids");
  const [kidLoginEmail, setKidLoginEmail] = useState("");
  const [kidLoginPassword, setKidLoginPassword] = useState("");
  const [juniorSignupId, setJuniorSignupId] = useState<string | null>(null);
  const [registeringKid, setRegisteringKid] = useState(false);
  const [pendingAssignBlueprintId, setPendingAssignBlueprintId] = useState<string | null>(null);
  const [reportCadence, setReportCadence] = useState<ProgressReportCadence>("none");
  const [assignBusyId, setAssignBusyId] = useState<string | null>(null);

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
              childProfileId: null,
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
              childProfileId: null,
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

  const refreshFamily = async () => {
    setFamilyLoading(true);
    setFamilyError(null);
    try {
      const [kids, settings] = await Promise.all([fetchFamilyChildren(), fetchFamilySettings()]);
      setFamilyChildren(kids);
      setReportCadence(settings.progressReportCadence || "none");
    } catch (err: unknown) {
      setFamilyError(err instanceof Error ? err.message : "Could not load family profiles.");
    } finally {
      setFamilyLoading(false);
    }
  };

  useEffect(() => {
    void refreshFamily();
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

  const childNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of familyChildren) map.set(c.id, c.displayName);
    return map;
  }, [familyChildren]);

  const resetRegisterForm = () => {
    setKidName("");
    setKidAgeBand("kids");
    setKidLoginEmail("");
    setKidLoginPassword("");
    setJuniorSignupId(null);
    setPendingAssignBlueprintId(null);
    setRegisterOpen(false);
  };

  /** Open Register form — prefilled from kid Join data when available. */
  const openRegisterForKid = (
    child: FamilyChild,
    opts?: { blueprintId?: string },
  ) => {
    setKidName(child.displayName || "");
    setKidAgeBand(child.ageBand === "junior" ? "junior" : "kids");
    setKidLoginEmail(child.childEmail || "");
    setKidLoginPassword("");
    setJuniorSignupId(
      child.juniorSignupId || (child.source === "signup" ? child.id : null),
    );
    setPendingAssignBlueprintId(opts?.blueprintId ?? null);
    setRegisterOpen(true);
    setPortalTab("family");
    setFamilyMessage(null);
    setFamilyError(null);
  };

  const handleRegisterKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteringKid(true);
    setFamilyMessage(null);
    setFamilyError(null);
    try {
      const child = await registerFamilyChild({
        displayName: kidName,
        ageBand: kidAgeBand,
        loginEmail: kidLoginEmail || undefined,
        loginPassword: kidLoginPassword || undefined,
        juniorSignupId: juniorSignupId || undefined,
      });
      setFamilyChildren((prev) => {
        const withoutSignup = prev.filter(
          (c) =>
            c.id !== juniorSignupId &&
            c.juniorSignupId !== juniorSignupId &&
            !(c.source === "signup" && c.displayName === child.displayName),
        );
        return [...withoutSignup, child];
      });
      const assignBpId = pendingAssignBlueprintId;
      resetRegisterForm();
      if (assignBpId) {
        await assignSavedBlueprint({ blueprintId: assignBpId, childProfileId: child.id });
        setBlueprints((prev) =>
          prev.map((bp) =>
            bp.id === assignBpId ? { ...bp, childProfileId: child.id } : bp,
          ),
        );
        setFamilyMessage(
          `${child.displayName} is registered and the Blueprint is assigned to them.`,
        );
        setPortalTab("blueprint");
      } else {
        setFamilyMessage(`${child.displayName} is linked to your parent coach profile.`);
        setPortalTab("family");
      }
    } catch (err: unknown) {
      setFamilyError(err instanceof Error ? err.message : "Could not register your kid.");
    } finally {
      setRegisteringKid(false);
    }
  };

  const handleAssignBlueprint = async (blueprintId: string, childProfileId: string) => {
    setAssignBusyId(blueprintId);
    setFamilyMessage(null);
    setFamilyError(null);
    try {
      const assignee = childProfileId === "self" ? null : childProfileId;
      await assignSavedBlueprint({ blueprintId, childProfileId: assignee });
      setBlueprints((prev) =>
        prev.map((bp) =>
          bp.id === blueprintId ? { ...bp, childProfileId: assignee } : bp,
        ),
      );
      setFamilyMessage(
        assignee
          ? `Blueprint assigned to ${childNameById.get(assignee) || "your kid"}.`
          : "Blueprint kept on your parent profile.",
      );
    } catch (err: unknown) {
      setFamilyError(err instanceof Error ? err.message : "Could not assign Blueprint.");
    } finally {
      setAssignBusyId(null);
    }
  };

  const handleReportCadence = async (cadence: ProgressReportCadence) => {
    setReportCadence(cadence);
    setFamilyError(null);
    try {
      await updateFamilySettings({ progressReportCadence: cadence });
      setFamilyMessage(
        cadence === "none"
          ? "Progress report emails turned off."
          : `${cadence === "daily" ? "Daily" : "Weekly"} kid progress emails enabled.`,
      );
    } catch (err: unknown) {
      setFamilyError(err instanceof Error ? err.message : "Could not save report preference.");
    }
  };

  return (
    <div className="user-portal" data-testid="user-portal">
      <div className="user-portal-main">
        <div className="glass user-portal-welcome">
          <div className="user-portal-welcome-row">
            <div className="user-portal-welcome-copy">
              <h2>Welcome back, {displayName}!</h2>
              <p>
                Your Side Hustle Blueprint, family coach tools, and credits live here — use the tabs
                below to review matches, register kids, and earn more credits.
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
                          {bp.childProfileId
                            ? ` · Assigned to ${childNameById.get(bp.childProfileId) || "kid"}`
                            : " · Assigned to you"}
                        </span>
                      </div>
                      {bp.source === "saved" && (
                        <div className="user-portal-blueprint-assign-wrap">
                          <label className="user-portal-blueprint-assign">
                            <span>Map Blueprint to</span>
                            <select
                              value={bp.childProfileId || "self"}
                              disabled={assignBusyId === bp.id}
                              data-testid={`user-portal-blueprint-assign-${bp.id}`}
                              onChange={(e) => void handleAssignBlueprint(bp.id, e.target.value)}
                            >
                              <option value="self">Myself (parent)</option>
                              {familyChildren
                                .filter((c) => c.source === "profile" && !c.needsRegistration)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.displayName}
                                    {c.ageBand === "junior" ? " · Teens" : " · Kids"}
                                  </option>
                                ))}
                            </select>
                          </label>
                          {familyChildren.some(
                            (c) => c.needsRegistration || c.source === "signup",
                          ) && (
                            <div
                              className="user-portal-blueprint-register-kids"
                              data-testid={`user-portal-blueprint-register-kids-${bp.id}`}
                            >
                              <span>Need to assign to a kid who joined but isn&apos;t registered?</span>
                              <ul>
                                {familyChildren
                                  .filter((c) => c.needsRegistration || c.source === "signup")
                                  .map((c) => (
                                    <li key={c.id}>
                                      <button
                                        type="button"
                                        className="user-portal-kid-register-link"
                                        data-testid={`user-portal-blueprint-register-${bp.id}-${c.id}`}
                                        onClick={() =>
                                          openRegisterForKid(c, { blueprintId: bp.id })
                                        }
                                      >
                                        Register {c.displayName}
                                      </button>
                                      {c.childEmail ? (
                                        <span className="user-portal-kid-register-meta">
                                          {" "}
                                          ({c.childEmail})
                                        </span>
                                      ) : null}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
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

          {portalTab === "family" && (
            <section
              id="user-portal-panel-family"
              role="tabpanel"
              aria-labelledby="user-portal-tab-family"
              className="user-portal-family"
              data-testid="user-portal-family"
            >
              <div className="user-portal-blueprint-head">
                <h3 id="user-portal-family-heading">
                  <Users size={20} aria-hidden /> Family Coach
                </h3>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid="user-portal-register-my-kid"
                  onClick={() => {
                    if (registerOpen) {
                      resetRegisterForm();
                    } else {
                      setJuniorSignupId(null);
                      setPendingAssignBlueprintId(null);
                      setKidName("");
                      setKidLoginEmail("");
                      setKidLoginPassword("");
                      setKidAgeBand("kids");
                      setRegisterOpen(true);
                    }
                    setPortalTab("family");
                  }}
                >
                  Register My Kid
                </button>
              </div>
              <p className="user-portal-panel-lead">
                Create a profile for each kid, link Match Wizard Blueprints to them or yourself, and
                choose email progress reports. If a kid joined with your email, click their name to
                register — the form fills with the info they entered.
              </p>

              {familyMessage && (
                <p className="user-portal-family-ok" data-testid="user-portal-family-message">
                  {familyMessage}
                </p>
              )}
              {familyError && (
                <p className="user-portal-credits-error" data-testid="user-portal-family-error">
                  {familyError}
                </p>
              )}

              {registerOpen && (
                <form
                  className="user-portal-register-kid"
                  data-testid="user-portal-register-kid-form"
                  onSubmit={(e) => void handleRegisterKid(e)}
                >
                  <h4>
                    {juniorSignupId
                      ? `Register ${kidName || "this kid"}`
                      : "Register My Kid"}
                  </h4>
                  {juniorSignupId ? (
                    <p className="user-portal-register-kid-prefill" data-testid="register-kid-prefill-note">
                      Prefilled from their Kids Corner join
                      {pendingAssignBlueprintId
                        ? " — we will assign the Blueprint after you save."
                        : "."}
                    </p>
                  ) : null}
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-kid-name">
                      Kid first name / nickname
                    </label>
                    <input
                      id="register-kid-name"
                      className="text-input"
                      required
                      value={kidName}
                      onChange={(e) => setKidName(e.target.value)}
                      data-testid="register-kid-name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-kid-age">
                      Age band
                    </label>
                    <select
                      id="register-kid-age"
                      className="text-input"
                      value={kidAgeBand}
                      onChange={(e) => setKidAgeBand(e.target.value === "junior" ? "junior" : "kids")}
                      data-testid="register-kid-age"
                    >
                      <option value="kids">Kids (4–12)</option>
                      <option value="junior">Teens (13–17)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-kid-email">
                      Kid login email
                      {juniorSignupId ? " (from their join)" : " (optional)"}
                    </label>
                    <input
                      id="register-kid-email"
                      className="text-input"
                      type="email"
                      value={kidLoginEmail}
                      onChange={(e) => setKidLoginEmail(e.target.value)}
                      data-testid="register-kid-email"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-kid-password">
                      Kid login password (optional — set so they can sign in)
                    </label>
                    <input
                      id="register-kid-password"
                      className="text-input"
                      type="password"
                      value={kidLoginPassword}
                      onChange={(e) => setKidLoginPassword(e.target.value)}
                      data-testid="register-kid-password"
                    />
                  </div>
                  <div className="user-portal-register-kid-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => resetRegisterForm()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={registeringKid}
                      data-testid="register-kid-submit"
                    >
                      {registeringKid
                        ? "Saving…"
                        : pendingAssignBlueprintId
                          ? "Save & assign Blueprint"
                          : "Save kid profile"}
                    </button>
                  </div>
                </form>
              )}

              {familyLoading && (
                <WaitIndicator
                  className="user-portal-credits-muted"
                  data-testid="user-portal-family-loading"
                  message="Loading linked kids…"
                  style={{ marginTop: 0 }}
                />
              )}

              {!familyLoading && familyChildren.length === 0 && (
                <p className="user-portal-credits-muted" data-testid="user-portal-family-empty">
                  No kids linked yet. Tap Register My Kid to create a profile, or approve a Kids
                  Corner consent email if they signed up with your address.
                </p>
              )}

              {!familyLoading && familyChildren.length > 0 && (
                <ul className="user-portal-family-list" data-testid="user-portal-family-list">
                  {familyChildren.map((c) => {
                    const needsReg = Boolean(c.needsRegistration || c.source === "signup");
                    const assigned = needsReg
                      ? []
                      : blueprints.filter((bp) => bp.childProfileId === c.id);
                    const dashLabel =
                      c.ageBand === "junior" ? "Teens dashboard" : "Kids dashboard";
                    return (
                      <li key={c.id} data-testid={`user-portal-family-child-${c.id}`}>
                        <div className="user-portal-family-child-head">
                          <div className="user-portal-family-child-name-row">
                            {needsReg ? (
                              <button
                                type="button"
                                className="user-portal-kid-register-link"
                                data-testid={`user-portal-register-kid-link-${c.id}`}
                                onClick={() => openRegisterForKid(c)}
                              >
                                Register {c.displayName}
                              </button>
                            ) : (
                              <>
                                <strong className="user-portal-family-child-name">
                                  {c.displayName}
                                </strong>
                                {onOpenKidDashboard ? (
                                  <button
                                    type="button"
                                    className="user-portal-kid-dashboard-link"
                                    data-testid={`user-portal-kid-dashboard-${c.id}`}
                                    onClick={() => onOpenKidDashboard(c.ageBand)}
                                  >
                                    {dashLabel}
                                  </button>
                                ) : null}
                              </>
                            )}
                          </div>
                          <span>
                            {c.ageBand === "junior" ? "Teens" : "Kids"}
                            {needsReg ? " · not registered yet" : ""}
                            {c.status === "pending_parent" ? " · awaiting your consent" : ""}
                            {c.hasLogin ? " · login enabled" : ""}
                            {c.childEmail && needsReg ? ` · ${c.childEmail}` : ""}
                          </span>
                        </div>
                        {needsReg ? (
                          <em>
                            Click Register to create their profile — we&apos;ll use the info they
                            entered when they joined.
                          </em>
                        ) : (
                          <details
                            className="user-portal-family-blueprints"
                            data-testid={`user-portal-family-blueprints-${c.id}`}
                          >
                            <summary>
                              <span>
                                Blueprints{" "}
                                <strong>({assigned.length})</strong>
                              </span>
                              <span className="collapse-show-hide" aria-hidden="true" />
                            </summary>
                            {assigned.length === 0 ? (
                              <p className="user-portal-family-blueprints-empty">
                                No Blueprint assigned yet — map one under the Blueprint tab.
                              </p>
                            ) : (
                              <ul className="user-portal-family-blueprint-items">
                                {assigned.map((bp) => {
                                  const matches = (bp.resultIds ?? []).map((id, i) => ({
                                    id,
                                    rank: i + 1,
                                    label: blueprintMatchLabel(bp.ageGroup, id),
                                    pct: bp.resultPcts[id],
                                  }));
                                  const topMatches = matches.slice(0, 3);
                                  const moreMatches = matches.slice(3);
                                  return (
                                    <li key={bp.id}>
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
                                        {topMatches.map((m) => (
                                          <MatchRow
                                            key={`${bp.id}-${m.id}`}
                                            match={m}
                                            ageGroup={bp.ageGroup}
                                            onOpenGuide={onOpenGuide}
                                          />
                                        ))}
                                      </ol>
                                      {moreMatches.length > 0 ? (
                                        <details className="user-portal-blueprint-details user-portal-blueprint-more">
                                          <summary>
                                            <span className="user-portal-blueprint-summary-main">
                                              <strong>
                                                {moreMatches.length} more match
                                                {moreMatches.length === 1 ? "" : "es"}
                                              </strong>
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
                                      ) : null}
                                      {onOpenKidDashboard ? (
                                        <button
                                          type="button"
                                          className="btn btn-outline user-portal-family-blueprint-open"
                                          onClick={() => onOpenKidDashboard(c.ageBand)}
                                        >
                                          Open {dashLabel}
                                        </button>
                                      ) : null}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </details>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div
                className="user-portal-family-reports"
                data-testid="user-portal-family-reports"
              >
                <h4>Kid progress emails</h4>
                <p>
                  Get a digest of linked kids&apos; logins and assigned Blueprints. You also get an
                  email every time a linked kid signs in.
                </p>
                <div className="user-portal-family-report-options">
                  {(
                    [
                      ["none", "Off"],
                      ["daily", "Daily"],
                      ["weekly", "Weekly"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="kid-progress-cadence"
                        checked={reportCadence === value}
                        onChange={() => void handleReportCadence(value)}
                        data-testid={`user-portal-report-${value}`}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
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
