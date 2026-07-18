import React, { useEffect, useRef, useState } from "react";
import {
  PiggyBank,
  Clock,
  BrainCircuit,
  Target,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import matchFinderAdultHero from "../assets/match-finder-adult-hero.png";
import { trackGyshEvent } from "../lib/gysh-analytics";
import { hasBlueprintAccess } from "../lib/free-member-session";
import {
  clearPendingBlueprint,
  peekPendingBlueprintFor,
  savePendingBlueprintAsync,
} from "../lib/pending-blueprint";
import { saveBlueprintToAccount } from "../lib/blueprints-api";
import {
  SideHustleBlueprintResults,
  type BlueprintMatchCard,
} from "./SideHustleBlueprintResults";
import { WizardStartHereBanner } from "./WizardStartHereBanner";

interface HustleQuizProps {
  hustles: any[];
  onSelectAction: (hustleId: string, actionType: "calculator" | "guide") => void;
  isLoggedIn?: boolean;
  /** Unlock → Join / free account handoff */
  onUnlockBlueprint?: () => void;
}

type SingleKey = "budget" | "time";
type RankedKey = "skill" | "goal";

type Answers = {
  budget: string;
  time: string;
  /** Ordered by priority: index 0 = rank 1 */
  skill: string[];
  /** Ordered by priority: index 0 = rank 1 (top 3 used for scoring) */
  goal: string[];
};

type MatchTier = "Best match" | "Strong match" | "Good fit";

type ScoredMatch = {
  hustle: any;
  score: number;
  pct: number;
  tier: MatchTier;
};

/** How well each hustle aligns with strength / goal tags (higher = stronger fit). */
const HUSTLE_PROFILES: Record<
  string,
  {
    skills: Partial<Record<string, number>>;
    goals: Partial<Record<string, number>>;
    budgets: string[];
    times: string[];
  }
> = {
  airbnb: {
    skills: { operations: 1, marketing: 0.35 },
    goals: { physical: 1, passive: 0.55, scale: 0.3 },
    budgets: ["high", "medium"],
    times: ["medium", "high"],
  },
  pod: {
    skills: { creative: 1, marketing: 0.45 },
    goals: { passive: 1, brand: 0.4, scale: 0.55 },
    budgets: ["low", "medium"],
    times: ["very_low", "medium"],
  },
  dropshipping: {
    skills: { marketing: 1, operations: 0.5, creative: 0.35 },
    goals: { scale: 1, brand: 0.35, passive: 0.25 },
    budgets: ["medium", "high"],
    times: ["high", "medium"],
  },
  affiliate: {
    skills: { marketing: 1, creative: 0.45 },
    goals: { passive: 1, brand: 0.6, scale: 0.3 },
    budgets: ["low", "medium"],
    times: ["very_low", "medium", "high"],
  },
  amazon: {
    skills: { operations: 1, marketing: 0.55 },
    goals: { scale: 1, passive: 0.4, physical: 0.35 },
    budgets: ["high"],
    times: ["high"],
  },
  social: {
    skills: { creative: 1, marketing: 0.7 },
    goals: { brand: 1, passive: 0.35, scale: 0.4 },
    budgets: ["low", "medium"],
    times: ["medium", "high"],
  },
  "web-leads": {
    skills: { marketing: 1, tech: 0.7, creative: 0.35 },
    goals: { local: 1, scale: 0.4, brand: 0.25 },
    budgets: ["low", "medium"],
    times: ["medium", "high"],
  },
  "ai-assets": {
    skills: { creative: 1, tech: 0.75, marketing: 0.4 },
    goals: { brand: 0.7, local: 0.55, ai: 0.9, passive: 0.25 },
    budgets: ["low", "medium"],
    times: ["very_low", "medium"],
  },
  "property-mgmt": {
    skills: { operations: 1, marketing: 0.4, hands_on: 0.35 },
    goals: { physical: 1, passive: 0.5, scale: 0.35 },
    budgets: ["medium", "high"],
    times: ["medium", "high"],
  },
  handyman: {
    skills: { hands_on: 1, operations: 0.45 },
    goals: { local: 1, flexible: 0.7, physical: 0.4 },
    budgets: ["medium", "low"],
    times: ["medium", "high"],
  },
  rideshare: {
    skills: { vehicle: 1, operations: 0.3 },
    goals: { flexible: 1, local: 0.4 },
    budgets: ["low", "medium"],
    times: ["medium", "high"],
  },
  "food-delivery": {
    skills: { vehicle: 1, hands_on: 0.35 },
    goals: { flexible: 1, local: 0.45 },
    budgets: ["low"],
    times: ["very_low", "medium", "high"],
  },
  "ai-timing": {
    skills: { tech: 1, vehicle: 0.55, marketing: 0.35 },
    goals: { ai: 1, flexible: 0.75, local: 0.4 },
    budgets: ["low"],
    times: ["very_low", "medium"],
  },
  "ai-agents": {
    skills: { tech: 1, marketing: 0.5, creative: 0.3 },
    goals: { ai: 1, scale: 0.55, passive: 0.45, brand: 0.3 },
    budgets: ["low", "medium"],
    times: ["medium", "high"],
  },
  "book-publishing": {
    skills: { creative: 1, marketing: 0.65, operations: 0.35 },
    goals: { brand: 1, passive: 0.75, scale: 0.35 },
    budgets: ["low", "medium", "high"],
    times: ["medium", "high"],
  },
};

const STRENGTH_WEIGHTS = [30, 15]; // rank 1, rank 2
const GOAL_WEIGHTS = [30, 18, 10]; // rank 1, 2, 3
const BUDGET_WEIGHT = 15;
const TIME_WEIGHT = 10;

const SKILL_LABELS: Record<string, string> = {
  creative: "Creative/Design",
  marketing: "Marketing/Sales",
  operations: "Operations/Hosting",
  tech: "Tech & AI Tools",
  hands_on: "Hands-on / Local Services",
  vehicle: "Driving & Vehicle Work",
};

const GOAL_LABELS: Record<string, string> = {
  passive: "Automate passive income",
  scale: "Scale an e-commerce brand",
  physical: "Monetize properties/assets",
  brand: "Build influence & personal brand",
  local: "Serve local businesses & neighbors",
  flexible: "Flexible gig income on my schedule",
  ai: "Leverage AI tools & agents",
};

const BUDGET_LABELS: Record<string, string> = {
  low: "Under $100",
  medium: "$100–$1,000",
  high: "Over $1,000",
};

function scoreHustle(hustleId: string, answers: Answers): number {
  const profile = HUSTLE_PROFILES[hustleId];
  if (!profile) return 0;

  let score = 0;

  answers.skill.forEach((skill, i) => {
    const fit = profile.skills[skill] ?? 0;
    score += fit * (STRENGTH_WEIGHTS[i] ?? 0);
  });

  answers.goal.slice(0, 3).forEach((goal, i) => {
    const fit = profile.goals[goal] ?? 0;
    score += fit * (GOAL_WEIGHTS[i] ?? 0);
  });

  if (profile.budgets.includes(answers.budget)) score += BUDGET_WEIGHT;
  if (profile.times.includes(answers.time)) score += TIME_WEIGHT;

  return Math.round(score * 10) / 10;
}

function tierForRank(index: number, pct: number): MatchTier {
  if (index === 0) return "Best match";
  if (pct >= 70 || index === 1) return "Strong match";
  return "Good fit";
}

function toBlueprintCards(results: ScoredMatch[]): BlueprintMatchCard[] {
  return results.map((row) => ({
    id: row.hustle.id,
    title: row.hustle.name,
    description: row.hustle.description,
    pct: row.pct,
    tier: row.tier,
    badge: row.hustle.category,
    gradient: row.hustle.gradient,
    whyFits: `${row.tier} for your budget, time, strengths, and goals — a Side Hustle that fits how you want to earn.`,
    benefits: [
      `Difficulty: ${row.hustle.difficulty}`,
      `Income potential: ${row.hustle.potentialIncome}`,
      `Startup cost: ${row.hustle.startupCost}`,
    ],
    meta: [
      { label: "Difficulty", value: row.hustle.difficulty },
      { label: "Income", value: row.hustle.potentialIncome },
      { label: "Startup", value: row.hustle.startupCost },
    ],
  }));
}

export const HustleQuiz: React.FC<HustleQuizProps> = ({
  hustles,
  onSelectAction,
  isLoggedIn = false,
  onUnlockBlueprint,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    budget: "",
    time: "",
    skill: [],
    goal: [],
  });
  const [rankedResults, setRankedResults] = useState<ScoredMatch[] | null>(null);
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const startedRef = useRef(false);
  const partialViewedRef = useRef(false);

  const unlocked = hasBlueprintAccess({ isLoggedIn, ageGroup: "adult" });

  const buildResults = (nextAnswers: Answers): ScoredMatch[] => {
    const scored = hustles.map((h) => ({ hustle: h, score: scoreHustle(h.id, nextAnswers) }));
    scored.sort((a, b) => b.score - a.score);
    const maxScore = Math.max(scored[0]?.score ?? 1, 1);
    return scored.map((row, index) => {
      const pct = Math.round((row.score / maxScore) * 100);
      return { ...row, pct, tier: tierForRank(index, pct) };
    });
  };

  const persistPending = (results: ScoredMatch[], nextAnswers: Answers) => {
    void savePendingBlueprintAsync({
      ageGroup: "adult",
      answers: nextAnswers as unknown as Record<string, unknown>,
      resultIds: results.map((r) => r.hustle.id),
      resultPcts: Object.fromEntries(results.map((r) => [r.hustle.id, r.pct])),
      returnView: "quiz",
    });
  };

  const persistSavedBlueprint = (results: ScoredMatch[], nextAnswers: Answers) => {
    void saveBlueprintToAccount({
      ageGroup: "adult",
      answers: nextAnswers as unknown as Record<string, unknown>,
      resultIds: results.map((r) => r.hustle.id),
      resultPcts: Object.fromEntries(results.map((r) => [r.hustle.id, r.pct])),
    });
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackGyshEvent("find_side_hustle_started", { age_group: "adult" });

    const pending = peekPendingBlueprintFor("adult");
    if (!pending || !unlocked) return;
    const restored: Answers = {
      budget: String(pending.answers.budget ?? ""),
      time: String(pending.answers.time ?? ""),
      skill: Array.isArray(pending.answers.skill) ? pending.answers.skill.map(String) : [],
      goal: Array.isArray(pending.answers.goal) ? pending.answers.goal.map(String) : [],
    };
    if (!restored.budget || !restored.time || restored.skill.length < 1 || restored.goal.length < 2) {
      return;
    }
    setAnswers(restored);
    const results = buildResults(restored);
    setRankedResults(results);
    trackGyshEvent("blueprint_unlocked", { age_group: "adult", match_count: results.length });
    trackGyshEvent("blueprint_saved", { age_group: "adult", match_count: results.length });
    clearPendingBlueprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount
  }, []);

  const steps = [
    {
      key: "budget" as const,
      mode: "single" as const,
      title: "What is your startup budget?",
      subtitle: "How much capital are you comfortable investing to get started?",
      icon: <PiggyBank size={24} style={{ color: "#6b4f3a" }} />,
      options: [
        { label: "Less than $100 (Shoestring)", value: "low" },
        { label: "$100 - $1,000 (Moderate)", value: "medium" },
        { label: "Over $1,000 (Capital-ready)", value: "high" },
      ],
    },
    {
      key: "time" as const,
      mode: "single" as const,
      title: "How many hours can you commit?",
      subtitle: "Be realistic about the weekly time you can dedicate.",
      icon: <Clock size={24} style={{ color: "#6b4f3a" }} />,
      options: [
        { label: "2 - 5 hours per week", value: "very_low" },
        { label: "5 - 15 hours per week", value: "medium" },
        { label: "15+ hours per week", value: "high" },
      ],
    },
    {
      key: "skill" as const,
      mode: "ranked" as const,
      maxSelect: 2,
      minSelect: 1,
      maxRank: 2,
      title: "Where do your strengths lie?",
      subtitle: "Select up to 2 strengths. Tap order sets priority — first tap is #1, second is #2.",
      icon: <BrainCircuit size={24} style={{ color: "var(--crimson)" }} />,
      options: [
        { label: "Creative, Design & Media", value: "creative" },
        { label: "Marketing, Sales & Writing", value: "marketing" },
        { label: "Operations, Management & Hosting", value: "operations" },
        { label: "Tech & AI Tools", value: "tech" },
        { label: "Hands-on / Local Services", value: "hands_on" },
        { label: "Driving & Vehicle Work", value: "vehicle" },
      ],
    },
    {
      key: "goal" as const,
      mode: "ranked" as const,
      maxSelect: 4,
      minSelect: 2,
      maxRank: 3,
      title: "What are your primary goals?",
      subtitle: "Select 2 or more goals. Tap order ranks them — #1, #2, and #3 weigh most in your matches.",
      icon: <Target size={24} style={{ color: "var(--crimson)" }} />,
      options: [
        { label: "Build automated, passive income streams", value: "passive" },
        { label: "Launch a scalable e-commerce brand", value: "scale" },
        { label: "Monetize property, spaces, or physical assets", value: "physical" },
        { label: "Build influence, content & personal brand", value: "brand" },
        { label: "Serve local businesses & neighbors", value: "local" },
        { label: "Flexible gig income on my schedule", value: "flexible" },
        { label: "Leverage AI tools & agents", value: "ai" },
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
    const selected = answers[step.key as RankedKey];
    return selected.length >= step.minSelect;
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
        // Deselect — remaining keep relative order (ranks compact)
        return { ...prev, [key]: current.filter((v) => v !== value) };
      }

      if (current.length >= step.maxSelect) {
        setValidationHint(
          key === "skill"
            ? "You can prioritize up to 2 strengths. Deselect one to change your picks."
            : "All goals are selected. Deselect one if you want to change order."
        );
        return prev;
      }

      setValidationHint(null);
      return { ...prev, [key]: [...current, value] };
    });
  };

  const rankOf = (key: RankedKey, value: string): number | null => {
    const idx = answers[key].indexOf(value);
    if (idx < 0) return null;
    const maxRank = key === "skill" ? 2 : 3;
    if (idx >= maxRank) return null; // selected but outside top-3 scoring ranks
    return idx + 1;
  };

  const handleNext = () => {
    if (!isStepComplete()) {
      const step = currentStepData;
      if (step.mode === "ranked" && step.key === "skill") {
        setValidationHint("Select at least 1 strength (up to 2, ranked by tap order).");
      } else if (step.mode === "ranked" && step.key === "goal") {
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

  const resetQuiz = () => {
    clearPendingBlueprint();
    trackGyshEvent("wizard_retaken", { age_group: "adult" });
    setCurrentStep(0);
    setAnswers({ budget: "", time: "", skill: [], goal: [] });
    setRankedResults(null);
    setValidationHint(null);
    partialViewedRef.current = false;
  };

  const calculateResults = () => {
    const results = buildResults(answers);
    setRankedResults(results);
    persistPending(results, answers);
    trackGyshEvent("find_side_hustle_completed", {
      age_group: "adult",
      match_count: results.length,
    });
    if (!unlocked && !partialViewedRef.current) {
      partialViewedRef.current = true;
      trackGyshEvent("partial_blueprint_viewed", {
        age_group: "adult",
        match_count: results.length,
        unlocked: false,
      });
    }
    if (unlocked) {
      trackGyshEvent("blueprint_unlocked", { age_group: "adult", match_count: results.length });
      trackGyshEvent("blueprint_saved", { age_group: "adult", match_count: results.length });
      persistSavedBlueprint(results, answers);
      clearPendingBlueprint();
    }
  };

  const handleUnlock = () => {
    if (rankedResults) {
      persistPending(rankedResults, answers);
    }
    trackGyshEvent("blueprint_unlock_clicked", { age_group: "adult" });
    trackGyshEvent("registration_started_from_blueprint", { age_group: "adult" });
    onUnlockBlueprint?.();
  };

  const canProceed = isStepComplete();

  return (
    <div className="match-finder-adult-wrap">
      <div className="match-finder-adult-inline">
        <div className="match-finder-adult-media-pane">
          <div className="match-finder-adult-hero">
            <img
              src={matchFinderAdultHero}
              alt="Find your perfect match with the Match Finder Wizard — smart matches, real opportunities, your future."
              className="match-finder-adult-hero-img"
              width={1024}
              height={682}
            />
          </div>
        </div>

        <div className="match-finder-adult-card glass">
          {rankedResults === null ? (
            <>
              <div className="match-finder-adult-progress-meta">
                <span>GYSH Adults Match Wizard</span>
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

              {currentStep === 0 && <WizardStartHereBanner />}

              <div className="match-finder-adult-header">
                <div className="match-finder-adult-icon">{currentStepData.icon}</div>
                <div>
                  <h2>{currentStepData.title}</h2>
                  <p>{currentStepData.subtitle}</p>
                </div>
              </div>

              {currentStepData.mode === "ranked" && (
                <div className="quiz-rank-legend match-finder-adult-rank-legend">
                  {currentStepData.key === "skill" ? (
                    <span>
                      Selected: <strong>{answers.skill.length}/2</strong>
                      {answers.skill.length > 0 && (
                        <>
                          {" "}
                          · Priority:{" "}
                          {answers.skill.map((v, i) => (
                            <span key={v} className="quiz-rank-chip">
                              #{i + 1} {SKILL_LABELS[v]}
                            </span>
                          ))}
                        </>
                      )}
                    </span>
                  ) : (
                    <span>
                      Selected: <strong>{answers.goal.length}</strong> (need 2+)
                      {answers.goal.length > 0 && (
                        <>
                          {" "}
                          · Top ranks:{" "}
                          {answers.goal.slice(0, 3).map((v, i) => (
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
                  const beyondRank =
                    selected && answers[key].indexOf(option.value) >= (key === "skill" ? 2 : 3);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`match-finder-adult-option ${selected ? "is-selected" : ""} ${
                        rank ? `ranked-${rank}` : ""
                      }`}
                      onClick={() => handleToggleRanked(option.value)}
                    >
                      {rank !== null && <span className="quiz-option-rank">#{rank}</span>}
                      {beyondRank && <span className="quiz-option-rank muted">+</span>}
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

              <p className="wizard-fill-tip">
                Tip: Honest answers beat perfect ones — we match hustles to your real budget, hours, strengths, and
                goals so your next step feels doable.
              </p>

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
              ageGroup="adult"
              matches={toBlueprintCards(rankedResults)}
              unlocked={unlocked}
              onUnlock={handleUnlock}
              onRetake={resetQuiz}
              onSelectCalculator={
                unlocked ? (id) => onSelectAction(id, "calculator") : undefined
              }
              onSelectGuide={unlocked ? (id) => onSelectAction(id, "guide") : undefined}
            >
              {unlocked && (
                <div className="match-finder-adult-how">
                  <strong>How your ranking works</strong>
                  <ul>
                    <li>
                      <strong>Budget ({BUDGET_LABELS[answers.budget]})</strong> and time commitment
                      nudge Side Hustle fits that match your resources.
                    </li>
                    <li>
                      <strong>Strengths:</strong>{" "}
                      {answers.skill.map((s, i) => `#${i + 1} ${SKILL_LABELS[s]}`).join(" · ") || "—"} —
                      priority #1 counts about twice as much as #2.
                    </li>
                    <li>
                      <strong>Goals:</strong>{" "}
                      {answers.goal
                        .slice(0, 3)
                        .map((g, i) => `#${i + 1} ${GOAL_LABELS[g]}`)
                        .join(" · ") || "—"}{" "}
                      — #1 weighs most, then #2, then #3.
                    </li>
                    <li>
                      Results are sorted best Side Hustle match → lower matches using those weighted
                      scores.
                    </li>
                  </ul>
                </div>
              )}
            </SideHustleBlueprintResults>
          )}
        </div>
      </div>
    </div>
  );
};
