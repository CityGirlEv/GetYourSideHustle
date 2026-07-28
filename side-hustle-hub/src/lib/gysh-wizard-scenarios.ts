/**
 * Wizard scenario tests for Admin Testing Portal.
 * Case definitions live in code; pass/fail statuses persist in D1.
 *
 * ~972 matrix paths are suite "vitest" (automated via npm run test:unit).
 * Owned by the Vitest QA Runner — not human testers.
 */

import type { TestOwnerId } from "./gysh-roles";
import type { TestCase } from "./gysh-test-plan";

type Opt = { label: string; value: string; short: string };

const ADULT_BUDGETS: Opt[] = [
  { label: "Less than $100 (Shoestring)", value: "low", short: "Budget <$100" },
  { label: "$100 - $1,000 (Moderate)", value: "medium", short: "Budget $100–$1k" },
  { label: "Over $1,000 (Capital-ready)", value: "high", short: "Budget $1k+" },
];

const ADULT_TIMES: Opt[] = [
  { label: "2 - 5 hours per week", value: "very_low", short: "2–5 hrs/wk" },
  { label: "5 - 15 hours per week", value: "medium", short: "5–15 hrs/wk" },
  { label: "15+ hours per week", value: "high", short: "15+ hrs/wk" },
];

const ADULT_SKILLS: Opt[] = [
  { label: "Creative, Design & Media", value: "creative", short: "Creative" },
  { label: "Marketing, Sales & Writing", value: "marketing", short: "Marketing" },
  { label: "Operations, Management & Hosting", value: "operations", short: "Operations" },
  { label: "Tech & AI Tools", value: "tech", short: "Tech & AI" },
  { label: "Hands-on / Local Services", value: "hands_on", short: "Hands-on" },
  { label: "Driving & Vehicle Work", value: "vehicle", short: "Driving" },
];

const ADULT_GOALS: Opt[] = [
  { label: "Build automated, passive income streams", value: "passive", short: "Passive income" },
  { label: "Launch a scalable e-commerce brand", value: "scale", short: "Scale ecom" },
  { label: "Monetize property, spaces, or physical assets", value: "physical", short: "Property/assets" },
  { label: "Build influence, content & personal brand", value: "brand", short: "Brand" },
  { label: "Serve local businesses & neighbors", value: "local", short: "Local" },
  { label: "Flexible gig income on my schedule", value: "flexible", short: "Flexible gig" },
  { label: "Leverage AI tools & agents", value: "ai", short: "AI tools" },
];

const SENIOR_LIFESTYLES: Opt[] = [
  { label: "Gentle — mostly seated or light activity", value: "gentle", short: "Gentle pace" },
  { label: "Balanced — mix of home and out-and-about", value: "balanced", short: "Balanced energy" },
  { label: "Active — I like being on my feet / social", value: "active", short: "Active & social" },
];

const SENIOR_SKILLS: Opt[] = [
  { label: "Teaching, tutoring & coaching", value: "teaching", short: "Teaching" },
  { label: "Hands-on / home help", value: "hands_on", short: "Hands-on" },
  { label: "Crafts & making", value: "creative", short: "Crafts" },
  { label: "Hospitality & hosting", value: "hospitality", short: "Hospitality" },
  { label: "Admin, books & organization", value: "admin", short: "Admin" },
  { label: "Tech & AI tools", value: "tech", short: "Tech & AI" },
  { label: "Writing & recommending", value: "writing", short: "Writing" },
];

const SENIOR_GOALS: Opt[] = [
  { label: "Extra pocket income", value: "income", short: "Income" },
  { label: "Purpose & helping others", value: "purpose", short: "Purpose" },
  { label: "Flexible, low-pressure schedule", value: "flexible", short: "Flexible" },
  { label: "Share decades of expertise", value: "expertise", short: "Expertise" },
  { label: "Stay social and active", value: "social", short: "Social" },
  { label: "Keep learning something new", value: "learn", short: "Learn" },
];

