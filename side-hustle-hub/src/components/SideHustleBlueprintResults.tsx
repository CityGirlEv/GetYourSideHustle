import {
  BookOpen,
  Calculator,
  ChevronDown,
  Lock,
  RotateCcw,
  Sparkles,
  Unlock,
} from "lucide-react";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";

export type BlueprintMatchCard = {
  id: string;
  title: string;
  description: string;
  pct?: number;
  tier?: string;
  badge?: string;
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
  onSelectCalculator?: (id: string) => void;
  /** Extra actions under full results (e.g. Piggy Bank). */
  extraActions?: React.ReactNode;
  /** How-scoring / safety blocks already rendered by parent. */
  children?: React.ReactNode;
};

const LOCKED_COUNT_MIN = 3;
const LOCKED_COUNT_MAX = 5;

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
  onSelectCalculator,
  extraActions,
  children,
}: SideHustleBlueprintResultsProps) {
  const top = matches[0];
  const lockedPool = matches.slice(1);
  const lockedCount = Math.min(
    LOCKED_COUNT_MAX,
    Math.max(LOCKED_COUNT_MIN, lockedPool.length || LOCKED_COUNT_MIN),
  );
  const lockedMatches = unlocked
    ? []
    : lockedPool.slice(0, lockedCount).length > 0
      ? lockedPool.slice(0, lockedCount)
      : Array.from({ length: Math.min(3, lockedCount) }, (_, i) => ({
          id: `locked-placeholder-${i}`,
          title: "Personalized Side Hustle match",
          description: "",
        }));

  const fullMatches = unlocked ? matches : top ? [top] : [];

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
            ? `Here is your complete ${blueprintTitle(ageGroup)} — ranked Side Hustle ideas based on your answers.`
            : "We found personalized Side Hustle ideas based on your answers. Here is your top match. Create a free account to unlock the complete Blueprint and save your progress."}
        </p>
        {!unlocked && (
          <p className="side-hustle-blueprint-sublead">
            We found Side Hustle ideas that match your interests, skills, schedule, and goals.
          </p>
        )}
      </div>

      <div className="quiz-results-list side-hustle-blueprint-list">
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

            {unlocked && (onSelectCalculator || onSelectGuide) && (
              <div className="side-hustle-blueprint-card-actions">
                {onSelectCalculator && (
                  <button
                    type="button"
                    onClick={() => onSelectCalculator(row.id)}
                    className="btn btn-outline"
                  >
                    <Calculator size={14} /> Calculator
                  </button>
                )}
                {onSelectGuide && (
                  <button
                    type="button"
                    onClick={() => onSelectGuide(row.id)}
                    className="btn btn-primary"
                  >
                    <BookOpen size={14} /> Launch Guide
                  </button>
                )}
              </div>
            )}
          </article>
        ))}

        {!unlocked && (
          <section
            className="side-hustle-blueprint-gate glass"
            data-testid="blueprint-unlock-gate"
            aria-labelledby="blueprint-gate-title"
          >
            <div
              className="side-hustle-blueprint-unlock-banner"
              data-testid="blueprint-unlock-banner"
              role="status"
            >
              <span className="side-hustle-blueprint-unlock-banner-pulse" aria-hidden="true" />
              <p className="side-hustle-blueprint-unlock-banner-text">
                <strong>
                  <Lock size={18} aria-hidden />
                  More matches are locked below
                </strong>
                <span className="side-hustle-blueprint-unlock-banner-sub">
                  Unlock your full Side Hustle Blueprint to see them
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

        {!unlocked &&
          lockedMatches.map((row, index) => (
            <article
              key={row.id}
              className="quiz-result-card glass-card side-hustle-blueprint-card is-locked"
              data-testid={`blueprint-locked-${index}`}
              aria-label={`Locked Side Hustle match ${index + 2}`}
            >
              <div className="side-hustle-blueprint-lock-overlay" aria-hidden="true">
                <Lock size={22} />
              </div>
              <div className="quiz-result-header side-hustle-blueprint-locked-head">
                <h3>
                  {index + 2}. {row.title}
                </h3>
              </div>
              <p className="side-hustle-blueprint-locked-blur">
                Unlock your free account to see why this Side Hustle fits and how to get started.
              </p>
            </article>
          ))}
      </div>

      {unlocked && (
        <div className="side-hustle-blueprint-unlocked-actions match-finder-adult-actions">
          <button
            type="button"
            className="btn btn-outline"
            data-testid="blueprint-retake-btn"
            onClick={onRetake}
          >
            <RotateCcw size={16} /> Retake the Quiz
          </button>
          {extraActions}
        </div>
      )}

      {children}
    </div>
  );
}
