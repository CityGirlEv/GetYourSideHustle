/**
 * GYSH marketing manuals — Adult, Kids, Teens, Seniors, and Complete Master.
 * Shared by the online Guides viewer and downloadable PDF editions.
 */

import type { GuideCheckItem, GuideTocEntry } from "./user-guide-content";
import {
  MEMBER_PERKS_BY_TIER,
  MEMBERSHIP_TIERS,
  type MemberPerkAudience,
  type TierId,
} from "./membership";
import { LAUNCH_GUIDES } from "./launch-guides";
import { guidesForAudience } from "./kids-guides";
import { SENIOR_GUIDE_TEASERS, SENIOR_INTRO, SENIOR_OPPORTUNITIES } from "./seniors-content";

export type MarketingGuideId = "adult" | "kids" | "teens" | "seniors" | "master";

export type MarketingJourneyStep = {
  id: string;
  label: string;
  detail: string;
};

export type MarketingPerkTier = {
  tierId: TierId;
  name: string;
  priceLine: string;
  bullets: string[];
};

export type MarketingSection = {
  id: string;
  number: string;
  title: string;
  intro?: string;
  kind: "prose" | "checklist" | "journey" | "perks" | "cta" | "callout";
  prose?: string[];
  items?: GuideCheckItem[];
  journey?: MarketingJourneyStep[];
  perks?: MarketingPerkTier[];
  callout?: { title: string; body: string };
  cta?: { headline: string; body: string; bullets: string[] };
  /** Optional chapter image key resolved by the viewer / PDF */
  imageKey?: "hero" | "secondary" | "membership" | "community";
};

export type MarketingGuideDoc = {
  id: MarketingGuideId;
  menuLabel: string;
  eyebrow: string;
  title: string;
  lead: string;
  filename: string;
  audienceBadge: string;
  tagline: string;
  sections: MarketingSection[];
};

const TIER_ORDER: TierId[] = ["free", "starter", "pro", "elite"];

function priceLineFor(audience: MemberPerkAudience, tierId: TierId): string {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId)!;
  if (tierId === "free") return "Free forever";
  if (audience === "kids" || audience === "junior") {
    return `${tier.creditsPerMonth ?? 0} kid credits / month`;
  }
  if (audience === "senior") {
    const m = tier.priceMonthlyUsdSenior ?? tier.priceMonthlyUsd ?? 0;
    const y = tier.priceYearlyUsdSenior ?? tier.priceYearlyUsd;
    return y != null ? `$${m}/mo · $${y}/yr` : `$${m}/mo`;
  }
  const m = tier.priceMonthlyUsd ?? 0;
  const y = tier.priceYearlyUsd;
  return y != null ? `$${m}/mo · $${y}/yr` : `$${m}/mo`;
}

function perkTiersFor(audience: MemberPerkAudience): MarketingPerkTier[] {
  return TIER_ORDER.map((tierId) => {
    const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId)!;
    const perks = MEMBER_PERKS_BY_TIER[tierId][audience];
    return {
      tierId,
      name: tier.name,
      priceLine: priceLineFor(audience, tierId),
      bullets: perks.map((p) => `${p.title} — ${p.detail}`),
    };
  });
}

function checklist(prefix: string, lines: string[]): GuideCheckItem[] {
  return lines.map((text, i) => ({ id: `${prefix}-${i + 1}`, text }));
}

function tocFromMarketing(sections: MarketingSection[]): GuideTocEntry[] {
  return sections.map((s) => ({
    id: s.id,
    number: s.number,
    label: s.title,
    level: 1 as const,
  }));
}

/* ───────────────────────────────────────── Adult ───────────────────────────────────────── */

