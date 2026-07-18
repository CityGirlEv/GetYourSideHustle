/** GYSH public + admin site map — shared by tree and org-chart views. */

export type SiteMapNode = {
  id: string;
  label: string;
  blurb?: string;
  children?: SiteMapNode[];
};

export const GYSH_SITE_MAP: SiteMapNode = {
  id: "root",
  label: "Get Your Side Hustle (GYSH)",
  blurb: "Ideas · Action · Income · Freedom",
  children: [
    {
      id: "public",
      label: "Public site",
      children: [
        { id: "home", label: "Home", blurb: "Family start + hustle catalog" },
        {
          id: "match",
          label: "GYSH Match Wizard",
          blurb: "Four age-customized wizards",
          children: [
            { id: "match-kids", label: "Kids (4–12)", blurb: "Bands 4–8 & 9–12 · GYSH Coaches · consent ≤12" },
            { id: "match-teens", label: "Juniors / Teens (13–17)", blurb: "Bands 13–14 & 15–17" },
            { id: "match-adult", label: "Adult (18–54)", blurb: "Budget, hours, strengths, goals" },
            { id: "match-senior", label: "Senior (55+)", blurb: "Flexible pace & second careers" },
          ],
        },
        {
          id: "families",
          label: "Kids / Teens Corner (Families)",
          children: [
            { id: "fam-stories", label: "Kids · Stories (Kevina Starr)" },
            { id: "fam-wizard", label: "GYSH Match Wizard" },
            { id: "fam-ideas", label: "Side Hustle Ideas" },
            { id: "fam-bank", label: "Piggy Bank / My Bank" },
            { id: "fam-guides", label: "Guides (free + member)" },
            { id: "fam-join", label: "Join the Team" },
          ],
        },
        {
          id: "seniors",
          label: "Seniors Corner",
          children: [
            { id: "sen-wizard", label: "GYSH Match Wizard" },
            { id: "sen-ideas", label: "Opportunities" },
            { id: "sen-guides", label: "Guides" },
            { id: "sen-join", label: "Join" },
          ],
        },
        { id: "guides", label: "GYSH Guides", blurb: "Adult / Senior / Kids / Teens library" },
        { id: "workshops", label: "Workshops & Speakers" },
        { id: "community", label: "GYSH Community" },
        { id: "join", label: "Join GYSH", blurb: "Membership Free → Elite" },
        { id: "about", label: "About GYSH" },
        { id: "contact", label: "Contact Us" },
        { id: "login", label: "Sign In / Portal" },
      ],
    },
    {
      id: "admin",
      label: "Admin",
      children: [
        { id: "adm-schedule", label: "Schedule & Plan" },
        { id: "adm-tasks", label: "Task List" },
        { id: "adm-testing", label: "Testing Portal" },
        { id: "adm-users", label: "Users Area" },
        { id: "adm-factory", label: "Content Factory" },
        { id: "adm-financials", label: "Financials" },
        { id: "adm-studio", label: "Growth Studio" },
        { id: "adm-sitemap", label: "Site Map" },
        {
          id: "adm-guides",
          label: "User Guides",
          children: [
            { id: "adm-guide-member", label: "Member User Guide" },
            { id: "adm-guide-admin", label: "Admin User Guide" },
          ],
        },
      ],
    },
  ],
};
