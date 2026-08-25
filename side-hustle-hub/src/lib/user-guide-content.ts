/** Shared copy for online User Guides + PDF export. Always say Side Hustle / Side Hustler. */

export type GuideCheckItem = { id: string; text: string };

export type GuideTocEntry = {
  id: string;
  number: string;
  label: string;
  level: 1 | 2;
};

export type GuideSubSection = {
  id: string;
  number: string;
  title: string;
  intro?: string;
  items: GuideCheckItem[];
};

export type GuideDocSection = {
  id: string;
  number: string;
  title: string;
  intro?: string;
  items?: GuideCheckItem[];
  subsections?: GuideSubSection[];
};

export type GuideChapter = {
  id: string;
  number: string;
  title: string;
  ages: string;
  image: string;
  imageAlt: string;
  items: GuideCheckItem[];
};

export const MEMBER_GUIDE_META = {
  eyebrow: "GYSH Member Tour",
  title: "How Get Your Side Hustle works",
  lead:
    "A concise tour for families and Side Hustlers — Match Wizards by age, Corners, Guides, and membership. For full showcase guides (Adult, Kids, Teens, Seniors, Complete), open Guides → audience guides.",
  filename: "GYSH-Member-User-Guide.pdf",
};

export const ADMIN_GUIDE_META = {
  eyebrow: "GYSH Admin User Guide",
  title: "Admin Studio & end-user product",
  lead:
    "Detailed partner checklist: every Admin tab, then the full end-user site — roles, Corners, membership, and key workflows. Keep this guide updated when features change.",
  filename: "GYSH-Admin-User-Guide.pdf",
};

export function tocFromSections(sections: GuideDocSection[]): GuideTocEntry[] {
  const entries: GuideTocEntry[] = [];
  for (const s of sections) {
    entries.push({ id: s.id, number: s.number, label: s.title, level: 1 });
    for (const sub of s.subsections ?? []) {
      entries.push({ id: sub.id, number: sub.number, label: sub.title, level: 2 });
    }
  }
  return entries;
}

/* ---------- Member guide ---------- */

export const MEMBER_GUIDE_SECTIONS: GuideDocSection[] = [
  {
    id: "big-picture",
    number: "1",
    title: "The big picture",
    items: [
      {
        id: "bp-wizard",
        text: "GYSH Match Wizard — four wizards (Kids, Teens, Adults, Seniors) with age-appropriate questions.",
      },
      {
        id: "bp-families",
        text: "Families — Kids/Teens Corner: stories, ideas, savings, guides; parents are GYSH Coaches.",
      },
      {
        id: "bp-guides",
        text: "Guides & Workshops — launch playbooks, live learning, plus downloadable Adult / Kids / Teens / Seniors / Complete guides.",
      },
      {
        id: "bp-join",
        text: "Join GYSH — Free through Elite; unlock member guides and consulting.",
      },
    ],
  },
  {
    id: "age-chapters",
    number: "2",
    title: "Age chapters",
    intro: "Pick the chapter that matches your household. Parents coach Kids and Teens.",
    subsections: [], // filled visually via member chapters below
  },
  {
    id: "membership",
    number: "3",
    title: "Membership levels",
    items: [
      {
        id: "tier-free",
        text: "Free — Open free guides for every age. Explore GYSH Match Wizard and catalog.",
      },
      {
        id: "tier-starter",
        text: "Starter — Member guides, community, workshop discounts, one 45-minute session (3-mo commit). Kids/Teens use credits.",
      },
      {
        id: "tier-pro",
        text: "Pro — Schedule suite (plan, tracker, reports, email) + three 60-minute sessions + more credits.",
      },
      {
        id: "tier-elite",
        text: "Elite — Deepest support + three 90-minute sessions + highest credit pool.",
      },
    ],
  },
  {
    id: "quick-start",
    number: "4",
    title: "Quick start",
    items: [
      { id: "qs-1", text: "Open GYSH Match Wizard and pick your age group." },
      { id: "qs-2", text: "Finish the questions → preview your Side Hustle Blueprint." },
      { id: "qs-3", text: "Create a free account to unlock the full Blueprint." },
      {
        id: "qs-4",
        text: "Browse Guides, try Ideas / Piggy Bank (Kids & Teens), or Join a paid plan when ready.",
      },
    ],
  },
];

