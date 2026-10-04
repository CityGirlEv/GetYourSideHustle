import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Lock,
  RotateCcw,
  Save,
  Sparkles,
  Unlock,
  UserPlus,
} from "lucide-react";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";
import { complimentaryExtraUnlockBadge, type GuideMinTier } from "../lib/guide-access";
import { cachedComplimentaryGuideIds } from "../lib/wizard-comp-guide";
import { ComplimentaryGiftNote } from "./ComplimentaryGiftNote";
import { GuideMembershipBadges } from "./GuideMembershipBadges";
import { WaitLabel } from "./WaitFeedback";
import {
  wizardResultGuideButtonLabel,
  wizardResultGuideDestination,
  wizardResultGuideHref,
  wizardSaveButtonLabel,
  wizardSaveDashboardLabel,
  wizardSaveHint,
  type WizardSaveStatus,
} from "../lib/wizard-save";
import { DASHBOARD_HREF } from "../lib/member-dashboard";
import { complimentaryUnlockAppliesToGuide, resolveGuideAccess } from "../lib/guide-access";
import {
  canOfferComplimentaryPick,
  complimentaryPickNotice,
  complimentaryUnlockButtonLabel,
} from "../lib/wizard-comp-pick";
import { claimSelectedComplimentaryGuide, readLocalComplimentaryExtraId, selectGuestFreeGuide } from "../lib/wizard-comp-guide";

export type BlueprintMatchCard = {
  id: string;
  title: string;
  description: string;
  pct?: number;
  tier?: string;
  badge?: string;
  /** Membership floor required to open this guide (Free / Starter / Pro / Elite). */
  minTier?: GuideMinTier;
  whyFits?: string;
  benefits?: string[];
  safetyNote?: string;
  meta?: { label: string; value: string }[];
  icon?: React.ReactNode;
  gradient?: string;
};

type SideHustleBlueprintResultsProps = {
  ageGroup: BlueprintAgeGroup;
  matches: BlueprintMatchCard[];
  unlocked: boolean;
  onUnlock: () => void;
  onRetake: () => void;
  onSelectGuide?: (id: string) => void;
  /** Save matches to My Dashboard (signed in) or start free signup (guest). */
  onSaveResults?: () => void;
  saveStatus?: WizardSaveStatus;
  onOpenDashboard?: () => void;
  /** Extra actions under full results (e.g. Piggy Bank). */
  extraActions?: React.ReactNode;
  /** How-scoring / safety blocks already rendered by parent. */
  children?: React.ReactNode;
  isLoggedIn?: boolean;
  previewAsGuest?: boolean;
  membershipTier?: string | null;
  isAdmin?: boolean;
};

function blueprintTitle(ageGroup: BlueprintAgeGroup): string {
  if (ageGroup === "junior") return "Teens Side Hustle Blueprint";
  if (ageGroup === "adult") return "Adult Side Hustle Blueprint";
  if (ageGroup === "senior") return "Senior Side Hustle Blueprint";
  return "Side Hustle Blueprint";
}

function unlockButtonLabel(ageGroup: BlueprintAgeGroup): string {
  if (ageGroup === "kids") return "Ask a Parent to Unlock My Full Blueprint";
  return "Unlock My Full Blueprint";
}

const BLUEPRINT_INCLUDES = [
  "All personalized Side Hustle matches",
  "Why each match fits",
  "Recommended GYSH Guides",
  "Suggested first steps",
  "Earning and pricing guidance, where available",
  "Safety tips",
  "The ability to save favorites and track progress",
];

