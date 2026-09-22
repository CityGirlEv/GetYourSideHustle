/** GYSH Workshops & Guest Speakers — defaults + D1 API. */

import { api } from "./api";
import { siteUrl } from "./site-config";
import { AI_SCENE_PACKS_WORKSHOP_ID } from "./workshop-playbooks";

export { AI_SCENE_PACKS_WORKSHOP_ID } from "./workshop-playbooks";

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
    title: "90-Minute AI Marketing Video Hands-On Workshop",
    blurb:
      "90-minute hands-on AI marketing video lab with ChatGPT, Hedra, and CapCut. Turn one idea into a 3-scene marketing video you can reuse as a Scene Production Pack.",
    date: "TBD",
    time: "TBD",
    format: "Live Zoom",
    audience: "adult",
    status: "upcoming",
    registrationOpen: true,
    capacity: 10,
    registrationNote:
      "Pre-registration is open — date and time are TBD. We'll email you when the schedule is confirmed. This class is limited to 10 participants max.",
    speakerIds: ["tina", "evelyn"],
    tags: ["AI Video"],
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
    speakerIds: ["evelyn"],
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
export function workshopIsPreRegistration(
  w: Pick<Workshop, "registrationOpen" | "registrationNote">,
): boolean {
  return w.registrationOpen && /pre-?registration/i.test(w.registrationNote || "");
}

/** True when an admin has saved a real class date (not TBD / empty). */
export function workshopFieldIsSet(raw?: string | null): boolean {
  const v = String(raw || "").trim();
  return Boolean(v) && !/\btbd\b/i.test(v);
}

/** Complete workshop guide PDF: admins always; everyone else after the date is set. */
export function workshopCompleteGuideUnlocked(input: {
  isAdmin?: boolean;
  date?: string | null;
}): boolean {
  if (input.isAdmin) return true;
  return workshopFieldIsSet(input.date);
}

/** True when the schedule first leaves TBD — the moment to email the guide. */
export function workshopDateJustLocked(
  previousDate?: string | null,
  nextDate?: string | null,
): boolean {
  return !workshopFieldIsSet(previousDate) && workshopFieldIsSet(nextDate);
}

/** Public schedule line for cards, registration, and confirmation email. */
export function workshopScheduleLabel(w: Pick<Workshop, "date" | "time">): string {
  const date = (w.date || "TBD").trim() || "TBD";
  const time = (w.time || "TBD").trim() || "TBD";
  if (/^tbd$/i.test(date) && /^tbd$/i.test(time)) return "Date & time TBD";
  if (/^tbd$/i.test(time)) return date;
  if (/^tbd$/i.test(date)) return time;
  return `${date} · ${time}`;
}

export const WORKSHOP_DUPLICATE_EMAIL_MESSAGE =
  "This email is already registered for this workshop. One registration per email.";

/** Same workshop + same email (case-insensitive) counts as already registered. */
export function workshopRegistrationEmailTaken(
  existingEmails: Array<string | null | undefined>,
  email: string,
): boolean {
  const needle = String(email || "").trim().toLowerCase();
  if (!needle) return false;
  return existingEmails.some((e) => String(e || "").trim().toLowerCase() === needle);
}

/** Catalog vars for the attendee workshop confirmation email. */
export function workshopRegistrationConfirmVars(input: {
  name: string;
  workshopId: string;
  title: string;
  date?: string;
  time?: string;
  format?: string;
  registrationNote?: string;
  registrationOpen?: boolean;
}): Record<string, string> {
  const isPre = workshopIsPreRegistration({
    registrationOpen: input.registrationOpen !== false,
    registrationNote: input.registrationNote || "",
  });
  return {
    name: String(input.name || "Side Hustler").trim() || "Side Hustler",
    workshopTitle: input.title,
    workshopWhen: workshopScheduleLabel({
      date: input.date || "TBD",
      time: input.time || "TBD",
    }),
    workshopFormat: input.format || "Live Zoom",
    workshopKind: isPre ? "pre-registration" : "registration",
    workshopNextLine: isPre
      ? "We'll email you again when the date and time are locked. One seat is held for this email."
      : "Save this confirmation for class. One seat is held for this email.",
    ctaUrl: workshopCardUrl(input.workshopId),
  };
}

/** Shareable slug → catalog id (keeps the D1/playbook id stable). */
const WORKSHOP_SLUG_ALIASES: Record<string, string> = {
  "ai-marketing-video": AI_SCENE_PACKS_WORKSHOP_ID,
  "ai-scene-production-packs": AI_SCENE_PACKS_WORKSHOP_ID,
};

export function resolveWorkshopId(raw: string): string {
  const id = String(raw || "").trim();
  if (!id) return "";
  return WORKSHOP_SLUG_ALIASES[id.toLowerCase()] || id;
}

/** Public query value used in share links. */
export function workshopPublicSlug(workshopId: string): string {
  const id = resolveWorkshopId(workshopId);
  if (id === AI_SCENE_PACKS_WORKSHOP_ID) return "ai-marketing-video";
  return id;
}