function buildAdultGuide(): MarketingGuideDoc {
  const launchSample = LAUNCH_GUIDES.slice(0, 8);
  return {
    id: "adult",
    menuLabel: "Adult Manual",
    eyebrow: "GYSH Adult Marketing Manual",
    title: "Launch your Side Hustle with confidence",
    lead:
      "A polished field guide for adults 18–54 — Match Wizard, Side Hustle Blueprint, launch playbooks, Workshops, and membership perks that turn curiosity into cash-flow.",
    filename: "GYSH-Adult-Marketing-Manual.pdf",
    audienceBadge: "Ages 18–54 · Side Hustlers & families",
    tagline: "Budget · Hours · Strengths · Goals → ranked matches you can actually start",
    sections: [
      {
        id: "welcome",
        number: "1",
        title: "Welcome to Get Your Side Hustle",
        kind: "prose",
        imageKey: "hero",
        prose: [
          "Get Your Side Hustle (GYSH) is the family Side Hustle platform built by T + E — practical, age-right, and designed so matches feel doable, not generic.",
          "This Adult Manual is your showcase piece: how the product works, why members stay, and the exact path from first question to first win.",
        ],
        callout: {
          title: "Who this is for",
          body: "Busy adults who want a second income stream, a creative outlet, or a family-friendly hustle culture — without drowning in guru fluff.",
        },
      },
      {
        id: "promise",
        number: "2",
        title: "The GYSH promise for adults",
        kind: "checklist",
        items: checklist("adult-promise", [
          "Age-right Match Wizard — not a one-size quiz for every generation.",
          "Side Hustle Blueprint unlocks with a free account after you finish the wizard.",
          "Launch Guides with real steps, costs, and next actions.",
          "Workshops & Community for momentum — not lonely DIY forever.",
          "Membership Free → Elite: guides, consulting, and (Pro+) the schedule suite.",
        ]),
      },
      {
        id: "journey",
        number: "3",
        title: "Your path in five arrows",
        kind: "journey",
        intro: "Follow the arrows. Each step builds on the last.",
        journey: [
          {
            id: "j1",
            label: "Match",
            detail: "Open GYSH Match Wizard → Adults. Answer budget, hours, strengths, and goals.",
          },
          {
            id: "j2",
            label: "Preview",
            detail: "See ranked Side Hustle matches that fit your real constraints.",
          },
          {
            id: "j3",
            label: "Unlock",
            detail: "Create a free GYSH account to open your full Side Hustle Blueprint.",
          },
          {
            id: "j4",
            label: "Learn",
            detail: "Open a Launch Guide, try a Workshop, and bookmark your next three actions.",
          },
          {
            id: "j5",
            label: "Level up",
            detail: "Join Starter for member guides + monthly 1-on-1, or Pro for the schedule suite.",
          },
        ],
      },
      {
        id: "tools",
        number: "4",
        title: "Adult toolkit on the site",
        kind: "checklist",
        items: checklist("adult-tools", [
          "GYSH Match Wizard (Adults) — the starting line for every serious Side Hustler.",
          "Guides library — free openers (rideshare, delivery) plus member launch playbooks.",
          "Profit Estimator & calculators — sanity-check income math before you commit.",
          "Workshops — live labs with T / E and guest coaches.",
          "Community — ask questions, share wins, stay accountable.",
          "Join — Free through Elite with clear consulting time on paid plans.",
        ]),
      },
      {
        id: "guides-sample",
        number: "5",
        title: "Launch Guides showcase",
        kind: "checklist",
        intro: "A sample of hustles covered in the Adult Guides library:",
        items: launchSample.map((g, i) => ({
          id: `adult-guide-${i}`,
          text: `${g.name} — ${g.peek}${g.free ? " (Free guide)" : ""}`,
        })),
      },
      {
        id: "perks",
        number: "6",
        title: "Membership perks — Adults",
        kind: "perks",
        imageKey: "membership",
        intro:
          "Consulting rates are the same across ages. Adults pay in USD; every paid package includes Kid Credits for workshops & 1-on-1s (kids or adults; 2 Kid Credits = 1 adult credit).",
        perks: perkTiersFor("adult"),
      },
      {
        id: "checklist-launch",
        number: "7",
        title: "First-week launch checklist",
        kind: "checklist",
        items: checklist("adult-week", [
          "Finish the Adult Match Wizard and save your Blueprint.",
          "Pick one primary hustle — not five.",
          "Open its Launch Guide and complete steps 1–3.",
          "Set a weekly hour budget you can keep for 30 days.",
          "Book a Workshop or Community intro if you want accountability.",
          "Decide Free vs Starter vs Pro based on whether you need the schedule suite.",
        ]),
      },
      {
        id: "cta",
        number: "8",
        title: "Join the adult Side Hustle movement",
        kind: "cta",
        cta: {
          headline: "Your next income chapter starts with one honest quiz.",
          body: "Run the Match Wizard today. Unlock your Blueprint free. Upgrade when you want coaches, member guides, and a week-by-week plan.",
          bullets: [
            "Free account → full Blueprint",
            "Starter → member guides + monthly 30-min 1-on-1",
            "Pro → schedule suite + 60-min 1-on-1",
            "Elite → 90-min 1-on-1 + ZIP timing scout",
          ],
        },
      },
    ],
  };
}

