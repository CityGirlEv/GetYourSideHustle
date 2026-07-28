/**
 * Kids / Teens / Seniors in-page tabs — shared by page UI and Site Map diagram.
 */

export type KidsTab = "stories" | "wizard" | "jobs" | "piggy" | "guides" | "join";
export type JuniorTab = "wizard" | "jobs" | "piggy" | "guides" | "join";
export type SeniorTab = "match" | "opportunities" | "guides" | "join";

export const KIDS_CORNER_TABS: { id: KidsTab; label: string; siteMapId: string; blurb?: string }[] = [
  { id: "stories", label: "Stories", siteMapId: "kids-stories", blurb: "Kevina Starr" },
  { id: "wizard", label: "GYSH Match Wizard", siteMapId: "kids-wizard" },
  { id: "jobs", label: "Ideas", siteMapId: "kids-ideas" },
  { id: "piggy", label: "Piggy Bank", siteMapId: "kids-piggy" },
  { id: "guides", label: "Guides", siteMapId: "kids-guides" },
  { id: "join", label: "Join", siteMapId: "kids-join", blurb: "Kids Corner GYSH Team" },
];

export const JUNIOR_CORNER_TABS: { id: JuniorTab; label: string; siteMapId: string; blurb?: string }[] = [
  { id: "wizard", label: "GYSH Match Wizard", siteMapId: "teens-wizard" },
  { id: "jobs", label: "Ideas", siteMapId: "teens-ideas" },
  { id: "piggy", label: "My Bank", siteMapId: "teens-bank" },
  { id: "guides", label: "Guides", siteMapId: "teens-guides" },
  { id: "join", label: "Join", siteMapId: "teens-join", blurb: "Join Teens" },
];

export const SENIOR_CORNER_TABS: { id: SeniorTab; label: string; siteMapId: string }[] = [
  { id: "match", label: "GYSH Match Wizard", siteMapId: "sen-wizard" },
  { id: "opportunities", label: "Ideas", siteMapId: "sen-ideas" },
  { id: "guides", label: "Guides", siteMapId: "sen-guides" },
  { id: "join", label: "Join", siteMapId: "sen-join" },
];

/** Match Wizard age branches (in-page; shown on Site Map under GYSH Match Wizard). */
export const MATCH_WIZARD_AGES: {
  id: string;
  label: string;
  blurb: string;
}[] = [
  {
    id: "match-kids",
    label: "Kids (4–12)",
    blurb: "Bands 4–8 & 9–12 · GYSH Coaches · consent ≤12 (not for 13+)",
  },
  {
    id: "match-teens",
    label: "Teens (13–17)",
    blurb: "Bands 13–14 & 15–17",
  },
  {
    id: "match-adult",
    label: "Adults (18–54)",
    blurb: "Budget, hours, strengths, goals",
  },
  {
    id: "match-senior",
    label: "Seniors (55+)",
    blurb: "Flexible pace & second careers",
  },
];