export function SideHustleBlueprintResults({
  ageGroup,
  matches,
  unlocked,
  onUnlock,
  onRetake,
  onSelectGuide,
  onSaveResults,
  saveStatus = "idle",
  onOpenDashboard,
  extraActions,
  children,
  isLoggedIn = false,
  previewAsGuest = false,
  membershipTier = null,
  isAdmin = false,
}: SideHustleBlueprintResultsProps) {
  const extraGuideId = cachedComplimentaryGuideIds()[0] ?? "";
  const [guestPickId, setGuestPickId] = useState<string | null>(() => readLocalComplimentaryExtraId());
  const [guestPickError, setGuestPickError] = useState("");
  const [claimedExtraId, setClaimedExtraId] = useState(extraGuideId);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState("");
  const [unlockErrorId, setUnlockErrorId] = useState("");
  const activeExtraId = unlocked ? claimedExtraId || extraGuideId : "";
  const fullMatches = matches;
  const saveBusy = saveStatus === "saving";
  const saveLabel = wizardSaveButtonLabel({ isLoggedIn: unlocked, status: saveStatus });
  const memberSession = Boolean(isLoggedIn) && !previewAsGuest;
  const offerComplimentaryPick = canOfferComplimentaryPick({
    isLoggedIn: memberSession,
    previewAsGuest,
    membershipTier,
    claimedId: activeExtraId,
  });

  const unlockAndOpen = async (guideId: string) => {
    setUnlockingId(guideId);
    setUnlockError("");
    setUnlockErrorId(guideId);
    try {
      const result = await claimSelectedComplimentaryGuide({
        isLoggedIn: memberSession,
        previewAsGuest,
        membershipTier,
        guideId,
        resultIds: matches.map((row) => row.id),
      });
      if (result.error) {
        setUnlockError(result.error);
        if (result.claimedId) setClaimedExtraId(result.claimedId);
        return;
      }
      if (result.claimedId) setClaimedExtraId(result.claimedId);
      if (onSelectGuide) onSelectGuide(guideId);
    } catch (err: unknown) {
      setUnlockError(err instanceof Error ? err.message : "Could not unlock that guide.");
    } finally {
      setUnlockingId(null);
    }
  };

  const destForMatch = (row: BlueprintMatchCard) => {
    const minTier = row.minTier ?? "free";
    const access = resolveGuideAccess({
      isMember: memberSession,
      membershipTier,
      minTier,
      isAdmin,
      guideId: row.id,
    });
    return wizardResultGuideDestination({
      guideUnlocked: access.unlocked,
      minTier,
      offerComplimentaryPick:
        offerComplimentaryPick && complimentaryUnlockAppliesToGuide(minTier),
      needsJoin: access.needsJoin,
    });
  };

  return (
    <div
      className={`side-hustle-blueprint${unlocked ? " is-unlocked" : " is-partial"}`}
      data-testid="side-hustle-blueprint"
      data-age-group={ageGroup}
      data-unlocked={unlocked ? "true" : "false"}
    >
      <div className="side-hustle-blueprint-hero">
        <h2 data-testid="blueprint-headline" className="side-hustle-blueprint-headline">
          <span className="side-hustle-blueprint-headline-badge" aria-hidden="true">
            <Sparkles size={20} />
          </span>
          Your Side Hustle Blueprint Is Ready!
        </h2>
        <p className="side-hustle-blueprint-lead" data-testid="blueprint-lead">
          {unlocked
            ? `Here is your complete ${blueprintTitle(ageGroup)} — Free Membership Side Hustles first, then higher match %.`
            : "Here are your Side Hustle matches. Select 1 as your free guide. That choice is once per lifetime."}
        </p>
        {unlocked && offerComplimentaryPick ? (
          <p className="side-hustle-blueprint-sublead" data-testid="blueprint-comp-pick-notice">
            {complimentaryPickNotice()}
          </p>
        ) : null}
        {unlocked ? (
          <p className="side-hustle-blueprint-sublead" data-testid="blueprint-ranking-note">
            Free Membership Side Hustles plus your highest % match as one extra Launch Guide. Match % is how well each idea fits your answers.
          </p>
        ) : (
          <p className="side-hustle-blueprint-sublead">
            Choose 1 match as your free guide, then sign up to open it. You can select only 1 free guide per lifetime.
          </p>
        )}
        {unlocked ? (
          <p className="side-hustle-blueprint-dashboard-link-wrap">
            <a
              href={DASHBOARD_HREF}
              className="side-hustle-blueprint-dashboard-link"
              data-testid="blueprint-dashboard-link"
              onClick={(e) => {
                if (!onOpenDashboard) return;
                e.preventDefault();
                onOpenDashboard();
              }}
            >
              <LayoutDashboard size={16} aria-hidden />
              {wizardSaveDashboardLabel()}
            </a>
          </p>
        ) : null}
      </div>

      <div className="quiz-results-list side-hustle-blueprint-list">
        {!unlocked && (
          <div
            className="side-hustle-blueprint-unlock-banner is-results-top"
            data-testid="blueprint-unlock-banner"
            role="status"
          >
            <span className="side-hustle-blueprint-unlock-banner-pulse" aria-hidden="true" />
            <p className="side-hustle-blueprint-unlock-banner-text">
              <strong>
                <Lock size={18} aria-hidden />
                Sign up to open these guides
              </strong>
              <span className="side-hustle-blueprint-unlock-banner-sub">
                Your matches are below. A free account opens the guides and saves this Blueprint.
              </span>
            </p>
            <button
              type="button"
              className="btn btn-primary side-hustle-blueprint-unlock-banner-btn"
              data-testid="blueprint-unlock-btn"
              onClick={onUnlock}
            >
              <Unlock size={16} /> {unlockButtonLabel(ageGroup)}
            </button>
            <ChevronDown
              className="side-hustle-blueprint-unlock-banner-arrow"
              size={22}
              aria-hidden
            />
          </div>
        )}
        {fullMatches.map((row, index) => (
          <article
            key={row.id}
            className={`quiz-result-card glass-card side-hustle-blueprint-card ${index === 0 ? "is-top" : ""}`}
            data-testid={index === 0 ? "blueprint-top-match" : `blueprint-match-${index}`}
          >
            <div className="quiz-result-header">
              <div>
                {row.tier && (
                  <span
                    className={`quiz-match-tier tier-${row.tier.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {row.tier}
                  </span>
                )}
                {row.badge && (
                  <span
                    className={`glow-badge ${row.gradient ?? "emerald"}`}
                    style={{ marginLeft: row.tier ? 8 : 0 }}
                  >
                    {row.badge}
                  </span>
                )}
                {row.minTier ? (
                  <span
                    className="side-hustle-blueprint-membership"
                    style={{ display: "inline-block", marginLeft: row.tier || row.badge ? 8 : 0 }}
                  >
                    <GuideMembershipBadges
                      minTier={row.minTier}
                      data-testid={`blueprint-membership-${row.id}`}
                    />
                  </span>
                ) : null}
                {activeExtraId && activeExtraId === row.id ? (
                  <span
                    className="glow-badge emerald"
                    data-testid={`blueprint-extra-unlock-${row.id}`}
                    style={{ marginLeft: 8 }}
                  >
                    {complimentaryExtraUnlockBadge(row.minTier ?? "free")}
                  </span>
                ) : null}
                <h3 className="side-hustle-blueprint-card-title">
                  {row.icon && <span className="side-hustle-blueprint-card-icon">{row.icon}</span>}
                  {index + 1}. {row.title}
                </h3>
              </div>
              {typeof row.pct === "number" && (
                <div className="quiz-score-badge" title="Relative match score">
                  <strong>{row.pct}%</strong>
                  <span>match</span>
                </div>
              )}
            </div>

            <p className="side-hustle-blueprint-card-desc">{row.description}</p>

            {activeExtraId && activeExtraId === row.id ? (
              <ComplimentaryGiftNote guideId={row.id} minTier={row.minTier ?? "free"} />
            ) : null}

            {row.whyFits && (
              <p className="side-hustle-blueprint-why">
                <strong>Why it fits: </strong>
                {row.whyFits}
              </p>
            )}

            {row.benefits && row.benefits.length > 0 && (
              <ul className="side-hustle-blueprint-benefits">
                {row.benefits.slice(0, 3).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}

            {row.safetyNote && (
              <p className="side-hustle-blueprint-safety" role="note">
                <strong>Safety: </strong>
                {row.safetyNote}
              </p>
            )}

            {row.meta && row.meta.length > 0 && (
              <div className="match-finder-adult-result-meta">
                {row.meta.map((m) => (
                  <span key={m.label}>
                    <span style={{ color: "var(--text-primary)" }}>{m.label}: </span>
                    <strong>{m.value}</strong>
                  </span>
                ))}
              </div>
            )}

            <div className="side-hustle-blueprint-card-actions">
              {!unlocked ? (
                guestPickId && guestPickId !== row.id ? null : (
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid={`blueprint-match-signup-${row.id}`}
                  onClick={() => {
                    const result = selectGuestFreeGuide(
                      row.id,
                      matches.map((match) => match.id),
                    );
                    if (result.claimedId) setGuestPickId(result.claimedId);
                    if (result.error && result.claimedId !== row.id) {
                      setGuestPickError(result.error);
                      return;
                    }
                    setGuestPickError("");
                    onUnlock();
                  }}
                >
                  <UserPlus size={14} aria-hidden /> Select this as my free guide
                </button>
                )
              ) : offerComplimentaryPick &&
                !resolveGuideAccess({
                  isMember: memberSession,
                  membershipTier,
                  minTier: row.minTier ?? "free",
                  isAdmin,
                  guideId: row.id,
                }).unlocked ? (
                <button
                  type="button"
                  className="btn btn-primary side-hustle-blueprint-comp-unlock"
                  data-testid={`blueprint-comp-unlock-${row.id}`}
                  disabled={unlockingId !== null}
                  onClick={() => void unlockAndOpen(row.id)}
                >
                  <Unlock size={14} aria-hidden />
                  {complimentaryUnlockButtonLabel(unlockingId === row.id)}
                </button>
              ) : (
                <a
                  href={wizardResultGuideHref(row.id, destForMatch(row))}
                  className="btn btn-primary"
                  data-testid={`blueprint-match-guide-${row.id}`}
                  data-dest={destForMatch(row)}
                  onClick={(e) => {
                    const dest = destForMatch(row);
                    if (dest === "blueprint") {
                      if (onOpenDashboard) {
                        e.preventDefault();
                        onOpenDashboard();
                      }
                      return;
                    }
                    if (!onSelectGuide) return;
                    e.preventDefault();
                    onSelectGuide(row.id);
                  }}
                >
                  <BookOpen size={14} /> {wizardResultGuideButtonLabel()}
                </a>
              )}
            </div>
            {guestPickError ? (
              <p className="side-hustle-blueprint-comp-error" role="alert" data-testid="blueprint-guest-free-guide-error">
                {guestPickError}
              </p>
            ) : null}
            {unlockErrorId === row.id && unlockError ? (
              <p className="side-hustle-blueprint-comp-error" role="alert" data-testid={`blueprint-comp-unlock-error-${row.id}`}>
                {unlockError}
              </p>
            ) : null}
          </article>
        ))}

        {!unlocked && (
          <section
            className="side-hustle-blueprint-gate glass"
            data-testid="blueprint-unlock-gate"
            aria-labelledby="blueprint-gate-title"
          >
            <h3 id="blueprint-gate-title" className="side-hustle-blueprint-gate-title">
              <span className="side-hustle-blueprint-gate-highlight">
                Create your free GYSH account
              </span>{" "}
              to unlock your complete Side Hustle Blueprint.
            </h3>
            {ageGroup === "kids" && (
              <p
                className="side-hustle-blueprint-parent-note"
                data-testid="blueprint-kids-parent-note"
              >
                A parent or guardian must create the free family account to save and unlock this
                child&apos;s complete Side Hustle Blueprint.
              </p>
            )}
            <p className="side-hustle-blueprint-includes-label">Your full Blueprint includes:</p>
            <ul className="side-hustle-blueprint-includes">
              {BLUEPRINT_INCLUDES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="side-hustle-blueprint-gate-actions">
              <button
                type="button"
                className="btn btn-primary side-hustle-blueprint-unlock-cta"
                data-testid="blueprint-unlock-btn-secondary"
                onClick={onUnlock}
              >
                <Unlock size={16} /> {unlockButtonLabel(ageGroup)}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                data-testid="blueprint-retake-btn"
                onClick={onRetake}
              >
                <RotateCcw size={16} /> Retake the Quiz
              </button>
            </div>
            <p className="side-hustle-blueprint-reassure">Free account. No credit card required.</p>
          </section>
        )}
      </div>

      {(unlocked || onSaveResults) && (
        <div className="side-hustle-blueprint-unlocked-actions match-finder-adult-actions">
          {onSaveResults ? (
            <div className="side-hustle-blueprint-save" data-testid="blueprint-save-panel">
              <p className="side-hustle-blueprint-save-hint" data-testid="blueprint-save-hint">
                {wizardSaveHint({ isLoggedIn: unlocked, status: saveStatus })}
              </p>
              <div className="side-hustle-blueprint-save-actions">
                <button
                  type="button"
                  className={`btn ${saveStatus === "saved" ? "btn-outline" : "btn-primary"}`}
                  data-testid="blueprint-save-results"
                  disabled={saveBusy || saveStatus === "saved"}
                  onClick={onSaveResults}
                >
                  {saveBusy ? (
                    <WaitLabel>Saving…</WaitLabel>
                  ) : (
                    <>
                      <Save size={16} aria-hidden />
                      {saveLabel}
                    </>
                  )}
                </button>
                {unlocked ? (
                  <a
                    href={DASHBOARD_HREF}
                    className="btn btn-outline"
                    data-testid="blueprint-open-dashboard"
                    onClick={(e) => {
                      if (!onOpenDashboard) return;
                      e.preventDefault();
                      onOpenDashboard();
                    }}
                  >
                    <LayoutDashboard size={16} aria-hidden />
                    {wizardSaveDashboardLabel()}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {unlocked ? (
            <button
              type="button"
              className="btn btn-outline"
              data-testid="blueprint-retake-btn"
              onClick={onRetake}
            >
              <RotateCcw size={16} /> Retake the Quiz
            </button>
          ) : null}
          {unlocked && !onSaveResults ? (
            <a
              href={DASHBOARD_HREF}
              className="btn btn-outline"
              data-testid="blueprint-open-dashboard"
              onClick={(e) => {
                if (!onOpenDashboard) return;
                e.preventDefault();
                onOpenDashboard();
              }}
            >
              <LayoutDashboard size={16} aria-hidden />
              {wizardSaveDashboardLabel()}
            </a>
          ) : null}
          {unlocked ? extraActions : null}
        </div>
      )}

      {children}
    </div>
  );
}