/** Path + query that opens a workshop’s registration / pre-register form. */
export function workshopRegistrationPath(workshopId: string): string {
  const slug = workshopPublicSlug(workshopId);
  if (!slug) return "/workshops";
  return `/workshops?register=${encodeURIComponent(slug)}`;
}

export function parseWorkshopRegisterParam(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): string | null {
  const raw = String(search || "");
  const qs = raw.startsWith("?") ? raw.slice(1) : raw;
  const id = resolveWorkshopId(new URLSearchParams(qs).get("register")?.trim() || "");
  return id || null;
}

/** DOM id used to scroll/highlight a workshop card from a share link. */
export function workshopCardAnchorId(workshopId: string): string {
  const id = resolveWorkshopId(workshopId);
  return id ? `workshop-card-${id}` : "";
}

/** Path + query that lands on Workshops and highlights a card for pre-register. */
export function workshopCardPath(workshopId: string): string {
  const slug = workshopPublicSlug(workshopId);
  if (!slug) return "/workshops";
  return `/workshops?workshop=${encodeURIComponent(slug)}`;
}

export function parseWorkshopCardParam(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): string | null {
  const raw = String(search || "");
  const qs = raw.startsWith("?") ? raw.slice(1) : raw;
  const id = resolveWorkshopId(new URLSearchParams(qs).get("workshop")?.trim() || "");
  return id || null;
}

/** Absolute shareable URL that highlights a workshop card. */
export function workshopCardUrl(workshopId: string, origin?: string): string {
  const base = (origin ?? siteUrl()).replace(/\/$/, "");
  return `${base}${workshopCardPath(workshopId)}`;
}

export function workshopCapacityLabel(w: Pick<Workshop, "capacity">): string | null {
  const n = Math.max(0, Number(w.capacity) || 0);
  if (!n) return null;
  return `${n} participants max`;
}

/** Absolute shareable registration URL. */
export function workshopRegistrationUrl(
  workshopId: string,
  origin?: string,
): string {
  const base = (origin ?? siteUrl()).replace(/\/$/, "");
  return `${base}${workshopRegistrationPath(workshopId)}`;
}

export function findWorkshopById(
  workshopId: string,
  list: Workshop[] = DEFAULT_WORKSHOPS,
): Workshop | undefined {
  const id = resolveWorkshopId(workshopId);
  if (!id) return undefined;
  return list.find((w) => w.id === id);
}

/** Canonical id + catalog seed for registration writes (D1 may not have the row yet). */
export function workshopForRegistrationLookup(rawId: string): {
  id: string;
  seed: Workshop | undefined;
} {
  const id = resolveWorkshopId(rawId);
  if (!id) return { id: "", seed: undefined };
  return { id, seed: findWorkshopById(id) };
}

/** Seed catalog wins so Pre-Register stays open even if D1 still has registration_open = 0. */
export function workshopRowIsRegistrationOpen(
  seed: Pick<Workshop, "registrationOpen"> | undefined,
  dbOpen: boolean,
): boolean {
  return seed ? seed.registrationOpen === true : dbOpen;
}

const HIDDEN_SPEAKER_IDS = new Set(["guest-str"]);

function visibleSpeakerIds(ids: string[] | undefined): string[] {
  return (ids || []).filter((id) => !HIDDEN_SPEAKER_IDS.has(id));
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
        // Keep an admin-set date/time; otherwise stay TBD until the schedule is confirmed.
        date: workshopFieldIsSet(row.date) ? row.date : "TBD",
        time: workshopFieldIsSet(row.time) ? row.time : "TBD",
        registrationOpen: seed.registrationOpen,
        registrationNote: seed.registrationNote,
        status: seed.status,
        title: seed.title,
        blurb: seed.blurb,
        capacity: seed.id === AI_SCENE_PACKS_WORKSHOP_ID ? seed.capacity : row.capacity ?? seed.capacity,
        tags: seed.id === AI_SCENE_PACKS_WORKSHOP_ID ? seed.tags : row.tags?.length ? row.tags : seed.tags,
        speakerIds: visibleSpeakerIds(
          seed.id === AI_SCENE_PACKS_WORKSHOP_ID ? seed.speakerIds : row.speakerIds?.length ? row.speakerIds : seed.speakerIds,
        ),
      });
    } else {
      byId.set(row.id, {
        ...row,
        date: workshopFieldIsSet(row.date) ? row.date : "TBD",
        time: workshopFieldIsSet(row.time) ? row.time : "TBD",
        speakerIds: visibleSpeakerIds(row.speakerIds),
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
  const byId = new Map(fromDb.filter((s) => !HIDDEN_SPEAKER_IDS.has(s.id)).map((s) => [s.id, s]));
  for (const d of DEFAULT_SPEAKERS) {
    if (!byId.has(d.id)) byId.set(d.id, d);
  }
  const ordered: GuestSpeaker[] = [];
  for (const d of DEFAULT_SPEAKERS) {
    const s = byId.get(d.id);
    if (s) ordered.push(s);
  }
  for (const s of fromDb) {
    if (HIDDEN_SPEAKER_IDS.has(s.id)) continue;
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
    body: input,
  });
}
