import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Clock,
  Heart,
  Sparkles,
  Users,
  BadgeCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Compass,
  BrainCircuit,
  Target,
  Leaf,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  SENIOR_AUDIENCE_LABEL,
  SENIOR_GUIDE_TEASERS,
  SENIOR_INTRO,
  SENIOR_OPPORTUNITIES,
  type SeniorOpportunity,
  readSeniorTeamInterest,
  writeSeniorTeamInterest,
  scoreSeniorMatch,
  type SeniorMatchAnswers,
} from "../lib/seniors-content";
import { trackGyshEvent } from "../lib/gysh-analytics";
import { hasBlueprintAccess } from "../lib/free-member-session";
import {
  clearPendingBlueprint,
  peekPendingBlueprintFor,
  savePendingBlueprintAsync,
} from "../lib/pending-blueprint";
import { saveBlueprintToAccount } from "../lib/blueprints-api";
import { SideHustleBlueprintResults } from "./SideHustleBlueprintResults";
import seniorSideHustleHero from "../assets/senior-side-hustle-hero.png";
import seniorSideHustleIdeasHero from "../assets/senior-side-hustle-ideas-hero.png";
import seniorGuidesHero from "../assets/senior-guides-hero.png";
import seniorJoinTeamHero from "../assets/senior-join-team-hero.png";

type SeniorTab = "match" | "opportunities" | "guides" | "join";

function SeniorIdeaCard({ idea }: { idea: SeniorOpportunity }) {
  return (
    <article className="glass seniors-guide-card seniors-idea-card">
      <div className="seniors-guide-card-top">
        <Briefcase size={18} style={{ color: "var(--bronze)", flexShrink: 0 }} aria-hidden="true" />
        <span className="seniors-guide-badge" title={idea.schedule}>
          {idea.schedule}
        </span>
      </div>
      <h3>{idea.name}</h3>
      <p>{idea.desc}</p>
      <p className="seniors-idea-meta">
        <Clock size={13} aria-hidden="true" />
        {idea.startup}
      </p>
    </article>
  );
}

type SeniorSideHustlesProps = {
  isLoggedIn?: boolean;
  onGoToJoin?: () => void;
  /** Open the main GYSH Guides library. */
  onOpenGuides?: () => void;
  /** Deep-link from checklist Launch Guide peeks. */
  entryTab?: SeniorTab | null;
};

type MatchTier = "Best match" | "Strong match" | "Good fit";

type ScoredMatch = {
  hustle: SeniorOpportunity;
  score: number;
  pct: number;
  tier: MatchTier;
};

type SingleKey = "lifestyle" | "availability";
type RankedKey = "skills" | "goals";

const LIFESTYLE_LABELS: Record<string, string> = {
  gentle: "Gentle pace",
  balanced: "Balanced energy",
  active: "Active & social",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  light: "A few hours / week",
  steady: "Part-time days",
  flexible: "Seasonal / as-needed",
};

const SKILL_LABELS: Record<string, string> = {
  teaching: "Teaching & coaching",
  hands_on: "Hands-on / home help",
  creative: "Crafts & making",
  hospitality: "Hospitality & hosting",
  admin: "Admin & bookkeeping",
  tech: "Tech & AI tools",
  writing: "Writing & recommending",
};

const GOAL_LABELS: Record<string, string> = {
  income: "Extra pocket income",
  purpose: "Purpose & community",
  flexible: "Flexible schedule",
  expertise: "Share my expertise",
  social: "Stay social & active",
  learn: "Keep learning",
};

function tierForRank(index: number, pct: number): MatchTier {
  if (index === 0) return "Best match";
  if (pct >= 70 || index === 1) return "Strong match";
  return "Good fit";
}