/* ───────────────────────────────────────── Kids ───────────────────────────────────────── */

function buildKidsGuide(): MarketingGuideDoc {
  const kidsGuides = guidesForAudience("kids");
  return {
    id: "kids",
    menuLabel: "Kids Manual",
    eyebrow: "GYSH Kids Marketing Manual",
    title: "Safe first Side Hustles for kids — with GYSH Coaches",
    lead:
      "A parent-friendly showcase for ages 4–12: Match Wizard bands, Kids Corner stories, Piggy Bank goals, free + member guides, and membership perks that keep hustles kind, coached, and fun.",
    filename: "GYSH-Kids-Marketing-Manual.pdf",
    audienceBadge: "Ages 4–12 · Parents as GYSH Coaches",
    tagline: "Cheer · Boundaries · Safe first wins · Parental consent through age 12",
    sections: [
      {
        id: "welcome",
        number: "1",
        title: "Why Kids Corner exists",
        kind: "prose",
        imageKey: "hero",
        prose: [
          "Kids don’t need a mini MBA — they need safe, age-right questions, a parent nearby, and small wins that teach earning, saving, and kindness.",
          "In GYSH, parents become GYSH Coaches: cheer, set boundaries, and help turn ideas into first wins. Parental consent is required through age 12.",
        ],
        callout: {
          title: "Coach mindset",
          body: "You are not outsourcing parenting to an app. You are using GYSH as a structured playground for money skills, creativity, and confidence.",
        },
      },
      {
        id: "promise",
        number: "2",
        title: "What kids (and parents) get",
        kind: "checklist",
        items: checklist("kids-promise", [
          "Kid-friendly Match Wizard with bands for 4–8 and 9–12.",
          "Kids Corner: Kevina Starr Stories, Ideas, Piggy Bank, and Guides.",
          "Free guides open now; member guides unlock with Kids Team or a GYSH plan.",
          "Credits on paid plans fund activities — adults can redeem the pool for consulting at half rate.",
          "Safety first: parent-nearby AI tools, privacy, and kindness quests.",
        ]),
      },
      {
        id: "journey",
        number: "3",
        title: "Family path in five arrows",
        kind: "journey",
        journey: [
          {
            id: "kj1",
            label: "Coach in",
            detail: "Parent opens Kids/Teens Corner → Kids mode and stays nearby.",
          },
          {
            id: "kj2",
            label: "Match",
            detail: "Run the Kids Match Wizard together — short, playful questions.",
          },
          {
            id: "kj3",
            label: "Pick one",
            detail: "Choose one tiny hustle idea (not a career). Keep it neighborhood-safe.",
          },
          {
            id: "kj4",
            label: "Save + give",
            detail: "Use Piggy Bank goals and a Give Back moment so money skills stay balanced.",
          },
          {
            id: "kj5",
            label: "Join team",
            detail: "Unlock member kids guides and training videos when you’re ready.",
          },
        ],
      },
      {
        id: "guides",
        number: "4",
        title: "Kids Guides library",
        kind: "checklist",
        intro: "Playbooks waiting in Kids Corner:",
        items: kidsGuides.map((g, i) => ({
          id: `kids-g-${i}`,
          text: `${g.title}${g.free ? " (Free)" : " (Members)"} — ${g.summary}`,
        })),
      },
      {
        id: "perks",
        number: "5",
        title: "Membership perks — Kids",
        kind: "perks",
        imageKey: "membership",
        intro: "Kids plans emphasize credits, story time, and parent-coached member guides.",
        perks: perkTiersFor("kids"),
      },
      {
        id: "safety",
        number: "6",
        title: "Safety & consent checklist",
        kind: "checklist",
        items: checklist("kids-safe", [
          "Parental consent required through age 12 — no solo account for young kids.",
          "Stay in the room for AI / internet tools.",
          "No public posting of a child’s face or school without your say-so.",
          "Cash jobs stay local, daytime, and parent-approved.",
          "Celebrate effort and kindness — not just dollars.",
        ]),
      },
      {
        id: "cta",
        number: "7",
        title: "Start a family hustle night",
        kind: "cta",
        cta: {
          headline: "One Match Wizard. One tiny goal. One proud high-five.",
          body: "Open Kids Corner tonight. Run the wizard. Set a Piggy Bank goal. Join free — upgrade when you want the full kids member library.",
          bullets: [
            "Free — stories preview + free guides",
            "Starter — Kids Team + training videos + 30-min family consulting",
            "Pro — schedule/tracker + more credits + AI game playbooks",
            "Elite — deepest credit pool + priority support",
          ],
        },
      },
    ],
  };
}

