import type { BlueprintAgeGroup } from "./gysh-analytics";
import { LAUNCH_GUIDES } from "./launch-guides";
import { SENIOR_OPPORTUNITIES } from "./seniors-content";

/** Kids / Teens Match Wizard hustle labels (ids match KidsCorner catalog). */
const KIDS_JUNIOR_LABELS: Record<string, string> = {
  "dog-walk": "Neighborhood Dog Walker",
  "yard-help": "Yard & Garden Helper",
  crafts: "Creative Sticker & Keychain Crafting",
  "tech-helper": "Senior Tech Helper",
  homework: "Homework Helper & Reader",
  "create-games-kids": "Create Games with AI",
  "create-games-junior": "Create Games with AI",
};

const ADULT_LABELS = Object.fromEntries(LAUNCH_GUIDES.map((g) => [g.id, g.name]));
const SENIOR_LABELS = Object.fromEntries(SENIOR_OPPORTUNITIES.map((o) => [o.id, o.name]));

export function blueprintAgeGroupTitle(ageGroup: BlueprintAgeGroup): string {
  if (ageGroup === "kids") return "Kids Side Hustle Blueprint";
  if (ageGroup === "junior") return "Teens Side Hustle Blueprint";
  if (ageGroup === "senior") return "Senior Side Hustle Blueprint";
  return "Adult Side Hustle Blueprint";
}

export function blueprintMatchLabel(ageGroup: BlueprintAgeGroup, id: string): string {
  if (ageGroup === "kids" || ageGroup === "junior") {
    return KIDS_JUNIOR_LABELS[id] ?? id;
  }
  if (ageGroup === "senior") {
    return SENIOR_LABELS[id] ?? id;
  }
  return ADULT_LABELS[id] ?? id;
}