export function memberChapters(images: {
  kids: string;
  teens: string;
  adult: string;
  senior: string;
}): GuideChapter[] {
  return [
    {
      id: "kids",
      number: "2.1",
      title: "Kids",
      ages: "Ages 4–12 · Match bands 4–8 & 9–12",
      image: images.kids,
      imageAlt: "GYSH Kids Match Wizard — parent-guided first Side Hustles",
      items: [
        {
          id: "kids-coach",
          text: "Parents act as GYSH Coaches; parental consent is required through age 12 (not required for ages 13+).",
        },
        {
          id: "kids-wizard",
          text: "GYSH Match Wizard asks kid-friendly questions and ranks safe first Side Hustles.",
        },
        {
          id: "kids-corner",
          text: "Kids Corner adds Kevina Starr Stories, Ideas, Piggy Bank, and Guides.",
        },
        {
          id: "kids-guides",
          text: "Free guides are open; full team guides unlock when you join Kids Corner GYSH Team or a GYSH plan.",
        },
      ],
    },
    {
      id: "juniors",
      number: "2.2",
      title: "Teens",
      ages: "Ages 13–17 · Match bands 13–14 & 15–17",
      image: images.teens,
      imageAlt: "GYSH Teens Match Wizard — skills and safe earning",
      items: [
        {
          id: "teen-scale",
          text: "Questions scale up for middle and older teens — still coach-friendly for parents.",
        },
        {
          id: "teen-corner",
          text: "GYSH Match Wizard + Ideas + My Bank + Guides live in Kids/Teens Corner (Teens mode).",
        },
        {
          id: "teen-team",
          text: "Join the Teens Side Hustle Team for member guides and training perks.",
        },
        {
          id: "teen-family",
          text: "Great for family GYSH Match Wizard nights: compare teen matches with adult/senior results.",
        },
      ],
    },
    {
      id: "adults",
      number: "2.3",
      title: "Adults",
      ages: "Ages 18–54",
      image: images.adult,
      imageAlt: "GYSH Adults Match Wizard — budget, hours, strengths, goals",
      items: [
        {
          id: "adult-wizard",
          text: "GYSH Adults Match Wizard ranks Side Hustles from budget, hours, strengths, and goals.",
        },
        {
          id: "adult-tools",
          text: "Use GYSH Guides, Profit Estimator, Workshops, and Community to launch.",
        },
        {
          id: "adult-blueprint",
          text: "Side Hustle Blueprint unlocks with a free account after the wizard.",
        },
        {
          id: "adult-membership",
          text: "Membership Free → Elite adds guides, consulting time, and (Pro+) the schedule suite.",
        },
      ],
    },
    {
      id: "seniors",
      number: "2.4",
      title: "Seniors",
      ages: "Ages 55+",
      image: images.senior,
      imageAlt: "GYSH Seniors Match Wizard — flexible pacing",
      items: [
        {
          id: "senior-wizard",
          text: "GYSH Seniors Match Wizard favors flexible pacing, experience, and lower intensity.",
        },
        {
          id: "senior-corner",
          text: "Seniors Corner covers GYSH Match Wizard, opportunities, guides, and join paths.",
        },
        {
          id: "senior-price",
          text: "Senior membership pricing is intentionally lower on paid tiers.",
        },
        {
          id: "senior-family",
          text: "Pair with family wizards so grandparents, parents, and kids can explore together.",
        },
      ],
    },
  ];
}

export const MEMBER_TOC: GuideTocEntry[] = [
  { id: "big-picture", number: "1", label: "The big picture", level: 1 },
  { id: "age-chapters", number: "2", label: "Age chapters", level: 1 },
  { id: "kids", number: "2.1", label: "Kids", level: 2 },
  { id: "juniors", number: "2.2", label: "Teens", level: 2 },
  { id: "adults", number: "2.3", label: "Adults", level: 2 },
  { id: "seniors", number: "2.4", label: "Seniors", level: 2 },
  { id: "membership", number: "3", label: "Membership levels", level: 1 },
  { id: "quick-start", number: "4", label: "Quick start", level: 1 },
];