const SENIOR_AVAIL: Opt[] = [
  { label: "A few hours per week", value: "light", short: "Light hours" },
  { label: "Steady part-time days", value: "steady", short: "Steady part-time" },
  { label: "Seasonal or as-needed blocks", value: "flexible", short: "Seasonal / as-needed" },
];

const KIDS_AGES: Opt[] = [
  { label: "Ages 4 – 8", value: "young", short: "Ages 4–8" },
  { label: "Ages 9 – 12", value: "mid", short: "Ages 9–12" },
];

const JUNIOR_AGES: Opt[] = [
  { label: "Ages 13 – 14", value: "mid", short: "Ages 13–14" },
  { label: "Ages 15 – 17", value: "older", short: "Ages 15–17" },
];

const KID_INTERESTS: Opt[] = [
  { label: "Animals & pets", value: "animals", short: "Animals" },
  { label: "Making art & crafts", value: "creative", short: "Creative" },
  { label: "Being outside", value: "outdoors", short: "Outdoors" },
  { label: "Helping people", value: "helping", short: "Helping" },
  { label: "Tech & gadgets", value: "tech", short: "Tech" },
  { label: "AI & making games", value: "ai", short: "AI & games" },
];

const KID_PLACES: Opt[] = [
  { label: "Mostly outdoors", value: "outdoor", short: "Outdoors" },
  { label: "Mostly indoors", value: "indoor", short: "Indoors" },
  { label: "Either is fine", value: "either", short: "Either place" },
];

const KID_TIMES: Opt[] = [
  { label: "A little (under 1 hour)", value: "short", short: "Short time" },
  { label: "A bit (1 – 3 hours / week)", value: "medium", short: "Medium time" },
  { label: "More free time (3+ hours)", value: "long", short: "Long time" },
];

function companionGoal<T extends Opt>(primary: T, pool: T[]): T {
  return pool.find((g) => g.value !== primary.value) ?? pool[0];
}

function pad(n: number, width = 3): string {
  return String(n).padStart(width, "0");
}

function buildKidsJuniorCases(): TestCase[] {
  const cases: TestCase[] = [];
  let kidsN = 0;
  let jrN = 0;

  for (const age of KIDS_AGES) {
    for (const interest of KID_INTERESTS) {
      for (const place of KID_PLACES) {
        for (const time of KID_TIMES) {
          kidsN += 1;
          cases.push({
            id: `KIDS-FMSH-${pad(kidsN)}`,
            area: "Kids Get Your Side Hustle",
            title: `[Kids FMSH] ${age.short} · ${interest.short} · ${place.short} · ${time.short}`,
            priority: "P1",
            roles: ["kid", "qa", "admin"],
            assignees: ["vitest"],
            suite: "vitest",
            path: "kids",
            steps: [
              "Covered by automated Vitest wizard matrix (npm run test:unit)",
              `Path: age=${age.value}, interest=${interest.value}, place=${place.value}, time=${time.value}`,
            ],
            expected:
              "Kids wizard returns a ranked kid hustle match for every age × interest × place × time path",
          });
        }
      }
    }
  }

  for (const age of JUNIOR_AGES) {
    for (const interest of KID_INTERESTS) {
      for (const place of KID_PLACES) {
        for (const time of KID_TIMES) {
          jrN += 1;
          cases.push({
            id: `JR-FMSH-${pad(jrN)}`,
            area: "Teens Get Your Side Hustle",
            title: `[Teens FMSH] ${age.short} · ${interest.short} · ${place.short} · ${time.short}`,
            priority: "P1",
            roles: ["junior", "qa", "admin"],
            assignees: ["vitest"],
            suite: "vitest",
            path: "kids",
            steps: [
              "Covered by automated Vitest wizard matrix (npm run test:unit)",
              `Path: age=${age.value}, interest=${interest.value}, place=${place.value}, time=${time.value}`,
            ],
            expected:
              "Teens wizard returns a ranked teen hustle match for every age × interest × place × time path",
          });
        }
      }
    }
  }

  return cases;
}

