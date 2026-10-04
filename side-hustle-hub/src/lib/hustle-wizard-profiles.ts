/**
 * Adult Match Wizard skill/goal profiles keyed by hustle id.
 * Existing 16 preserved; new adult catalog hustles get sensible defaults.
 */

export type AdultWizardProfile = {
  skills: Partial<Record<string, number>>;
  goals: Partial<Record<string, number>>;
  budgets: string[];
  times: string[];
};

const BASE: Record<string, AdultWizardProfile> = {
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
  "digital-products": {
    skills: { creative: 1, marketing: 0.55, tech: 0.35 },
    goals: { passive: 1, brand: 0.7, scale: 0.4 },
    budgets: ["low", "medium"],
    times: ["very_low", "medium", "high"],
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
  "cleaning-service": {
    skills: { hands_on: 1, operations: 0.55 },
    goals: { local: 1, flexible: 0.75, physical: 0.55, helping: 0.4 },
    budgets: ["low", "medium"],
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

/** Heuristic profile from catalog matchTags when no hand-tuned entry exists. */
export function profileFromTags(matchTags: string[]): AdultWizardProfile {
  const skills: AdultWizardProfile["skills"] = {};
  const goals: AdultWizardProfile["goals"] = {};
  if (matchTags.includes("creative")) skills.creative = 1;
  if (matchTags.includes("tech") || matchTags.includes("ai")) skills.tech = Math.max(skills.tech ?? 0, 0.85);
  if (matchTags.includes("ai")) goals.ai = 1;
  if (matchTags.includes("marketing") || matchTags.includes("people")) {
    skills.marketing = Math.max(skills.marketing ?? 0, matchTags.includes("marketing") ? 1 : 0.55);
  }
  if (matchTags.includes("operations") || matchTags.includes("hosting")) {
    skills.operations = Math.max(skills.operations ?? 0, matchTags.includes("hosting") ? 0.8 : 1);
  }
  if (matchTags.includes("physical") || matchTags.includes("outdoor") || matchTags.includes("hands_on")) {
    skills.hands_on = 1;
  }
  if (matchTags.includes("vehicle")) skills.vehicle = 1;
  if (matchTags.includes("animals")) skills.hands_on = Math.max(skills.hands_on ?? 0, 0.7);
  if (matchTags.includes("local")) goals.local = 1;
  if (matchTags.includes("weekend") || matchTags.includes("after-work") || matchTags.includes("fastest-dollar")) {
    goals.flexible = Math.max(goals.flexible ?? 0, 0.85);
  }
  if (matchTags.includes("indoor") && matchTags.includes("tech")) skills.tech = Math.max(skills.tech ?? 0, 0.7);
  const lowCost = matchTags.includes("zero-start") || matchTags.includes("no-experience");
  const lightTime =
    matchTags.includes("weekend") ||
    matchTags.includes("after-work") ||
    matchTags.includes("fastest-dollar");
  if (!Object.keys(skills).length && !Object.keys(goals).length) {
    goals.flexible = 0.35;
  }
  return {
    skills,
    goals,
    budgets: lowCost ? ["low"] : ["medium"],
    times: lightTime ? ["very_low", "medium"] : ["medium"],
  };
}

export function getAdultWizardProfile(
  hustleId: string,
  matchTags: string[] = [],
): AdultWizardProfile {
  if (BASE[hustleId]) return BASE[hustleId];
  return profileFromTags(matchTags);
}

export const HUSTLE_PROFILES: Record<string, AdultWizardProfile> = BASE;
