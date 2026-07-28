/**
 * Organized Launch Guide sneak peeks for the Side Hustle Checklist page.
 * Peeks are sourced from real guide modules — never invent titles.
 */

import { guidesForAudience } from "./kids-guides";
import { LAUNCH_GUIDES } from "./launch-guides";
import { SENIOR_GUIDE_TEASERS } from "./seniors-content";

export type GuidePeekSectionId = "kids" | "junior" | "senior" | "adult";

export type GuidePeekNav =
  | { view: "guides"; hustleId: string }
  | { view: "kids"; mode: "kids" | "junior" }
  | { view: "seniors" };

export type GuidePeek = {
  id: string;
  title: string;
  peek: string;
  section: GuidePeekSectionId;
  nav: GuidePeekNav;
  /** Member-gated full guide elsewhere; sneak peek still visible here. */
  memberGuide?: boolean;
};

export type GuidePeekSection = {
  id: GuidePeekSectionId;
  label: string;
  subtitle: string;
  guides: GuidePeek[];
};

/** First sentence (or full short blurb) for sneak peeks. */
export function sneakPeekText(text: string, maxLen = 140): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  const sentenceMatch = trimmed.match(/^(.+?[.!?])(\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1] : trimmed;
  if (sentence.length <= maxLen) return sentence;
  const cut = sentence.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function getLaunchGuidePeekSections(): GuidePeekSection[] {
  const kids = guidesForAudience("kids").map((g) => ({
    id: g.id,
    title: g.title,
    peek: sneakPeekText(g.summary),
    section: "kids" as const,
    nav: { view: "kids" as const, mode: "kids" as const },
    memberGuide: !g.free,
  }));

  const junior = guidesForAudience("junior").map((g) => ({
    id: g.id,
    title: g.title,
    peek: sneakPeekText(g.summary),
    section: "junior" as const,
    nav: { view: "kids" as const, mode: "junior" as const },
    memberGuide: !g.free,
  }));

  const senior = SENIOR_GUIDE_TEASERS.map((g) => ({
    id: g.id,
    title: g.title,
    peek: sneakPeekText(g.blurb),
    section: "senior" as const,
    nav: { view: "seniors" as const },
  }));

  const adult = LAUNCH_GUIDES.map((g) => ({
    id: g.id,
    title: g.name,
    peek: sneakPeekText(g.peek),
    section: "adult" as const,
    nav: { view: "guides" as const, hustleId: g.id },
  }));

  return [
    {
      id: "kids",
      label: "Kids",
      subtitle: "Ages 4–12 — Kids Corner starter guides",
      guides: kids,
    },
    {
      id: "junior",
      label: "Teens",
      subtitle: "Ages 13–17 — Teens Side Hustle guides",
      guides: junior,
    },
    {
      id: "senior",
      label: "Senior",
      subtitle: "55+ · flexible schedules — Senior guide teasers",
      guides: senior,
    },
    {
      id: "adult",
      label: "Adult / general",
      subtitle: "Full Launch Guides for all adults",
      guides: adult,
    },
  ];
}