function buildAdultCases(): TestCase[] {
  const cases: TestCase[] = [];
  let n = 0;

  for (const budget of ADULT_BUDGETS) {
    for (const time of ADULT_TIMES) {
      for (const skill of ADULT_SKILLS) {
        for (const goal of ADULT_GOALS) {
          n += 1;
          const goal2 = companionGoal(goal, ADULT_GOALS);
          cases.push({
            id: `ADULT-FMSH-${pad(n)}`,
            area: "Adult Get Your Side Hustle",
            title: `[Adult FMSH] ${budget.short} · ${time.short} · ${skill.short} · ${goal.short}`,
            priority: "P1",
            roles: ["adult", "qa", "admin"],
            assignees: ["vitest"],
            suite: "vitest",
            path: "quiz",
            steps: [
              "Covered by automated Vitest wizard matrix (npm run test:unit)",
              `Path: budget=${budget.value}, time=${time.value}, skill=${skill.value}, goals=${goal.value}+${goal2.value}`,
            ],
            expected:
              "Adult wizard returns ranked hustles with match % for every budget × time × skill × goal path",
          });
        }
      }
    }
  }

  return cases;
}

function buildSeniorCases(): TestCase[] {
  const cases: TestCase[] = [];
  let n = 0;

  for (const lifestyle of SENIOR_LIFESTYLES) {
    for (const avail of SENIOR_AVAIL) {
      for (const skill of SENIOR_SKILLS) {
        for (const goal of SENIOR_GOALS) {
          n += 1;
          const goal2 = companionGoal(goal, SENIOR_GOALS);
          cases.push({
            id: `SENIOR-FMSH-${pad(n)}`,
            area: "Senior Get Your Side Hustle",
            title: `[Senior FMSH] ${lifestyle.short} · ${skill.short} · ${goal.short} · ${avail.short}`,
            priority: "P1",
            roles: ["adult", "qa", "admin"],
            assignees: ["vitest"],
            suite: "vitest",
            path: "seniors",
            steps: [
              "Covered by automated Vitest wizard matrix (npm run test:unit)",
              `Path: lifestyle=${lifestyle.value}, skill=${skill.value}, goals=${goal.value}+${goal2.value}, avail=${avail.value}`,
            ],
            expected:
              "Senior wizard returns ranked opportunities for every lifestyle × availability × skill × goal path",
          });
        }
      }
    }
  }

  return cases;
}

/**
 * All wizard scenarios are automated (suite: vitest) and owned by the Vitest QA Runner.
 */
export function balanceWizardAssignees(
  kidsJunior: TestCase[],
  remaining: TestCase[],
): TestCase[] {
  return [...kidsJunior, ...remaining].map((c) => ({
    ...c,
    assignees: ["vitest"] as TestOwnerId[],
    suite: "vitest" as const,
  }));
}

const RAW_KIDS_JUNIOR = buildKidsJuniorCases();
const RAW_ADULT = buildAdultCases();
const RAW_SENIOR = buildSeniorCases();

/** All wizard scenario tests — automated Vitest suite, owned by Vitest QA Runner. */
export const WIZARD_SCENARIO_CASES: TestCase[] = balanceWizardAssignees(RAW_KIDS_JUNIOR, [
  ...RAW_ADULT,
  ...RAW_SENIOR,
]);

export function wizardScenarioStats(cases: TestCase[] = WIZARD_SCENARIO_CASES) {
  const byWizard: Record<string, number> = {};
  let vitest = 0;
  for (const c of cases) {
    byWizard[c.area] = (byWizard[c.area] ?? 0) + 1;
    if (c.assignees.includes("vitest")) vitest += 1;
  }
  return {
    total: cases.length,
    vitest,
    byWizard,
    kidsJunior:
      (byWizard["Kids Get Your Side Hustle"] ?? 0) +
      (byWizard["Teens Get Your Side Hustle"] ?? 0) +
      (byWizard["Junior Get Your Side Hustle"] ?? 0),
    adult: byWizard["Adult Get Your Side Hustle"] ?? 0,
    senior: byWizard["Senior Get Your Side Hustle"] ?? 0,
    edges: byWizard["Wizard Edge Cases"] ?? 0,
  };
}
