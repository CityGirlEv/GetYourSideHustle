/**
 * Suggested charge prices for service / product hustles (examples only — not guarantees).
 */

export type GuidePricingItem = {
  id: string;
  label: string;
  /** What to charge the customer */
  price: string;
  notes?: string;
};

export type GuideSuggestedPricing = {
  items: GuidePricingItem[];
  /** How to raise rates later */
  raiseTip?: string;
};

function p(id: string, label: string, price: string, notes?: string): GuidePricingItem {
  return { id, label, price, notes };
}

const RAISE =
  "After 3–5 happy customers, raise 10–20% or add a rush fee. Examples only — not income guarantees.";

/** Suggested customer prices by guide / hustle id. */
export const GUIDE_SUGGESTED_PRICING: Record<string, GuideSuggestedPricing> = {
  "car-interior-cleanup": {
    raiseTip: RAISE,
    items: [
      p("compact", "Compact / sedan interior", "$35–50 per car"),
      p("suv", "SUV / crossover", "$50–70 per car"),
      p("minivan", "Minivan / 3-row", "$65–85 per car"),
      p("fleet", "3+ cars same driveway", "10% off the combined total"),
      p("pets", "Heavy pet hair add-on", "+$10–15"),
    ],
  },
  "errand-runner": {
    raiseTip: RAISE,
    items: [
      p("base", "Base run (1 stop)", "$10–15"),
      p("extra", "Each extra stop", "+$5"),
      p("percent", "Or % of purchase (optional)", "10–15% of receipt (agree cap first)"),
      p("weekly", "Standing weekly senior slot", "$40–60 / month"),
    ],
  },
  "dog-walk": {
    raiseTip: RAISE,
    items: [
      p("short", "20-minute walk (1 dog)", "$12–18"),
      p("long", "30–40 minute walk", "$18–25"),
      p("second", "Second dog same walk", "+$5–8"),
      p("week", "3× / week package", "Price 3 walks − $5"),
    ],
  },
  "yard-help": {
    raiseTip: RAISE,
    items: [
      p("hour", "Youth helper hourly", "$15–25 / hr"),
      p("small", "Small yard flat (mow + tidy)", "$30–50"),
      p("medium", "Medium yard", "$50–80"),
      p("weed", "Weed beds only (1 hr)", "$20–35"),
    ],
  },
  "pet-sitting": {
    raiseTip: RAISE,
    items: [
      p("visit", "Daily drop-in visit", "$20–35 / day"),
      p("overnight", "Overnight (adult only)", "$40–75 / night"),
      p("extra-pet", "Extra pet", "+$5–10 / day"),
    ],
  },
  "plant-watering": {
    raiseTip: RAISE,
    items: [
      p("visit", "Per watering visit", "$10–15"),
      p("week", "Daily visits for 1 week", "$60–90"),
      p("bundle", "Bundle with mail pickup", "+$5–10 / trip"),
    ],
  },
  handyman: {
    raiseTip: RAISE,
    items: [
      p("hour", "Hourly (experienced)", "$40–75 / hr"),
      p("ikea", "IKEA dresser assembly", "$60–90"),
      p("tv", "TV mount (with stud finder)", "$75–125"),
      p("min", "Minimum call-out", "$40–50"),
    ],
  },
  "handyman-light": {
    raiseTip: RAISE,
    items: [
      p("assemble", "Furniture assembly (simple)", "$40–70"),
      p("hang", "Picture / shelf hang", "$25–45"),
      p("declutter", "2-hour declutter assist", "$50–80"),
      p("hour", "Hourly youth rate", "$20–35 / hr"),
    ],
  },
  "tech-helper": {
    raiseTip: RAISE,
    items: [
      p("visit", "In-home session (45–60 min)", "$25–45"),
      p("wifi", "Wi‑Fi / printer setup", "$30–50"),
      p("phone", "New phone transfer help", "$25–40"),
    ],
  },
  homework: {
    raiseTip: RAISE,
    items: [
      p("session", "Homework help session (45 min)", "$15–25"),
      p("pack", "4-session pack", "$55–90"),
    ],
  },
  tutoring: {
    raiseTip: RAISE,
    items: [
      p("elem", "Elementary subjects", "$25–35 / hr"),
      p("ms", "Middle school", "$30–40 / hr"),
      p("hs", "High school / test prep", "$40–55 / hr"),
      p("pack", "4-pack prepaid", "5–10% off"),
    ],
  },
  proofreader: {
    raiseTip: RAISE,
    items: [
      p("flyer", "1-page flyer / menu", "$15–25"),
      p("essay", "School essay (≤1,000 words)", "$20–35"),
      p("word", "Per-word rate (longer docs)", "$0.02–0.04 / word"),
      p("retainer", "Monthly small-biz retainer", "$40–80 / mo"),
    ],
  },
  "gift-wrapping": {
    raiseTip: RAISE,
    items: [
      p("single", "Simple gift wrap", "$3–6 / gift"),
      p("fancy", "Bow + layered wrap", "$6–10 / gift"),
      p("bundle", "10-gift holiday bundle", "$45–70"),
    ],
  },
  "lemonade-stand": {
    raiseTip: RAISE,
    items: [
      p("cup", "Per cup", "$1–2"),
      p("cookie", "Cookie add-on (if offered)", "$1–2"),
    ],
  },
  "trash-can-service": {
    raiseTip: RAISE,
    items: [
      p("month", "Roll-out + return / month", "$20–40 / home"),
      p("both", "Trash + recycling bundle", "$30–50 / mo"),
      p("storm", "Storm / holiday reschedule", "Included or +$5"),
    ],
  },
  "neighborhood-helper": {
    raiseTip: RAISE,
    items: [
      p("carry", "Grocery carry-in", "$10–15"),
      p("porch", "Porch tidy", "$15–20"),
      p("bundle", "Multi-task bundle", "$20–35"),
    ],
  },
  "leaf-raking": {
    raiseTip: RAISE,
    items: [
      p("drive", "Driveway / walks blowing", "$20–35"),
      p("front", "Front lawn blowing + bag", "$40–60"),
      p("full", "Full-lot blowing + curb bags", "$70–110"),
    ],
  },
  "beach-shell-jewelry": {
    raiseTip: RAISE,
    items: [
      p("earring", "Shell earring pair", "$8–15"),
      p("necklace", "Shell pendant necklace", "$12–22"),
      p("bracelet", "Shell bracelet", "$10–18"),
      p("set", "Necklace + earring set", "$22–35"),
      p("custom", "Custom beach-memory piece", "$18–30"),
    ],
  },
  "garage-sale-helper": {
    raiseTip: RAISE,
    items: [
      p("flat", "Half-day setup + staffing", "$40–60"),
      p("day", "Full day", "$80–120"),
      p("cut", "Or commission", "10% of sales (agree first)"),
    ],
  },
  "holiday-decorating-helper": {
    raiseTip: RAISE,
    items: [
      p("porch", "Front porch only", "$100–175"),
      p("house", "Whole-house with adult ladder team", "$250–400"),
      p("takedown", "January takedown", "50% of install"),
    ],
  },
  "recycling-helper": {
    raiseTip: RAISE,
    items: [
      p("month", "Recycling sort + roll / month", "$20–35"),
      p("bundle", "With trash-can service", "$35–50 / mo combined"),
    ],
  },
  "vacation-mail-plant-helper": {
    raiseTip: RAISE,
    items: [
      p("visit", "Daily plant visit", "$15–25"),
      p("week", "Flat week package (plants only)", "$90–140"),
    ],
  },
  "toy-organizer": {
    raiseTip: RAISE,
    items: [
      p("room", "One playroom / closet session", "$40–75"),
      p("hour", "Hourly", "$20–35 / hr"),
    ],
  },
  "friendship-bracelet-maker": {
    raiseTip: RAISE,
    items: [
      p("simple", "Simple bracelet", "$5–8"),
      p("custom", "Custom name / beads", "$10–15"),
      p("party", "Party pack of 10", "$60–80"),
    ],
  },
  crafts: {
    raiseTip: RAISE,
    items: [
      p("small", "Small craft piece", "$5–12"),
      p("set", "Set of 3", "$15–30"),
      p("custom", "Custom order", "2–3× materials + time"),
    ],
  },
  "basic-invitation-creator": {
    raiseTip: RAISE,
    items: [
      p("digital", "Digital invite (PDF + PNG)", "$10–25"),
      p("print", "Design + print handling", "+$5–15"),
      p("rush", "Same-day rush", "+$5–10"),
    ],
  },
  "canva-flyer-creator": {
    raiseTip: RAISE,
    items: [
      p("design", "Flyer design only", "$15–40"),
      p("print", "Design + print run help", "+$5–20"),
    ],
  },
  "greeting-card-creator": {
    raiseTip: RAISE,
    items: [
      p("hand", "Handmade card", "$3–8"),
      p("canva", "Custom Canva card set", "$5–15"),
    ],
  },
  "digital-cookbook-creator": {
    raiseTip: RAISE,
    items: [
      p("small", "10–20 recipe digital book", "$50–100"),
      p("large", "40+ recipes + cover", "$100–175"),
    ],
  },
  "family-photo-slideshow": {
    raiseTip: RAISE,
    items: [
      p("short", "2–3 minute slideshow", "$40–75"),
      p("long", "5+ minute with music", "$75–125"),
    ],
  },
};

export function suggestedPricingForGuide(guideId: string): GuideSuggestedPricing | undefined {
  return GUIDE_SUGGESTED_PRICING[guideId];
}

export function formatPricingLine(item: GuidePricingItem): string {
  const notes = item.notes ? ` — ${item.notes}` : "";
  return `${item.label}: ${item.price}${notes}`;
}

export function pricingDisclaimer(): string {
  return "Suggested prices are examples only — not income guarantees. Adjust for your city, experience, and materials cost. Confirm what the customer agrees to in writing (text is fine) before you start.";
}