function SeniorMatchFinder({
  onBrowseOpportunities,
  isLoggedIn = false,
  onUnlockBlueprint,
}: {
  onBrowseOpportunities: () => void;
  isLoggedIn?: boolean;
  onUnlockBlueprint?: () => void;
}) {
  const unlocked = hasBlueprintAccess({ isLoggedIn, ageGroup: "senior" });
  const startedRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SeniorMatchAnswers>({
    lifestyle: "",
    availability: "",
    skills: [],
    goals: [],
  });
  const [rankedResults, setRankedResults] = useState<ScoredMatch[] | null>(null);
  const [validationHint, setValidationHint] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackGyshEvent("find_side_hustle_started", { age_group: "senior" });
    const pending = peekPendingBlueprintFor("senior");
    if (!pending || !unlocked) return;
    const restored: SeniorMatchAnswers = {
      lifestyle: String(pending.answers.lifestyle ?? ""),
      availability: String(pending.answers.availability ?? ""),
      skills: Array.isArray(pending.answers.skills) ? pending.answers.skills.map(String) : [],
      goals: Array.isArray(pending.answers.goals) ? pending.answers.goals.map(String) : [],
    };
    if (!restored.lifestyle || restored.skills.length < 1) return;
    setAnswers(restored);
    const scored = SENIOR_OPPORTUNITIES.map((hustle) => ({
      hustle,
      score: scoreSeniorMatch(hustle.id, restored),
    }));
    scored.sort((a, b) => b.score - a.score);
    const maxScore = Math.max(scored[0]?.score ?? 1, 1);
    const results: ScoredMatch[] = scored.slice(0, 5).map((row, index) => {
      const pct = Math.round((row.score / maxScore) * 100);
      return { ...row, pct, tier: tierForRank(index, pct) };
    });
    setRankedResults(results);
    trackGyshEvent("blueprint_unlocked", { age_group: "senior", match_count: results.length });
    trackGyshEvent("blueprint_saved", { age_group: "senior", match_count: results.length });
    clearPendingBlueprint();
  }, [unlocked]);

  const steps = [
    {
      key: "lifestyle" as const,
      mode: "single" as const,
      title: "What pace fits your life right now?",
      subtitle: "No grind culture — pick the energy level that feels sustainable.",
      icon: <Leaf size={24} style={{ color: "#6b4f3a" }} />,
      options: [
        { label: "Gentle — mostly seated or light activity", value: "gentle" },
        { label: "Balanced — mix of home and out-and-about", value: "balanced" },
        { label: "Active — I like being on my feet / social", value: "active" },
      ],
    },
    {
      key: "skills" as const,
      mode: "ranked" as const,
      maxSelect: 2,
      minSelect: 1,
      title: "Where do your strengths shine?",
      subtitle: "Select up to 2. Tap order sets priority — first tap is #1.",
      icon: <BrainCircuit size={24} style={{ color: "var(--crimson)" }} />,
      options: [
        { label: "Teaching, tutoring & coaching", value: "teaching" },
        { label: "Hands-on / home help", value: "hands_on" },
        { label: "Crafts & making", value: "creative" },
        { label: "Hospitality & hosting", value: "hospitality" },
        { label: "Admin, books & organization", value: "admin" },
        { label: "Tech & AI tools", value: "tech" },
        { label: "Writing & recommending", value: "writing" },
      ],
    },
    {
      key: "goals" as const,
      mode: "ranked" as const,
      maxSelect: 3,
      minSelect: 2,
      title: "What matters most in this chapter?",
      subtitle: "Select 2 or more. Tap order ranks them — #1 weighs most.",
      icon: <Target size={24} style={{ color: "var(--crimson)" }} />,
      options: [
        { label: "Extra pocket income", value: "income" },
        { label: "Purpose & helping others", value: "purpose" },
        { label: "Flexible, low-pressure schedule", value: "flexible" },
        { label: "Share decades of expertise", value: "expertise" },
        { label: "Stay social and active", value: "social" },
        { label: "Keep learning something new", value: "learn" },
      ],
    },
    {
      key: "availability" as const,
      mode: "single" as const,
      title: "How much time can you comfortably give?",
      subtitle: "Be honest — the best hustle fits the calendar you already have.",
      icon: <Clock size={24} style={{ color: "#6b4f3a" }} />,
      options: [
        { label: "A few hours per week", value: "light" },
        { label: "Steady part-time days", value: "steady" },
        { label: "Seasonal or as-needed blocks", value: "flexible" },
      ],
    },
  ];

  const currentStepData = steps[currentStep];
  const progressPercent = (currentStep / steps.length) * 100;

  const isStepComplete = (): boolean => {
    const step = steps[currentStep];
    if (step.mode === "single") {
      return Boolean(answers[step.key as SingleKey]);
    }
    return answers[step.key as RankedKey].length >= step.minSelect;
  };

  const handleSelectSingle = (value: string) => {
    const key = currentStepData.key as SingleKey;
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setValidationHint(null);
  };

  const handleToggleRanked = (value: string) => {
    const step = currentStepData;
    if (step.mode !== "ranked") return;
    const key = step.key as RankedKey;

    setAnswers((prev) => {
      const current = prev[key];
      const idx = current.indexOf(value);

      if (idx >= 0) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      }

      if (current.length >= step.maxSelect) {
        setValidationHint(
          key === "skills"
            ? "You can prioritize up to 2 strengths. Deselect one to change your picks."
            : "You can prioritize up to 3 goals. Deselect one to change your picks."
        );
        return prev;
      }

      setValidationHint(null);
      return { ...prev, [key]: [...current, value] };
    });
  };

  const rankOf = (key: RankedKey, value: string): number | null => {
    const idx = answers[key].indexOf(value);
    return idx >= 0 ? idx + 1 : null;
  };

  const calculateResults = () => {
    const scored = SENIOR_OPPORTUNITIES.map((hustle) => ({
      hustle,
      score: scoreSeniorMatch(hustle.id, answers),
    }));
    scored.sort((a, b) => b.score - a.score);
    const maxScore = Math.max(scored[0]?.score ?? 1, 1);
    const results: ScoredMatch[] = scored.slice(0, 5).map((row, index) => {
      const pct = Math.round((row.score / maxScore) * 100);
      return { ...row, pct, tier: tierForRank(index, pct) };
    });
    setRankedResults(results);
    void savePendingBlueprintAsync({
      ageGroup: "senior",
      answers: answers as unknown as Record<string, unknown>,
      resultIds: results.map((r) => r.hustle.id),
      resultPcts: Object.fromEntries(results.map((r) => [r.hustle.id, r.pct])),
      returnView: "seniors",
      returnTab: "match",
    });
    trackGyshEvent("find_side_hustle_completed", {
      age_group: "senior",
      match_count: results.length,
    });
    if (!unlocked) {
      trackGyshEvent("partial_blueprint_viewed", {
        age_group: "senior",
        match_count: results.length,
        unlocked: false,
      });
    } else {
      trackGyshEvent("blueprint_unlocked", { age_group: "senior", match_count: results.length });
      trackGyshEvent("blueprint_saved", { age_group: "senior", match_count: results.length });
      void saveBlueprintToAccount({
        ageGroup: "senior",
        answers: answers as unknown as Record<string, unknown>,
        resultIds: results.map((r) => r.hustle.id),
        resultPcts: Object.fromEntries(results.map((r) => [r.hustle.id, r.pct])),
      });
      clearPendingBlueprint();
    }
  };

  const handleNext = () => {
    if (!isStepComplete()) {
      const step = currentStepData;
      if (step.mode === "ranked" && step.key === "skills") {
        setValidationHint("Select at least 1 strength (up to 2, ranked by tap order).");
      } else if (step.mode === "ranked" && step.key === "goals") {
        setValidationHint("Select at least 2 goals. Tap order sets priority 1 → 2 → 3.");
      } else {
        setValidationHint("Please choose an option to continue.");
      }
      return;
    }
    setValidationHint(null);
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setValidationHint(null);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleUnlock = () => {
    if (rankedResults) {
      void savePendingBlueprintAsync({
        ageGroup: "senior",
        answers: answers as unknown as Record<string, unknown>,
        resultIds: rankedResults.map((r) => r.hustle.id),
        resultPcts: Object.fromEntries(rankedResults.map((r) => [r.hustle.id, r.pct])),
        returnView: "seniors",
        returnTab: "match",
      });
    }
    trackGyshEvent("blueprint_unlock_clicked", { age_group: "senior" });
    trackGyshEvent("registration_started_from_blueprint", { age_group: "senior" });
    onUnlockBlueprint?.();
  };

  const resetQuiz = () => {
    clearPendingBlueprint();
    trackGyshEvent("wizard_retaken", { age_group: "senior" });
    setCurrentStep(0);
    setAnswers({ lifestyle: "", availability: "", skills: [], goals: [] });
    setRankedResults(null);
    setValidationHint(null);
  };

  const canProceed = isStepComplete();

  return (
    <div className="match-finder-adult-wrap" data-testid="seniors-match-finder">
      <div className="match-finder-adult-inline">
        <div className="match-finder-adult-media-pane">
          <div className="match-finder-adult-hero">
            <img
              src={seniorSideHustleHero}
              alt="Get Your Side Hustle for seniors 50+ — Your experience. Your freedom. Your side hustle."
              className="match-finder-adult-hero-img"
              width={1600}
              height={900}
              decoding="async"
            />
          </div>
        </div>

        <div className="match-finder-adult-card glass">
          {rankedResults === null ? (
            <>
              <div className="match-finder-adult-progress-meta">
                <span>GYSH Seniors Match Wizard</span>
                <span>
                  Question {currentStep + 1} of {steps.length}
                </span>
              </div>
              <div className="match-finder-adult-progress-bar">
                <div
                  className="match-finder-adult-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="match-finder-adult-header">
                <div className="match-finder-adult-icon">{currentStepData.icon}</div>
                <div>
                  <h2>{currentStepData.title}</h2>
                  <p>{currentStepData.subtitle}</p>
                </div>
              </div>

              {currentStepData.mode === "ranked" && (
                <div className="quiz-rank-legend match-finder-adult-rank-legend">
                  {currentStepData.key === "skills" ? (
                    <span>
                      Selected: <strong>{answers.skills.length}/2</strong>
                      {answers.skills.length > 0 && (
                        <>
                          {" "}
                          · Priority:{" "}
                          {answers.skills.map((v, i) => (
                            <span key={v} className="quiz-rank-chip">
                              #{i + 1} {SKILL_LABELS[v]}
                            </span>
                          ))}
                        </>
                      )}
                    </span>
                  ) : (
                    <span>
                      Selected: <strong>{answers.goals.length}</strong> (need 2+)
                      {answers.goals.length > 0 && (
                        <>
                          {" "}
                          · Top ranks:{" "}
                          {answers.goals.slice(0, 3).map((v, i) => (
                            <span key={v} className="quiz-rank-chip">
                              #{i + 1} {GOAL_LABELS[v]}
                            </span>
                          ))}
                        </>
                      )}
                    </span>
                  )}
                </div>
              )}

              <div className="match-finder-adult-options">
                {currentStepData.options.map((option) => {
                  if (currentStepData.mode === "single") {
                    const selected = answers[currentStepData.key as SingleKey] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`match-finder-adult-option ${selected ? "is-selected" : ""}`}
                        onClick={() => handleSelectSingle(option.value)}
                      >
                        {option.label}
                      </button>
                    );
                  }

                  const key = currentStepData.key as RankedKey;
                  const selected = answers[key].includes(option.value);
                  const rank = rankOf(key, option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`match-finder-adult-option ${selected ? "is-selected" : ""} ${
                        rank === 1 ? "ranked-1" : ""
                      }`}
                      onClick={() => handleToggleRanked(option.value)}
                    >
                      {rank !== null && <span className="quiz-option-rank">#{rank}</span>}
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {validationHint && (
                <p className="quiz-validation" role="status">
                  {validationHint}
                </p>
              )}

              <div className="match-finder-adult-nav">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="btn btn-outline"
                  style={{ visibility: currentStep === 0 ? "hidden" : "visible", gap: 6 }}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="btn btn-primary"
                  style={{ gap: 6 }}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      See matches <Sparkles size={16} />
                    </>
                  ) : (
                    <>
                      Next <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <SideHustleBlueprintResults
              ageGroup="senior"
              matches={rankedResults.map((row) => ({
                id: row.hustle.id,
                title: row.hustle.name,
                description: row.hustle.desc,
                pct: row.pct,
                tier: row.tier,
                whyFits: `${row.tier} for your pace, strengths, goals, and availability — a Side Hustle that fits this chapter of life.`,
                benefits: [row.hustle.fit, row.hustle.schedule, row.hustle.startup],
                meta: [
                  { label: "Best fit", value: row.hustle.fit },
                  { label: "Schedule", value: row.hustle.schedule },
                  { label: "Startup", value: row.hustle.startup },
                ],
              }))}
              unlocked={unlocked}
              onUnlock={handleUnlock}
              onRetake={resetQuiz}
              extraActions={
                unlocked ? (
                  <button
                    type="button"
                    onClick={onBrowseOpportunities}
                    className="btn btn-primary"
                    style={{ gap: 6 }}
                  >
                    <Briefcase size={16} /> Browse all Side Hustle ideas
                  </button>
                ) : undefined
              }
            />
          )}
        </div>
      </div>

    </div>
  );
}

function SeniorTabHero({
  compact = false,
  banner = false,
  src = seniorSideHustleHero,
  alt = "Get Your Side Hustle for seniors 50+ — Your experience. Your freedom. Your side hustle.",
}: {
  compact?: boolean;
  banner?: boolean;
  src?: string;
  alt?: string;
}) {
  return (
    <div
      className={`seniors-tab-hero${compact ? " is-compact" : ""}${banner ? " is-banner" : ""}`}
      data-testid="seniors-tab-hero"
    >
      <img
        src={src}
        alt={alt}
        className="seniors-tab-hero-img"
        width={1600}
        height={900}
        decoding="async"
      />
    </div>
  );
}

export function SeniorSideHustles({
  isLoggedIn = false,
  onGoToJoin,
  onOpenGuides,
  entryTab = null,
}: SeniorSideHustlesProps) {
  const [tab, setTab] = useState<SeniorTab>("match");
  const [interested, setInterested] = useState(() => readSeniorTeamInterest() || isLoggedIn);
  const sideIdeas = SENIOR_OPPORTUNITIES.slice(0, 3);
  const belowIdeas = SENIOR_OPPORTUNITIES.slice(3);

  useEffect(() => {
    if (entryTab) setTab(entryTab);
  }, [entryTab]);

  const markInterest = () => {
    writeSeniorTeamInterest();
    setInterested(true);
  };

  return (
    <div className="seniors-stage" data-testid="seniors-page">
      <div className="seniors-lead">
        <span className="flat-label flat-label--accent">{SENIOR_AUDIENCE_LABEL}</span>
        <h2 className="seniors-lead-title">
          <Heart size={22} aria-hidden="true" />
          {SENIOR_INTRO.headline}
        </h2>
        <p className="seniors-lead-copy">{SENIOR_INTRO.lead}</p>
        {tab === "opportunities" && (
          <p className="seniors-lead-ideas">
            Ideas suited to experience, flexible hours, and lower physical intensity — pick what
            matches your energy and interests.
          </p>
        )}
      </div>

      <div className="kids-tab-bar seniors-tab-bar" role="tablist" aria-label="GYSH Seniors Corner sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "match"}
          className={`nav-link-btn${tab === "match" ? " active" : ""}`}
          style={{ borderRadius: 10 }}
          onClick={() => setTab("match")}
          data-testid="seniors-tab-match"
        >
          <Compass size={16} aria-hidden="true" />
          GYSH Match Wizard
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "opportunities"}
          className={`nav-link-btn${tab === "opportunities" ? " active" : ""}`}
          style={{ borderRadius: 10 }}
          onClick={() => setTab("opportunities")}
          data-testid="seniors-tab-opportunities"
        >
          <Briefcase size={16} aria-hidden="true" />
          Ideas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "guides"}
          className={`nav-link-btn${tab === "guides" ? " active" : ""}`}
          style={{ borderRadius: 10 }}
          onClick={() => setTab("guides")}
          data-testid="seniors-tab-guides"
        >
          <BookOpen size={16} aria-hidden="true" />
          Guides
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "join"}
          className={`nav-link-btn${tab === "join" ? " active" : ""}`}
          style={{ borderRadius: 10 }}
          onClick={() => setTab("join")}
          data-testid="seniors-tab-join"
        >
          <Users size={16} aria-hidden="true" />
          Join
        </button>
      </div>

      {tab === "match" && (
        <div role="tabpanel">
          <SeniorMatchFinder
            onBrowseOpportunities={() => setTab("opportunities")}
            isLoggedIn={isLoggedIn}
            onUnlockBlueprint={onGoToJoin}
          />
        </div>
      )}

      {tab === "opportunities" && (
        <div className="seniors-ideas-stage" role="tabpanel">
          <div className="seniors-guides-layout seniors-ideas-layout">
            <SeniorTabHero
              banner
              src={seniorSideHustleIdeasHero}
              alt="Side Hustle Ideas for Seniors — smart, flexible, rewarding ways to turn your skills and passions into extra income on your terms."
            />
            <div className="seniors-guides-side" aria-label="Side hustle ideas beside banner">
              {sideIdeas.map((idea) => (
                <SeniorIdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
            <div className="seniors-guides-below seniors-ideas-below" aria-label="More side hustle ideas">
              {belowIdeas.map((idea) => (
                <SeniorIdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "guides" && (
        <div className="seniors-guides-stage" role="tabpanel">
          <div className="seniors-guides-split">
            <SeniorTabHero
              banner
              src={seniorGuidesHero}
              alt="Get Your Side Hustle Senior Guides — smart, flexible side hustles for seniors who want extra income, purpose, and freedom on your terms."
            />
            <div className="glass seniors-guides-panel">
              <div className="seniors-guides-panel-copy">
                <h3 className="seniors-guides-panel-title">
                  <BookOpen size={22} aria-hidden="true" />
                  Senior Guides preview
                </h3>
                <p>
                  Step-by-step Senior guides are on the way. Here&apos;s what we&apos;re drafting —
                  full Launch Guides still cover many of these hustles for all adults.
                </p>
              </div>
              <ul className="seniors-guides-panel-list">
                {SENIOR_GUIDE_TEASERS.map((g) => (
                  <li key={g.id}>
                    <span className={`seniors-guide-badge seniors-guide-badge--${g.status}`}>
                      {g.status === "preview" ? "Preview" : "Coming soon"}
                    </span>
                    <div>
                      <strong>{g.title}</strong>
                      <span>{g.blurb}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="seniors-guides-panel-actions">
                {onOpenGuides && (
                  <button type="button" className="btn btn-primary seniors-btn" onClick={onOpenGuides}>
                    Browse GYSH Guides <ArrowRight size={18} />
                  </button>
                )}
                {onGoToJoin && (
                  <button type="button" className="btn btn-outline seniors-btn" onClick={onGoToJoin}>
                    Join for full member guides
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "join" && (
        <div className="seniors-join-stage" role="tabpanel">
          <div className="seniors-join-layout">
            <SeniorTabHero
              banner
              src={seniorJoinTeamHero}
              alt="Join the Senior Side Hustle Team — use your skills, earn on your terms, and make extra income doing what you love."
            />
            <div className="glass seniors-join">
              <div className="seniors-join-copy">
                <h3 className="seniors-join-title">
                  <Users size={22} aria-hidden="true" />
                  Join the Senior Side Hustle team
                </h3>
                <p>
                  A lightweight interest flag for senior-focused updates, workshops, and guides.
                  A full GYSH account unlocks bookmarks and launch guides sitewide.
                </p>
              </div>
              <ul className="seniors-join-perks">
                <li>
                  <BadgeCheck size={18} aria-hidden="true" />
                  Early looks at senior-focused guides and workshop nights
                </li>
                <li>
                  <BadgeCheck size={18} aria-hidden="true" />
                  Peer learning — share skills, try AI prompting, stay curious
                </li>
                <li>
                  <BadgeCheck size={18} aria-hidden="true" />
                  Same GYSH community as adults and families
                </li>
              </ul>

              {interested ? (
                <div className="seniors-join-footer">
                  <div className="seniors-join-done" role="status">
                    <BadgeCheck size={20} aria-hidden="true" />
                    You&apos;re on the Senior interest list
                    {isLoggedIn ? " (and signed in as a GYSH member)." : "."}
                  </div>
                  {onGoToJoin && !isLoggedIn && (
                    <button type="button" className="btn btn-outline seniors-btn" onClick={onGoToJoin}>
                      Create free GYSH account <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="seniors-join-actions">
                  <button type="button" className="btn btn-primary seniors-btn" onClick={markInterest}>
                    I&apos;m interested <Heart size={18} />
                  </button>
                  {onGoToJoin && (
                    <button type="button" className="btn btn-outline seniors-btn" onClick={onGoToJoin}>
                      Create free GYSH account <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
