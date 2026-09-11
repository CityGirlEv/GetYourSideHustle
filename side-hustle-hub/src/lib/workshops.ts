/** GYSH Workshops & Guest Speakers — defaults + D1 API. */

import { api } from "./api";

export type WorkshopAudience = "adult" | "kids" | "family" | "all";
export type WorkshopStatus = "upcoming" | "past" | "waitlist";

export type GuestSpeaker = {
  id: string;
  name: string;
  title: string;
  bio: string;
  topics: string[];
  accent: string;
  initials: string;
};

export type Workshop = {
  id: string;
  title: string;
  blurb: string;
  date: string;
  time: string;
  format: "Live Zoom" | "In-Person" | "Hybrid" | "Replay";
  audience: WorkshopAudience;
  status: WorkshopStatus;
  registrationOpen: boolean;
  capacity: number;
  registrationNote: string;
  speakerIds: string[];
  tags: string[];
};

export type WorkshopRegistrationInput = {
  workshopId: string;
  name: string;
  email: string;
  phone?: string;
  attendeeCount: number;
  notes?: string;
};

export const WORKSHOP_FORMATS: Workshop["format"][] = ["Live Zoom", "In-Person", "Hybrid", "Replay"];

export const DEFAULT_SPEAKERS: GuestSpeaker[] = [
  {
    id: "tina",
    name: "Tina Marie Barham",
    title: "GYSH Co-Founder · Kids Glow & Motivation",
    bio: "IT educator and storyteller behind Kevina Starr Stories. Tina leads family-friendly workshops on confidence, kindness, and teen earning skills.",
    topics: ["Kids Glow", "Storytelling", "Teen Hustles", "Parent Coaching"],
    accent: "#9B2F28",
    initials: "TB",
  },
  {
    id: "evelyn",
    name: "Evelyn Irving",
    title: "GYSH Co-Founder · Tech & Adult Side Hustles",
    bio: "Builds GYSH assets, AI agents, and launch systems. Evelyn hosts workshops on Airbnb ops, Meta+Shopify, apps, and automation pipelines.",
    topics: ["Airbnb STR", "AI Agents", "Shopify", "App Building"],
    accent: "#947D64",
    initials: "EI",
  },
  {
    id: "kevina-voice",
    name: "Kevina Starr (Featured Series)",
    title: "Glow Getter Story Sessions",
    bio: "Bedtime adventures from the Library of Light — paired with parent-led activity prompts after each GYSH kids workshop.",
    topics: ["Confidence", "Kindness", "Creativity"],
    accent: "#9B2F28",
    initials: "KS",
  },
  {
    id: "guest-str",
    name: "Marcus Hale",
    title: "STR Operations Consultant",
    bio: "Guest speaker on furnishing budgets, dynamic pricing, and guest messaging systems for short-term rental side hustles.",
    topics: ["Airbnb", "Pricing", "Ops"],
    accent: "#5c4033",
    initials: "MH",
  },
  {
    id: "guest-ecom",
    name: "Priya Nandakumar",
    title: "E-Commerce Creative Director",
    bio: "Runs Meta ad creative tests for Shopify brands. Guest sessions on hook writing, UGC briefs, and kill/hold/scale decisions.",
    topics: ["Meta Ads", "Creative Testing", "POD"],
    accent: "#6b4f3a",
    initials: "PN",
  },
  {
    id: "lyriq",
    name: "Lyriq Gaulden",
    title: "Side Hustle Guest Speaker · Kids & Youth",
    bio: "Guest speaker for Kids and Youth sessions — confidence, safe first hustles, and encouragement for young Glow Getters and teen earners (with parents nearby).",
    topics: ["Kids & Youth", "Confidence", "Safe First Hustles", "Teen Motivation"],
    accent: "#2E7D5A",
    initials: "LG",
  },
];