/* ───────────────────────────────────────── Teens ───────────────────────────────────────── */

function buildTeensGuide(): MarketingGuideDoc {
  const juniorGuides = guidesForAudience("junior");
  return {
    id: "teens",
    menuLabel: "Teens Manual",
    eyebrow: "GYSH Teens Marketing Manual",
    title: "Teen Side Hustles that scale with skill",
    lead:
      "For ages 13–17: Match Wizard bands for 13–14 and 15–17, My Bank goals, AI game & content starters (with guardian OK), and membership perks that treat teens like emerging CEOs — responsibly.",
    filename: "GYSH-Teens-Marketing-Manual.pdf",
    audienceBadge: "Ages 13–17 · Parent / guardian aware",
    tagline: "Skills · Safe earning · Save · Reinvest · Give back",
    sections: [
      {
        id: "welcome",
        number: "1",
        title: "Teens deserve a real runway",
        kind: "prose",
        imageKey: "hero",
        prose: [
          "Teens aren’t little kids — and they aren’t full adults yet. GYSH Teens mode scales questions, hustle ideas, and money tools so middle and older teens can practice entrepreneurship with parents still in the loop.",
          "This manual is the showcase for schools, families, and coaches who want a clean story: Match → Skills → Bank → Guides → Membership.",
        ],
        callout: {
          title: "Guardian role",
          body: "Parents stay coaches for privacy, payments, and AI tool access — while teens own more of the planning.",
        },
      },
      {
        id: "promise",
        number: "2",
        title: "What teens get on GYSH",
        kind: "checklist",
        items: checklist("teen-promise", [
          "Teens Match Wizard with bands for 13–14 and 15–17.",
          "Ideas + My Bank + Guides inside Kids/Teens Corner (Teens mode).",
          "Free CEO-style savings & give-back guides; member paths for AI games and content.",
          "Credit economy that teaches budgeting for activities and consulting.",
          "Family Match Wizard nights — compare teen matches with adult/senior results.",
        ]),
      },
      {
        id: "journey",
        number: "3",
        title: "Teen founder path (arrows)",
        kind: "journey",
        journey: [
          {
            id: "tj1",
            label: "Switch",
            detail: "Open Kids/Teens Corner → Teens mode with a guardian nearby for setup.",
          },
          {
            id: "tj2",
            label: "Match",
            detail: "Run the Teens Match Wizard — skills, interests, time, and safe places.",
          },
          {
            id: "tj3",
            label: "Bank",
            detail: "Set a My Bank goal with Save / Enjoy / Grow buckets.",
          },
          {
            id: "tj4",
            label: "Build",
            detail: "Open a free guide now; unlock AI game or content starters when you join.",
          },
          {
            id: "tj5",
            label: "Level up",
            detail: "Join Teens Side Hustle Team / paid plan for training, schedule suite, and credits.",
          },
        ],
      },
      {
        id: "guides",
        number: "4",
        title: "Teens Guides library",
        kind: "checklist",
        items: juniorGuides.map((g, i) => ({
          id: `teen-g-${i}`,
          text: `${g.title}${g.free ? " (Free)" : " (Members)"} — ${g.summary}`,
        })),
      },
      {
        id: "perks",
        number: "5",
        title: "Membership perks — Teens",
        kind: "perks",
        imageKey: "membership",
        perks: perkTiersFor("junior"),
      },
      {
        id: "responsibility",
        number: "6",
        title: "Responsibility checklist",
        kind: "checklist",
        items: checklist("teen-resp", [
          "Guardian approval before publishing content or sharing personal details.",
          "School-night hour caps — hustle never eats sleep or grades.",
          "Track jobs and payouts in My Bank every week.",
          "Reinvest a slice (Grow jar) before expanding.",
          "Balance earn + give — teach what you know for free once a month.",
        ]),
      },
      {
        id: "cta",
        number: "7",
        title: "Invite a teen founder this week",
        kind: "cta",
        cta: {
          headline: "Turn screen time into skill time — with a plan.",
          body: "Run the Teens Match Wizard, set one My Bank goal, and join free. Upgrade for AI build guides, training videos, and the schedule suite.",
          bullets: [
            "Free — Match Wizard + free CEO / give-back guides",
            "Starter — Teens Team + training + monthly consulting",
            "Pro — AI game + content starters + schedule suite",
            "Elite — max credits + priority support",
          ],
        },
      },
    ],
  };
}

