/** GYSH Kids Corner + Teens Side Hustle team membership & join copy. */

export type KidsAudience = "kids" | "junior";

const STORAGE_KEYS: Record<KidsAudience, string> = {
  kids: "gysh_kids_corner_team",
  junior: "gysh_junior_side_hustle_team",
};

export type TeamPerk = {
  title: string;
  detail: string;
};

export type TeamJoinCopy = {
  audience: KidsAudience;
  ages: string;
  teamName: string;
  headline: string;
  lead: string;
  valuesTitle: string;
  values: { title: string; detail: string }[];
  perks: TeamPerk[];
  ctaLabel: string;
  parentNote: string;
};

export const KIDS_TEAM_JOIN: TeamJoinCopy = {
  audience: "kids",
  ages: "Ages 4–12",
  teamName: "Kids Corner GYSH Team",
  headline: "Join the Kids Corner GYSH Team",
  lead:
    "Become a Glow Getter side-hustle kid! With a parent nearby, you’ll unlock fun training, safe hustle ideas, and challenges that teach kindness, saving, and growing your little business.",
  valuesTitle: "What every Kids Corner teammate learns",
  values: [
    {
      title: "Giving back",
      detail:
        "Practice kindness in your neighborhood — share a skill, help a friend, or donate a craft to a community cause.",
    },
    {
      title: "Savings goals",
      detail:
        "Use Piggy Bank challenges to name a goal, count your earnings, and celebrate small wins.",
    },
    {
      title: "Investing back in your hustle",
      detail:
        "When you earn a little, put some back — new stickers, better supplies, or time to make your next craft even cooler.",
    },
  ],
  perks: [
    {
      title: "Training videos just for kids",
      detail: "Short, parent-friendly lessons on safe hustles and Glow Getter confidence.",
    },
    {
      title: "How to make games with AI",
      detail: "Step-by-step guides to invent tiny games with a parent — stories, characters, and levels.",
    },
    {
      title: "Craft hustle playbooks",
      detail: "Stickers, keychains, and fair-ready projects with pricing tips for families.",
    },
    {
      title: "Piggy Bank challenges",
      detail: "Goal-setting missions that make saving feel like a game.",
    },
    {
      title: "Kevina Glow Getter extras",
      detail: "Bonus story activities and kindness quests inspired by Kevina Starr.",
    },
    {
      title: "Member-only full guides",
      detail: "Preview free tips anytime — unlock the rest when you join the team.",
    },
  ],
  ctaLabel: "Join Kids Corner GYSH Team",
  parentNote:
    "Parents: this is a lightweight team join for Kids Corner content. You can also create a full GYSH account on the Join page for the adult portal.",
};

export const JUNIOR_TEAM_JOIN: TeamJoinCopy = {
  audience: "junior",
  ages: "Ages 13–17",
  teamName: "GYSH Teens Side Hustle Team",
  headline: "Join the GYSH Teens Side Hustle Team",
  lead:
    "Future CEO energy, parent-approved. Join the Teens Side Hustle Team for training, workshops, and guides that help you earn safely — while learning to give back, save, and reinvest like a real founder.",
  valuesTitle: "What every Teen teammate practices",
  values: [
    {
      title: "Giving back",
      detail:
        "Use your skills for community good — teach a classmate, volunteer a free session, or share a free resource.",
    },
    {
      title: "Savings goals",
      detail:
        "Set clear targets in the Piggy Bank, track jobs completed, and build money habits that stick.",
    },
    {
      title: "Investing back into the business",
      detail:
        "Reinvest a portion of earnings into tools, marketing, or learning — age-appropriate CEO habits that grow the hustle.",
    },
  ],
  perks: [
    {
      title: "Teens training videos",
      detail: "Skill clips on safe earning, pricing, and customer care.",
    },
    {
      title: "Game-making with AI",
      detail: "Guides for concepts, sprites, dialogue, and simple prototypes (with guardian OK).",
    },
    {
      title: "Content creation starters",
      detail: "Parent-friendly paths for school projects, portfolios, and wholesome creator practice.",
    },
    {
      title: "CEO team tips",
      detail: "Checklists for planning, saving, and reinvesting like a young founder.",
    },
    {
      title: "Workshop invites & replays",
      detail: "Access notes from family Glow labs and teen build nights when available.",
    },
    {
      title: "Full member guides",
      detail: "Free teasers for everyone — complete playbooks unlock for Teens Team members.",
    },
  ],
  ctaLabel: "Join Teens",
  parentNote:
    "Parents/guardians: team join unlocks Teens guides in Kids Corner. A full GYSH member login also counts as membership across the site.",
};

export function getTeamJoinCopy(audience: KidsAudience): TeamJoinCopy {
  return audience === "kids" ? KIDS_TEAM_JOIN : JUNIOR_TEAM_JOIN;
}

export function readTeamMembership(audience: KidsAudience): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS[audience]) === "1";
  } catch {
    return false;
  }
}

export function writeTeamMembership(audience: KidsAudience, joined: boolean): void {
  try {
    if (joined) localStorage.setItem(STORAGE_KEYS[audience], "1");
    else localStorage.removeItem(STORAGE_KEYS[audience]);
  } catch {
    /* private mode — ignore */
  }
}

/**
 * Unlock Kids/Teens member guides when:
 * - Caller passes member access (real member / Profile Switcher kids|teens — not staff-as-self), or
 * - Lightweight team join is stored for this audience.
 */
export function isKidsCornerMember(audience: KidsAudience, isLoggedIn: boolean): boolean {
  return isLoggedIn || readTeamMembership(audience);
}