/** Seed / fallback workshops — all dates/times TBD until admins confirm the schedule. */
export const DEFAULT_WORKSHOPS: Workshop[] = [
  {
    id: "ai-scene-production-packs",
    title: "Creating AI Videos using Scene Production Packs",
    blurb:
      "Learn how to plan scenes, assemble Scene Production Packs, and produce AI videos you can use for hustles, ads, and client work.",
    date: "TBD",
    time: "TBD",
    format: "Live Zoom",
    audience: "adult",
    status: "upcoming",
    registrationOpen: true,
    capacity: 25,
    registrationNote:
      "Pre-registration is open — date and time are TBD. We'll email you when the schedule is confirmed.",
    speakerIds: ["evelyn"],
    tags: ["AI Video", "Scene Production Packs", "Content"],
  },
  {
    id: "glow-getter-launch",
    title: "Glow Getter Launch Lab",
    blurb: "Story time + parent playbook: turn Kevina Starr episodes into weekly confidence and teen hustle routines.",
    date: "TBD",
    time: "TBD",
    format: "Live Zoom",
    audience: "family",
    status: "upcoming",
    registrationOpen: false,
    capacity: 25,
    registrationNote: "Registration is not open yet. Check back after the schedule is confirmed.",
    speakerIds: ["tina", "kevina-voice", "lyriq"],
    tags: ["Kids", "Kevina Starr", "Parents", "Youth"],
  },
  {
    id: "airbnb-arbitrage-101",
    title: "Airbnb Arbitrage 101",
    blurb: "Lease math, furnishing on a budget, and listing optimization — without buying property first.",
    date: "TBD",
    time: "TBD",
    format: "Hybrid",
    audience: "adult",
    status: "upcoming",
    registrationOpen: false,
    capacity: 25,
    registrationNote: "Registration is closed. Check back after the schedule is confirmed.",
    speakerIds: ["evelyn", "guest-str"],
    tags: ["Airbnb", "Real Estate"],
  },
  {
    id: "agents-with-soul",
    title: "Building AI Agents with Soul",
    blurb: "Identity, memory, and plain-English orchestration — the Muntie Ev way, adapted for side hustle operators.",
    date: "TBD",
    time: "TBD",
    format: "Live Zoom",
    audience: "adult",
    status: "upcoming",
    registrationOpen: false,
    capacity: 25,
    registrationNote: "Registration is not open yet. Check back after the schedule is confirmed.",
    speakerIds: ["evelyn"],
    tags: ["AI Agents", "Automation"],
  },
  {
    id: "meta-shopify-clinic",
    title: "Meta + Shopify Creative Clinic",
    blurb: "Live ad teardowns: what to kill, hold, or scale against real store P&L.",
    date: "TBD",
    time: "TBD",
    format: "Live Zoom",
    audience: "adult",
    status: "upcoming",
    registrationOpen: false,
    capacity: 25,
    registrationNote: "Registration is not open yet. Check back after the schedule is confirmed.",
    speakerIds: ["evelyn", "guest-ecom"],
    tags: ["Meta Ads", "Shopify", "POD"],
  },
  {
    id: "junior-earnings-fair",
    title: "Teen Earnings Fair (Kids & Teens Session)",
    blurb: "Safe micro-jobs, piggy bank goals, and parent safety checklists — after story time.",
    date: "TBD",
    time: "TBD",
    format: "Live Zoom",
    audience: "kids",
    status: "upcoming",
    registrationOpen: false,
    capacity: 25,
    registrationNote: "Registration is not open yet. Check back after the schedule is confirmed.",
    speakerIds: ["tina", "lyriq"],
    tags: ["Teen Hustles", "Safety", "Youth"],
  },
  {
    id: "pod-etsy-sprint",
    title: "POD → Etsy Listing Sprint",
    blurb: "Niche research, design briefs, and evergreen SEO tags in one focused working session.",
    date: "TBD",
    time: "TBD",
    format: "Live Zoom",
    audience: "adult",
    status: "upcoming",
    registrationOpen: false,
    capacity: 25,
    registrationNote: "Registration is not open yet. Check back after the schedule is confirmed.",
    speakerIds: ["evelyn", "guest-ecom"],
    tags: ["POD", "Etsy"],
  },
];

/** True when the workshop is accepting pre-registration before a date is set. */
export function workshopIsPreRegistration(w: Workshop): boolean {
  return w.registrationOpen && /pre-?registration/i.test(w.registrationNote || "");
}

/**
 * Merge DB workshops with defaults: keep unknown DB rows, refresh known seeds,
 * and force every date/time to TBD until admins set a real schedule.
 */