/* ───────────────────────────────────────── Seniors ───────────────────────────────────────── */

function buildSeniorsGuide(): MarketingGuideDoc {
  return {
    id: "seniors",
    menuLabel: "Seniors Manual",
    eyebrow: "GYSH Seniors Marketing Manual",
    title: "A second chapter that fits your pace",
    lead:
      "For ages 55+: flexible Match Wizard pacing, purpose-forward opportunities, senior guide teasers, and intentionally lower membership pricing — built for experience, not grind culture.",
    filename: "GYSH-Seniors-Marketing-Manual.pdf",
    audienceBadge: "Ages 55+ · Retirees & flexible schedules",
    tagline: SENIOR_INTRO.headline,
    sections: [
      {
        id: "welcome",
        number: "1",
        title: "Welcome to the senior lane",
        kind: "prose",
        imageKey: "hero",
        prose: [
          SENIOR_INTRO.lead,
          SENIOR_INTRO.partnership,
        ],
        callout: {
          title: "No hustle-bro energy",
          body: "GYSH Seniors favors flexible hours, trusted skills, and gentle tech adoption — consulting, tutoring, crafts, co-hosting, peer AI help, and more.",
        },
      },
      {
        id: "promise",
        number: "2",
        title: "What seniors get",
        kind: "checklist",
        items: checklist("senior-promise", [
          "Seniors Match Wizard — lifestyle, skills, goals, and availability.",
          "Seniors Corner — opportunities, guide previews, and join paths.",
          "Lower paid-tier pricing than adult plans (same consulting quality).",
          "Peer learning: share know-how, try AI prompting together, stay curious.",
          "Family nights: run wizards with kids, teens, and adult children.",
        ]),
      },
      {
        id: "journey",
        number: "3",
        title: "Gentle path in five arrows",
        kind: "journey",
        journey: [
          {
            id: "sj1",
            label: "Explore",
            detail: "Open Seniors Corner and skim opportunities that match your energy.",
          },
          {
            id: "sj2",
            label: "Match",
            detail: "Run the Seniors Match Wizard at your own pace — pause anytime.",
          },
          {
            id: "sj3",
            label: "Choose",
            detail: "Pick one pilot (consulting hour, craft booth, tutoring slot) — not a new career overnight.",
          },
          {
            id: "sj4",
            label: "Preview guides",
            detail: "Open senior guide teasers; use Adult Launch Guides where they still fit.",
          },
          {
            id: "sj5",
            label: "Join",
            detail: "Create a free account; upgrade for member guides, workshops, and 1-on-1 time.",
          },
        ],
      },
      {
        id: "opportunities",
        number: "4",
        title: "Opportunity showcase",
        kind: "checklist",
        items: SENIOR_OPPORTUNITIES.slice(0, 10).map((o, i) => ({
          id: `sen-opp-${i}`,
          text: `${o.name} — ${o.desc} (${o.schedule}; startup: ${o.startup})`,
        })),
      },
      {
        id: "guides",
        number: "5",
        title: "Senior Guides coming online",
        kind: "checklist",
        items: SENIOR_GUIDE_TEASERS.map((g, i) => ({
          id: `sen-g-${i}`,
          text: `${g.title}${g.status === "preview" ? " (Preview)" : " (Coming soon)"} — ${g.blurb}`,
        })),
      },
      {
        id: "perks",
        number: "6",
        title: "Membership perks — Seniors",
        kind: "perks",
        imageKey: "membership",
        intro: "Senior monthly pricing is intentionally lower on Starter, Pro, and Elite.",
        perks: perkTiersFor("senior"),
      },
      {
        id: "pacing",
        number: "7",
        title: "Pacing checklist",
        kind: "checklist",
        items: checklist("senior-pace", [
          "Protect energy — schedule peaks you enjoy, not every peak that pays.",
          "Start with one discovery call or one market day.",
          "Use Pro’s schedule suite for gentle weekly structure if you want reminders.",
          "Invite a peer for AI coffee chats — learning is better together.",
          "Celebrate purpose and people as much as profit.",
        ]),
      },
      {
        id: "cta",
        number: "8",
        title: "Begin your second chapter",
        kind: "cta",
        cta: {
          headline: "Experience is an asset. GYSH helps you price it.",
          body: "Run the Seniors Match Wizard, preview opportunities, and join free. Upgrade when you want member seating, consulting, and a flexible plan.",
          bullets: [
            "Free — explore + interest list",
            "Starter $34/mo senior — team + 30-min 1-on-1",
            "Pro $57/mo senior — schedule suite + 60-min 1-on-1",
            "Elite $94/mo senior — 90-min 1-on-1 + ZIP scout",
          ],
        },
      },
    ],
  };
}