/** @deprecated use MEMBER_GUIDE_SECTIONS[0].items */
export const MEMBER_BIG_PICTURE = MEMBER_GUIDE_SECTIONS[0].items!;
/** @deprecated use MEMBER_GUIDE_SECTIONS[2].items */
export const MEMBER_MEMBERSHIP = MEMBER_GUIDE_SECTIONS[2].items!;
/** @deprecated use MEMBER_GUIDE_SECTIONS[3].items */
export const MEMBER_QUICK_START = MEMBER_GUIDE_SECTIONS[3].items!;

/* ---------- Admin guide ---------- */

export const ADMIN_GUIDE_SECTIONS: GuideDocSection[] = [
  {
    id: "overview",
    number: "1",
    title: "Admin Studio overview",
    intro:
      "Partner ops workspace for schedule, tasks, QA, users, content, money (admin-only), growth notes, site map, and these guides. Sign in with Admin and/or QA — the Admin menu appears in the header and opens on Schedule & Plan.",
    subsections: [
      {
        id: "roles",
        number: "1.1",
        title: "Roles",
        intro: "Users can hold multiple roles. Primary portal home follows the highest-priority audience/ops role.",
        items: [
          { id: "r-admin", text: "Admin — full Admin Studio, including Financials." },
          { id: "r-qa", text: "QA — Admin Studio for Testing/ops; Financials hidden (admin role required)." },
          { id: "r-kid", text: "Kid (3–12) — Kids Side Hustle Corner (parent-coached)." },
          { id: "r-teen", text: "Teens (13–17) — Teens mode in Kids/Teens Corner." },
          { id: "r-adult", text: "Adult (18+) — Adult hub, GYSH Match Wizard, guides, calculators." },
          { id: "r-senior", text: "Senior (55+) — Seniors Corner and senior pricing on Join." },
          {
            id: "r-shell",
            text: "Admin shell opens only when the account includes Admin and/or QA. Audience-only members use Portal, not Admin.",
          },
        ],
      },
      {
        id: "profile-switcher",
        number: "1.2",
        title: "Profile Switcher",
        items: [
          {
            id: "ps-me",
            text: "Admin (me) — return to your partner session; lands on Schedule & Plan.",
          },
          {
            id: "ps-guest",
            text: "Unlogged in User — guest experience (locked Blueprints, Login in the header); return via Admin (me).",
          },
          {
            id: "ps-audience",
            text: "Use app as Adult / Kids / Teens / Senior — preview that audience without changing the real login.",
          },
          { id: "ps-logout", text: "Cleared on Log Out." },
        ],
      },
      {
        id: "due-tasks",
        number: "1.3",
        title: "Due-tasks popup",
        items: [
          {
            id: "due-login",
            text: "On fresh Admin login, overdue / due-today tasks and overdue tests for your assignee can open a modal — with days left in the current sprint and a nudge to finish before Monday.",
          },
          {
            id: "due-daily",
            text: "Optional once-per-day reminder when opening Admin if overdue tasks or tests remain.",
          },
          {
            id: "due-jump",
            text: "Jump to Task List or Testing Portal from the modal to work the items.",
          },
        ],
      },
    ],
  },
  {
    id: "schedule",
    number: "2",
    title: "Schedule & Plan",
    intro:
      "Tuesday–Monday sprint board combining plan milestones, Task List items, and Testing Portal cases.",
    items: [
      {
        id: "sch-bars",
        text: "Sprint status bars show progress for the selected sprint.",
      },
      {
        id: "sch-filter",
        text: "Filter cards by owner (Tina, Evelyn / Lyriq / Both / Unassigned).",
      },
      {
        id: "sch-edit",
        text: "Edit assignee, sprint, status, and notes on cards; Save per card or Save all.",
      },
      {
        id: "sch-bulk",
        text: "Multiselect cards → bulk change Assignee, Sprint, and Status → Apply or Apply & save.",
      },
      {
        id: "sch-link",
        text: "Open a linked task or test to jump to Task List or Testing Portal.",
      },
      {
        id: "sch-subs",
        text: "Sub-views: Sprint board, Ceremonies, Retrospective board.",
      },
      {
        id: "sch-plan",
        text: "Add plan items, bulk-edit selected cards, and Reset to discard unsaved edits (Save / Save all write to D1).",
      },
    ],
  },
  {
    id: "tasks",
    number: "3",
    title: "Task List",
    intro: "Operational tracker for Tina, Evelyn, and Lyriq — persisted in D1 (file blobs in browser storage).",
    items: [
      {
        id: "tk-add",
        text: "Add tasks with description, category, assignee, due date, and sprint/backlog.",
      },
      {
        id: "tk-filter",
        text: "Filter by assignee, category, and status; select rows for bulk assignee, sprint, status, priority, due date, or delete.",
      },
      {
        id: "tk-edit",
        text: "Edit status, priority, due date, sprint, description; partner-done where applicable. Each card shows last updated by and date.",
      },
      {
        id: "tk-attach",
        text: "Upload, download, and remove attachments on a task (images, PDF, Office, video).",
      },
      {
        id: "tk-guides",
        text: "Launch-guide review tasks auto-sync (“Review Launch Guide: …”).",
      },
      {
        id: "tk-focus",
        text: "Deep-link focus from Schedule opens the matching task row.",
      },
    ],
  },
  {
    id: "testing",
    number: "4",
    title: "Testing Portal",
    intro: "Manual and automated QA case tracking with assignees, sprints, and notes.",
    items: [
      {
        id: "qa-filter",
        text: "Top filter: External (live site) vs Internal (admin / QA). Then filter by search, area, category, status, QA tester, suite (manual / Vitest / Playwright), and sprint.",
      },
      {
        id: "qa-status",
        text: "Set status: not started, in progress, pass, conditional approval, fail, blocked — notes required for fail/blocked/conditional approval. Untouched cases stay Not Started. Use Save everything to persist notes.",
      },
      {
        id: "qa-assign",
        text: "Assign manual cases to Tina, Evelyn / Lyriq; Vitest/Playwright cases stay on suite owners; set sprint; expand case detail. Each card shows last updated by and date.",
      },
      {
        id: "qa-bulk",
        text: "Select cases, then bulk-assign people, status, or sprint (including Backlog) — same idea as Task List multiselect.",
      },
      {
        id: "qa-auto",
        text: "Run Vitest, Playwright, or both from the Testing Portal. Test results are kept — update individual cases instead of wiping them.",
      },
      {
        id: "qa-evidence",
        text: "Attach evidence on a case: image, video, PDF, Word, or Excel (safety scanned).",
      },
      {
        id: "qa-bars",
        text: "Sprint status bars mirror completion across the suite.",
      },
    ],
  },
  {
    id: "users",
    number: "5",
    title: "Users Area",
    intro: "Manage GYSH members in D1 — identity, status, roles, and login password reset.",
    items: [
      {
        id: "u-filter",
        text: "Role count tiles filter the list (Admin, QA, Kids, Teens, Adult, Senior); also filter by status.",
      },
      {
        id: "u-add",
        text: "Add user with name, email, and role bubbles (pending by default).",
      },
      {
        id: "u-bubbles",
        text: "On each card: highlighted role bubbles toggle roles; + adds a missing role (saves immediately).",
      },
      {
        id: "u-edit",
        text: "Edit name, email, status, notes, and optional new password (never displayed).",
      },
      {
        id: "u-rule",
        text: "At least one role required per user.",
      },
    ],
  },
  {
    id: "factory",
    number: "6",
    title: "Content Factory",
    intro:
      "Admin-only: GYSH Marketing/Launch Plan (soft-launch calendar, copy, prompts, artifacts) and Workshops for the public hub.",
    subsections: [
      {
        id: "factory-launch-plan",
        number: "6.1",
        title: "GYSH Marketing/Launch Plan",
        items: [
          {
            id: "cf-open",
            text: "Open Admin → Content Factory (or /admin?tab=factory&panel=launch-plan).",
          },
          {
            id: "cf-howto",
            text: "Read How the Content Factory works + Definitions (cadence, cadence locked, artifacts, channels, projections).",
          },
          {
            id: "cf-filter",
            text: "Filter by sprint and channel; each calendar item has copy, image/video prompts, website actions, and an A→Z artifact checklist.",
          },
          {
            id: "cf-publish",
            text: "Publish on the named channel at the suggested time; attach images, short videos, or PDFs on the calendar item (and on related tasks when ready).",
          },
        ],
      },
      {
        id: "factory-workshops",
        number: "6.2",
        title: "Workshops",
        items: [
          {
            id: "ws-edit",
            text: "Edit title, blurb, date (or TBD), time, capacity, registration open/closed, note, status, audience, format, speakers, tags.",
          },
          {
            id: "ws-save",
            text: "Save workshops to D1 — public Workshops hub reads the same data.",
          },
          {
            id: "ws-reg",
            text: "Registration only works on the public site when registration is open.",
          },
        ],
      },
    ],
  },
  {
    id: "financials",
    number: "7",
    title: "Financials",
    intro: "Admin-only money ops. QA-only accounts do not see this tab.",
    items: [
      {
        id: "fin-tabs",
        text: "Sub-tabs: Budget, Expenses, Contract.",
      },
      {
        id: "fin-totals",
        text: "Totals show budget, expenses, and net.",
      },
      {
        id: "fin-lines",
        text: "Line items: title, category, amount, date, notes, receipt attachments.",
      },
      {
        id: "fin-contract",
        text: "Upload partnership contract file (T + E labeling).",
      },
      {
        id: "fin-save",
        text: "Save all to D1 (file binaries stay in local browser storage until object storage is wired).",
      },
    ],
  },
  {
    id: "studio",
    number: "8",
    title: "Growth Studio",
    intro: "Planning notes only — not live publishing or live revenue.",
    subsections: [
      {
        id: "studio-calendar",
        number: "8.1",
        title: "Content Calendar",
        items: [
          {
            id: "gs-cal",
            text: "Points partners to Schedule & Plan (Tue–Mon cadence); no fake “live” posts.",
          },
        ],
      },
      {
        id: "studio-monetize",
        number: "8.2",
        title: "Monetization",
        items: [
          {
            id: "gs-mon",
            text: "Strategy notes: affiliates, premium circles, kits, mentor listings, tuition ideas.",
          },
        ],
      },
      {
        id: "studio-growth",
        number: "8.3",
        title: "Growth Guide",
        items: [
          {
            id: "gs-grow",
            text: "Checklist-style tactics (YouTube, Facebook, waitlists, newsletter).",
          },
        ],
      },
    ],
  },
  {
    id: "sitemap",
    number: "9",
    title: "Site Map",
    items: [
      {
        id: "sm-views",
        text: "Toggle Tree vs Diagram of public menus/submenus + Admin structure (read-only reference). Diagram is top-down from Home.",
      },
    ],
  },
  {
    id: "user-guides",
    number: "10",
    title: "User Guides",
    items: [
      {
        id: "ug-tabs",
        text: "Member User Guide (families / Side Hustlers) and this Admin User Guide.",
      },
      {
        id: "ug-pdf",
        text: "Open PDF from each guide (view in a new tab, then save if you want); online versions are checklist-style with linked TOC.",
      },
      {
        id: "ug-maintain",
        text: "When Admin or end-user features change, update these guides in the same change set.",
      },
    ],
  },
  {
    id: "admin-workflows",
    number: "11",
    title: "Admin workflows",
    subsections: [
      {
        id: "wf-login",
        number: "11.1",
        title: "Login & logout",
        items: [
          {
            id: "wf-l1",
            text: "Header Login → email/password. Admin/QA land in Admin Studio; members land in Portal.",
          },
          {
            id: "wf-l2",
            text: "Password reset: current + new password (email path when Resend is configured).",
          },
          {
            id: "wf-l3",
            text: "Log Out clears session, Profile Switcher target, and due-popup login flag.",
          },
        ],
      },
      {
        id: "wf-actas",
        number: "11.2",
        title: "Act-as preview",
        items: [
          {
            id: "wf-a1",
            text: "Use Profile Switcher (Â§1.2) to QA the member experience; return via Admin (me).",
          },
        ],
      },
      {
        id: "wf-blueprint-admin",
        number: "11.3",
        title: "Blueprint claim on login",
        items: [
          {
            id: "wf-b1",
            text: "If a pending Side Hustle Blueprint exists in session, login/register claims it into the account and restores the right wizard view.",
          },
        ],
      },
      {
        id: "wf-local",
        number: "11.4",
        title: "Local D1 setup",
        items: [
          {
            id: "wf-d1",
            text: "After a fresh clone: npm run db:setup:local before testing auth and Admin data.",
          },
        ],
      },
    ],
  },
  {
    id: "end-user",
    number: "12",
    title: "End-user site",
    intro:
      "Public GYSH experience. Primary header: Home · GYSH Match Wizard · Kids/Teens Corner · Seniors · Guides · Workshops · Community · Newsletter · Join · About · Contact · Login (or Admin/Portal + Log Out). Calculators and Launch checklist are in-app views (not always in the primary header).",
    subsections: [
      {
        id: "eu-home",
        number: "12.1",
        title: "Home",
        items: [
          {
            id: "eu-h1",
            text: "Family start + Side Hustle catalog: search/filter, CTAs to GYSH Match Wizard / Workshops / Join, Training Circles.",
          },
          {
            id: "eu-h2",
            text: "Open Profit Estimator or a launch guide from a hustle card when available.",
          },
        ],
      },
      {
        id: "eu-wizard",
        number: "12.2",
        title: "GYSH Match Wizard",
        items: [
          {
            id: "eu-w1",
            text: "Age selector routes to Kids, Teens, Adult, or Senior wizard flows.",
          },
          {
            id: "eu-w2",
            text: "Results preview Side Hustle Blueprint; full unlock needs a free account / member session.",
          },
        ],
      },
      {
        id: "eu-kids",
        number: "12.3",
        title: "Kids / Teens Corner",
        items: [
          {
            id: "eu-k1",
            text: "Kids tabs: Stories · GYSH Match Wizard · Ideas · Piggy Bank · Guides · Join.",
          },
          {
            id: "eu-k2",
            text: "Teens tabs: GYSH Match Wizard · Ideas · My Bank · Guides · Join.",
          },
          {
            id: "eu-k3",
            text: "Parents are GYSH Coaches; consent required through age 12; kids use parent email + child nickname (no child email).",
          },
        ],
      },
      {
        id: "eu-seniors",
        number: "12.4",
        title: "Seniors Corner",
        items: [
          {
            id: "eu-s1",
            text: "Tabs: Match · Opportunities · Guides · Join — flexible pacing for 55+.",
          },
          {
            id: "eu-s2",
            text: "Senior paid tiers use lower monthly pricing than Adult on Join.",
          },
        ],
      },
      {
        id: "eu-guides",
        number: "12.5",
        title: "Guides",
        items: [
          {
            id: "eu-g1",
            text: "Adult / Senior / Kids / Teens library; free vs member gating in the guide components.",
          },
          {
            id: "eu-g2",
            text: "Deep-links can open Kids/Teens/Seniors guide tabs from the main Guides view.",
          },
        ],
      },
      {
        id: "eu-checklist",
        number: "12.6",
        title: "Launch checklist",
        items: [
          {
            id: "eu-c1",
            text: "Practical Side Hustle launch steps; guest peek vs full interactive list when signed in.",
          },
          { id: "eu-c2", text: "Member progress can persist for signed-in users." },
        ],
      },
      {
        id: "eu-workshops",
        number: "12.7",
        title: "Workshops (public)",
        items: [
          {
            id: "eu-ws1",
            text: "Public hub reads workshops managed under Content Factory → Workshops.",
          },
          {
            id: "eu-ws2",
            text: "Registration available only when Admin leaves registration open.",
          },
        ],
      },
      {
        id: "eu-community",
        number: "12.8",
        title: "Community",
        items: [
          {
            id: "eu-co1",
            text: "Ask questions and share updates with other Side Hustlers; keep Kids/Teens topics parent-aware.",
          },
        ],
      },
      {
        id: "eu-newsletter",
        number: "12.9",
        title: "Newsletter",
        items: [
          {
            id: "eu-nl1",
            text: "Members-only Weekly Newsletter page at /newsletter — Friday dual-audience issue (kids glow + adult hustle tip).",
          },
          {
            id: "eu-nl2",
            text: "Starter+ perk. Guests and Free accounts see titles; published Content Factory newsletter drafts unlock in the archive.",
          },
        ],
      },
      {
        id: "eu-join",
        number: "12.10",
        title: "Join / Membership",
        items: [
          {
            id: "eu-j1",
            text: "Audience selector (Kids, Teens, Adult, Senior) changes pricing and perk emphasis.",
          },
          {
            id: "eu-j2",
            text: "Free — open free guides. Starter — member guides, community, weekly newsletter, workshop discount, one 45-minute session (credits for Kids/Teens).",
          },
          {
            id: "eu-j3",
            text: "Pro — schedule suite + three 60-minute sessions + more credits. Elite — deepest support + three 90-minute sessions + highest credit pool.",
          },
          {
            id: "eu-j4",
            text: "Consulting rates align across ages; Kids/Teens often pay with parent-funded GYSH credits. Adult/Senior Pro+ include kid-credit pools.",
          },
        ],
      },
      {
        id: "eu-calc",
        number: "12.11",
        title: "Profit Estimator",
        items: [
          {
            id: "eu-p1",
            text: "Tabs for Airbnb-style, e-commerce, and social/affiliate-style estimates — opened from hustles/guides.",
          },
        ],
      },
      {
        id: "eu-about",
        number: "12.12",
        title: "About & Contact",
        items: [
          {
            id: "eu-ab1",
            text: "About — partnership story (Tina Marie Barham & Evelyn Irving).",
          },
          {
            id: "eu-ab2",
            text: "Contact — questions, partnerships, workshop inquiries.",
          },
        ],
      },
      {
        id: "eu-portal",
        number: "12.13",
        title: "Login, register & Portal",
        items: [
          {
            id: "eu-po1",
            text: "Members: free register / login → Portal dashboard (goals, progress UI).",
          },
          {
            id: "eu-po2",
            text: "Admin/QA: Login shows Admin + Profile Switcher instead of Portal.",
          },
          {
            id: "eu-po3",
            text: "Kids register path: parent email + child display name; optional blueprint claim token.",
          },
        ],
      },
    ],
  },
  {
    id: "member-workflows",
    number: "13",
    title: "Member workflows",
    subsections: [
      {
        id: "mw-blueprint",
        number: "13.1",
        title: "Side Hustle Blueprint unlock",
        items: [
          {
            id: "mw-b1",
            text: "Finish GYSH Match Wizard → pending Blueprint → free register/login claims it → restore the correct age wizard view.",
          },
        ],
      },
      {
        id: "mw-consent",
        number: "13.2",
        title: "Kids / Teens consent",
        items: [
          {
            id: "mw-c1",
            text: "Team join / under-18 signup can create a parent consent request (token URL).",
          },
          {
            id: "mw-c2",
            text: "Parent approves or declines on the consent page; no child address/phone collected from the child.",
          },
          {
            id: "mw-c3",
            text: "Parental consent required through age 12 for the Kids path; ages 13+ join without consent.",
          },
        ],
      },
      {
        id: "mw-membership",
        number: "13.3",
        title: "Membership path",
        items: [
          {
            id: "mw-m1",
            text: "Browse free guides → GYSH Match Wizard → optional free account for Blueprint → Join to pick Free/Starter/Pro/Elite (audience-aware).",
          },
        ],
      },
    ],
  },
];

export const ADMIN_TOC = tocFromSections(ADMIN_GUIDE_SECTIONS);

/** @deprecated use ADMIN_GUIDE_SECTIONS */
export const ADMIN_SECTIONS: { id: string; title: string; items: GuideCheckItem[] }[] =
  ADMIN_GUIDE_SECTIONS.flatMap((s) => {
    if (s.subsections?.length) {
      return s.subsections.map((sub) => ({
        id: sub.id,
        title: `${sub.number} ${sub.title}`,
        items: sub.items,
      }));
    }
    return [
      {
        id: s.id,
        title: `${s.number} ${s.title}`,
        items: s.items ?? [],
      },
    ];
  });