export function mergeWorkshops(fromDb: Workshop[] | undefined | null): Workshop[] {
  const defaultsById = new Map(DEFAULT_WORKSHOPS.map((w) => [w.id, w]));
  const fromDbList = fromDb?.length ? fromDb : [];
  const byId = new Map<string, Workshop>();

  for (const d of DEFAULT_WORKSHOPS) {
    byId.set(d.id, { ...d });
  }
  for (const row of fromDbList) {
    const seed = defaultsById.get(row.id);
    if (seed) {
      byId.set(row.id, {
        ...seed,
        ...row,
        // Seed schedule + registration policy wins until an admin sets a real date.
        date: "TBD",
        time: "TBD",
        registrationOpen: seed.registrationOpen,
        registrationNote: seed.registrationNote,
        status: seed.status,
        title: seed.title,
        blurb: seed.blurb,
      });
    } else {
      byId.set(row.id, {
        ...row,
        date: "TBD",
        time: "TBD",
      });
    }
  }

  const ordered: Workshop[] = [];
  for (const d of DEFAULT_WORKSHOPS) {
    const w = byId.get(d.id);
    if (w) ordered.push(w);
  }
  for (const row of fromDbList) {
    if (!defaultsById.has(row.id)) {
      const w = byId.get(row.id);
      if (w) ordered.push(w);
    }
  }
  return ordered;
}

/** @deprecated Prefer DEFAULT_WORKSHOPS / fetchWorkshops — kept for tests & seed. */
export const GUEST_SPEAKERS = DEFAULT_SPEAKERS;
/** @deprecated Prefer DEFAULT_WORKSHOPS / fetchWorkshops */
export const WORKSHOPS = DEFAULT_WORKSHOPS;

export const AUDIENCE_LABELS: Record<WorkshopAudience, string> = {
  adult: "Adult",
  kids: "Kids",
  family: "Family",
  all: "All Ages",
};

export const STATUS_LABELS: Record<WorkshopStatus, string> = {
  upcoming: "Upcoming",
  past: "Replay Available",
  waitlist: "Waitlist Open",
};

export function countWorkshopsByStatus(
  status: WorkshopStatus,
  list: Workshop[] = DEFAULT_WORKSHOPS,
): number {
  return list.filter((w) => w.status === status).length;
}

export function getSpeakerById(
  id: string,
  speakers: GuestSpeaker[] = DEFAULT_SPEAKERS,
): GuestSpeaker | undefined {
  return speakers.find((s) => s.id === id);
}

export function filterWorkshops(
  status: "all" | WorkshopStatus,
  audience: "all" | WorkshopAudience,
  list: Workshop[] = DEFAULT_WORKSHOPS,
): Workshop[] {
  return list.filter((w) => {
    if (status !== "all" && w.status !== status) return false;
    if (audience !== "all" && w.audience !== audience && w.audience !== "all") return false;
    return true;
  });
}

/** Merge DB speakers with defaults so newly seeded guests (e.g. Lyriq) still appear. */
export function mergeGuestSpeakers(fromDb: GuestSpeaker[] | undefined | null): GuestSpeaker[] {
  if (!fromDb?.length) return [...DEFAULT_SPEAKERS];
  const byId = new Map(fromDb.map((s) => [s.id, s]));
  for (const d of DEFAULT_SPEAKERS) {
    if (!byId.has(d.id)) byId.set(d.id, d);
  }
  const ordered: GuestSpeaker[] = [];
  for (const d of DEFAULT_SPEAKERS) {
    const s = byId.get(d.id);
    if (s) ordered.push(s);
  }
  for (const s of fromDb) {
    if (!DEFAULT_SPEAKERS.some((d) => d.id === s.id)) ordered.push(s);
  }
  return ordered;
}

export async function fetchWorkshops(): Promise<{ workshops: Workshop[]; speakers: GuestSpeaker[] }> {
  try {
    const data = await api<{ workshops: Workshop[]; speakers: GuestSpeaker[] }>("workshops", {
      auth: false,
    });
    const workshops = mergeWorkshops(data.workshops);
    const speakers = mergeGuestSpeakers(data.speakers);
    return { workshops, speakers };
  } catch {
    return { workshops: mergeWorkshops(null), speakers: DEFAULT_SPEAKERS };
  }
}

export async function persistWorkshops(
  workshops: Workshop[],
  speakers: GuestSpeaker[],
): Promise<{ workshops: Workshop[]; speakers: GuestSpeaker[] }> {
  const data = await api<{ workshops: Workshop[]; speakers: GuestSpeaker[] }>("workshops", {
    method: "PUT",
    body: { workshops, speakers },
  });
  return {
    workshops: data.workshops ?? workshops,
    speakers: data.speakers ?? speakers,
  };
}

export async function submitWorkshopRegistration(
  input: WorkshopRegistrationInput,
): Promise<{ ok: boolean; message: string }> {
  return api("workshop-registrations", {
    method: "POST",
    auth: false,
    body: input,
  });
}