/* ───────────────────────────────────────── Master ───────────────────────────────────────── */

function buildMasterGuide(): MarketingGuideDoc {
  const adult = buildAdultGuide();
  const kids = buildKidsGuide();
  const teens = buildTeensGuide();
  const seniors = buildSeniorsGuide();

  const renumber = (sections: MarketingSection[], start: number, prefix: string): MarketingSection[] =>
    sections.map((s, i) => ({
      ...s,
      id: `${prefix}-${s.id}`,
      number: String(start + i),
      items: s.items?.map((it) => ({ ...it, id: `${prefix}-${it.id}` })),
      journey: s.journey?.map((j) => ({ ...j, id: `${prefix}-${j.id}` })),
    }));

  const sections: MarketingSection[] = [
    {
      id: "master-welcome",
      number: "1",
      title: "The complete GYSH story",
      kind: "prose",
      imageKey: "hero",
      prose: [
        "Get Your Side Hustle is one platform for four generations: Kids, Teens, Adults, and Seniors — each with an age-right Match Wizard, Guides, and membership path.",
        "This Complete Guide is the master marketing piece: every audience chapter, membership perks, and the family adventure that makes GYSH different.",
      ],
      callout: {
        title: "Four wizards. One family adventure.",
        body: "Parents become GYSH Coaches for kids and teens. Adults launch. Seniors pace. Everyone can compare matches on family night.",
      },
    },
    {
      id: "master-map",
      number: "2",
      title: "Site map at a glance",
      kind: "checklist",
      items: checklist("master-map", [
        "Home & GYSH Match Wizard — pick Kids, Teens, Adults, or Seniors.",
        "Kids/Teens Corner — stories, ideas, banks, guides, join team.",
        "Seniors Corner — flexible opportunities and senior pricing.",
        "Guides — launch playbooks + these downloadable manuals.",
        "Workshops · Community · Join · About · Contact.",
        "Admin Studio (partners) — schedule, tasks, QA, users, content, financials.",
      ]),
    },
    {
      id: "master-journey",
      number: "3",
      title: "Universal five arrows",
      kind: "journey",
      journey: [
        { id: "mj1", label: "Pick age", detail: "Choose the Match Wizard that fits the person starting today." },
        { id: "mj2", label: "Match", detail: "Answer age-right questions — honest constraints beat wishful thinking." },
        { id: "mj3", label: "Unlock", detail: "Free account → Side Hustle Blueprint (and progress you can keep)." },
        { id: "mj4", label: "Guide", detail: "Open a playbook; check boxes; take one real-world step this week." },
        { id: "mj5", label: "Grow", detail: "Join a plan when you want coaches, member libraries, and Pro schedules." },
      ],
    },
    ...renumber(
      adult.sections.filter((s) => ["promise", "tools", "perks", "cta"].includes(s.id)),
      4,
      "m-adult",
    ).map((s) => ({ ...s, title: `Adults — ${s.title.replace(/^Welcome to |^The |^Your |^Join the /i, "")}` })),
    ...renumber(
      kids.sections.filter((s) => ["promise", "guides", "perks", "cta"].includes(s.id)),
      8,
      "m-kids",
    ).map((s) => ({ ...s, title: `Kids — ${s.title}` })),
    ...renumber(
      teens.sections.filter((s) => ["promise", "guides", "perks", "cta"].includes(s.id)),
      12,
      "m-teens",
    ).map((s) => ({ ...s, title: `Teens — ${s.title}` })),
    ...renumber(
      seniors.sections.filter((s) => ["promise", "opportunities", "perks", "cta"].includes(s.id)),
      16,
      "m-seniors",
    ).map((s) => ({ ...s, title: `Seniors — ${s.title}` })),
    {
      id: "master-close",
      number: "20",
      title: "Share GYSH with your people",
      kind: "cta",
      imageKey: "community",
      cta: {
        headline: "Download this Complete Guide. Hand it to a family. Start a Match Wizard night.",
        body: "GYSH is built to be shown — at kitchen tables, senior centers, classrooms, and coaching calls. Use each audience manual alone, or this Complete Guide when you want the whole story.",
        bullets: [
          "Adult Manual · Kids Manual · Teens Manual · Seniors Manual",
          "Complete Guide (this document) for partners & showcases",
          "Always live at getyoursidehustle.com",
          "Questions? Contact Us — T + E read every note",
        ],
      },
    },
  ];

  // Fix sequential numbers cleanly
  sections.forEach((s, i) => {
    s.number = String(i + 1);
  });

  return {
    id: "master",
    menuLabel: "Complete Guide",
    eyebrow: "GYSH Complete Marketing Manual",
    title: "Four GYSH Match Wizards. One Family Adventure.",
    lead:
      "The master showcase: Adults, Kids, Teens, and Seniors — Match Wizards, Guides, membership perks, and the full path from first question to first win.",
    filename: "GYSH-Complete-Marketing-Manual.pdf",
    audienceBadge: "All ages · Partners · Families · Coaches",
    tagline: "The whole GYSH story in one beautifully downloadable manual",
    sections,
  };
}

export const MARKETING_GUIDES: MarketingGuideDoc[] = [
  buildAdultGuide(),
  buildKidsGuide(),
  buildTeensGuide(),
  buildSeniorsGuide(),
  buildMasterGuide(),
];

export const MARKETING_GUIDE_MENU: { id: MarketingGuideId; label: string }[] = [
  { id: "adult", label: "Adult Manual" },
  { id: "kids", label: "Kids Manual" },
  { id: "teens", label: "Teens Manual" },
  { id: "seniors", label: "Seniors Manual" },
  { id: "master", label: "Complete Guide" },
];

export function getMarketingGuide(id: MarketingGuideId): MarketingGuideDoc {
  const doc = MARKETING_GUIDES.find((g) => g.id === id);
  if (!doc) throw new Error(`Unknown marketing guide: ${id}`);
  return doc;
}

export function marketingGuideToc(doc: MarketingGuideDoc): GuideTocEntry[] {
  return tocFromMarketing(doc.sections);
}
